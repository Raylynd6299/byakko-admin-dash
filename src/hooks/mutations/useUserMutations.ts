import { useMutation, useQueryClient, type UseMutationResult } from "@tanstack/react-query";
import {
  createUser,
  updateUser,
  deleteUser,
  grantUserPermission,
  revokeUserPermission,
} from "@/services/users.service";
import { USER_QUERY_KEYS } from "@/hooks/queries/useUsers";
import type {
  User,
  CreateUserInput,
  UpdateUserInput,
  GrantPermissionInput,
  RevokePermissionInput,
} from "@/types/user.types";

// ─── Create ───────────────────────────────────────────────────────────────────

export function useCreateUser(): UseMutationResult<User, Error, CreateUserInput> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateUserInput) => createUser(input),
    onSuccess: (): void => {
      void queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.all() });
    },
  });
}

// ─── Update ────────────────────────────────────────────────────────────────────

interface UpdateUserArgs {
  id:       string;
  clientId: string;
  input:    UpdateUserInput;
}

export function useUpdateUser(): UseMutationResult<User, Error, UpdateUserArgs> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, clientId, input }: UpdateUserArgs) => updateUser(id, clientId, input),
    onSuccess: (updated): void => {
      void queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.all() });
      void queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.detail(updated.id, updated.clientId) });
    },
  });
}

// ─── Delete ────────────────────────────────────────────────────────────────────

interface DeleteUserArgs {
  id:       string;
  clientId: string;
}

export function useDeleteUser(): UseMutationResult<void, Error, DeleteUserArgs> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, clientId }: DeleteUserArgs) => deleteUser(id, clientId),
    onSuccess: (): void => {
      void queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.all() });
    },
  });
}

// ─── Grant Permission ──────────────────────────────────────────────────────────

interface GrantPermissionArgs {
  userId: string;
  input:  GrantPermissionInput;
}

export function useGrantPermission(): UseMutationResult<void, Error, GrantPermissionArgs> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, input }: GrantPermissionArgs) => grantUserPermission(userId, input),
    onSuccess: (_, vars): void => {
      void queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.permissions(vars.userId, vars.input.clientId) });
      void queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.history(vars.userId, vars.input.clientId) });
    },
  });
}

// ─── Revoke Permission ────────────────────────────────────────────────────────

interface RevokePermissionArgs {
  userId: string;
  input:  RevokePermissionInput;
}

export function useRevokePermission(): UseMutationResult<void, Error, RevokePermissionArgs> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, input }: RevokePermissionArgs) => revokeUserPermission(userId, input),
    onSuccess: (_, vars): void => {
      void queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.permissions(vars.userId, vars.input.clientId) });
      void queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.history(vars.userId, vars.input.clientId) });
    },
  });
}