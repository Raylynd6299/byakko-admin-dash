import { type ReactElement } from "react";
import { useTranslation } from "react-i18next";
import { Building2, Users, ShieldCheck, Tag } from "lucide-react";
import { StatCard } from "./components/stat-card";
import { RecentClients } from "./components/recent-clients";
import { RecentUsers } from "./components/recent-users";
import { useClients } from "@/hooks/queries/useClients";
import { useUsers } from "@/hooks/queries/useUsers";
import { usePermissions } from "@/hooks/queries/usePermissions";
import { useCategories } from "@/hooks/queries/useCategories";

export function Dashboard(): ReactElement {
  const { t } = useTranslation();
  const clientsQuery     = useClients();
  const usersQuery       = useUsers();
  const permissionsQuery = usePermissions();
  const categoriesQuery  = useCategories();

  return (
    <div className="flex flex-col gap-8">

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label={t("dashboard.clients")}
          value={clientsQuery.data?.length ?? 0}
          icon={Building2}
          isLoading={clientsQuery.isLoading}
        />
        <StatCard
          label={t("dashboard.users")}
          value={usersQuery.data?.length ?? 0}
          icon={Users}
          isLoading={usersQuery.isLoading}
        />
        <StatCard
          label={t("dashboard.permissions")}
          value={permissionsQuery.data?.length ?? 0}
          icon={ShieldCheck}
          isLoading={permissionsQuery.isLoading}
        />
        <StatCard
          label={t("dashboard.categories")}
          value={categoriesQuery.data?.length ?? 0}
          icon={Tag}
          isLoading={categoriesQuery.isLoading}
        />
      </div>

      {/* Recent tables — 2 col on large screens */}
      <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
        <RecentClients
          clients={clientsQuery.data ?? []}
          isLoading={clientsQuery.isLoading}
          isError={clientsQuery.isError}
          onRetry={clientsQuery.refetch}
        />
        <RecentUsers
          users={usersQuery.data ?? []}
          isLoading={usersQuery.isLoading}
          isError={usersQuery.isError}
          onRetry={usersQuery.refetch}
        />
      </div>

    </div>
  );
}
