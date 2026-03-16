import { useMutation, useQueryClient, type UseMutationResult } from "@tanstack/react-query";
import { createPermission, deletePermission } from "@/services/permissions.service";
import { PERMISSION_QUERY_KEYS } from "@/hooks/queries/usePermissions";
import type { Permission, CreatePermissionInput } from "@/types/permission.types";

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