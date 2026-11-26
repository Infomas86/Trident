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

## Pertanyaan Terbuka
- Satu PAC (Batam) atau akan ada beberapa PAC di masa depan? Kalau cuma satu PAC untuk selamanya, kolom `level`/`scope_name` bisa disederhanakan jadi cukup `level` saja ('PAC' vs 'Ranting') tanpa nama PAC eksplisit.
- Apakah perlu foto wajib, atau opsional seperti sekarang (pelatih tanpa foto baru-baru ini malah dihapus tampilannya atas permintaan Anda — mungkin pengurus juga sebaiknya tanpa foto, cek konsistensi preferensi ini dulu).
- Urutan tampil: berdasarkan jabatan (Ketua dulu) atau abjad nama?

## Estimasi Kasar
Kecil–menengah: 1 migrasi SQL (tabel + RLS), beberapa fungsi API, 1 seksi UI publik + 1 form admin. Pola implementasinya sudah berulang 3× di proyek ini (pillars, timeline, training_grounds), jadi risiko rendah.
