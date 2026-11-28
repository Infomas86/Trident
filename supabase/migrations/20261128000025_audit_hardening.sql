-- Hasil audit 28 Nov 2026.

-- (4) Pemeriksaan kode pendaftaran tidak lagi bisa dipanggil publik tanpa batas: orang bisa
-- menebak kode berupa kata biasa. Saat daftar, kode tetap diperiksa trigger handle_new_user
-- (dan pendaftaran butuh captcha), jadi pemeriksaan awal dari browser dibuang.
revoke all on function public.registration_code_valid(text) from public, anon, authenticated;

-- (5) Admin satu PAC hanya boleh mengubah profil PAC-nya; admin pusat (pac null) dan super admin semuanya.
drop policy admin_update on public.profiles;
create policy admin_update on public.profiles for update to authenticated
  using (public.is_admin() and (public.is_super() or public.my_pac() is null or pac is not distinct from public.my_pac()))
  with check (public.is_admin() and (public.is_super() or public.my_pac() is null or pac is not distinct from public.my_pac()));

-- (6) Admin hanya boleh memutuskan donasi (pending -> accepted/rejected); nominal, nama, bukti,
-- dan data lain tidak bisa diubah, dan siapa/kapan memverifikasi diisi server (tidak bisa dipalsukan).
create or replace function public.guard_donation_update() returns trigger
  language plpgsql set search_path = public as $$
begin
  if current_user in ('postgres', 'supabase_admin', 'service_role') then return new; end if;
  if (new.amount, new.donor_name, new.message, new.payment_method, new.proof_path, new.campaign_id, new.user_id, new.ref_number, new.created_at)
     is distinct from (old.amount, old.donor_name, old.message, old.payment_method, old.proof_path, old.campaign_id, old.user_id, old.ref_number, old.created_at) then
    raise exception 'Data donasi tidak bisa diubah, hanya statusnya';
  end if;
  if new.status is distinct from old.status then
    if old.status <> 'pending' then raise exception 'Donasi yang sudah diputuskan tidak bisa diubah lagi'; end if;
    new.verified_by := auth.uid();
    new.verified_at := now();
  else
    new.verified_by := old.verified_by;
    new.verified_at := old.verified_at;
  end if;
  return new;
end $$;
drop trigger if exists guard_donation_update on public.donations;
create trigger guard_donation_update before update on public.donations
  for each row execute function public.guard_donation_update();

-- (12) Fungsi internal tidak perlu bisa dipanggil lewat API publik.
revoke all on function public.set_updated_at(), public.link_candidate_user(), public.link_profile_candidates(),
  public.force_pending_donation(), public.guard_admin_role(), public.guard_donation_update() from public, anon, authenticated;
revoke all on function public.my_role(), public.is_staff(), public.is_admin(), public.my_pac(),
  public.can_score_event(uuid), public.can_manage_event(uuid) from public, anon;
grant execute on function public.my_role(), public.is_staff(), public.is_admin(), public.my_pac(),
  public.can_score_event(uuid), public.can_manage_event(uuid) to authenticated, service_role;
