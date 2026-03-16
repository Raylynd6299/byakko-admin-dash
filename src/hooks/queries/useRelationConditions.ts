import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import {
  listRelationConditions,
  getRelationCondition,
} from "@/services/relation-conditions.service";
import type { RelationCondition, RelationConditionFilter } from "@/types/relation-condition.types";

export const RELATION_CONDITION_QUERY_KEYS = {
  all:    (filter?: RelationConditionFilter) => ["relation-conditions", filter ?? {}] as const,
  detail: (id: string, clientId: string) => ["relation-conditions", id, clientId] as const,
};

export function useRelationConditions(
  filter?: RelationConditionFilter
): UseQueryResult<RelationCondition[], Error> {
  return useQuery({
    queryKey: RELATION_CONDITION_QUERY_KEYS.all(filter),
    queryFn:  () => listRelationConditions(filter),
  });
}

export function useRelationCondition(
  id: string,
  clientId: string
): UseQueryResult<RelationCondition, Error> {
  return useQuery({
    queryKey: RELATION_CONDITION_QUERY_KEYS.detail(id, clientId),
    queryFn:  () => getRelationCondition(id, clientId),
    enabled:  Boolean(id) && Boolean(clientId),
    staleTime: 60_000,
  });
}