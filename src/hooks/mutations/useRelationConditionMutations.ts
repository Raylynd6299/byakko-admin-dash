import { useMutation, useQueryClient, type UseMutationResult } from "@tanstack/react-query";
import {
  createRelationCondition,
  deleteRelationCondition,
} from "@/services/relation-conditions.service";
import { RELATION_CONDITION_QUERY_KEYS } from "@/hooks/queries/useRelationConditions";
import type {
  RelationCondition,
  CreateRelationConditionInput,
} from "@/types/relation-condition.types";

// ─── Create ───────────────────────────────────────────────────────────────────

export function useCreateRelationCondition(): UseMutationResult<
  RelationCondition,
  Error,
  CreateRelationConditionInput
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateRelationConditionInput) => createRelationCondition(input),
    onSuccess: (): void => {
      void queryClient.invalidateQueries({ queryKey: RELATION_CONDITION_QUERY_KEYS.all() });
    },
  });
}

// ─── Delete ────────────────────────────────────────────────────────────────────

interface DeleteRelationConditionArgs {
  id:       string;
  clientId: string;
}

export function useDeleteRelationCondition(): UseMutationResult<
  void,
  Error,
  DeleteRelationConditionArgs
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, clientId }: DeleteRelationConditionArgs) =>
      deleteRelationCondition(id, clientId),
    onSuccess: (): void => {
      void queryClient.invalidateQueries({ queryKey: RELATION_CONDITION_QUERY_KEYS.all() });
    },
  });
}