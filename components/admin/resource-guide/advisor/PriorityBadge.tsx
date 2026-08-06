import type { AdvisorPriority } from "@/lib/services/resources/ai/advisor/types";

const PRIORITY_STYLES: Record<AdvisorPriority, string> = {
  critical: "border-red-200 bg-red-50 text-red-700",
  high: "border-amber-200 bg-amber-50 text-amber-700",
  medium: "border-blue-200 bg-blue-50 text-blue-700",
  low: "border-border bg-bg text-text-muted",
};

export default function PriorityBadge({ priority }: { priority: AdvisorPriority }) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${PRIORITY_STYLES[priority]}`}
    >
      {priority}
    </span>
  );
}
