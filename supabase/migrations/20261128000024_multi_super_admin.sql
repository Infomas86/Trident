-- Boleh ada lebih dari satu super admin. Super admin mengangkat/mencabut super admin lain
-- (lewat Edge Function manage-user); tidak bisa mengubah status dirinya sendiri, supaya
-- tidak pernah ada kondisi tanpa super admin.
drop index if exists public.one_super_admin;

create or replace function public.guard_admin_role() returns trigger
  language plpgsql set search_path = public as $$
begin
  -- Jalur service_role (Edge Function manage-user) dan SQL admin: fungsi sendiri yang memeriksa pemanggil.
  if current_user in ('postgres', 'supabase_admin', 'service_role') then return new; end if;
  if new.is_super is distinct from old.is_super then
    if not public.is_super() then raise exception 'Hanya super admin yang boleh mengubah status super admin'; end if;
    if old.id = auth.uid() then raise exception 'Super admin tidak bisa mengubah status dirinya sendiri'; end if;
  end if;
  if old.is_super and not public.is_super() then
    raise exception 'Akun super admin hanya bisa diubah oleh super admin';
  end if;
  if new.is_super and new.role <> 'admin' then
    raise exception 'Super admin harus berperan admin';
  end if;
  if new.role is distinct from old.role and 'admin' in (new.role, old.role) and not public.is_super() then
    raise exception 'Hanya super admin yang boleh mengangkat atau menurunkan admin';
  end if;
  return new;
end $$;
