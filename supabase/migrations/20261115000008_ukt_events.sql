-- UKT per PAC: each admin belongs to a PAC and runs UKT events for it; examiners join one event
-- with that event's code; an event and all its data are deleted 7 days after its date.

alter table public.profiles add column pac text;

create table public.ukt_events (
  id uuid primary key default gen_random_uuid(),
  pac text,
  name text not null,
  exam_date date not null,
  location text,
  examiner_code text unique check (examiner_code is null or (examiner_code = upper(examiner_code) and length(examiner_code) >= 6)),
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now()
);

create table public.ukt_examiners (
  event_id uuid not null references public.ukt_events (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (event_id, user_id)
);

-- Existing candidates move into one sample event so nothing is lost.
alter table public.ukt_candidates add column event_id uuid references public.ukt_events (id) on delete cascade;
do $$
declare v_id uuid;
begin
  if exists (select 1 from public.ukt_candidates) then
    insert into public.ukt_events (name, exam_date) values ('UKT Contoh', (now() at time zone 'Asia/Jakarta')::date)
      returning id into v_id;
    update public.ukt_candidates set event_id = v_id where event_id is null;
  end if;
end $$;
alter table public.ukt_candidates alter column event_id set not null;
alter table public.ukt_candidates drop constraint ukt_candidates_reg_number_key;
alter table public.ukt_candidates add constraint ukt_candidates_event_reg_key unique (event_id, reg_number);

-- Admin-side scope: admin of the event's PAC, or a PAC-less (pusat) admin.
create function public.my_pac() returns text language sql stable security definer set search_path = public as $$
  select nullif(trim(pac), '') from profiles where id = auth.uid()
$$;
create function public.can_manage_event(eid uuid) returns boolean language sql stable security definer set search_path = public as $$
  select public.is_admin() and exists (
    select 1 from ukt_events e where e.id = eid and (public.my_pac() is null or e.pac = public.my_pac())
  )
$$;
create function public.can_score_event(eid uuid) returns boolean language sql stable security definer set search_path = public as $$
  select public.can_manage_event(eid)
    or exists (select 1 from ukt_examiners x where x.event_id = eid and x.user_id = auth.uid())
$$;

alter table public.ukt_events enable row level security;
create policy event_read on public.ukt_events for select to authenticated using (public.can_score_event(id));
-- A PAC admin can only create events for their own PAC; a pusat admin for any PAC.
create policy event_insert on public.ukt_events for insert to authenticated
  with check (public.is_admin() and (public.my_pac() is null or pac = public.my_pac()));
create policy event_update on public.ukt_events for update to authenticated
  using (public.can_manage_event(id))
  with check (public.my_pac() is null or pac = public.my_pac());
create policy event_delete on public.ukt_events for delete to authenticated using (public.can_manage_event(id));

alter table public.ukt_examiners enable row level security;
create policy examiner_read on public.ukt_examiners for select to authenticated
  using (user_id = auth.uid() or public.can_manage_event(event_id));
create policy examiner_delete on public.ukt_examiners for delete to authenticated using (public.can_manage_event(event_id));
-- Inserts only through join_ukt_by_code().

drop policy staff_or_own_read on public.ukt_candidates;
drop policy staff_insert on public.ukt_candidates;
drop policy staff_update on public.ukt_candidates;
drop policy staff_delete on public.ukt_candidates;
create policy scorer_or_own_read on public.ukt_candidates for select to authenticated
  using (user_id = auth.uid() or public.can_score_event(event_id));
create policy scorer_insert on public.ukt_candidates for insert to authenticated with check (public.can_score_event(event_id));
create policy scorer_update on public.ukt_candidates for update to authenticated
  using (public.can_score_event(event_id)) with check (public.can_score_event(event_id));
create policy manager_delete on public.ukt_candidates for delete to authenticated using (public.can_manage_event(event_id));

-- A signed-in user joins an event as examiner with its current code (valid until the event is purged).
create function public.join_ukt_by_code(p_code text) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  me uuid := auth.uid();
  v_event uuid;
begin
  if me is null then
    raise exception 'Harus masuk terlebih dahulu';
  end if;
  select id into v_event from ukt_events
    where examiner_code = upper(trim(p_code))
      and exam_date >= (now() at time zone 'Asia/Jakarta')::date - 7;
  if v_event is null then
    raise exception 'Kode penguji tidak valid atau UKT sudah berakhir';
  end if;
  insert into ukt_examiners (event_id, user_id) values (v_event, me) on conflict do nothing;
  return v_event;
end;
$$;
revoke all on function public.join_ukt_by_code(text) from public, anon;
grant execute on function public.join_ukt_by_code(text) to authenticated;

-- The global code table from the previous step is replaced by per-event codes.
drop function public.redeem_examiner_code(text);
drop table public.examiner_codes;

-- Purge events 7 days after their date (cascades to candidates and examiners). Runs nightly 00:05 WIB.
create function public.purge_old_ukt_events() returns integer
language sql security definer set search_path = public as $$
  with gone as (
    delete from ukt_events where exam_date < (now() at time zone 'Asia/Jakarta')::date - 7 returning 1
  )
  select count(*)::int from gone
$$;
revoke all on function public.purge_old_ukt_events() from public, anon, authenticated;
grant execute on function public.purge_old_ukt_events() to service_role;

create extension if not exists pg_cron with schema pg_catalog;
select cron.schedule('purge-old-ukt-events', '5 17 * * *', 'select public.purge_old_ukt_events()');
