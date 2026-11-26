# Spesifikasi: PWA (Installable)

## Masalah
Situs tidak punya `manifest.json` sama sekali — dicek langsung, tidak ada file itu di `public/`. Tidak bisa di-"Add to Home Screen" dengan ikon dan nama sendiri; yang ada hanya bookmark biasa ke `index.html`. Ini alternatif APK yang jauh lebih murah: tidak perlu Android SDK, tidak perlu build native, langsung jalan dari situs yang sudah live.

## Tujuan
- Situs bisa dipasang ke layar utama HP (Android & iOS) dengan ikon dan nama sendiri.
- Saat dibuka dari ikon, tampil seperti aplikasi (tanpa address bar browser).
- Aset yang sudah pernah dimuat tetap bisa dibuka saat offline (halaman kerangka, bukan data — data tetap butuh koneksi, sesuai sifat aplikasi ini yang real-time ke Supabase).

## Non-tujuan
- **Bukan APK** — tidak menggantikan APK yang sudah ada di `android/`, keduanya bisa jalan berdampingan.
- Bukan push notification (butuh server push terpisah, di luar lingkup ini).
- Bukan offline-first penuh — data UKT/donasi/dll tetap butuh koneksi ke Supabase seperti sekarang; offline support UKT examiner yang sudah ada (`src/lib/offline.js`) tidak berubah.

## Kendala yang Ditemukan
Aset logo yang ada (`src/assets/logo-pagarnusa.png`, 244×243px, RGB tanpa alpha, bukan persegi aman-crop) **tidak cukup** untuk ikon PWA standar. Ikon PWA butuh:
- 192×192 dan 512×512, format PNG dengan latar belakang solid (bukan transparan, supaya aman di-crop jadi bentuk apa pun oleh OS — ikon "maskable").
- Perlu digambar ulang/di-render ulang dari aset sumber, bukan sekadar resize paksa gambar 244×243 yang ada (akan pecah/blur).

**Keputusan yang perlu diambil sebelum implementasi:** siapa yang menyiapkan ikon 512×512 — didesain ulang, atau upscale dari logo yang ada dengan risiko kualitas menurun?

## Perubahan

### 1. `public/manifest.json` (baru)
```json
{
  "name": "Pagar Nusa Kota Batam",
  "short_name": "Pagar Nusa",
  "description": "Platform manajemen perguruan dan Ujian Kenaikan Tingkat Pagar Nusa Cabang Batam",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#0f766e",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icon-512-maskable.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```
- `theme_color` disamakan dengan warna teal yang sudah dipakai di tema situs (`bg-teal-700` dkk).

### 2. `index.html`
Tambah di `<head>`:
```html
<link rel="manifest" href="/manifest.json" />
<meta name="theme-color" content="#0f766e" />
<link rel="apple-touch-icon" href="/icon-192.png" />
```

### 3. Service worker minimal (opsional tapi disarankan)
Pakai `vite-plugin-pwa` (populer, banyak dipakai, bukan dependensi eksotis) alih-alih menulis service worker manual — cache aset statis (JS/CSS/gambar) lewat strategi `StaleWhileRevalidate`, **tidak** meng-cache panggilan API Supabase (harus selalu fresh). Kalau tidak mau menambah dependensi, PWA tetap "installable" tanpa service worker (sebagian browser Android masih mengizinkan install tanpa SW, tapi Chrome mensyaratkan SW untuk prompt install otomatis) — perlu diputuskan seberapa penting prompt instalasi otomatis vs instal manual lewat menu browser.

## Perubahan yang TIDAK disentuh
- `src/lib/ttlCache.js` (cache data publik 10 menit) — tetap seperti sekarang, terpisah dari cache service worker.
- Build Vite (`npm run build`) — plugin PWA cuma menambah output, tidak mengubah alur build yang ada.

## Kriteria Selesai
- [ ] Chrome Android menampilkan prompt "Tambahkan ke Layar Utama" atau opsi itu muncul di menu browser.
- [ ] Ikon yang muncul di layar utama jelas, tidak blur/terpotong aneh.
- [ ] Safari iOS: `apple-touch-icon` tampil benar saat "Add to Home Screen" (iOS tidak pakai manifest.json, pakai meta tag Apple sendiri).
- [ ] Dibuka dari ikon home screen, tidak ada address bar browser (mode `standalone`).
- [ ] `npm run build` tetap sukses, 18 tes tetap lulus.

## Keputusan (26 Nov 2026)
- Ikon dirender dari `src/assets/logo.webp` (artwork trisula asli, transparan) ke atas latar putih, bukan upscale paksa `logo-pagarnusa.png` yang resolusinya kecil.
- Service worker minimal ditambahkan (`public/sw.js`, tanpa cache data) supaya Chrome bisa menampilkan prompt instalasi otomatis, tanpa menambah dependensi (`vite-plugin-pwa` tidak dipakai).
- Nama aplikasi: "Pagar Nusa Kota Batam" (name) / "Pagar Nusa" (short_name).

## Status: Selesai diimplementasikan
- `public/manifest.json`, `public/icon-192.png`, `public/icon-512.png`, `public/icon-512-maskable.png`, `public/sw.js` ditambahkan.
- `index.html`: `<link rel="manifest">`, `<meta name="theme-color">`, `<link rel="apple-touch-icon">`.
- `src/main.jsx`: registrasi service worker.
- Build dan 18 tes unit tetap lulus.

## Estimasi Kasar
Kecil: 1 file manifest, beberapa baris di `index.html`, ikon baru. Lebih besar kalau menambah service worker lewat `vite-plugin-pwa`.
