# RLS Policy Matrix

Last audited: 2026-08-09

Scope: application tables referenced by `lib/database.types.ts` and Supabase usage in `app/`, `components/`, and `lib/`.

This is an audit document only. No SQL has been executed. The "current" state below is based on migrations present in this repository, not a live `pg_policies` query. A live database check should still verify that these policies are applied in the target Supabase project.

## Application Tables

- `resources`
- `resource_submissions`
- `resource_locations`
- `notifications`
- `profiles`
- `resource_comments`
- `resource_guide_feedback`
- `resource_guide_intelligence_events`
- `resource_improvement_overrides`
- `impact_log`
- `messages`
- `events`

## Table Purpose and Intended Access

| Table | Purpose | Public access | Authenticated user access | Admin access | Service role required |
| --- | --- | --- | --- | --- | --- |
| `resources` | Directory records and current public pending new-resource submissions | SELECT approved, INSERT pending | Same as public | Full CRUD | No |
| `resource_submissions` | Public update/new suggestions for admin review | INSERT pending | INSERT pending | Full CRUD | No |
| `resource_locations` | Additional resource locations | SELECT when parent resource approved | Same as public | Full CRUD | No |
| `notifications` | Admin/user notification records | None | SELECT/UPDATE/DELETE own | INSERT mentions; optional full admin management | No |
| `profiles` | User profile and admin role source | None | SELECT self, update display fields | SELECT all, update roles/invites as supported | Admin invite INSERT uses service-role client |
| `resource_comments` | Internal admin comments on resources | None | None unless admin | Full CRUD | No |
| `resource_guide_feedback` | Resource Guide feedback/click telemetry | None | None | SELECT reports/review | INSERT from active API route |
| `resource_guide_intelligence_events` | Privacy-conscious Resource Guide intelligence events | None | None | SELECT reports | INSERT from collection service |
| `resource_improvement_overrides` | Admin overrides for improvement recommendations | None | None unless admin | Full CRUD/UPSERT | No |
| `impact_log` | Internal admin impact activity log | None | None unless admin | SELECT/INSERT/UPDATE/DELETE | No |
| `messages` | Public contact/resource request messages | INSERT | INSERT | SELECT/UPDATE; DELETE optional | No |
| `events` | Public events and event submissions | SELECT approved, INSERT pending | Same as public | Full CRUD | No |

## Admin Authorization Pattern

Use the existing project admin role model:

```sql
exists (
  select 1
  from public.profiles
  where profiles.id = auth.uid()
    and profiles.role = 'admin'
)
```

Recommended helper:

```sql
create or replace function public.resource_list_current_user_is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

revoke all on function public.resource_list_current_user_is_admin() from public;
grant execute on function public.resource_list_current_user_is_admin() to authenticated, service_role;

create or replace function public.resource_list_profile_public_fields_unchanged(
  profile_id uuid,
  next_role text,
  next_email text
)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.profiles
    where id = profile_id
      and role is not distinct from next_role
      and email is not distinct from next_email
  );
$$;

revoke all on function public.resource_list_profile_public_fields_unchanged(uuid, text, text) from public;
grant execute on function public.resource_list_profile_public_fields_unchanged(uuid, text, text) to authenticated, service_role;
```

## Current RLS Matrix

Observed from repository migrations:

- `20260805000100_create_resource_guide_intelligence_events.sql` creates `resource_guide_intelligence_events`, enables RLS, and adds service-role INSERT.
- `20260805000300_restore_admin_comments_rls.sql` adds admin SELECT on `profiles`, admin ALL on `resource_comments`, and admin INSERT on `notifications`.
- `20260805000200_restore_application_rls_policies.sql` contains a broader policy restoration draft, but it should not be assumed applied. It also does not enable RLS on tables other than policies it creates.

