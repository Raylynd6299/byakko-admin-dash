import { useMutation, useQueryClient, type UseMutationResult } from "@tanstack/react-query";
import {
  createClient,
  updateClient,
  deleteClient,
} from "@/services/clients.service";
import { CLIENT_QUERY_KEYS } from "@/hooks/queries/useClients";
import type { Client, CreateClientInput, CreateClientResponse, UpdateClientInput } from "@/types/client.types";

// ─── Create ───────────────────────────────────────────────────────────────────

export function useCreateClient(): UseMutationResult<CreateClientResponse, Error, CreateClientInput> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateClientInput) => createClient(input),
    onSuccess: (): void => {
      void queryClient.invalidateQueries({ queryKey: CLIENT_QUERY_KEYS.all });
    },
  });
}

// ─── Update ───────────────────────────────────────────────────────────────────

interface UpdateClientArgs {
  id:    string;
  input: UpdateClientInput;
}

export function useUpdateClient(): UseMutationResult<Client, Error, UpdateClientArgs> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: UpdateClientArgs) => updateClient(id, input),
    onSuccess: (updated): void => {
      void queryClient.invalidateQueries({ queryKey: CLIENT_QUERY_KEYS.all });
      void queryClient.invalidateQueries({ queryKey: CLIENT_QUERY_KEYS.detail(updated.id) });
    },
  });
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export function useDeleteClient(): UseMutationResult<void, Error, string> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteClient(id),
    onSuccess: (): void => {
      void queryClient.invalidateQueries({ queryKey: CLIENT_QUERY_KEYS.all });
    },
  });
}

// ─── Toggle active ────────────────────────────────────────────────────────────

export function useToggleClientActive(): UseMutationResult<Client, Error, Client> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (client: Client) =>
      updateClient(client.id, { isActive: !client.isActive }),
    onSuccess: (updated): void => {
      void queryClient.invalidateQueries({ queryKey: CLIENT_QUERY_KEYS.all });
      void queryClient.invalidateQueries({ queryKey: CLIENT_QUERY_KEYS.detail(updated.id) });
    },
  });
}
