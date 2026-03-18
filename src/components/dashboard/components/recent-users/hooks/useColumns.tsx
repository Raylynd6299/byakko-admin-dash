import { type ReactElement } from "react";
import { useTranslation } from "react-i18next";
import { StatusBadge } from "@/components/common/status-badge";
import type { Column } from "@/components/common/data-table";
import type { User } from "@/types/user.types";

export function useColumns(): Column<User>[] {
  const { t } = useTranslation();
  return [
    {
      key:    "email",
      header: t("users.detail.user"),
      render: (u: User): ReactElement => (
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
            {u.firstName || u.lastName
              ? `${u.firstName} ${u.lastName}`.trim()
              : <span style={{ color: "var(--text-muted)" }}>—</span>
            }
          </span>
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            {u.email}
          </span>
        </div>
      ),
    },
    {
      key:    "clientId",
      header: "Client ID",
      mono:   true,
      render: (u: User): ReactElement => (
        <span style={{ color: "var(--text-muted)" }}>
          {u.clientId.slice(0, 8)}…
        </span>
      ),
    },
    {
      key:    "status",
      header: t("users.detail.status"),
      align:  "right",
      render: (u: User): ReactElement => <StatusBadge status={u.status} />,
    },
  ];
}