| Table | SELECT | INSERT | UPDATE | DELETE | Notes |
| --- | --- | --- | --- | --- | --- |
| `resources` | Unknown unless broader draft applied | Unknown unless broader draft applied | Unknown unless broader draft applied | Unknown unless broader draft applied | Public directory and public pending resource submission depend on this table. |
| `resource_submissions` | Unknown unless broader draft applied | Unknown unless broader draft applied | Unknown unless broader draft applied | Unknown unless broader draft applied | Update suggestions and admin review depend on this table. |
| `resource_locations` | Unknown unless broader draft applied | Unknown unless broader draft applied | Unknown unless broader draft applied | Unknown unless broader draft applied | Public approved resource locations plus admin location editing. |
| `notifications` | Missing or unknown | Admin INSERT from minimal comments migration | Missing or unknown | Missing or unknown | Admin mentions can create notifications; notification panel also needs own SELECT/UPDATE/DELETE. |
| `profiles` | Admin SELECT from minimal comments migration | Unknown | Missing or unknown | Not used | Profile update and self lookup may fail if self policies are absent. |
| `resource_comments` | Admin ALL from minimal comments migration | Admin ALL from minimal comments migration | Admin ALL from minimal comments migration | Admin ALL from minimal comments migration | Restores admin comments workflow. |
| `resource_guide_feedback` | Unknown unless broader draft applied | Unknown unless broader draft applied | Not used | Not used | Active API writes with service role; admin reports may read with service role. |
| `resource_guide_intelligence_events` | Unknown unless broader draft applied | Service-role INSERT | Not used | Not used | Reporting uses service-role reads after app-level admin auth. |
| `resource_improvement_overrides` | Unknown unless broader draft applied | Unknown unless broader draft applied | Unknown unless broader draft applied/upsert | Unknown unless broader draft applied | Improvements UI needs admin SELECT and UPSERT. |
| `impact_log` | Unknown unless broader draft applied | Unknown unless broader draft applied | Unknown unless broader draft applied | Unknown unless broader draft applied | Impact logger and leaderboard need admin INSERT/SELECT. |
| `messages` | Unknown unless broader draft applied | Unknown unless broader draft applied | Unknown unless broader draft applied | Not used | Public contact form inserts; admins list/update. |
| `events` | Unknown unless broader draft applied | Unknown unless broader draft applied | Unknown unless broader draft applied | Unknown unless broader draft applied | Public event submission plus public approved reads and admin moderation. |

## Recommended RLS Matrix

| Table | SELECT | INSERT | UPDATE | DELETE | Notes |
| --- | --- | --- | --- | --- | --- |
| `resources` | Public approved; admin all | Public pending direct submissions; admin | Admin | Admin | Current public new-resource form inserts directly into `resources` with `status = 'pending'`. |
| `resource_submissions` | Admin | Public pending update/new submissions; admin | Admin | Admin | Public update suggestions use this table. |
| `resource_locations` | Public locations for approved resources; admin all | Admin | Admin | Admin | Public read should be tied to approved parent resource. |
| `notifications` | Authenticated user can select own; admin may select all if needed | Admin | Authenticated user can update own read state; admin all optional | Authenticated user can delete own; admin all optional | Mentions require admin INSERT. |
| `profiles` | User self; admins all | Service role only | User self display fields; admins role/email | Admin only if user-management deletion is added | Do not weaken role security. |
| `resource_comments` | Admin | Admin | Admin | Admin | Comments are internal admin data. |
| `resource_guide_feedback` | Admin | Service role | Admin only for review flags if needed | Admin only if retention tooling is added | Active route uses `getSupabaseAdmin()`. |
| `resource_guide_intelligence_events` | Admin | Service role | None | None | Insert-only analytics; admin reporting can use service role or authenticated admin SELECT. |
| `resource_improvement_overrides` | Admin | Admin | Admin | Admin | Supports admin improvements workflow. |
| `impact_log` | Admin | Admin | Admin | Admin | Internal admin gamification/audit-like log. |
| `messages` | Admin | Public | Admin | Admin optional | Public contact form must not expose message reads. |
| `events` | Public approved; admin all | Public pending; admin | Admin | Admin | Public event sharing inserts pending events. |

## Application Usage and Required Policies

