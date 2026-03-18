import { type ReactElement } from "react";
import { Navigate, Outlet } from "react-router";
import { useAuthStore } from "@/stores/auth.store";
import { ROUTES } from "@/router/routes";

export function ProtectedRoute(): ReactElement {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return <Outlet />;
}
