-- Super admin: satu-satunya akun yang boleh mengangkat/menurunkan admin. Sebelumnya policy
-- admin_update mengizinkan SEMUA admin mengubah profiles.role langsung lewat REST, jadi aturan
-- ini dipaksa di database (trigger), bukan hanya di UI atau Edge Function.
-- Penanda super admin diisi manual lewat SQL (lihat bawah), tidak ada jalur lewat aplikasi.
alter table public.profiles add column if not exists is_super boolean not null default false;
create unique index if not exists one_super_admin on public.profiles (is_super) where is_super;

create or replace function public.is_super() returns boolean
  language sql stable security definer set search_path = public as $$
  select coalesce((select is_super from public.profiles where id = auth.uid()), false)
$$;
revoke all on function public.is_super() from public, anon;
grant execute on function public.is_super() to authenticated;

-- Sengaja BUKAN security definer: current_user harus peran pemanggil (authenticated/service_role), bukan pemilik fungsi.
create or replace function public.guard_admin_role() returns trigger
  language plpgsql set search_path = public as $$
begin
  -- Jalur service_role (Edge Function manage-user) dan SQL admin: fungsi sendiri yang memeriksa pemanggil.
  if current_user in ('postgres', 'supabase_admin', 'service_role') then return new; end if;
  if new.is_super is distinct from old.is_super then
    raise exception 'is_super tidak bisa diubah dari aplikasi';
  end if;
  if old.is_super and not public.is_super() then
    raise exception 'Akun super admin hanya bisa diubah oleh dirinya sendiri';
  end if;
  if old.is_super and new.role <> 'admin' then
    raise exception 'Super admin tidak bisa diturunkan';
  end if;
  if new.role is distinct from old.role and 'admin' in (new.role, old.role) and not public.is_super() then
    raise exception 'Hanya super admin yang boleh mengangkat atau menurunkan admin';
  end if;
  return new;
end $$;

drop trigger if exists guard_admin_role on public.profiles;
create trigger guard_admin_role before update on public.profiles
  for each row execute function public.guard_admin_role();

-- Jalankan SEKALI di SQL Editor untuk menetapkan super admin (ganti email):
--   update public.profiles set is_super = true where id = (select id from auth.users where email = 'EMAIL_SUPER_ADMIN');
