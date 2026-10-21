import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STAGE_LABELS: Record<string, string> = {
  new: "New",
  applied: "Applied",
  scheduled: "Discovery scheduled",
  contacted: "Contacted",
  qualified: "Qualified",
  proposal_sent: "Proposal sent",
  won: "Won",
  lost: "Lost",
};

const STAGE_VARIANTS: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  new: "secondary",
  applied: "secondary",
  scheduled: "default",
  contacted: "outline",
  qualified: "default",
  proposal_sent: "default",
  won: "default",
  lost: "destructive",
};

interface StageBadgeProps {
  status: string;
  className?: string;
}

export function StageBadge({ status, className }: StageBadgeProps) {
  const label = STAGE_LABELS[status] || status;
  const variant = STAGE_VARIANTS[status] || "outline";

  return (
    <Badge
      variant={variant}
      className={cn(
        status === "won" && "bg-[var(--color-skool)]/20 text-[var(--color-skool)]",
        status === "scheduled" && "bg-[var(--color-coaching-subtle)] text-[var(--color-coaching)]",
        className
      )}
    >
      {label}
    </Badge>
  );
}

export { STAGE_LABELS };
