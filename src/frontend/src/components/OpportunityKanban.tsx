import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "@tanstack/react-router";
import { AlertCircle, Calendar, Plus, TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import { useOpportunities } from "../hooks/useQueries";
import NewOpportunityModal from "./NewOpportunityModal";

const STAGES = [
  "Prospecting",
  "Qualification",
  "Proposal",
  "Negotiation",
  "Closed Won",
  "Closed Lost",
] as const;

type Stage = (typeof STAGES)[number];

function getColumnStyle(stage: Stage): string {
  if (stage === "Closed Won") return "bg-emerald-950/30 border-emerald-800/40";
  if (stage === "Closed Lost") return "bg-red-950/20 border-red-900/30";
  return "bg-card/60 border-border";
}

function getHeaderStyle(stage: Stage): string {
  if (stage === "Closed Won") return "text-emerald-400";
  if (stage === "Closed Lost") return "text-red-400";
  return "text-foreground";
}

export default function OpportunityKanban() {
  const { data: opportunities, isLoading, isError } = useOpportunities();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div
        className="flex gap-4 overflow-x-auto pb-4"
        data-ocid="opportunity_kanban.loading_state"
      >
        {STAGES.map((stage) => (
          <div key={stage} className="flex-shrink-0 w-64">
            <Skeleton className="h-8 w-32 mb-3" />
            <div className="space-y-2">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div
        className="flex items-center gap-3 p-4 rounded-lg border border-destructive/30 bg-destructive/5 text-destructive"
        data-ocid="opportunity_kanban.error_state"
      >
        <AlertCircle className="w-5 h-5 shrink-0" />
        <p className="text-sm">
          Failed to load opportunities. Please try again.
        </p>
      </div>
    );
  }

  const opps = opportunities ?? [];

  return (
    <div
      className="flex gap-4 overflow-x-auto pb-4"
      data-ocid="opportunity_kanban.panel"
    >
      {STAGES.map((stage) => {
        const cards = opps
          .filter((o) => o.stage === stage)
          .sort((a, b) => Number(a.closeDate) - Number(b.closeDate));

        return (
          <motion.div
            key={stage}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className={`flex-shrink-0 w-64 rounded-xl border p-3 flex flex-col gap-3 ${getColumnStyle(stage)}`}
            style={{ minWidth: 260 }}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3
                  className={`text-sm font-semibold font-display ${getHeaderStyle(stage)}`}
                >
                  {stage}
                </h3>
                <Badge
                  variant="secondary"
                  className="text-xs h-5 px-1.5 font-mono"
                >
                  {cards.length}
                </Badge>
              </div>
              <NewOpportunityModal
                defaultStage={stage}
                triggerVariant="ghost-icon"
              />
            </div>

            {/* Cards */}
            <div className="flex flex-col gap-2 min-h-[60px] overflow-y-auto max-h-[calc(100vh-380px)]">
              {cards.length === 0 ? (
                <div
                  className="text-center py-6 text-muted-foreground/50"
                  data-ocid={`opportunity_kanban.${stage.toLowerCase().replace(/ /g, "_")}.empty_state`}
                >
                  <p className="text-xs">No opportunities</p>
                </div>
              ) : (
                cards.map((opp, idx) => (
                  <Card
                    key={opp.id.toString()}
                    data-ocid={`opportunity_kanban.item.${idx + 1}`}
                    className="cursor-pointer hover:shadow-md transition-all hover:border-primary/40 group bg-card/80 border-border/60"
                    onClick={() =>
                      navigate({
                        to: "/opportunity/$id",
                        params: { id: opp.id.toString() },
                      })
                    }
                  >
                    <CardContent className="p-3">
                      <p className="font-semibold text-sm text-foreground leading-tight group-hover:text-primary transition-colors line-clamp-2 mb-2">
                        {opp.name}
                      </p>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-xs">
                          <TrendingUp className="w-3 h-3 text-primary shrink-0" />
                          <span className="font-semibold text-primary">
                            {Number(opp.value).toLocaleString("en-US", {
                              style: "currency",
                              currency: "USD",
                              maximumFractionDigits: 0,
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3 shrink-0" />
                          <span>
                            {new Date(Number(opp.closeDate)).toLocaleDateString(
                              "en-US",
                              {
                                timeZone: "UTC",
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              },
                            )}
                          </span>
                        </div>
                      </div>
                      {opp.summary && (
                        <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                          {opp.summary}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
