alter table if exists public.impact_log
  add column if not exists source text;

alter table if exists public.impact_log
  add column if not exists metadata jsonb;

update public.impact_log
set metadata = '{}'::jsonb
where metadata is null;

alter table if exists public.impact_log
  alter column metadata set default '{}'::jsonb,
  alter column metadata set not null;

create index if not exists impact_log_activity_type_idx
  on public.impact_log (activity_type);

create index if not exists impact_log_created_at_idx
  on public.impact_log (created_at desc);

create unique index if not exists impact_log_resource_improved_once_idx
  on public.impact_log (admin_id, resource_id, activity_type, activity_key)
  where activity_type = 'resource_improved';
