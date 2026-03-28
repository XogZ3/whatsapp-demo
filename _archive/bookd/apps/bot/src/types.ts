export type Bindings = {
  VERIFY_TOKEN: string;
  WHATSAPP_TOKEN: string;
  WHATSAPP_APP_SECRET: string;
  WHATSAPP_PHONE_NUMBER_ID: string;
  SUPABASE_URL: string;
  SUPABASE_SERVICE_KEY: string;
  UPSTASH_REDIS_REST_URL: string;
  UPSTASH_REDIS_REST_TOKEN: string;
  ENVIRONMENT: string;
};

export type Variables = {
  salonId: string;
  rawBody: string;
};

export type AppEnv = {
  Bindings: Bindings;
  Variables: Variables;
};

export interface IncomingMessage {
  from: string;
  id: string;
  timestamp: string;
  type: "text" | "interactive" | "button";
  text?: { body: string };
  interactive?: {
    type: "button_reply" | "list_reply";
    button_reply?: { id: string; title: string };
    list_reply?: { id: string; title: string; description?: string };
  };
  button?: { text: string; payload: string };
}

export interface WebhookPayload {
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
        contacts?: Array<{ profile: { name: string }; wa_id: string }>;
        messages?: IncomingMessage[];
        statuses?: Array<{
          id: string;
          status: string;
          timestamp: string;
          recipient_id: string;
        }>;
      };
      field: string;
    }>;
  }>;
}
