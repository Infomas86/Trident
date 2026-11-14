# Desain Backend Trident (Supabase)

Tanggal: 2026-11-14

## Maksud dan alasan

Trident akan **dipakai sungguhan** oleh anggota dan penguji perguruan, lewat APK
Android (Capacitor) dan web. Saat ini semua data adalah data contoh di
`src/context/AppContext.jsx`: hilang saat app ditutup, tidak sama antar HP, dan
"peran" hanya tombol pilihan dengan kode admin yang tertulis di frontend.

Backend harus membuat:
1. Data tersimpan permanen dan sama di semua perangkat.
2. Setiap orang login dengan akunnya sendiri; hak akses dijaga di server, bukan di
   tampilan, sehingga APK yang dibongkar pun tidak bisa mengubah nilai UKT.
3. Donasi tercatat jujur: dana terkumpul hanya bertambah setelah bukti transfer
   diverifikasi.

## Goals

- Login email + password. Tamu (tidak login) hanya bisa membaca Berita, Prestasi,
  dan Visi-Misi/Statistik.
- Akun **dibuat oleh admin**, tidak ada daftar mandiri (orang luar tidak bisa
  mengaku anggota).
- CRUD dengan hak akses per peran untuk: peserta UKT + nilai 4 pos, berita,
  prestasi, agenda + RSVP, program donasi + donasi, statistik perguruan.
- Donasi cara manual: anggota transfer ke rekening/QRIS statis perguruan, unggah
  bukti, admin menekan Terima/Tolak. Resi hanya untuk donasi yang diterima.
- Biaya Rp0/bulan (Supabase paket gratis).

## Non-goals

- Payment gateway (Midtrans/Xendit). Bisa ditambah nanti.
- Upload foto untuk berita/prestasi/peserta: tetap berupa URL teks seperti sekarang.
- Ekspor CSV / cetak resi di APK (temuan audit no. 5): pekerjaan terpisah.
- Notifikasi push, chat, multi-bahasa.
- Mode offline (app butuh internet untuk data).

## Anti-goals (gagal walau "jalan")

- Anggota bisa mengubah nilai siapa pun, atau melihat nilai peserta lain.
- Kunci rahasia Supabase (`service_role`) ikut masuk ke APK/web.
- Dana terkumpul bertambah dari donasi yang belum diverifikasi.
- Data hilang tanpa cadangan saat proyek gratis berhenti.

## Batasan

- Supabase Free: 500 MB database, 1 GB file, proyek **berhenti setelah 7 hari tanpa
  aktivitas**, tanpa backup otomatis.
- Frontend tetap React 19 + Vite + Capacitor 8; komponen yang ada sebisa mungkin
  tidak diubah bentuknya.
- Kunci `anon` Supabase memang publik (ada di APK); semua keamanan lewat
  Row Level Security (RLS: aturan akses per baris di database).

## Approaches

| Pendekatan | Untung | Rugi |
|---|---|---|
| **Supabase gratis (dipilih)** | Database + login + file + RLS siap pakai, tanpa server untuk dirawat, Rp0 | Tidur setelah 7 hari sepi; backup harus diskrip; bergantung satu layanan |
| PocketBase di VPS (~Rp50rb/bln) | Tidak tidur, backup bawaan, server bisa di Indonesia | Ada server yang harus dirawat |
| Supabase Pro ($25/bln) | Tanpa tidur, backup harian | Mahal untuk skala perguruan |

Pengguna memilih **"coba dulu di Supabase"** (gratis). Firebase dan Render gratis
ditolak: Firebase Storage wajib kartu kredit; database gratis Render dihapus
setelah 30 hari.

## Yang sudah diputuskan pengguna

- Dipakai sungguhan.
- Donasi: cara 1, transfer manual + unggah bukti + verifikasi.
- Backend: Supabase paket gratis.

## Desain

### Peran

