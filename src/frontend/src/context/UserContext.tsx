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
  const [userName, setUserNameState] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!actor || isFetching) return;
    (async () => {
      try {
        const profile = await actor.getCallerUserProfile();
        if (profile?.name) {
          setUserNameState(profile.name);
        } else {
          setShowNamePrompt(true);
        }
      } catch {
        // ignore
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
      // ignore
    } finally {
      setSaving(false);
    }
  };

  return (
    <UserContext.Provider value={{ userName, setUserName, isLoading }}>
      {children}
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
