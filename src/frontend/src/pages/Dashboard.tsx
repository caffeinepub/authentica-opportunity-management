import { Card, CardContent } from "@/components/ui/card";
import { CheckSquare, TrendingUp } from "lucide-react";
import NewOpportunityModal from "../components/NewOpportunityModal";
import OpportunityKanban from "../components/OpportunityKanban";
import TodoKanban from "../components/TodoKanban";
import { useOpportunities } from "../hooks/useQueries";

export default function Dashboard() {
  const { data: opportunities } = useOpportunities();

  const totalValue = (opportunities ?? []).reduce(
    (sum, o) => sum + Number(o.value),
    0,
  );
  const openCount = (opportunities ?? []).filter(
    (o) => o.stage !== "Closed Won" && o.stage !== "Closed Lost",
  ).length;

  return (
    <div className="p-6 max-w-full">
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

      {/* Team To-Dos */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <CheckSquare className="w-5 h-5 text-primary" />
          <h2 className="font-display text-xl font-bold text-foreground">
            Team To-Dos
          </h2>
        </div>
        <TodoKanban />
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

      {/* Opportunity Kanban */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h2 className="font-display text-xl font-bold text-foreground">
            Opportunities
          </h2>
        </div>
        <OpportunityKanban />
      </div>
    </div>
  );
}
