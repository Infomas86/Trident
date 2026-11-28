import React from 'react';
import { useApp } from '../context/AppContext';
import { Lock, X, KeyRound } from 'lucide-react';

export default function LockedFeatureModal() {
  const { lockedModal, setLockedModal, setIsLoginModalOpen } = useApp();

  if (!lockedModal.open) return null;

  const close = () => setLockedModal({ open: false, featureName: '' });

  const handleOpenLogin = () => {
    close();
    setIsLoginModalOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/80 backdrop-blur-md animate-fadeIn no-print">
      <div className="relative w-full max-w-md bg-slate-50 border border-amber-500/30 rounded-2xl p-6 shadow-2xl shadow-teal-950/80 text-center">
        <button
          onClick={close}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-4">
          <Lock className="w-8 h-8 text-amber-500 animate-pulse" />
        </div>

        <h3 className="text-xl font-bold text-slate-900 font-['Cinzel'] tracking-wide">Akses Fitur Terkunci</h3>

        <p className="text-sm text-slate-700 mt-2">
          Fitur <span className="font-semibold text-amber-500">"{lockedModal.featureName}"</span> hanya untuk anggota Organisasi yang sudah masuk.
        </p>

        <button
          onClick={handleOpenLogin}
          className="mt-6 w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-extrabold transition-all flex items-center justify-center gap-2"
        >
          <KeyRound className="w-3.5 h-3.5" />
          <span>Masuk</span>
        </button>
      </div>
    </div>
  );
}
