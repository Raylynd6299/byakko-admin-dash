import { httpClient } from "./http-client";
import type { Category, CreateCategoryInput } from "@/types/category.types";

interface RawCategory {
  id:           string;
  client_id:    string;
  parent_id?:   string;
  name:         string;
  slug:         string;
  path:         string;
  description?: string;
}

function toCategory(raw: RawCategory): Category {
  return {
    id:          raw.id,
    clientId:    raw.client_id,
    parentId:    raw.parent_id,
    name:        raw.name,
    slug:        raw.slug,
    path:        raw.path,
    description: raw.description,
  };
}

export async function listCategories(): Promise<Category[]> {
  const { data } = await httpClient.get<RawCategory[]>("/categories");
  return data.map(toCategory);
}

export async function getCategory(id: string, clientId: string): Promise<Category> {
  const { data } = await httpClient.get<RawCategory>(`/categories/${id}`, {
    params: { client_id: clientId },
  });
  return toCategory(data);
}

export async function createCategory(input: CreateCategoryInput): Promise<Category> {
  const { data } = await httpClient.post<RawCategory>("/categories", {
    client_id: input.clientId,
    name:      input.name,
    slug:      input.slug,
    parent_id: input.parentId,
  });
  return toCategory(data);
}

export async function deleteCategory(id: string, clientId: string): Promise<void> {
  await httpClient.delete(`/categories/${id}`, { params: { client_id: clientId } });
}
