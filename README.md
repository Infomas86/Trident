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

## 💻 Teknologi yang Digunakan

- **React 19**
- **Vite**
- **Tailwind CSS v4**
- **Lucide Icons**

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
