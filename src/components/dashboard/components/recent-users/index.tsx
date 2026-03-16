import { ReactElement } from "react";
import { useNavigate } from "react-router";
import { Users } from "lucide-react";
import { DataTable, type Column } from "@/components/common/data-table";
import { StatusBadge } from "@/components/common/status-badge";
import { ROUTES } from "@/router/routes";
import type { User } from "@/types/user.types";

// ─── Column definitions ───────────────────────────────────────────────────────

const columns: Column<User>[] = [
  {
    key:    "email",
    header: "User",
    render: (u: User): ReactElement => (
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
          {u.firstName || u.lastName
            ? `${u.firstName} ${u.lastName}`.trim()
            : <span style={{ color: "var(--text-muted)" }}>—</span>
          }
        </span>
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
          {u.email}
        </span>
      </div>
    ),
  },
  {
    key:    "clientId",
    header: "Client ID",
    mono:   true,
    render: (u: User): ReactElement => (
      <span style={{ color: "var(--text-muted)" }}>
        {u.clientId.slice(0, 8)}…
      </span>
    ),
  },
  {
    key:    "status",
    header: "Status",
    align:  "right",
    render: (u: User): ReactElement => <StatusBadge status={u.status} />,
  },
];

// ─── Props ────────────────────────────────────────────────────────────────────

interface RecentUsersProps {
  users:      User[];
  isLoading:  boolean;
  isError:    boolean;
  onRetry:    () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function RecentUsers({
  users,
  isLoading,
  isError,
  onRetry,
}: RecentUsersProps): ReactElement {
  const navigate = useNavigate();

  const recent = users.slice(0, 5);

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
          Recent Users
        </h2>
        <button
          onClick={(): void => { navigate(ROUTES.USERS); }}
          className="text-xs transition-colors duration-150 hover:underline"
          style={{ color: "var(--accent)" }}
        >
          View all →
        </button>
      </div>

      <DataTable<User>
        data={recent}
        columns={columns}
        keyExtractor={(u: User): string => u.id}
        isLoading={isLoading}
        isError={isError}
        onRetry={onRetry}
        emptyIcon={Users}
        emptyTitle="No users yet"
        emptyMessage="Users will appear here once clients are created."
      />
    </section>
  );
}
