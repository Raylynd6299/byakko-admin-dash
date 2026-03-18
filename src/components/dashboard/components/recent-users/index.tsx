import { type ReactElement } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { Users } from "lucide-react";
import { DataTable } from "@/components/common/data-table";
import { ROUTES } from "@/router/routes";
import { useColumns } from "./hooks/useColumns";
import type { User } from "@/types/user.types";

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
  const { t } = useTranslation();
  const navigate = useNavigate();
  const columns = useColumns();

  const recent = users.slice(0, 5);

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
          {t("dashboard.recentUsers")}
        </h2>
        <button
          onClick={(): void => { navigate(ROUTES.USERS); }}
          className="text-xs transition-colors duration-150 hover:underline"
          style={{ color: "var(--accent)" }}
        >
          {t("dashboard.viewAll")}
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
        emptyTitle={t("dashboard.noUsers")}
        emptyMessage={t("dashboard.usersWillAppear")}
      />
    </section>
  );
}
