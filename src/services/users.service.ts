import { httpClient } from "./http-client";
import type {
  User,
  CreateUserInput,
  UpdateUserInput,
  UserFilter,
  UserPermission,
  GrantPermissionInput,
  RevokePermissionInput,
  PermissionHistoryEntry,
} from "@/types/user.types";

// ─── Helpers ─────────────────────────────────────────────────────────────────

interface RawUser {
  id:         string;
  client_id:  string;
  email:      string;
  first_name: string;
  last_name:  string;
  status:     string;
  created_at: string;
  updated_at: string;
}

interface RawUserPermission {
  id:            string;
  client_id:     string;
  user_id:       string;
  permission_id: string;
  granted_at:    string;
  revoked_at?:   string;
}

interface RawHistoryEntry {
  id:                      string;
  user_id:                 string;
  permission_id:           string;
  action:                  string;
  performed_at:            string;
  performed_by_user_id?:   string;
  performed_by_api:        boolean;
}

function toUser(raw: RawUser): User {
  return {
    id:        raw.id,
    clientId:  raw.client_id,
    email:     raw.email,
    firstName: raw.first_name,
    lastName:  raw.last_name,
    status:    raw.status as User["status"],
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  };
}

function toUserPermission(raw: RawUserPermission): UserPermission {
  return {
    id:           raw.id,
    clientId:     raw.client_id,
    userId:       raw.user_id,
    permissionId: raw.permission_id,
    grantedAt:    raw.granted_at,
    revokedAt:    raw.revoked_at,
  };
}

function toHistoryEntry(raw: RawHistoryEntry): PermissionHistoryEntry {
  return {
    id:                  raw.id,
    userId:              raw.user_id,
    permissionId:        raw.permission_id,
    action:              raw.action as PermissionHistoryEntry["action"],
    performedAt:         raw.performed_at,
    performedByUserId:   raw.performed_by_user_id,
    performedByApi:      raw.performed_by_api,
  };
}

// ─── Service functions ────────────────────────────────────────────────────────

export async function listUsers(filter?: UserFilter): Promise<User[]> {
  const params: Record<string, string> = {};
  if (filter?.clientId) params["client_id"] = filter.clientId;
  if (filter?.status)   params["status"]    = filter.status;

  const { data } = await httpClient.get<RawUser[]>("/users", { params });
  return data.map(toUser);
}

export async function getUser(id: string, clientId: string): Promise<User> {
  const { data } = await httpClient.get<RawUser>(`/users/${id}`, {
    params: { client_id: clientId },
  });
  return toUser(data);
}

export async function createUser(input: CreateUserInput): Promise<User> {
  const { data } = await httpClient.post<RawUser>("/users", {
    client_id:  input.clientId,
    email:      input.email,
    first_name: input.firstName,
    last_name:  input.lastName,
    password:   input.password,
  });
  return toUser(data);
}

export async function updateUser(
  id: string,
  clientId: string,
  input: UpdateUserInput
): Promise<User> {
  const { data } = await httpClient.patch<RawUser>(`/users/${id}`, {
    first_name: input.firstName,
    last_name:  input.lastName,
  }, { params: { client_id: clientId } });
  return toUser(data);
}

export async function deleteUser(id: string, clientId: string): Promise<void> {
  await httpClient.delete(`/users/${id}`, { params: { client_id: clientId } });
}

export async function listUserPermissions(
  userId: string,
  clientId: string
): Promise<UserPermission[]> {
  const { data } = await httpClient.get<RawUserPermission[]>(
    `/users/${userId}/permissions`,
    { params: { client_id: clientId } }
  );
  return data.map(toUserPermission);
}

export async function grantUserPermission(
  userId: string,
  input: GrantPermissionInput
): Promise<void> {
  await httpClient.post(`/users/${userId}/permissions/grant`, {
    permission_id:      input.permissionId,
    client_id:          input.clientId,
    granted_by_user_id: input.grantedByUserId,
    by_api:             input.byApi,
  });
}

export async function revokeUserPermission(
  userId: string,
  input: RevokePermissionInput
): Promise<void> {
  await httpClient.post(`/users/${userId}/permissions/revoke`, {
    permission_id:      input.permissionId,
    client_id:          input.clientId,
    granted_by_user_id: input.grantedByUserId,
    by_api:             input.byApi,
  });
}

export async function listPermissionHistory(
  userId: string,
  clientId: string
): Promise<PermissionHistoryEntry[]> {
  const { data } = await httpClient.get<RawHistoryEntry[]>(
    `/users/${userId}/permissions/history`,
    { params: { client_id: clientId } }
  );
  return data.map(toHistoryEntry);
}
