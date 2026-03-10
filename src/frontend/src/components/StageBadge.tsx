import { Badge } from "@/components/ui/badge";

const STAGE_STYLES: Record<string, string> = {
  Prospecting: "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100",
  Qualification:
    "bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100",
  Proposal:
    "bg-violet-100 text-violet-700 border-violet-200 hover:bg-violet-100",
  Negotiation:
    "bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-100",
  "Closed Won":
    "bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100",
  "Closed Lost":
    "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-100",
};

export default function StageBadge({ stage }: { stage: string }) {
  const styles =
    STAGE_STYLES[stage] ??
    "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-100";
  return (
    <Badge variant="outline" className={`text-xs font-medium ${styles}`}>
      {stage}
    </Badge>
  );
}
