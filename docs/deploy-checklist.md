# Deploy Checklist: Trident / Pagar Nusa Kota Batam

Dipakai sebelum setiap deploy, besar maupun kecil. Checklist ini bukan template generik — disesuaikan dengan stack proyek ini (Cloudflare Pages + Supabase), yang punya **dua jalur deploy terpisah dan tidak saling otomatis**.

**Tanggal:** _isi_ | **Deployer:** _isi_

## Sebelum Deploy
- [ ] `npm run build` sukses tanpa error
- [ ] `npm test` — 23 tes unit lulus
- [ ] `npm run test:rls` — kalau ada perubahan RLS/skema (butuh `.env.local` lokal; tidak bisa dijalankan dari sesi cloud)
- [ ] Kalau ada migrasi SQL baru di `supabase/migrations/`: sudah dicoba di SQL Editor Supabase atau lewat Management API, dan **hasilnya diverifikasi** — bukan cuma "tidak error", tapi dicek datanya langsung
- [ ] Kalau ada Edge Function yang diubah (`login`, `manage-user`): **daftar `ORIGINS`/CORS sudah mencakup semua domain live**. Ini sumber bug nyata yang pernah terjadi — login gagal total karena CORS, diam-diam, tanpa error di server
- [ ] Kalau ada tab/fitur yang mau dimatikan sementara: cek saklar di `src/config.js` (`FEATURES`)

## Deploy
- [ ] **Frontend:** `git push` ke `feat/backend-supabase-mg0tpp` → Cloudflare Pages build otomatis (beberapa menit)
- [ ] **Backend (Supabase):** migrasi SQL dan Edge Function **harus dijalankan manual** — push ke GitHub **tidak** otomatis menyentuh database atau function Supabase. Jalur terpisah, gampang lupa
- [ ] Verifikasi build Cloudflare sukses dan commit hash yang live = commit terbaru
- [ ] Verifikasi Edge Function versi terbaru aktif (`version` naik setelah redeploy)

## Setelah Deploy — Smoke Test
- [ ] Buka situs di **tab incognito**, bukan tab biasa — ada cache 10 menit di `localStorage` yang bisa menyamarkan apakah deploy benar-benar sudah tampil
- [ ] Coba login dengan akun asli
- [ ] Coba satu alur kritis: lihat UKT, tambah/lihat data
- [ ] Kalau mengubah Edge Function: tes CORS dari luar dengan header `Origin` — `curl` polos tidak mendeteksi bug CORS sama sekali
- [ ] Cek Supabase → Authentication → Users kalau ada perubahan alur pendaftaran/login

## Pemicu Rollback
- Login gagal total di situs — cek dulu CORS, atau `mailer_autoconfirm`/rate limit yang berubah tanpa sengaja
- Error di konsol browser saat buka tab mana pun
- Data UKT/anggota tidak muncul padahal query manual ke Supabase berhasil (kemungkinan cache browser, bukan rollback)

## Cara Rollback
- **Frontend:** `git revert <commit>` lalu push — Cloudflare build ulang otomatis dari versi sebelumnya
- **Backend:** migrasi Supabase **tidak otomatis bisa di-undo** — perlu migrasi baru yang membalikkan perubahan, ditulis manual

## Catatan infrastruktur
- Tidak ada staging — `trisula.pages.dev` langsung production
- Tidak ada CI/CD selain build Cloudflare sendiri; tidak ada monitoring/alerting terpasang
- Domain live: `trisula.pages.dev` (resmi). `trident-academy.pages.dev` dan `pagarnusa-batam.pages.dev` masih ada sebagai cadangan — hapus manual di dashboard Cloudflare kalau sudah tidak diperlukan
- Edge Function `login` menerapkan kunci 5x-gagal/15-menit per akun; `manage-user` untuk operasi admin (Kelola Akun) — keduanya butuh origin situs terdaftar di `ORIGINS`
