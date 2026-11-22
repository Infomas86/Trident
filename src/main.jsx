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
