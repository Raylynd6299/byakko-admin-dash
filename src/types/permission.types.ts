export interface Permission {
  id: string;
  clientId: string;
  categoryId: string;
  action: string;
  description?: string;
  sortOrder: number;
}

export interface CreatePermissionInput {
  clientId: string;
  categoryId: string;
  action: string;
  description?: string;
}

export interface UpdatePermissionInput {
  description?: string | null;
}
