const CACHE_KEYS = ['trident_cache_candidates', 'trident_cache_profile'];
const PREDIKAT_QUEUE_KEY = 'trident_offline_predikat_queue';
const ls = () => (typeof localStorage !== 'undefined' ? localStorage : null);

export const withoutUser = (list, userId) => list.filter((i) => i.userId !== userId);

export function loadCache(key, fallback = null) {
  try { const v = ls()?.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
}
export function saveCache(key, value) {
  try { ls()?.setItem(key, JSON.stringify(value)); } catch { /* quota/blocked: cache is best-effort */ }
}
export function clearCaches() {
  try { CACHE_KEYS.forEach((k) => ls()?.removeItem(k)); } catch { /* ignore */ }
}
// User id of the session auth-js keeps in storage (kept even when an offline refresh fails).
export const storedAuthUserId = (storageKey) => loadCache(storageKey)?.user?.id ?? null;

// Antrean offline untuk predikat rubrik: set_predikat sudah atomik per materi di database (penguji lain tidak tertimpa),
// jadi tidak perlu baseUpdatedAt/resolusi konflik - ketuk ulang materi yang sama saat offline
// cukup menimpa item lamanya (hasil akhir yang dikirim nanti), kunci (candidateId, materi, userId).
export const loadPredikatQueue = () => loadCache(PREDIKAT_QUEUE_KEY, []);
export const savePredikatQueue = (q) => saveCache(PREDIKAT_QUEUE_KEY, q);
const samePredikatItem = (a, b) => a.candidateId === b.candidateId && a.materi === b.materi && a.userId === b.userId;
export const enqueuePredikat = (queue, item) => [...queue.filter((q) => !samePredikatItem(q, item)), item];
export const removePredikatItem = (queue, item) => queue.filter((q) => !samePredikatItem(q, item));
