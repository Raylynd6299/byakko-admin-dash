import { z } from "zod";

// ─── Create Client ────────────────────────────────────────────────────────────

export const createClientSchema = z.object({
  name:       z.string().min(1, "Name is required").max(100, "Name must be 100 chars or less"),
  webhookUrl: z
    .string()
    .url("Must be a valid URL")
    .or(z.literal(""))
    .optional(),
  hmacSecret: z
    .string()
    .min(8, "Secret must be at least 8 characters")
    .or(z.literal(""))
    .optional(),
});

export type CreateClientFormValues = z.infer<typeof createClientSchema>;

// ─── Edit Client ─────────────────────────────────────────────────────────────

export const editClientSchema = z.object({
  webhookUrl: z
    .string()
    .url("Must be a valid URL")
    .or(z.literal(""))
    .optional(),
  hmacSecret: z
    .string()
    .min(8, "Secret must be at least 8 characters")
    .or(z.literal(""))
    .optional(),
});

export type EditClientFormValues = z.infer<typeof editClientSchema>;
