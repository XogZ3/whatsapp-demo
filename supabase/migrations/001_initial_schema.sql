-- Savi AI Product Advisor Bot — initial schema

-- Conversations table: one row per phone number
CREATE TABLE IF NOT EXISTS conversations (
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

CREATE INDEX idx_conversations_phone ON conversations(phone);
CREATE INDEX idx_conversations_updated_at ON conversations(updated_at);

-- Leads table: captured email + scope for proposal
CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id),
  email text NOT NULL,
  phone text NOT NULL,
  name text,
  company_url text,
  scope_summary text NOT NULL,
  proposal_sent boolean NOT NULL DEFAULT false,
  proposal_sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_leads_email ON leads(email);

-- Message log: wamid deduplication
CREATE TABLE IF NOT EXISTS message_log (
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
  UPDATE conversations
  SET message_count = conversations.message_count + 1,
      updated_at = now()
  WHERE conversations.phone = p_phone
    AND conversations.message_count < p_cap
  RETURNING
    conversations.id,
    conversations.phone,
    conversations.messages,
    conversations.state,
    conversations.path,
    conversations.email,
    conversations.scope_summary,
    conversations.scraped_url,
    conversations.scraped_content,
    conversations.message_count,
    conversations.created_at,
    conversations.updated_at;
$$ LANGUAGE sql;
