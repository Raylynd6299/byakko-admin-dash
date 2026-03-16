import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { listPermissions, getPermission } from "@/services/permissions.service";
import type { Permission } from "@/types/permission.types";

export const PERMISSION_QUERY_KEYS = {
  all:    ["permissions"]                              as const,
  detail: (id: string, clientId: string) => ["permissions", id, clientId] as const,
};

export function usePermissions(): UseQueryResult<Permission[], Error> {
  return useQuery({
    queryKey: PERMISSION_QUERY_KEYS.all,
    queryFn:  listPermissions,
  });
}

export function usePermission(
  id: string,
  clientId: string
): UseQueryResult<Permission, Error> {
  return useQuery({
    queryKey: PERMISSION_QUERY_KEYS.detail(id, clientId),
    queryFn:  () => getPermission(id, clientId),
    enabled:  Boolean(id) && Boolean(clientId),
    staleTime: 60_000,
  });
}
