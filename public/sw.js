// Service worker minimal: hanya untuk memenuhi syarat "installable" Chrome, tidak meng-cache
// apa pun. Data dari Supabase harus selalu diambil baru (lihat ttlCache.js untuk cache data publik
// yang memang disengaja, di level aplikasi, bukan di sini).
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', () => {}); // passthrough; kehadirannya saja yang dibutuhkan Chrome
