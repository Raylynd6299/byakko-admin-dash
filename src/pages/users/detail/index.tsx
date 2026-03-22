import { type ReactElement, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useParams, useNavigate, useLocation } from "react-router";
import { ArrowLeft, Mail, User as UserIcon, CalendarDays, Shield, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { StatusBadge } from "@/components/common/status-badge";
import { ErrorState } from "@/components/common/error-state";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { Button, BUTTON_VARIANT } from "@/components/ui/button";
import { UserPermissionList } from "@/components/users/components/user-permission-list";
import { UserPermissionHistory } from "@/components/users/components/user-permission-history";
import { GrantPermissionDialog } from "@/components/users/components/grant-permission-dialog";
import { useUser, useUserPermissions, usePermissionHistory } from "@/hooks/queries/useUsers";
import { usePermissions } from "@/hooks/queries/usePermissions";
import { useCategories } from "@/hooks/queries/useCategories";
import { useMakeAdmin } from "@/hooks/mutations/useUserMutations";
import { ROUTES } from "@/router/routes";
import { DetailField } from "./components/detail-field";
import { useDerivedClientId } from "./hooks/useDerivedClientId";
import type { User } from "@/types/user.types";
import type { Category } from "@/types/category.types";

// ─── Component ────────────────────────────────────────────────────────────────

export function UserDetailPage(): ReactElement {
  const { t } = useTranslation();
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  // Try to get clientId from state or URL
  const derivedClientId = useDerivedClientId();

  // If no clientId, we need to find it from the user list
  // For now, we'll show an error if we can't determine it
  const clientId = derivedClientId ?? "";

  // Queries
  const {
    data:     user,
    isLoading: userLoading,
    isError:   userError,
    refetch:   refetchUser,
  } = useUser(id, clientId);

  const {
    data:     permissions = [],
    isLoading: permLoading,
    isError:   permError,
    refetch:   refetchPerms,
  } = useUserPermissions(id, clientId);

  const {
    data:     history = [],
    isLoading: histLoading,
    isError:   histError,
    refetch:   refetchHist,
  } = usePermissionHistory(id, clientId);

  const { data: allPermissions = [] } = usePermissions();
  const { data: allCategories = [] }  = useCategories();

  // Build permission map for quick lookup
  const permissionMap = useMemo(
    () => new Map(allPermissions.map((p) => [p.id, p])),
    [allPermissions]
  );

  // Build category map for quick lookup
  const categoryMap = useMemo(
    () => new Map<string, Category>(allCategories.map((c) => [c.id, c])),
    [allCategories]
  );

  // Granted permission IDs (active only, not revoked)
  const grantedKeys = useMemo(
    () => new Set(permissions.filter((p) => !p.revokedAt).map((p) => p.permissionId)),
    [permissions]
  );

  // Grant dialog state
  const [grantOpen, setGrantOpen] = useState<boolean>(false);

  // Make Admin dialog state
  const [makeAdminOpen, setMakeAdminOpen] = useState<boolean>(false);
  const makeAdminMutation = useMakeAdmin();

  // Back to clients
  const handleBack = (): void => {
    navigate(ROUTES.CLIENT_DETAIL(clientId));
  };

  // User object from state (optimistic) or query
  const displayUser: User | null = (location.state as { user?: User } | undefined)?.user ?? user ?? null;

  // ── No clientId error ─────────────────────────────────────────────────────
  if (!clientId) {
    return (
      <ErrorState
        message={t("users.detail.cannotLoad")}
        onRetry={() => navigate(ROUTES.CLIENTS)}
      />
    );
  }

  // ── User error ────────────────────────────────────────────────────────────
  if (userError) {
    return <ErrorState message={t("users.detail.couldNotLoad")} onRetry={() => void refetchUser()} />;
  }

  // ── Loading ────────────────────────────────────────────────────────────────
  const isLoading = userLoading || !displayUser;

  return (
    <>
      {/* Back + header */}
      <div className="mb-4">
        <Button
          variant={BUTTON_VARIANT.GHOST}
          size="sm"
          onClick={handleBack}
          className="-ml-1 mb-2"
        >
          <ArrowLeft size={14} strokeWidth={1.5} />
          {t("users.detail.backToClient")}
        </Button>

        <PageHeader
          title={
            isLoading
              ? t("users.detail.loading")
              : [displayUser?.firstName, displayUser?.lastName].filter(Boolean).join(" ") || displayUser?.email || t("users.detail.user")
          }
          description={displayUser?.email ?? `ID: ${id}`}
          action={
            displayUser ? <StatusBadge status={displayUser.status} /> : undefined
          }
        />
      </div>

      {/* Metadata card */}
      <div
        className="mb-6 grid grid-cols-1 gap-4 rounded-xl border p-5 sm:grid-cols-2 lg:grid-cols-4"
        style={{
          backgroundColor: "var(--surface-1)",
          borderColor:     "var(--border-default)",
        }}
      >
        <DetailField
          icon={<Mail size={13} strokeWidth={1.5} />}
          label={t("users.email")}
          value={
            isLoading ? (
              <div className="h-4 w-32 animate-pulse rounded" style={{ backgroundColor: "var(--surface-3)" }} />
            ) : (
              <span className="font-mono text-xs">{displayUser?.email}</span>
            )
          }
        />
        <DetailField
          icon={<UserIcon size={13} strokeWidth={1.5} />}
          label={t("users.name")}
          value={
            isLoading ? (
              <div className="h-4 w-24 animate-pulse rounded" style={{ backgroundColor: "var(--surface-3)" }} />
            ) : [displayUser?.firstName, displayUser?.lastName].filter(Boolean).join(" ") || (
              <span style={{ color: "var(--text-muted)" }}>{t("common.notSet")}</span>
            )
          }
        />
        <DetailField
          icon={<CalendarDays size={13} strokeWidth={1.5} />}
          label={t("users.created")}
          value={
            isLoading ? (
              <div className="h-4 w-20 animate-pulse rounded" style={{ backgroundColor: "var(--surface-3)" }} />
            ) : displayUser ? (
              new Date(displayUser.createdAt).toLocaleDateString()
            ) : (
              "—"
            )
          }
        />
        <DetailField
          icon={<Shield size={13} strokeWidth={1.5} />}
          label={t("users.detail.status")}
          value={displayUser ? <StatusBadge status={displayUser.status} /> : "—"}
        />
      </div>

      {/* Permissions section */}
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Shield size={14} strokeWidth={1.5} style={{ color: "var(--text-muted)" }} />
          <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            {t("users.detail.permissions")}
          </h2>
          {!permLoading && !permError && (
            <span
              className="rounded-full px-2 py-0.5 text-xs"
              style={{
                backgroundColor: "var(--surface-3)",
                color:           "var(--text-muted)",
              }}
            >
              {permissions.filter((p) => !p.revokedAt).length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={BUTTON_VARIANT.OUTLINE}
            size="sm"
            onClick={() => setMakeAdminOpen(true)}
            disabled={!clientId || !displayUser}
          >
            <ShieldCheck size={13} strokeWidth={1.5} />
            {t("users.detail.makeAdmin")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setGrantOpen(true)}
            disabled={!clientId}
          >
            {t("users.detail.grantPermission")}
          </Button>
        </div>
      </div>

      <UserPermissionList
        permissions={permissions}
        permissionMap={permissionMap}
        categoryMap={categoryMap}
        userId={id}
        clientId={clientId}
        isLoading={permLoading}
        isError={permError}
        onRetry={() => void refetchPerms()}
        onGrantClick={() => setGrantOpen(true)}
      />

      {/* History section */}
      <div className="mt-8">
        <UserPermissionHistory
          history={history}
          permissionMap={permissionMap}
          categoryMap={categoryMap}
          isLoading={histLoading}
          isError={histError}
          onRetry={() => void refetchHist()}
        />
      </div>

      {/* Grant dialog */}
      {displayUser && (
        <GrantPermissionDialog
          open={grantOpen}
          onClose={() => setGrantOpen(false)}
          user={displayUser}
          grantedKeys={grantedKeys}
        />
      )}

      {/* Make Admin confirm dialog */}
      <ConfirmDialog
        open={makeAdminOpen}
        onClose={() => setMakeAdminOpen(false)}
        onConfirm={() => {
          makeAdminMutation.mutate(
            { userId: id, clientId },
            {
              onSuccess: () => setMakeAdminOpen(false),
            }
          );
        }}
        title={t("users.detail.makeAdminTitle")}
        description={t("users.detail.makeAdminDescription")}
        confirmLabel={t("users.detail.makeAdminButton")}
        confirmVariant={BUTTON_VARIANT.DEFAULT}
        isLoading={makeAdminMutation.isPending}
      />
    </>
  );
}