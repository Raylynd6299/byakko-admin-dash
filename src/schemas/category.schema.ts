import { z } from "zod";

// ─── Create Category ──────────────────────────────────────────────────────────

export const createCategorySchema = z.object({
  clientId: z.string().min(1, "Client is required"),
  name:     z.string().min(1, "Name is required").max(100, "Name must be 100 chars or less"),
  slug:     z
    .string()
    .min(1, "Slug is required")
    .max(100, "Slug must be 100 chars or less")
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with dashes"),
  parentId: z.string().optional(),
});

export type CreateCategoryFormValues = z.infer<typeof createCategorySchema>;