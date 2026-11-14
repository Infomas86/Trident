const KEYS = ['trident_offline_queue', 'trident_cache_candidates', 'trident_cache_profile'];
const ls = () => (typeof localStorage !== 'undefined' ? localStorage : null);

export function enqueueScore(queue, item) {
  const old = queue.find((q) => q.candidateId === item.candidateId);
  const next = old ? { ...item, baseUpdatedAt: old.baseUpdatedAt } : item;
  return [...queue.filter((q) => q.candidateId !== item.candidateId), next];
}

export async function syncQueue(queue, save) {
  const conflicts = [];
  let synced = 0;
  for (let i = 0; i < queue.length; i++) {
    let r;
    try { r = await save(queue[i]); } catch { return { remaining: queue.slice(i), conflicts, synced }; }
    if (r === 'conflict') conflicts.push(queue[i]); else synced++;
  }
  return { remaining: [], conflicts, synced };
}

export function loadCache(key, fallback = null) {
  try { const v = ls()?.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
}
export function saveCache(key, value) {
  try { ls()?.setItem(key, JSON.stringify(value)); } catch { /* quota/blocked: cache is best-effort */ }
}
export const loadQueue = () => loadCache(KEYS[0], []);
export const saveQueue = (q) => saveCache(KEYS[0], q);
export function clearOfflineData() {
  try { KEYS.forEach((k) => ls()?.removeItem(k)); } catch { /* ignore */ }
}
