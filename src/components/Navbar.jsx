import React, { useState } from 'react';
import TridentIcon from './TridentIcon';
import { useApp, ROLES } from '../context/AppContext';
import { isTabEnabled } from '../config';

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
  KeyRound,
  LogOut,
  BadgeCheck,
  Users,
} from 'lucide-react';

const ROLE_BADGE = {
  [ROLES.ADMIN]: { label: 'Admin Pusat', cls: 'bg-amber-500 text-slate-950 font-black' },
  [ROLES.EXAMINER]: { label: 'Penguji', cls: 'bg-amber-500/20 text-amber-500 border border-amber-500/30' },
  [ROLES.MEMBER]: { label: 'Anggota', cls: 'bg-teal-500/20 text-teal-700 border border-teal-500/30' },
};

export default function Navbar() {
  const { role, isAdmin, pendingDonations, currentUser, authLoading, activeTab, navigateToTab, setIsLoginModalOpen, signOut } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'visi', label: 'Visi & Sejarah', icon: Shield, locked: false },
    { id: 'berita', label: 'Berita', icon: Newspaper, locked: false },
    { id: 'prestasi', label: 'Prestasi', icon: Trophy, locked: false },
    { id: 'agenda', label: 'Agenda Kegiatan', icon: Calendar, locked: role === ROLES.PUBLIC },
    { id: 'donasi', label: 'Donasi', icon: HeartHandshake, locked: role === ROLES.PUBLIC },
    { id: 'ukt', label: 'Ujian Kenaikan Tingkat', icon: GraduationCap, locked: role === ROLES.PUBLIC },
    ...(isAdmin ? [{ id: 'verifikasi', label: 'Verifikasi', icon: BadgeCheck, locked: false, badge: pendingDonations.length }, { id: 'akun', label: 'Kelola Akun', icon: Users, locked: false }] : []),
  ].filter((item) => isTabEnabled(item.id));

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-teal-200 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Brand */}
          <div 
            onClick={() => navigateToTab('visi')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-teal-700 via-teal-900 to-amber-600 p-[2px] shadow-lg shadow-teal-950/50 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
                <TridentIcon className="w-7 h-7 text-amber-500" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-2xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-green-500 to-green-600 font-['Cinzel']">
                  PAGAR NUSA
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium tracking-tight">
                Kota Batam
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
                      ? 'bg-teal-600/20 text-amber-500 border border-amber-500/30 shadow-[0_0_15px_rgba(37,99,235,0.2)]'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-amber-500' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                  {item.badge > 0 && (
                    <span className="min-w-4 h-4 px-1 rounded-full bg-rose-500 text-slate-900 text-[10px] font-bold flex items-center justify-center">{item.badge}</span>
                  )}
                  {item.locked && (
                    <span className="flex items-center justify-center w-4 h-4 rounded-full bg-slate-100 text-amber-500/80 border border-amber-500/20 ml-0.5" title="Khusus Anggota & Penguji">
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

          {/* User Profile & Auth */}
          <div className="hidden md:flex items-center gap-3">
            {currentUser ? (
              <>
                <div className="flex items-center gap-3 pl-3 pr-3 py-1.5 rounded-xl bg-slate-50/90 border border-slate-200 shadow-inner">
                  {currentUser.avatar && (
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-8 h-8 rounded-full object-cover ring-2 ring-amber-500/40"
                    />
                  )}
                  <div className="hidden xl:block">
                    <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      {currentUser.name}
                      <span className={`text-[10px] px-1 rounded ${ROLE_BADGE[role].cls}`}>{ROLE_BADGE[role].label}</span>
                    </div>
                    {currentUser.belt && (
                      <div className="text-[10px] text-slate-500 truncate max-w-[130px]">{currentUser.belt}</div>
                    )}
                  </div>
                </div>
                <button
                  onClick={signOut}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 hover:border-rose-600/60 text-rose-600 font-bold text-xs transition-all"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Keluar</span>
                </button>
              </>
            ) : (
              !authLoading && (
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs shadow-md shadow-amber-950/40 transition-all hover:scale-105"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Masuk Akun</span>
                </button>
              )
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-slate-50 text-slate-700 hover:text-slate-900"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white/95 px-4 pt-3 pb-6 space-y-3">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2">
            {currentUser ? (
              <>
                <div className="flex items-center gap-2.5 min-w-0">
                  {currentUser.avatar && <img src={currentUser.avatar} alt="" className="w-9 h-9 rounded-full object-cover" />}
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">{currentUser.name}</p>
                    <span className={`text-[10px] px-1 rounded ${ROLE_BADGE[role].cls}`}>{ROLE_BADGE[role].label}</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    signOut();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-rose-600 border border-slate-200"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Keluar</span>
                </button>
              </>
            ) : authLoading ? null : (
              <button
                onClick={() => {
                  setIsLoginModalOpen(true);
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-extrabold text-xs"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Masuk Akun</span>
              </button>
            )}
          </div>

          <div className="border-t border-slate-200 pt-3 space-y-1">
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
                    isActive ? 'bg-teal-600/20 text-amber-500 border border-amber-500/30' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-slate-500" />
                    <span>{item.label}</span>
                    {item.badge > 0 && (
                    <span className="min-w-4 h-4 px-1 rounded-full bg-rose-500 text-slate-900 text-[10px] font-bold flex items-center justify-center">{item.badge}</span>
                  )}
                  </div>
                  {item.locked && (
                    <span className="flex items-center gap-1 text-[11px] text-amber-500/90 bg-slate-50 px-2 py-0.5 rounded border border-amber-500/20">
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
