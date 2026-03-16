import { ReactElement } from "react";
import { useLocation } from "react-router";
import { ThemeToggle } from "./components/theme-toggle";
import { useAuthStore } from "@/stores/auth.store";

const ROUTE_LABELS: Record<string, string> = {
  "/":                     "Dashboard",
  "/clients":              "Clients",
  "/users":                "Users",
  "/categories":           "Categories",
  "/permissions":          "Permissions",
  "/relation-conditions":  "Relation Conditions",
};

function resolveLabel(pathname: string): string {
  if (ROUTE_LABELS[pathname]) return ROUTE_LABELS[pathname];
  const base = "/" + pathname.split("/")[1];
  return ROUTE_LABELS[base] ?? "Admin";
}

export function TopBar(): ReactElement {
  const location = useLocation();
  const email = useAuthStore((state) => state.profile?.email);
  const label = resolveLabel(location.pathname);

  return (
    <header
      className="flex h-14 shrink-0 items-center justify-between border-b px-6"
      style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--surface-0)" }}
    >
      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
          {label}
        </span>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-1">
        <ThemeToggle />

        {email && (
          <div
            className="ml-3 flex items-center gap-2 rounded-md px-2 py-1 text-xs"
            style={{ color: "var(--text-muted)" }}
          >
            <span
              className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold"
              style={{
                backgroundColor: "var(--accent-muted)",
                color: "var(--accent-hover)",
              }}
            >
              {email[0].toUpperCase()}
            </span>
            <span className="hidden sm:block">{email}</span>
          </div>
        )}
      </div>
    </header>
  );
}
