import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Principal } from "@icp-sdk/core/principal";
import { AlertTriangle, Loader2, Shield, Trash2, Users } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import FilePermissionsSection from "../components/FilePermissionsSection";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAssignConfidentialRole,
  useDemoteToUser,
  useMakeAdmin,
} from "../hooks/useQueries";
import type { Opportunity, UserProfileDTO } from "../hooks/useQueries";

interface UserWithRole {
  principal: Principal;
  name: string;
  role: string;
}

function RoleBadge({ role }: { role: string }) {
  if (role === "admin") {
    return (
      <Badge className="bg-primary/20 text-primary border border-primary/30 text-xs">
        admin
      </Badge>
    );
  }
  if (role === "confidential") {
    return (
      <Badge className="bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs">
        confidential
      </Badge>
    );
  }
  if (role === "user") {
    return (
      <Badge
        variant="outline"
        className="text-muted-foreground border-muted text-xs"
      >
        user
      </Badge>
    );
  }
  return (
    <Badge
      variant="outline"
      className="text-muted-foreground/60 border-muted/50 text-xs"
    >
      {role || "guest"}
    </Badge>
  );
}

export default function AdminPage() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [userProfiles, setUserProfiles] = useState<UserProfileDTO[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [maxUsers, setMaxUsers] = useState<number>(3);
  const [newLimit, setNewLimit] = useState<string>("3");
  const [loading, setLoading] = useState(true);
  const [savingLimit, setSavingLimit] = useState(false);
  const [removingUser, setRemovingUser] = useState<string | null>(null);
  const [roleActionUser, setRoleActionUser] = useState<string | null>(null);

  const adminActor = actor as any;
  const callerPrincipal = identity?.getPrincipal().toString();

  const makeAdminMutation = useMakeAdmin();
  const assignConfidentialMutation = useAssignConfidentialRole();
  const demoteToUserMutation = useDemoteToUser();

  const loadData = useCallback(async () => {
    if (!adminActor) return;
    setLoading(true);
    try {
      // Always restore caller role from stable storage before checking admin status
      try {
        await adminActor.restoreCallerRole();
      } catch {
        /* ignore */
      }
      const [adminStatus, userList, currentMax, profiles, opps] =
        await Promise.all([
          adminActor.isCallerAdmin() as Promise<boolean>,
          (adminActor.listAllUsersWithRoles
            ? adminActor.listAllUsersWithRoles()
            : adminActor.listAllUserProfiles()) as Promise<UserWithRole[]>,
          (adminActor.getMaxUsers
            ? adminActor.getMaxUsers()
            : Promise.resolve(BigInt(3))) as Promise<bigint>,
          adminActor.listAllUserProfiles() as Promise<UserProfileDTO[]>,
          adminActor.listOpportunities() as Promise<Opportunity[]>,
        ]);
      setIsAdmin(adminStatus);
      setUsers(userList);
      setUserProfiles(profiles);
      setOpportunities(opps);
      const maxNum = Number(currentMax);
      setMaxUsers(maxNum);
      setNewLimit(String(maxNum));
    } catch {
      toast.error("Failed to load admin data");
    } finally {
      setLoading(false);
    }
  }, [adminActor]);

  useEffect(() => {
    if (actor && !isFetching) {
      loadData();
    }
  }, [actor, isFetching, loadData]);

  async function handleRemoveUser(principal: Principal) {
    if (!adminActor) return;
    const key = principal.toString();
    setRemovingUser(key);
    try {
      // Restore admin role before attempting removal
      try {
        await adminActor.restoreCallerRole();
      } catch {
        /* ignore */
      }
      if (adminActor.removeUser) {
        await adminActor.removeUser(principal);
      }
      setUsers((prev) => prev.filter((u) => u.principal.toString() !== key));
      toast.success("User removed successfully");
      try {
        await loadData();
      } catch {
        // non-critical
      }
    } catch {
      toast.error("Failed to remove user");
    } finally {
      setRemovingUser(null);
    }
  }

  async function handleRoleAction(
    principal: Principal,
    action: "makeAdmin" | "grantConfidential" | "demote",
  ) {
    const key = principal.toString();
    setRoleActionUser(key);
    try {
      let newRole: string;
      if (action === "makeAdmin") {
        await makeAdminMutation.mutateAsync(principal);
        newRole = "admin";
        toast.success("User promoted to admin");
      } else if (action === "grantConfidential") {
        await assignConfidentialMutation.mutateAsync(principal);
        newRole = "confidential";
        toast.success("Confidential role granted");
      } else {
        await demoteToUserMutation.mutateAsync(principal);
        newRole = "user";
        toast.success("User demoted to standard role");
      }
      // Optimistically update local state so UI reflects change immediately
      // (ICP query calls can return stale data right after an update call)
      setUsers((prev) =>
        prev.map((u) =>
          u.principal.toString() === key ? { ...u, role: newRole } : u,
        ),
      );
      // Also reload in background to confirm server state
      loadData().catch(() => {});
    } catch (err) {
      console.error("Role action failed:", err);
      toast.error("Failed to update role. You may not have admin privileges.");
    } finally {
      setRoleActionUser(null);
    }
  }

  async function handleSaveLimit() {
    if (!adminActor) return;
    const val = Number.parseInt(newLimit, 10);
    if (Number.isNaN(val) || val < 1 || val > 20) {
      toast.error("Limit must be between 1 and 20");
      return;
    }
    setSavingLimit(true);
    try {
      if (adminActor.setMaxUsers) {
        await adminActor.setMaxUsers(BigInt(val));
      }
      toast.success("User limit updated");
      await loadData();
    } catch {
      toast.error("Failed to update user limit");
    } finally {
      setSavingLimit(false);
    }
  }

  function truncatePrincipal(p: Principal) {
    const s = p.toString();
    return s.length > 12 ? `${s.slice(0, 10)}...` : s;
  }

  if (loading || isFetching) {
    return (
      <div
        className="flex items-center justify-center min-h-screen"
        data-ocid="admin.loading_state"
      >
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (isAdmin === false) {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-screen gap-4"
        data-ocid="admin.error_state"
      >
        <Shield className="w-12 h-12 text-muted-foreground" />
        <h2 className="text-xl font-bold text-foreground">Access Denied</h2>
        <p className="text-muted-foreground text-sm">
          You do not have admin privileges.
        </p>
      </div>
    );
  }

  const newLimitVal = Number.parseInt(newLimit, 10);
  const limitBelowCount =
    !Number.isNaN(newLimitVal) && newLimitVal < users.length;

  return (
    <TooltipProvider>
      <div className="p-6 max-w-4xl mx-auto space-y-6" data-ocid="admin.page">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-display text-foreground">
              Admin Panel
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage users, roles, and access settings
            </p>
          </div>
        </div>

        {/* User Management */}
        <Card className="border-primary/30" data-ocid="admin.users.card">
          <CardHeader className="border-b border-primary/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                <CardTitle className="text-base font-semibold">
                  User Management
                </CardTitle>
              </div>
              <Badge
                variant="outline"
                className="border-primary/40 text-primary font-mono text-xs"
                data-ocid="admin.users.count"
              >
                {users.length} / {maxUsers} users
              </Badge>
            </div>
            <CardDescription className="text-muted-foreground text-xs mt-1">
              Manage registered users and their roles. Only admins can promote
              users or grant confidential access.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {users.length === 0 ? (
              <div
                className="flex items-center justify-center py-10 text-muted-foreground text-sm"
                data-ocid="admin.users.empty_state"
              >
                No users registered yet.
              </div>
            ) : (
              <Table data-ocid="admin.users.table">
                <TableHeader>
                  <TableRow className="border-primary/10 hover:bg-transparent">
                    <TableHead className="text-muted-foreground text-xs uppercase tracking-wider">
                      Display Name
                    </TableHead>
                    <TableHead className="text-muted-foreground text-xs uppercase tracking-wider">
                      Principal
                    </TableHead>
                    <TableHead className="text-muted-foreground text-xs uppercase tracking-wider">
                      Role
                    </TableHead>
                    <TableHead className="text-muted-foreground text-xs uppercase tracking-wider">
                      Role Actions
                    </TableHead>
                    <TableHead className="w-12" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user, i) => {
                    const isUserAdmin = user.role === "admin";
                    const principalStr = user.principal.toString();
                    const isRemoving = removingUser === principalStr;
                    const isRoleActioning = roleActionUser === principalStr;
                    const isSelf = callerPrincipal === principalStr;
                    return (
                      <TableRow
                        key={principalStr}
                        className="border-primary/10 hover:bg-primary/5"
                        data-ocid={`admin.users.row.${i + 1}`}
                      >
                        <TableCell className="font-medium text-foreground">
                          <div className="flex items-center gap-1.5">
                            {user.name || (
                              <span className="text-muted-foreground italic">
                                No name set
                              </span>
                            )}
                            {isSelf && (
                              <Badge className="text-[10px] px-1.5 py-0 bg-primary/10 text-primary border-primary/20 border">
                                you
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {truncatePrincipal(user.principal)}
                        </TableCell>
                        <TableCell>
                          <RoleBadge role={user.role} />
                        </TableCell>
                        <TableCell>
                          {/* Role action buttons — only for non-admin, non-self users */}
                          {!isUserAdmin && !isSelf && (
                            <div className="flex items-center gap-1.5">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    disabled={isRoleActioning}
                                    onClick={() =>
                                      handleRoleAction(
                                        user.principal,
                                        "makeAdmin",
                                      )
                                    }
                                    className="h-7 px-2 text-xs border-primary/30 text-primary hover:bg-primary/10"
                                    data-ocid={`admin.users.primary_button.${i + 1}`}
                                  >
                                    {isRoleActioning ? (
                                      <Loader2 className="w-3 h-3 animate-spin" />
                                    ) : (
                                      "Make Admin"
                                    )}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                  Promote to admin
                                </TooltipContent>
                              </Tooltip>

                              {user.role === "confidential" ? (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      disabled={isRoleActioning}
                                      onClick={() =>
                                        handleRoleAction(
                                          user.principal,
                                          "demote",
                                        )
                                      }
                                      className="h-7 px-2 text-xs border-muted text-muted-foreground hover:bg-muted/20"
                                      data-ocid={`admin.users.secondary_button.${i + 1}`}
                                    >
                                      {isRoleActioning ? (
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                      ) : (
                                        "Demote to User"
                                      )}
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent side="top">
                                    Remove confidential access
                                  </TooltipContent>
                                </Tooltip>
                              ) : (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      disabled={isRoleActioning}
                                      onClick={() =>
                                        handleRoleAction(
                                          user.principal,
                                          "grantConfidential",
                                        )
                                      }
                                      className="h-7 px-2 text-xs border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                                      data-ocid={`admin.users.secondary_button.${i + 1}`}
                                    >
                                      {isRoleActioning ? (
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                      ) : (
                                        "Grant Confidential"
                                      )}
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent side="top">
                                    Grant confidential file access
                                  </TooltipContent>
                                </Tooltip>
                              )}
                            </div>
                          )}
                          {isSelf && (
                            <span className="text-xs text-muted-foreground italic">
                              —
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {isUserAdmin ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="inline-flex">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    disabled
                                    className="h-7 w-7 p-0 opacity-30 cursor-not-allowed"
                                    data-ocid={`admin.users.delete_button.${i + 1}`}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </Button>
                                </span>
                              </TooltipTrigger>
                              <TooltipContent side="left">
                                Cannot remove admin users
                              </TooltipContent>
                            </Tooltip>
                          ) : (
                            <Button
                              size="sm"
                              variant="ghost"
                              disabled={isRemoving}
                              onClick={() => handleRemoveUser(user.principal)}
                              className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                              data-ocid={`admin.users.delete_button.${i + 1}`}
                            >
                              {isRemoving ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="w-3.5 h-3.5" />
                              )}
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* User Limit Settings */}
        <Card className="border-primary/30" data-ocid="admin.limit.card">
          <CardHeader className="border-b border-primary/20">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              User Limit Settings
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Control the maximum number of registered users
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-5 space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              Current limit:
              <span className="font-bold text-primary font-mono">
                {maxUsers}
              </span>
            </div>
            <div className="flex items-end gap-3">
              <div className="space-y-1.5 flex-1 max-w-xs">
                <Label
                  htmlFor="limit-input"
                  className="text-xs text-muted-foreground"
                >
                  New limit (1–20)
                </Label>
                <Input
                  id="limit-input"
                  type="number"
                  min={1}
                  max={20}
                  value={newLimit}
                  onChange={(e) => setNewLimit(e.target.value)}
                  className="font-mono h-9"
                  data-ocid="admin.limit.input"
                />
              </div>
              <Button
                onClick={handleSaveLimit}
                disabled={savingLimit}
                className="h-9"
                data-ocid="admin.limit.save_button"
              >
                {savingLimit ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {savingLimit ? "Saving..." : "Save Limit"}
              </Button>
            </div>
            {limitBelowCount && (
              <div
                className="flex items-center gap-2 text-amber-400 text-xs"
                data-ocid="admin.limit.error_state"
              >
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                Warning: new limit ({newLimitVal}) is below current user count (
                {users.length}). Existing users will not be removed, but no new
                registrations will be allowed.
              </div>
            )}
          </CardContent>
        </Card>

        {/* File Permissions */}
        <FilePermissionsSection
          opportunities={opportunities}
          users={userProfiles}
        />
      </div>
    </TooltipProvider>
  );
}
