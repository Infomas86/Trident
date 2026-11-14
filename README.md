# Trident - Martial Arts Academy Management & UKT System

Aplikasi web manajemen perguruan seni bela diri modern yang mengintegrasikan transparansi evaluasi tingkatan (**Ujian Kenaikan Tingkat / UKT**), publikasi prestasi atlet, agenda kegiatan, serta kemandirian donasi digital padepokan.

---

## 🥋 Tingkatan Sabuk (Belt Hierarchy)

Perguruan menggunakan hierarki tingkatan sabuk berjenjang:
1. **Sabuk Hijau Strip Putih** 
2. **Sabuk Hijau Strip Kuning**
3. **Sabuk Hijau Strip Merah**
4. **Sabuk Hijau Strip Biru**
5. **Sabuk Hijau Strip Cokelat**
6. **Sabuk Hijau Strip Hitam** 

---

## 🛡️ Modul Utama Sesuai PRD

1. **Visi, Misi & Sejarah Perguruan**:
   - 4 Pilar Kesatria (Integritas, Keunggulan Teknik, Persaudaraan, Pengabdian).
   - Counter statistik real-time (Anggota aktif, medali, cabang padepokan).
   - Garis masa sejarah interaktif padepokan (1984 - 2026).
2. **Berita & Warta Resmi**:
   - Filter kategori (*Pengumuman*, *Prestasi*, *Perguruan*).
   - Pencarian berita (*Search bar* real-time).
   - Modal pembaca warta lengkap.
3. **Galeri Prestasi Atlet**:
   - Filter cakupan wilayah (*Internasional*, *Nasional*, *Daerah*).
   - Badge medali kejuaraan (*Emas*, *Perak*, *Perunggu*).
4. **Agenda Kegiatan**:
   - Publikasi jadwal latihan rutin, workshop, dan agenda UKT.
5. **Program Donasi & Gotong Royong**:
   - Visualisasi progress bar ketercapaian dana terhadap target.
   - Pilihan nominal donasi cepat & kustom.
   - Opsi pembayaran QRIS Dinamis & Virtual Account Bank.
   - Generator Bukti Resi Donasi Digital dapat dicetak (`window.print()`).
6. **Ujian Kenaikan Tingkat (UKT 4 Pos)**:
   - Stasiun penilaian:
     - **Pos 1: Pengujian Fisik (Bobot 25%)** — Stamina, Push-Up/Sit-Up, Agilitas.
     - **Pos 2: Pengujian Teknik Jurus (Bobot 30%)** — Presisi Jurus, Akurasi Serangan, Kuda-kuda.
     - **Pos 3: Pemahaman Materi & Etika (Bobot 20%)** — Teori, Sejarah, Etika Kesatria.
     - **Pos 4: Pertarungan Sabung / Sparring (Bobot 25%)** — Keberanian Tanding, Teknik, Kontrol Emosi.
   - Formula Kalkulasi Otomatis:
     $$\text{Skor Akhir} = (\text{Pos}_1 \times 0.25) + (\text{Pos}_2 \times 0.30) + (\text{Pos}_3 \times 0.20) + (\text{Pos}_4 \times 0.25)$$
   - Predikat Kelulusan:
     - $\ge 85.0$: **LULUS DENGAN PUJIAN**
     - $70.0 - 84.9$: **LULUS**
     - $< 70.0$: **PERLU HER / TUNDA**
   - **Fitur Impor & Ekspor Peserta (CSV)**.
   - **Kode Otorisasi Admin Penguji**: Anggota wajib memasukkan kode admin (`TRIDENT2026`) untuk membuka meja pengujian.

---

## 🚀 Menjalankan Aplikasi Secara Lokal

```bash
# Masuk ke direktori
cd trident-app

# Instalasi dependencies
npm install

# Jalankan server pengembangan
npm run dev
```

Buka peramban pada URL `http://127.0.0.1:5173/`.

---

## Backend Supabase

Data (profil, UKT, donasi) disimpan di Supabase. Region proyek: Tokyo (`ap-northeast-1`).

### 1. Setup `.env.local`

Buat `.env.local` di akar proyek (sudah di-git-ignore, jangan pernah di-commit). Variabel yang dipakai:

- `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` - dipakai aplikasi.
- `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_DB_URL`, `SUPABASE_DB_PASSWORD`, `SUPABASE_PROJECT_REF`, `SUPABASE_ACCESS_TOKEN` - hanya untuk skrip/CLI di komputer admin.
- `DEV_*` - akun uji untuk `npm run test:rls`.

