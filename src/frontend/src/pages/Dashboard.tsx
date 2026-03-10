import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "@tanstack/react-router";
import { AlertCircle, Calendar, TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import NewOpportunityModal from "../components/NewOpportunityModal";
import StageBadge from "../components/StageBadge";
import { useOpportunities } from "../hooks/useQueries";

const STAGES = [
  "All",
  "Prospecting",
  "Qualification",
  "Proposal",
  "Negotiation",
  "Closed Won",
  "Closed Lost",
];

export default function Dashboard() {
  const { data: opportunities, isLoading, isError } = useOpportunities();
  const navigate = useNavigate();
  const [activeStage, setActiveStage] = useState("All");

  const filtered = (opportunities ?? []).filter(
    (o) => activeStage === "All" || o.stage === activeStage,
  );

  const totalValue = (opportunities ?? []).reduce(
    (sum, o) => sum + Number(o.value),
    0,
  );
  const openCount = (opportunities ?? []).filter(
    (o) => o.stage !== "Closed Won" && o.stage !== "Closed Lost",
  ).length;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            Pipeline
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Manage and track your sales opportunities
          </p>
        </div>
        <NewOpportunityModal />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <Card className="shadow-card">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
              Total Pipeline
            </p>
            <p className="text-2xl font-display font-bold text-foreground mt-1">
              {totalValue.toLocaleString("en-US", {
                style: "currency",
                currency: "USD",
                maximumFractionDigits: 0,
              })}
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
              Open Deals
            </p>
            <p className="text-2xl font-display font-bold text-foreground mt-1">
              {openCount}
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-card col-span-2 md:col-span-1">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
              Total Deals
            </p>
            <p className="text-2xl font-display font-bold text-foreground mt-1">
              {(opportunities ?? []).length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Stage filter */}
      <div className="flex gap-1 flex-wrap mb-6" role="tablist">
        {STAGES.map((stage) => (
          <button
            key={stage}
            type="button"
            role="tab"
            data-ocid="dashboard.stage.tab"
            aria-selected={activeStage === stage}
            onClick={() => setActiveStage(stage)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              activeStage === stage
                ? "bg-foreground text-background"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {stage}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          data-ocid="dashboard.loading_state"
        >
          {[1, 2, 3].map((i) => (
            <Card key={i} className="shadow-card">
              <CardContent className="p-5 space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : isError ? (
        <div
          className="flex items-center gap-3 p-4 rounded-lg border border-destructive/30 bg-destructive/5 text-destructive"
          data-ocid="dashboard.error_state"
        >
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm">
            Failed to load opportunities. Please try again.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div
          className="text-center py-16 text-muted-foreground"
          data-ocid="dashboard.empty_state"
        >
          <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No opportunities yet</p>
          <p className="text-sm mt-1">
            Create your first opportunity to get started.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((opp, idx) => (
            <motion.div
              key={opp.id.toString()}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: idx * 0.05 }}
            >
              <Card
                className="shadow-card hover:shadow-md transition-shadow cursor-pointer group"
                data-ocid={`dashboard.opportunity.item.${idx + 1}`}
                onClick={() =>
                  navigate({
                    to: "/opportunity/$id",
                    params: { id: opp.id.toString() },
                  })
                }
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <h3 className="font-display font-semibold text-foreground text-sm leading-tight group-hover:text-primary transition-colors line-clamp-2">
                      {opp.name}
                    </h3>
                    <StageBadge stage={opp.stage} />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-sm">
                      <TrendingUp className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <span className="font-semibold text-foreground">
                        {Number(opp.value).toLocaleString("en-US", {
                          style: "currency",
                          currency: "USD",
                          maximumFractionDigits: 0,
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-3.5 h-3.5 shrink-0" />
                      <span>
                        Closes{" "}
                        {new Date(Number(opp.closeDate)).toLocaleDateString(
                          "en-US",
                          { timeZone: "UTC" },
                        )}
                      </span>
                    </div>
                  </div>
                  {opp.summary && (
                    <p className="text-xs text-muted-foreground mt-3 line-clamp-2">
                      {opp.summary}
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
