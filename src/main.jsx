import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Situs baru saja diperbarui dan halaman lama masih membuka nama file lama: muat ulang sekali agar ikut versi terbaru.
window.addEventListener('vite:preloadError', () => {
  try {
    if (sessionStorage.getItem('trident_chunk_reload')) return;
    sessionStorage.setItem('trident_chunk_reload', '1');
  } catch { /* diblokir: ErrorBoundary menampilkan tombol muat ulang */ }
  window.location.reload();
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// PWA installable: service worker minimal (public/sw.js), tanpa cache data, hanya memenuhi syarat
// "Tambahkan ke Layar Utama" di Chrome.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}
