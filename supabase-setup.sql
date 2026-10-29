-- Einmal im Supabase SQL Editor ausführen.
create table if not exists app_state (id text primary key, data jsonb not null, updated_at timestamptz default now());
create table if not exists orders (
  id text primary key, week_id text not null, cid text not null, day int not null, item_id text not null,
  qty int not null, updated_at timestamptz default now());
alter table app_state enable row level security;
alter table orders enable row level security;
-- v1: offener Zugriff mit anon-Key (wie bisher: einfacher Schutz, keine echte Sicherheit)
create policy "anon all state" on app_state for all to anon using (true) with check (true);
create policy "anon all orders" on orders for all to anon using (true) with check (true);
