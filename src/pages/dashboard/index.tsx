import { type ReactElement } from "react";
import { PageHeader } from "@/components/common/page-header";
import { Dashboard } from "@/components/dashboard";

export function DashboardPage(): ReactElement {
  return (
    <>
      <PageHeader
        title="Dashboard"
        description="System overview across all clients and resources."
      />
      <Dashboard />
    </>
  );
}
