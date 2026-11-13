import React from 'react';
import { useApp, ROLES } from '../context/AppContext';
import { Lock, ShieldAlert, ArrowRight, UserCheck, Sword, X } from 'lucide-react';

export default function LockedFeatureModal() {
  const { lockedModal, setLockedModal, handleRoleChange, setActiveTab } = useApp();

  if (!lockedModal.open) return null;

  const handleSelectRole = (newRole, targetTab) => {
    handleRoleChange(newRole);
    setLockedModal({ open: false, featureName: '' });
    if (targetTab) {
      setActiveTab(targetTab);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn no-print">
      <div className="relative w-full max-w-md bg-slate-900 border border-amber-500/30 rounded-2xl p-6 shadow-2xl shadow-blue-950/80 text-center">
        
        {/* Close Button */}
        <button
          onClick={() => setLockedModal({ open: false, featureName: '' })}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Lock Shield Icon */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-4">
          <Lock className="w-8 h-8 text-amber-400 animate-pulse" />
        </div>

        <h3 className="text-xl font-bold text-white font-['Cinzel'] tracking-wide">
          Akses Fitur Terkunci
        </h3>
        
        <p className="text-sm text-slate-300 mt-2">
          Fitur <span className="font-semibold text-amber-400">"{lockedModal.featureName}"</span> dilindungi oleh aturan <span className="text-blue-400 font-medium">Role-Based Access Control (RBAC)</span> Perguruan Trident.
        </p>

        <p className="text-xs text-slate-400 mt-2">
          Pengunjung berstatus <strong>Tamu (Public)</strong> tidak memiliki otorisasi untuk melihat atau mengubah data internal operasional padepokan.
        </p>

        {/* Action Options */}
        <div className="mt-6 space-y-3">
          <button
            onClick={() => handleSelectRole(ROLES.MEMBER, lockedModal.featureName.toLowerCase().includes('agenda') ? 'agenda' : lockedModal.featureName.toLowerCase().includes('donasi') ? 'donasi' : 'ukt')}
            className="w-full flex items-center justify-between p-3.5 rounded-xl bg-blue-900/40 hover:bg-blue-800/60 border border-blue-500/40 text-left transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-600/30 flex items-center justify-center text-blue-400">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                  Masuk sebagai Anggota
                </p>
                <p className="text-[11px] text-slate-400">
                  Ahmad Fauzi (Sabuk Hijau) • Akses Agenda & Donasi
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-blue-400 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={() => handleSelectRole(ROLES.EXAMINER, lockedModal.featureName.toLowerCase().includes('agenda') ? 'agenda' : lockedModal.featureName.toLowerCase().includes('donasi') ? 'donasi' : 'ukt')}
            className="w-full flex items-center justify-between p-3.5 rounded-xl bg-amber-950/40 hover:bg-amber-900/50 border border-amber-600/40 text-left transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400">
                <Sword className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                  Masuk sebagai Penguji / Admin
                </p>
                <p className="text-[11px] text-slate-400">
                  Master Bambang Wijaya • Ujian Kenaikan Tingkat (Pos 1 - 4)
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="mt-5 pt-4 border-t border-slate-800 text-[11px] text-slate-500">
          Sesuai spesifikasi PRD Bab 2: Hak Akses Pengguna
        </div>
      </div>
    </div>
  );
}
