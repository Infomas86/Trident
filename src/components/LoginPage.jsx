import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Lock, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const { isLoginModalOpen, setIsLoginModalOpen, signIn } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isLoginModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // A bare username (no "@") is a test-domain account, e.g. "admin" → admin@trident.test.
      const id = email.trim();
      if (await signIn(id.includes('@') ? id : `${id}@trident.test`, password)) setPassword('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden space-y-6">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <button
          onClick={() => setIsLoginModalOpen(false)}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-bold tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Autentikasi Akun Resmi Perguruan</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-['Cinzel']">
            Portal Masuk <span className="text-amber-400">TRIDENT</span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-400">
            Masuk dengan akun yang diberikan pengurus untuk membuka Agenda, Donasi, dan Ujian Kenaikan Tingkat.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          <div>
            <label className="text-xs text-slate-300 font-medium block mb-1">Email / Nama Pengguna</label>
            <input
              type="text"
              autoCapitalize="none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com atau admin"
              autoComplete="username"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-amber-500 outline-none"
              required
            />
          </div>
          <div>
            <label className="text-xs text-slate-300 font-medium block mb-1">Kata Sandi</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-amber-500 outline-none"
              required
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-60 disabled:cursor-not-allowed text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-950/50 flex items-center justify-center gap-2 transition-all"
          >
            <Lock className="w-4 h-4" />
            <span>{submitting ? 'Memproses...' : 'Masuk'}</span>
          </button>
        </form>

        <div className="text-center text-[11px] text-slate-500 pt-2 border-t border-slate-800/80 relative z-10">
          Padepokan Seni Bela Diri Kesatria Trident © 2026
        </div>
      </div>
    </div>
  );
}
