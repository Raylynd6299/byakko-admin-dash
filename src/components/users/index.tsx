import { ReactElement, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Users } from "lucide-react";
import { DataTable, type Column } from "@/components/common/data-table";
import { PageHeader } from "@/components/common/page-header";
import { StatusBadge } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import { UserForm } from "@/components/users/components/user-form";
import { UserActions } from "@/components/users/components/user-actions";
import { useUsers } from "@/hooks/queries/useUsers";
import { useClients } from "@/hooks/queries/useClients";
import { useCreateUser } from "@/hooks/mutations/useUserMutations";
import { ROUTES } from "@/router/routes";
import { USER_STATUS, type UserStatus } from "@/types/user.types";
import type { User } from "@/types/user.types";
import type { CreateUserFormValues } from "@/schemas/user.schema";

// ─── Status filter ─────────────────────────────────────────────────────────────

const STATUS_OPTIONS: { value: UserStatus | ""; label: string }[] = [
  { value: "",        label: "All statuses" },
  { value: USER_STATUS.ACTIVE,   label: "Active" },
  { value: USER_STATUS.INACTIVE, label: "Inactive" },
  { value: USER_STATUS.PENDING,  label: "Pending" },
];

interface FilterBarProps {
  clientId:    string;
  status:      UserStatus | "";
  onClientChange: (id: string) => void;
  onStatusChange: (s: UserStatus | "") => void;
  clients:     { id: string; name: string }[];
}

function FilterBar({
  clientId,
  status,
  onClientChange,
  onStatusChange,
  clients,
}: FilterBarProps): ReactElement {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-3">
      {/* Client filter */}
      <div className="flex flex-col gap-1">
        <label
          htmlFor="client-filter"
          className="text-xs font-medium"
          style={{ color: "var(--text-muted)" }}
        >
          Client
        </label>
        <select
          id="client-filter"
          value={clientId}
          onChange={(e): void => onClientChange(e.target.value)}
          className="h-8 rounded-md border px-2 text-sm outline-none transition-colors duration-150 focus:border-[var(--border-focus)]"
          style={{
            backgroundColor: "var(--input-bg)",
            borderColor:     "var(--input-border)",
            color:          "var(--text-primary)",
          }}
        >
          <option value="">All clients</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Status filter */}
      <div className="flex flex-col gap-1">
        <label
          htmlFor="status-filter"
          className="text-xs font-medium"
          style={{ color: "var(--text-muted)" }}
        >
          Status
        </label>
        <select
          id="status-filter"
          value={status}
          onChange={(e): void => onStatusChange(e.target.value as UserStatus | "")}
          className="h-8 rounded-md border px-2 text-sm outline-none transition-colors duration-150 focus:border-[var(--border-focus)]"
          style={{
            backgroundColor: "var(--input-bg)",
            borderColor:     "var(--input-border)",
            color:          "var(--text-primary)",
          }}
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

// ─── Table columns ────────────────────────────────────────────────────────────

const COLUMNS: Column<User>[] = [
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
  {
    key:    "actions",
    header: "",
    width:  "w-20",
    render: (user) => <UserActions user={user} />,
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function UserList(): ReactElement {
  const navigate = useNavigate();

  // Filter state
  const [clientIdFilter, setClientIdFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<UserStatus | "">("");

  // Data queries
  const { data: clients = [] } = useClients();
  const { data: users = [], isLoading, isError, refetch } = useUsers(
    clientIdFilter || statusFilter
      ? {
          ...(clientIdFilter && { clientId: clientIdFilter }),
          ...(statusFilter && { status: statusFilter }),
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
    navigate(ROUTES.USER_DETAIL(user.id), { state: { user } });
  };

  return (
    <>
      <PageHeader
        title="Users"
        description="Manage users and their permissions across clients."
        action={
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus size={14} strokeWidth={2} />
            New User
          </Button>
        }
      />

      <FilterBar
        clientId={clientIdFilter}
        status={statusFilter}
        onClientChange={setClientIdFilter}
        onStatusChange={setStatusFilter}
        clients={clients.map((c) => ({ id: c.id, name: c.name }))}
      />

      <DataTable<User>
        data={users}
        columns={COLUMNS}
        keyExtractor={(u) => u.id}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => void refetch()}
        onRowClick={handleRowClick}
        emptyTitle="No users"
        emptyMessage="Create a user to get started. Users are scoped to a client."
        emptyIcon={Users}
        emptyAction={
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus size={14} strokeWidth={2} />
            New User
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