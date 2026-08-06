export interface Permission {
  id: string;
  clientId: string;
  categoryId: string;
  action: string;
  description?: string;
  // Opaque lucide icon name (design.md §16.1). Kept as a plain string, NOT
  // the 1951-member `IconName` literal union — the value arrives
  // unvalidated from the network, and narrowing it only happens once, at
  // the render boundary (`PermissionIcon`).
  icon?: string;
  sortOrder: number;
}

export interface CreatePermissionInput {
  clientId: string;
  categoryId: string;
  action: string;
  description?: string;
  icon?: string;
}

export interface UpdatePermissionInput {
  description?: string | null;
  // Tri-state on PATCH, mirroring the backend `*string` (§15): a name sets
  // it, `null` clears it, `undefined` (absent) leaves it untouched.
  icon?: string | null;
  position?: { afterPermissionId: string | null };
}
