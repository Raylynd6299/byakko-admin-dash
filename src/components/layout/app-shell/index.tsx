import { type ReactElement, useState } from "react";
import { Outlet } from "react-router";
import { Sidebar } from "./components/sidebar";
import { TopBar } from "./components/top-bar";

export function AppShell(): ReactElement {
  const [collapsed, setCollapsed] = useState<boolean>(false);

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: "var(--canvas)" }}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <TopBar />

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
