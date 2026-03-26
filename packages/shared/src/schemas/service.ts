import { z } from "zod";

export const serviceSchema = z.object({
  id: z.string().uuid(),
  salon_id: z.string().uuid(),
  name: z.string(),
  name_ar: z.string().nullable(),
  name_de: z.string().nullable(),
  duration_minutes: z.number().int().positive(),
  price_amount: z.number().positive(),
  price_currency: z.string().default("AED"),
  active: z.boolean().default(true),
});

export type Service = z.infer<typeof serviceSchema>;
