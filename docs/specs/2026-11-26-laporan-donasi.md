# Spesifikasi: Laporan Donasi (Ringkasan per Periode/Program)

## Masalah
Admin sekarang hanya bisa melihat donasi satu-satu lewat tab **Verifikasi** (`DonasiVerifikasi.jsx`, hanya status `pending`) atau kartu ringkas per program di tab **Donasi** (`campaign_totals`: total terkumpul + jumlah donatur, tanpa rentang waktu). Tidak ada cara melihat: total donasi bulan ini vs bulan lalu, tren per program dari waktu ke waktu, atau mengekspor rekap untuk laporan ke pengurus/anggota.

## Tujuan
- Admin bisa melihat total donasi **per rentang waktu** (harian/bulanan/custom) dan **per program**, dalam satu layar.
- Admin bisa ekspor rekap ke CSV untuk dibagikan/diarsipkan.
- Tidak mengubah alur donasi/verifikasi yang sudah ada.

## Non-tujuan
- Bukan laporan keuangan penuh (tidak mencakup pengeluaran, hanya pemasukan donasi tervalidasi).
- Bukan dashboard real-time/live-update — cukup dimuat saat tab dibuka, sama seperti pola `loaders.*` yang ada.
- Tidak mengubah skema `donations`/`campaigns` yang ada.

## Data yang Tersedia (tidak perlu migrasi skema)
- Tabel `donations`: `amount`, `status`, `campaign_id`, `created_at`, RLS `own_or_admin_read` — admin sudah bisa `select` **seluruh** baris, bukan cuma `pending`. Dikonfirmasi lewat `supabase/migrations/20261114000002_rls.sql:71`.
- View `campaign_totals`: total terkumpul per program, tanpa filter waktu.

## Perubahan Backend

### Opsi A (disarankan): View SQL baru, ikuti pola `campaign_totals`
```sql
create view public.donation_report as
select
  d.campaign_id,
  c.title as campaign_title,
  date_trunc('month', d.created_at) as period_month,
  count(*) filter (where d.status = 'accepted') as donors_count,
  coalesce(sum(d.amount) filter (where d.status = 'accepted'), 0) as total_amount
from public.donations d
join public.campaigns c on c.id = d.campaign_id
group by d.campaign_id, c.title, date_trunc('month', d.created_at);
```
- Dibaca langsung lewat `supabase.from('donation_report').select(...)`, RLS tabel dasar (`donations`) tetap berlaku karena view `security_invoker` default di Postgres 15+ (perlu dicek versi Supabase saat implementasi — proyek ini Postgres 17, aman).
- Agregasi bulanan dilakukan di database, bukan di klien — menghindari menarik ribuan baris donasi mentah ke browser seiring donasi bertambah.

### Opsi B (kalau butuh filter custom range yang fleksibel)
RPC `get_donation_report(p_from date, p_to date)` mengembalikan baris teragregasi per program dalam rentang bebas, bukan cuma per bulan kalender.

**Rekomendasi:** mulai dari Opsi A (lebih sederhana), tambah Opsi B kalau nanti admin butuh rentang custom di luar bulan kalender.

### `src/lib/api.js`
```js
export const listDonationReport = async () =>
  ok(await supabase.from('donation_report').select('*').order('period_month', { ascending: false }));
```

## Perubahan Frontend
- Tab baru di dalam **Verifikasi** (atau sub-tab terpisah "Laporan"), hanya untuk admin — ikuti pola akses yang sama dengan `DonasiVerifikasi.jsx`.
- Tampilan: tabel/kartu per bulan × program, dengan total keseluruhan di atas.
- Tombol **Ekspor CSV** — pakai pola `saveFile()` yang sudah ada di `UktSection.jsx` (buat Blob, trigger download), tidak perlu library baru.
- Loader baru `donationReport` ditambahkan ke `loaders` di `AppContext.jsx`, dimuat lazy saat tab dibuka (pola sama seperti `LAZY_TABS` untuk Agenda/Donasi) — **bukan** di `USER_LOADERS` supaya tidak menambah beban saat login untuk admin yang tidak membuka laporan.

## Kriteria Selesai
- [ ] Admin melihat total donasi per bulan per program, data cocok dengan penjumlahan manual dari tabel `donations` berstatus `accepted`.
- [ ] Ekspor CSV menghasilkan file yang bisa dibuka Excel, angka tidak terbaca sebagai teks/salah format.
- [ ] Non-admin tidak bisa mengakses (baik lewat UI maupun langsung query `donation_report` — diuji RLS-nya).
- [ ] Build dan tes unit tetap lulus.

## Pertanyaan Terbuka
- Format ekspor: CSV cukup, atau perlu PDF/cetak langsung?
- Perlu grafik (chart) atau tabel angka saja cukup untuk kebutuhan sekarang?
- Apakah donasi yang `rejected` perlu ditampilkan di laporan (sebagai perbandingan), atau cukup `accepted` saja?

## Estimasi Kasar
Kecil–menengah: 1 view SQL, 1 fungsi API, 1 komponen UI baru + loader. Tidak ada perubahan ke alur donasi yang sudah ada.
