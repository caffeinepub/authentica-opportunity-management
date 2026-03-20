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
import { AlertCircle, Loader2, Pencil, Plus, Star, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { TodoItem } from "../backend";
import { useUser } from "../context/UserContext";
import {
  useCreateTodoItem,
  useDeleteTodoItem,
  useOpportunities,
  useTodoItems,
  useUpdateTodoItem,
  useUserProfiles,
} from "../hooks/useQueries";

type Priority = "high" | "medium" | "low";

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

const PRIORITY_ORDER: Record<string, number> = { high: 0, medium: 1, low: 2 };

const PRIORITY_CONFIG: Record<Priority, { label: string; classes: string }> = {
  high: {
    label: "High",
    classes: "bg-red-500/15 text-red-500 border-red-500/30",
  },
  medium: {
    label: "Med",
    classes: "bg-amber-500/15 text-amber-500 border-amber-500/30",
  },
  low: {
    label: "Low",
    classes: "bg-muted text-muted-foreground border-border/60",
  },
};

function PriorityBadge({ priority }: { priority: string }) {
  const p =
    (priority as Priority) in PRIORITY_CONFIG
      ? (priority as Priority)
      : "medium";
  const cfg = PRIORITY_CONFIG[p];
  return (
    <span
      className={`inline-flex items-center rounded border px-1.5 py-0 text-[10px] font-semibold leading-4 ${cfg.classes}`}
    >
      {cfg.label}
    </span>
  );
}

function TodoCard({
  item,
  onMove,
  onDelete,
  onEdit,
  opportunityName,
  idx,
  isMyItem,
}: {
  item: TodoItem & { priority?: string };
  onMove: (item: TodoItem, stage: string) => void;
  onDelete: (id: bigint) => void;
  onEdit: (item: TodoItem) => void;
  opportunityName?: string;
  idx: number;
  isMyItem: boolean;
}) {
  const stages = COLUMNS.map((c) => c.stage).filter((s) => s !== item.stage);
  return (
    <div
      className={`border rounded-lg p-3 shadow-sm group transition-colors ${
        isMyItem
          ? "bg-primary/10 border-l-2 border-l-primary border-r border-t border-b border-primary/30"
          : "bg-card border-border"
      }`}
      data-ocid={`todo.item.${idx}`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-foreground leading-snug flex-1">
          {item.title}
        </p>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={() => onEdit(item)}
            className="shrink-0 p-1 rounded hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
            data-ocid={`todo.edit_button.${idx}`}
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(item.id)}
            className="shrink-0 p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
            data-ocid={`todo.delete_button.${idx}`}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      {opportunityName && (
        <div className="mt-1.5">
          <Badge
            variant="outline"
            className="text-[10px] px-1.5 py-0 border-primary/40 text-primary bg-primary/5"
          >
            {opportunityName}
          </Badge>
        </div>
      )}
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-1.5">
          <Badge
            variant="outline"
            className={`text-xs ${
              isMyItem ? "border-primary/40 text-primary bg-primary/5" : ""
            }`}
          >
            {item.assignedTo || "Unassigned"}
          </Badge>
          {isMyItem && (
            <Star
              className="w-3 h-3 text-primary fill-primary"
              aria-label="Assigned to me"
            />
          )}
          <PriorityBadge priority={(item as any).priority ?? "medium"} />
        </div>
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

type DialogMode = "add" | "edit";
type FilterMode = "all" | "mine";

export default function TodoKanban() {
  const { data: todos, isLoading, isError } = useTodoItems();
  const { data: userProfiles } = useUserProfiles();
  const { data: opportunities } = useOpportunities();
  const createTodo = useCreateTodoItem();
  const updateTodo = useUpdateTodoItem();
  const deleteTodo = useDeleteTodoItem();
  const { userName } = useUser();

  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<DialogMode>("add");
  const [editingId, setEditingId] = useState<bigint | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formAssignee, setFormAssignee] = useState<string>("unassigned");
  const [formStage, setFormStage] = useState("todo");
  const [formOpportunityId, setFormOpportunityId] = useState<string>("none");
  const [formPriority, setFormPriority] = useState<Priority>("medium");
  const [filterMode, setFilterMode] = useState<FilterMode>("all");

  const users = (userProfiles ?? []).map((u) => ({
    principal: u.principal.toString(),
    name: u.name || "Unnamed",
  }));

  const opportunityMap = new Map<string, string>(
    (opportunities ?? []).map((o) => [o.id.toString(), o.name]),
  );

  const isMyTodo = (item: TodoItem) => {
    if (!userName || item.stage === "done") return false;
    return (
      item.assignedTo.trim().toLowerCase() === userName.trim().toLowerCase()
    );
  };

  const filteredTodos = (todos ?? []).filter((t) => {
    if (filterMode === "mine") {
      return (
        userName &&
        t.assignedTo.trim().toLowerCase() === userName.trim().toLowerCase()
      );
    }
    return true;
  });

  const openAdd = (stage: string) => {
    setMode("add");
    setFormStage(stage);
    setFormTitle("");
    setFormAssignee("unassigned");
    setFormOpportunityId("none");
    setFormPriority("medium");
    setEditingId(null);
    setOpen(true);
  };

  const openEdit = (item: TodoItem) => {
    setMode("edit");
    setEditingId(item.id);
    setFormTitle(item.title);
    setFormAssignee(item.assignedTo || "unassigned");
    setFormStage(item.stage);
    setFormOpportunityId(
      item.opportunityId != null ? item.opportunityId.toString() : "none",
    );
    setFormPriority(((item as any).priority as Priority) || "medium");
    setOpen(true);
  };

  const resolvedOpportunityId = (): bigint | null => {
    if (formOpportunityId === "none") return null;
    return BigInt(formOpportunityId);
  };

  const handleCreate = async () => {
    if (!formTitle.trim()) return;
    const assignedTo = formAssignee === "unassigned" ? "" : formAssignee;
    try {
      await createTodo.mutateAsync({
        title: formTitle.trim(),
        assignedTo,
        stage: formStage,
        opportunityId: resolvedOpportunityId(),
        priority: formPriority,
      });
      toast.success("Todo added");
      setOpen(false);
    } catch {
      toast.error("Failed to add todo");
    }
  };

  const handleUpdate = async () => {
    if (!formTitle.trim() || editingId === null) return;
    const assignedTo = formAssignee === "unassigned" ? "" : formAssignee;
    try {
      await updateTodo.mutateAsync({
        id: editingId,
        title: formTitle.trim(),
        assignedTo,
        stage: formStage,
        opportunityId: resolvedOpportunityId(),
        priority: formPriority,
      });
      toast.success("Todo updated");
      setOpen(false);
    } catch {
      toast.error("Failed to update todo");
    }
  };

  const handleMove = async (item: TodoItem, stage: string) => {
    try {
      await updateTodo.mutateAsync({
        id: item.id,
        title: item.title,
        assignedTo: item.assignedTo,
        stage,
        opportunityId: item.opportunityId ?? null,
        priority: (item as any).priority ?? "medium",
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

  const isPending =
    mode === "add" ? createTodo.isPending : updateTodo.isPending;

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
      {/* All / My Items toggle */}
      <div className="flex items-center mb-4">
        <div
          className="inline-flex rounded-lg border border-border overflow-hidden"
          data-ocid="todo.toggle"
        >
          <button
            type="button"
            onClick={() => setFilterMode("all")}
            className={`px-4 py-1.5 text-xs font-medium transition-colors ${
              filterMode === "all"
                ? "bg-primary text-primary-foreground"
                : "bg-background text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            All Items
          </button>
          <button
            type="button"
            onClick={() => setFilterMode("mine")}
            className={`px-4 py-1.5 text-xs font-medium border-l border-border transition-colors ${
              filterMode === "mine"
                ? "bg-primary text-primary-foreground"
                : "bg-background text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            My Items
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {COLUMNS.map((col) => {
          const colItems = filteredTodos
            .filter((t) => t.stage === col.stage)
            .sort((a, b) => {
              const pa = PRIORITY_ORDER[(a as any).priority ?? "medium"] ?? 1;
              const pb = PRIORITY_ORDER[(b as any).priority ?? "medium"] ?? 1;
              return pa - pb;
            });
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
                      onEdit={openEdit}
                      opportunityName={
                        item.opportunityId != null
                          ? opportunityMap.get(item.opportunityId.toString())
                          : undefined
                      }
                      idx={i + 1}
                      isMyItem={isMyTodo(item)}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Todo Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md" data-ocid="todo.dialog">
          <DialogHeader>
            <DialogTitle className="font-display">
              {mode === "add" ? "Add To-Do" : "Edit To-Do"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="todo-title">Title *</Label>
              <Input
                id="todo-title"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="What needs to be done?"
                className="mt-1"
                data-ocid="todo.input"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    mode === "add" ? handleCreate() : handleUpdate();
                  }
                }}
              />
            </div>
            <div>
              <Label>Assign To</Label>
              <Select value={formAssignee} onValueChange={setFormAssignee}>
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
              <Label>Priority</Label>
              <Select
                value={formPriority}
                onValueChange={(v) => setFormPriority(v as Priority)}
              >
                <SelectTrigger className="mt-1" data-ocid="todo.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">🔴 High</SelectItem>
                  <SelectItem value="medium">🟡 Medium</SelectItem>
                  <SelectItem value="low">⚪ Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Column</Label>
              <Select value={formStage} onValueChange={setFormStage}>
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
            <div>
              <Label>Tag Opportunity</Label>
              <Select
                value={formOpportunityId}
                onValueChange={setFormOpportunityId}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {(opportunities ?? []).map((o) => (
                    <SelectItem key={o.id.toString()} value={o.id.toString()}>
                      {o.name}
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
              onClick={mode === "add" ? handleCreate : handleUpdate}
              disabled={!formTitle.trim() || isPending}
              data-ocid="todo.submit_button"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {mode === "add" ? "Adding..." : "Saving..."}
                </>
              ) : mode === "add" ? (
                "Add Todo"
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
