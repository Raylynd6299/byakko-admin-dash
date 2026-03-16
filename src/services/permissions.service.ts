import { httpClient } from "./http-client";
import type { Permission, CreatePermissionInput } from "@/types/permission.types";

interface RawPermission {
  id:           string;
  client_id:    string;
  category_id:  string;
  action:       string;
  description?: string;
}

function toPermission(raw: RawPermission): Permission {
  return {
    id:          raw.id,
    clientId:    raw.client_id,
    categoryId:  raw.category_id,
    action:      raw.action,
    description: raw.description,
  };
}

export async function listPermissions(): Promise<Permission[]> {
  const { data } = await httpClient.get<RawPermission[]>("/permissions");
  return data.map(toPermission);
}

export async function getPermission(id: string, clientId: string): Promise<Permission> {
  const { data } = await httpClient.get<RawPermission>(`/permissions/${id}`, {
    params: { client_id: clientId },
  });
  return toPermission(data);
}

export async function createPermission(input: CreatePermissionInput): Promise<Permission> {
  const { data } = await httpClient.post<RawPermission>("/permissions", {
    client_id:   input.clientId,
    category_id: input.categoryId,
    action:      input.action,
  });
  return toPermission(data);
}

export async function deletePermission(id: string, clientId: string): Promise<void> {
  await httpClient.delete(`/permissions/${id}`, { params: { client_id: clientId } });
}
