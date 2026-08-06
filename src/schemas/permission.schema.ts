import { z } from "zod";

// Mirrors the backend's format-only icon rule (design.md §15.4/A9) and
// `src/lib/icon-name.ts` exactly — the picker only ever supplies a name
// from `iconNames`, so this is defense-in-depth, not the primary guard.
const ICON_NAME_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

// ─── Create Permission ────────────────────────────────────────────────────────

export const createPermissionSchema = z.object({
  clientId:    z.string().min(1, "Client is required"),
  categoryId:  z.string().min(1, "Category is required"),
  action: z
    .string()
    .min(1, "Action is required")
    .max(100, "Action must be 100 chars or less")
    .regex(/^[a-z0-9:_-]+$/, "Action must be lowercase alphanumeric with : _ -"),
  description: z.string().max(500, "Description must be 500 chars or less").optional(),
  icon: z.string().max(64).regex(ICON_NAME_PATTERN, "Invalid icon name").optional(),
});

export type CreatePermissionFormValues = z.infer<typeof createPermissionSchema>;

// ─── Edit Permission ──────────────────────────────────────────────────────────

export const editPermissionSchema = z.object({
  description: z.string().max(500, "Description must be 500 chars or less").optional(),
  // Tri-state: a name, `null` (explicit clear), or `undefined` (untouched)
  // — mirrors `UpdatePermissionInput.icon` (§15's `*string` rationale).
  icon: z.string().max(64).regex(ICON_NAME_PATTERN, "Invalid icon name").nullable().optional(),
});

export type EditPermissionFormValues = z.infer<typeof editPermissionSchema>;