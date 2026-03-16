import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import {
  listUsers,
  getUser,
  listUserPermissions,
  listPermissionHistory,
} from "@/services/users.service";
import type { User, UserFilter, UserPermission, PermissionHistoryEntry } from "@/types/user.types";

export const USER_QUERY_KEYS = {
  all:        (filter?: UserFilter) => ["users", filter ?? {}]          as const,
  detail:     (id: string, clientId: string) => ["users", id, clientId] as const,
  permissions:(userId: string, clientId: string) => ["users", userId, clientId, "permissions"] as const,
  history:    (userId: string, clientId: string) => ["users", userId, clientId, "history"]     as const,
};

export function useUsers(filter?: UserFilter): UseQueryResult<User[], Error> {
  return useQuery({
    queryKey: USER_QUERY_KEYS.all(filter),
    queryFn:  () => listUsers(filter),
  });
}

export function useUser(id: string, clientId: string): UseQueryResult<User, Error> {
  return useQuery({
    queryKey: USER_QUERY_KEYS.detail(id, clientId),
    queryFn:  () => getUser(id, clientId),
    enabled:  Boolean(id) && Boolean(clientId),
  });
}

export function useUserPermissions(
  userId: string,
  clientId: string
): UseQueryResult<UserPermission[], Error> {
  return useQuery({
    queryKey: USER_QUERY_KEYS.permissions(userId, clientId),
    queryFn:  () => listUserPermissions(userId, clientId),
    enabled:  Boolean(userId) && Boolean(clientId),
    staleTime: 60_000,
  });
}

export function usePermissionHistory(
  userId: string,
  clientId: string
): UseQueryResult<PermissionHistoryEntry[], Error> {
  return useQuery({
    queryKey: USER_QUERY_KEYS.history(userId, clientId),
    queryFn:  () => listPermissionHistory(userId, clientId),
    enabled:  Boolean(userId) && Boolean(clientId),
    staleTime: 60_000,
  });
}
