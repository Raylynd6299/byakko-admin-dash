import { z } from "zod";

// ─── Create Permission ────────────────────────────────────────────────────────

export const createPermissionSchema = z.object({
  clientId:   z.string().min(1, "Client is required"),
  categoryId: z.string().min(1, "Category is required"),
  action: z
    .string()
    .min(1, "Action is required")
    .max(100, "Action must be 100 chars or less")
    .regex(/^[a-z0-9:_-]+$/, "Action must be lowercase alphanumeric with : _ -"),
});

export type CreatePermissionFormValues = z.infer<typeof createPermissionSchema>;