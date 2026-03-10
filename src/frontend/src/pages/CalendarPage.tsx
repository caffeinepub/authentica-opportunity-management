import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, CalendarPlus, Clock, Trash2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useUser } from "../context/UserContext";
import {
  useCalendarItems,
  useCreateCalendarItem,
  useDeleteCalendarItem,
  useOpportunities,
} from "../hooks/useQueries";

function getNextTwoWorkWeeks(): Date[] {
  const days: Date[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let current = new Date(today);
  // Start from Monday of current week or next Monday if weekend
  const dayOfWeek = current.getDay();
  if (dayOfWeek === 0)
    current.setDate(current.getDate() + 1); // Sunday -> Monday
  else if (dayOfWeek === 6) current.setDate(current.getDate() + 2); // Saturday -> Monday

  // Collect 10 work days (2 weeks)
  while (days.length < 10) {
    const d = new Date(current);
    const dow = d.getDay();
    if (dow !== 0 && dow !== 6) {
      days.push(d);
    }
    current.setDate(current.getDate() + 1);
  }
  return days;
}

function startOfDayUTCMs(date: Date): bigint {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );
  return BigInt(d.getTime());
}

function isSameDay(date: Date, ts: bigint): boolean {
  const d = new Date(Number(ts));
  return (
    d.getUTCFullYear() === date.getFullYear() &&
    d.getUTCMonth() === date.getMonth() &&
    d.getUTCDate() === date.getDate()
  );
}

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export default function CalendarPage() {
  const { userName } = useUser();
  const workDays = getNextTwoWorkWeeks();

  const { data: calendarItems, isLoading, isError } = useCalendarItems();
  const { data: opportunities } = useOpportunities();
  const createItem = useCreateCalendarItem();
  const deleteItem = useDeleteCalendarItem();

  const [open, setOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [title, setTitle] = useState("");
  const [timeLabel, setTimeLabel] = useState("");
  const [notes, setNotes] = useState("");
  const [oppId, setOppId] = useState<string>("none");

  const openModal = (day: Date) => {
    setSelectedDay(day);
    setTitle("");
    setTimeLabel("");
    setNotes("");
    setOppId("none");
    setOpen(true);
  };

  const handleCreate = async () => {
    if (!title.trim() || !selectedDay) return;
    try {
      const ts = startOfDayUTCMs(selectedDay);
      const opportunityIdArg = oppId !== "none" ? BigInt(oppId) : null;
      await createItem.mutateAsync({
        title: title.trim(),
        dateTimestamp: ts,
        timeLabel: timeLabel.trim(),
        notes: notes.trim(),
        opportunityId: opportunityIdArg,
        createdBy: userName || "Unknown",
      });
      toast.success("Calendar item added");
      setOpen(false);
    } catch {
      toast.error("Failed to add calendar item");
    }
  };

  const handleDelete = async (id: bigint) => {
    try {
      await deleteItem.mutateAsync(id);
      toast.success("Item removed");
    } catch {
      toast.error("Failed to remove item");
    }
  };

  // Split work days into two weeks
  const week1 = workDays.slice(0, 5);
  const week2 = workDays.slice(5, 10);

  const renderWeek = (days: Date[], weekLabel: string) => (
    <div className="mb-6">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
        {weekLabel}
      </h2>
      <div className="grid grid-cols-5 gap-2">
        {days.map((day, i) => {
          const items = (calendarItems ?? []).filter((c) =>
            isSameDay(day, c.dateTimestamp),
          );
          const isToday = new Date().toDateString() === day.toDateString();
          return (
            <div
              key={day.toISOString()}
              className="flex flex-col min-h-[160px]"
            >
              {/* Day Header */}
              <div
                className={`flex items-center justify-between px-2 py-1.5 rounded-t-lg border border-border/60 ${
                  isToday
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-card-foreground"
                }`}
              >
                <span className="text-xs font-bold">{DAY_LABELS[i]}</span>
                <span
                  className={`text-xs ${
                    isToday
                      ? "text-primary-foreground/80"
                      : "text-muted-foreground"
                  }`}
                >
                  {MONTH_NAMES[day.getMonth()]} {day.getDate()}
                </span>
              </div>
              {/* Day Body */}
              <div className="flex-1 border border-t-0 border-border/60 rounded-b-lg bg-card/50 p-1.5 space-y-1">
                {isLoading ? (
                  <Skeleton className="h-8 w-full" />
                ) : (
                  items.map((item) => (
                    <div
                      key={item.id.toString()}
                      className="group relative bg-primary/10 border border-primary/20 rounded px-2 py-1 text-xs"
                    >
                      <div className="font-medium text-foreground leading-tight pr-4 truncate">
                        {item.title}
                      </div>
                      {item.timeLabel && (
                        <div className="flex items-center gap-1 text-muted-foreground mt-0.5">
                          <Clock className="w-2.5 h-2.5" />
                          {item.timeLabel}
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        className="absolute top-0.5 right-0.5 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-destructive/20 text-destructive"
                        data-ocid="calendar.delete_button"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  ))
                )}
                <button
                  type="button"
                  onClick={() => openModal(day)}
                  className="w-full text-left text-xs text-muted-foreground hover:text-primary transition-colors py-0.5 px-1 rounded hover:bg-primary/5"
                  data-ocid="calendar.add_button"
                >
                  + Add
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            Team Calendar
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Shared calendar for the next two work weeks
          </p>
        </div>
        <Button
          onClick={() => openModal(workDays[0])}
          className="gap-2"
          data-ocid="calendar.open_modal_button"
        >
          <CalendarPlus className="w-4 h-4" />
          Add Item
        </Button>
      </div>

      {isError && (
        <div
          className="flex items-center gap-3 p-4 rounded-lg border border-destructive/30 bg-destructive/5 text-destructive mb-6"
          data-ocid="calendar.error_state"
        >
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm">Failed to load calendar items.</p>
        </div>
      )}

      {renderWeek(week1, "Week 1")}
      {renderWeek(week2, "Week 2")}

      {/* Upcoming Items List */}
      {(calendarItems ?? []).length > 0 && (
        <Card className="mt-4">
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">
              All Upcoming Items
            </h3>
            <div className="space-y-2">
              {(calendarItems ?? [])
                .slice()
                .sort(
                  (a, b) => Number(a.dateTimestamp) - Number(b.dateTimestamp),
                )
                .map((item, idx) => {
                  const d = new Date(Number(item.dateTimestamp));
                  const opp = (opportunities ?? []).find(
                    (o) => item.opportunityId && o.id === item.opportunityId,
                  );
                  return (
                    <div
                      key={item.id.toString()}
                      className="flex items-center justify-between gap-3 py-2 border-b border-border/40 last:border-0"
                      data-ocid={`calendar.item.${idx + 1}`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-foreground truncate">
                            {item.title}
                          </span>
                          {opp && (
                            <Badge
                              variant="outline"
                              className="text-xs shrink-0"
                            >
                              {opp.name}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="text-xs text-muted-foreground">
                            {MONTH_NAMES[d.getUTCMonth()]} {d.getUTCDate()},{" "}
                            {d.getUTCFullYear()}
                            {item.timeLabel && ` · ${item.timeLabel}`}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            by {item.createdBy}
                          </span>
                        </div>
                        {item.notes && (
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">
                            {item.notes}
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        className="shrink-0 p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                        data-ocid="calendar.delete_button"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Item Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md" data-ocid="calendar.dialog">
          <DialogHeader>
            <DialogTitle className="font-display">
              Add Calendar Item
              {selectedDay && (
                <span className="text-muted-foreground font-normal text-sm ml-2">
                  — {MONTH_NAMES[selectedDay.getMonth()]}{" "}
                  {selectedDay.getDate()}
                </span>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="cal-title">Title *</Label>
              <Input
                id="cal-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Team sync call"
                className="mt-1"
                data-ocid="calendar.input"
              />
            </div>
            <div>
              <Label htmlFor="cal-time">Time (optional)</Label>
              <Input
                id="cal-time"
                value={timeLabel}
                onChange={(e) => setTimeLabel(e.target.value)}
                placeholder="e.g. 2:00 PM"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="cal-notes">Notes (optional)</Label>
              <Textarea
                id="cal-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any additional details..."
                className="mt-1 resize-none"
                rows={3}
                data-ocid="calendar.textarea"
              />
            </div>
            {(opportunities ?? []).length > 0 && (
              <div>
                <Label>Tag Opportunity (optional)</Label>
                <Select value={oppId} onValueChange={setOppId}>
                  <SelectTrigger className="mt-1" data-ocid="calendar.select">
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
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              data-ocid="calendar.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!title.trim() || createItem.isPending}
              data-ocid="calendar.submit_button"
            >
              {createItem.isPending ? "Adding..." : "Add Item"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
