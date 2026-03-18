import { type ReactElement, useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus, FolderTree } from "lucide-react";
import { DataTable, type Column } from "@/components/common/data-table";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { FilterBar } from "@/components/categories/components/filter-bar";
import { CategoryForm } from "@/components/categories/components/category-form";
import { CategoryActions } from "@/components/categories/components/category-actions";
import { useCategories } from "@/hooks/queries/useCategories";
import { useClients } from "@/hooks/queries/useClients";
import { useCreateCategory } from "@/hooks/mutations/useCategoryMutations";
import type { Category } from "@/types/category.types";
import type { CreateCategoryFormValues } from "@/schemas/category.schema";

// ─── Component ────────────────────────────────────────────────────────────────

export function CategoryList(): ReactElement {
  const { t } = useTranslation();
  const [clientIdFilter, setClientIdFilter] = useState<string>("");
  const [createOpen, setCreateOpen] = useState<boolean>(false);

  const { data: clients = [] } = useClients();
  const { data: categories = [], isLoading, isError, refetch } = useCategories();

  const createMutation = useCreateCategory();

  // Filter by client
  const filteredCategories = clientIdFilter
    ? categories.filter((c) => c.clientId === clientIdFilter)
    : categories;

  const handleCreate = (values: CreateCategoryFormValues): void => {
    createMutation.mutate(values, {
      onSuccess: () => setCreateOpen(false),
    });
  };

  const columns: Column<Category>[] = [
    {
      key:    "path",
      header: t("categories.path"),
      render: (cat) => (
        <span className="font-mono text-xs" style={{ color: "var(--text-secondary)" }}>
          {cat.path}
        </span>
      ),
    },
    {
      key:    "name",
      header: t("categories.name"),
      render: (cat) => (
        <span className="font-medium" style={{ color: "var(--text-primary)" }}>
          {cat.name}
        </span>
      ),
    },
    {
      key:    "slug",
      header: t("categories.slug"),
      render: (cat) => (
        <span className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>
          {cat.slug}
        </span>
      ),
    },
    {
      key:    "description",
      header: t("categories.description"),
      render: (cat) =>
        cat.description ? (
          <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
            {cat.description}
          </span>
        ) : (
          <span style={{ color: "var(--text-muted)" }}>—</span>
        ),
    },
    {
      key:    "actions",
      header: "",
      width:  "w-16",
      render: (cat) => <CategoryActions category={cat} />,
    },
  ];

  return (
    <>
      <PageHeader
        title={t("categories.title")}
        description={t("categories.description")}
        action={
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus size={14} strokeWidth={2} />
            {t("categories.newCategory")}
          </Button>
        }
      />

      <FilterBar
        clientId={clientIdFilter}
        onClientChange={setClientIdFilter}
        clients={clients.map((c) => ({ id: c.id, name: c.name }))}
      />

      <DataTable<Category>
        data={filteredCategories}
        columns={columns}
        keyExtractor={(c) => c.id}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => void refetch()}
        emptyTitle={t("categories.noCategories")}
        emptyMessage={t("categories.createFirst")}
        emptyIcon={FolderTree}
        emptyAction={
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus size={14} strokeWidth={2} />
            {t("categories.newCategory")}
          </Button>
        }
      />

      <CategoryForm
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