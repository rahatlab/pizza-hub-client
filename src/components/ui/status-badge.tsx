import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const TONES: Record<string, "primary" | "secondary" | "tertiary" | "gold" | "neutral"> = {
  pending: "gold",
  placed: "secondary",
  accepted: "primary",
  preparing: "gold",
  out_for_delivery: "tertiary",
  delivered: "tertiary",
  rejected: "primary",
  cancelled: "neutral",
  approved: "tertiary",
  inactive: "neutral",
};

export function StatusBadge({ status }: { status: string }) {
  const label = status.replace(/_/g, " ");
  return <Badge tone={TONES[status] ?? "neutral"}>{label}</Badge>;
}