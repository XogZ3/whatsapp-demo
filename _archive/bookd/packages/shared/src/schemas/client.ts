import { z } from "zod";

export const clientSchema = z.object({
  id: z.string().uuid(),
  phone: z.string(),
  name: z.string().nullable(),
  locale: z.string().default("en"),
  salon_id: z.string().uuid(),
  state_snapshot: z.unknown().nullable(),
  created_at: z.string().datetime(),
  last_interaction: z.string().datetime(),
});

export type Client = z.infer<typeof clientSchema>;
