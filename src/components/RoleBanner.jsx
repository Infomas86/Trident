import React from 'react';
import { useApp, ROLES } from '../context/AppContext';
import { ShieldAlert, UserCheck, Award, Info, Lock, CheckCircle, ArrowRight } from 'lucide-react';

export default function RoleBanner() {
  const { role, ROLES, handleRoleChange, currentUser } = useApp();

  return (
    <div className="bg-gradient-to-r from-slate-950 via-blue-950/40 to-slate-950 border-b border-blue-900/30 px-4 py-2.5 text-xs text-slate-300 no-print">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Left: Role status */}
        <div className="flex items-center gap-2.5">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          </span>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-slate-300">Mode Akses Aktif:</span>
            <span className={`px-2 py-0.5 rounded font-bold uppercase tracking-wider text-[11px] border ${
              role === ROLES.EXAMINER
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : role === ROLES.MEMBER
                ? 'bg-blue-600/20 text-blue-300 border-blue-500/40'
                : 'bg-slate-800 text-slate-300 border-slate-700'
            }`}>
              {role === ROLES.EXAMINER ? 'Penguji / Admin (Master Bambang)' : role === ROLES.MEMBER ? 'Anggota (Ahmad Fauzi)' : 'Tamu (Public)'}
            </span>
            <span className="hidden sm:inline text-slate-500">•</span>
            <span className="hidden sm:inline text-slate-400">
              {role === ROLES.PUBLIC && 'Fitur Agenda, Donasi, & UKT berstatus Terkunci (Read-Only Berita & Prestasi)'}
              {role === ROLES.MEMBER && 'Dapat RSVP Agenda, Berdonasi & Cetak Resi, Cek Hasil Ujian Kenaikan Tingkat Pribadi'}
              {role === ROLES.EXAMINER && 'Hak Penuh: Penilaian Pos 1-4, Impor/Ekspor Peserta, Publish Berita & Prestasi'}
            </span>
          </div>
        </div>

        {/* Right: Quick 1-click Role Selector Bar */}
        <div className="flex items-center gap-1.5 bg-slate-900/80 p-1 rounded-lg border border-slate-800">
          <span className="text-[10px] text-slate-400 px-1 font-medium hidden lg:inline">Ganti Peran:</span>
          
          <button
            onClick={() => handleRoleChange(ROLES.PUBLIC)}
            className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
              role === ROLES.PUBLIC
                ? 'bg-slate-700 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            Tamu
          </button>

          <button
            onClick={() => handleRoleChange(ROLES.MEMBER)}
            className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
              role === ROLES.MEMBER
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-900/50'
                : 'text-slate-400 hover:text-blue-300 hover:bg-slate-800'
            }`}
          >
            Anggota
          </button>

          <button
            onClick={() => handleRoleChange(ROLES.EXAMINER)}
            className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
              role === ROLES.EXAMINER
                ? 'bg-amber-600 text-white shadow-sm shadow-amber-900/50'
                : 'text-slate-400 hover:text-amber-300 hover:bg-slate-800'
            }`}
          >
            Penguji / Admin
          </button>
        </div>

      </div>
    </div>
  );
}