| Peran | Siapa | Boleh |
|---|---|---|
| tamu | tidak login | baca berita, prestasi, statistik |
| anggota | pesilat | + baca agenda & RSVP diri sendiri, lihat program donasi, berdonasi + unggah bukti, lihat donasi & resi sendiri, lihat nilai UKT **dirinya saja** |
| penguji | dewan penguji | + kelola peserta UKT & nilai (termasuk impor/ekspor CSV), tulis berita, prestasi, agenda |
| admin | pengurus | semua hal + buat/atur akun & peran, kelola program donasi, verifikasi donasi, ubah statistik |

*Keputusan saya:* verifikasi donasi dipegang `admin` (tidak ada peran bendahara
terpisah).

### Tabel (PostgreSQL)

- `profiles` — `id` (= `auth.users.id`), `full_name`, `role` (`anggota|penguji|admin`),
  `belt`, `branch`, `reg_number` (unik, boleh kosong), `photo_url`, `created_at`.
  Dibuat bersamaan dengan akun.
- `news` — `id`, `title`, `category`, `summary`, `content`, `image_url`, `tags text[]`,
  `author_id`, `author_name`, `created_at`.
- `achievements` — `id`, `athlete_name`, `championship`, `scope`, `medal`,
  `category`, `year`, `notes`, `photo_url`, `created_at`.
- `agendas` — `id`, `title`, `date date`, `time_text`, `location`, `speaker`,
  `description`, `created_by`, `created_at`.
- `agenda_rsvps` — `agenda_id`, `user_id`, `status` (`hadir|izin`), `reason`,
  unik (`agenda_id`, `user_id`).
- `campaigns` — `id`, `title`, `category`, `target_amount bigint`, `deadline date`,
  `description`, `created_at`.
- `donations` — `id`, `ref_number` (unik, dibuat database), `campaign_id`,
  `user_id`, `donor_name`, `amount bigint > 0`, `message`, `payment_method`,
  `proof_path` (file di Storage), `status` (`pending|accepted|rejected`, default
  `pending`), `verified_by`, `verified_at`, `created_at`.
- View `campaign_totals` — `collected_amount` dan `donors_count` per program,
  dihitung dari donasi `accepted` saja (tidak disimpan, jadi tidak bisa meleset).
- View `public_donations` — nama, jumlah, pesan, tanggal dari donasi `accepted`
  (untuk daftar "donasi terbaru"), tanpa bukti transfer.
- `ukt_candidates` — `id`, `reg_number` (unik), `name`, `branch`, `current_belt`,
  `target_belt`, `photo_url`, `user_id` (nullable, akun anggota yang bersangkutan),
  `pos1..pos4 numeric` dengan CHECK 0–100, `sub_scores jsonb`, `final_score`
  (kolom terhitung: `round(pos1*.25+pos2*.30+pos3*.20+pos4*.25, 1)`),
  `examiner_notes`, `examiner_id`, `exam_date`, `updated_at`.
  Predikat (LULUS / PUJIAN / HER) tetap dihitung di frontend dari `final_score`
  dengan batas yang sama seperti `calculateUktScore`.
- `site_settings` — satu baris: angka statistik di halaman Visi-Misi + info rekening/QRIS donasi.

Timeline sejarah dan 4 pilar tetap konstanta di kode (tidak ada UI edit).

### Aturan akses (RLS)

- `news`, `achievements`, `site_settings`: baca semua orang termasuk tamu; tulis
  penguji/admin (`site_settings`: admin).
- `agendas`: baca yang login; tulis penguji/admin. `agenda_rsvps`: baca yang login;
  tambah/ubah baris milik sendiri saja.
- `campaigns`, `campaign_totals`, `public_donations`: baca yang login; tulis
  `campaigns` admin.
- `donations`: anggota tambah baris milik sendiri (status selalu `pending`, dijaga
  database), baca milik sendiri; admin baca semua dan satu-satunya yang boleh
  mengubah `status`.
- `ukt_candidates`: penguji/admin penuh; anggota hanya baca baris dengan
  `user_id = dirinya`.
- `profiles`: baca milik sendiri; penguji/admin baca semua; hanya admin yang
  mengubah `role`.
- Storage bucket `donation-proofs` (privat): pemilik unggah ke folder `user_id`
  miliknya; pemilik dan admin bisa melihat.

### Membuat akun

