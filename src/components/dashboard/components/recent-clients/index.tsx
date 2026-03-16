import { ReactElement } from "react";
import { useNavigate } from "react-router";
import { Building2 } from "lucide-react";
import { DataTable, type Column } from "@/components/common/data-table";
import { StatusBadge } from "@/components/common/status-badge";
import { ROUTES } from "@/router/routes";
import type { Client } from "@/types/client.types";

// ─── Column definitions ───────────────────────────────────────────────────────

const columns: Column<Client>[] = [
  {
    key:    "name",
    header: "Client",
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
    header: "Status",
    align:  "right",
    render: (c: Client): ReactElement => <StatusBadge status={c.isActive} />,
  },
];

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
  const navigate = useNavigate();

  const recent = clients.slice(0, 5);

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
          Recent Clients
        </h2>
        <button
          onClick={(): void => { navigate(ROUTES.CLIENTS); }}
          className="text-xs transition-colors duration-150 hover:underline"
          style={{ color: "var(--accent)" }}
        >
          View all →
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
        emptyTitle="No clients yet"
        emptyMessage="Create your first client to get started."
      />
    </section>
  );
}
