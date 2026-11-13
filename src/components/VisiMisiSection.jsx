import React, { useState } from 'react';
import { useApp, ROLES } from '../context/AppContext';
import { ORGANIZATIONAL_HIERARCHY } from '../data/mockData';
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
  Network,
  Layers,
  MapPin,
  ArrowRight,
  ShieldCheck,
  Phone,
  Clock,
  Plus,
  Trash2,
  ExternalLink,
  MessageCircle,
  X,
  Save,
} from 'lucide-react';

export default function VisiMisiSection() {
  const {
    stats,
    handleUpdateStats,
    heroData,
    handleUpdateHero,
    trainingGrounds,
    handleUpdateTrainingGround,
    handleAddTrainingGround,
    handleDeleteTrainingGround,
    timeline,
    pillars,
    handleUpdatePillar,
    handleAddPillar,
    handleDeletePillar,
    role,
    ROLES,
    navigateToTab,
  } = useApp();

  // Active Tier in Hierarchy diagram
  const [activeTierLevel, setActiveTierLevel] = useState(6); // Default to PAR (Tempat Latihan)

  // Edit Stats Modal
  const [isEditingStats, setIsEditingStats] = useState(false);
  const [statsForm, setStatsForm] = useState({ ...stats });

  // Admin CMS: Edit Hero Modal
  const [isEditingHero, setIsEditingHero] = useState(false);
  const [heroForm, setHeroForm] = useState({ ...heroData });

  // Admin CMS: Edit / Add Pillar Modal
  const [editingPillar, setEditingPillar] = useState(null); // null or pillar object
  const [isAddPillarOpen, setIsAddPillarOpen] = useState(false);
  const [newPillarForm, setNewPillarForm] = useState({
    title: '',
    desc: '',
    icon: 'Shield',
  });

  // Admin CMS: Edit / Add Training Ground Modal
  const [editingTrainingGround, setEditingTrainingGround] = useState(null); // null or ground object
  const [isAddGroundOpen, setIsAddGroundOpen] = useState(false);
  const [groundForm, setGroundForm] = useState({
    name: '',
    tier: 'Pimpinan Anak Ranting (PAR)',
    parentPR: '',
    address: '',
    trainerName: '',
    trainerBelt: 'Sabuk Hijau Strip Hitam',
    trainerPhone: '',
    trainerPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    schedule: '',
    facilitiesText: 'Matras Standar IPSI, Samsak Gantung, Body Protector, P3K',
    badge: 'Tempat Latihan Resmi',
    description: '',
  });

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

  const handleHeroSubmit = (e) => {
    e.preventDefault();
    handleUpdateHero(heroForm);
    setIsEditingHero(false);
  };

  const handleSavePillarEdit = (e) => {
    e.preventDefault();
    if (!editingPillar) return;
    handleUpdatePillar(editingPillar.id, editingPillar);
    setEditingPillar(null);
  };

  const handleCreateNewPillar = (e) => {
    e.preventDefault();
    handleAddPillar(newPillarForm);
    setIsAddPillarOpen(false);
    setNewPillarForm({ title: '', desc: '', icon: 'Shield' });
  };

  const handleOpenGroundEdit = (ground) => {
    setEditingTrainingGround(ground);
    setGroundForm({
      ...ground,
      facilitiesText: (ground.facilities || []).join(', '),
    });
  };

  const handleSaveGroundEdit = (e) => {
    e.preventDefault();
    if (!editingTrainingGround) return;
    const facilities = groundForm.facilitiesText.split(',').map((s) => s.trim()).filter(Boolean);
    handleUpdateTrainingGround(editingTrainingGround.id, {
      ...groundForm,
      facilities,
    });
    setEditingTrainingGround(null);
  };

  const handleCreateNewGround = (e) => {
    e.preventDefault();
    const facilities = groundForm.facilitiesText.split(',').map((s) => s.trim()).filter(Boolean);
    handleAddTrainingGround({
      ...groundForm,
      facilities,
      activeStudents: 30,
    });
    setIsAddGroundOpen(false);
    setGroundForm({
      name: '',
      tier: 'Pimpinan Anak Ranting (PAR)',
      parentPR: '',
      address: '',
      trainerName: '',
      trainerBelt: 'Sabuk Hijau Strip Hitam',
      trainerPhone: '',
      trainerPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      schedule: '',
      facilitiesText: 'Matras Standar IPSI, Samsak Gantung, Body Protector, P3K',
      badge: 'Tempat Latihan Resmi',
      description: '',
    });
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
          <div className="flex items-center justify-center gap-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{heroData?.badge || 'Padepokan Agung Seni Bela Diri Kesatria'}</span>
            </div>

            {role === ROLES.ADMIN && (
              <button
                onClick={() => {
                  setHeroForm({ ...heroData });
                  setIsEditingHero(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-[11px] font-bold transition-all"
                title="Edit Teks Slogan Hero (Administrator)"
              >
                <Edit3 className="w-3 h-3" />
                <span>Edit Slogan (Admin)</span>
              </button>
            )}
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight font-['Cinzel'] leading-tight">
            {heroData?.titleMain || 'TRIDENT'}{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500">
              {heroData?.titleHighlight || 'ACADEMY'}
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {heroData?.subtitle || 'Membina raga, menata rasa, dan menggembleng jiwa kesatria sejati melalui kurikulum bela diri terpadu serta standarisasi evaluasi kenaikan tingkat 4 Pos yang presisi.'}
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

          {(role === ROLES.EXAMINER || role === ROLES.ADMIN) && (
            <button
              onClick={() => {
                setStatsForm({ ...stats });
                setIsEditingStats(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-900/40 hover:bg-blue-800/60 border border-blue-500/40 text-blue-300 text-xs font-semibold transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Statistik ({role === ROLES.ADMIN ? 'Admin' : 'Penguji'})</span>
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

      {/* 4 Pilar Visi & Misi (Dengan Kontrol CMS Admin) */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-amber-400 text-xs font-bold uppercase tracking-widest mb-1">
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

          {role === ROLES.ADMIN && (
            <button
              onClick={() => setIsAddPillarOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold shadow-md transition-all shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Pilar Baru (Admin)</span>
            </button>
          )}
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
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-700 to-blue-950 text-amber-400 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                      <Icon className="w-6 h-6" />
                    </div>

                    {role === ROLES.ADMIN && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setEditingPillar({ ...pillar })}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-400 transition-colors"
                          title="Edit Pilar Ini"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        {pillars.length > 1 && (
                          <button
                            onClick={() => handleDeletePillar(pillar.id)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 transition-colors"
                            title="Hapus Pilar"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    )}
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

      {/* ========================================================================= */}
      {/* BAGAN STRUKTURAL ORGANISASI RESMI PERGURUAN (6 TINGKATAN)                */}
      {/* PP ➔ PW ➔ PC ➔ PAC ➔ PR ➔ PAR (Tempat Latihan)                         */}
      {/* ========================================================================= */}
      <section className="space-y-8">
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 text-amber-400 text-xs font-bold uppercase tracking-widest">
            <Network className="w-3.5 h-3.5" />
            <span>Tata Kelola Organisasi Terpadu</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-['Cinzel']">
            Bagan Struktur Organisasi Perguruan
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Garis koordinasi dan hierarki komando dari Pimpinan Pusat hingga Tempat Latihan akar rumput (Pimpinan Anak Ranting).
          </p>
        </div>

        {/* 6-Level Interactive Visual Hierarchy Flow */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {ORGANIZATIONAL_HIERARCHY.map((tier) => {
            const isSelected = activeTierLevel === tier.level;
            return (
              <button
                key={tier.level}
                onClick={() => setActiveTierLevel(tier.level)}
                className={`text-left p-4 rounded-2xl border transition-all duration-300 flex flex-col justify-between relative group ${
                  isSelected
                    ? 'bg-gradient-to-b from-blue-900/60 to-slate-900 border-amber-500 shadow-lg shadow-amber-950/40 ring-1 ring-amber-500/50 scale-[1.02]'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="w-6 h-6 rounded-lg bg-slate-950 border border-slate-700 text-amber-400 text-xs font-black flex items-center justify-center font-mono">
                      {tier.level}
                    </span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                      isSelected ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {tier.short}
                    </span>
                  </div>

                  <h4 className="text-xs font-extrabold text-white leading-tight font-['Cinzel'] mb-1">
                    {tier.tier}
                  </h4>
                  <p className="text-[10px] text-amber-400/90 font-medium">
                    {tier.scope}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800 text-[9px] text-slate-400 flex items-center justify-between">
                  <span>{tier.badge}</span>
                  <ChevronRight className={`w-3 h-3 transition-transform ${isSelected ? 'text-amber-400 rotate-90' : 'text-slate-600'}`} />
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Tier Highlight Detail Card */}
        {(() => {
          const currentTier = ORGANIZATIONAL_HIERARCHY.find((t) => t.level === activeTierLevel) || ORGANIZATIONAL_HIERARCHY[0];
          return (
            <div className="trident-card rounded-2xl p-6 sm:p-8 border border-amber-500/30 bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900 shadow-2xl relative overflow-hidden">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-3 max-w-2xl">
                  <div className="flex items-center gap-2.5">
                    <span className="px-3 py-1 rounded-lg bg-amber-500 text-slate-950 text-xs font-black font-mono">
                      Level {currentTier.level}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-bold text-white font-['Cinzel']">
                      {currentTier.tier}
                    </h3>
                    <span className="text-xs text-blue-300 font-semibold px-2.5 py-0.5 rounded-full bg-blue-950 border border-blue-800">
                      {currentTier.scope}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {currentTier.desc}
                  </p>

                  <div className="flex items-center gap-2 pt-1 text-xs">
                    <span className="text-slate-400">Contoh Satuan Administrasi:</span>
                    <strong className="text-amber-400 font-mono bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                      {currentTier.example}
                    </strong>
                  </div>
                </div>

                {/* Flow Breadcrumb */}
                <div className="shrink-0 bg-slate-950/80 p-4 rounded-xl border border-slate-800 text-xs space-y-2">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                    Alur Struktural Perguruan:
                  </span>
                  <div className="flex flex-wrap items-center gap-1.5 font-bold font-mono text-[11px]">
                    <span className={currentTier.level === 1 ? 'text-amber-400 underline font-extrabold' : 'text-slate-400'}>PP</span>
                    <span className="text-slate-600">➔</span>
                    <span className={currentTier.level === 2 ? 'text-amber-400 underline font-extrabold' : 'text-slate-400'}>PW</span>
                    <span className="text-slate-600">➔</span>
                    <span className={currentTier.level === 3 ? 'text-amber-400 underline font-extrabold' : 'text-slate-400'}>PC</span>
                    <span className="text-slate-600">➔</span>
                    <span className={currentTier.level === 4 ? 'text-amber-400 underline font-extrabold' : 'text-slate-400'}>PAC</span>
                    <span className="text-slate-600">➔</span>
                    <span className={currentTier.level === 5 ? 'text-amber-400 underline font-extrabold' : 'text-slate-400'}>PR</span>
                    <span className="text-slate-600">➔</span>
                    <span className={currentTier.level === 6 ? 'text-amber-400 underline font-extrabold' : 'text-slate-400'}>PAR</span>
                  </div>
                  <p className="text-[10px] text-emerald-400 pt-1 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Sistem Terisolasi Per-Ranting (Anti-Bentrok)</span>
                  </p>
                </div>
              </div>
            </div>
          );
        })()}
      </section>

      {/* ========================================================================= */}
      {/* SECTION: INFO TEMPAT LATIHAN (PAR) & KONTAK PELATIH RESMI               */}
      {/* ========================================================================= */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-amber-400 text-xs font-bold uppercase tracking-widest mb-1">
              <MapPin className="w-3.5 h-3.5" />
              <span>Pimpinan Anak Ranting (PAR) / Rayon</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-['Cinzel']">
              Info Tempat Latihan & Kontak Pelatih Resmi
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Temukan lokasi latihan terdekat, jadwal mingguan, dan hubungi langsung pelatih pembina ranting via WhatsApp.
            </p>
          </div>

          {role === ROLES.ADMIN && (
            <button
              onClick={() => setIsAddGroundOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold shadow-md transition-all shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Tempat Latihan (Admin)</span>
            </button>
          )}
        </div>

        {/* Training Grounds Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {trainingGrounds.map((ground) => {
            const cleanPhone = (ground.trainerPhone || '').replace(/[^0-9]/g, '');
            const waLink = `https://wa.me/${cleanPhone}?text=Salam%20Persaudaraan%20Pelatih%20${encodeURIComponent(ground.trainerName)},%20saya%20ingin%20menanyakan%20informasi%20pendaftaran%20di%20${encodeURIComponent(ground.name)}.`;

            return (
              <div
                key={ground.id}
                className="trident-card rounded-2xl p-6 border border-slate-800 hover:border-amber-500/40 transition-all duration-300 flex flex-col justify-between space-y-5 relative group"
              >
                <div className="space-y-4">
                  
                  {/* Top Bar: Name & Badge */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800 uppercase tracking-wider">
                        {ground.badge || 'Tempat Latihan'}
                      </span>
                      <h3 className="text-lg font-bold text-white font-['Cinzel'] mt-1.5">
                        {ground.name}
                      </h3>
                      <p className="text-xs text-amber-400 font-medium">
                        {ground.parentPR}
                      </p>
                    </div>

                    {role === ROLES.ADMIN && (
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleOpenGroundEdit(ground)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-400 transition-colors"
                          title="Edit Tempat Latihan Ini"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        {trainingGrounds.length > 1 && (
                          <button
                            onClick={() => handleDeleteTrainingGround(ground.id)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 transition-colors"
                            title="Hapus Tempat Latihan"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Address & Schedule */}
                  <div className="space-y-2 text-xs bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/80">
                    <div className="flex items-start gap-2.5 text-slate-300">
                      <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <span>{ground.address}</span>
                    </div>

                    <div className="flex items-start gap-2.5 text-slate-300">
                      <Clock className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                      <span className="font-medium text-slate-200">{ground.schedule}</span>
                    </div>
                  </div>

                  {/* Facilities tags */}
                  {ground.facilities && ground.facilities.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] text-slate-500 font-semibold mr-1">Fasilitas:</span>
                      {ground.facilities.map((fac, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-300"
                        >
                          ✓ {fac}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Trainer Profile Card */}
                  <div className="p-3.5 rounded-xl bg-gradient-to-r from-blue-950/40 via-slate-900 to-slate-950 border border-blue-900/40 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={ground.trainerPhoto}
                        alt={ground.trainerName}
                        className="w-12 h-12 rounded-xl object-cover border-2 border-amber-500/50 shadow-md shrink-0"
                      />
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                          Pelatih Pembina PAR:
                        </span>
                        <p className="text-xs font-bold text-white">{ground.trainerName}</p>
                        <p className="text-[10px] text-emerald-400 font-medium">{ground.trainerBelt}</p>
                      </div>
                    </div>

                    {/* WhatsApp Action Button */}
                    <a
                      href={waLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-950/50 transition-all hover:scale-105 shrink-0"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>WhatsApp</span>
                    </a>
                  </div>

                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Kontak: <strong className="text-slate-300 font-mono">{ground.trainerPhone}</strong></span>
                  <span className="text-blue-400 font-semibold">{ground.activeStudents || 40}+ Pesilat Aktif</span>
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

      {/* ========================================================================= */}
      {/* MODALS UNTUK PENGELOLAAN KONTEN ADMIN                                     */}
      {/* ========================================================================= */}

      {/* 1. Modal Edit Statistik */}
      {isEditingStats && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white font-['Cinzel'] mb-4 flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-amber-400" />
              Pembaruan Counter Statistik Perguruan
            </h3>
            
            <form onSubmit={handleStatsSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">Jumlah Anggota Aktif</label>
                <input
                  type="number"
                  value={statsForm.activeMembers}
                  onChange={(e) => setStatsForm({ ...statsForm, activeMembers: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-sm focus:border-amber-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">Jumlah Medali Kejuaraan</label>
                <input
                  type="number"
                  value={statsForm.medalsCount}
                  onChange={(e) => setStatsForm({ ...statsForm, medalsCount: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-sm focus:border-amber-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">Jumlah Cabang Padepokan</label>
                <input
                  type="number"
                  value={statsForm.padepokanBranches}
                  onChange={(e) => setStatsForm({ ...statsForm, padepokanBranches: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-sm focus:border-amber-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">Tingkat Kelulusan UKT (%)</label>
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

      {/* 2. Modal Edit Hero Slogan (Admin) */}
      {isEditingHero && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-slate-900 border border-amber-500/40 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white font-['Cinzel'] mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              Kelola Slogan & Teks Hero (Admin)
            </h3>
            
            <form onSubmit={handleHeroSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">Teks Badge Atas</label>
                <input
                  type="text"
                  value={heroForm.badge}
                  onChange={(e) => setHeroForm({ ...heroForm, badge: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:border-amber-500 outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-300 font-medium block mb-1">Judul Utama</label>
                  <input
                    type="text"
                    value={heroForm.titleMain}
                    onChange={(e) => setHeroForm({ ...heroForm, titleMain: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:border-amber-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 font-medium block mb-1">Kata Emas (Highlight)</label>
                  <input
                    type="text"
                    value={heroForm.titleHighlight}
                    onChange={(e) => setHeroForm({ ...heroForm, titleHighlight: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:border-amber-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">Deskripsi Slogan Perguruan</label>
                <textarea
                  rows="3"
                  value={heroForm.subtitle}
                  onChange={(e) => setHeroForm({ ...heroForm, subtitle: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:border-amber-500 outline-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsEditingHero(false)}
                  className="px-4 py-2 rounded-lg text-slate-400 hover:text-white text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-md"
                >
                  Simpan Slogan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Modal Edit / Add Pillar */}
      {(editingPillar || isAddPillarOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-slate-900 border border-amber-500/40 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white font-['Cinzel'] mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-amber-400" />
              {editingPillar ? 'Edit Pilar Visi & Misi' : 'Tambah Pilar Baru'}
            </h3>
            
            <form onSubmit={editingPillar ? handleSavePillarEdit : handleCreateNewPillar} className="space-y-4">
              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">Judul Pilar</label>
                <input
                  type="text"
                  value={editingPillar ? editingPillar.title : newPillarForm.title}
                  onChange={(e) =>
                    editingPillar
                      ? setEditingPillar({ ...editingPillar, title: e.target.value })
                      : setNewPillarForm({ ...newPillarForm, title: e.target.value })
                  }
                  placeholder="Contoh: Kedisiplinan & Keteguhan Jiwa"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:border-amber-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">Penjelasan / Doktrin Pilar</label>
                <textarea
                  rows="3"
                  value={editingPillar ? editingPillar.desc : newPillarForm.desc}
                  onChange={(e) =>
                    editingPillar
                      ? setEditingPillar({ ...editingPillar, desc: e.target.value })
                      : setNewPillarForm({ ...newPillarForm, desc: e.target.value })
                  }
                  placeholder="Uraian nilai dasar yang terkandung..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:border-amber-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">Simbol Ikon</label>
                <select
                  value={editingPillar ? editingPillar.icon : newPillarForm.icon}
                  onChange={(e) =>
                    editingPillar
                      ? setEditingPillar({ ...editingPillar, icon: e.target.value })
                      : setNewPillarForm({ ...newPillarForm, icon: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:border-amber-500 outline-none"
                >
                  <option value="Shield">Perisai (Shield) - Integritas</option>
                  <option value="Zap">Petir (Zap) - Ketangkasan Fisik</option>
                  <option value="Users">Persaudaraan (Users) - Silaturahmi</option>
                  <option value="Award">Piala (Award) - Prestasi & Pengabdian</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setEditingPillar(null);
                    setIsAddPillarOpen(false);
                  }}
                  className="px-4 py-2 rounded-lg text-slate-400 hover:text-white text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-md"
                >
                  Simpan Pilar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Modal Edit / Add Training Ground (Admin) */}
      {(editingTrainingGround || isAddGroundOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-slate-900 border border-amber-500/40 rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-white font-['Cinzel'] mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-amber-400" />
              {editingTrainingGround ? 'Edit Info Tempat Latihan & Pelatih' : 'Tambah Tempat Latihan (PAR) Baru'}
            </h3>
            
            <form onSubmit={editingTrainingGround ? handleSaveGroundEdit : handleCreateNewGround} className="space-y-4">
              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">Nama Tempat Latihan (PAR)</label>
                <input
                  type="text"
                  value={groundForm.name}
                  onChange={(e) => setGroundForm({ ...groundForm, name: e.target.value })}
                  placeholder="Contoh: PAR Buana Garden (Tempat Latihan)"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:border-amber-500 outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-300 font-medium block mb-1">Pimpinan Ranting / PAC</label>
                  <input
                    type="text"
                    value={groundForm.parentPR}
                    onChange={(e) => setGroundForm({ ...groundForm, parentPR: e.target.value })}
                    placeholder="Contoh: PR Tanjung Piayu - PAC Sungai Beduk"
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:border-amber-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 font-medium block mb-1">Badge Kategori</label>
                  <input
                    type="text"
                    value={groundForm.badge}
                    onChange={(e) => setGroundForm({ ...groundForm, badge: e.target.value })}
                    placeholder="Contoh: Rayon Utama / Kelas Remaja"
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:border-amber-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">Alamat Lengkap Lokasi Latihan</label>
                <input
                  type="text"
                  value={groundForm.address}
                  onChange={(e) => setGroundForm({ ...groundForm, address: e.target.value })}
                  placeholder="Fasum / Gedung Serbaguna..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:border-amber-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">Jadwal Latihan Rutin</label>
                <input
                  type="text"
                  value={groundForm.schedule}
                  onChange={(e) => setGroundForm({ ...groundForm, schedule: e.target.value })}
                  placeholder="Contoh: Selasa & Jumat: 16:00 - 18:00 WIB • Minggu: 07:30 - 10:00 WIB"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:border-amber-500 outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-300 font-medium block mb-1">Nama Pelatih Pembina</label>
                  <input
                    type="text"
                    value={groundForm.trainerName}
                    onChange={(e) => setGroundForm({ ...groundForm, trainerName: e.target.value })}
                    placeholder="Contoh: Pendekar Hendro Suwarno"
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:border-amber-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 font-medium block mb-1">Tingkatan Sabuk Pelatih</label>
                  <input
                    type="text"
                    value={groundForm.trainerBelt}
                    onChange={(e) => setGroundForm({ ...groundForm, trainerBelt: e.target.value })}
                    placeholder="Contoh: Sabuk Hijau Strip Hitam"
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:border-amber-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">No. Kontak WhatsApp Pelatih</label>
                <input
                  type="text"
                  value={groundForm.trainerPhone}
                  onChange={(e) => setGroundForm({ ...groundForm, trainerPhone: e.target.value })}
                  placeholder="Contoh: +62 812-7721-9988"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:border-amber-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">Fasilitas (Pisahkan dengan koma)</label>
                <input
                  type="text"
                  value={groundForm.facilitiesText}
                  onChange={(e) => setGroundForm({ ...groundForm, facilitiesText: e.target.value })}
                  placeholder="Matras Standar IPSI, Samsak Gantung, Body Protector, P3K"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:border-amber-500 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setEditingTrainingGround(null);
                    setIsAddGroundOpen(false);
                  }}
                  className="px-4 py-2 rounded-lg text-slate-400 hover:text-white text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-md"
                >
                  Simpan Tempat Latihan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
