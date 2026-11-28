// Saklar fitur: ubah `false` jadi `true` (atau sebaliknya) lalu build ulang untuk menyalakan/mematikan satu tab.
// Tab yang dimatikan hilang dari menu, tidak bisa dibuka, dan datanya tidak diambil dari Supabase.
export const FEATURES = {
  agenda: false,
  prestasi: false,
};

export const isTabEnabled = (tab) => FEATURES[tab] !== false;

// Kunci situs (publik, aman ditaruh di kode) widget Cloudflare Turnstile untuk login/daftar.
// Verifikasinya dipaksa di sisi Supabase Auth, jadi tanpa token valid login langsung ke API pun ditolak.
export const TURNSTILE_SITE_KEY = '0x4AAAAAAGW2EkP1G4CsVhAu';
