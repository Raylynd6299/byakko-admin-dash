export function resolveLabel(pathname: string, t: (key: string) => string): string {
  const routeLabels: Record<string, string> = {
    "/":                     t("nav.dashboard"),
    "/clients":              t("nav.clients"),
    "/users":                t("nav.users"),
    "/categories":           t("nav.categories"),
    "/permissions":          t("nav.permissions"),
    "/relation-conditions":  t("nav.relationConditions"),
  };
  
  if (routeLabels[pathname]) return routeLabels[pathname];
  const base = "/" + pathname.split("/")[1];
  return routeLabels[base] ?? "Admin";
}