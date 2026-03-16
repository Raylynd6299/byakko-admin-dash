export interface Permission {
  id: string;
  clientId: string;
  categoryId: string;
  action: string;
  description?: string;
}

export interface CreatePermissionInput {
  clientId: string;
  categoryId: string;
  action: string;
}
