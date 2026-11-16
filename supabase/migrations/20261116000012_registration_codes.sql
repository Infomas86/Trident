-- Hanya calon anggota yang punya KODE PENDAFTARAN dari admin yang bisa daftar mandiri.
-- Kode dibuat & dibagikan admin PAC; PAC anggota baru mengikuti PAC pemilik kode.
-- Keamanan dikunci di trigger (server), tidak bisa diakali dari sisi aplikasi.
create table public.registration_codes (
  code text primary key check (code = upper(code) and length(code) >= 6),
  pac text,
  label text,
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now(),
  active boolean not null default true
);
alter table public.registration_codes enable row level security;

-- Admin mengelola kode PAC-nya; admin pusat (pac null) mengelola semua.
create policy regcode_read on public.registration_codes for select to authenticated
  using (public.is_admin() and (public.my_pac() is null or pac is not distinct from public.my_pac()));
create policy regcode_insert on public.registration_codes for insert to authenticated
  with check (public.is_admin() and (public.my_pac() is null or pac is not distinct from public.my_pac()));
create policy regcode_update on public.registration_codes for update to authenticated
  using (public.is_admin() and (public.my_pac() is null or pac is not distinct from public.my_pac()));
create policy regcode_delete on public.registration_codes for delete to authenticated
  using (public.is_admin() and (public.my_pac() is null or pac is not distinct from public.my_pac()));

-- Validasi satu kode untuk pesan error yang ramah (anon boleh). Tidak membocorkan daftar kode.
create or replace function public.registration_code_valid(p_code text)
returns boolean language sql security definer stable set search_path = public as $$
  select exists (select 1 from public.registration_codes where code = upper(trim(p_code)) and active);
$$;
grant execute on function public.registration_code_valid(text) to anon, authenticated;

-- Trigger: akun buatan admin (app_metadata.admin_created, hanya bisa diset server) dilewati;
-- selain itu WAJIB kode valid, dan PAC anggota baru diambil dari kode.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_pac text;
  v_ok boolean := false;
begin
  if coalesce((new.raw_app_meta_data->>'admin_created')::boolean, false) then
    return new; -- profil diisi oleh fungsi manage-user
  end if;
  select pac, true into v_pac, v_ok from public.registration_codes
    where code = upper(trim(new.raw_user_meta_data->>'reg_code')) and active limit 1;
  if not coalesce(v_ok, false) then
    raise exception 'KODE_PENDAFTARAN_TIDAK_VALID';
  end if;
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
