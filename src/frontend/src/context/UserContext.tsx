import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  type ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

interface UserContextValue {
  userName: string;
  setUserName: (name: string) => void;
  isLoading: boolean;
}

const UserContext = createContext<UserContextValue>({
  userName: "",
  setUserName: () => {},
  isLoading: true,
});

export function useUser() {
  return useContext(UserContext);
}

export function UserProvider({ children }: { children: ReactNode }) {
  const { actor, isFetching } = useActor();
  const { clear } = useInternetIdentity();
  const [userName, setUserNameState] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [registrationFull, setRegistrationFull] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!actor || isFetching) return;
    (async () => {
      try {
        const profile = await actor.getCallerUserProfile();
        if (profile?.name) {
          setUserNameState(profile.name);
        } else if (profile && !profile.name) {
          // Registered but no display name set
          setShowNamePrompt(true);
        } else {
          // Not registered yet -- check if there's capacity
          try {
            const [allUsers, maxUsersRaw] = await Promise.all([
              actor.listAllUserProfiles(),
              (actor as any).getMaxUsers(),
            ]);
            const maxNum = Number(maxUsersRaw);
            if (allUsers.length >= maxNum) {
              // User limit reached -- this user cannot register
              setRegistrationFull(true);
            } else {
              setShowNamePrompt(true);
            }
          } catch {
            // If capacity check fails, show the name prompt as fallback
            setShowNamePrompt(true);
          }
        }
      } catch (err) {
        // getCallerUserProfile can fail if the user has no role yet (e.g. after a fresh deployment).
        // In that case, show the name prompt rather than blocking them entirely.
        // Only block if the error message explicitly indicates the user limit was reached.
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.includes("User limit reached")) {
          setRegistrationFull(true);
        } else {
          setShowNamePrompt(true);
        }
      } finally {
        setIsLoading(false);
      }
    })();
  }, [actor, isFetching]);

  const setUserName = (name: string) => {
    setUserNameState(name);
  };

  const handleSaveName = async () => {
    if (!nameInput.trim() || !actor) return;
    setSaving(true);
    try {
      await actor.saveCallerUserProfile({ name: nameInput.trim() });
      setUserNameState(nameInput.trim());
      setShowNamePrompt(false);
    } catch {
      // If saving fails (e.g. limit enforced at backend), check if limit is now full
      try {
        const [allUsers, maxUsersRaw] = await Promise.all([
          actor.listAllUserProfiles(),
          (actor as any).getMaxUsers(),
        ]);
        if (allUsers.length >= Number(maxUsersRaw)) {
          setShowNamePrompt(false);
          setRegistrationFull(true);
        }
      } catch {
        // ignore
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <UserContext.Provider value={{ userName, setUserName, isLoading }}>
      {children}

      {/* Registration full -- user cannot join */}
      <Dialog open={registrationFull} onOpenChange={() => {}}>
        <DialogContent
          className="sm:max-w-md"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="font-display">
              Access Restricted
            </DialogTitle>
            <DialogDescription>
              This workspace has reached its maximum number of users. Contact
              your admin to request access or increase the user limit.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={clear}>
              Sign Out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Name prompt for new users */}
      <Dialog open={showNamePrompt} onOpenChange={() => {}}>
        <DialogContent
          className="sm:max-w-md"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="font-display">
              Welcome to Authentica
            </DialogTitle>
            <DialogDescription>
              Please enter your name to get started. This will be used in
              comments and activity.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <Label htmlFor="user-name-input">Your Name</Label>
            <Input
              id="user-name-input"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="e.g. Alex Johnson"
              className="mt-1"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveName();
              }}
            />
          </div>
          <DialogFooter>
            <Button
              onClick={handleSaveName}
              disabled={!nameInput.trim() || saving}
            >
              {saving ? "Saving..." : "Get Started"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </UserContext.Provider>
  );
}
