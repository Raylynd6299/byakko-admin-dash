import { type ReactElement } from "react";
import { useTranslation } from "react-i18next";
import { useParams, useNavigate } from "react-router";
import { ArrowLeft, CalendarDays, Globe, Shield, Users } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { StatusBadge } from "@/components/common/status-badge";
import { DataTable, type Column } from "@/components/common/data-table";
import { ErrorState } from "@/components/common/error-state";
import { Button, BUTTON_VARIANT } from "@/components/ui/button";
import { useClient } from "@/hooks/queries/useClients";
import { useUsers } from "@/hooks/queries/useUsers";
import { ROUTES } from "@/router/routes";
import { DetailField } from "./components/detail-field";
import type { User } from "@/types/user.types";

// ─── Component ────────────────────────────────────────────────────────────────

export function ClientDetailPage(): ReactElement {
  const { t } = useTranslation();
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
    const url = user.clientId
      ? `${ROUTES.USER_DETAIL(user.id)}?clientId=${user.clientId}`
      : ROUTES.USER_DETAIL(user.id);
    navigate(url, { state: { user } });
  };

  const USER_COLUMNS: Column<User>[] = [
    {
      key:    "name",
      header: t("users.name"),
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
      header: t("users.email"),
      render: (user) => (
        <span className="text-xs font-mono" style={{ color: "var(--text-secondary)" }}>
          {user.email}
        </span>
      ),
    },
    {
      key:    "status",
      header: t("users.detail.status"),
      width:  "w-28",
      render: (user) => <StatusBadge status={user.status} />,
    },
    {
      key:    "created",
      header: t("users.created"),
      width:  "w-36",
      render: (user) => (
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
          {new Date(user.createdAt).toLocaleDateString()}
        </span>
      ),
    },
  ];

  if (clientError) {
    return <ErrorState message={t("clients.detail.couldNotLoad")} onRetry={() => void refetchClient()} />;
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
          {t("clients.title")}
        </Button>

        <PageHeader
          title={
            clientLoading
              ? t("clients.detail.loading")
              : (client?.name ?? t("clients.client"))
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
          label={t("clients.status")}
          value={client ? <StatusBadge status={client.isActive} /> : "—"}
        />
        <DetailField
          icon={<Globe size={13} strokeWidth={1.5} />}
          label={t("clients.webhookUrl")}
          value={
            clientLoading ? (
              <div
                className="h-4 w-32 animate-pulse rounded"
                style={{ backgroundColor: "var(--surface-3)" }}
              />
            ) : client?.webhookUrl ? (
              <span className="break-all font-mono text-xs">{client.webhookUrl}</span>
            ) : (
              <span style={{ color: "var(--text-muted)" }}>{t("common.notConfigured")}</span>
            )
          }
        />
        <DetailField
          icon={<CalendarDays size={13} strokeWidth={1.5} />}
          label={t("clients.created")}
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
          label={t("clients.lastUpdated")}
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
          {t("clients.detail.usersTab")}
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
        emptyTitle={t("clients.detail.noUsers")}
        emptyMessage={t("clients.detail.noUsersDescription")}
        emptyIcon={Users}
      />
    </>
  );
}
