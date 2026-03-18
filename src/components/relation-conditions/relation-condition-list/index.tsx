import { type ReactElement, useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus, GitBranch } from "lucide-react";
import { DataTable, type Column } from "@/components/common/data-table";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { FilterBar } from "@/components/relation-conditions/components/filter-bar";
import { RelationConditionForm } from "@/components/relation-conditions/components/relation-condition-form";
import { RelationConditionActions } from "@/components/relation-conditions/components/relation-condition-actions";
import { useRelationConditions } from "@/hooks/queries/useRelationConditions";
import { useClients } from "@/hooks/queries/useClients";
import { usePermissions } from "@/hooks/queries/usePermissions";
import { useCreateRelationCondition } from "@/hooks/mutations/useRelationConditionMutations";
import type { RelationCondition } from "@/types/relation-condition.types";
import type { CreateRelationConditionFormValues } from "@/schemas/relation-condition.schema";

// ─── Component ────────────────────────────────────────────────────────────────

export function RelationConditionList(): ReactElement {
  const { t } = useTranslation();
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

  const columns: Column<RelationCondition>[] = [
    {
      key:    "conditionKey",
      header: t("relationConditions.conditionKey"),
      render: (cond) => (
        <span className="font-mono text-sm" style={{ color: "var(--text-primary)" }}>
          {cond.conditionKey}
        </span>
      ),
    },
    {
      key:    "permission",
      header: t("relationConditions.permission"),
      render: (cond) => (
        <span className="font-mono text-xs" style={{ color: "var(--text-secondary)" }}>
          {cond.permissionId.slice(0, 8)}…
        </span>
      ),
    },
    {
      key:    "description",
      header: t("relationConditions.description"),
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
      header: t("relationConditions.created"),
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

  return (
    <>
      <PageHeader
        title={t("relationConditions.title")}
        description={t("relationConditions.description")}
        action={
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus size={14} strokeWidth={2} />
            {t("relationConditions.newCondition")}
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
        columns={columns}
        keyExtractor={(c) => c.id}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => void refetch()}
        emptyTitle={t("relationConditions.noConditions")}
        emptyMessage={t("relationConditions.createFirst")}
        emptyIcon={GitBranch}
        emptyAction={
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus size={14} strokeWidth={2} />
            {t("relationConditions.newCondition")}
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