-- Laporan donasi: ringkasan per bulan x program, dihitung di database (bukan menarik seluruh
-- baris donasi mentah ke klien). Hanya status 'accepted' yang dihitung sebagai pemasukan nyata.
--
-- PENTING: security_invoker = true WAJIB eksplisit. View Postgres secara default berjalan
-- dengan hak akses PEMILIK view (mirip security definer), BUKAN hak akses pemanggil - kalau
-- opsi ini tidak diset, RLS tabel donations (own_or_admin_read) akan dilewati dan siapa pun
-- yang authenticated bisa melihat ringkasan SELURUH donasi, bukan cuma miliknya/milik semua
-- (kalau admin). security_invoker membuat view berjalan dengan hak akses pemanggil, sehingga
-- RLS donations tetap berlaku persis seperti query langsung ke tabelnya.
create view public.donation_report
with (security_invoker = true)
as
select
  d.campaign_id,
  c.title as campaign_title,
  date_trunc('month', d.created_at)::date as period_month,
  count(*) filter (where d.status = 'accepted') as donors_count,
  coalesce(sum(d.amount) filter (where d.status = 'accepted'), 0) as total_amount
from public.donations d
join public.campaigns c on c.id = d.campaign_id
group by d.campaign_id, c.title, date_trunc('month', d.created_at);

-- Izin eksplisit, mengikuti pola view lain di proyek ini (campaign_totals dkk) - tidak
-- mengandalkan privilese default. anon tidak diberi akses (fitur ini admin-only); RLS
-- donations juga sudah hanya untuk role authenticated, jadi anon tetap 0 baris walau lupa revoke.
revoke all on public.donation_report from public, anon;
grant select on public.donation_report to authenticated;
