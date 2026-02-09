-- Migration: Optimize schema for ML readiness
-- Drops and recreates profiles + behavioral_events with proper enums,
-- length constraints, ML-ready columns, and optimized indexes.
-- Safe to run: both tables are empty and no app code queries them yet.

-- =============================================================================
-- Step 1: Drop existing tables (cascade drops triggers, policies, indexes)
-- =============================================================================

drop table if exists public.behavioral_events cascade;
drop table if exists public.profiles cascade;

-- =============================================================================
-- Step 2: Create PostgreSQL enums
-- =============================================================================

create type public.role_category as enum (
  'lender',
  'agent',
  'attorney',
  'title',
  'inspector',
  'appraiser',
  'other'
);

create type public.event_type as enum (
  -- Auth
  'signup',
  'login',
  'logout',
  'session_start',
  'session_end',
  'email_verified',
  -- Profile
  'profile_update',
  'profile_view',
  -- Video
  'video_upload',
  'video_record',
  -- Feed
  'video_view',
  'video_like',
  'video_unlike',
  'feed_scroll',
  -- Deck
  'video_swipe_left',
  'video_swipe_right',
  'deck_change',
  -- Billing
  'subscription_start',
  'subscription_cancel',
  'subscription_renewed',
  -- Survey
  'survey_start',
  'survey_complete',
  'survey_skip',
  -- Notifications
  'notification_received',
  'notification_tapped',
  -- Lifecycle
  'app_open',
  'app_close',
  'app_background'
);

create type public.device_platform as enum (
  'ios',
  'android',
  'web'
);

-- =============================================================================
-- Step 3: Recreate profiles table with ML-ready columns
-- =============================================================================

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name varchar(100),
  avatar_url text,
  role_category public.role_category,
  bio varchar(1000),
  service_area varchar(100) not null default 'Houston',
  years_experience smallint check (years_experience >= 0 and years_experience <= 99),
  license_number varchar(50),
  specializations text[],
  is_verified boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable RLS
alter table public.profiles enable row level security;

-- RLS Policies
create policy "Authenticated users can view all profiles"
  on public.profiles for select
  to authenticated
  using (true);

create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

-- Auto-update updated_at on row change
-- (handle_updated_at function already exists from migration 1)
create trigger profiles_updated_at
  before update on public.profiles
  for each row
  execute function public.handle_updated_at();

-- Recreate auto-create profile trigger
-- The trigger lives on auth.users so it was NOT dropped by cascade above.
-- Drop it first, then recreate to ensure clean state.
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- =============================================================================
-- Step 4: Recreate behavioral_events table with enums and constraints
-- =============================================================================

create table public.behavioral_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  session_id uuid,
  event_type public.event_type not null,
  event_data jsonb not null default '{}'::jsonb
    check (jsonb_typeof(event_data) = 'object'),
  device_platform public.device_platform,
  device_os_version varchar(20),
  app_version varchar(20),
  geo_area varchar(100) not null default 'Houston',
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

-- Optimized indexes: composite replaces 3 single-column indexes
create index idx_behavioral_events_user_type_time
  on public.behavioral_events(user_id, event_type, created_at);

create index idx_behavioral_events_created_at
  on public.behavioral_events(created_at);

create index idx_behavioral_events_geo_area
  on public.behavioral_events(geo_area);
