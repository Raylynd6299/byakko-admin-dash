import { z } from "zod";
import { USER_STATUS } from "@/types/user.types";

// ─── Create User ──────────────────────────────────────────────────────────────

export const createUserSchema = z.object({
  clientId:  z.string().min(1, "Client is required"),
  email:     z.string().email("Must be a valid email").max(255, "Email must be 255 chars or less"),
  password:  z.string().min(8, "Password must be at least 8 characters").max(72, "Password must be 72 chars or less"),
  firstName: z.string().max(100, "First name must be 100 chars or less").optional(),
  lastName:  z.string().max(100, "Last name must be 100 chars or less").optional(),
});

export type CreateUserFormValues = z.infer<typeof createUserSchema>;

// ─── Edit User ────────────────────────────────────────────────────────────────

export const editUserSchema = z.object({
  firstName: z.string().max(100, "First name must be 100 chars or less").optional(),
  lastName:  z.string().max(100, "Last name must be 100 chars or less").optional(),
});

export type EditUserFormValues = z.infer<typeof editUserSchema>;

// ─── User Filter ──────────────────────────────────────────────────────────────

export const userFilterSchema = z.object({
  clientId: z.string().optional(),
  status:   z.enum([USER_STATUS.ACTIVE, USER_STATUS.INACTIVE, USER_STATUS.SUSPENDED]).optional(),
  search:   z.string().optional(),
});

export type UserFilterValues = z.infer<typeof userFilterSchema>;

// ─── Grant Permission ────────────────────────────────────────────────────────

export const grantPermissionSchema = z.object({
  permissionId:    z.string().min(1, "Permission is required"),
  grantedByUserId: z.string().optional(),
  byApi:           z.boolean().optional(),
});

export type GrantPermissionFormValues = z.infer<typeof grantPermissionSchema>;