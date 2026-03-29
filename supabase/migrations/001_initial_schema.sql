-- Savi AI Product Advisor Bot — initial schema

-- Conversations table: one row per phone number
CREATE TABLE IF NOT EXISTS wa_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone text UNIQUE NOT NULL,
  messages jsonb NOT NULL DEFAULT '[]'::jsonb,
  state text NOT NULL DEFAULT 'active' CHECK (state IN ('active', 'capped', 'converted')),
  path text CHECK (path IN ('warm', 'cold', 'browsing')),
  email text,
  scope_summary text,
  scraped_url text,
  scraped_content text,
  message_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_wa_conversations_phone ON wa_conversations(phone);
CREATE INDEX idx_wa_conversations_updated_at ON wa_conversations(updated_at);

-- Leads table: captured email + scope for proposal
CREATE TABLE IF NOT EXISTS wa_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES wa_conversations(id),
  email text NOT NULL,
  phone text NOT NULL,
  name text,
  company_url text,
  scope_summary text NOT NULL,
  proposal_sent boolean NOT NULL DEFAULT false,
  proposal_sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_wa_leads_email ON wa_leads(email);

-- Message log: wamid deduplication
CREATE TABLE IF NOT EXISTS wa_message_log (
  wamid text PRIMARY KEY,
  phone text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Function to atomically increment message count with cap check
CREATE OR REPLACE FUNCTION increment_message_count(p_phone text, p_cap integer)
RETURNS TABLE(
  id uuid,
  phone text,
  messages jsonb,
  state text,
  path text,
  email text,
  scope_summary text,
  scraped_url text,
  scraped_content text,
  message_count integer,
  created_at timestamptz,
  updated_at timestamptz
) AS $$
  UPDATE wa_conversations
  SET message_count = wa_conversations.message_count + 1,
      updated_at = now()
  WHERE wa_conversations.phone = p_phone
    AND wa_conversations.message_count < p_cap
  RETURNING
    wa_conversations.id,
    wa_conversations.phone,
    wa_conversations.messages,
    wa_conversations.state,
    wa_conversations.path,
    wa_conversations.email,
    wa_conversations.scope_summary,
    wa_conversations.scraped_url,
    wa_conversations.scraped_content,
    wa_conversations.message_count,
    wa_conversations.created_at,
    wa_conversations.updated_at;
$$ LANGUAGE sql;

-- Function to append a message to conversation JSONB (atomic, no read-modify-write)
CREATE OR REPLACE FUNCTION append_conversation_message(
  p_conversation_id uuid,
  p_message jsonb
) RETURNS void AS $$
  UPDATE wa_conversations
  SET messages = messages || jsonb_build_array(p_message),
      updated_at = now()
  WHERE id = p_conversation_id;
$$ LANGUAGE sql;

-- Row Level Security
ALTER TABLE wa_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE wa_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE wa_message_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on wa_conversations" ON wa_conversations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on wa_leads" ON wa_leads FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on wa_message_log" ON wa_message_log FOR ALL USING (true) WITH CHECK (true);
