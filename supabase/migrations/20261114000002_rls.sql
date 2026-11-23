-- Aturan akses: RLS di semua tabel public, view, dan bucket bukti donasi.

-- Security definer: membaca profiles tanpa melewati RLS profiles sendiri (tidak rekursif).
create function my_role() returns text language sql stable security definer set search_path = public as $$
  select role from profiles where id = auth.uid()
$$;
create function is_staff() returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(my_role() in ('penguji','admin'), false)
$$;
create function is_admin() returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(my_role() = 'admin', false)
$$;

alter table profiles enable row level security;
alter table news enable row level security;
alter table achievements enable row level security;
alter table agendas enable row level security;
alter table agenda_rsvps enable row level security;
alter table campaigns enable row level security;
alter table donations enable row level security;
alter table ukt_candidates enable row level security;
alter table site_stats enable row level security;
alter table site_content enable row level security;
alter table pillars enable row level security;
alter table training_grounds enable row level security;

-- Konten publik: semua boleh baca.
create policy read_all on news for select using (true);
create policy staff_insert on news for insert to authenticated with check (is_staff());
create policy staff_update on news for update to authenticated using (is_staff()) with check (is_staff());
create policy staff_delete on news for delete to authenticated using (is_staff());

create policy read_all on achievements for select using (true);
create policy staff_insert on achievements for insert to authenticated with check (is_staff());
create policy staff_update on achievements for update to authenticated using (is_staff()) with check (is_staff());
create policy staff_delete on achievements for delete to authenticated using (is_staff());

create policy read_all on site_stats for select using (true);
create policy staff_update on site_stats for update to authenticated using (is_staff()) with check (is_staff());

create policy read_all on site_content for select using (true);
create policy admin_update on site_content for update to authenticated using (is_admin()) with check (is_admin());

create policy read_all on pillars for select using (true);
create policy admin_insert on pillars for insert to authenticated with check (is_admin());
create policy admin_update on pillars for update to authenticated using (is_admin()) with check (is_admin());
create policy admin_delete on pillars for delete to authenticated using (is_admin());

create policy read_all on training_grounds for select using (true);
create policy admin_insert on training_grounds for insert to authenticated with check (is_admin());
create policy admin_update on training_grounds for update to authenticated using (is_admin()) with check (is_admin());
create policy admin_delete on training_grounds for delete to authenticated using (is_admin());

-- Agenda: hanya anggota login.
create policy login_read on agendas for select to authenticated using (true);
create policy staff_insert on agendas for insert to authenticated with check (is_staff());
create policy staff_update on agendas for update to authenticated using (is_staff()) with check (is_staff());
create policy staff_delete on agendas for delete to authenticated using (is_staff());

create policy own_or_staff_read on agenda_rsvps for select to authenticated using (user_id = auth.uid() or is_staff());
create policy own_insert on agenda_rsvps for insert to authenticated with check (user_id = auth.uid());
create policy own_update on agenda_rsvps for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy own_delete on agenda_rsvps for delete to authenticated using (user_id = auth.uid());

-- Donasi.
create policy login_read on campaigns for select to authenticated using (true);
create policy admin_insert on campaigns for insert to authenticated with check (is_admin());
create policy admin_update on campaigns for update to authenticated using (is_admin()) with check (is_admin());
create policy admin_delete on campaigns for delete to authenticated using (is_admin());

create policy own_or_admin_read on donations for select to authenticated using (user_id = auth.uid() or is_admin());
-- trigger force_pending_donation sudah mengisi user_id = auth.uid() dan status pending
create policy login_insert on donations for insert to authenticated with check (user_id = auth.uid());
create policy admin_update on donations for update to authenticated using (is_admin()) with check (is_admin());

-- UKT.
create policy staff_or_own_read on ukt_candidates for select to authenticated using (is_staff() or user_id = auth.uid());
create policy staff_insert on ukt_candidates for insert to authenticated with check (is_staff());
create policy staff_update on ukt_candidates for update to authenticated using (is_staff()) with check (is_staff());
create policy staff_delete on ukt_candidates for delete to authenticated using (is_staff());

-- Profil: dibuat lewat Edge Function (service role).
create policy own_or_staff_read on profiles for select to authenticated using (id = auth.uid() or is_staff());
create policy admin_update on profiles for update to authenticated using (is_admin()) with check (is_admin());

-- View pemilik (security_invoker = false): sengaja melewati RLS tabel dasar untuk agregat/kolom
-- yang aman; karena itu hanya select, hanya untuk authenticated (view sederhana bisa di-update).
alter view agenda_rsvps_public set (security_invoker = false);
alter view campaign_totals set (security_invoker = false);
alter view public_donations set (security_invoker = false);
revoke all on agenda_rsvps_public, campaign_totals, public_donations from public, anon, authenticated;
grant select on agenda_rsvps_public, campaign_totals, public_donations to authenticated;

-- Storage bukti donasi: <user_id>/<uuid>.<ext>
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('donation-proofs', 'donation-proofs', false, 5242880, '{image/jpeg,image/png,image/webp}')
on conflict do nothing;

create policy donation_proofs_read on storage.objects for select to authenticated
  using (bucket_id = 'donation-proofs' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin()));
create policy donation_proofs_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'donation-proofs' and (storage.foldername(name))[1] = auth.uid()::text);
