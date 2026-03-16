import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { listCategories, getCategory } from "@/services/categories.service";
import type { Category } from "@/types/category.types";

export const CATEGORY_QUERY_KEYS = {
  all:    ["categories"]                              as const,
  detail: (id: string, clientId: string) => ["categories", id, clientId] as const,
};

export function useCategories(): UseQueryResult<Category[], Error> {
  return useQuery({
    queryKey: CATEGORY_QUERY_KEYS.all,
    queryFn:  listCategories,
  });
}

export function useCategory(
  id: string,
  clientId: string
): UseQueryResult<Category, Error> {
  return useQuery({
    queryKey: CATEGORY_QUERY_KEYS.detail(id, clientId),
    queryFn:  () => getCategory(id, clientId),
    enabled:  Boolean(id) && Boolean(clientId),
    staleTime: 60_000,
  });
}
