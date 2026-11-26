-- Direktori Pengurus PAC/Ranting. PAC setara kecamatan (bisa lebih dari satu PAC di masa depan),
-- jadi kolom pac/branch dipakai persis seperti konvensi profiles.pac/profiles.branch yang sudah ada.
-- Pola tabel & RLS mengikuti pillars/training_grounds: baca publik, tulis admin saja.
create table public.officials (
  id uuid primary key default gen_random_uuid(),
  level text not null check (level in ('PAC', 'Ranting')),
  pac text not null,              -- nama PAC, mis. "PAC Batam Kota" (setara kecamatan)
  branch text,                    -- nama Ranting, diisi hanya bila level = 'Ranting'
  full_name text not null,
  position text not null,         -- jabatan, mis. "Ketua", "Sekretaris", "Bendahara"
  photo_url text,
  phone text,
  period text,                    -- masa jabatan, mis. "2024-2029"
  sort_order int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.officials enable row level security;

-- Pengurus nonaktif tersembunyi dari publik tapi tetap ada di database untuk admin (RLS admin
-- di bawah memakai is_admin() yang tidak memfilter active, jadi admin tetap bisa kelola semuanya).
create policy officials_read_public on public.officials for select using (active);
create policy officials_read_admin on public.officials for select to authenticated using (public.is_admin());
create policy officials_insert on public.officials for insert to authenticated with check (public.is_admin());
create policy officials_update on public.officials for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy officials_delete on public.officials for delete to authenticated using (public.is_admin());

create index officials_level_pac_idx on public.officials (level, pac, sort_order);
