import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useCreateOpportunity } from "../hooks/useQueries";
import HelpTypeSelector from "./HelpTypeSelector";

const STAGES = [
  "Prospecting",
  "Qualification",
  "Proposal",
  "Negotiation",
  "Closed Won",
  "Closed Lost",
];

interface Props {
  defaultStage?: string;
  /** "default" shows the full "New Opportunity" button; "ghost-icon" shows a small + icon button */
  triggerVariant?: "default" | "ghost-icon";
}

export default function NewOpportunityModal({
  defaultStage = "Prospecting",
  triggerVariant = "default",
}: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [stage, setStage] = useState(defaultStage);
  const [value, setValue] = useState("");
  const [closeDate, setCloseDate] = useState("");
  const [summary, setSummary] = useState("");
  const [helpTypes, setHelpTypes] = useState<Array<string>>([]);

  const createOpp = useCreateOpportunity();

  const reset = () => {
    setName("");
    setStage(defaultStage);
    setValue("");
    setCloseDate("");
    setSummary("");
    setHelpTypes([]);
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (!closeDate) {
      toast.error("Close date is required");
      return;
    }
    try {
      const valueNum = value
        ? BigInt(Math.round(Number.parseFloat(value)))
        : BigInt(0);
      const closeDateMs = BigInt(new Date(`${closeDate}T00:00:00Z`).getTime());
      await createOpp.mutateAsync({
        name: name.trim(),
        stage,
        value: valueNum,
        closeDate: closeDateMs,
        summary: summary.trim(),
        helpTypes,
      });
      toast.success("Opportunity created");
      setOpen(false);
      reset();
    } catch {
      toast.error("Failed to create opportunity");
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) reset();
      }}
    >
      <DialogTrigger asChild>
        {triggerVariant === "ghost-icon" ? (
          <button
            type="button"
            data-ocid="opportunity_kanban.add_opportunity.open_modal_button"
            className="w-6 h-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        ) : (
          <Button
            data-ocid="dashboard.new_opportunity_button"
            className="gap-2"
          >
            <Plus className="w-4 h-4" /> New Opportunity
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display">New Opportunity</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <Label htmlFor="opp-name">Opportunity Name *</Label>
            <Input
              id="opp-name"
              data-ocid="new_opportunity.name.input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Acme Corp Enterprise Deal"
              className="mt-1"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="opp-stage">Stage</Label>
              <Select value={stage} onValueChange={setStage}>
                <SelectTrigger
                  id="opp-stage"
                  data-ocid="new_opportunity.stage.select"
                  className="mt-1"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STAGES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="opp-value">Value ($)</Label>
              <Input
                id="opp-value"
                data-ocid="new_opportunity.value.input"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="50000"
                type="number"
                min="0"
                className="mt-1"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="opp-close-date">Close Date *</Label>
            <Input
              id="opp-close-date"
              data-ocid="new_opportunity.close_date.input"
              value={closeDate}
              onChange={(e) => setCloseDate(e.target.value)}
              type="date"
              className="mt-1 [color-scheme:dark]"
            />
          </div>
          <div>
            <Label htmlFor="opp-summary">Summary</Label>
            <Textarea
              id="opp-summary"
              data-ocid="new_opportunity.summary.textarea"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Brief description of this opportunity..."
              rows={3}
              className="mt-1"
            />
          </div>
          <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
            <HelpTypeSelector
              label="Type of Help"
              value={helpTypes}
              onChange={setHelpTypes}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            data-ocid="new_opportunity.submit_button"
            onClick={handleSubmit}
            disabled={createOpp.isPending}
          >
            {createOpp.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Opportunity"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
