create table if not exists public.resource_guide_intelligence_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  version text not null,
  event_type text not null,
  conversation_id text not null,
  tool_id text not null,
  prompt_version text,
  model text,
  detected_needs text[] not null default '{}',
  search_concepts text[] not null default '{}',
  city text,
  county text,
  state text,
  selection_tier text,
  candidate_count integer not null default 0,
  expanded_search boolean not null default false,
  recommendation_mode text,
  recommended_resource_ids uuid[] not null default '{}',
  clicked_resource_ids uuid[] not null default '{}',
  resource_count integer not null default 0,
  high_confidence_count integer not null default 0,
  clarification_triggered boolean not null default false,
  clarification_reason text,
  feedback_submitted boolean not null default false,
  feedback_type text,
  structured_feedback jsonb not null default '{}',
  response_time_ms integer,
  validation_passed boolean,
  validation_issue_count integer not null default 0,
  metadata jsonb not null default '{}'
);

create index if not exists resource_guide_intelligence_events_created_at_idx
  on public.resource_guide_intelligence_events (created_at desc);

create index if not exists resource_guide_intelligence_events_event_type_idx
  on public.resource_guide_intelligence_events (event_type);

create index if not exists resource_guide_intelligence_events_conversation_id_idx
  on public.resource_guide_intelligence_events (conversation_id);

create index if not exists resource_guide_intelligence_events_detected_needs_idx
  on public.resource_guide_intelligence_events using gin (detected_needs);

create index if not exists resource_guide_intelligence_events_search_concepts_idx
  on public.resource_guide_intelligence_events using gin (search_concepts);

create index if not exists resource_guide_intelligence_events_recommended_resource_ids_idx
  on public.resource_guide_intelligence_events using gin (recommended_resource_ids);

create index if not exists resource_guide_intelligence_events_clicked_resource_ids_idx
  on public.resource_guide_intelligence_events using gin (clicked_resource_ids);

alter table public.resource_guide_intelligence_events enable row level security;

drop policy if exists "resource guide intelligence service insert" on public.resource_guide_intelligence_events;

create policy "resource guide intelligence service insert"
  on public.resource_guide_intelligence_events
  for insert
  to service_role
  with check (true);
