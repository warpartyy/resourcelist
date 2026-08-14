create table if not exists public.resource_discovery_sessions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  created_by uuid null references auth.users(id) on delete set null,
  parent_category text not null,
  subcategory text null,
  state text not null,
  county text null,
  city text null,
  search_scope text not null,
  keywords text null,
  max_results integer not null default 5,
  completed_at timestamptz null
);

create table if not exists public.resource_discovery_candidates (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.resource_discovery_sessions(id) on delete cascade,
  created_at timestamptz not null default now(),
  organization text not null,
  website text not null,
  summary text null,
  evidence jsonb not null default '[]'::jsonb,
  field_confidence jsonb not null default '{}'::jsonb,
  discovered_fields jsonb not null default '{}'::jsonb,
  missing_fields text[] not null default '{}'::text[],
  review_status text not null default 'New',
  constraint resource_discovery_candidates_review_status_check
    check (review_status in ('New', 'Reviewed', 'Created', 'Dismissed'))
);

alter table public.resource_discovery_sessions enable row level security;
alter table public.resource_discovery_candidates enable row level security;

drop policy if exists "Admin full access resource discovery sessions" on public.resource_discovery_sessions;
create policy "Admin full access resource discovery sessions"
on public.resource_discovery_sessions
for all
using (public.resource_list_current_user_is_admin())
with check (public.resource_list_current_user_is_admin());

drop policy if exists "Admin full access resource discovery candidates" on public.resource_discovery_candidates;
create policy "Admin full access resource discovery candidates"
on public.resource_discovery_candidates
for all
using (public.resource_list_current_user_is_admin())
with check (public.resource_list_current_user_is_admin());

create index if not exists resource_discovery_sessions_created_at_idx
on public.resource_discovery_sessions (created_at desc);

create index if not exists resource_discovery_candidates_session_id_idx
on public.resource_discovery_candidates (session_id);
