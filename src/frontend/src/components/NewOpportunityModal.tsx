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

const STAGES = [
  "Prospecting",
  "Qualification",
  "Proposal",
  "Negotiation",
  "Closed Won",
  "Closed Lost",
];

export default function NewOpportunityModal() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [stage, setStage] = useState("Prospecting");
  const [value, setValue] = useState("");
  const [closeDate, setCloseDate] = useState("");
  const [summary, setSummary] = useState("");

  const createOpp = useCreateOpportunity();

  const reset = () => {
    setName("");
    setStage("Prospecting");
    setValue("");
    setCloseDate("");
    setSummary("");
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
      const closeDateMs = BigInt(new Date(closeDate).getTime());
      await createOpp.mutateAsync({
        name: name.trim(),
        stage,
        value: valueNum,
        closeDate: closeDateMs,
        summary: summary.trim(),
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
        <Button data-ocid="dashboard.new_opportunity_button" className="gap-2">
          <Plus className="w-4 h-4" /> New Opportunity
        </Button>
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
              className="mt-1"
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