| Route or service | Table | Operation | Required policy |
| --- | --- | --- | --- |
| `app/suggest-resource/SuggestResourceClient.tsx` | `resources` | INSERT | `anon, authenticated` INSERT with `status = 'pending'`. |
| `lib/queries/buildResourceQuery.ts`, `lib/services/searchService.ts`, resource pages | `resources` | SELECT | Public SELECT where `status = 'approved'`. |
| Admin resources panels and `lib/services/resourceService.ts` | `resources` | SELECT/UPDATE/DELETE | Admin full CRUD. |
| `app/api/suggest-update/route.ts`, `app/resources/[slug]/suggest-update/page.tsx` | `resource_submissions` | INSERT | Public INSERT for `type in ('update', 'new')` and pending status. |
| Admin update request tabs/actions | `resource_submissions` | SELECT/UPDATE/DELETE | Admin full CRUD. |
| Public resource pages and admin location edit actions | `resource_locations` | SELECT/INSERT/DELETE | Public SELECT only for approved parent resources; admin full CRUD. |
| `components/admin/CommentsSection.tsx` | `resource_comments` | SELECT/INSERT/UPDATE/DELETE | Admin full CRUD. |
| `components/admin/CommentsSection.tsx`, notification service | `notifications` | INSERT | Admin INSERT for mentions. |
| `components/admin/NotificationsPanel.tsx`, dashboard summary | `notifications` | SELECT/UPDATE/DELETE | Own notification SELECT/UPDATE/DELETE; optional admin full read for dashboard if needed. |
| Admin layout, settings, comments mentions, invite route | `profiles` | SELECT/UPDATE/INSERT | Self SELECT; admin SELECT; self display-name UPDATE; admin role/email UPDATE; service-role INSERT for invites. |
| `app/api/resource-guide/feedback/route.ts` | `resource_guide_feedback` | INSERT/SELECT id | Service-role INSERT. |
| `lib/services/resources/ai/feedback/service.ts` | `resource_guide_feedback` | SELECT | Service-role reporting; authenticated admin SELECT is recommended for consistency. |
| `lib/services/resources/ai/intelligence/service.ts` | `resource_guide_intelligence_events` | INSERT/SELECT id | Service-role INSERT. |
| Intelligence reporting and directory coverage services | `resource_guide_intelligence_events` | SELECT | Service-role reads after app-level admin authorization; authenticated admin SELECT recommended. |
| `lib/services/improvements/improvementService.ts` | `resource_improvement_overrides` | SELECT/UPSERT | Admin SELECT/INSERT/UPDATE. |
| `lib/services/impact/*` | `impact_log` | SELECT/INSERT/count | Admin SELECT/INSERT. |
| `app/api/resource-requests/route.ts` and messages routes | `messages` | INSERT/SELECT/UPDATE | Public INSERT; admin SELECT/UPDATE. |
| `app/events/page.tsx`, `app/share-event/page.tsx`, admin event tabs | `events` | SELECT/INSERT/UPDATE/DELETE | Public approved SELECT; public pending INSERT; admin full CRUD. |

## Risk Report

### Critical

- `resources`: if public approved SELECT is absent, the public directory breaks. If public INSERT pending is absent, the current public submission flow fails. If INSERT is too broad, anonymous users could publish approved resources.
- `profiles`: admin authorization depends on profile reads. Missing admin/self SELECT can break admin access; overly broad UPDATE can allow privilege escalation.

### High

- `resource_submissions`: missing public INSERT breaks update suggestions; missing admin policies blocks review workflows.
- `resource_locations`: missing approved-parent SELECT hides valid locations; missing admin write policies breaks location editing and duplicate merge.
- `resource_comments` and `notifications`: missing policies break comments, mentions, and notification creation.
- `resource_guide_feedback`: active API uses service role; missing service-role INSERT breaks feedback collection. Public direct INSERT should not be required by the active route.
- `resource_guide_intelligence_events`: missing service-role INSERT breaks intelligence collection.

### Medium

- `messages`: missing public INSERT breaks contact/resource request forms; missing admin SELECT/UPDATE blocks admin inbox.
- `events`: missing public pending INSERT or approved SELECT breaks event sharing/browsing.
- `impact_log`: missing admin policies breaks internal impact tracking and leaderboards.
- `resource_improvement_overrides`: missing admin UPSERT policies breaks admin improvements.