Daftar mandiri dimatikan di pengaturan Supabase. Admin membuat akun dari halaman
"Kelola Akun" di app; halaman itu memanggil **Edge Function** `manage-user`
(fungsi kecil di server Supabase) yang mengecek pemanggil adalah admin lalu
membuat user + baris `profiles` memakai kunci rahasia yang hanya ada di server.
Admin menetapkan kata sandi awal dan memberikannya ke anggota. Akun admin pertama
dibuat manual di dashboard Supabase.

### Perubahan frontend

- Tambah `@supabase/supabase-js`; `src/lib/supabase.js` membuat klien dari
  `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY` (file `.env.local`, tidak di-commit).
- `AppContext` tetap memberi nama handler yang sama (`handleAddNews`,
  `handleDonate`, `handleUpdateCandidateScores`, dst.) tetapi membaca/menulis ke
  Supabase; data dimuat saat app dibuka dan setelah login. `role` dan
  `currentUser` diambil dari sesi + `profiles`.
- Dihapus: `AdminCodeModal`, daftar kode, tombol simulasi ganti peran
  (`RoleBanner` dan menu peran di `Navbar`), `localStorage('trident_role')`,
  `USER_PROFILES`. Diganti layar/modal **Login** dan tombol **Keluar**.
- Donasi: setelah isi nominal → tampilkan rekening/QRIS statis perguruan → unggah
  foto bukti → status "Menunggu verifikasi". Admin punya daftar donasi pending
  dengan tombol Terima/Tolak dan bisa melihat bukti. Resi hanya bisa dibuka untuk
  donasi `accepted`.
- UKT: tampilan anggota mengambil baris miliknya (bukan cari nama). Impor CSV
  melakukan *upsert* berdasarkan `reg_number` dan menolak nilai di luar 0–100
  dengan pesan nomor baris (memperbaiki temuan audit 6 dan 7).

### Tetap aktif dan cadangan

Pengguna memilih **backup manual, tanpa GitHub Actions**.

- Skrip `npm run backup` (dijalankan di laptop): `supabase db dump` untuk skema +
  data, ditambah unduhan isi bucket `donation-proofs`, ke folder `backups/<tanggal>/`
  (folder di-ignore git). URL koneksi DB dibaca dari `.env.local`. Saran: sebulan
  sekali.
- Tidak ada keepalive otomatis (*keputusan saya*: tanpa GitHub tidak ada tempat
  gratis untuk menjalankannya). Pemakaian rutin app sudah membuat proyek tetap
  aktif; bila tetap berhenti (libur panjang), admin klik **Restore** di dashboard
  Supabase. Data tidak hilang. Langkah ini ditulis di README.

### Struktur file

- `supabase/migrations/*.sql` — tabel, view, RLS, storage policy.
- `supabase/functions/manage-user/index.ts` — Edge Function kelola akun.
- Diterapkan dengan Supabase CLI (`npx supabase db push`, `npx supabase functions deploy`).

### Pengujian

- `node --test` untuk aturan skor (`calculateUktScore`, batas 69,9/70,0 dan
  84,9/85,0) dan parser CSV.
- Skrip uji RLS (`npm run test:rls`) yang login sebagai akun anggota uji dan
  memastikan: tidak bisa mengubah nilai, tidak bisa melihat peserta lain, tidak
  bisa mengubah status donasi, tidak bisa membuat akun.

## Diserahkan ke pembangun

- Nama kolom persis, indeks, dan nama file migrasi.
- Tampilan layar login dan halaman Kelola Akun/Verifikasi Donasi, mengikuti gaya
  komponen yang sudah ada.
- Format `ref_number` donasi (asal unik dan dibuat database).
- Cara memuat ulang data setelah perubahan (muat ulang list atau update lokal).

## Keputusan tambahan setelah builder check (keputusan saya, bisa dikoreksi)

- **Menghubungkan peserta UKT ke akun anggota:** trigger database mengisi
  `ukt_candidates.user_id` otomatis bila `reg_number` peserta sama dengan
  `profiles.reg_number` (berlaku dua arah: saat peserta dibuat/diimpor dan saat akun
  dibuat/diubah). Impor CSV tidak pernah mengisi `user_id` langsung. Tanpa
  `reg_number` yang cocok, anggota melihat "belum terdaftar sebagai peserta".
