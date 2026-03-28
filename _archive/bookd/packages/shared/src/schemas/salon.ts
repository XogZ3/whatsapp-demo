import { z } from "zod";

export const salonSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  whatsapp_number: z.string(),
  timezone: z.string().default("Asia/Dubai"),
  locale: z.string().default("en"),
  address: z.string().nullable(),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
  opening_hours: z.record(
    z.object({ open: z.string(), close: z.string() })
  ),
  created_at: z.string().datetime(),
});

export type Salon = z.infer<typeof salonSchema>;
