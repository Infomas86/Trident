// Cache memori sederhana untuk data tab yang dimuat lazy: pindah tab bolak-balik tidak mengambil ulang.
// Dikosongkan saat keluar akun; `memoLoad(key, fetcher, true)` memaksa ambil ulang (tombol muat ulang / setelah perubahan data).
const store = new Map();
const inflight = new Map();

export const memoGet = (key) => store.get(key);
export const memoClear = () => {
  store.clear();
  inflight.clear();
};

export function memoLoad(key, fetcher, force = false) {
  if (!force && store.has(key)) return Promise.resolve(store.get(key));
  if (inflight.has(key)) return inflight.get(key);
  const p = fetcher()
    .then((value) => {
      store.set(key, value);
      return value;
    })
    .finally(() => inflight.delete(key));
  inflight.set(key, p);
  return p;
}
