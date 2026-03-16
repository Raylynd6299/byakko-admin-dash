import { ReactElement, useState } from "react";
import { Plus, FolderTree } from "lucide-react";
import { DataTable, type Column } from "@/components/common/data-table";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";
import { Button } from "@/components/ui/button";
import { CategoryForm } from "@/components/categories/components/category-form";
import { CategoryActions } from "@/components/categories/components/category-actions";
import { useCategories } from "@/hooks/queries/useCategories";
import { useClients } from "@/hooks/queries/useClients";
import { useCreateCategory } from "@/hooks/mutations/useCategoryMutations";
import type { Category } from "@/types/category.types";
import type { CreateCategoryFormValues } from "@/schemas/category.schema";

// ─── Filter bar ────────────────────────────────────────────────────────────────

interface FilterBarProps {
  clientId:    string;
  onClientChange: (id: string) => void;
  clients:     { id: string; name: string }[];
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

const COLUMNS: Column<Category>[] = [
  {
    key:    "path",
    header: "Path",
    render: (cat) => (
      <span className="font-mono text-xs" style={{ color: "var(--text-secondary)" }}>
        {cat.path}
      </span>
    ),
  },
  {
    key:    "name",
    header: "Name",
    render: (cat) => (
      <span className="font-medium" style={{ color: "var(--text-primary)" }}>
        {cat.name}
      </span>
    ),
  },
  {
    key:    "slug",
    header: "Slug",
    render: (cat) => (
      <span className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>
        {cat.slug}
      </span>
    ),
  },
  {
    key:    "description",
    header: "Description",
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

// ─── Component ────────────────────────────────────────────────────────────────

export function CategoryList(): ReactElement {
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

  return (
    <>
      <PageHeader
        title="Categories"
        description="Permission categories organized in a hierarchy."
        action={
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus size={14} strokeWidth={2} />
            New Category
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
        columns={COLUMNS}
        keyExtractor={(c) => c.id}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => void refetch()}
        emptyTitle="No categories"
        emptyMessage="Create a category to organize permissions."
        emptyIcon={FolderTree}
        emptyAction={
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus size={14} strokeWidth={2} />
            New Category
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