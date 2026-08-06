-- Minimal RLS restoration for the existing admin comments workflow.
-- Scope:
-- - resource_comments: admin comment load/create/edit/delete
-- - profiles: admin @mention lookup
-- - notifications: admin-created mention notifications
--
-- This intentionally does not include policies for unrelated tables.

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

do $$
begin
  if to_regclass('public.profiles') is null then
    return;
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
      and policyname = 'notifications insert admins'
  ) then
    create policy "notifications insert admins"
      on public.notifications
      for insert
      to authenticated
      with check (public.resource_list_current_user_is_admin());
  end if;
end $$;
