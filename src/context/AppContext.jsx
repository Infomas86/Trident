import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  INITIAL_STATS,
  INITIAL_TIMELINE,
  INITIAL_PILLARS,
  INITIAL_NEWS,
  INITIAL_ACHIEVEMENTS,
  INITIAL_AGENDAS,
  INITIAL_CAMPAIGNS,
  INITIAL_CANDIDATES,
  calculateUktScore,
} from '../data/mockData';

const AppContext = createContext();

export const ROLES = {
  PUBLIC: 'public',
  MEMBER: 'member',
  EXAMINER: 'examiner',
};

const USER_PROFILES = {
  [ROLES.PUBLIC]: {
    id: 'guest',
    name: 'Tamu Publik',
    role: ROLES.PUBLIC,
    title: 'Pengunjung Umum',
    belt: 'Belum Terdaftar',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
  },
  [ROLES.MEMBER]: {
    id: 'cand-1',
    name: 'Ahmad Fauzi',
    role: ROLES.MEMBER,
    title: 'Pesilat Aktif (Ksatria Muda)',
    belt: 'Sabuk Hijau Strip Putih',
    regNumber: 'TRD-UKT-2026-084',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  },
  [ROLES.EXAMINER]: {
    id: 'ex-1',
    name: 'Master Bambang Wijaya',
    role: ROLES.EXAMINER,
    title: 'Dewan Pendekar & Penguji Utama UKT',
    belt: 'Sabuk Hijau Strip Hitam (Dewan Pendekar)',
    regNumber: 'TRD-EXAM-1984-001',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
  },
};

