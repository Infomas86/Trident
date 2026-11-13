import React, { useState } from 'react';
import { useApp, ROLES } from '../context/AppContext';
import {
  Shield,
  Zap,
  Users,
  Award,
  Calendar,
  Sparkles,
  Edit3,
  CheckCircle,
  Building2,
  Trophy,
  GraduationCap,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

export default function VisiMisiSection() {
  const { stats, handleUpdateStats, timeline, pillars, role, ROLES, navigateToTab } = useApp();
  const [isEditingStats, setIsEditingStats] = useState(false);
  const [statsForm, setStatsForm] = useState({ ...stats });

  const handleStatsSubmit = (e) => {
    e.preventDefault();
    handleUpdateStats({
      activeMembers: Number(statsForm.activeMembers),
      medalsCount: Number(statsForm.medalsCount),
      padepokanBranches: Number(statsForm.padepokanBranches),
      uktPassRate: Number(statsForm.uktPassRate),
      masterCouncil: Number(statsForm.masterCouncil),
    });
    setIsEditingStats(false);
  };

  const getPillarIcon = (name) => {
    switch (name) {
      case 'Shield': return Shield;
      case 'Zap': return Zap;
      case 'Users': return Users;
      default: return Award;
    }
  };

  return (
    <div className="space-y-16 py-6">
      
      {/* Hero Grandeur Header */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-blue-950/60 via-slate-900 to-slate-950 border border-blue-900/40 p-8 sm:p-12 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Padepokan Agung Seni Bela Diri Kesatria</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight font-['Cinzel'] leading-tight">
            TRIDENT <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500">ACADEMY</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Membina raga, menata rasa, dan menggembleng jiwa kesatria sejati melalui kurikulum bela diri terpadu serta standarisasi evaluasi kenaikan tingkat 4 Pos yang presisi.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={() => navigateToTab('ukt')}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm tracking-wide shadow-lg shadow-amber-950/50 flex items-center gap-2 transition-all hover:scale-105"
            >
              <GraduationCap className="w-4 h-4" />
              <span>Ujian Kenaikan Tingkat</span>
            </button>

            <button
              onClick={() => navigateToTab('berita')}
              className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-sm flex items-center gap-2 transition-all"
            >
              <span>Warta Perguruan Terkini</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>
      </section>

      {/* Real-time Statistics Counter */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white font-['Cinzel'] flex items-center gap-2.5">
              <TrendingUp className="w-5 h-5 text-amber-400" />
              Statistik Real-Time Perguruan
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Data akumulasi anggota, prestasi, dan jangkauan padepokan Trident di seluruh Indonesia
            </p>
          </div>

          {role === ROLES.EXAMINER && (
            <button
              onClick={() => {
                setStatsForm({ ...stats });
                setIsEditingStats(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-900/40 hover:bg-blue-800/60 border border-blue-500/40 text-blue-300 text-xs font-semibold transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Statistik (Penguji)</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          
          <div className="trident-card rounded-2xl p-5 border border-blue-900/40 shadow-lg relative overflow-hidden group">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <div className="text-3xl font-extrabold text-white font-['Cinzel'] tracking-tight">
              {stats.activeMembers.toLocaleString('id-ID')}+
            </div>
            <div className="text-xs font-medium text-slate-400 mt-1">
              Anggota & Pesilat Aktif
            </div>
          </div>

          <div className="trident-card rounded-2xl p-5 border border-amber-900/40 shadow-lg relative overflow-hidden group">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Trophy className="w-5 h-5" />
            </div>
            <div className="text-3xl font-extrabold text-amber-300 font-['Cinzel'] tracking-tight">
              {stats.medalsCount.toLocaleString('id-ID')}
            </div>
            <div className="text-xs font-medium text-slate-400 mt-1">
              Medali Kejuaraan Resmi
            </div>
          </div>

          <div className="trident-card rounded-2xl p-5 border border-blue-900/40 shadow-lg relative overflow-hidden group">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Building2 className="w-5 h-5" />
            </div>
            <div className="text-3xl font-extrabold text-white font-['Cinzel'] tracking-tight">
              {stats.padepokanBranches} Cabang
            </div>
            <div className="text-xs font-medium text-slate-400 mt-1">
              Dojo & Padepokan Daerah
            </div>
          </div>

          <div className="trident-card rounded-2xl p-5 border border-emerald-900/40 shadow-lg relative overflow-hidden group">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div className="text-3xl font-extrabold text-emerald-300 font-['Cinzel'] tracking-tight">
              {stats.uktPassRate}%
            </div>
            <div className="text-xs font-medium text-slate-400 mt-1">
              Tingkat Kelulusan UKT 4 Pos
            </div>
          </div>

        </div>
      </section>

      {/* Edit Stats Modal (Examiner only) */}
      {isEditingStats && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white font-['Cinzel'] mb-4 flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-amber-400" />
              Pembaruan Counter Statistik Perguruan
            </h3>
            
            <form onSubmit={handleStatsSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">
                  Jumlah Anggota Aktif
                </label>
                <input
                  type="number"
                  value={statsForm.activeMembers}
                  onChange={(e) => setStatsForm({ ...statsForm, activeMembers: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-sm focus:border-amber-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">
                  Jumlah Medali Kejuaraan
                </label>
                <input
                  type="number"
                  value={statsForm.medalsCount}
                  onChange={(e) => setStatsForm({ ...statsForm, medalsCount: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-sm focus:border-amber-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">
                  Jumlah Cabang Padepokan
                </label>
                <input
                  type="number"
                  value={statsForm.padepokanBranches}
                  onChange={(e) => setStatsForm({ ...statsForm, padepokanBranches: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-sm focus:border-amber-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">
                  Tingkat Kelulusan UKT (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={statsForm.uktPassRate}
                  onChange={(e) => setStatsForm({ ...statsForm, uktPassRate: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-sm focus:border-amber-500 outline-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsEditingStats(false)}
                  className="px-4 py-2 rounded-lg text-slate-400 hover:text-white text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-md"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4 Pilar Visi & Misi */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 text-amber-400 text-xs font-bold uppercase tracking-widest">
            <Shield className="w-3.5 h-3.5" />
            <span>Fondasi Nilai Luhur</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-['Cinzel']">
            Pilar Visi & Misi Perguruan
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Nilai dasar etika kesatria yang dipegang teguh oleh setiap murid, pendekar, dan dewan penguji Trident.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {pillars.map((pillar) => {
            const Icon = getPillarIcon(pillar.icon);
            return (
              <div
                key={pillar.id}
                className="trident-card rounded-2xl p-6 border border-slate-800 hover:border-blue-700/60 transition-all duration-300 relative group flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-700 to-blue-950 text-amber-400 flex items-center justify-center mb-4 shadow-md group-hover:scale-105 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors">
                    {pillar.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-2.5 leading-relaxed">
                    {pillar.desc}
                  </p>
                </div>
                <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Pilar #{pillar.id}</span>
                  <span className="text-blue-400 font-semibold group-hover:translate-x-1 transition-transform">Trident Doctrine</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Interactive History Timeline */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 text-blue-400 text-xs font-bold uppercase tracking-widest">
            <Calendar className="w-3.5 h-3.5" />
            <span>Rekam Jejak Historis</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-['Cinzel']">
            Sejarah Perjalanan Perguruan Trident
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Dari padepokan sederhana di pelosok desa hingga transformasi digital modern berstandar internasional.
          </p>
        </div>

        <div className="relative border-l-2 border-blue-900/60 ml-4 md:ml-32 space-y-10 pl-6 md:pl-10">
          {timeline.map((item, idx) => (
            <div key={idx} className="relative group">
              
              {/* Timeline marker */}
              <div className="absolute -left-[31px] md:-left-[47px] top-1.5 w-6 h-6 rounded-full bg-slate-950 border-4 border-amber-400 group-hover:scale-125 transition-transform shadow-lg shadow-amber-500/30" />

              <div className="trident-card rounded-2xl p-6 border border-slate-800 hover:border-amber-500/40 transition-all duration-300">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-black text-amber-400 font-['Cinzel']">
                      {item.year}
                    </span>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800/50">
                      {item.badge}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500">
                    Fase Perjalanan #{idx + 1}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white mb-2">
                  {item.title}
                </h3>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
