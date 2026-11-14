const KEYS = ['trident_offline_queue', 'trident_cache_candidates', 'trident_cache_profile', 'trident_offline_conflicts'];
const ls = () => (typeof localStorage !== 'undefined' ? localStorage : null);

export function enqueueScore(queue, item) {
  const old = queue.find((q) => q.candidateId === item.candidateId);
  const next = old ? { ...item, baseUpdatedAt: old.baseUpdatedAt } : item;
  return [...queue.filter((q) => q.candidateId !== item.candidateId), next];
}

// save(item) -> 'ok' | 'conflict'. A throw means:
//  - online() false (default): network error, stop; this item and the rest stay in `remaining`.
//  - online() true: this item is bad (e.g. rejected by the server); keep it in `remaining`
//    marked `failed: <message>` and keep sending the rest.
// Queue holds several users' items: touch only userId's, apply enqueueScore to them, never duplicate.
export function enqueueForUser(queue, userId, item) {
  const others = queue.filter((q) => q.userId !== userId);
  const mine = queue.filter((q) => q.userId === userId);
  return [...others, ...enqueueScore(mine, item)];
}

export const withoutUser = (list, userId) => list.filter((i) => i.userId !== userId);

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
export function clearOfflineData() {
  try { KEYS.forEach((k) => ls()?.removeItem(k)); } catch { /* ignore */ }
}