export function AppProvider({ children }) {
  // Load role from localStorage or default to PUBLIC
  const [role, setRole] = useState(() => {
    return localStorage.getItem('trident_role') || ROLES.PUBLIC;
  });

  const [activeTab, setActiveTab] = useState('visi');
  const [lockedModal, setLockedModal] = useState({ open: false, featureName: '' });

  // Admin Verification Code Modal State (for Anggota wanting to act as Penguji)
  const [isAdminCodeModalOpen, setIsAdminCodeModalOpen] = useState(false);

  // Data states
  const [stats, setStats] = useState(INITIAL_STATS);
  const [timeline, setTimeline] = useState(INITIAL_TIMELINE);
  const [pillars, setPillars] = useState(INITIAL_PILLARS);
  const [newsList, setNewsList] = useState(INITIAL_NEWS);
  const [achievementsList, setAchievementsList] = useState(INITIAL_ACHIEVEMENTS);
  const [agendaList, setAgendaList] = useState(INITIAL_AGENDAS);
  const [campaignList, setCampaignList] = useState(INITIAL_CAMPAIGNS);
  const [candidatesList, setCandidatesList] = useState(INITIAL_CANDIDATES);

  // Modal for donation receipt printing
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  // Toast notification
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3800);
  };

  const handleRoleChange = (newRole, bypassCode = false) => {
    // If logged in as Anggota and wanting to switch to Penguji, require admin verification code!
    if (role === ROLES.MEMBER && newRole === ROLES.EXAMINER && !bypassCode) {
      setIsAdminCodeModalOpen(true);
      return;
    }

    setRole(newRole);
    localStorage.setItem('trident_role', newRole);
    const roleName = newRole === ROLES.PUBLIC ? 'Tamu Publik' : newRole === ROLES.MEMBER ? 'Anggota (Ahmad Fauzi)' : 'Penguji UKT (Master Bambang)';
    showToast(`Beralih peran menjadi: ${roleName}`, 'info');
  };

  // Verify Admin Code and unlock Examiner Mode
  const verifyAndUnlockExaminer = (code) => {
    const validCodes = ['TRIDENT2026', 'ADMIN123', 'PENGUJI88', '123456'];
    const cleaned = (code || '').trim().toUpperCase();
    if (validCodes.includes(cleaned)) {
      setRole(ROLES.EXAMINER);
      localStorage.setItem('trident_role', ROLES.EXAMINER);
      setIsAdminCodeModalOpen(false);
      showToast('Kode Admin valid! Otorisasi Penguji UKT berhasil dibuka.', 'success');
      return true;
    }
    return false;
  };

  const requestExaminerAccess = () => {
    setIsAdminCodeModalOpen(true);
  };

  const currentUser = USER_PROFILES[role] || USER_PROFILES[ROLES.PUBLIC];

  // Helper check access
  const checkAccess = (moduleName) => {
    if (role === ROLES.PUBLIC) {
      if (['agenda', 'donasi', 'ukt'].includes(moduleName)) {
        setLockedModal({
          open: true,
          featureName: moduleName === 'agenda' ? 'Agenda Kegiatan' : moduleName === 'donasi' ? 'Donasi Perguruan' : 'Ujian Kenaikan Tingkat',
        });
        return false;
      }
    }
    return true;
  };

  // Switch tab with access check
  const navigateToTab = (tabName) => {
    if (['agenda', 'donasi', 'ukt'].includes(tabName) && role === ROLES.PUBLIC) {
      setLockedModal({
        open: true,
        featureName: tabName === 'agenda' ? 'Agenda Kegiatan' : tabName === 'donasi' ? 'Donasi Perguruan' : 'Ujian Kenaikan Tingkat',
      });
      return;
    }
    setActiveTab(tabName);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Agenda RSVP action
  const handleRsvp = (agendaId, status, reason = '') => {
    if (role === ROLES.PUBLIC) {
      checkAccess('agenda');
      return;
    }

    setAgendaList((prev) =>
      prev.map((agenda) => {
        if (agenda.id !== agendaId) return agenda;

        const currentAttendees = agenda.attendees || [];
        const existingIdx = currentAttendees.findIndex((a) => a.id === currentUser.id);

        let updatedAttendees;
        if (existingIdx >= 0) {
          updatedAttendees = [...currentAttendees];
          updatedAttendees[existingIdx] = {
            ...updatedAttendees[existingIdx],
            name: currentUser.name,
            role: currentUser.role === ROLES.MEMBER ? 'Anggota' : 'Penguji',
            status,
            reason: status === 'izin' ? reason : undefined,
          };
        } else {
          updatedAttendees = [
            ...currentAttendees,
            {
              id: currentUser.id,
              name: currentUser.name,
              role: currentUser.role === ROLES.MEMBER ? 'Anggota' : 'Penguji',
              status,
              reason: status === 'izin' ? reason : undefined,
            },
          ];
        }

        return {
          ...agenda,
          attendees: updatedAttendees,
        };
      })
    );

    showToast(
      status === 'hadir'
        ? 'Konfirmasi HADIR berhasil dicatat pada agenda!'
        : 'Konfirmasi IZIN berhasil dikirim beserta keterangan.',
      'success'
    );
  };

  // Donation action
  const handleDonate = (campaignId, donationData) => {
    const { amount, donorName, message, paymentMethod } = donationData;
    const numAmount = Number(amount);

    const refNumber = `TRD-DON-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newDonationItem = {
      id: `d-${Date.now()}`,
      refNumber,
      donorName: donorName || currentUser.name,
      amount: numAmount,
      date: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
      message: message || 'Salam Persaudaraan Perguruan Trident!',
      paymentMethod,
    };

    let targetCampaignTitle = '';

    setCampaignList((prev) =>
      prev.map((camp) => {
        if (camp.id !== campaignId) return camp;
        targetCampaignTitle = camp.title;
        return {
          ...camp,
          collectedAmount: camp.collectedAmount + numAmount,
          donorsCount: camp.donorsCount + 1,
          recentDonations: [newDonationItem, ...(camp.recentDonations || [])],
        };
      })
    );

    const receiptObj = {
      ...newDonationItem,
      campaignTitle: targetCampaignTitle,
      timestamp: new Date().toLocaleString('id-ID'),
    };

    setSelectedReceipt(receiptObj);
    showToast(`Donasi sebesar Rp ${numAmount.toLocaleString('id-ID')} berhasil diproses! Bukti resi telah diterbitkan.`, 'success');
  };

  // UKT Candidate Score Update (Examiner only)
  const handleUpdateCandidateScores = (candidateId, newPosScores, notes) => {
    setCandidatesList((prev) =>
      prev.map((c) => {
        if (c.id !== candidateId) return c;
        return {
          ...c,
          posScores: newPosScores,
          examinerNotes: notes,
          examinerName: currentUser.name,
          dateExam: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
        };
      })
    );

    showToast('Nilai Ujian Kenaikan Tingkat berhasil dikalkulasi & disimpan!', 'success');
  };

  // Import Candidates
  const handleImportCandidates = (newCandidates) => {
    setCandidatesList((prev) => {
      const existingIds = new Set(prev.map((c) => c.id));
      const filteredNew = newCandidates.filter((c) => !existingIds.has(c.id));
      return [...filteredNew, ...prev];
    });
    showToast(`Berhasil mengimpor ${newCandidates.length} peserta Ujian Kenaikan Tingkat!`, 'success');
  };

  // Examiner additions
  const handleAddNews = (newNews) => {
    setNewsList((prev) => [
      {
        id: `news-${Date.now()}`,
        date: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }),
        author: currentUser.name,
        ...newNews,
      },
      ...prev,
    ]);
    showToast('Berita perguruan baru berhasil dipublikasikan!', 'success');
  };

  const handleAddAchievement = (newAch) => {
    setAchievementsList((prev) => [
      {
        id: `ach-${Date.now()}`,
        year: '2026',
        ...newAch,
      },
      ...prev,
    ]);
    showToast('Prestasi atlet berhasil ditambahkan ke etalase!', 'success');
  };

  const handleAddAgenda = (newAgenda) => {
    setAgendaList((prev) => [
      {
        id: `agenda-${Date.now()}`,
        attendees: [{ id: currentUser.id, name: currentUser.name, role: 'Penguji', status: 'hadir' }],
        ...newAgenda,
      },
      ...prev,
    ]);
    showToast('Agenda kegiatan baru berhasil dijadwalkan!', 'success');
  };

  const handleAddCampaign = (newCamp) => {
    setCampaignList((prev) => [
      {
        id: `camp-${Date.now()}`,
        collectedAmount: 0,
        donorsCount: 0,
        recentDonations: [],
        ...newCamp,
      },
      ...prev,
    ]);
    showToast('Program donasi padepokan baru berhasil diluncurkan!', 'success');
  };

  const handleUpdateStats = (newStats) => {
    setStats(newStats);
    showToast('Statistik perguruan berhasil diperbarui!', 'success');
  };

  return (
    <AppContext.Provider
      value={{
        role,
        ROLES,
        handleRoleChange,
        requestExaminerAccess,
        isAdminCodeModalOpen,
        setIsAdminCodeModalOpen,
        verifyAndUnlockExaminer,
        currentUser,
        activeTab,
        setActiveTab,
        navigateToTab,
        checkAccess,
        lockedModal,
        setLockedModal,
        stats,
        handleUpdateStats,
        timeline,
        pillars,
        newsList,
        handleAddNews,
        achievementsList,
        handleAddAchievement,
        agendaList,
        handleAddAgenda,
        handleRsvp,
        campaignList,
        handleAddCampaign,
        handleDonate,
        candidatesList,
        handleUpdateCandidateScores,
        handleImportCandidates,
        selectedReceipt,
        setSelectedReceipt,
        toast,
        showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
