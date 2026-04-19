import { type ReactElement, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { Plus, Users } from "lucide-react";
import { DataTable, type Column } from "@/components/common/data-table";
import { PageHeader } from "@/components/common/page-header";
import { StatusBadge } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import { FilterBar } from "@/components/users/components/filter-bar";
import { UserForm } from "@/components/users/components/user-form";
import { UserActions } from "@/components/users/components/user-actions";
import { useUsers } from "@/hooks/queries/useUsers";
import { useClients } from "@/hooks/queries/useClients";
import { useCreateUser } from "@/hooks/mutations/useUserMutations";
import { ROUTES } from "@/router/routes";
import type { UserStatus } from "@/types/user.types";
import type { User } from "@/types/user.types";
import type { CreateUserFormValues } from "@/schemas/user.schema";

// ─── Component ────────────────────────────────────────────────────────────────

export function UserList(): ReactElement {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Filter state
  const [clientIdFilter, setClientIdFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<UserStatus | "">("");
  const [searchFilter, setSearchFilter] = useState<string>("");

  // Data queries
  const { data: clients = [] } = useClients();
  const { data: users = [], isLoading, isError, refetch } = useUsers(
    clientIdFilter || statusFilter || searchFilter
      ? {
          ...(clientIdFilter && { clientId: clientIdFilter }),
          ...(statusFilter   && { status:   statusFilter }),
          ...(searchFilter   && { search:   searchFilter }),
        }
      : undefined
  );

  // Create user
  const [createOpen, setCreateOpen] = useState<boolean>(false);
  const createMutation = useCreateUser();

  const handleCreate = (values: CreateUserFormValues): void => {
    createMutation.mutate(values, {
      onSuccess: () => setCreateOpen(false),
    });
  };

  const handleRowClick = (user: User): void => {
    const url = user.clientId
      ? `${ROUTES.USER_DETAIL(user.id)}?clientId=${user.clientId}`
      : ROUTES.USER_DETAIL(user.id);
    navigate(url, { state: { user } });
  };

  const columns: Column<User>[] = [
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
    {
      key:    "actions",
      header: "",
      width:  "w-20",
      render: (user) => <UserActions user={user} />,
    },
  ];

  return (
    <>
      <PageHeader
        title={t("users.title")}
        description={t("users.description")}
        action={
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus size={14} strokeWidth={2} />
            {t("users.newUser")}
          </Button>
        }
      />

      <FilterBar
        clientId={clientIdFilter}
        status={statusFilter}
        search={searchFilter}
        onClientChange={setClientIdFilter}
        onStatusChange={setStatusFilter}
        onSearchChange={setSearchFilter}
        clients={clients.map((c) => ({ id: c.id, name: c.name }))}
      />

      <DataTable<User>
        data={users}
        columns={columns}
        keyExtractor={(u) => u.id}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => void refetch()}
        onRowClick={handleRowClick}
        emptyTitle={t("users.noUsers")}
        emptyMessage={t("users.createFirst")}
        emptyIcon={Users}
        emptyAction={
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus size={14} strokeWidth={2} />
            {t("users.newUser")}
          </Button>
        }
      />

      {/* Create user dialog */}
      <UserForm
        mode="create"
        clients={clients}
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreate}
        isLoading={createMutation.isPending}
      />
    </>
  );
}