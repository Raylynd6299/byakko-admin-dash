import { httpClient } from "./http-client";
import type {
  RelationCondition,
  CreateRelationConditionInput,
  RelationConditionFilter,
} from "@/types/relation-condition.types";

// ─── Helpers ─────────────────────────────────────────────────────────────────

interface RawRelationCondition {
  id:           string;
  client_id:    string;
  permission_id: string;
  condition_key: string;
  description?: string;
  is_active:    boolean;
  created_at:   string;
}

function toRelationCondition(raw: RawRelationCondition): RelationCondition {
  return {
    id:           raw.id,
    clientId:     raw.client_id,
    permissionId: raw.permission_id,
    conditionKey: raw.condition_key,
    description:  raw.description,
    isActive:     raw.is_active,
    createdAt:    raw.created_at,
  };
}

// ─── Service functions ────────────────────────────────────────────────────────

export async function listRelationConditions(
  filter?: RelationConditionFilter
): Promise<RelationCondition[]> {
  const params: Record<string, string | boolean | undefined> = {};
  if (filter?.clientId)     params["client_id"]    = filter.clientId;
  if (filter?.permissionId) params["permission_id"] = filter.permissionId;
  if (filter?.isActive !== undefined) params["is_active"] = filter.isActive;

  const { data } = await httpClient.get<RawRelationCondition[]>("/relation-conditions", { params });
  return data.map(toRelationCondition);
}

export async function getRelationCondition(
  id: string,
  clientId: string
): Promise<RelationCondition> {
  const { data } = await httpClient.get<RawRelationCondition>(`/relation-conditions/${id}`, {
    params: { client_id: clientId },
  });
  return toRelationCondition(data);
}

export async function createRelationCondition(
  input: CreateRelationConditionInput
): Promise<RelationCondition> {
  const { data } = await httpClient.post<RawRelationCondition>("/relation-conditions", {
    client_id:     input.clientId,
    permission_id: input.permissionId,
    condition_key: input.conditionKey,
    description:   input.description,
  });
  return toRelationCondition(data);
}

export async function deleteRelationCondition(
  id: string,
  clientId: string
): Promise<void> {
  await httpClient.delete(`/relation-conditions/${id}`, { params: { client_id: clientId } });
}