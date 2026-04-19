const USER_STATUS = {
  ACTIVE:    "ACTIVE",
  INACTIVE:  "INACTIVE",
  SUSPENDED: "SUSPENDED",
} as const;

type UserStatus = (typeof USER_STATUS)[keyof typeof USER_STATUS];

export interface User {
  id: string;
  clientId: string;
  email: string;
  firstName: string;
  lastName: string;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserInput {
  clientId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  password: string;
}

export interface UpdateUserInput {
  firstName?: string;
  lastName?: string;
}

export interface UserFilter {
  clientId?: string;
  status?:   UserStatus;
  search?:   string;
}

export interface UserPermission {
  id: string;
  clientId: string;
  userId: string;
  permissionId: string;
  grantedAt: string;
  revokedAt?: string;
}

export interface GrantPermissionInput {
  permissionId: string;
  clientId: string;
  grantedByUserId?: string;
  byApi?: boolean;
}

export interface RevokePermissionInput {
  permissionId: string;
  clientId: string;
  grantedByUserId?: string;
  byApi?: boolean;
}

const PERMISSION_HISTORY_ACTION = {
  GRANTED: "granted",
  REVOKED: "revoked",
} as const;

type PermissionHistoryAction = (typeof PERMISSION_HISTORY_ACTION)[keyof typeof PERMISSION_HISTORY_ACTION];

export interface PermissionHistoryEntry {
  id: string;
  userId: string;
  permissionId: string;
  action: PermissionHistoryAction;
  performedAt: string;
  performedByUserId?: string;
  performedByApi: boolean;
}

export { USER_STATUS, PERMISSION_HISTORY_ACTION };
export type { UserStatus, PermissionHistoryAction };
