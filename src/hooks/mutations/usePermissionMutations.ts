import { useMutation, useQueryClient, type UseMutationResult } from "@tanstack/react-query";
import { createPermission, updatePermission, deletePermission } from "@/services/permissions.service";
import { PERMISSION_QUERY_KEYS } from "@/hooks/queries/usePermissions";
import { CATEGORY_QUERY_KEYS } from "@/hooks/queries/useCategories";
import { moveWithinGroup } from "@/lib/reorder";
import type {
  Permission,
  CreatePermissionInput,
  UpdatePermissionInput,
} from "@/types/permission.types";

const UNCATEGORIZED_GROUP = "__uncategorized__";

// ─── Create ───────────────────────────────────────────────────────────────────

export function useCreatePermission(): UseMutationResult<Permission, Error, CreatePermissionInput> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreatePermissionInput) => createPermission(input),
    onSuccess: (): void => {
      void queryClient.invalidateQueries({ queryKey: PERMISSION_QUERY_KEYS.all });
    },
  });
}

// ─── Update ───────────────────────────────────────────────────────────────────

interface UpdatePermissionArgs {
  id:       string;
  clientId: string;
  input:    UpdatePermissionInput;
}

export function useUpdatePermission(): UseMutationResult<Permission, Error, UpdatePermissionArgs> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, clientId, input }: UpdatePermissionArgs) =>
      updatePermission(id, clientId, input),
    onSuccess: (updated): void => {
      // Mirrors the DeletePermission invalidation contract: entity list +
      // category catalog, so a description edit is visible immediately.
      void queryClient.invalidateQueries({ queryKey: PERMISSION_QUERY_KEYS.all });
      void queryClient.invalidateQueries({
        queryKey: PERMISSION_QUERY_KEYS.detail(updated.id, updated.clientId),
      });
      void queryClient.invalidateQueries({ queryKey: CATEGORY_QUERY_KEYS.all });
    },
  });
}

// ─── Reorder (PR3, @dnd-kit + move-up/down keyboard fallback) ──────────────────

interface ReorderPermissionArgs {
  id:                string;
  clientId:          string;
  // The neighbour id the row was dropped on / swapped with — drag and the
  // move-up/down buttons both pass this, so the optimistic write below
  // reorders identically regardless of which gesture triggered it.
  overId:             string;
  afterPermissionId: string | null;
}

interface ReorderPermissionContext {
  previous: Permission[] | undefined;
}

export function useReorderPermission(): UseMutationResult<
  Permission,
  Error,
  ReorderPermissionArgs,
  ReorderPermissionContext
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, clientId, afterPermissionId }: ReorderPermissionArgs) =>
      updatePermission(id, clientId, { position: { afterPermissionId } }),
    onMutate: async ({ id, overId }: ReorderPermissionArgs): Promise<ReorderPermissionContext> => {
      // cancelQueries FIRST — an in-flight refetch landing on top of the
      // optimistic array would resurrect the old order.
      await queryClient.cancelQueries({ queryKey: PERMISSION_QUERY_KEYS.all });
      const previous = queryClient.getQueryData<Permission[]>(PERMISSION_QUERY_KEYS.all);
      if (previous) {
        const next = moveWithinGroup(
          previous,
          (p) => p.categoryId ?? UNCATEGORIZED_GROUP,
          (p) => p.id,
          id,
          overId
        );
        // A NEW array — never splice the cached one.
        queryClient.setQueryData(PERMISSION_QUERY_KEYS.all, next);
      }
      return { previous };
    },
    onError: (_err, _vars, context): void => {
      if (context?.previous) {
        queryClient.setQueryData(PERMISSION_QUERY_KEYS.all, context.previous);
      }
    },
    onSettled: (): void => {
      // Reconciles against server truth whether the request succeeded
      // (a server-side renormalization may have shifted more than the
      // moved row) or failed with a 409 anchor mismatch.
      void queryClient.invalidateQueries({ queryKey: PERMISSION_QUERY_KEYS.all });
      void queryClient.invalidateQueries({ queryKey: CATEGORY_QUERY_KEYS.all });
    },
  });
}

// ─── Delete ────────────────────────────────────────────────────────────────────

interface DeletePermissionArgs {
  id:       string;
  clientId: string;
}

export function useDeletePermission(): UseMutationResult<void, Error, DeletePermissionArgs> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, clientId }: DeletePermissionArgs) => deletePermission(id, clientId),
    onSuccess: (): void => {
      void queryClient.invalidateQueries({ queryKey: PERMISSION_QUERY_KEYS.all });
    },
  });
}