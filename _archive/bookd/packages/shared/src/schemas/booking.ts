import { z } from "zod";

export const bookingStatusSchema = z.enum([
  "confirmed",
  "completed",
  "cancelled",
  "no_show",
]);

export const bookingSchema = z.object({
  id: z.string().uuid(),
  salon_id: z.string().uuid(),
  client_id: z.string().uuid(),
  stylist_id: z.string().uuid(),
  service_id: z.string().uuid(),
  starts_at: z.string().datetime(),
  ends_at: z.string().datetime(),
  status: bookingStatusSchema.default("confirmed"),
  reminder_48h_sent: z.boolean().default(false),
  reminder_2h_sent: z.boolean().default(false),
  created_at: z.string().datetime(),
  cancelled_at: z.string().datetime().nullable(),
});

export type Booking = z.infer<typeof bookingSchema>;
