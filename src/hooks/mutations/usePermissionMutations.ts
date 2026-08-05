import { useMutation, useQueryClient, type UseMutationResult } from "@tanstack/react-query";
import { createPermission, updatePermission, deletePermission } from "@/services/permissions.service";
import { PERMISSION_QUERY_KEYS } from "@/hooks/queries/usePermissions";
import { CATEGORY_QUERY_KEYS } from "@/hooks/queries/useCategories";
import type {
  Permission,
  CreatePermissionInput,
  UpdatePermissionInput,
} from "@/types/permission.types";

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