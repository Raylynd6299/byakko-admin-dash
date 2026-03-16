import { ReactElement, useState } from "react";
import { Plus, GitBranch } from "lucide-react";
import { DataTable, type Column } from "@/components/common/data-table";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { RelationConditionForm } from "@/components/relation-conditions/components/relation-condition-form";
import { RelationConditionActions } from "@/components/relation-conditions/components/relation-condition-actions";
import { useRelationConditions } from "@/hooks/queries/useRelationConditions";
import { useClients } from "@/hooks/queries/useClients";
import { usePermissions } from "@/hooks/queries/usePermissions";
import { useCreateRelationCondition } from "@/hooks/mutations/useRelationConditionMutations";
import type { RelationCondition } from "@/types/relation-condition.types";
import type { CreateRelationConditionFormValues } from "@/schemas/relation-condition.schema";

// ─── Filter bar ────────────────────────────────────────────────────────────────

interface FilterBarProps {
  clientId:       string;
  onClientChange: (id: string) => void;
  clients:       { id: string; name: string }[];
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

const COLUMNS: Column<RelationCondition>[] = [
  {
    key:    "conditionKey",
    header: "Condition Key",
    render: (cond) => (
      <span className="font-mono text-sm" style={{ color: "var(--text-primary)" }}>
        {cond.conditionKey}
      </span>
    ),
  },
  {
    key:    "permission",
    header: "Permission",
    render: (cond) => (
      <span className="font-mono text-xs" style={{ color: "var(--text-secondary)" }}>
        {cond.permissionId.slice(0, 8)}…
      </span>
    ),
  },
  {
    key:    "description",
    header: "Description",
    render: (cond) =>
      cond.description ? (
        <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
          {cond.description}
        </span>
      ) : (
        <span style={{ color: "var(--text-muted)" }}>—</span>
      ),
  },
  {
    key:    "created",
    header: "Created",
    width:  "w-32",
    render: (cond) => (
      <span className="text-xs" style={{ color: "var(--text-muted)" }}>
        {new Date(cond.createdAt).toLocaleDateString()}
      </span>
    ),
  },
  {
    key:    "status",
    header: "",
    width:  "w-28",
    render: (cond) => <RelationConditionActions condition={cond} />,
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function RelationConditionList(): ReactElement {
  const [clientIdFilter, setClientIdFilter] = useState<string>("");
  const [createOpen, setCreateOpen] = useState<boolean>(false);

  const { data: clients = [] } = useClients();
  const { data: permissions = [] } = usePermissions();
  const {
    data:     conditions = [],
    isLoading,
    isError,
    refetch,
  } = useRelationConditions(
    clientIdFilter ? { clientId: clientIdFilter } : undefined
  );

  const createMutation = useCreateRelationCondition();

  const handleCreate = (values: CreateRelationConditionFormValues): void => {
    createMutation.mutate(values, {
      onSuccess: () => setCreateOpen(false),
    });
  };

  return (
    <>
      <PageHeader
        title="Relation Conditions"
        description="Condition keys that extend permission checks with context."
        action={
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus size={14} strokeWidth={2} />
            New Condition
          </Button>
        }
      />

      <FilterBar
        clientId={clientIdFilter}
        onClientChange={setClientIdFilter}
        clients={clients.map((c) => ({ id: c.id, name: c.name }))}
      />

      <DataTable<RelationCondition>
        data={conditions}
        columns={COLUMNS}
        keyExtractor={(c) => c.id}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => void refetch()}
        emptyTitle="No relation conditions"
        emptyMessage="Create a condition key to extend permission checks."
        emptyIcon={GitBranch}
        emptyAction={
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus size={14} strokeWidth={2} />
            New Condition
          </Button>
        }
      />

      <RelationConditionForm
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        clients={clients}
        permissions={permissions}
        onSubmit={handleCreate}
        isLoading={createMutation.isPending}
      />
    </>
  );
}