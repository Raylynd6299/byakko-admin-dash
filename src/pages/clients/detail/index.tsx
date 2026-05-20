import { type ReactElement, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams, useNavigate } from "react-router";
import { ArrowLeft, CalendarDays, Check, Copy, Eye, EyeOff, Globe, KeyRound, Lock, Shield, Users } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { StatusBadge } from "@/components/common/status-badge";
import { DataTable, type Column } from "@/components/common/data-table";
import { ErrorState } from "@/components/common/error-state";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { Button, BUTTON_VARIANT } from "@/components/ui/button";
import { ClientApiKeyDialog } from "@/components/clients/components/client-api-key-dialog";
import { useClient } from "@/hooks/queries/useClients";
import { useUsers } from "@/hooks/queries/useUsers";
import { useRegenerateApiKey } from "@/hooks/mutations/useClientMutations";
import { ROUTES } from "@/router/routes";
import { DetailField } from "./components/detail-field";
import type { User } from "@/types/user.types";

// ─── Component ────────────────────────────────────────────────────────────────

export function ClientDetailPage(): ReactElement {
  const { t } = useTranslation();
  const { id = "" }  = useParams<{ id: string }>();
  const navigate      = useNavigate();

  // ── HMAC reveal / copy state ──
  const [hmacRevealed, setHmacRevealed]           = useState<boolean>(false);
  const [hmacCopied,   setHmacCopied]             = useState<boolean>(false);

  // ── Regenerate flow state ──
  const [confirmOpen,     setConfirmOpen]          = useState<boolean>(false);
  const [newApiKeyData,   setNewApiKeyData]        = useState<string | null>(null);
  const [regenerateError, setRegenerateError]      = useState<string | null>(null);

  const regenerateMutation = useRegenerateApiKey();

  const {
    data:     client,
    isLoading: clientLoading,
    isError:   clientError,
    refetch:   refetchClient,
  } = useClient(id);

  const {
    data:     users        = [],
    isLoading: usersLoading,
    isError:   usersError,
    refetch:   refetchUsers,
  } = useUsers(id ? { clientId: id } : undefined);

  const handleHmacCopy = (): void => {
    if (!client?.hmacSecret) return;
    void navigator.clipboard.writeText(client.hmacSecret).then(() => {
      setHmacCopied(true);
      setTimeout(() => setHmacCopied(false), 2000);
    });
  };

  const handleRegenerateConfirm = (): void => {
    setRegenerateError(null);
    regenerateMutation.mutate(id, {
      onSuccess: (result) => {
        setConfirmOpen(false);
        setNewApiKeyData(result.apiKey);
      },
      onError: () => {
        setConfirmOpen(false);
        setRegenerateError(t("clients.detail.regenerateError"));
      },
    });
  };

  const handleUserClick = (user: User): void => {
    const url = user.clientId
      ? `${ROUTES.USER_DETAIL(user.id)}?clientId=${user.clientId}`
      : ROUTES.USER_DETAIL(user.id);
    navigate(url, { state: { user } });
  };

  const USER_COLUMNS: Column<User>[] = [
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
  ];

  if (clientError) {
    return <ErrorState message={t("clients.detail.couldNotLoad")} onRetry={() => void refetchClient()} />;
  }

  return (
    <>
      {/* Back navigation */}
      <div className="mb-1">
        <Button
          variant={BUTTON_VARIANT.GHOST}
          size="sm"
          onClick={() => navigate(ROUTES.CLIENTS)}
          className="-ml-1 mb-2"
        >
          <ArrowLeft size={14} strokeWidth={1.5} />
          {t("clients.title")}
        </Button>

        <PageHeader
          title={
            clientLoading
              ? t("clients.detail.loading")
              : (client?.name ?? t("clients.client"))
          }
          description={`ID: ${id}`}
          action={client ? <StatusBadge status={client.isActive} /> : undefined}
        />
      </div>

      {/* Metadata card */}
      <div
        className="mb-4 rounded-xl border p-5"
        style={{
          backgroundColor: "var(--surface-1)",
          borderColor:     "var(--border-default)",
        }}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <DetailField
            icon={<Shield size={13} strokeWidth={1.5} />}
            label={t("clients.status")}
            value={client ? <StatusBadge status={client.isActive} /> : "—"}
          />
          <DetailField
            icon={<Globe size={13} strokeWidth={1.5} />}
            label={t("clients.webhookUrl")}
            value={
              clientLoading ? (
                <div
                  className="h-4 w-32 animate-pulse rounded"
                  style={{ backgroundColor: "var(--surface-3)" }}
                />
              ) : client?.webhookUrl ? (
                <span className="break-all font-mono text-xs">{client.webhookUrl}</span>
              ) : (
                <span style={{ color: "var(--text-muted)" }}>{t("common.notConfigured")}</span>
              )
            }
          />
          <DetailField
            icon={<CalendarDays size={13} strokeWidth={1.5} />}
            label={t("clients.created")}
            value={
              clientLoading ? (
                <div
                  className="h-4 w-24 animate-pulse rounded"
                  style={{ backgroundColor: "var(--surface-3)" }}
                />
              ) : client ? (
                new Date(client.createdAt).toLocaleDateString()
              ) : (
                "—"
              )
            }
          />
          <DetailField
            icon={<CalendarDays size={13} strokeWidth={1.5} />}
            label={t("clients.lastUpdated")}
            value={
              clientLoading ? (
                <div
                  className="h-4 w-24 animate-pulse rounded"
                  style={{ backgroundColor: "var(--surface-3)" }}
                />
              ) : client ? (
                new Date(client.updatedAt).toLocaleDateString()
              ) : (
                "—"
              )
            }
          />
        </div>

        {/* Credentials row */}
        <div
          className="mt-4 border-t pt-4"
          style={{ borderColor: "var(--border-subtle)" }}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            {/* HMAC secret field */}
            <DetailField
              icon={<Lock size={13} strokeWidth={1.5} />}
              label={t("clients.detail.hmacSecret")}
              value={
                clientLoading ? (
                  <div
                    className="h-4 w-40 animate-pulse rounded"
                    style={{ backgroundColor: "var(--surface-3)" }}
                  />
                ) : client?.hmacSecret ? (
                  <div className="flex items-center gap-1.5">
                    <code
                      className="text-xs font-mono"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {hmacRevealed ? client.hmacSecret : "••••••••••••••••"}
                    </code>
                    {/* Reveal/hide toggle */}
                    <button
                      onClick={() => setHmacRevealed((v) => !v)}
                      className="flex h-6 w-6 items-center justify-center rounded-md transition-colors duration-150 hover:bg-[var(--surface-3)]"
                      style={{ color: "var(--text-muted)" }}
                      aria-label={hmacRevealed ? t("clients.detail.hmacSecretHide") : t("clients.detail.hmacSecretReveal")}
                      title={hmacRevealed ? t("clients.detail.hmacSecretHide") : t("clients.detail.hmacSecretReveal")}
                    >
                      {hmacRevealed ? (
                        <EyeOff size={13} strokeWidth={1.5} />
                      ) : (
                        <Eye size={13} strokeWidth={1.5} />
                      )}
                    </button>
                    {/* Copy button */}
                    <button
                      onClick={handleHmacCopy}
                      className="flex h-6 w-6 items-center justify-center rounded-md transition-colors duration-150 hover:bg-[var(--surface-3)]"
                      style={{ color: hmacCopied ? "var(--success-fg)" : "var(--text-muted)" }}
                      aria-label={t("clients.create.copyApiKey")}
                    >
                      {hmacCopied ? (
                        <Check size={13} strokeWidth={2} />
                      ) : (
                        <Copy size={13} strokeWidth={1.5} />
                      )}
                    </button>
                  </div>
                ) : (
                  <span style={{ color: "var(--text-muted)" }}>
                    {t("clients.detail.notConfigured")}
                  </span>
                )
              }
            />

            {/* Regenerate API key */}
            <div className="flex flex-col items-start gap-1 sm:items-end">
              <Button
                variant={BUTTON_VARIANT.OUTLINE}
                size="sm"
                onClick={() => {
                  setRegenerateError(null);
                  setConfirmOpen(true);
                }}
                disabled={clientLoading || !client}
              >
                <KeyRound size={13} strokeWidth={1.5} />
                {t("clients.detail.regenerateApiKey")}
              </Button>
              {regenerateError && (
                <p className="text-xs" style={{ color: "var(--danger-fg)" }}>
                  {regenerateError}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Users section */}
      <div className="mb-3 flex items-center gap-2">
        <Users size={14} strokeWidth={1.5} style={{ color: "var(--text-muted)" }} />
        <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          {t("clients.detail.usersTab")}
        </h2>
        {!usersLoading && !usersError && (
          <span
            className="rounded-full px-2 py-0.5 text-xs"
            style={{
              backgroundColor: "var(--surface-3)",
              color:           "var(--text-muted)",
            }}
          >
            {users.length}
          </span>
        )}
      </div>

      <DataTable<User>
        data={users}
        columns={USER_COLUMNS}
        keyExtractor={(u) => u.id}
        isLoading={usersLoading}
        isError={usersError}
        onRetry={() => void refetchUsers()}
        onRowClick={handleUserClick}
        emptyTitle={t("clients.detail.noUsers")}
        emptyMessage={t("clients.detail.noUsersDescription")}
        emptyIcon={Users}
      />

      {/* Regenerate API key — confirmation dialog */}
      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleRegenerateConfirm}
        title={t("clients.detail.regenerateConfirmTitle")}
        description={t("clients.detail.regenerateConfirmMessage")}
        confirmLabel={t("clients.detail.regenerateConfirm")}
        isLoading={regenerateMutation.isPending}
      />

      {/* Regenerate API key — show new raw key */}
      {newApiKeyData !== null && (
        <ClientApiKeyDialog
          open={newApiKeyData !== null}
          onClose={() => setNewApiKeyData(null)}
          clientName={client?.name ?? ""}
          apiKey={newApiKeyData}
        />
      )}
    </>
  );
}
