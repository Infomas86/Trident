// Saklar fitur: ubah `false` jadi `true` (atau sebaliknya) lalu build ulang untuk menyalakan/mematikan satu tab.
// Tab yang dimatikan hilang dari menu, tidak bisa dibuka, dan datanya tidak diambil dari Supabase.
export const FEATURES = {
  agenda: false,
  prestasi: false,
};

export const isTabEnabled = (tab) => FEATURES[tab] !== false;
