-- Saat anggota mendaftar mandiri: simpan PAC dari metadata, dan beri No. Registrasi
-- otomatis yang unik (nomor urut). Role tetap 'anggota'. Admin tetap bisa menyetel ulang
-- No. Registrasi lewat Kelola Akun.
create sequence if not exists public.member_reg_seq;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, role, pac, reg_number)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data->>'full_name'), ''), split_part(new.email, '@', 1)),
    'anggota',
    nullif(trim(new.raw_user_meta_data->>'pac'), ''),
    'PNKB-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('public.member_reg_seq')::text, 4, '0')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
