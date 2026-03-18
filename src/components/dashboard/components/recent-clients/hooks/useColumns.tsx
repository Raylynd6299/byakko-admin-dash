import { type ReactElement } from "react";
import { useTranslation } from "react-i18next";
import { StatusBadge } from "@/components/common/status-badge";
import type { Column } from "@/components/common/data-table";
import type { Client } from "@/types/client.types";

export function useColumns(): Column<Client>[] {
  const { t } = useTranslation();
  return [
    {
      key:    "name",
      header: t("clients.client"),
      render: (c: Client): ReactElement => (
        <span className="font-medium" style={{ color: "var(--text-primary)" }}>
          {c.name}
        </span>
      ),
    },
    {
      key:    "id",
      header: "ID",
      mono:   true,
      render: (c: Client): ReactElement => (
        <span style={{ color: "var(--text-muted)" }}>
          {c.id.slice(0, 8)}…
        </span>
      ),
    },
    {
      key:    "status",
      header: t("clients.status"),
      align:  "right",
      render: (c: Client): ReactElement => <StatusBadge status={c.isActive} />,
    },
  ];
}