# Spesifikasi: Direktori Pengurus PAC/Ranting

## Masalah
Bagian "Bagan Struktur Organisasi Perguruan" di tab Visi & Sejarah (`VisiMisiSection.jsx`, konstanta `ORGANIZATIONAL_HIERARCHY`) hanya menampilkan **6 tingkat hierarki generik** (PP → PW → PC → PAC → PR → PAR), tanpa nama orang. Pengunjung tidak tahu siapa Ketua/Sekretaris/Bendahara PAC Batam atau pengurus Ranting saat ini. Beda dengan "Info Tempat Latihan" yang sudah menampilkan nama pelatih per PAR — level pengurus di atasnya (PAC, Ranting) belum punya direktori sama sekali.

## Tujuan
- Pengunjung publik bisa melihat daftar pengurus aktif per level (PAC atau Ranting tertentu) beserta jabatannya.
- Admin bisa menambah/mengubah/menghapus data pengurus lewat panel admin, pola yang sama seperti kelola Pilar Visi Misi atau Tempat Latihan.
- Bagan hierarki generik yang sudah ada **tetap dipertahankan** (tidak dihapus) — direktori ini pelengkap, bukan pengganti.

## Non-tujuan
- Bukan sistem kepengurusan berjenjang dengan approval/voting — admin yang mengisi langsung, seperti CMS konten lain di aplikasi ini.
- Tidak terhubung ke akun login (`profiles`) — pengurus di direktori ini murni data tampilan, tidak otomatis jadi akun atau mendapat peran `admin`/`penguji`. Kalau pengurus itu juga admin aplikasi, perannya diatur terpisah lewat Kelola Akun seperti sekarang.

## Data Model (migrasi baru)
Ikuti pola persis `training_grounds` dan `pillars` (tabel sederhana, RLS baca-publik + tulis-admin):

```sql
create table public.officials (
  id uuid primary key default gen_random_uuid(),
  level text not null check (level in ('PAC', 'Ranting')),
  scope_name text not null,        -- nama PAC atau Ranting, mis. "PAC Batam" / "Ranting Sei Beduk"
  full_name text not null,
  position text not null,          -- jabatan, mis. "Ketua", "Sekretaris", "Bendahara"
  photo_url text,
  phone text,                      -- opsional, untuk tombol WhatsApp seperti di Tempat Latihan
  period text,                     -- masa jabatan, mis. "2024-2029"
  sort_order int not null default 0,
  active boolean not null default true
);

alter table public.officials enable row level security;
create policy read_all on public.officials for select using (active);
create policy admin_insert on public.officials for insert to authenticated with check (public.is_admin());
create policy admin_update on public.officials for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy admin_delete on public.officials for delete to authenticated using (public.is_admin());
```
- `active` dipakai supaya pengurus lama tidak perlu dihapus, cukup dinonaktifkan (riwayat tetap ada di database untuk admin, tapi tidak tampil ke publik).
- Policy baca publik pakai `using (active)`, bukan `using (true)` seperti `pillars` — supaya pengurus nonaktif otomatis tersembunyi tanpa perlu ditangani di kode frontend.

## Perubahan Backend (`src/lib/api.js`)
```js
export const listOfficials = async () =>
  ok(await supabase.from('officials').select('*').eq('active', true).order('level').order('sort_order'));
// admin: addOfficial, updateOfficial, deleteOfficial — pola sama persis seperti addTrainingGround dkk.
```

## Perubahan Frontend
- Seksi baru di `VisiMisiSection.jsx`, diletakkan **setelah** bagan hierarki yang ada, sebelum atau sesudah "Informasi Tempat Latihan" (urutan persisnya didiskusikan saat implementasi).
- Dikelompokkan per `level` lalu per `scope_name` — mis. kartu "PAC Batam" berisi semua pengurus levelnya, lalu daftar per Ranting di bawahnya.
- Form admin: field sesuai kolom tabel, pola sama seperti `TrainingGroundForm` yang sudah ada (kemungkinan reuse `ImageField` untuk foto).
- State di `AppContext.jsx`: `officialsList`, loader masuk ke `PUBLIC_LOADERS` (data publik, dibaca semua orang) — **bukan** `USER_LOADERS`, sama kelasnya dengan pilar/timeline/tempat latihan.

## Pertimbangan Privasi
Nomor telepon pengurus akan publik (seperti nomor pelatih di Tempat Latihan sekarang). Pastikan saat implementasi admin diberi tahu lewat label form bahwa field ini akan tampil ke semua pengunjung, bukan cuma anggota — supaya tidak ada pengurus yang nomornya ter-publish tanpa sadar.

## Kriteria Selesai
- [ ] Pengunjung publik (belum login) bisa melihat daftar pengurus PAC dan Ranting tanpa perlu masuk.
- [ ] Admin bisa tambah/ubah/nonaktifkan pengurus, perubahan langsung tampil ke publik tanpa perlu redeploy.
- [ ] Pengurus `active = false` tidak muncul di halaman publik tapi datanya tidak hilang dari database.
- [ ] Non-admin tidak bisa insert/update/delete lewat API langsung (diuji lewat RLS, pola sama seperti audit OWASP yang sudah dilakukan untuk tabel lain).
- [ ] Build dan tes unit tetap lulus.

## Keputusan (26 Nov 2026)
- PAC setara kecamatan di Batam — bisa ada banyak PAC. Kolom `pac` dipertahankan sebagai teks bebas (konsisten dengan `profiles.pac`/`ukt_events.pac` yang sudah ada), bukan tabel referensi terpisah.
- Tanpa foto (konsisten dengan keputusan menghapus foto pelatih di kartu kontak tempat latihan).
- Urutan tampil: `sort_order` (urutan tambah), dikelompokkan per PAC/Ranting.

## Status: Selesai diimplementasikan
- Migrasi `20261126000020_officials.sql`: tabel `officials` + RLS (baca publik untuk yang `active`, tulis admin saja, admin tetap bisa baca yang nonaktif).
- `src/lib/api.js`: `listOfficials`, `listOfficialsAdmin`, `addOfficial`, `updateOfficial`, `deleteOfficial`.
- `src/context/AppContext.jsx`: loader `officials` role-aware (admin lihat semua termasuk nonaktif, publik hanya yang aktif), handler mutasi.
- `src/components/OfficialsSection.jsx` (baru): tampilan publik dikelompokkan per PAC/Ranting dengan tombol WhatsApp, panel kelola admin (tambah/ubah/nonaktifkan/hapus), disisipkan di `VisiMisiSection.jsx` setelah bagan hierarki.
- Diuji lewat simulasi browser (tambah, label grup, hapus) sebelum deploy — build dan 18 tes unit tetap lulus.

## Estimasi Kasar
Kecil–menengah: 1 migrasi SQL (tabel + RLS), beberapa fungsi API, 1 seksi UI publik + 1 form admin. Pola implementasinya sudah berulang 3× di proyek ini (pillars, timeline, training_grounds), jadi risiko rendah.
