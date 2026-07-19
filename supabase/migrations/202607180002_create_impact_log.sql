create table if not exists public.impact_log (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null,
  resource_id uuid null,
  activity_type text not null,
  activity_key text not null,
  points integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint impact_log_admin_id_fkey
    foreign key (admin_id)
    references public.profiles (id)
    on delete cascade,
  constraint impact_log_resource_id_fkey
    foreign key (resource_id)
    references public.resources (id)
    on delete set null
);

create index if not exists impact_log_admin_id_idx
  on public.impact_log (admin_id);

create index if not exists impact_log_resource_id_idx
  on public.impact_log (resource_id);

create index if not exists impact_log_created_at_idx
  on public.impact_log (created_at desc);

create index if not exists impact_log_activity_type_idx
  on public.impact_log (activity_type);

create unique index if not exists impact_log_resource_improved_once_idx
  on public.impact_log (admin_id, resource_id, activity_type, activity_key)
  where activity_type = 'resource_improved';
