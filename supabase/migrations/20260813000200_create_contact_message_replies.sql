create or replace function public.resource_list_current_user_is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  );
$$;

revoke all on function public.resource_list_current_user_is_admin() from public;
grant execute on function public.resource_list_current_user_is_admin() to authenticated, service_role;

create table if not exists public.contact_message_replies (
  id uuid primary key default gen_random_uuid(),
  contact_message_id uuid not null references public.messages(id) on delete cascade,
  message text not null,
  sent_by uuid references public.profiles(id),
  sent_at timestamptz not null default now()
);

alter table public.contact_message_replies enable row level security;

drop policy if exists "Admin full access contact message replies" on public.contact_message_replies;
drop policy if exists "Admins can manage contact message replies" on public.contact_message_replies;
drop policy if exists "Admins can read contact message replies" on public.contact_message_replies;
drop policy if exists "Admins can insert contact message replies" on public.contact_message_replies;

create policy "Admins can read contact message replies"
on public.contact_message_replies
for select
to authenticated
using (public.resource_list_current_user_is_admin());

create policy "Admins can insert contact message replies"
on public.contact_message_replies
for insert
to authenticated
with check (public.resource_list_current_user_is_admin());

create index if not exists idx_contact_message_replies_message_id_sent_at
on public.contact_message_replies(contact_message_id, sent_at);

create index if not exists idx_contact_message_replies_sent_by
on public.contact_message_replies(sent_by);
