-- Hierarki tempat latihan: PAC -> Ranting -> Anak Ranting (tempat latihan, tabel training_grounds).
-- Dibaca publik, ditulis admin (pola sama dengan training_grounds).
create table public.training_units (
  id uuid primary key default gen_random_uuid(),
  level text not null check (level in ('PAC', 'Ranting')),
  name text not null check (length(trim(name)) > 0),
  parent_id uuid references public.training_units (id) on delete cascade,
  created_at timestamptz not null default now(),
  check ((level = 'PAC' and parent_id is null) or (level = 'Ranting' and parent_id is not null))
);
create unique index training_units_pac_name on public.training_units (lower(name)) where level = 'PAC';
create unique index training_units_ranting_name on public.training_units (parent_id, lower(name)) where level = 'Ranting';

alter table public.training_units enable row level security;
create policy read_all on public.training_units for select using (true);
create policy admin_insert on public.training_units for insert to authenticated with check (public.is_admin());
create policy admin_update on public.training_units for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy admin_delete on public.training_units for delete to authenticated using (public.is_admin());

alter table public.training_grounds add column ranting_id uuid references public.training_units (id) on delete restrict;

-- Data lama: parent_pr berbentuk "<Ranting> - <PAC>" dipecah menjadi PAC + Ranting.
do $$
declare g record; v_pac uuid; v_rant uuid; v_pac_name text; v_rant_name text;
begin
  for g in select id, parent_pr from public.training_grounds where ranting_id is null loop
    if g.parent_pr ~ ' - ' then
      v_rant_name := trim(split_part(g.parent_pr, ' - ', 1));
      v_pac_name := trim(substr(g.parent_pr, position(' - ' in g.parent_pr) + 3));
    else
      v_rant_name := trim(g.parent_pr); v_pac_name := 'PAC (belum diatur)';
    end if;
    select id into v_pac from public.training_units where level = 'PAC' and lower(name) = lower(v_pac_name);
    if v_pac is null then
      insert into public.training_units (level, name) values ('PAC', v_pac_name) returning id into v_pac;
    end if;
    select id into v_rant from public.training_units where level = 'Ranting' and parent_id = v_pac and lower(name) = lower(v_rant_name);
    if v_rant is null then
      insert into public.training_units (level, name, parent_id) values ('Ranting', v_rant_name, v_pac) returning id into v_rant;
    end if;
    update public.training_grounds set ranting_id = v_rant where id = g.id;
  end loop;
end $$;
