-- Keamanan (A07), versi tanpa Auth Hook (proyek masih paket gratis, hook ditolak
-- "entitlement_required" - lihat 20261123000017). Pencatatan gagal-login kini dilakukan
-- oleh Edge Function `login` (service role), BUKAN oleh RPC yang bisa dipanggil bebas:
-- kalau pencatatan "gagal" bisa dipicu aplikasi tanpa Supabase sendiri memverifikasi
-- percobaannya, siapa pun bisa mengunci akun orang lain hanya dengan tahu emailnya,
-- tanpa pernah mencoba password sama sekali. Tabel ini HANYA ditulis oleh service_role
-- (yang otomatis melewati RLS di Supabase), jadi anon/authenticated tak bisa menyentuhnya.
create table public.login_guard (
  email text not null,
  attempted_at timestamptz not null default now(),
  success boolean not null
);
create index login_guard_email_time on public.login_guard (lower(email), attempted_at desc);
alter table public.login_guard enable row level security;
-- Sengaja tanpa policy: anon & authenticated tidak mendapat akses sama sekali.
