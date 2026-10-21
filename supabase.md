# Make My Marriage — Supabase Database Specification

## 1. Project Overview

Build the Make My Marriage wedding-management application using Supabase as the backend.

### Technology Stack
- Frontend: React + Vite + Tailwind CSS
- Database: Supabase PostgreSQL
- Authentication: Supabase Auth
- Authorization: Supabase Row Level Security (RLS)
- File storage: Supabase Storage, if required
- Deployment: Vercel or another compatible hosting provider

**Important:** Use Supabase, NOT MongoDB. Do not create an unnecessary Express backend. Use the official `@supabase/supabase-js` client and secure database policies.

## 2. Main Features

Keep the application simple and modern with five main sections:

1. Dashboard
2. Expenses
3. Invitations
4. Family Coordination
5. Settings & Admin

Follow the existing `PRD.md` and `Design.md`. Preserve the existing UI and project structure wherever possible.

## 3. Supabase Configuration

Install the Supabase JavaScript library:

```bash
npm install @supabase/supabase-js
```

Create `.env.local` in the project root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_publishable_or_anon_key
```

Use the appropriate publishable/anon key provided by the Supabase dashboard.

Add `.env.local` to `.gitignore`. Create `.env.example` with placeholder values only.

Create `src/lib/supabase.js`:

```javascript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
```

Never expose a Supabase service-role or secret key in frontend code.

## 4. Database Tables

Create these PostgreSQL tables:

| Table | Purpose |
|---|---|
| `profiles` | User profile linked to Supabase Auth |
| `weddings` | Wedding details, venue, date and budget |
| `wedding_members` | Users and their roles in a wedding |
| `wedding_functions` | Mehndi, Nikah, Reception and other functions |
| `expenses` | Expenses, categories, payments and receipts |
| `guests` | Guest list and RSVP status |
| `invitations` | Invitation details and delivery status |
| `tasks` | Family tasks, assignees and deadlines |
| `announcements` | Updates shared with wedding members |

Use UUID primary keys, foreign keys, timestamps, and appropriate indexes.

Every wedding-related table must contain a `wedding_id` that references `weddings.id`.

## 5. SQL Database Schema

Create a migration file at:

`supabase/migrations/001_initial_schema.sql`

Use the following schema:

```sql
create extension if not exists pgcrypto;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.weddings (
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

create table public.wedding_members (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references public.weddings(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'family_member'
    check (role in ('admin', 'family_member', 'viewer')),
  joined_at timestamptz not null default now(),
  unique (wedding_id, user_id)
);

create table public.wedding_functions (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references public.weddings(id) on delete cascade,
  name text not null,
  event_date timestamptz,
  venue text,
  notes text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.expenses (
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

create table public.guests (
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

create table public.invitations (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references public.weddings(id) on delete cascade,
  guest_id uuid references public.guests(id) on delete set null,
  title text not null default 'Wedding Invitation',
  channel text not null default 'whatsapp'
    check (channel in ('whatsapp', 'email', 'printed', 'other')),
  status text not null default 'draft'
    check (status in ('draft', 'sent', 'delivered', 'failed')),
  sent_at timestamptz,
  invitation_file_path text,
  notes text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references public.weddings(id) on delete cascade,
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

create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references public.weddings(id) on delete cascade,
  title text not null,
  message text not null,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index wedding_members_user_id_idx
  on public.wedding_members(user_id);

create index wedding_functions_wedding_date_idx
  on public.wedding_functions(wedding_id, event_date);

create index expenses_wedding_date_idx
  on public.expenses(wedding_id, expense_date desc);

create index guests_wedding_name_idx
  on public.guests(wedding_id, full_name);

create index invitations_wedding_status_idx
  on public.invitations(wedding_id, status);

create index tasks_wedding_status_due_idx
  on public.tasks(wedding_id, status, due_at);

create index announcements_wedding_created_idx
  on public.announcements(wedding_id, created_at desc);
```

Review the migration before applying it to an existing database. Do not drop existing tables or data.

## 6. Authentication

Use Supabase Auth for:

- Sign up with email and password
- Login and logout
- Password reset
- Session persistence
- Protected routes
- Friendly authentication error messages

Do not store passwords in the `profiles` table.

Example login:

```javascript
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password,
});

if (error) {
  throw error;
}
```

Example logout:

```javascript
const { error } = await supabase.auth.signOut();

if (error) {
  throw error;
}
```

Create a profile when a user signs up. Ensure the profile creation process cannot assign privileged roles.

## 7. Row Level Security (RLS)

**Security is mandatory.** Enable RLS on all tables accessible through the Supabase API.

```sql
alter table public.profiles enable row level security;
alter table public.weddings enable row level security;
alter table public.wedding_members enable row level security;
alter table public.wedding_functions enable row level security;
alter table public.expenses enable row level security;
alter table public.guests enable row level security;
alter table public.invitations enable row level security;
alter table public.tasks enable row level security;
alter table public.announcements enable row level security;
```

Create carefully reviewed RLS policies that enforce the following rules:

- Users can read and update only their own profile.
- Users can access only weddings where they have a membership.
- Admins can update wedding settings and manage members.
- Family members can manage permitted wedding records.
- Viewers can read permitted records but cannot modify them.
- Users cannot access another wedding by changing `wedding_id`.
- Users cannot grant themselves admin access.
- Users cannot change their own role.
- Users cannot insert arbitrary membership records.

Use PostgreSQL helper functions or carefully designed RLS policies to check wedding membership and roles. Use a fixed `search_path` for security-definer functions and restrict their execution permissions.

### Safe wedding creation

Implement a trusted, atomic onboarding workflow that:

1. Requires an authenticated user.
2. Creates the wedding with `created_by` set to the authenticated user.
3. Adds that same user as the initial admin.
4. Does not trust client-supplied user IDs or roles.
5. Allows only existing admins to add or invite other members.

Use a validated PostgreSQL RPC or a trusted Supabase Edge Function for this workflow. Do not solve onboarding by allowing unrestricted inserts into `wedding_members`.

Before production, test all RLS policies using multiple accounts and multiple wedding workspaces. Do not consider security complete until cross-wedding access tests pass.

## 8. Roles and Permissions

| Role | Permissions |
|---|---|
| `admin` | Manage wedding settings, members and all wedding records |
| `family_member` | Manage permitted expenses, guests, invitations, functions, tasks and announcements |
| `viewer` | View permitted wedding information without editing |

Enforce permissions in RLS, not just in frontend buttons or routes.

## 9. Dashboard Calculations

Calculate dashboard information from real database records:

- Total Budget: `weddings.total_budget_paise`
- Total Paid: sum of `expenses.amount_paid_paise`
- Pending Payments: sum of `amount_paise - amount_paid_paise`
- Remaining Budget: total budget minus total paid
- Upcoming Functions: future events ordered by date
- Pending Tasks: tasks whose status is not `done`
- RSVP Summary: guest counts grouped by RSVP status
- Recent Expenses: latest expenses for the active wedding

All monetary values should be stored as integer paise. Display values in Indian rupees (INR) in the UI.

## 10. Optional Supabase Storage

If required, create a private storage bucket called `wedding-files` for invitation cards and receipts.

Requirements:

- Keep the bucket private.
- Store file paths in the database, not public URLs.
- Use Storage RLS policies to check wedding membership.
- Validate file size and file type.
- Use short-lived signed URLs for private downloads.
- Never expose private receipts publicly.

Do not implement file uploads unless required by the current project scope.

## 11. Suggested Project Structure

Adapt this structure to the existing project rather than replacing it unnecessarily.

```text
src/
├── components/
│   ├── layout/
│   ├── dashboard/
│   ├── expenses/
│   ├── invitations/
│   ├── tasks/
│   └── ui/
├── pages/
│   ├── Login.jsx
│   ├── Signup.jsx
│   ├── Dashboard.jsx
│   ├── Expenses.jsx
│   ├── Invitations.jsx
│   ├── FamilyCoordination.jsx
│   └── Settings.jsx
├── hooks/
├── lib/
│   └── supabase.js
├── services/
│   ├── weddings.js
│   ├── expenses.js
│   ├── guests.js
│   └── tasks.js
└── App.jsx
```

Keep database operations in reusable service modules or hooks. Add loading states, empty states, validation, and error handling.

## 12. Implementation Plan

### Phase 1 — Inspect
- Read `PRD.md`, `Design.md`, and `Database.md`.
- Inspect the existing repository and identify the framework, routes, and components.
- Preserve the existing UI and working features.
- Present a short implementation plan before major changes.

### Phase 2 — Supabase Setup
- Install `@supabase/supabase-js`.
- Configure environment variables.
- Create the Supabase client.
- Create the SQL migration file.
- Explain how to apply the migration in Supabase SQL Editor.

### Phase 3 — Authentication and Onboarding
- Implement signup, login, logout, and password reset.
- Implement profile creation.
- Implement secure wedding creation and initial admin assignment.
- Implement safe admin-only member management.
- Add protected routes.

### Phase 4 — App Features
- Connect Dashboard to real data.
- Implement Expenses CRUD.
- Implement Guests and Invitations CRUD.
- Implement Wedding Functions, Tasks, and Announcements.
- Implement Settings and role management.

### Phase 5 — Testing
- Test all CRUD operations.
- Test admin, family_member, and viewer permissions.
- Test with at least two users and two weddings.
- Confirm that one wedding's members cannot access another wedding's data.
- Confirm no service-role or secret key is included in frontend code.
- Run the production build and fix errors.

## 13. Prompt for Anti-Gravity

Read `PRD.md`, `Design.md`, and `Database.md` completely before coding.

I am using Supabase, not MongoDB. Inspect my existing React + Vite + Tailwind project first. Preserve the existing UI, components, routes, and working code wherever possible.

Use Supabase PostgreSQL as the database, Supabase Auth for authentication, RLS for authorization, and Supabase Storage only if required. Use `@supabase/supabase-js`.

Implement the schema in `supabase/migrations/001_initial_schema.sql`. Enable RLS and create secure policies for every required operation. Each wedding must be an isolated workspace, and users must only access data for weddings they belong to.

Implement secure signup, login, logout, password reset, profile creation, and protected routes. Create a secure atomic onboarding workflow that creates a wedding and grants its creator the first admin membership. Do not allow users to assign themselves admin or change their own role.

Build the Dashboard, Expenses, Invitations, Family Coordination, and Settings & Admin sections using real Supabase data. Preserve the current design from `Design.md`. Include validation, loading states, empty states, and error handling.

Store money as integer paise. Keep all secrets out of frontend code. Add `.env.example`, ignore `.env.local`, and explain which environment variables and SQL migrations I must configure.

Work in small phases. First show a concise implementation plan and identify any missing setup. Then implement, run the build/tests, fix errors, and report what was completed and what still needs to be configured. Do not claim security is complete until RLS and cross-wedding access tests pass.

## 14. Final Checklist

- [ ] Supabase project created
- [ ] Environment variables configured
- [ ] `.env.local` ignored by Git
- [ ] SQL migration reviewed and applied
- [ ] RLS enabled on every exposed table
- [ ] RLS policies tested
- [ ] Secure initial-admin onboarding implemented
- [ ] Admin-only member management implemented
- [ ] Authentication flows tested
- [ ] Storage private if enabled
- [ ] Production build passes
- [ ] No secret/service-role key exposed in frontend code
