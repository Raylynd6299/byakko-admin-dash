import { httpClient } from "./http-client";
import type {
  Permission,
  CreatePermissionInput,
  UpdatePermissionInput,
} from "@/types/permission.types";

interface RawPermission {
  id:           string;
  client_id:    string;
  category_id:  string;
  action:       string;
  description?: string;
  sort_order:   number;
}

function toPermission(raw: RawPermission): Permission {
  return {
    id:          raw.id,
    clientId:    raw.client_id,
    categoryId:  raw.category_id,
    action:      raw.action,
    description: raw.description,
    sortOrder:   raw.sort_order,
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
    description: input.description,
  });
  return toPermission(data);
}

export async function updatePermission(
  id: string,
  clientId: string,
  input: UpdatePermissionInput
): Promise<Permission> {
  const { data } = await httpClient.patch<RawPermission>(
    `/permissions/${id}`,
    {
      description: input.description,
      position:     input.position
        ? { after_permission_id: input.position.afterPermissionId }
        : undefined,
    },
    { params: { client_id: clientId } }
  );
  return toPermission(data);
}

export async function deletePermission(id: string, clientId: string): Promise<void> {
  await httpClient.delete(`/permissions/${id}`, { params: { client_id: clientId } });
}
