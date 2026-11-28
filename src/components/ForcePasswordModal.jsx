import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserError } from '../lib/api';

// Muncul (tidak bisa ditutup) setelah admin mereset sandi: pemilik akun wajib membuat sandi sendiri.
export default function ForcePasswordModal() {
  const { currentUser, changeOwnPassword, showToast } = useApp();
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [busy, setBusy] = useState(false);
  if (!currentUser?.mustChangePassword) return null;

  const submit = async (e) => {
    e.preventDefault();
    if (pw.length < 8) return showToast('Sandi minimal 8 karakter', 'error');
    if (pw !== pw2) return showToast('Konfirmasi sandi tidak sama', 'error');
    setBusy(true);
    try { await changeOwnPassword(pw); } catch (err) {
      console.error(err);
      showToast(err instanceof UserError ? err.message : 'Gagal mengganti sandi', 'error');
    } finally { setBusy(false); }
  };

  const cls = 'w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-900 text-sm focus:border-amber-500 outline-none';
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-white/90 backdrop-blur-md">
      <form onSubmit={submit} className="w-full max-w-sm bg-slate-50 border border-amber-500/40 rounded-2xl p-6 space-y-4 shadow-2xl">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900">Buat Sandi Baru</h2>
          <p className="text-xs text-slate-500 mt-1">Sandi Anda baru direset admin. Buat sandi sendiri untuk melanjutkan.</p>
        </div>
        <input className={cls} type="password" autoComplete="new-password" minLength={8} required placeholder="Sandi baru (min. 8 karakter)" value={pw} onChange={(e) => setPw(e.target.value)} />
        <input className={cls} type="password" autoComplete="new-password" minLength={8} required placeholder="Ulangi sandi baru" value={pw2} onChange={(e) => setPw2(e.target.value)} />
        <button type="submit" disabled={busy} className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-slate-950 font-black text-xs uppercase tracking-wider">
          {busy ? 'Menyimpan...' : 'Simpan Sandi'}
        </button>
      </form>
    </div>
  );
}
