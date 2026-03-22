import { type ReactElement } from "react";
import { useTranslation } from "react-i18next";
import { Badge, BADGE_VARIANT } from "@/components/ui/badge";

type KnownStatus = "active" | "inactive" | "pending" | "suspended";

interface StatusBadgeProps {
  status: boolean | KnownStatus | string;
}

export function StatusBadge({ status }: StatusBadgeProps): ReactElement {
  const { t } = useTranslation();

  if (typeof status === "boolean") {
    return status
      ? <Badge variant={BADGE_VARIANT.SUCCESS} dot>{t("status.active")}</Badge>
      : <Badge variant={BADGE_VARIANT.MUTED}   dot>{t("status.inactive")}</Badge>;
  }

  const normalized = status.toLowerCase() as KnownStatus;

  const variantMap: Record<KnownStatus, typeof BADGE_VARIANT[keyof typeof BADGE_VARIANT]> = {
    active:    BADGE_VARIANT.SUCCESS,
    inactive:  BADGE_VARIANT.MUTED,
    pending:   BADGE_VARIANT.WARNING,
    suspended: BADGE_VARIANT.DANGER,
  };

  const labelKey: Record<KnownStatus, string> = {
    active:    t("status.active"),
    inactive:  t("status.inactive"),
    pending:   t("status.pending"),
    suspended: t("status.suspended"),
  };

  const variant = variantMap[normalized] ?? BADGE_VARIANT.MUTED;
  const label   = labelKey[normalized]   ?? normalized;

  return (
    <Badge variant={variant} dot>
      {label}
    </Badge>
  );
}
