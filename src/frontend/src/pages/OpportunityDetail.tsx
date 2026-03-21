import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
  AlertCircle,
  Calendar,
  ChevronLeft,
  Edit2,
  Loader2,
  Trash2,
  TrendingUp,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import ContactsTab from "../components/ContactsTab";
import FilesTab from "../components/FilesTab";
import HelpTypeSelector from "../components/HelpTypeSelector";
import OverviewTab from "../components/OverviewTab";
import StageBadge from "../components/StageBadge";
import {
  useDeleteOpportunity,
  useOpportunity,
  useUpdateOpportunity,
} from "../hooks/useQueries";

const STAGES = [
  "Prospecting",
  "Qualification",
  "Proposal",
  "Negotiation",
  "Closed Won",
  "Closed Lost",
];

export default function OpportunityDetail() {
  const { id } = useParams({ from: "/opportunity/$id" });
  const navigate = useNavigate();
  const opportunityId = BigInt(id);

  const {
    data: opportunity,
    isLoading,
    isError,
  } = useOpportunity(opportunityId);
  const updateOpp = useUpdateOpportunity();
  const deleteOpp = useDeleteOpportunity();

  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editStage, setEditStage] = useState("");
  const [editValue, setEditValue] = useState("");
  const [editCloseDate, setEditCloseDate] = useState("");
  const [editSummary, setEditSummary] = useState("");
  const [editHelpTypes, setEditHelpTypes] = useState<Array<string>>([]);

  const openEdit = () => {
    if (!opportunity) return;
    setEditName(opportunity.name);
    setEditStage(opportunity.stage);
    setEditValue(Number(opportunity.value).toString());
    // Extract date in UTC to avoid timezone shifting the displayed value
    setEditCloseDate(
      new Date(Number(opportunity.closeDate)).toISOString().split("T")[0],
    );
    setEditSummary(opportunity.summary);
    setEditHelpTypes(opportunity.helpTypes ?? []);
    setEditOpen(true);
  };

  const handleUpdate = async () => {
    if (!opportunity || !editName.trim()) {
      toast.error("Name is required");
      return;
    }
    if (!editCloseDate) {
      toast.error("Close date is required");
      return;
    }
    try {
      const valueNum = editValue
        ? BigInt(Math.round(Number.parseFloat(editValue)))
        : BigInt(0);
      // Parse date as UTC midnight to match how it was originally stored
      const closeDateMs = BigInt(
        new Date(`${editCloseDate}T00:00:00Z`).getTime(),
      );
      await updateOpp.mutateAsync({
        id: opportunity.id,
        name: editName.trim(),
        stage: editStage,
        value: valueNum,
        closeDate: closeDateMs,
        summary: editSummary.trim(),
        helpTypes: editHelpTypes,
      });
      toast.success("Opportunity updated");
      setEditOpen(false);
    } catch {
      toast.error("Failed to update opportunity");
    }
  };

  const handleDelete = async () => {
    if (!opportunity) return;
    try {
      await deleteOpp.mutateAsync(opportunity.id);
      toast.success("Opportunity deleted");
      navigate({ to: "/" });
    } catch {
      toast.error("Failed to delete opportunity");
    }
  };

  if (isLoading) {
    return (
      <div
        className="p-6 max-w-5xl mx-auto"
        data-ocid="opportunity.loading_state"
      >
        <Skeleton className="h-8 w-64 mb-4" />
        <Skeleton className="h-5 w-40 mb-8" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (isError || !opportunity) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <div
          className="flex items-center gap-3 p-4 rounded-lg border border-destructive/30 bg-destructive/5 text-destructive"
          data-ocid="opportunity.error_state"
        >
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm">Opportunity not found or failed to load.</p>
        </div>
        <Button
          variant="ghost"
          className="mt-4 gap-2"
          onClick={() => navigate({ to: "/" })}
        >
          <ChevronLeft className="w-4 h-4" /> Back to Pipeline
        </Button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="p-6 max-w-5xl mx-auto"
    >
      {/* Breadcrumb */}
      <button
        type="button"
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        onClick={() => navigate({ to: "/" })}
      >
        <ChevronLeft className="w-4 h-4" /> Pipeline
      </button>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="font-display text-2xl font-bold text-foreground">
              {opportunity.name}
            </h1>
            <StageBadge stage={opportunity.stage} />
          </div>
          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              {Number(opportunity.value).toLocaleString("en-US", {
                style: "currency",
                currency: "USD",
                maximumFractionDigits: 0,
              })}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              Closes{" "}
              {new Date(Number(opportunity.closeDate)).toLocaleDateString(
                "en-US",
                { timeZone: "UTC" },
              )}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            data-ocid="opportunity.edit_button"
            onClick={openEdit}
            className="gap-2"
          >
            <Edit2 className="w-3.5 h-3.5" /> Edit
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                data-ocid="opportunity.delete_button"
                className="gap-2 text-destructive hover:text-destructive border-destructive/30 hover:bg-destructive/5"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="font-display">
                  Delete Opportunity?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete &quot;{opportunity.name}&quot;
                  and all associated data. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel data-ocid="opportunity.delete.cancel_button">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  data-ocid="opportunity.delete.confirm_button"
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  disabled={deleteOpp.isPending}
                >
                  {deleteOpp.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    "Delete"
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList className="mb-6">
          <TabsTrigger value="overview" data-ocid="opportunity.tab">
            Overview
          </TabsTrigger>
          <TabsTrigger value="files" data-ocid="opportunity.tab">
            Files
          </TabsTrigger>
          <TabsTrigger value="contacts" data-ocid="opportunity.tab">
            Contacts
          </TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <OverviewTab opportunity={opportunity} />
        </TabsContent>
        <TabsContent value="files">
          <FilesTab opportunityId={opportunity.id} />
        </TabsContent>
        <TabsContent value="contacts">
          <ContactsTab opportunityId={opportunity.id} />
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">Edit Opportunity</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="edit-name">Name *</Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="edit-stage">Stage</Label>
                <Select value={editStage} onValueChange={setEditStage}>
                  <SelectTrigger id="edit-stage" className="mt-1">
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
                <Label htmlFor="edit-value">Value ($)</Label>
                <Input
                  id="edit-value"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  type="number"
                  min="0"
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-close-date">Close Date *</Label>
              <Input
                id="edit-close-date"
                value={editCloseDate}
                onChange={(e) => setEditCloseDate(e.target.value)}
                type="date"
                className="mt-1 [color-scheme:dark]"
              />
            </div>
            <div>
              <Label htmlFor="edit-summary">Summary</Label>
              <Textarea
                id="edit-summary"
                value={editSummary}
                onChange={(e) => setEditSummary(e.target.value)}
                rows={3}
                className="mt-1"
              />
            </div>
            <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
              <HelpTypeSelector
                label="Type of Help"
                value={editHelpTypes}
                onChange={setEditHelpTypes}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={updateOpp.isPending}>
              {updateOpp.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
