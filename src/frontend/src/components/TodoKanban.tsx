import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Loader2, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { TodoItem } from "../backend";
import {
  useCreateTodoItem,
  useDeleteTodoItem,
  useTodoItems,
  useUpdateTodoItem,
  useUserProfiles,
} from "../hooks/useQueries";

const COLUMNS: { stage: string; label: string }[] = [
  { stage: "todo", label: "To Do" },
  { stage: "inProgress", label: "In Progress" },
  { stage: "done", label: "Done" },
];

const STAGE_COLORS: Record<string, string> = {
  todo: "bg-muted/60 border-muted",
  inProgress: "bg-primary/5 border-primary/20",
  done: "bg-muted/30 border-muted/50",
};

const STAGE_HEADER_COLORS: Record<string, string> = {
  todo: "text-foreground",
  inProgress: "text-primary",
  done: "text-muted-foreground",
};

function TodoCard({
  item,
  onMove,
  onDelete,
  idx,
}: {
  item: TodoItem;
  onMove: (item: TodoItem, stage: string) => void;
  onDelete: (id: bigint) => void;
  idx: number;
}) {
  const stages = COLUMNS.map((c) => c.stage).filter((s) => s !== item.stage);
  return (
    <div
      className="bg-card border border-border rounded-lg p-3 shadow-sm group"
      data-ocid={`todo.item.${idx}`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-foreground leading-snug flex-1">
          {item.title}
        </p>
        <button
          type="button"
          onClick={() => onDelete(item.id)}
          className="shrink-0 p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
          data-ocid={`todo.delete_button.${idx}`}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="flex items-center justify-between mt-2">
        <Badge variant="outline" className="text-xs">
          {item.assignedTo || "Unassigned"}
        </Badge>
        <div className="flex gap-1">
          {stages.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onMove(item, s)}
              className="text-[10px] px-1.5 py-0.5 rounded border border-border/60 text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors"
            >
              → {COLUMNS.find((c) => c.stage === s)?.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function TodoKanban() {
  const { data: todos, isLoading, isError } = useTodoItems();
  const { data: userProfiles } = useUserProfiles();
  const createTodo = useCreateTodoItem();
  const updateTodo = useUpdateTodoItem();
  const deleteTodo = useDeleteTodoItem();

  const [open, setOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newAssignee, setNewAssignee] = useState<string>("unassigned");
  const [newStage, setNewStage] = useState("todo");

  const users = (userProfiles ?? []).map((u) => ({
    principal: u.principal.toString(),
    name: u.name || "Unnamed",
  }));

  const openAdd = (stage: string) => {
    setNewStage(stage);
    setNewTitle("");
    setNewAssignee("unassigned");
    setOpen(true);
  };

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    const assignedTo = newAssignee === "unassigned" ? "" : newAssignee;
    try {
      await createTodo.mutateAsync({
        title: newTitle.trim(),
        assignedTo,
        stage: newStage,
      });
      toast.success("Todo added");
      setOpen(false);
    } catch {
      toast.error("Failed to add todo");
    }
  };

  const handleMove = async (item: TodoItem, stage: string) => {
    try {
      await updateTodo.mutateAsync({
        id: item.id,
        title: item.title,
        assignedTo: item.assignedTo,
        stage,
      });
    } catch {
      toast.error("Failed to move item");
    }
  };

  const handleDelete = async (id: bigint) => {
    try {
      await deleteTodo.mutateAsync(id);
      toast.success("Todo removed");
    } catch {
      toast.error("Failed to remove todo");
    }
  };

  if (isError) {
    return (
      <div
        className="flex items-center gap-3 p-4 rounded-lg border border-destructive/30 bg-destructive/5 text-destructive"
        data-ocid="todo.error_state"
      >
        <AlertCircle className="w-5 h-5 shrink-0" />
        <p className="text-sm">Failed to load todos.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {COLUMNS.map((col) => {
          const colItems = (todos ?? []).filter((t) => t.stage === col.stage);
          return (
            <div
              key={col.stage}
              className={`rounded-xl border p-3 ${STAGE_COLORS[col.stage]}`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-sm font-semibold ${
                      STAGE_HEADER_COLORS[col.stage]
                    }`}
                  >
                    {col.label}
                  </span>
                  <span className="text-xs text-muted-foreground bg-muted rounded-full w-5 h-5 flex items-center justify-center">
                    {colItems.length}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => openAdd(col.stage)}
                  className="p-1 rounded-md hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                  data-ocid="todo.add_button"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Cards */}
              <div className="space-y-2 min-h-[80px]">
                {isLoading ? (
                  <>
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                  </>
                ) : colItems.length === 0 ? (
                  <div
                    className="text-center py-6 text-xs text-muted-foreground"
                    data-ocid="todo.empty_state"
                  >
                    No items
                  </div>
                ) : (
                  colItems.map((item, i) => (
                    <TodoCard
                      key={item.id.toString()}
                      item={item}
                      onMove={handleMove}
                      onDelete={handleDelete}
                      idx={i + 1}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Todo Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md" data-ocid="todo.dialog">
          <DialogHeader>
            <DialogTitle className="font-display">Add To-Do</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="todo-title">Title *</Label>
              <Input
                id="todo-title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="What needs to be done?"
                className="mt-1"
                data-ocid="todo.input"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreate();
                }}
              />
            </div>
            <div>
              <Label>Assign To</Label>
              <Select value={newAssignee} onValueChange={setNewAssignee}>
                <SelectTrigger className="mt-1" data-ocid="todo.select">
                  <SelectValue placeholder="Unassigned" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {users.map((u) => (
                    <SelectItem key={u.principal} value={u.name}>
                      {u.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Column</Label>
              <Select value={newStage} onValueChange={setNewStage}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COLUMNS.map((c) => (
                    <SelectItem key={c.stage} value={c.stage}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              data-ocid="todo.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!newTitle.trim() || createTodo.isPending}
              data-ocid="todo.submit_button"
            >
              {createTodo.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Todo"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
