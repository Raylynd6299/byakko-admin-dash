import { ReactElement, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Users } from "lucide-react";
import { DataTable, type Column } from "@/components/common/data-table";
import { PageHeader } from "@/components/common/page-header";
import { StatusBadge } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import { ClientForm } from "@/components/clients/components/client-form";
import { ClientActions } from "@/components/clients/components/client-actions";
import { ClientApiKeyDialog } from "@/components/clients/components/client-api-key-dialog";
import { useClients } from "@/hooks/queries/useClients";
import { useCreateClient } from "@/hooks/mutations/useClientMutations";
import { ROUTES } from "@/router/routes";
import type { Client } from "@/types/client.types";
import type { CreateClientFormValues } from "@/schemas/client.schema";

// ─── Table columns ────────────────────────────────────────────────────────────

const COLUMNS: Column<Client>[] = [
  {
    key:    "name",
    header: "Name",
    render: (client) => (
      <span className="font-medium" style={{ color: "var(--text-primary)" }}>
        {client.name}
      </span>
    ),
  },
  {
    key:    "status",
    header: "Status",
    width:  "w-28",
    render: (client) => <StatusBadge status={client.isActive} />,
  },
  {
    key:    "webhook",
    header: "Webhook URL",
    render: (client) =>
      client.webhookUrl ? (
        <span className="text-xs font-mono truncate max-w-xs block" style={{ color: "var(--text-secondary)" }}>
          {client.webhookUrl}
        </span>
      ) : (
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>—</span>
      ),
  },
  {
    key:    "created",
    header: "Created",
    width:  "w-36",
    render: (client) => (
      <span className="text-xs" style={{ color: "var(--text-muted)" }}>
        {new Date(client.createdAt).toLocaleDateString()}
      </span>
    ),
  },
  {
    key:    "actions",
    header: "",
    width:  "w-28",
    render: (client) => <ClientActions client={client} />,
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function ClientList(): ReactElement {
  const navigate = useNavigate();
  const { data: clients = [], isLoading, isError, refetch } = useClients();

  const [createOpen, setCreateOpen]     = useState<boolean>(false);
  const [apiKeyData, setApiKeyData]     = useState<{ clientName: string; apiKey: string } | null>(null);

  const createMutation = useCreateClient();

  const handleCreate = (values: CreateClientFormValues): void => {
    createMutation.mutate(
      {
        name:       values.name,
        webhookUrl: values.webhookUrl || undefined,
        hmacSecret: values.hmacSecret || undefined,
      },
      {
        onSuccess: (result) => {
          setCreateOpen(false);
          setApiKeyData({ clientName: result.client.name, apiKey: result.apiKey });
        },
      }
    );
  };

  const handleRowClick = (client: Client): void => {
    navigate(ROUTES.CLIENT_DETAIL(client.id));
  };

  return (
    <>
      <PageHeader
        title="Clients"
        description="Manage API clients and their access keys."
        action={
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus size={14} strokeWidth={2} />
            New Client
          </Button>
        }
      />

      <DataTable<Client>
        data={clients}
        columns={COLUMNS}
        keyExtractor={(c) => c.id}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => void refetch()}
        onRowClick={handleRowClick}
        emptyTitle="No clients yet"
        emptyMessage="Create your first API client to get started."
        emptyIcon={Users}
        emptyAction={
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus size={14} strokeWidth={2} />
            New Client
          </Button>
        }
      />

      {/* Create dialog */}
      <ClientForm
        mode="create"
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreate}
        isLoading={createMutation.isPending}
      />

      {/* One-shot API key dialog */}
      {apiKeyData && (
        <ClientApiKeyDialog
          open={Boolean(apiKeyData)}
          onClose={() => setApiKeyData(null)}
          clientName={apiKeyData.clientName}
          apiKey={apiKeyData.apiKey}
        />
      )}
    </>
  );
}
