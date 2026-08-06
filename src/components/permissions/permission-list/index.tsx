import { type ReactElement, useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { FilterBar } from "@/components/permissions/components/filter-bar";
import { PermissionForm } from "@/components/permissions/components/permission-form";
import { PermissionTreeView } from "@/components/permissions/components/permission-tree-view";
import { usePermissions } from "@/hooks/queries/usePermissions";
import { useClients } from "@/hooks/queries/useClients";
import { useCategories } from "@/hooks/queries/useCategories";
import { useCreatePermission } from "@/hooks/mutations/usePermissionMutations";
import type { CreatePermissionFormValues } from "@/schemas/permission.schema";

// ─── Component ────────────────────────────────────────────────────────────────

export function PermissionList(): ReactElement {
  const { t } = useTranslation();
  const [clientIdFilter, setClientIdFilter] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [createOpen, setCreateOpen] = useState<boolean>(false);

  // Collapse state lives here, lifted above the tree view (A5). Stores
  // COLLAPSED ids so the default (empty set) is "everything expanded" —
  // a category appearing after a refetch needs no bookkeeping entry.
  const [collapsedIds, setCollapsedIds] = useState<ReadonlySet<string>>(new Set());

  const { data: clients = [] } = useClients();
  const { data: categories = [] } = useCategories();
  const { data: permissions = [], isLoading, isError, refetch } = usePermissions();

  const createMutation = useCreatePermission();

  // Filter by client — also narrow categories to the selected client
  const filteredPermissions = clientIdFilter
    ? permissions.filter((p) => p.clientId === clientIdFilter)
    : permissions;

  const filteredCategories = clientIdFilter
    ? categories.filter((c) => c.clientId === clientIdFilter)
    : categories;

  const handleCreate = (values: CreatePermissionFormValues): void => {
    createMutation.mutate(values, {
      onSuccess: () => setCreateOpen(false),
    });
  };

  const handleToggleCollapse = (categoryId: string): void => {
    setCollapsedIds((prev) => {
      // A fresh Set is MANDATORY — useState bails out on Object.is
      // equality, so mutating `prev` in place and returning it would
      // skip the re-render and the chevron would never move.
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

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
        search={search}
        onClientChange={setClientIdFilter}
        onSearchChange={setSearch}
        clients={clients.map((c) => ({ id: c.id, name: c.name }))}
      />

      <PermissionTreeView
        permissions={filteredPermissions}
        categories={filteredCategories}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => void refetch()}
        onCreateClick={() => setCreateOpen(true)}
        query={search}
        onClearQuery={() => setSearch("")}
        collapsedIds={collapsedIds}
        onToggleCollapse={handleToggleCollapse}
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
