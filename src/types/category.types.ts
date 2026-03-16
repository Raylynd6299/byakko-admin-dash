export interface Category {
  id: string;
  clientId: string;
  parentId?: string;
  name: string;
  slug: string;
  path: string;
  description?: string;
}

export interface CreateCategoryInput {
  clientId: string;
  name: string;
  slug: string;
  parentId?: string;
}
