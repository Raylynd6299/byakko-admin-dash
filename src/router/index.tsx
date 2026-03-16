import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router";
import { ProtectedRoute } from "./protected-route";
import { AppShell } from "@/components/layout/app-shell";
import { ROUTES } from "./routes";

const LoginPage = lazy(() =>
  import("@/pages/login").then((m) => ({ default: m.LoginPage }))
);
const DashboardPage = lazy(() =>
  import("@/pages/dashboard").then((m) => ({ default: m.DashboardPage }))
);
const ClientsPage = lazy(() =>
  import("@/pages/clients").then((m) => ({ default: m.ClientsPage }))
);
const ClientDetailPage = lazy(() =>
  import("@/pages/clients/detail").then((m) => ({ default: m.ClientDetailPage }))
);
const UsersPage = lazy(() =>
  import("@/pages/users").then((m) => ({ default: m.UsersPage }))
);
const UserDetailPage = lazy(() =>
  import("@/pages/users/detail").then((m) => ({ default: m.UserDetailPage }))
);
const CategoriesPage = lazy(() =>
  import("@/pages/categories").then((m) => ({ default: m.CategoriesPage }))
);
const PermissionsPage = lazy(() =>
  import("@/pages/permissions").then((m) => ({ default: m.PermissionsPage }))
);
const RelationConditionsPage = lazy(() =>
  import("@/pages/relation-conditions").then((m) => ({ default: m.RelationConditionsPage }))
);

const PageFallback = (): null => null;

export const router = createBrowserRouter([
  {
    path: ROUTES.LOGIN,
    element: (
      <Suspense fallback={<PageFallback />}>
        <LoginPage />
      </Suspense>
    ),
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppShell />,
        children: [
          {
            path: ROUTES.DASHBOARD,
            element: <Suspense fallback={<PageFallback />}><DashboardPage /></Suspense>,
          },
          {
            path: ROUTES.CLIENTS,
            element: <Suspense fallback={<PageFallback />}><ClientsPage /></Suspense>,
          },
          {
            path: "/clients/:id",
            element: <Suspense fallback={<PageFallback />}><ClientDetailPage /></Suspense>,
          },
          {
            path: ROUTES.USERS,
            element: <Suspense fallback={<PageFallback />}><UsersPage /></Suspense>,
          },
          {
            path: "/users/:id",
            element: <Suspense fallback={<PageFallback />}><UserDetailPage /></Suspense>,
          },
          {
            path: ROUTES.CATEGORIES,
            element: <Suspense fallback={<PageFallback />}><CategoriesPage /></Suspense>,
          },
          {
            path: ROUTES.PERMISSIONS,
            element: <Suspense fallback={<PageFallback />}><PermissionsPage /></Suspense>,
          },
          {
            path: ROUTES.RELATION_CONDITIONS,
            element: <Suspense fallback={<PageFallback />}><RelationConditionsPage /></Suspense>,
          },
        ],
      },
    ],
  },
]);
