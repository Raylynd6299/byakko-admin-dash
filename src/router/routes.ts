export const ROUTES = {
  LOGIN: "/login",
  DASHBOARD: "/",
  CLIENTS: "/clients",
  CLIENT_DETAIL: (id: string): string => `/clients/${id}`,
  USERS: "/users",
  USER_DETAIL: (id: string): string => `/users/${id}`,
  CATEGORIES: "/categories",
  PERMISSIONS: "/permissions",
  RELATION_CONDITIONS: "/relation-conditions",
} as const;