Variabel `VITE_` ikut **ter-build** ke dalam aplikasi (web dan APK). Jangan taruh rahasia di variabel berawalan `VITE_`; ubah nilainya berarti harus build ulang.

### 2. Menghubungkan CLI dan migrasi database

`npx supabase` **tidak membaca `.env.local`**. Muat dulu variabelnya ke sesi terminal:

```powershell
# PowerShell
Get-Content .env.local | ForEach-Object { if ($_ -match '^\s*([^#=\s]+)\s*=\s*(.*)$') { Set-Item "env:$($Matches[1])" $Matches[2].Trim('"') } }
```

```bash
# Git Bash
set -a; . ./.env.local; set +a
```

Sekali per komputer, hubungkan CLI ke proyek: `npx supabase link --project-ref <ref>`. Lalu:

```bash
npx supabase db push --remote --yes
```

(`--remote` memang flag yang valid: target proyek yang ter-link.) `npm run backup` dan `npm run test:rls` sudah memuat `.env.local` sendiri.

### 3. Deploy Edge Function

```bash
npx supabase functions deploy manage-user --project-ref <ref>
```

Fungsi ini hanya menerima permintaan dari origin yang diizinkan: `capacitor://localhost`, `https://localhost` (APK), `http://localhost:5173` dan `http://127.0.0.1:5173` (dev). Bila aplikasi web dipasang di domain sendiri, tambahkan origin-nya (pisahkan dengan koma bila lebih dari satu), tanpa perlu deploy ulang:

```bash
npx supabase secrets set ALLOWED_ORIGINS=https://<domain> --project-ref <ref>
```

Tanpa itu halaman Akun akan gagal (galat CORS) di domain tersebut.

### 4. Membuat admin pertama

1. Dashboard Supabase -> Authentication -> Add user (isi email dan password).
2. Salin `id` user, lalu jalankan di SQL Editor:

```sql
insert into profiles (id, full_name, role) values ('<id>', '<nama>', 'admin');
```

Admin berikutnya dikelola lewat halaman Akun di aplikasi.

Catatan: menonaktifkan akun **tidak langsung** mengeluarkan pengguna; token login yang sedang dipakai tetap berlaku hingga 1 jam. Untuk mencabut hak seketika, ubah dulu perannya menjadi `anggota`, baru nonaktifkan.

### 5. Backup bulanan

```bash
npm run backup
```

Hasil: `backups/<YYYY-MM-DD>/` berisi `schema.sql`, `data.sql`, `auth.sql` (data `auth.users` beserta hash kata sandi), dan `donation-proofs/` (semua bukti donasi). Lakukan **sebulan sekali**, simpan salinannya di tempat aman. Folder `backups/` di-git-ignore. `supabase db dump` butuh Docker/Podman yang sedang berjalan.

### 6. Restore proyek yang berhenti (paused)

Proyek free dijeda otomatis bila tidak aktif. Buka Dashboard Supabase -> pilih proyek -> **Restore project**, tunggu hingga status aktif. Selama masih dalam masa pemulihan, data tetap ada.

Bila harus memulihkan ke proyek **baru** dari hasil backup, urutannya:

1. Jalankan migrasi: `npx supabase db push --remote --yes` (membuat tabel, kebijakan RLS, bucket).
2. Muat `auth.sql` (mengisi `auth.users`; `profiles.id` mereferensikannya). Hash kata sandi ikut terbawa, jadi pengguna tetap memakai kata sandi lama.
3. Muat `data.sql` (isi tabel `public`). Pada CLI saat ini `data.sql` juga memuat ulang baris `auth`, sehingga baris itu akan gagal karena duplikat; abaikan galat tersebut (jangan pakai `ON_ERROR_STOP`), atau muat lewat SQL Editor/`psql` per bagian `public`.
4. Unggah ulang berkas dari folder `donation-proofs/` ke bucket `donation-proofs` dengan path yang sama (Dashboard -> Storage).

### 7. Build ulang APK

```powershell
npm run android            # vite build + cap sync
cd android
$env:JAVA_HOME = "<folder JDK 21>"
.\gradlew.bat assembleDebug
```

APK ada di `android/app/build/outputs/apk/debug/`. Karena variabel `VITE_` ter-build, ulangi langkah ini setiap kali nilainya berubah.

### 8. Akun uji DEV

Ada akun uji `dev-anggota@trident.test`, `dev-penguji@trident.test`, `dev-admin@trident.test` (kata sandi di `DEV_*` pada `.env.local`). Hapus sebelum produksi: Dashboard -> Authentication -> Users -> hapus ketiganya (baris `profiles` ikut terhapus), atau lewat halaman Akun di aplikasi sebagai admin.
