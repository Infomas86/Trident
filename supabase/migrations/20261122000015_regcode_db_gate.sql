-- Perbaikan keamanan: gerbang "hanya anggota berkode" dipindah kembali ke database.
-- 20261116000013 sengaja melepas pemblokiran karena app_metadata.admin_created tak andal dibaca
-- trigger saat insert; akibatnya siapa pun yang memanggil Supabase Auth langsung (bukan lewat
-- form Daftar) bisa mendaftar tanpa kode. Di Postgres, app_metadata SUDAH tersimpan di
-- auth.users.raw_app_meta_data pada saat trigger AFTER INSERT ini berjalan (bukan di body
-- request signUp yang dibaca client), jadi ia andal dipakai di sini.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_pac text;
  v_ok boolean := false;
begin
  if coalesce((new.raw_app_meta_data->>'admin_created')::boolean, false) then
    return new; -- profil diisi fungsi manage-user (admin_created hanya bisa di-set server, lewat service role)
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
