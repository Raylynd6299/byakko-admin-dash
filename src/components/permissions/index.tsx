import { ReactElement, useState } from "react";
import { Plus, Shield } from "lucide-react";
import { DataTable, type Column } from "@/components/common/data-table";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { PermissionForm } from "@/components/permissions/components/permission-form";
import { PermissionActions } from "@/components/permissions/components/permission-actions";
import { usePermissions } from "@/hooks/queries/usePermissions";
import { useClients } from "@/hooks/queries/useClients";
import { useCategories } from "@/hooks/queries/useCategories";
import { useCreatePermission } from "@/hooks/mutations/usePermissionMutations";
import type { Permission } from "@/types/permission.types";
import type { CreatePermissionFormValues } from "@/schemas/permission.schema";

// ─── Filter bar ────────────────────────────────────────────────────────────────

interface FilterBarProps {
  clientId:       string;
  onClientChange: (id: string) => void;
  clients:        { id: string; name: string }[];
}

function FilterBar({ clientId, onClientChange, clients }: FilterBarProps): ReactElement {
  return (
    <div className="mb-4 flex flex-col gap-1.5">
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
        className="h-8 w-48 rounded-md border px-2 text-sm outline-none transition-colors duration-150 focus:border-[var(--border-focus)]"
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
  );
}

// ─── Table columns ────────────────────────────────────────────────────────────

const COLUMNS: Column<Permission>[] = [
  {
    key:    "action",
    header: "Action",
    render: (perm) => (
      <span className="font-mono text-sm" style={{ color: "var(--text-primary)" }}>
        {perm.action}
      </span>
    ),
  },
  {
    key:    "description",
    header: "Description",
    render: (perm) =>
      perm.description ? (
        <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
          {perm.description}
        </span>
      ) : (
        <span style={{ color: "var(--text-muted)" }}>—</span>
      ),
  },
  {
    key:    "actions",
    header: "",
    width:  "w-16",
    render: (perm) => <PermissionActions permission={perm} />,
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function PermissionList(): ReactElement {
  const [clientIdFilter, setClientIdFilter] = useState<string>("");
  const [createOpen, setCreateOpen] = useState<boolean>(false);

  const { data: clients = [] } = useClients();
  const { data: categories = [] } = useCategories();
  const { data: permissions = [], isLoading, isError, refetch } = usePermissions();

  const createMutation = useCreatePermission();

  // Filter by client
  const filteredPermissions = clientIdFilter
    ? permissions.filter((p) => p.clientId === clientIdFilter)
    : permissions;

  const handleCreate = (values: CreatePermissionFormValues): void => {
    createMutation.mutate(values, {
      onSuccess: () => setCreateOpen(false),
    });
  };

  return (
    <>
      <PageHeader
        title="Permissions"
        description="Manage permission actions for clients and categories."
        action={
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus size={14} strokeWidth={2} />
            New Permission
          </Button>
        }
      />

      <FilterBar
        clientId={clientIdFilter}
        onClientChange={setClientIdFilter}
        clients={clients.map((c) => ({ id: c.id, name: c.name }))}
      />

      <DataTable<Permission>
        data={filteredPermissions}
        columns={COLUMNS}
        keyExtractor={(p) => p.id}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => void refetch()}
        emptyTitle="No permissions"
        emptyMessage="Create a permission to define actions for users."
        emptyIcon={Shield}
        emptyAction={
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus size={14} strokeWidth={2} />
            New Permission
          </Button>
        }
      />

      <PermissionForm
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        clients={clients}
        categories={categories}
        onSubmit={handleCreate}
        isLoading={createMutation.isPending}
      />
    </>
  );
}