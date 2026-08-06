-- RLS policy restoration for application tables.
-- This migration is intentionally idempotent: each policy is created only when
-- its policy name is missing from pg_policies.

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

revoke all on function public.resource_list_current_user_is_admin() from public;
revoke all on function public.resource_list_profile_public_fields_unchanged(uuid, text, text) from public;
grant execute on function public.resource_list_current_user_is_admin() to authenticated, service_role;
grant execute on function public.resource_list_profile_public_fields_unchanged(uuid, text, text) to authenticated, service_role;

do $$
begin
  if to_regclass('public.profiles') is null then
    return;
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'profiles'
      and policyname = 'profiles select self'
  ) then
    create policy "profiles select self"
      on public.profiles
      for select
      to authenticated
      using (id = auth.uid());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'profiles'
      and policyname = 'profiles select admins'
  ) then
    create policy "profiles select admins"
      on public.profiles
      for select
      to authenticated
      using (public.resource_list_current_user_is_admin());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'profiles'
      and policyname = 'profiles update self display fields'
  ) then
    create policy "profiles update self display fields"
      on public.profiles
      for update
      to authenticated
      using (id = auth.uid())
      with check (
        id = auth.uid()
        and public.resource_list_profile_public_fields_unchanged(id, role, email)
      );
  end if;
end $$;

do $$
begin
  if to_regclass('public.resources') is null then
    return;
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'resources'
      and policyname = 'resources select approved'
  ) then
    create policy "resources select approved"
      on public.resources
      for select
      to anon, authenticated
      using (status = 'approved');
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'resources'
      and policyname = 'resources select admins'
  ) then
    create policy "resources select admins"
      on public.resources
      for select
      to authenticated
      using (public.resource_list_current_user_is_admin());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'resources'
      and policyname = 'resources insert pending submissions'
  ) then
    create policy "resources insert pending submissions"
      on public.resources
      for insert
      to anon, authenticated
      with check (status = 'pending');
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'resources'
      and policyname = 'resources insert admins'
  ) then
    create policy "resources insert admins"
      on public.resources
      for insert
      to authenticated
      with check (public.resource_list_current_user_is_admin());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'resources'
      and policyname = 'resources update admins'
  ) then
    create policy "resources update admins"
      on public.resources
      for update
      to authenticated
      using (public.resource_list_current_user_is_admin())
      with check (public.resource_list_current_user_is_admin());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'resources'
      and policyname = 'resources delete admins'
  ) then
    create policy "resources delete admins"
      on public.resources
      for delete
      to authenticated
      using (public.resource_list_current_user_is_admin());
  end if;
end $$;

do $$
begin
  if to_regclass('public.resource_locations') is null then
    return;
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'resource_locations'
      and policyname = 'resource locations select approved resources'
  ) then
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
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'resource_locations'
      and policyname = 'resource locations all admins'
  ) then
    create policy "resource locations all admins"
      on public.resource_locations
      for all
      to authenticated
      using (public.resource_list_current_user_is_admin())
      with check (public.resource_list_current_user_is_admin());
  end if;
end $$;

do $$
begin
  if to_regclass('public.resource_submissions') is null then
    return;
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'resource_submissions'
      and policyname = 'resource submissions insert public pending'
  ) then
    create policy "resource submissions insert public pending"
      on public.resource_submissions
      for insert
      to anon, authenticated
      with check (
        type in ('update', 'new')
        and (status is null or status = 'pending')
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'resource_submissions'
      and policyname = 'resource submissions all admins'
  ) then
    create policy "resource submissions all admins"
      on public.resource_submissions
      for all
      to authenticated
      using (public.resource_list_current_user_is_admin())
      with check (public.resource_list_current_user_is_admin());
  end if;
end $$;

do $$
begin
  if to_regclass('public.resource_comments') is null then
    return;
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'resource_comments'
      and policyname = 'resource comments all admins'
  ) then
    create policy "resource comments all admins"
      on public.resource_comments
      for all
      to authenticated
      using (public.resource_list_current_user_is_admin())
      with check (public.resource_list_current_user_is_admin());
  end if;
end $$;

