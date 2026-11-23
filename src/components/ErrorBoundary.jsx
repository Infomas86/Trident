import React from 'react';

const isChunkError = (e) => /dynamically imported module|Importing a module script failed|Loading chunk|error loading dynamically/i.test(String(e?.message ?? e));

// Menangkap error satu tab agar menu tetap bisa dipakai. Gagal memuat bagian kode (biasanya karena situs baru saja
// diperbarui dan halaman lama masih terbuka) -> muat ulang otomatis satu kali.
export default class ErrorBoundary extends React.Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error) {
    console.error(error);
    try {
      if (isChunkError(error) && !sessionStorage.getItem('trident_chunk_reload')) {
        sessionStorage.setItem('trident_chunk_reload', '1');
        window.location.reload();
      }
    } catch { /* sessionStorage diblokir: tampilkan tombol saja */ }
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="py-16 text-center space-y-4">
        <p className="text-sm text-slate-700">Bagian ini gagal dimuat. Muat ulang halaman untuk mencoba lagi.</p>
        <button onClick={() => window.location.reload()} className="px-5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-600 text-white text-xs font-bold">
          Muat ulang
        </button>
      </div>
    );
  }
}
