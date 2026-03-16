import { ReactElement, useState, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Mail, User as UserIcon, CalendarDays, Shield } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { StatusBadge } from "@/components/common/status-badge";
import { ErrorState } from "@/components/common/error-state";
import { Button, BUTTON_VARIANT } from "@/components/ui/button";
import { UserPermissionList } from "@/components/users/components/user-permission-list";
import { UserPermissionHistory } from "@/components/users/components/user-permission-history";
import { GrantPermissionDialog } from "@/components/users/components/grant-permission-dialog";
import { useUser, useUserPermissions, usePermissionHistory } from "@/hooks/queries/useUsers";
import { usePermissions } from "@/hooks/queries/usePermissions";
import { ROUTES } from "@/router/routes";
import type { User } from "@/types/user.types";

// ─── Location state type ──────────────────────────────────────────────────────

interface LocationState {
  user?: User;
}

// ─── Helper to extract clientId ──────────────────────────────────────────────

function useDerivedClientId(): string | null {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();

  // From navigation state
  const state = location.state as LocationState | undefined;
  if (state?.user?.clientId) return state.user.clientId;

  // From URL query param (fallback)
  const params = new URLSearchParams(location.search);
  const clientIdParam = params.get("clientId");
  if (clientIdParam) return clientIdParam;

  return null;
}

// ─── Detail card ───────────────────────────────────────────────────────────────

interface DetailFieldProps {
  icon:  React.ReactNode;
  label: string;
  value: React.ReactNode;
}

function DetailField({ icon, label, value }: DetailFieldProps): ReactElement {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5">
        <span style={{ color: "var(--text-muted)" }}>{icon}</span>
        <span className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
          {label}
        </span>
      </div>
      <div className="text-sm" style={{ color: "var(--text-secondary)" }}>
        {value}
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function UserDetailPage(): ReactElement {
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

  // Build permission map for quick lookup
  const permissionMap = useMemo(
    () => new Map(allPermissions.map((p) => [p.id, p])),
    [allPermissions]
  );

  // Granted permission IDs (active only, not revoked)
  const grantedKeys = useMemo(
    () => new Set(permissions.filter((p) => !p.revokedAt).map((p) => p.permissionId)),
    [permissions]
  );

  // Grant dialog state
  const [grantOpen, setGrantOpen] = useState<boolean>(false);

  // Back to clients
  const handleBack = (): void => {
    navigate(ROUTES.CLIENT_DETAIL(clientId));
  };

  // User object from state (optimistic) or query
  const displayUser: User | null = (location.state as LocationState)?.user ?? user ?? null;

  // ── No clientId error ─────────────────────────────────────────────────────
  if (!clientId) {
    return (
      <ErrorState
        message="Cannot load user details. Navigate from the users list or provide clientId in the URL."
        onRetry={() => navigate(ROUTES.CLIENTS)}
      />
    );
  }

  // ── User error ────────────────────────────────────────────────────────────
  if (userError) {
    return <ErrorState message="Could not load user." onRetry={() => void refetchUser()} />;
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
          Back to Client
        </Button>

        <PageHeader
          title={
            isLoading
              ? "Loading…"
              : [displayUser?.firstName, displayUser?.lastName].filter(Boolean).join(" ") || displayUser?.email || "User"
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
          label="Email"
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
          label="Name"
          value={
            isLoading ? (
              <div className="h-4 w-24 animate-pulse rounded" style={{ backgroundColor: "var(--surface-3)" }} />
            ) : [displayUser?.firstName, displayUser?.lastName].filter(Boolean).join(" ") || (
              <span style={{ color: "var(--text-muted)" }}>Not set</span>
            )
          }
        />
        <DetailField
          icon={<CalendarDays size={13} strokeWidth={1.5} />}
          label="Created"
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
          label="Status"
          value={displayUser ? <StatusBadge status={displayUser.status} /> : "—"}
        />
      </div>

      {/* Permissions section */}
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Shield size={14} strokeWidth={1.5} style={{ color: "var(--text-muted)" }} />
          <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            Permissions
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
        <Button
          variant="outline"
          size="sm"
          onClick={() => setGrantOpen(true)}
          disabled={!clientId}
        >
          Grant Permission
        </Button>
      </div>

      <UserPermissionList
        permissions={permissions}
        permissionMap={permissionMap}
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
    </>
  );
}