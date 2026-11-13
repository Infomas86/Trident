import React, { useState } from 'react';
import { useApp, ROLES } from '../context/AppContext';
import {
  Sword,
  Shield,
  UserCheck,
  KeyRound,
  X,
  Lock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react';

export default function LoginPage() {
  const { isLoginModalOpen, setIsLoginModalOpen, handleLogin } = useApp();
  const [activeFormTab, setActiveFormTab] = useState('quick'); // 'quick' | 'manual'
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');

  if (!isLoginModalOpen) return null;

  const handleManualSubmit = (e) => {
    e.preventDefault();
    const cleanUser = usernameInput.trim().toLowerCase();
    if (cleanUser.includes('admin') || cleanUser.includes('pusat')) {
      handleLogin(ROLES.ADMIN);
    } else if (cleanUser.includes('bambang') || cleanUser.includes('penguji')) {
      handleLogin(ROLES.EXAMINER);
    } else {
      handleLogin(ROLES.MEMBER);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-2xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden space-y-6">
        
        {/* Decorative background glows */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={() => setIsLoginModalOpen(false)}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center max-w-lg mx-auto space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-bold tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Autentikasi Akun Resmi Perguruan</span>
          </div>

          <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-['Cinzel']">
            Portal Masuk <span className="text-amber-400">TRIDENT</span>
          </h3>

          <p className="text-xs sm:text-sm text-slate-400">
            Masuk dengan akun terverifikasi untuk membuka akses penuh Ujian Kenaikan Tingkat, Agenda, Donasi, atau Panel Pengelolaan Admin.
          </p>
        </div>

        {/* Tabs: Quick 1-Click vs Manual Form */}
        <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800 max-w-xs mx-auto">
          <button
            onClick={() => setActiveFormTab('quick')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeFormTab === 'quick'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            1-Klik Akses Cepat
          </button>
          <button
            onClick={() => setActiveFormTab('manual')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeFormTab === 'manual'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Input KTA / Password
          </button>
        </div>

        {/* 1-CLICK ROLE CARDS */}
        {activeFormTab === 'quick' && (
          <div className="space-y-3 relative z-10">
            
            {/* 1. Anggota */}
            <div
              onClick={() => handleLogin(ROLES.MEMBER)}
              className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-blue-600/60 hover:bg-slate-900/90 transition-all cursor-pointer group flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold text-lg group-hover:scale-105 transition-transform shrink-0">
                  <UserCheck className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors">
                      Masuk sebagai Anggota (Ahmad Fauzi)
                    </h4>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                      Pesilat Aktif
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Sabuk Hijau Strip Putih • Lihat data pribadi pendaftaran UKT, garis struktural, dan agenda.
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-1 transition-all shrink-0" />
            </div>

            {/* 2. Penguji UKT */}
            <div
              onClick={() => handleLogin(ROLES.EXAMINER)}
              className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-amber-500/60 hover:bg-slate-900/90 transition-all cursor-pointer group flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-lg group-hover:scale-105 transition-transform shrink-0">
                  <Sword className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                      Masuk sebagai Dewan Penguji (Master Bambang)
                    </h4>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                      Penguji Utama
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Sabuk Hijau Strip Hitam • Hak penuh pengujian Pos 1-4, evaluasi nilai, ekspor/impor peserta CSV.
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all shrink-0" />
            </div>

            {/* 3. Administrator Utama */}
            <div
              onClick={() => handleLogin(ROLES.ADMIN)}
              className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 to-slate-950 border border-amber-500/40 hover:border-amber-400 hover:bg-slate-900/90 transition-all cursor-pointer group flex items-center justify-between gap-4 shadow-lg shadow-amber-950/30"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-lg group-hover:scale-105 transition-transform shrink-0">
                  <ShieldCheck className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                      Masuk sebagai Administrator Pusat (Dewan Sekretariat)
                    </h4>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-amber-500 text-slate-950 font-mono">
                      Hak Akses CMS
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Pengurus Pusat • Berwenang mengedit isi aplikasi (Pilar Visi Misi, Tempat Latihan, Slogan, Timeline).
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-all shrink-0" />
            </div>

          </div>
        )}

        {/* MANUAL LOGIN FORM */}
        {activeFormTab === 'manual' && (
          <form onSubmit={handleManualSubmit} className="space-y-4 max-w-md mx-auto relative z-10">
            <div>
              <label className="text-xs text-slate-300 font-medium block mb-1">
                Nomor E-KTA / No. Registrasi / Username
              </label>
              <input
                type="text"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="Contoh: TRD-UKT-2026-084 atau admin"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-amber-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="text-xs text-slate-300 font-medium block mb-1">
                Kata Sandi / PIN Kesatria
              </label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-amber-500 outline-none"
                required
              />
            </div>

            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400">
              💡 <em>Tips:</em> Ketik <strong>admin</strong> untuk masuk sebagai Administrator Pusat, atau ketik <strong>penguji</strong> untuk Dewan Penguji.
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-950/50 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
            >
              <Lock className="w-4 h-4" />
              <span>Verifikasi & Masuk Aplikasi</span>
            </button>
          </form>
        )}

        {/* Footer info */}
        <div className="text-center text-[11px] text-slate-500 pt-2 border-t border-slate-800/80">
          Sistem Keamanan Terenkripsi • Padepokan Seni Bela Diri Kesatria Trident © 2026
        </div>

      </div>
    </div>
  );
}
