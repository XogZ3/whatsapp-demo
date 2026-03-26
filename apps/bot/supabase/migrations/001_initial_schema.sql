-- Bookd: Initial database schema
-- Multi-tenant salon booking system

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ===================
-- TABLES
-- ===================

create table salons (
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

create table services (
  id uuid primary key default gen_random_uuid(),
  salon_id uuid not null references salons(id) on delete cascade,
  name text not null,
  name_ar text,
  name_de text,
  duration_minutes int not null,
  price_amount numeric not null,
  price_currency text not null default 'AED',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table stylists (
  id uuid primary key default gen_random_uuid(),
  salon_id uuid not null references salons(id) on delete cascade,
  name text not null,
  working_hours jsonb not null default '{}',
  services uuid[] not null default '{}',
  created_at timestamptz not null default now()
);

create table clients (
  id uuid primary key default gen_random_uuid(),
  phone text unique not null,
  name text,
  locale text not null default 'en',
  salon_id uuid references salons(id),
  state_snapshot jsonb,
  created_at timestamptz not null default now(),
  last_interaction timestamptz not null default now()
);

create table bookings (
  id uuid primary key default gen_random_uuid(),
  salon_id uuid not null references salons(id),
  client_id uuid not null references clients(id),
  stylist_id uuid not null references stylists(id),
  service_id uuid not null references services(id),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status text not null default 'confirmed'
    check (status in ('confirmed', 'completed', 'cancelled', 'no_show')),
  reminder_48h_sent boolean not null default false,
  reminder_2h_sent boolean not null default false,
  created_at timestamptz not null default now(),
  cancelled_at timestamptz
);

create table waitlist (
  id uuid primary key default gen_random_uuid(),
  salon_id uuid not null references salons(id),
  client_id uuid not null references clients(id),
  service_id uuid not null references services(id),
  preferred_stylist_id uuid references stylists(id),
  preferred_date date,
  created_at timestamptz not null default now()
);

create table message_log (
  id uuid primary key default gen_random_uuid(),
  whatsapp_message_id text unique not null,
  salon_id uuid not null references salons(id),
  client_id uuid not null references clients(id),
  direction text not null check (direction in ('inbound', 'outbound')),
  message_type text not null check (message_type in ('text', 'interactive', 'flow', 'template')),
  content jsonb,
  created_at timestamptz not null default now()
);

-- ===================
-- INDEXES
-- ===================

create index idx_services_salon on services(salon_id) where active = true;
create index idx_stylists_salon on stylists(salon_id);
create index idx_clients_phone on clients(phone);
create index idx_clients_salon on clients(salon_id);
create index idx_bookings_salon_date on bookings(salon_id, starts_at) where status = 'confirmed';
create index idx_bookings_client on bookings(client_id);
create index idx_bookings_reminders_48h on bookings(starts_at) where status = 'confirmed' and reminder_48h_sent = false;
create index idx_bookings_reminders_2h on bookings(starts_at) where status = 'confirmed' and reminder_2h_sent = false;
create index idx_message_log_whatsapp_id on message_log(whatsapp_message_id);
create index idx_message_log_client on message_log(client_id, created_at desc);
create index idx_waitlist_salon on waitlist(salon_id);

-- ===================
-- ROW LEVEL SECURITY
-- ===================

alter table salons enable row level security;
alter table services enable row level security;
alter table stylists enable row level security;
alter table clients enable row level security;
alter table bookings enable row level security;
alter table waitlist enable row level security;
alter table message_log enable row level security;

-- Salon isolation: each salon owner sees only their data
create policy "salon_own_data" on salons
  for all using (id = (current_setting('app.current_salon_id', true))::uuid);

create policy "salon_isolation" on services
  for all using (salon_id = (current_setting('app.current_salon_id', true))::uuid);

create policy "salon_isolation" on stylists
  for all using (salon_id = (current_setting('app.current_salon_id', true))::uuid);

create policy "salon_isolation" on clients
  for all using (salon_id = (current_setting('app.current_salon_id', true))::uuid);

create policy "salon_isolation" on bookings
  for all using (salon_id = (current_setting('app.current_salon_id', true))::uuid);

create policy "salon_isolation" on waitlist
  for all using (salon_id = (current_setting('app.current_salon_id', true))::uuid);

create policy "salon_isolation" on message_log
  for all using (salon_id = (current_setting('app.current_salon_id', true))::uuid);

-- Service role bypass for the bot backend (uses service_role key)
create policy "service_role_bypass" on salons for all to service_role using (true);
create policy "service_role_bypass" on services for all to service_role using (true);
create policy "service_role_bypass" on stylists for all to service_role using (true);
create policy "service_role_bypass" on clients for all to service_role using (true);
create policy "service_role_bypass" on bookings for all to service_role using (true);
create policy "service_role_bypass" on waitlist for all to service_role using (true);
create policy "service_role_bypass" on message_log for all to service_role using (true);
