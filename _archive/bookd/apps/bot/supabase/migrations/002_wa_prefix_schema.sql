-- Bookd: WhatsApp bot tables (wa_ prefixed for shared Supabase project)

create extension if not exists "pgcrypto";

-- ===================
-- TABLES
-- ===================

create table wa_salons (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  whatsapp_number text unique not null,
  timezone text not null default 'Asia/Dubai',
  locale text not null default 'en',
  address text,
  latitude numeric,
  longitude numeric,
  opening_hours jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table wa_services (
  id uuid primary key default gen_random_uuid(),
  salon_id uuid not null references wa_salons(id) on delete cascade,
  name text not null,
  name_ar text,
  name_de text,
  duration_minutes int not null,
  price_amount numeric not null,
  price_currency text not null default 'AED',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table wa_stylists (
  id uuid primary key default gen_random_uuid(),
  salon_id uuid not null references wa_salons(id) on delete cascade,
  name text not null,
  working_hours jsonb not null default '{}',
  services uuid[] not null default '{}',
  created_at timestamptz not null default now()
);

create table wa_clients (
  id uuid primary key default gen_random_uuid(),
  phone text unique not null,
  name text,
  locale text not null default 'en',
  salon_id uuid references wa_salons(id),
  state_snapshot jsonb,
  created_at timestamptz not null default now(),
  last_interaction timestamptz not null default now()
);

create table wa_bookings (
  id uuid primary key default gen_random_uuid(),
  salon_id uuid not null references wa_salons(id),
  client_id uuid not null references wa_clients(id),
  stylist_id uuid not null references wa_stylists(id),
  service_id uuid not null references wa_services(id),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status text not null default 'confirmed'
    check (status in ('confirmed', 'completed', 'cancelled', 'no_show')),
  reminder_48h_sent boolean not null default false,
  reminder_2h_sent boolean not null default false,
  created_at timestamptz not null default now(),
  cancelled_at timestamptz
);

create table wa_waitlist (
  id uuid primary key default gen_random_uuid(),
  salon_id uuid not null references wa_salons(id),
  client_id uuid not null references wa_clients(id),
  service_id uuid not null references wa_services(id),
  preferred_stylist_id uuid references wa_stylists(id),
  preferred_date date,
  created_at timestamptz not null default now()
);

create table wa_message_log (
  id uuid primary key default gen_random_uuid(),
  whatsapp_message_id text unique not null,
  salon_id uuid not null references wa_salons(id),
  client_id uuid not null references wa_clients(id),
  direction text not null check (direction in ('inbound', 'outbound')),
  message_type text not null check (message_type in ('text', 'interactive', 'flow', 'template')),
  content jsonb,
  created_at timestamptz not null default now()
);

-- ===================
-- INDEXES
-- ===================

create index idx_wa_services_salon on wa_services(salon_id) where active = true;
create index idx_wa_stylists_salon on wa_stylists(salon_id);
create index idx_wa_clients_phone on wa_clients(phone);
create index idx_wa_clients_salon on wa_clients(salon_id);
create index idx_wa_bookings_salon_date on wa_bookings(salon_id, starts_at) where status = 'confirmed';
create index idx_wa_bookings_client on wa_bookings(client_id);
create index idx_wa_bookings_reminders_48h on wa_bookings(starts_at) where status = 'confirmed' and reminder_48h_sent = false;
create index idx_wa_bookings_reminders_2h on wa_bookings(starts_at) where status = 'confirmed' and reminder_2h_sent = false;
create index idx_wa_message_log_whatsapp_id on wa_message_log(whatsapp_message_id);
create index idx_wa_message_log_client on wa_message_log(client_id, created_at desc);
create index idx_wa_waitlist_salon on wa_waitlist(salon_id);

-- ===================
-- ROW LEVEL SECURITY
-- ===================

alter table wa_salons enable row level security;
alter table wa_services enable row level security;
alter table wa_stylists enable row level security;
alter table wa_clients enable row level security;
alter table wa_bookings enable row level security;
alter table wa_waitlist enable row level security;
alter table wa_message_log enable row level security;

-- Service role bypass for the bot backend (uses service_role key)
create policy "service_role_bypass" on wa_salons for all to service_role using (true);
create policy "service_role_bypass" on wa_services for all to service_role using (true);
create policy "service_role_bypass" on wa_stylists for all to service_role using (true);
create policy "service_role_bypass" on wa_clients for all to service_role using (true);
create policy "service_role_bypass" on wa_bookings for all to service_role using (true);
create policy "service_role_bypass" on wa_waitlist for all to service_role using (true);
create policy "service_role_bypass" on wa_message_log for all to service_role using (true);
