import type { Context } from "hono";

export interface Env {
  WHATSAPP_TOKEN: string;
  WHATSAPP_VERIFY_TOKEN: string;
  WHATSAPP_PHONE_NUMBER_ID: string;
  WHATSAPP_APP_SECRET: string;
  ANTHROPIC_API_KEY: string;
  SUPABASE_URL: string;
  SUPABASE_SERVICE_KEY: string;
  FIRECRAWL_API_KEY: string;
  RESEND_API_KEY: string;
  NOTIFICATION_EMAIL: string;
}

export type AppContext = Context<{ Bindings: Env }>;

export interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface Conversation {
  id: string;
  phone: string;
  messages: ConversationMessage[];
  state: "active" | "capped" | "converted";
  path: "warm" | "cold" | "browsing" | null;
  email: string | null;
  scope_summary: string | null;
  scraped_url: string | null;
  scraped_content: string | null;
  message_count: number;
  created_at: string;
  updated_at: string;
}

export interface Lead {
  id: string;
  conversation_id: string;
  email: string;
  phone: string;
  name: string | null;
  company_url: string | null;
  scope_summary: string;
  proposal_sent: boolean;
  proposal_sent_at: string | null;
  created_at: string;
}

export interface WhatsAppWebhookBody {
  object: string;
  entry: Array<{
    id: string;
    changes: Array<{
      value: {
        messaging_product: string;
        metadata: {
          display_phone_number: string;
          phone_number_id: string;
        };
        contacts?: Array<{
          profile: { name: string };
          wa_id: string;
        }>;
        messages?: Array<{
          from: string;
          id: string;
          timestamp: string;
          type: string;
          text?: { body: string };
          interactive?: {
            type: string;
            button_reply?: { id: string; title: string };
            list_reply?: { id: string; title: string };
          };
        }>;
        statuses?: Array<unknown>;
      };
      field: string;
    }>;
  }>;
}

export interface WhatsAppMessage {
  from: string;
  id: string;
  timestamp: string;
  type: string;
  text?: { body: string };
  interactive?: {
    type: string;
    button_reply?: { id: string; title: string };
    list_reply?: { id: string; title: string };
  };
}
