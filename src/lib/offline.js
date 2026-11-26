const KEYS = ['trident_offline_queue', 'trident_cache_candidates', 'trident_cache_profile', 'trident_offline_conflicts'];
const PREDIKAT_QUEUE_KEY = 'trident_offline_predikat_queue';
const ls = () => (typeof localStorage !== 'undefined' ? localStorage : null);

// posKeys: posts this examiner changed (quick-pos), null = full evaluation (all posts).
export const mergeKeys = (a, b) => (a == null || b == null ? null : [...new Set([...a, ...b])]);

export function enqueueScore(queue, item) {
  const old = queue.find((q) => q.candidateId === item.candidateId);
  const next = old ? { ...item, baseUpdatedAt: old.baseUpdatedAt, posKeys: mergeKeys(old.posKeys, item.posKeys) } : item;
  return [...queue.filter((q) => q.candidateId !== item.candidateId), next];
}

// Show my queued (unsent) scores instead of the server/cached ones, so the next edit starts from them.
export const overlayQueued = (candidates, queueMine) =>
  candidates.map((c) => {
    const q = queueMine.find((i) => i.candidateId === c.id);
    return q ? { ...c, posScores: q.posScores, examinerNotes: q.notes } : c;
  });

// "Pakai nilai saya": quick-pos items replace only their posts in the fresh row; full evaluations replace all.
export const mineScores = (fresh, item) =>
  item.posKeys == null ? item.posScores : { ...fresh.posScores, ...Object.fromEntries(item.posKeys.map((k) => [k, item.posScores[k]])) };

// Queue holds several users' items: touch only userId's, apply enqueueScore to them, never duplicate.
export function enqueueForUser(queue, userId, item) {
  const others = queue.filter((q) => q.userId !== userId);
  const mine = queue.filter((q) => q.userId === userId);
  return [...others, ...enqueueScore(mine, item)];
}

export const withoutUser = (list, userId) => list.filter((i) => i.userId !== userId);

// save(item) -> 'ok' | 'conflict'. A throw means:
//  - online() false (default): network error, stop; this item and the rest stay in `remaining`.
//  - online() true: this item is bad (e.g. rejected by the server); keep it in `remaining`
//    marked `failed: <message>` and keep sending the rest.
export async function syncQueue(queue, save, { online = () => false } = {}) {
  const conflicts = [];
  const remaining = [];
  let synced = 0;
  for (let i = 0; i < queue.length; i++) {
    let r;
    try { r = await save(queue[i]); } catch (e) {
      if (!online()) return { remaining: [...remaining, ...queue.slice(i)], conflicts, synced };
      remaining.push({ ...queue[i], failed: e?.message || 'Gagal dikirim' });
      continue;
    }
    if (r === 'conflict') conflicts.push(queue[i]); else synced++;
  }
  return { remaining, conflicts, synced };
}

export function loadCache(key, fallback = null) {
  try { const v = ls()?.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
}
export function saveCache(key, value) {
  try { ls()?.setItem(key, JSON.stringify(value)); } catch { /* quota/blocked: cache is best-effort */ }
}
export const loadConflicts = () => loadCache(KEYS[3], []);
export const saveConflicts = (c) => saveCache(KEYS[3], c);
export const loadQueue = () => loadCache(KEYS[0], []);
export const saveQueue = (q) => saveCache(KEYS[0], q);
export function clearCaches() {
  try { [KEYS[1], KEYS[2]].forEach((k) => ls()?.removeItem(k)); } catch { /* ignore */ }
}
// User id of the session auth-js keeps in storage (kept even when an offline refresh fails).
export const storedAuthUserId = (storageKey) => loadCache(storageKey)?.user?.id ?? null;

// Antrean offline untuk predikat rubrik. Lebih sederhana dari antrean skor lama (enqueueScore
// dkk di atas): set_predikat sudah atomik per materi di database (penguji lain tidak tertimpa),
// jadi tidak perlu baseUpdatedAt/resolusi konflik - ketuk ulang materi yang sama saat offline
// cukup menimpa item lamanya (hasil akhir yang dikirim nanti), kunci (candidateId, materi, userId).
export const loadPredikatQueue = () => loadCache(PREDIKAT_QUEUE_KEY, []);
export const savePredikatQueue = (q) => saveCache(PREDIKAT_QUEUE_KEY, q);
const samePredikatItem = (a, b) => a.candidateId === b.candidateId && a.materi === b.materi && a.userId === b.userId;
export const enqueuePredikat = (queue, item) => [...queue.filter((q) => !samePredikatItem(q, item)), item];
export const removePredikatItem = (queue, item) => queue.filter((q) => !samePredikatItem(q, item));
