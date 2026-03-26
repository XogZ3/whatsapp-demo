import { z } from "zod";

export const waitlistSchema = z.object({
  id: z.string().uuid(),
  salon_id: z.string().uuid(),
  client_id: z.string().uuid(),
  service_id: z.string().uuid(),
  preferred_stylist_id: z.string().uuid().nullable(),
  preferred_date: z.string().nullable(),
  created_at: z.string().datetime(),
});

export type Waitlist = z.infer<typeof waitlistSchema>;
