import { ReactElement } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, CalendarDays, Globe, Shield, Users } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { StatusBadge } from "@/components/common/status-badge";
import { DataTable, type Column } from "@/components/common/data-table";
import { ErrorState } from "@/components/common/error-state";
import { Button, BUTTON_VARIANT } from "@/components/ui/button";
import { useClient } from "@/hooks/queries/useClients";
import { useUsers } from "@/hooks/queries/useUsers";
import { ROUTES } from "@/router/routes";
import type { User } from "@/types/user.types";

// ─── Users table columns ──────────────────────────────────────────────────────

const USER_COLUMNS: Column<User>[] = [
  {
    key:    "name",
    header: "Name",
    render: (user) => {
      const full = [user.firstName, user.lastName].filter(Boolean).join(" ");
      return (
        <span className="font-medium" style={{ color: "var(--text-primary)" }}>
          {full || <span style={{ color: "var(--text-muted)" }}>—</span>}
        </span>
      );
    },
  },
  {
    key:    "email",
    header: "Email",
    render: (user) => (
      <span className="text-xs font-mono" style={{ color: "var(--text-secondary)" }}>
        {user.email}
      </span>
    ),
  },
  {
    key:    "status",
    header: "Status",
    width:  "w-28",
    render: (user) => <StatusBadge status={user.status} />,
  },
  {
    key:    "created",
    header: "Created",
    width:  "w-36",
    render: (user) => (
      <span className="text-xs" style={{ color: "var(--text-muted)" }}>
        {new Date(user.createdAt).toLocaleDateString()}
      </span>
    ),
  },
];

// ─── Detail field ─────────────────────────────────────────────────────────────

interface DetailFieldProps {
  icon:  React.ReactNode;
  label: string;
  value: React.ReactNode;
}

function DetailField({ icon, label, value }: DetailFieldProps): ReactElement {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5">
        <span style={{ color: "var(--text-muted)" }}>{icon}</span>
        <span
          className="text-xs font-medium uppercase tracking-wide"
          style={{ color: "var(--text-muted)" }}
        >
          {label}
        </span>
      </div>
      <div className="text-sm" style={{ color: "var(--text-secondary)" }}>
        {value}
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ClientDetailPage(): ReactElement {
  const { id = "" }  = useParams<{ id: string }>();
  const navigate      = useNavigate();

  const {
    data:     client,
    isLoading: clientLoading,
    isError:   clientError,
    refetch:   refetchClient,
  } = useClient(id);

  const {
    data:     users        = [],
    isLoading: usersLoading,
    isError:   usersError,
    refetch:   refetchUsers,
  } = useUsers(id ? { clientId: id } : undefined);

  const handleUserClick = (user: User): void => {
    navigate(ROUTES.USER_DETAIL(user.id));
  };

  if (clientError) {
    return <ErrorState message="Could not load client." onRetry={() => void refetchClient()} />;
  }

  return (
    <>
      {/* Back navigation */}
      <div className="mb-1">
        <Button
          variant={BUTTON_VARIANT.GHOST}
          size="sm"
          onClick={() => navigate(ROUTES.CLIENTS)}
          className="-ml-1 mb-2"
        >
          <ArrowLeft size={14} strokeWidth={1.5} />
          All Clients
        </Button>

        <PageHeader
          title={
            clientLoading
              ? "Loading…"
              : (client?.name ?? "Client")
          }
          description={`ID: ${id}`}
          action={client ? <StatusBadge status={client.isActive} /> : undefined}
        />
      </div>

      {/* Metadata card */}
      <div
        className="mb-6 grid grid-cols-1 gap-4 rounded-xl border p-5 sm:grid-cols-2 lg:grid-cols-4"
        style={{
          backgroundColor: "var(--surface-1)",
          borderColor:     "var(--border-default)",
        }}
      >
        <DetailField
          icon={<Shield size={13} strokeWidth={1.5} />}
          label="Status"
          value={client ? <StatusBadge status={client.isActive} /> : "—"}
        />
        <DetailField
          icon={<Globe size={13} strokeWidth={1.5} />}
          label="Webhook URL"
          value={
            clientLoading ? (
              <div
                className="h-4 w-32 animate-pulse rounded"
                style={{ backgroundColor: "var(--surface-3)" }}
              />
            ) : client?.webhookUrl ? (
              <span className="break-all font-mono text-xs">{client.webhookUrl}</span>
            ) : (
              <span style={{ color: "var(--text-muted)" }}>Not configured</span>
            )
          }
        />
        <DetailField
          icon={<CalendarDays size={13} strokeWidth={1.5} />}
          label="Created"
          value={
            clientLoading ? (
              <div
                className="h-4 w-24 animate-pulse rounded"
                style={{ backgroundColor: "var(--surface-3)" }}
              />
            ) : client ? (
              new Date(client.createdAt).toLocaleDateString()
            ) : (
              "—"
            )
          }
        />
        <DetailField
          icon={<CalendarDays size={13} strokeWidth={1.5} />}
          label="Last Updated"
          value={
            clientLoading ? (
              <div
                className="h-4 w-24 animate-pulse rounded"
                style={{ backgroundColor: "var(--surface-3)" }}
              />
            ) : client ? (
              new Date(client.updatedAt).toLocaleDateString()
            ) : (
              "—"
            )
          }
        />
      </div>

      {/* Users section */}
      <div className="mb-3 flex items-center gap-2">
        <Users size={14} strokeWidth={1.5} style={{ color: "var(--text-muted)" }} />
        <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          Users
        </h2>
        {!usersLoading && !usersError && (
          <span
            className="rounded-full px-2 py-0.5 text-xs"
            style={{
              backgroundColor: "var(--surface-3)",
              color:           "var(--text-muted)",
            }}
          >
            {users.length}
          </span>
        )}
      </div>

      <DataTable<User>
        data={users}
        columns={USER_COLUMNS}
        keyExtractor={(u) => u.id}
        isLoading={usersLoading}
        isError={usersError}
        onRetry={() => void refetchUsers()}
        onRowClick={handleUserClick}
        emptyTitle="No users"
        emptyMessage="This client has no registered users yet."
        emptyIcon={Users}
      />
    </>
  );
}
