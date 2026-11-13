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
  INITIAL_HERO_DATA,
  INITIAL_TRAINING_GROUNDS,
  calculateUktScore,
} from '../data/mockData';

const AppContext = createContext();

export const ROLES = {
  PUBLIC: 'public',
  MEMBER: 'member',
  EXAMINER: 'examiner',
  ADMIN: 'admin',
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
  [ROLES.ADMIN]: {
    id: 'admin-1',
    name: 'Dewan Sekretariat Pusat',
    role: ROLES.ADMIN,
    title: 'Administrator Utama Perguruan',
    belt: 'Sabuk Hijau Strip Hitam (Pengurus Pusat)',
    regNumber: 'TRD-ADM-PST-001',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
  },
};

export function AppProvider({ children }) {
  // Load role from localStorage or default to PUBLIC
  const [role, setRole] = useState(() => {
    return localStorage.getItem('trident_role') || ROLES.PUBLIC;
  });

  const [activeTab, setActiveTab] = useState('visi');
  const [lockedModal, setLockedModal] = useState({ open: false, featureName: '' });

  // Login Modal State
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Admin Verification Code Modal State (for Anggota wanting to act as Penguji)
  const [isAdminCodeModalOpen, setIsAdminCodeModalOpen] = useState(false);

  // OFFLINE & AUTO-SYNC ENGINE STATE
  const [isOnline, setIsOnline] = useState(() => (typeof navigator !== 'undefined' ? navigator.onLine : true));
  const [isSimulatingOffline, setIsSimulatingOffline] = useState(false);
  const [offlineQueue, setOfflineQueue] = useState(() => {
    try {
      const saved = localStorage.getItem('trident_offline_queue');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Data states with LocalStorage persistence
  const [stats, setStats] = useState(() => {
    try {
      const saved = localStorage.getItem('trident_stats');
      return saved ? JSON.parse(saved) : INITIAL_STATS;
    } catch {
      return INITIAL_STATS;
    }
  });

  const [heroData, setHeroData] = useState(() => {
    try {
      const saved = localStorage.getItem('trident_hero');
      return saved ? JSON.parse(saved) : INITIAL_HERO_DATA;
    } catch {
      return INITIAL_HERO_DATA;
    }
  });

  const [trainingGrounds, setTrainingGrounds] = useState(() => {
    try {
      const saved = localStorage.getItem('trident_training_grounds');
      return saved ? JSON.parse(saved) : INITIAL_TRAINING_GROUNDS;
    } catch {
      return INITIAL_TRAINING_GROUNDS;
    }
  });

  const [timeline, setTimeline] = useState(() => {
    try {
      const saved = localStorage.getItem('trident_timeline');
      return saved ? JSON.parse(saved) : INITIAL_TIMELINE;
    } catch {
      return INITIAL_TIMELINE;
    }
  });

  const [pillars, setPillars] = useState(() => {
    try {
      const saved = localStorage.getItem('trident_pillars');
      return saved ? JSON.parse(saved) : INITIAL_PILLARS;
    } catch {
      return INITIAL_PILLARS;
    }
  });

  const [newsList, setNewsList] = useState(INITIAL_NEWS);
  const [achievementsList, setAchievementsList] = useState(INITIAL_ACHIEVEMENTS);
  const [agendaList, setAgendaList] = useState(INITIAL_AGENDAS);
  const [campaignList, setCampaignList] = useState(INITIAL_CAMPAIGNS);

  const [candidatesList, setCandidatesList] = useState(() => {
    try {
      const saved = localStorage.getItem('trident_candidates');
      return saved ? JSON.parse(saved) : INITIAL_CANDIDATES;
    } catch {
      return INITIAL_CANDIDATES;
    }
  });

  // Modal for donation receipt printing
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  // Toast notification
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  // Auto-Sync Function: Processes offline queue when connection returns
  const syncOfflineQueue = (customQueue = null) => {
    const queueToProcess = customQueue || offlineQueue;
    if (!queueToProcess || queueToProcess.length === 0) return;

    setCandidatesList((prev) => {
      let current = [...prev];
      queueToProcess.forEach((item) => {
        current = current.map((c) =>
          c.id === item.candidateId
            ? {
                ...c,
                posScores: item.posScores,
                examinerNotes: item.examinerNotes,
                examinerName: item.examinerName,
                dateExam: item.dateExam || new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
              }
            : c
        );
      });
      localStorage.setItem('trident_candidates', JSON.stringify(current));
      return current;
    });

    const syncedCount = queueToProcess.length;
    setOfflineQueue([]);
    localStorage.removeItem('trident_offline_queue');

    showToast(
      `🟢 Sinyal Terhubung Kembali! ${syncedCount} nilai ujian tersimpan berhasil disinkronisasikan otomatis ke pusat.`,
      'success'
    );
  };

  // Listen to network changes (online / offline)
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (!isSimulatingOffline) {
        syncOfflineQueue();
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      showToast('⚠️ Sinyal internet terputus. Mode Offline otomatis aktif: progres penilaian Anda tetap tersimpan aman di perangkat.', 'warning');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [offlineQueue, isSimulatingOffline]);

  // Toggle simulation of lost signal for easy demo and testing
  const toggleOfflineSimulation = () => {
    setIsSimulatingOffline((prev) => {
      const next = !prev;
      if (next) {
        showToast('🔴 Mode Uji: Simulasi Sinyal Hilang DIAKTIFKAN. Nilai yang Anda input akan ditampung di antrean offline lokal.', 'warning');
      } else {
        showToast('🟢 Mode Uji: Simulasi Sinyal Kembali DINONAKTIFKAN. Memulai sinkronisasi otomatis ke server pusat...', 'success');
        setTimeout(() => {
          syncOfflineQueue();
        }, 600);
      }
      return next;
    });
  };

  // Role switching
  const handleRoleChange = (newRole, bypassCode = false) => {
    if (role === ROLES.MEMBER && newRole === ROLES.EXAMINER && !bypassCode) {
      setIsAdminCodeModalOpen(true);
      return;
    }

    setRole(newRole);
    localStorage.setItem('trident_role', newRole);
    const roleName =
      newRole === ROLES.PUBLIC
        ? 'Tamu Publik'
        : newRole === ROLES.MEMBER
        ? 'Anggota (Ahmad Fauzi)'
        : newRole === ROLES.ADMIN
        ? 'Administrator Pusat'
        : 'Penguji UKT (Master Bambang)';
    showToast(`Beralih peran menjadi: ${roleName}`, 'info');
  };

  // Login handler
  const handleLogin = (targetRole) => {
    setRole(targetRole);
    localStorage.setItem('trident_role', targetRole);
    setIsLoginModalOpen(false);
    const profile = USER_PROFILES[targetRole];
    showToast(`Berhasil Masuk! Selamat datang, ${profile?.name || 'Pengguna'} (${profile?.title || targetRole}).`, 'success');
  };

  // Logout handler
  const handleLogout = () => {
    setRole(ROLES.PUBLIC);
    localStorage.setItem('trident_role', ROLES.PUBLIC);
    showToast('Anda telah keluar dari akun. Fitur dibatasi kembali untuk mode publik.', 'info');
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
        setIsLoginModalOpen(true);
        return false;
      }
    }
    return true;
  };

  // Switch tab with access check
  const navigateToTab = (tabName) => {
    if (['agenda', 'donasi', 'ukt'].includes(tabName) && role === ROLES.PUBLIC) {
      setIsLoginModalOpen(true);
      return;
    }
    setActiveTab(tabName);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Agenda RSVP action
  const handleRsvp = (agendaId, status, reason = '') => {
    if (role === ROLES.PUBLIC) {
      setIsLoginModalOpen(true);
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

  // UKT Candidate Score Update with Offline-First Auto-Save
  const handleUpdateCandidateScores = (candidateId, newPosScores, notes) => {
    const dateExam = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

    // 1. Always update candidate in local state immediately so UI and progress are NEVER lost!
    setCandidatesList((prev) => {
      const updated = prev.map((c) => {
        if (c.id !== candidateId) return c;
        return {
          ...c,
          posScores: newPosScores,
          examinerNotes: notes,
          examinerName: currentUser.name,
          dateExam,
        };
      });
      localStorage.setItem('trident_candidates', JSON.stringify(updated));
      return updated;
    });

    const targetCandidate = candidatesList.find((c) => c.id === candidateId);
    const candidateName = targetCandidate ? targetCandidate.name : 'Peserta UKT';

    // 2. Check if currently offline or in offline simulation mode
    const isCurrentlyOffline = !isOnline || isSimulatingOffline;

    if (isCurrentlyOffline) {
      const queueItem = {
        id: `offline-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        candidateId,
        candidateName,
        posScores: newPosScores,
        examinerNotes: notes,
        examinerName: currentUser.name,
        dateExam,
        timestamp: new Date().toISOString(),
        formattedTime: new Date().toLocaleTimeString('id-ID'),
      };

      setOfflineQueue((prev) => {
        const filtered = prev.filter((item) => item.candidateId !== candidateId);
        const nextQueue = [...filtered, queueItem];
        localStorage.setItem('trident_offline_queue', JSON.stringify(nextQueue));
        return nextQueue;
      });

      showToast(
        `⚠️ Sinyal Hilang! Progres nilai ${candidateName} tersimpan lokal di HP. Nilai otomatis terkirim saat sinyal kembali.`,
        'warning'
      );
    } else {
      showToast(`Nilai UKT ${candidateName} berhasil dikalkulasi & tersinkronisasi ke server!`, 'success');
    }
  };

  // Import Candidates
  const handleImportCandidates = (newCandidates) => {
    setCandidatesList((prev) => {
      const existingIds = new Set(prev.map((c) => c.id));
      const filteredNew = newCandidates.filter((c) => !existingIds.has(c.id));
      const updated = [...filteredNew, ...prev];
      localStorage.setItem('trident_candidates', JSON.stringify(updated));
      return updated;
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
    localStorage.setItem('trident_stats', JSON.stringify(newStats));
    showToast('Statistik perguruan berhasil diperbarui!', 'success');
  };

  // ADMIN CMS MUTATORS (Mengubah isi aplikasi: Pilar Visi Misi, Hero, Info Tempat Latihan, Timeline)
  const handleUpdatePillar = (id, updatedPillar) => {
    setPillars((prev) => {
      const updated = prev.map((p) => (p.id === id ? { ...p, ...updatedPillar } : p));
      localStorage.setItem('trident_pillars', JSON.stringify(updated));
      return updated;
    });
    showToast('Pilar Visi & Misi berhasil diperbarui oleh Administrator!', 'success');
  };

  const handleAddPillar = (newPillar) => {
    setPillars((prev) => {
      const id = Date.now();
      const updated = [...prev, { ...newPillar, id }];
      localStorage.setItem('trident_pillars', JSON.stringify(updated));
      return updated;
    });
    showToast('Pilar Visi & Misi baru berhasil ditambahkan!', 'success');
  };

  const handleDeletePillar = (id) => {
    setPillars((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      localStorage.setItem('trident_pillars', JSON.stringify(updated));
      return updated;
    });
    showToast('Pilar Visi & Misi berhasil dihapus!', 'info');
  };

  const handleUpdateTrainingGround = (id, updatedGround) => {
    setTrainingGrounds((prev) => {
      const updated = prev.map((g) => (g.id === id ? { ...g, ...updatedGround } : g));
      localStorage.setItem('trident_training_grounds', JSON.stringify(updated));
      return updated;
    });
    showToast('Info Tempat Latihan & Kontak Pelatih berhasil diperbarui!', 'success');
  };

  const handleAddTrainingGround = (newGround) => {
    setTrainingGrounds((prev) => {
      const id = `par-${Date.now()}`;
      const updated = [{ ...newGround, id }, ...prev];
      localStorage.setItem('trident_training_grounds', JSON.stringify(updated));
      return updated;
    });
    showToast('Tempat Latihan (PAR) baru berhasil didaftarkan!', 'success');
  };

  const handleDeleteTrainingGround = (id) => {
    setTrainingGrounds((prev) => {
      const updated = prev.filter((g) => g.id !== id);
      localStorage.setItem('trident_training_grounds', JSON.stringify(updated));
      return updated;
    });
    showToast('Tempat Latihan berhasil dihapus dari daftar!', 'info');
  };

  const handleUpdateHero = (newHero) => {
    setHeroData(newHero);
    localStorage.setItem('trident_hero', JSON.stringify(newHero));
    showToast('Slogan & Teks Hero Padepokan berhasil diperbarui!', 'success');
  };

  const handleUpdateTimeline = (newTimeline) => {
    setTimeline(newTimeline);
    localStorage.setItem('trident_timeline', JSON.stringify(newTimeline));
    showToast('Sejarah Perjalanan Perguruan berhasil diperbarui!', 'success');
  };

  return (
    <AppContext.Provider
      value={{
        role,
        ROLES,
        handleRoleChange,
        handleLogin,
        handleLogout,
        isLoginModalOpen,
        setIsLoginModalOpen,
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
        heroData,
        handleUpdateHero,
        trainingGrounds,
        handleUpdateTrainingGround,
        handleAddTrainingGround,
        handleDeleteTrainingGround,
        timeline,
        handleUpdateTimeline,
        pillars,
        handleUpdatePillar,
        handleAddPillar,
        handleDeletePillar,
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
        // Offline & Auto-sync Engine
        isOnline,
        isSimulatingOffline,
        toggleOfflineSimulation,
        offlineQueue,
        syncOfflineQueue,
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
