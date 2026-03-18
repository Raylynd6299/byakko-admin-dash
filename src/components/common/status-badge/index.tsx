import { type ReactElement } from "react";
import { useTranslation } from "react-i18next";
import { Badge, BADGE_VARIANT } from "@/components/ui/badge";

type KnownStatus = "active" | "inactive" | "pending";

interface StatusBadgeProps {
  status: boolean | KnownStatus;
}

export function StatusBadge({ status }: StatusBadgeProps): ReactElement {
  const { t } = useTranslation();

  if (typeof status === "boolean") {
    return status
      ? <Badge variant={BADGE_VARIANT.SUCCESS} dot>{t("status.active")}</Badge>
      : <Badge variant={BADGE_VARIANT.MUTED}   dot>{t("status.inactive")}</Badge>;
  }

  const variantMap: Record<KnownStatus, typeof BADGE_VARIANT[keyof typeof BADGE_VARIANT]> = {
    active:   BADGE_VARIANT.SUCCESS,
    inactive: BADGE_VARIANT.MUTED,
    pending:  BADGE_VARIANT.WARNING,
  };

  const labelKey: Record<KnownStatus, string> = {
    active:   t("status.active"),
    inactive: t("status.inactive"),
    pending:  t("status.pending"),
  };

  return (
    <Badge variant={variantMap[status]} dot>
      {labelKey[status]}
    </Badge>
  );
}
