import { type ReactElement } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { Building2 } from "lucide-react";
import { DataTable } from "@/components/common/data-table";
import { ROUTES } from "@/router/routes";
import { useColumns } from "./hooks/useColumns";
import type { Client } from "@/types/client.types";

// ─── Props ────────────────────────────────────────────────────────────────────

interface RecentClientsProps {
  clients:    Client[];
  isLoading:  boolean;
  isError:    boolean;
  onRetry:    () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function RecentClients({
  clients,
  isLoading,
  isError,
  onRetry,
}: RecentClientsProps): ReactElement {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const columns = useColumns();

  const recent = clients.slice(0, 5);

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
          {t("dashboard.recentClients")}
        </h2>
        <button
          onClick={(): void => { navigate(ROUTES.CLIENTS); }}
          className="text-xs transition-colors duration-150 hover:underline"
          style={{ color: "var(--accent)" }}
        >
          {t("dashboard.viewAll")}
        </button>
      </div>

      <DataTable<Client>
        data={recent}
        columns={columns}
        keyExtractor={(c: Client): string => c.id}
        isLoading={isLoading}
        isError={isError}
        onRetry={onRetry}
        onRowClick={(c: Client): void => { navigate(ROUTES.CLIENT_DETAIL(c.id)); }}
        emptyIcon={Building2}
        emptyTitle={t("dashboard.noClients")}
        emptyMessage={t("dashboard.createFirstClient")}
      />
    </section>
  );
}
