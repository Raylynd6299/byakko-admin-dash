import { type ReactElement } from "react";
import { useTranslation } from "react-i18next";
import {
  LayoutDashboard,
  Building2,
  Users,
  Tag,
  ShieldCheck,
  GitBranch,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { SidebarItem } from "./components/sidebar-item";
import { ROUTES } from "@/router/routes";
import { useAuthStore } from "@/stores/auth.store";
import { cn } from "@/lib/cn";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps): ReactElement {
  const { t } = useTranslation();
  const logout = useAuthStore((state) => state.logout);

  const NAV_ITEMS = [
    { to: ROUTES.DASHBOARD,           icon: LayoutDashboard, label: t("nav.dashboard") },
    { to: ROUTES.CLIENTS,             icon: Building2,       label: t("nav.clients") },
    { to: ROUTES.USERS,               icon: Users,           label: t("nav.users") },
    { to: ROUTES.CATEGORIES,          icon: Tag,             label: t("nav.categories") },
    { to: ROUTES.PERMISSIONS,        icon: ShieldCheck,     label: t("nav.permissions") },
    { to: ROUTES.RELATION_CONDITIONS, icon: GitBranch,       label: t("nav.relationConditions") },
  ] as const;

  return (
    <aside
      className={cn(
        "flex shrink-0 flex-col border-r transition-all duration-200",
        collapsed ? "w-14" : "w-[240px]"
      )}
      style={{
        backgroundColor: "var(--sidebar-bg)",
        borderColor: "var(--sidebar-border)",
      }}
    >
      {/* Logo / Brand */}
      <div
        className={cn(
          "flex h-14 shrink-0 items-center border-b",
          collapsed ? "justify-center px-0" : "justify-between px-4"
        )}
        style={{ borderColor: "var(--sidebar-border)" }}
      >
        {!collapsed && (
          <div className="flex items-center gap-2">
            <span
              className="flex h-7 w-7 items-center justify-center rounded-md text-xs font-bold"
              style={{ backgroundColor: "var(--accent-muted)", color: "var(--accent)" }}
            >
              B
            </span>
            <span className="text-sm font-semibold tracking-tight" style={{ color: "var(--text-primary)" }}>
              Byakko
            </span>
            <span
              className="rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider"
              style={{ backgroundColor: "var(--surface-3)", color: "var(--text-muted)" }}
            >
              Admin
            </span>
          </div>
        )}

        <button
          onClick={onToggle}
          title={collapsed ? t("nav.expandSidebar") : t("nav.collapseSidebar")}
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-md transition-colors duration-150",
            "hover:bg-[var(--nav-hover-bg)]"
          )}
          style={{ color: "var(--text-muted)" }}
        >
          {collapsed
            ? <PanelLeftOpen size={14} strokeWidth={1.5} />
            : <PanelLeftClose size={14} strokeWidth={1.5} />
          }
        </button>
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-2">
        {NAV_ITEMS.map((item) => (
          <SidebarItem
            key={item.to}
            to={item.to}
            icon={item.icon}
            label={item.label}
            collapsed={collapsed}
          />
        ))}
      </nav>

      {/* Footer — logout */}
      <div
        className="shrink-0 border-t p-2"
        style={{ borderColor: "var(--sidebar-border)" }}
      >
        <button
          onClick={logout}
          title={t("nav.logout")}
          className={cn(
            "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-150",
            "text-[var(--text-muted)] hover:bg-[var(--danger-bg)] hover:text-[var(--danger-fg)]",
            collapsed && "justify-center px-2"
          )}
        >
          <LogOut size={16} strokeWidth={1.5} className="shrink-0" />
          {!collapsed && <span className="truncate">{t("nav.logout")}</span>}
        </button>
      </div>
    </aside>
  );
}
