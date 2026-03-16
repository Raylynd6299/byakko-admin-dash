import { httpClient } from "./http-client";
import type {
  Client,
  CreateClientInput,
  UpdateClientInput,
  CreateClientResponse,
} from "@/types/client.types";

// ─── Helpers ─────────────────────────────────────────────────────────────────

interface RawClient {
  id:          string;
  name:        string;
  webhook_url?: string;
  hmac_secret?: string;
  is_active:   boolean;
  created_at:  string;
  updated_at:  string;
}

interface RawCreateClientResponse {
  client:  RawClient;
  api_key: string;
}

function toClient(raw: RawClient): Client {
  return {
    id:         raw.id,
    name:       raw.name,
    webhookUrl: raw.webhook_url,
    hmacSecret: raw.hmac_secret,
    isActive:   raw.is_active,
    createdAt:  raw.created_at,
    updatedAt:  raw.updated_at,
  };
}

// ─── Service functions ────────────────────────────────────────────────────────

export async function listClients(): Promise<Client[]> {
  const { data } = await httpClient.get<RawClient[]>("/clients");
  return data.map(toClient);
}

export async function getClient(id: string): Promise<Client> {
  const { data } = await httpClient.get<RawClient>(`/clients/${id}`);
  return toClient(data);
}

export async function createClient(
  input: CreateClientInput
): Promise<CreateClientResponse> {
  const { data } = await httpClient.post<RawCreateClientResponse>("/clients", {
    name:        input.name,
    webhook_url: input.webhookUrl,
    hmac_secret: input.hmacSecret,
  });
  return { client: toClient(data.client), apiKey: data.api_key };
}

export async function updateClient(
  id: string,
  input: UpdateClientInput
): Promise<Client> {
  const { data } = await httpClient.put<RawClient>(`/clients/${id}`, {
    webhook_url: input.webhookUrl,
    hmac_secret: input.hmacSecret,
    is_active:   input.isActive,
  });
  return toClient(data);
}

export async function deleteClient(id: string): Promise<void> {
  await httpClient.delete(`/clients/${id}`);
}
