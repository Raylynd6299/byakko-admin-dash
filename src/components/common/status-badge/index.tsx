import { ReactElement } from "react";
import { Badge, BADGE_VARIANT } from "@/components/ui/badge";

const STATUS_LABEL = {
  active:   "Active",
  inactive: "Inactive",
  pending:  "Pending",
} as const;

type KnownStatus = keyof typeof STATUS_LABEL;

interface StatusBadgeProps {
  status: boolean | KnownStatus;
}

export function StatusBadge({ status }: StatusBadgeProps): ReactElement {
  if (typeof status === "boolean") {
    return status
      ? <Badge variant={BADGE_VARIANT.SUCCESS} dot>Active</Badge>
      : <Badge variant={BADGE_VARIANT.MUTED}   dot>Inactive</Badge>;
  }

  const variantMap: Record<KnownStatus, typeof BADGE_VARIANT[keyof typeof BADGE_VARIANT]> = {
    active:   BADGE_VARIANT.SUCCESS,
    inactive: BADGE_VARIANT.MUTED,
    pending:  BADGE_VARIANT.WARNING,
  };

  return (
    <Badge variant={variantMap[status]} dot>
      {STATUS_LABEL[status]}
    </Badge>
  );
}
