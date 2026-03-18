import { type ReactElement, useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Shield } from "lucide-react";
import { DataTable, type Column } from "@/components/common/data-table";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { FilterBar } from "@/components/permissions/components/filter-bar";
import { PermissionForm } from "@/components/permissions/components/permission-form";
import { PermissionActions } from "@/components/permissions/components/permission-actions";
import { usePermissions } from "@/hooks/queries/usePermissions";
import { useClients } from "@/hooks/queries/useClients";
import { useCategories } from "@/hooks/queries/useCategories";
import { useCreatePermission } from "@/hooks/mutations/usePermissionMutations";
import type { Permission } from "@/types/permission.types";
import type { CreatePermissionFormValues } from "@/schemas/permission.schema";

// ─── Component ────────────────────────────────────────────────────────────────

export function PermissionList(): ReactElement {
  const { t } = useTranslation();
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

  const columns: Column<Permission>[] = [
    {
      key:    "action",
      header: t("permissions.action"),
      render: (perm) => (
        <span className="font-mono text-sm" style={{ color: "var(--text-primary)" }}>
          {perm.action}
        </span>
      ),
    },
    {
      key:    "description",
      header: t("permissions.description"),
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

  return (
    <>
      <PageHeader
        title={t("permissions.title")}
        description={t("permissions.description")}
        action={
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus size={14} strokeWidth={2} />
            {t("permissions.newPermission")}
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
        columns={columns}
        keyExtractor={(p) => p.id}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => void refetch()}
        emptyTitle={t("permissions.noPermissions")}
        emptyMessage={t("permissions.createFirst")}
        emptyIcon={Shield}
        emptyAction={
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus size={14} strokeWidth={2} />
            {t("permissions.newPermission")}
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