### Low

- Admin-only DELETE policies for `messages`, `impact_log`, feedback, and intelligence are not currently required by code. Add only when retention/admin deletion tooling exists.
- The unused `lib/services/resources/feedback/feedbackService.ts` uses a cookie server client for `resource_guide_feedback`; if revived, it would require anon/auth INSERT or should be migrated to the service-role feedback service.

## Recommended SQL

Do not execute this automatically. Review against live `pg_policies` first. The SQL is grouped by table and uses the existing admin helper.

```sql
-- Shared admin helper.
create or replace function public.resource_list_current_user_is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

revoke all on function public.resource_list_current_user_is_admin() from public;
grant execute on function public.resource_list_current_user_is_admin() to authenticated, service_role;

create or replace function public.resource_list_profile_public_fields_unchanged(
  profile_id uuid,
  next_role text,
  next_email text
)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.profiles
    where id = profile_id
      and role is not distinct from next_role
      and email is not distinct from next_email
  );
$$;

revoke all on function public.resource_list_profile_public_fields_unchanged(uuid, text, text) from public;
grant execute on function public.resource_list_profile_public_fields_unchanged(uuid, text, text) to authenticated, service_role;

-- profiles
alter table if exists public.profiles enable row level security;

create policy "profiles select self"
  on public.profiles
  for select
  to authenticated
  using (id = auth.uid());

create policy "profiles select admins"
  on public.profiles
  for select
  to authenticated
  using (public.resource_list_current_user_is_admin());

create policy "profiles update self display name"
  on public.profiles
  for update
  to authenticated
  using (id = auth.uid())
  with check (
    id = auth.uid()
    and public.resource_list_profile_public_fields_unchanged(id, role, email)
  );

create policy "profiles update admins"
  on public.profiles
  for update
  to authenticated
  using (public.resource_list_current_user_is_admin())
  with check (public.resource_list_current_user_is_admin());

-- resources
alter table if exists public.resources enable row level security;

create policy "resources select approved"
  on public.resources
  for select
  to anon, authenticated
  using (status = 'approved');

create policy "resources select admins"
  on public.resources
  for select
  to authenticated
  using (public.resource_list_current_user_is_admin());

create policy "resources insert pending public"
  on public.resources
  for insert
  to anon, authenticated
  with check (status = 'pending');

create policy "resources insert admins"
  on public.resources
  for insert
  to authenticated
  with check (public.resource_list_current_user_is_admin());

create policy "resources update admins"
  on public.resources
  for update
  to authenticated
  using (public.resource_list_current_user_is_admin())
  with check (public.resource_list_current_user_is_admin());

create policy "resources delete admins"
  on public.resources
  for delete
  to authenticated
  using (public.resource_list_current_user_is_admin());

-- resource_locations
alter table if exists public.resource_locations enable row level security;

create policy "resource locations select approved resources"
  on public.resource_locations
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.resources
      where resources.id = resource_locations.resource_id
        and resources.status = 'approved'
    )
  );

create policy "resource locations all admins"
  on public.resource_locations
  for all
  to authenticated
  using (public.resource_list_current_user_is_admin())
  with check (public.resource_list_current_user_is_admin());

-- resource_submissions
alter table if exists public.resource_submissions enable row level security;

create policy "resource submissions insert public pending"
  on public.resource_submissions
  for insert
  to anon, authenticated
  with check (
    type in ('update', 'new')
    and (status is null or status = 'pending')
  );

create policy "resource submissions all admins"
  on public.resource_submissions
  for all
  to authenticated
  using (public.resource_list_current_user_is_admin())
  with check (public.resource_list_current_user_is_admin());

-- resource_comments
alter table if exists public.resource_comments enable row level security;

create policy "resource comments all admins"
  on public.resource_comments
  for all
  to authenticated
  using (public.resource_list_current_user_is_admin())
  with check (public.resource_list_current_user_is_admin());

-- notifications
alter table if exists public.notifications enable row level security;

create policy "notifications select own"
  on public.notifications
  for select
  to authenticated
  using (user_id = auth.uid());

create policy "notifications insert admins"
  on public.notifications
  for insert
  to authenticated
  with check (public.resource_list_current_user_is_admin());

create policy "notifications update own"
  on public.notifications
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "notifications delete own"
  on public.notifications
  for delete
  to authenticated
  using (user_id = auth.uid());

-- messages
alter table if exists public.messages enable row level security;

create policy "messages insert public"
  on public.messages
  for insert
  to anon, authenticated
  with check (true);

create policy "messages select admins"
  on public.messages
  for select
  to authenticated
  using (public.resource_list_current_user_is_admin());

create policy "messages update admins"
  on public.messages
  for update
  to authenticated
  using (public.resource_list_current_user_is_admin())
  with check (public.resource_list_current_user_is_admin());

-- events
alter table if exists public.events enable row level security;

create policy "events select approved"
  on public.events
  for select
  to anon, authenticated
  using (status = 'approved');

create policy "events insert public pending"
  on public.events
  for insert
  to anon, authenticated
  with check (status = 'pending');

create policy "events all admins"
  on public.events
  for all
  to authenticated
  using (public.resource_list_current_user_is_admin())
  with check (public.resource_list_current_user_is_admin());

-- impact_log
alter table if exists public.impact_log enable row level security;

create policy "impact log all admins"
  on public.impact_log
  for all
  to authenticated
  using (public.resource_list_current_user_is_admin())
  with check (public.resource_list_current_user_is_admin());

-- resource_improvement_overrides
alter table if exists public.resource_improvement_overrides enable row level security;

create policy "resource improvement overrides all admins"
  on public.resource_improvement_overrides
  for all
  to authenticated
  using (public.resource_list_current_user_is_admin())
  with check (public.resource_list_current_user_is_admin());

-- resource_guide_feedback
alter table if exists public.resource_guide_feedback enable row level security;

create policy "resource guide feedback service insert"
  on public.resource_guide_feedback
  for insert
  to service_role
  with check (true);

create policy "resource guide feedback select admins"
  on public.resource_guide_feedback
  for select
  to authenticated
  using (public.resource_list_current_user_is_admin());

-- resource_guide_intelligence_events
alter table if exists public.resource_guide_intelligence_events enable row level security;

create policy "resource guide intelligence service insert"
  on public.resource_guide_intelligence_events
  for insert
  to service_role
  with check (true);

create policy "resource guide intelligence select admins"
  on public.resource_guide_intelligence_events
  for select
  to authenticated
  using (public.resource_list_current_user_is_admin());
```

