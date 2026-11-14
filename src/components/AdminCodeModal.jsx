import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { KeyRound, ShieldAlert, X, CheckCircle, ArrowRight, Lock } from 'lucide-react';

export default function AdminCodeModal() {
  const { isAdminCodeModalOpen, setIsAdminCodeModalOpen, verifyAndUnlockExaminer, showToast } = useApp();
  const [inputCode, setInputCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isAdminCodeModalOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    const success = verifyAndUnlockExaminer(inputCode);
    if (!success) {
      setErrorMsg('Kode otorisasi salah. Masukkan kode yang valid dari admin (misal: TRIDENT2026).');
    } else {
      setInputCode('');
      setErrorMsg('');
    }
  };

  const handleUsePreset = (code) => {
    setInputCode(code);
    setErrorMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn no-print">
      <div className="relative w-full max-w-md bg-slate-900 border border-amber-500/40 rounded-2xl p-6 sm:p-7 shadow-2xl text-center">
        
        {/* Close Button */}
        <button
          onClick={() => {
            setIsAdminCodeModalOpen(false);
            setErrorMsg('');
            setInputCode('');
          }}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Lock / Key Icon */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/40 flex items-center justify-center mb-4 shadow-lg shadow-amber-950/50">
          <KeyRound className="w-8 h-8 text-amber-400 animate-pulse" />
        </div>

        <h3 className="text-xl font-bold text-white font-['Cinzel'] tracking-wide">
          Verifikasi Kode Otorisasi Admin
        </h3>

        <p className="text-xs text-slate-300 mt-2 leading-relaxed">
          Anda saat ini terdaftar sebagai <span className="font-semibold text-blue-400">Anggota</span>. Untuk membuka meja penilaian dan melakukan tes Ujian Kenaikan Tingkat sebagai <span className="font-semibold text-amber-400">Penguji</span>, masukkan kode otorisasi dari admin perguruan.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="text-left">
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Kode Otorisasi Penguji / Admin:
            </label>
            <div className="relative">
              <input
                type="text"
                autoFocus
                placeholder="Masukkan kode admin..."
                value={inputCode}
                onChange={(e) => {
                  setInputCode(e.target.value.toUpperCase());
                  setErrorMsg('');
                }}
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono font-bold tracking-wider text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none uppercase text-center placeholder:normal-case placeholder:font-normal placeholder:text-xs"
              />
            </div>
            
            {errorMsg && (
              <p className="text-[11px] text-rose-400 font-medium mt-1.5 flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                <span>{errorMsg}</span>
              </p>
            )}
          </div>

          {/* Quick preset hint */}
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-left text-xs space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Kode Resmi Dewan Admin:</span>
              <button
                type="button"
                onClick={() => handleUsePreset('TRIDENT2026')}
                className="text-amber-400 hover:text-amber-300 font-mono font-bold underline"
              >
                Gunakan: TRIDENT2026
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                setIsAdminCodeModalOpen(false);
                setErrorMsg('');
                setInputCode('');
              }}
              className="flex-1 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-semibold transition-colors"
            >
              Batal
            </button>

            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-950/50 transition-all flex items-center justify-center gap-1.5"
            >
              <span>Verifikasi & Masuk</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>

        <div className="mt-4 pt-3 border-t border-slate-800/80 text-[10px] text-slate-500">
          Protokol Keamanan RBAC Padepokan Trident • Otentikasi Dewan Penguji
        </div>

      </div>
    </div>
  );
}