- **Kelola akun:** Edge Function `manage-user` (menggantikan `create-user`) dengan
  aksi: buat akun, reset kata sandi (admin set sandi baru), nonaktifkan/aktifkan
  (ban di Supabase Auth, tanpa hapus data), ubah profil (nama, sabuk, cabang,
  `reg_number`, peran). Tidak ada hapus permanen.
- **Edit/hapus konten:** semua entitas mendapat tombol **hapus** (penguji/admin
  sesuai tabel peran). **Edit** hanya untuk peserta UKT/nilai (sudah ada), program
  donasi, dan statistik. Edit berita/prestasi/agenda: hapus lalu buat ulang, untuk
  sekarang.
- **Data contoh:** tidak dimasukkan ke database. App mulai kosong; setiap daftar
  punya tampilan "belum ada data". Baris `site_settings` dibuat dengan angka 0.
- **RSVP:** semua anggota yang login melihat nama + status (hadir/izin) peserta
  agenda; **alasan izin** hanya terlihat oleh orangnya sendiri dan penguji/admin
  (lewat view). Nama disalin ke baris RSVP saat disimpan.
- **Rekening & QRIS donasi:** `site_stats` diganti `site_settings` (satu baris)
  berisi statistik + `bank_name`, `bank_account`, `bank_holder`, `qris_image_url`;
  diubah admin dari app.

## Jawaban pengguna

1. Semua anggota punya email sendiri → login **email + kata sandi** biasa.
2. Backup **manual** saja (lihat "Tetap aktif dan cadangan").

## Pembaruan: setelah pull upstream `75cbe64`

Upstream menambah portal login (palsu), peran Admin + CMS, mode offline/auto-sync
(hanya `localStorage`), tempat latihan + kontak WhatsApp pelatih, dan struktur
organisasi 6 tingkat (PP → PW → PC → PAC → PR → PAR) pada peserta. Bagian ini
**menggantikan** bagian di atas bila bertentangan. Semua butir adalah keputusan saya
kecuali disebut lain.

### Peran di frontend
- Nilai `ROLES` di kode disamakan dengan database:
  `{ PUBLIC: 'public', MEMBER: 'anggota', EXAMINER: 'penguji', ADMIN: 'admin' }`.
  Pemeriksaan `role === ROLES.EXAMINER || role === ROLES.ADMIN` diganti `isStaff`.
- `LoginPage.jsx` dari upstream **dipakai ulang** sebagai layar login, tapi kartu
  "1-Klik Akses", tab manual "KTA/username", dan petunjuk "ketik admin" dihapus.
  Isinya form email + kata sandi yang memanggil `signIn`.
- Menu ganti peran di `Navbar`, `RoleBanner`, `AdminCodeModal`, dan pilihan peran di
  `LockedFeatureModal` dihapus. Tersisa tombol Masuk/Keluar.

### Konten CMS (diubah admin)
- `pillars(id, title, desc text, icon text, sort_order int)`: icon berupa nama ikon
  lucide (string), seperti sekarang.
- `training_grounds(id, name, tier, parent_pr, address, trainer_name, trainer_belt,
  trainer_phone, trainer_photo_url, schedule, facilities text[], active_students int,
  badge, description, created_at)`.
- `site_content` (satu baris, admin): `hero_badge`, `hero_title_main`,
  `hero_title_highlight`, `hero_subtitle`, ditambah info rekening/QRIS donasi
  (`bank_name`, `bank_account`, `bank_holder`, `qris_image_url`).
- `site_stats` (satu baris): angka statistik. Boleh diubah **penguji dan admin**,
  mengikuti upstream yang menampilkan "Edit Statistik (Penguji)". Karena hak ubahnya
  berbeda dari info rekening, `site_settings` dipecah menjadi `site_stats` +
  `site_content`.
- Semua tabel CMS di atas: baca semua orang termasuk tamu (halaman Visi-Misi publik).
- Timeline sejarah tetap konstanta di kode (`handleUpdateTimeline` tidak dipakai UI,
  jadi dihapus).
