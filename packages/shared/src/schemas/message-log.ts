import { z } from "zod";

export const messageDirectionSchema = z.enum(["inbound", "outbound"]);
export const messageTypeSchema = z.enum([
  "text",
  "interactive",
  "flow",
  "template",
]);

export const messageLogSchema = z.object({
  id: z.string().uuid(),
  whatsapp_message_id: z.string(),
  salon_id: z.string().uuid(),
  client_id: z.string().uuid(),
  direction: messageDirectionSchema,
  message_type: messageTypeSchema,
  content: z.unknown().nullable(),
  created_at: z.string().datetime(),
});

export type MessageLog = z.infer<typeof messageLogSchema>;
