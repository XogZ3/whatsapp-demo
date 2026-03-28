import { z } from "zod";

export const stylistSchema = z.object({
  id: z.string().uuid(),
  salon_id: z.string().uuid(),
  name: z.string(),
  working_hours: z.record(
    z.object({ start: z.string(), end: z.string() })
  ),
  services: z.array(z.string().uuid()),
});

export type Stylist = z.infer<typeof stylistSchema>;