- Isi awal: pilar dan hero diisi dari data upstream (`INITIAL_PILLARS`,
  `INITIAL_HERO_DATA`) karena ini teks resmi perguruan, bukan data contoh. Tempat
  latihan **tidak** diisi (data contoh). Admin mengisinya sendiri.
- Link WhatsApp: nomor dinormalisasi (hanya angka, awalan `0` → `62`).

### Struktur organisasi peserta
- `ukt_candidates` mendapat kolom `struct_pp`, `struct_pw`, `struct_pc`,
  `struct_pac`, `struct_pr`, `struct_par` (teks, boleh kosong). Kolom-kolom ini
  ikut di impor/ekspor CSV setelah kolom catatan (kolom 13–18). File lama tanpa
  kolom ini tetap bisa diimpor.
- Filter ranting di tab UKT diambil dari nilai `struct_pr` yang ada di data
  peserta, bukan daftar tetap di kode.
- Hak ubah tetap **tidak** dibatasi per ranting: semua penguji boleh menilai semua
  peserta. Pembatasan per ranting = pekerjaan terpisah bila dibutuhkan.

### Mode offline penilaian UKT (pengguna memilih: **pertahankan**)

Tujuan: penguji bisa menilai di lokasi tanpa sinyal, dan nilainya otomatis terkirim
ke Supabase saat sinyal kembali, tanpa diam-diam menimpa nilai penguji lain.

- **Cakupan:** hanya penyimpanan nilai UKT (pos 1–4, sub-nilai, catatan), seperti
  upstream. Berita, agenda, donasi, impor CSV, dan CMS tetap butuh koneksi (toast
  "Butuh koneksi internet").
- **Bisa dibuka tanpa sinyal:** untuk penguji/admin, daftar peserta terakhir dan
  profil login disimpan di `localStorage` (`trident_cache_candidates`,
  `trident_cache_profile`) setiap kali berhasil dimuat. Saat offline, app memakai
  cache ini; sesi login Supabase tetap tersimpan di perangkat. Saat keluar akun,
  cache dan antrean dihapus (bila antrean belum terkirim, minta konfirmasi dulu).
- **Antrean:** `trident_offline_queue` di `localStorage`. Satu item per peserta
  (simpan ulang peserta yang sama menggantikan item lama), berisi nilai baru dan
  `baseUpdatedAt` = `updated_at` peserta saat form dibuka.
- **Kapan dikirim:** saat event `online`, saat app dibuka, dan lewat tombol
  "Sinkronkan Sekarang". Item dikirim satu per satu; yang berhasil dihapus dari
  antrean.
- **Bentrok** (*keputusan saya*): update hanya berhasil bila `updated_at` di server
  masih sama dengan `baseUpdatedAt`. Bila tidak sama (penguji lain sudah mengubah
  peserta itu), item **tidak** dikirim dan penguji melihat daftar "Nilai bentrok":
  nilai dia vs nilai di server, dengan pilihan **Pakai nilai saya** (kirim paksa)
  atau **Pakai nilai server** (buang punya saya). Alasan: menimpa diam-diam bisa
  menghapus nilai ujian penguji lain.
- **Simpan saat online tapi gagal** (sinyal putus di tengah): nilai masuk antrean,
  bukan hilang.
- **Tampilan:** status bar upstream dipertahankan dengan teks yang jujur: "Online"
  / "Offline: nilai disimpan di HP ini dan dikirim saat sinyal kembali", jumlah
  antrean, tombol Sinkronkan Sekarang. Tombol **simulasi hilang sinyal dihapus**
  (pengujian memakai mode pesawat).
- Toast tidak lagi bilang "tersinkronisasi" sebelum server benar-benar menerima.
- Penyimpanan `localStorage` lain dari upstream (`trident_candidates`,
  `trident_stats`, `trident_pillars`, `trident_hero`, `trident_training_grounds`,
  `trident_role`) dihapus; sumbernya Supabase.
- Risiko yang diterima: nilai di antrean hilang bila data browser/app dihapus
  sebelum sinyal kembali. Badge jumlah antrean selalu terlihat supaya penguji tahu.
