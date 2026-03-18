import { type ReactElement } from "react";
import type { LucideIcon } from "lucide-react";
import { NavLink } from "react-router";
import { cn } from "@/lib/cn";

interface SidebarItemProps {
  to: string;
  icon: LucideIcon;
  label: string;
  collapsed?: boolean;
}

export function SidebarItem({
  to,
  icon: Icon,
  label,
  collapsed = false,
}: SidebarItemProps): ReactElement {
  return (
    <NavLink
      to={to}
      title={collapsed ? label : undefined}
      className={({ isActive }): string =>
        cn(
          "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-150",
          "text-[var(--text-secondary)]",
          "hover:bg-[var(--nav-hover-bg)] hover:text-[var(--text-primary)]",
          isActive && "bg-[var(--nav-active-bg)] text-[var(--nav-active-fg)]",
          collapsed && "justify-center px-2"
        )
      }
    >
      {({ isActive }): ReactElement => (
        <>
          <Icon
            size={16}
            strokeWidth={isActive ? 2 : 1.5}
            className="shrink-0 transition-all duration-150"
          />
          {!collapsed && (
            <span className="truncate leading-none">{label}</span>
          )}
        </>
      )}
    </NavLink>
  );
}
