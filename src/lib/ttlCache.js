// Cache data publik di perangkat (localStorage) dengan masa berlaku: pengunjung yang kembali tidak mengulang request.
// Perubahan data lewat aplikasi memperbarui cache langsung (ttlSet), jadi hanya perangkat lain yang bisa tertinggal <= TTL.
const PREFIX = 'trident_pub_';
export const PUBLIC_TTL_MS = 10 * 60 * 1000;
const ls = () => (typeof localStorage !== 'undefined' ? localStorage : null);

export function ttlGet(key, ttl = PUBLIC_TTL_MS) {
  try {
    const raw = ls()?.getItem(PREFIX + key);
    if (!raw) return undefined;
    const { at, value } = JSON.parse(raw);
    return Date.now() - at < ttl ? value : undefined;
  } catch {
    return undefined;
  }
}

export function ttlSet(key, value) {
  try { ls()?.setItem(PREFIX + key, JSON.stringify({ at: Date.now(), value })); } catch { /* kuota/diblokir: cache hanya pelengkap */ }
}