Before applying, convert the above to idempotent migration blocks or explicitly drop/replace conflicting policies after reviewing live `pg_policies`.

## Overly Broad or Inconsistent Policies to Review

- `messages insert public with check (true)` is required by the current public contact flow, but it should be paired with validation and rate limiting outside RLS.
- `resources insert pending public` is still required because public new-resource submissions insert directly into `resources`. If the app later moves all public submissions to `resource_submissions`, remove this policy.
- `resource_guide_feedback` should not require public INSERT while the active route writes with `getSupabaseAdmin()`. Avoid adding anon INSERT unless the route architecture changes.
- `resource_guide_intelligence_events` should remain service-role INSERT only. No public direct access.
- Admin `for all` policies are simple and consistent with existing app behavior, but high-sensitivity tables may later prefer operation-specific policies.

## Verification Checklist

- Public directory can read only `resources.status = 'approved'`.
- Public resource locations load only when parent resource is approved.
- Public new resource submission inserts `resources.status = 'pending'`.
- Public update suggestion inserts `resource_submissions`.
- Admins can list/update/delete resources and submissions.
- Admin comments load/create/edit/delete.
- Mention lookup can read admin profiles.
- Mention notifications can be inserted.
- Users can read/update/delete their own notifications.
- Profile self display-name update works without role/email escalation.
- Resource Guide feedback records via service role.
- Intelligence events insert via service role.
- Admin intelligence reports load after application-level admin authorization.
- Public users cannot read feedback, intelligence events, messages, comments, impact logs, or improvement overrides.
