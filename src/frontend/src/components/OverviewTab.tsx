import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useUser } from "../context/UserContext";
import {
  type Opportunity,
  useAddComment,
  useComments,
  useDeleteComment,
  useUpdateOpportunity,
} from "../hooks/useQueries";

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// ICP Time.now() returns nanoseconds; convert to ms for JS Date
function nanosToMs(ns: bigint): number {
  return Number(ns / 1_000_000n);
}

export default function OverviewTab({
  opportunity,
}: { opportunity: Opportunity }) {
  const { userName } = useUser();
  const [summary, setSummary] = useState(opportunity.summary);
  const [commentText, setCommentText] = useState("");

  const commentsQuery = useComments(opportunity.id);
  const addComment = useAddComment();
  const deleteComment = useDeleteComment();
  const updateOpp = useUpdateOpportunity();

  const handleSaveSummary = async () => {
    try {
      await updateOpp.mutateAsync({
        id: opportunity.id,
        name: opportunity.name,
        stage: opportunity.stage,
        value: opportunity.value,
        closeDate: opportunity.closeDate,
        summary,
      });
      toast.success("Summary saved");
    } catch {
      toast.error("Failed to save summary");
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    const author = userName || "Anonymous";
    try {
      await addComment.mutateAsync({
        opportunityId: opportunity.id,
        authorName: author,
        text: commentText.trim(),
      });
      setCommentText("");
    } catch {
      toast.error("Failed to add comment");
    }
  };

  const handleDeleteComment = async (id: bigint) => {
    try {
      await deleteComment.mutateAsync({ id, opportunityId: opportunity.id });
      toast.success("Comment deleted");
    } catch {
      toast.error("Failed to delete comment");
    }
  };

  const comments = commentsQuery.data ?? [];

  return (
    <div className="space-y-8">
      {/* Summary */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display text-base font-semibold text-foreground">
            Summary
          </h3>
          <Button
            size="sm"
            variant="outline"
            onClick={handleSaveSummary}
            disabled={updateOpp.isPending || summary === opportunity.summary}
            className="gap-2"
          >
            {updateOpp.isPending ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Save className="w-3 h-3" />
            )}
            Save
          </Button>
        </div>
        <Textarea
          data-ocid="overview.summary.textarea"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="Describe this opportunity — key context, goals, and status..."
          rows={5}
          className="resize-none"
        />
      </section>

      <Separator />

      {/* Comments */}
      <section>
        <h3 className="font-display text-base font-semibold text-foreground mb-4">
          Team Comments
        </h3>
        {commentsQuery.isLoading ? (
          <div
            className="flex items-center gap-2 text-muted-foreground text-sm"
            data-ocid="overview.comments.loading_state"
          >
            <Loader2 className="w-4 h-4 animate-spin" /> Loading comments...
          </div>
        ) : comments.length === 0 ? (
          <div
            className="text-center py-8 text-muted-foreground text-sm"
            data-ocid="overview.comments.empty_state"
          >
            No comments yet. Be the first to add one!
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment, idx) => (
              <div
                key={comment.id.toString()}
                className="flex gap-3"
                data-ocid={`overview.comment.item.${idx + 1}`}
              >
                <Avatar className="w-8 h-8 shrink-0">
                  <AvatarFallback className="text-xs bg-primary/10 text-primary">
                    {initials(comment.authorName || "?")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-sm font-semibold text-foreground">
                      {comment.authorName}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {new Date(
                          nanosToMs(comment.createdAt),
                        ).toLocaleDateString()}
                      </span>
                      <button
                        type="button"
                        data-ocid={`overview.comment.delete_button.${idx + 1}`}
                        onClick={() => handleDeleteComment(comment.id)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                        title="Delete comment"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-foreground/80 mt-1 whitespace-pre-wrap">
                    {comment.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add comment */}
        <div className="mt-6 space-y-2">
          <Label htmlFor="new-comment">Add a Comment</Label>
          <div className="flex gap-2">
            <Input
              id="new-comment"
              data-ocid="overview.comment.input"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment..."
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddComment();
              }}
            />
            <Button
              data-ocid="overview.comment.submit_button"
              onClick={handleAddComment}
              disabled={addComment.isPending || !commentText.trim()}
            >
              {addComment.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Post"
              )}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
