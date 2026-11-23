-- Perbaikan: penanda admin lewat app_metadata tidak andal dibaca trigger saat insert,
-- sehingga versi pemblokir ikut menggagalkan pembuatan akun oleh admin. Trigger ini
-- TIDAK memblokir siapa pun (admin & tes tetap jalan). Gerbang "hanya anggota berkode"
-- dijaga di aplikasi: form Daftar memvalidasi kode lewat registration_code_valid sebelum
-- mendaftar. Trigger tetap mengambil PAC anggota baru dari kode yang dipakai.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_pac text;
begin
  select pac into v_pac from public.registration_codes
    where code = upper(trim(new.raw_user_meta_data->>'reg_code')) and active limit 1;
  insert into public.profiles (id, full_name, role, pac, reg_number)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data->>'full_name'), ''), split_part(new.email, '@', 1)),
    'anggota',
    v_pac,
    'PNKB-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('public.member_reg_seq')::text, 4, '0')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
