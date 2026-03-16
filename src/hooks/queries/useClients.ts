import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { listClients, getClient } from "@/services/clients.service";
import type { Client } from "@/types/client.types";

export const CLIENT_QUERY_KEYS = {
  all:    ["clients"]               as const,
  detail: (id: string) => ["clients", id] as const,
};

export function useClients(): UseQueryResult<Client[], Error> {
  return useQuery({
    queryKey: CLIENT_QUERY_KEYS.all,
    queryFn:  listClients,
  });
}

export function useClient(id: string): UseQueryResult<Client, Error> {
  return useQuery({
    queryKey: CLIENT_QUERY_KEYS.detail(id),
    queryFn:  () => getClient(id),
    enabled:  Boolean(id),
  });
}
