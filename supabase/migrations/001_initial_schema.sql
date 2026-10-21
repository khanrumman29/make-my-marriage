-- =============================================================================
-- MAKE MY MARRIAGE - Supabase Initial Schema & Row Level Security Migration
-- Migration: 001_initial_schema.sql
-- =============================================================================

create extension if not exists pgcrypto;

-- -----------------------------------------------------------------------------
-- 1. Profiles Table (Linked to Supabase Auth)
-- -----------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- 2. Weddings Workspace Table
-- -----------------------------------------------------------------------------
create table if not exists public.weddings (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  couple_names text,
  wedding_date date,
  venue text,
  city text,
  currency_code text not null default 'INR',
  total_budget_paise bigint not null default 0
    check (total_budget_paise >= 0),
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- 3. Wedding Members (Role-Based Workspace Access)
-- -----------------------------------------------------------------------------
create table if not exists public.wedding_members (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references public.weddings(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'family_member'
    check (role in ('admin', 'family_member', 'viewer')),
  relation text,
  joined_at timestamptz not null default now(),
  unique (wedding_id, user_id)
);

-- -----------------------------------------------------------------------------
-- 4. Wedding Functions / Events
-- -----------------------------------------------------------------------------
create table if not exists public.wedding_functions (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references public.weddings(id) on delete cascade,
  name text not null,
  event_date timestamptz,
  start_time text,
  end_time text,
  venue text,
  planned_budget_paise bigint not null default 0
    check (planned_budget_paise >= 0),
  notes text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- 5. Expenses
-- -----------------------------------------------------------------------------
create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references public.weddings(id) on delete cascade,
  function_id uuid references public.wedding_functions(id) on delete set null,
  title text not null,
  category text not null default 'Other',
  amount_paise bigint not null check (amount_paise >= 0),
  amount_paid_paise bigint not null default 0
    check (amount_paid_paise >= 0 and amount_paid_paise <= amount_paise),
  paid_to text,
  payment_status text not null default 'pending'
    check (payment_status in ('pending', 'paid', 'partially_paid')),
  expense_date date not null default current_date,
  notes text,
  receipt_path text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- 6. Guests & RSVPs
-- -----------------------------------------------------------------------------
create table if not exists public.guests (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references public.weddings(id) on delete cascade,
  full_name text not null,
  phone text,
  email text,
  side text check (side in ('bride', 'groom', 'both')),
  guest_count integer not null default 1 check (guest_count > 0),
  rsvp_status text not null default 'pending'
    check (rsvp_status in ('pending', 'invited', 'accepted', 'declined')),
  notes text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- 7. Invitations
-- -----------------------------------------------------------------------------
create table if not exists public.invitations (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references public.weddings(id) on delete cascade,
  guest_id uuid references public.guests(id) on delete set null,
  title text not null default 'Wedding Invitation',
  channel text not null default 'whatsapp'
    check (channel in ('whatsapp', 'email', 'printed', 'other')),
  status text not null default 'draft'
    check (status in ('draft', 'sent', 'delivered', 'failed')),
  sent_at timestamptz,
  public_token text unique default encode(gen_random_bytes(16), 'hex'),
  is_published boolean not null default false,
  invitation_file_path text,
  notes text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- 8. Tasks
-- -----------------------------------------------------------------------------
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references public.weddings(id) on delete cascade,
  function_id uuid references public.wedding_functions(id) on delete set null,
  title text not null,
  description text,
  assigned_to uuid references auth.users(id),
  due_at timestamptz,
  priority text not null default 'medium'
    check (priority in ('low', 'medium', 'high')),
  status text not null default 'todo'
    check (status in ('todo', 'in_progress', 'done')),
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- 9. Announcements / Family Messages
-- -----------------------------------------------------------------------------
create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references public.weddings(id) on delete cascade,
  title text not null,
  message text not null,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =============================================================================
-- INDEXES
-- =============================================================================
create index if not exists wedding_members_user_id_idx
  on public.wedding_members(user_id);
create index if not exists wedding_members_lookup_idx
  on public.wedding_members(wedding_id, user_id);

create index if not exists wedding_functions_wedding_date_idx
  on public.wedding_functions(wedding_id, event_date);

create index if not exists expenses_wedding_date_idx
  on public.expenses(wedding_id, expense_date desc);

create index if not exists guests_wedding_name_idx
  on public.guests(wedding_id, full_name);

create index if not exists invitations_wedding_status_idx
  on public.invitations(wedding_id, status);

create index if not exists invitations_public_token_idx
  on public.invitations(public_token);

create index if not exists tasks_wedding_status_due_idx
  on public.tasks(wedding_id, status, due_at);

create index if not exists announcements_wedding_created_idx
  on public.announcements(wedding_id, created_at desc);

-- =============================================================================
-- SECURITY DEFINER HELPER FUNCTIONS (Avoid RLS recursion)
-- =============================================================================

create or replace function public.is_wedding_member(lookup_wedding_id uuid, lookup_user_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.wedding_members
    where wedding_id = lookup_wedding_id
      and user_id = lookup_user_id
  );
$$;

create or replace function public.is_wedding_admin(lookup_wedding_id uuid, lookup_user_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.wedding_members
    where wedding_id = lookup_wedding_id
      and user_id = lookup_user_id
      and role = 'admin'
  );
$$;

create or replace function public.is_wedding_editor(lookup_wedding_id uuid, lookup_user_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.wedding_members
    where wedding_id = lookup_wedding_id
      and user_id = lookup_user_id
      and role in ('admin', 'family_member')
  );
$$;

-- =============================================================================
-- ATOMIC SECURE ONBOARDING RPC: create_wedding_workspace
-- Creates a wedding and assigns authenticated user as first admin atomically.
-- Does not trust client-supplied user IDs or roles.
-- =============================================================================
create or replace function public.create_wedding_workspace(
  p_name text,
  p_couple_names text default null,
  p_wedding_date date default null,
  p_venue text default null,
  p_city text default null,
  p_budget_paise bigint default 0
)
returns public.weddings
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_wedding public.weddings;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'Unauthorized: authentication is required to create a workspace.';
  end if;

  insert into public.weddings (
    name,
    couple_names,
    wedding_date,
    venue,
    city,
    total_budget_paise,
    created_by
  ) values (
    p_name,
    p_couple_names,
    p_wedding_date,
    p_venue,
    p_city,
    greatest(coalesce(p_budget_paise, 0), 0),
    v_user_id
  ) returning * into v_wedding;

  insert into public.wedding_members (
    wedding_id,
    user_id,
    role
  ) values (
    v_wedding.id,
    v_user_id,
    'admin'
  );

  return v_wedding;
end;
$$;

-- =============================================================================
-- SAFE PUBLIC INVITATION RPC
-- Allows anyone with a public token to view ONLY safe non-sensitive event data
-- =============================================================================
create or replace function public.get_public_invitation(p_token text)
returns json
language sql
security definer
set search_path = public
stable
as $$
  select json_build_object(
    'title', i.title,
    'is_published', i.is_published,
    'sent_at', i.sent_at,
    'wedding_name', w.name,
    'couple_names', w.couple_names,
    'wedding_date', w.wedding_date,
    'venue', w.venue,
    'city', w.city
  )
  from public.invitations i
  join public.weddings w on w.id = i.wedding_id
  where i.public_token = p_token
    and i.is_published = true;
$$;

-- =============================================================================
-- AUTH PROFILE SYNC TRIGGER
-- Automatically creates a public profile row when a new user signs up
-- =============================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    coalesce(new.raw_user_meta_data->>'avatar_url', '')
  )
  on conflict (id) do update
  set
    full_name = coalesce(excluded.full_name, public.profiles.full_name),
    avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url),
    updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================

alter table public.profiles enable row level security;
alter table public.weddings enable row level security;
alter table public.wedding_members enable row level security;
alter table public.wedding_functions enable row level security;
alter table public.expenses enable row level security;
alter table public.guests enable row level security;
alter table public.invitations enable row level security;
alter table public.tasks enable row level security;
alter table public.announcements enable row level security;

-- Profiles: users can read their own or co-members; users can only update their own
drop policy if exists "Profiles read policy" on public.profiles;
create policy "Profiles read policy" on public.profiles
  for select using (
    auth.uid() = id
    or exists (
      select 1 from public.wedding_members m1
      join public.wedding_members m2 on m1.wedding_id = m2.wedding_id
      where m1.user_id = auth.uid() and m2.user_id = public.profiles.id
    )
  );

drop policy if exists "Profiles update policy" on public.profiles;
create policy "Profiles update policy" on public.profiles
  for update using (auth.uid() = id);

drop policy if exists "Profiles insert policy" on public.profiles;
create policy "Profiles insert policy" on public.profiles
  for insert with check (auth.uid() = id);

-- Weddings: workspace isolation
drop policy if exists "Weddings select policy" on public.weddings;
create policy "Weddings select policy" on public.weddings
  for select using (public.is_wedding_member(id, auth.uid()));

drop policy if exists "Weddings update policy" on public.weddings;
create policy "Weddings update policy" on public.weddings
  for update using (public.is_wedding_admin(id, auth.uid()));

drop policy if exists "Weddings insert policy" on public.weddings;
create policy "Weddings insert policy" on public.weddings
  for insert with check (created_by = auth.uid());

-- Wedding Members
drop policy if exists "Wedding members select policy" on public.wedding_members;
create policy "Wedding members select policy" on public.wedding_members
  for select using (public.is_wedding_member(wedding_id, auth.uid()));

drop policy if exists "Wedding members insert policy" on public.wedding_members;
create policy "Wedding members insert policy" on public.wedding_members
  for insert with check (public.is_wedding_admin(wedding_id, auth.uid()));

drop policy if exists "Wedding members update policy" on public.wedding_members;
create policy "Wedding members update policy" on public.wedding_members
  for update using (
    public.is_wedding_admin(wedding_id, auth.uid())
    and user_id <> auth.uid() -- cannot self-promote or modify own role
  );

drop policy if exists "Wedding members delete policy" on public.wedding_members;
create policy "Wedding members delete policy" on public.wedding_members
  for delete using (
    public.is_wedding_admin(wedding_id, auth.uid())
    and user_id <> auth.uid() -- cannot delete self as owner/admin
  );

-- Wedding Functions
drop policy if exists "Wedding functions select policy" on public.wedding_functions;
create policy "Wedding functions select policy" on public.wedding_functions
  for select using (public.is_wedding_member(wedding_id, auth.uid()));

drop policy if exists "Wedding functions insert policy" on public.wedding_functions;
create policy "Wedding functions insert policy" on public.wedding_functions
  for insert with check (public.is_wedding_editor(wedding_id, auth.uid()));

drop policy if exists "Wedding functions update policy" on public.wedding_functions;
create policy "Wedding functions update policy" on public.wedding_functions
  for update using (public.is_wedding_editor(wedding_id, auth.uid()));

drop policy if exists "Wedding functions delete policy" on public.wedding_functions;
create policy "Wedding functions delete policy" on public.wedding_functions
  for delete using (public.is_wedding_editor(wedding_id, auth.uid()));

-- Expenses
drop policy if exists "Expenses select policy" on public.expenses;
create policy "Expenses select policy" on public.expenses
  for select using (public.is_wedding_member(wedding_id, auth.uid()));

drop policy if exists "Expenses insert policy" on public.expenses;
create policy "Expenses insert policy" on public.expenses
  for insert with check (public.is_wedding_editor(wedding_id, auth.uid()));

drop policy if exists "Expenses update policy" on public.expenses;
create policy "Expenses update policy" on public.expenses
  for update using (public.is_wedding_editor(wedding_id, auth.uid()));

drop policy if exists "Expenses delete policy" on public.expenses;
create policy "Expenses delete policy" on public.expenses
  for delete using (public.is_wedding_editor(wedding_id, auth.uid()));

-- Guests
drop policy if exists "Guests select policy" on public.guests;
create policy "Guests select policy" on public.guests
  for select using (public.is_wedding_member(wedding_id, auth.uid()));

drop policy if exists "Guests insert policy" on public.guests;
create policy "Guests insert policy" on public.guests
  for insert with check (public.is_wedding_editor(wedding_id, auth.uid()));

drop policy if exists "Guests update policy" on public.guests;
create policy "Guests update policy" on public.guests
  for update using (public.is_wedding_editor(wedding_id, auth.uid()));

drop policy if exists "Guests delete policy" on public.guests;
create policy "Guests delete policy" on public.guests
  for delete using (public.is_wedding_editor(wedding_id, auth.uid()));

-- Invitations
drop policy if exists "Invitations select member policy" on public.invitations;
create policy "Invitations select member policy" on public.invitations
  for select using (
    public.is_wedding_member(wedding_id, auth.uid())
    or is_published = true
  );

drop policy if exists "Invitations insert policy" on public.invitations;
create policy "Invitations insert policy" on public.invitations
  for insert with check (public.is_wedding_editor(wedding_id, auth.uid()));

drop policy if exists "Invitations update policy" on public.invitations;
create policy "Invitations update policy" on public.invitations
  for update using (public.is_wedding_editor(wedding_id, auth.uid()));

drop policy if exists "Invitations delete policy" on public.invitations;
create policy "Invitations delete policy" on public.invitations
  for delete using (public.is_wedding_editor(wedding_id, auth.uid()));

-- Tasks
drop policy if exists "Tasks select policy" on public.tasks;
create policy "Tasks select policy" on public.tasks
  for select using (public.is_wedding_member(wedding_id, auth.uid()));

drop policy if exists "Tasks insert policy" on public.tasks;
create policy "Tasks insert policy" on public.tasks
  for insert with check (public.is_wedding_editor(wedding_id, auth.uid()));

drop policy if exists "Tasks update policy" on public.tasks;
create policy "Tasks update policy" on public.tasks
  for update using (public.is_wedding_editor(wedding_id, auth.uid()));

drop policy if exists "Tasks delete policy" on public.tasks;
create policy "Tasks delete policy" on public.tasks
  for delete using (public.is_wedding_editor(wedding_id, auth.uid()));

-- Announcements
drop policy if exists "Announcements select policy" on public.announcements;
create policy "Announcements select policy" on public.announcements
  for select using (public.is_wedding_member(wedding_id, auth.uid()));

drop policy if exists "Announcements insert policy" on public.announcements;
create policy "Announcements insert policy" on public.announcements
  for insert with check (public.is_wedding_editor(wedding_id, auth.uid()));

drop policy if exists "Announcements update policy" on public.announcements;
create policy "Announcements update policy" on public.announcements
  for update using (public.is_wedding_editor(wedding_id, auth.uid()));

drop policy if exists "Announcements delete policy" on public.announcements;
create policy "Announcements delete policy" on public.announcements
  for delete using (public.is_wedding_editor(wedding_id, auth.uid()));
