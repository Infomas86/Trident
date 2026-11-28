import React, { useEffect, useRef } from 'react';
import { TURNSTILE_SITE_KEY } from '../config';

const SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
let loading;
const loadScript = () =>
  (loading ??= new Promise((resolve, reject) => {
    if (window.turnstile) return resolve(window.turnstile);
    const s = document.createElement('script');
    s.src = SRC;
    s.async = true;
    s.onload = () => resolve(window.turnstile);
    s.onerror = () => { loading = undefined; reject(new Error('turnstile')); };
    document.head.appendChild(s);
  }));

// Widget verifikasi manusia. `onToken(token|null)` dipanggil saat lulus / kedaluwarsa / gagal.
// Token sekali pakai: ganti prop `resetKey` untuk memuat widget baru setelah tiap percobaan.
export default function Turnstile({ onToken, resetKey = 0 }) {
  const box = useRef(null);
  const cb = useRef(onToken);
  cb.current = onToken;

  useEffect(() => {
    let id;
    let dead = false;
    loadScript()
      .then((ts) => {
        if (dead || !box.current) return;
        id = ts.render(box.current, {
          sitekey: TURNSTILE_SITE_KEY,
          callback: (t) => cb.current(t),
          'expired-callback': () => cb.current(null),
          'error-callback': () => cb.current(null),
        });
      })
      .catch(() => cb.current(null));
    return () => {
      dead = true;
      try { if (id !== undefined) window.turnstile?.remove(id); } catch { /* ignore */ }
    };
  }, [resetKey]);

  return <div ref={box} className="flex justify-center min-h-[65px]" />;
}
