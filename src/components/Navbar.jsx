import React, { useState } from 'react';
import { useApp, ROLES } from '../context/AppContext';
import {
  Shield,
  Newspaper,
  Trophy,
  Calendar,
  HeartHandshake,
  GraduationCap,
  Lock,
  Menu,
  X,
  UserCheck,
  ChevronDown,
  Sparkles,
  Sword,
  User,
  KeyRound,
  LogOut,
  ShieldCheck,
} from 'lucide-react';

export default function Navbar() {
  const {
    role,
    ROLES,
    handleRoleChange,
    currentUser,
    activeTab,
    navigateToTab,
    isLoginModalOpen,
    setIsLoginModalOpen,
    handleLogout,
  } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const navItems = [
    { id: 'visi', label: 'Visi & Sejarah', icon: Shield, locked: false },
    { id: 'berita', label: 'Berita', icon: Newspaper, locked: false },
    { id: 'prestasi', label: 'Prestasi', icon: Trophy, locked: false },
    { id: 'agenda', label: 'Agenda Kegiatan', icon: Calendar, locked: role === ROLES.PUBLIC },
    { id: 'donasi', label: 'Donasi', icon: HeartHandshake, locked: role === ROLES.PUBLIC },
    { id: 'ukt', label: 'Ujian Kenaikan Tingkat', icon: GraduationCap, locked: role === ROLES.PUBLIC },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-blue-900/40 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Brand */}
          <div 
            onClick={() => navigateToTab('visi')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-700 via-blue-900 to-amber-600 p-[2px] shadow-lg shadow-blue-950/50 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Sword className="w-6 h-6 text-amber-400 transform -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-2xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 font-['Cinzel']">
                  TRIDENT
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-900/60 text-blue-300 border border-blue-700/50 uppercase tracking-widest">
                  v1.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium tracking-tight">
                Martial Arts Academy & UKT System
              </p>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => navigateToTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 relative ${
                    isActive
                      ? 'bg-blue-600/20 text-amber-300 border border-amber-500/30 shadow-[0_0_15px_rgba(37,99,235,0.2)]'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.locked && (
                    <span className="flex items-center justify-center w-4 h-4 rounded-full bg-slate-800 text-amber-400/80 border border-amber-500/20 ml-0.5" title="Khusus Anggota & Penguji">
                      <Lock className="w-2.5 h-2.5" />
                    </span>
                  )}
                  {isActive && (
                    <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Role Switcher & User Profile */}
          <div className="hidden md:flex items-center gap-3">
            <div className="relative">
              <button
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="flex items-center gap-3 pl-3 pr-2.5 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-blue-700/60 transition-all text-left shadow-inner"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-amber-500/40"
                />
                <div className="hidden xl:block">
                  <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    {currentUser.name}
                    {role === ROLES.ADMIN && (
                      <span className="text-[10px] px-1 rounded bg-amber-500 text-slate-950 font-black">
                        Admin Pusat
                      </span>
                    )}
                    {role === ROLES.EXAMINER && (
                      <span className="text-[10px] px-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        Penguji
                      </span>
                    )}
                    {role === ROLES.MEMBER && (
                      <span className="text-[10px] px-1 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        Anggota
                      </span>
                    )}
                    {role === ROLES.PUBLIC && (
                      <span className="text-[10px] px-1 rounded bg-slate-700/40 text-slate-400">
                        Tamu
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate max-w-[130px]">
                    {currentUser.belt}
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400 ml-1" />
              </button>

              {/* Role Dropdown */}
              {roleDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl p-2 z-50 backdrop-blur-xl">
                  <div className="px-3 py-2 border-b border-slate-800 text-xs text-slate-400">
                    <p className="font-semibold text-slate-200">Simulasi Peran Pengguna (RBAC)</p>
                    <p className="text-[11px] mt-0.5 text-slate-400">Ganti peran untuk menguji hak akses fitur PRD:</p>
                  </div>
                  
                  <div className="mt-1 space-y-1">
                    <button
                      onClick={() => {
                        handleRoleChange(ROLES.PUBLIC);
                        setRoleDropdownOpen(false);
                      }}
                      className={`w-full flex items-start gap-2.5 px-3 py-2 rounded-lg text-left transition-colors ${
                        role === ROLES.PUBLIC ? 'bg-blue-950/70 border border-blue-600/40 text-white' : 'hover:bg-slate-800 text-slate-300'
                      }`}
                    >
                      <User className="w-4 h-4 mt-0.5 text-slate-400" />
                      <div>
                        <div className="text-xs font-bold flex items-center gap-1.5">
                          Tamu (Public)
                          {role === ROLES.PUBLIC && <span className="text-[10px] text-amber-400 font-normal">● Aktif</span>}
                        </div>
                        <p className="text-[11px] text-slate-400">Hanya dapat membaca Sejarah, Berita, & Prestasi.</p>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        handleRoleChange(ROLES.MEMBER);
                        setRoleDropdownOpen(false);
                      }}
                      className={`w-full flex items-start gap-2.5 px-3 py-2 rounded-lg text-left transition-colors ${
                        role === ROLES.MEMBER ? 'bg-blue-950/70 border border-blue-600/40 text-white' : 'hover:bg-slate-800 text-slate-300'
                      }`}
                    >
                      <UserCheck className="w-4 h-4 mt-0.5 text-blue-400" />
                      <div>
                        <div className="text-xs font-bold flex items-center gap-1.5">
                          Anggota (Member)
                          {role === ROLES.MEMBER && <span className="text-[10px] text-amber-400 font-normal">● Aktif</span>}
                        </div>
                        <p className="text-[11px] text-slate-400">Ahmad Fauzi: RSVP Agenda, Donasi & Cetak Resi, Cek Hasil UKT.</p>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        handleRoleChange(ROLES.EXAMINER);
                        setRoleDropdownOpen(false);
                      }}
                      className={`w-full flex items-start gap-2.5 px-3 py-2 rounded-lg text-left transition-colors ${
                        role === ROLES.EXAMINER ? 'bg-amber-950/50 border border-amber-600/40 text-white' : 'hover:bg-slate-800 text-slate-300'
                      }`}
                    >
                      <Sword className="w-4 h-4 mt-0.5 text-amber-400" />
                      <div>
                        <div className="text-xs font-bold flex items-center gap-1.5">
                          Penguji UKT (Examiner)
                          {role === ROLES.EXAMINER && <span className="text-[10px] text-amber-400 font-normal">● Aktif</span>}
                        </div>
                        <p className="text-[11px] text-slate-400">Master Bambang: Penilaian Pos 1-4, Mode Offline & Auto-Sync Sinyal.</p>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        handleRoleChange(ROLES.ADMIN);
                        setRoleDropdownOpen(false);
                      }}
                      className={`w-full flex items-start gap-2.5 px-3 py-2 rounded-lg text-left transition-colors ${
                        role === ROLES.ADMIN ? 'bg-amber-950/70 border border-amber-500/50 text-white' : 'hover:bg-slate-800 text-slate-300'
                      }`}
                    >
                      <ShieldCheck className="w-4 h-4 mt-0.5 text-amber-400" />
                      <div>
                        <div className="text-xs font-bold flex items-center gap-1.5">
                          Administrator Pusat (CMS Admin)
                          {role === ROLES.ADMIN && <span className="text-[10px] text-amber-400 font-normal">● Aktif</span>}
                        </div>
                        <p className="text-[11px] text-slate-400">Pengurus Pusat: Mengubah isi aplikasi (Pilar Visi Misi, Tempat Latihan, Slogan).</p>
                      </div>
                    </button>
                  </div>

                  {role !== ROLES.PUBLIC && (
                    <div className="mt-2 pt-2 border-t border-slate-800">
                      <button
                        onClick={() => {
                          handleLogout();
                          setRoleDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-400 hover:bg-rose-950/40 transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Keluar dari Akun (Logout)</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Login Button when Guest */}
            {role === ROLES.PUBLIC && (
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs shadow-md shadow-amber-950/40 transition-all hover:scale-105"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Masuk Akun</span>
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-slate-900 text-slate-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-800 bg-slate-950/95 px-4 pt-3 pb-6 space-y-3">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <img src={currentUser.avatar} alt="" className="w-9 h-9 rounded-full object-cover" />
              <div>
                <p className="text-xs font-bold text-white">{currentUser.name}</p>
                <p className="text-[10px] text-slate-400">{currentUser.title}</p>
              </div>
            </div>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-blue-900/60 text-blue-300 border border-blue-700/50">
              {role}
            </span>
          </div>

          <div className="pt-1">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Pilih Peran Simulasi:
            </p>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                onClick={() => handleRoleChange(ROLES.PUBLIC)}
                className={`py-1.5 text-xs font-semibold rounded-lg border ${
                  role === ROLES.PUBLIC ? 'bg-blue-600 text-white border-blue-500' : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}
              >
                Tamu
              </button>
              <button
                onClick={() => handleRoleChange(ROLES.MEMBER)}
                className={`py-1.5 text-xs font-semibold rounded-lg border ${
                  role === ROLES.MEMBER ? 'bg-blue-600 text-white border-blue-500' : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}
              >
                Anggota
              </button>
              <button
                onClick={() => handleRoleChange(ROLES.EXAMINER)}
                className={`py-1.5 text-xs font-semibold rounded-lg border ${
                  role === ROLES.EXAMINER ? 'bg-amber-600 text-white border-amber-500' : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}
              >
                Penguji
              </button>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    navigateToTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium ${
                    isActive ? 'bg-blue-600/20 text-amber-300 border border-amber-500/30' : 'text-slate-300 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-slate-400" />
                    <span>{item.label}</span>
                  </div>
                  {item.locked && (
                    <span className="flex items-center gap-1 text-[11px] text-amber-400/90 bg-slate-900 px-2 py-0.5 rounded border border-amber-500/20">
                      <Lock className="w-3 h-3" /> Terkunci
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
