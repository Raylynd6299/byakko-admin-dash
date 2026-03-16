import { z } from "zod";

// ─── Create Relation Condition ────────────────────────────────────────────────

export const createRelationConditionSchema = z.object({
  clientId:     z.string().min(1, "Client is required"),
  permissionId: z.string().min(1, "Permission is required"),
  conditionKey: z
    .string()
    .min(1, "Condition key is required")
    .max(100, "Condition key must be 100 chars or less")
    .regex(/^[a-z0-9_-]+$/, "Condition key must be lowercase alphanumeric with _ -"),
  description:  z.string().max(255, "Description must be 255 chars or less").optional(),
});

export type CreateRelationConditionFormValues = z.infer<typeof createRelationConditionSchema>;