-- Admin-editable history timeline and secretariat contact.

create table public.timeline_events (
  id uuid primary key default gen_random_uuid(),
  year text not null,
  title text not null,
  "desc" text,
  badge text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.timeline_events enable row level security;
create policy anyone_read on public.timeline_events for select using (true);
create policy admin_insert on public.timeline_events for insert to authenticated with check (public.is_admin());
create policy admin_update on public.timeline_events for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy admin_delete on public.timeline_events for delete to authenticated using (public.is_admin());

insert into public.timeline_events (year, title, "desc", badge, sort_order) values
  ('1984', 'Pendirian Padepokan Utama', 'Didirikan oleh Guru Besar Raden Mas Hardjo dengan 15 murid perdana, berfokus pada pelestarian jurus asli dan olah batin kesatria.', 'Akar Tradisi', 1),
  ('1998', 'Ekspansi & Standarisasi Kurikulum', 'Penyusunan kurikulum resmi 4 Pos Evaluasi dan penggabungan teknik beladiri praktis dengan pembinaan fisik terukur.', 'Kurikulum Modern', 2),
  ('2012', 'Kejuaraan Dunia & Prestasi Emas', 'Meraih juara umum pada Kejuaraan Seni Bela Diri Internasional di Chiang Mai dan pengakuan federasi dunia.', 'Prestasi Internasional', 3),
  ('2026', 'Digitalisasi Sistem Trident UKT', 'Peluncuran sistem manajemen modern terintegrasi, transparansi evaluasi 4 Pos, dan penguatan kemandirian perguruan.', 'Transformasi Digital', 4);

alter table public.site_content
  add column secretariat_name text,
  add column secretariat_address text,
  add column secretariat_phone text,
  add column secretariat_email text;

update public.site_content set
  secretariat_name = 'Sekretariat Padepokan',
  secretariat_address = 'Gedung Mandala Krida, Jl. Ksatria Padepokan Agung No. 128, Indonesia',
  secretariat_phone = '+62 (021) 884-TRIDENT',
  secretariat_email = 'sekretariat@trident-martialarts.org'
where id = 1;