do $$
begin
  if to_regclass('public.notifications') is null then
    return;
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'notifications'
      and policyname = 'notifications select own'
  ) then
    create policy "notifications select own"
      on public.notifications
      for select
      to authenticated
      using (user_id = auth.uid());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'notifications'
      and policyname = 'notifications insert admins'
  ) then
    create policy "notifications insert admins"
      on public.notifications
      for insert
      to authenticated
      with check (public.resource_list_current_user_is_admin());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'notifications'
      and policyname = 'notifications update own'
  ) then
    create policy "notifications update own"
      on public.notifications
      for update
      to authenticated
      using (user_id = auth.uid())
      with check (user_id = auth.uid());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'notifications'
      and policyname = 'notifications delete own'
  ) then
    create policy "notifications delete own"
      on public.notifications
      for delete
      to authenticated
      using (user_id = auth.uid());
  end if;
end $$;

do $$
begin
  if to_regclass('public.messages') is null then
    return;
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'messages'
      and policyname = 'messages insert public'
  ) then
    create policy "messages insert public"
      on public.messages
      for insert
      to anon, authenticated
      with check (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'messages'
      and policyname = 'messages select admins'
  ) then
    create policy "messages select admins"
      on public.messages
      for select
      to authenticated
      using (public.resource_list_current_user_is_admin());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'messages'
      and policyname = 'messages update admins'
  ) then
    create policy "messages update admins"
      on public.messages
      for update
      to authenticated
      using (public.resource_list_current_user_is_admin())
      with check (public.resource_list_current_user_is_admin());
  end if;
end $$;

do $$
begin
  if to_regclass('public.events') is null then
    return;
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'events'
      and policyname = 'events select approved'
  ) then
    create policy "events select approved"
      on public.events
      for select
      to anon, authenticated
      using (status = 'approved');
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'events'
      and policyname = 'events insert public pending'
  ) then
    create policy "events insert public pending"
      on public.events
      for insert
      to anon, authenticated
      with check (status = 'pending');
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'events'
      and policyname = 'events all admins'
  ) then
    create policy "events all admins"
      on public.events
      for all
      to authenticated
      using (public.resource_list_current_user_is_admin())
      with check (public.resource_list_current_user_is_admin());
  end if;
end $$;

do $$
begin
  if to_regclass('public.impact_log') is not null then
    if not exists (
      select 1 from pg_policies
      where schemaname = 'public'
        and tablename = 'impact_log'
        and policyname = 'impact log all admins'
    ) then
      create policy "impact log all admins"
        on public.impact_log
        for all
        to authenticated
        using (public.resource_list_current_user_is_admin())
        with check (public.resource_list_current_user_is_admin());
    end if;
  end if;

  if to_regclass('public.resource_improvement_overrides') is not null then
    if not exists (
      select 1 from pg_policies
      where schemaname = 'public'
        and tablename = 'resource_improvement_overrides'
        and policyname = 'resource improvement overrides all admins'
    ) then
      create policy "resource improvement overrides all admins"
        on public.resource_improvement_overrides
        for all
        to authenticated
        using (public.resource_list_current_user_is_admin())
        with check (public.resource_list_current_user_is_admin());
    end if;
  end if;
end $$;

do $$
begin
  if to_regclass('public.resource_guide_feedback') is not null then
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'resource_guide_feedback'
      and policyname = 'resource guide feedback service insert'
  ) then
    create policy "resource guide feedback service insert"
      on public.resource_guide_feedback
      for insert
      to service_role
      with check (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'resource_guide_feedback'
      and policyname = 'resource guide feedback select admins'
  ) then
    create policy "resource guide feedback select admins"
      on public.resource_guide_feedback
      for select
      to authenticated
      using (public.resource_list_current_user_is_admin());
  end if;
  end if;

  if to_regclass('public.resource_guide_intelligence_events') is not null then
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'resource_guide_intelligence_events'
      and policyname = 'resource guide intelligence select admins'
  ) then
    create policy "resource guide intelligence select admins"
      on public.resource_guide_intelligence_events
      for select
      to authenticated
      using (public.resource_list_current_user_is_admin());
  end if;
  end if;
end $$;
