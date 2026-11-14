-- Self sign-up (always as anggota) and one-time examiner codes issued by admin.

-- Every new auth user gets an 'anggota' profile. Name comes from sign-up metadata.
-- reg_number is never taken from the user (it links to UKT scores); only admin sets it.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data->>'full_name'), ''), split_part(new.email, '@', 1)),
    'anggota'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- One-time codes: admin creates them, a member redeems one to become penguji.
create table public.examiner_codes (
  code text primary key check (code = upper(code) and length(code) >= 6),
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now(),
  used_by uuid references public.profiles (id) on delete set null,
  used_at timestamptz
);

alter table public.examiner_codes enable row level security;
create policy admin_read on public.examiner_codes for select to authenticated using (public.is_admin());
create policy admin_insert on public.examiner_codes for insert to authenticated with check (public.is_admin());
create policy admin_delete on public.examiner_codes for delete to authenticated using (public.is_admin());

create or replace function public.redeem_examiner_code(p_code text)
returns text language plpgsql security definer set search_path = public as $$
declare
  me uuid := auth.uid();
begin
  if me is null then
    raise exception 'Harus masuk terlebih dahulu';
  end if;
  update public.examiner_codes
    set used_by = me, used_at = now()
    where code = upper(trim(p_code)) and used_by is null;
  if not found then
    raise exception 'Kode penguji tidak valid atau sudah dipakai';
  end if;
  update public.profiles set role = 'penguji' where id = me and role = 'anggota';
  return 'ok';
end;
$$;

revoke all on function public.redeem_examiner_code(text) from public, anon;
grant execute on function public.redeem_examiner_code(text) to authenticated;
