import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import type { Principal } from "@icp-sdk/core/principal";
import {
  ChevronDown,
  ChevronRight,
  File,
  Loader2,
  Lock,
  LockOpen,
  Users,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type {
  FileRecord,
  Opportunity,
  UserProfileDTO,
} from "../hooks/useQueries";
import {
  useAdminAllFileRecords,
  useFilePermissions,
  useGrantFileAccess,
  useRevokeFileAccess,
  useSetFileConfidential,
} from "../hooks/useQueries";

// FileRecord from backend.ts doesn't include isConfidential yet;
// the backend returns it at runtime so we extend the type here.
type FileRecordX = FileRecord & { isConfidential?: boolean };

function UserAccessRow({
  user,
  fileId,
  grantedPrincipals,
}: {
  user: UserProfileDTO;
  fileId: bigint;
  grantedPrincipals: Set<string>;
}) {
  const grantAccess = useGrantFileAccess();
  const revokeAccess = useRevokeFileAccess();
  const principalStr = user.principal.toString();
  const hasAccess = grantedPrincipals.has(principalStr);
  const isPending = grantAccess.isPending || revokeAccess.isPending;

  const handleToggle = async () => {
    try {
      if (hasAccess) {
        await revokeAccess.mutateAsync({ fileId, user: user.principal });
        toast.success(`Access revoked for ${user.name || "user"}`);
      } else {
        await grantAccess.mutateAsync({ fileId, user: user.principal });
        toast.success(`Access granted to ${user.name || "user"}`);
      }
    } catch {
      toast.error("Failed to update access");
    }
  };

  return (
    <div className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-primary/5">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
          <span className="text-xs font-bold text-primary">
            {(user.name || "U").charAt(0).toUpperCase()}
          </span>
        </div>
        <span className="text-sm text-foreground">
          {user.name || (
            <span className="italic text-muted-foreground">No name</span>
          )}
        </span>
      </div>
      <div className="flex items-center gap-2">
        {hasAccess && (
          <Badge className="bg-primary/20 text-primary border border-primary/30 text-xs py-0 h-5">
            Access
          </Badge>
        )}
        <Button
          size="sm"
          variant={hasAccess ? "outline" : "default"}
          disabled={isPending}
          onClick={handleToggle}
          className={`h-7 px-3 text-xs ${
            hasAccess
              ? "border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
              : "bg-primary text-primary-foreground hover:bg-primary/90"
          }`}
          data-ocid={`admin.file_permissions.${hasAccess ? "revoke" : "grant"}_button`}
        >
          {isPending ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : hasAccess ? (
            "Revoke"
          ) : (
            "Grant"
          )}
        </Button>
      </div>
    </div>
  );
}

function FilePermissionRow({
  file,
  users,
  oppName,
}: {
  file: FileRecordX;
  users: UserProfileDTO[];
  oppName: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const setConfidential = useSetFileConfidential();
  const isConfidential = !!file.isConfidential;

  const permissionsQuery = useFilePermissions(
    file.id,
    expanded && isConfidential,
  );
  const grantedPrincipals = new Set<string>(
    (permissionsQuery.data ?? []).map((p: Principal) => p.toString()),
  );

  const handleConfidentialToggle = async (checked: boolean) => {
    try {
      await setConfidential.mutateAsync({
        fileId: file.id,
        confidential: checked,
      });
      toast.success(
        checked ? "File marked confidential" : "File marked public",
      );
      if (!checked) setExpanded(false);
    } catch {
      toast.error("Failed to update file confidentiality");
    }
  };

  return (
    <div className="border border-border/60 rounded-lg overflow-hidden">
      {/* File row */}
      <div className="flex items-center gap-3 px-4 py-3 bg-card/50">
        <File className="w-4 h-4 text-muted-foreground shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-medium text-foreground truncate">
              {file.displayName}
            </span>
            {isConfidential && (
              <Lock className="w-3 h-3 text-primary shrink-0" />
            )}
          </div>
          <p className="text-xs text-muted-foreground truncate">
            {oppName} · {file.folder}
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2">
            {isConfidential ? (
              <Lock className="w-3.5 h-3.5 text-primary" />
            ) : (
              <LockOpen className="w-3.5 h-3.5 text-muted-foreground" />
            )}
            <Switch
              checked={isConfidential}
              onCheckedChange={handleConfidentialToggle}
              disabled={setConfidential.isPending}
              data-ocid="admin.file_permissions.toggle"
              aria-label="Mark file confidential"
            />
            <span className="text-xs text-muted-foreground w-16">
              {isConfidential ? "Confidential" : "Public"}
            </span>
          </div>
          {isConfidential && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setExpanded((v) => !v)}
              className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
              data-ocid="admin.file_permissions.panel"
              aria-label="Toggle user access panel"
            >
              {expanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </Button>
          )}
        </div>
      </div>

      {/* User access panel */}
      {expanded && isConfidential && (
        <div className="border-t border-border/60 bg-muted/20 px-4 py-3">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              User Access
            </span>
            {permissionsQuery.isLoading && (
              <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
            )}
          </div>
          {users.length === 0 ? (
            <p className="text-xs text-muted-foreground py-2">
              No users registered.
            </p>
          ) : (
            <div className="space-y-0.5">
              {users.map((user) => (
                <UserAccessRow
                  key={user.principal.toString()}
                  user={user}
                  fileId={file.id}
                  grantedPrincipals={grantedPrincipals}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface FilePermissionsSectionProps {
  opportunities: Opportunity[];
  users: UserProfileDTO[];
}

export default function FilePermissionsSection({
  opportunities,
  users,
}: FilePermissionsSectionProps) {
  const filesQuery = useAdminAllFileRecords();
  const files = (filesQuery.data ?? []) as FileRecordX[];

  // Build opportunity name map
  const oppMap = new Map<string, string>();
  for (const opp of opportunities) {
    oppMap.set(opp.id.toString(), opp.name);
  }

  // Group files by opportunity
  const byOpp = new Map<string, FileRecordX[]>();
  for (const f of files) {
    const key = f.opportunityId.toString();
    const list = byOpp.get(key) ?? [];
    list.push(f);
    byOpp.set(key, list);
  }

  return (
    <Card className="border-primary/30" data-ocid="admin.file_permissions.card">
      <CardHeader className="border-b border-primary/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-primary" />
            <CardTitle className="text-base font-semibold">
              File Permissions
            </CardTitle>
          </div>
          <Badge
            variant="outline"
            className="border-primary/40 text-primary font-mono text-xs"
          >
            {files.filter((f) => f.isConfidential).length} confidential
          </Badge>
        </div>
        <CardDescription className="text-muted-foreground text-xs mt-1">
          Mark files as confidential and control which users can access them
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        {filesQuery.isLoading ? (
          <div
            className="flex items-center gap-2 text-muted-foreground text-sm py-4"
            data-ocid="admin.file_permissions.loading_state"
          >
            <Loader2 className="w-4 h-4 animate-spin" /> Loading files...
          </div>
        ) : files.length === 0 ? (
          <div
            className="text-center py-6 text-muted-foreground text-sm"
            data-ocid="admin.file_permissions.empty_state"
          >
            No files uploaded yet.
          </div>
        ) : (
          <div className="space-y-4">
            {Array.from(byOpp.entries()).map(([oppId, oppFiles]) => {
              const oppName = oppMap.get(oppId) ?? `Opportunity #${oppId}`;
              return (
                <div key={oppId}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                      {oppName}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ({oppFiles.length} file{oppFiles.length !== 1 ? "s" : ""})
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {oppFiles.map((file) => (
                      <FilePermissionRow
                        key={file.id.toString()}
                        file={file}
                        users={users}
                        oppName={oppName}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
