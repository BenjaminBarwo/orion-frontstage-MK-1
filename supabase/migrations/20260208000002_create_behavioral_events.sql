-- Migration: Create behavioral_events table
-- Immutable event log for ML training data foundation

create table public.behavioral_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  session_id uuid,
  event_type text not null,
  event_data jsonb default '{}'::jsonb,
  device_platform text,
  device_os_version text,
  app_version text,
  geo_area text not null default 'Houston',
  created_at timestamptz not null default now()
);

-- Enable RLS
alter table public.behavioral_events enable row level security;

-- RLS Policies
create policy "Users can insert their own events"
  on public.behavioral_events for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can view their own events"
  on public.behavioral_events for select
  to authenticated
  using (auth.uid() = user_id);

-- Indexes for query performance
create index idx_behavioral_events_user_id on public.behavioral_events(user_id);
create index idx_behavioral_events_event_type on public.behavioral_events(event_type);
create index idx_behavioral_events_created_at on public.behavioral_events(created_at);
