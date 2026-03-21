/**
 * Reusable component to display help type badges on Kanban cards and elsewhere.
 */

const HELP_TYPE_STYLES: Record<string, string> = {
  "User Growth/Marketing":
    "bg-amber-950/60 text-amber-300 border border-amber-700/40",
  "Product Development":
    "bg-blue-950/60 text-blue-300 border border-blue-700/40",
  Capital: "bg-emerald-950/60 text-emerald-300 border border-emerald-700/40",
};

interface Props {
  helpTypes: Array<string>;
  size?: "sm" | "xs";
}

export default function HelpTypeBadges({ helpTypes, size = "sm" }: Props) {
  if (!helpTypes || helpTypes.length === 0) return null;

  const textClass = size === "xs" ? "text-[10px]" : "text-xs";
  const paddingClass = size === "xs" ? "px-1 py-0" : "px-1.5 py-0.5";

  return (
    <div className="flex flex-wrap gap-1">
      {helpTypes.map((ht) => (
        <span
          key={ht}
          className={`inline-flex items-center rounded font-medium leading-tight ${textClass} ${paddingClass} ${
            HELP_TYPE_STYLES[ht] ??
            "bg-muted text-muted-foreground border border-border"
          }`}
        >
          {ht}
        </span>
      ))}
    </div>
  );
}
