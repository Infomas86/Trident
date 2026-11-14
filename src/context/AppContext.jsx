import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  INITIAL_STATS,
  INITIAL_PILLARS,
  INITIAL_NEWS,
  INITIAL_ACHIEVEMENTS,
  INITIAL_AGENDAS,
  INITIAL_CAMPAIGNS,
  INITIAL_CANDIDATES,
  INITIAL_HERO_DATA,
  INITIAL_TRAINING_GROUNDS,
} from '../data/mockData';
import { INITIAL_TIMELINE } from '../data/static';
import { supabase } from '../lib/supabase';
import { getProfile } from '../lib/api';

const AppContext = createContext();

export const ROLES = {
  PUBLIC: 'public',
  MEMBER: 'anggota',
  EXAMINER: 'penguji',
  ADMIN: 'admin',
};

export function AppProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loadedProfile, setProfile] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [failedId, setFailedId] = useState(null);

  const [activeTab, setActiveTab] = useState('visi');
  const [lockedModal, setLockedModal] = useState({ open: false, featureName: '' });
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Data states (still mock until Tasks 7-9)
  const [stats, setStats] = useState(INITIAL_STATS);

  const [heroData, setHeroData] = useState(INITIAL_HERO_DATA);

  const [trainingGrounds, setTrainingGrounds] = useState(INITIAL_TRAINING_GROUNDS);

  const timeline = INITIAL_TIMELINE;

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
    }, 4500);
  };

  // Session + profile
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setInitializing(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => sub.subscription.unsubscribe();
  }, []);

  const userId = session?.user?.id;
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    getProfile(userId)
      .then((p) => !cancelled && setProfile(p))
      .catch(() => {
        if (cancelled) return;
        setFailedId(userId);
        showToast('Gagal memuat profil', 'error');
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  // Only trust a profile that belongs to the current session (avoids showing a previous account's role).
  const profile = loadedProfile && loadedProfile.id === userId ? loadedProfile : null;
  const authLoading = initializing || (!!userId && !profile && failedId !== userId);
  const role = profile?.role ?? ROLES.PUBLIC;
  const isStaff = role === ROLES.EXAMINER || role === ROLES.ADMIN;
  const isAdmin = role === ROLES.ADMIN;
  const currentUser = profile
    ? {
        id: profile.id,
        name: profile.full_name,
        email: session?.user?.email,
        role: profile.role,
        belt: profile.belt,
        branch: profile.branch,
        regNumber: profile.reg_number,
        avatar: profile.photo_url,
      }
    : null;

  const signIn = async (email, password) => {
    let error;
    try {
      ({ error } = await supabase.auth.signInWithPassword({ email, password }));
    } catch {
      showToast('Gagal masuk, periksa koneksi', 'error');
      return false;
    }
    if (error) {
      showToast('Email atau kata sandi salah', 'error');
      return false;
    }
    setIsLoginModalOpen(false);
    showToast('Berhasil masuk. Selamat datang!', 'success');
    return true;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    showToast('Anda telah keluar dari akun.', 'info');
  };

  // Lists are still local mock data; Tasks 7-9 reload them from Supabase here.
  const refresh = async () => {};

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
        const existingIdx = currentAttendees.findIndex((a) => a.id === currentUser?.id);

        let updatedAttendees;
        if (existingIdx >= 0) {
          updatedAttendees = [...currentAttendees];
          updatedAttendees[existingIdx] = {
            ...updatedAttendees[existingIdx],
            name: currentUser?.name,
            role: currentUser?.role === ROLES.MEMBER ? 'Anggota' : 'Penguji',
            status,
            reason: status === 'izin' ? reason : undefined,
          };
        } else {
          updatedAttendees = [
            ...currentAttendees,
            {
              id: currentUser?.id,
              name: currentUser?.name,
              role: currentUser?.role === ROLES.MEMBER ? 'Anggota' : 'Penguji',
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
      donorName: donorName || currentUser?.name || 'Hamba Allah',
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

  // UKT Candidate Score Update
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
          examinerName: currentUser?.name,
          dateExam,
        };
      });
      return updated;
    });

    const targetCandidate = candidatesList.find((c) => c.id === candidateId);
    const candidateName = targetCandidate ? targetCandidate.name : 'Peserta UKT';

    showToast(`Nilai UKT ${candidateName} berhasil dikalkulasi!`, 'success');
  };

  // Import Candidates
  const handleImportCandidates = (newCandidates) => {
    setCandidatesList((prev) => {
      const existingIds = new Set(prev.map((c) => c.id));
      const filteredNew = newCandidates.filter((c) => !existingIds.has(c.id));
      const updated = [...filteredNew, ...prev];
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
        author: currentUser?.name,
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
        attendees: [{ id: currentUser?.id, name: currentUser?.name, role: 'Penguji', status: 'hadir' }],
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

  // ADMIN CMS MUTATORS (Mengubah isi aplikasi: Pilar Visi Misi, Hero, Info Tempat Latihan, Timeline)
  const handleUpdatePillar = (id, updatedPillar) => {
    setPillars((prev) => {
      const updated = prev.map((p) => (p.id === id ? { ...p, ...updatedPillar } : p));
      return updated;
    });
    showToast('Pilar Visi & Misi berhasil diperbarui oleh Administrator!', 'success');
  };

  const handleAddPillar = (newPillar) => {
    setPillars((prev) => {
      const id = Date.now();
      const updated = [...prev, { ...newPillar, id }];
      return updated;
    });
    showToast('Pilar Visi & Misi baru berhasil ditambahkan!', 'success');
  };

  const handleDeletePillar = (id) => {
    setPillars((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      return updated;
    });
    showToast('Pilar Visi & Misi berhasil dihapus!', 'info');
  };

  const handleUpdateTrainingGround = (id, updatedGround) => {
    setTrainingGrounds((prev) => {
      const updated = prev.map((g) => (g.id === id ? { ...g, ...updatedGround } : g));
      return updated;
    });
    showToast('Info Tempat Latihan & Kontak Pelatih berhasil diperbarui!', 'success');
  };

  const handleAddTrainingGround = (newGround) => {
    setTrainingGrounds((prev) => {
      const id = `par-${Date.now()}`;
      const updated = [{ ...newGround, id }, ...prev];
      return updated;
    });
    showToast('Tempat Latihan (PAR) baru berhasil didaftarkan!', 'success');
  };

  const handleDeleteTrainingGround = (id) => {
    setTrainingGrounds((prev) => {
      const updated = prev.filter((g) => g.id !== id);
      return updated;
    });
    showToast('Tempat Latihan berhasil dihapus dari daftar!', 'info');
  };

  const handleUpdateHero = (newHero) => {
    setHeroData(newHero);
    showToast('Slogan & Teks Hero Padepokan berhasil diperbarui!', 'success');
  };

  return (
    <AppContext.Provider
      value={{
        role,
        ROLES,
        isStaff,
        isAdmin,
        authLoading,
        signIn,
        signOut,
        refresh,
        isLoginModalOpen,
        setIsLoginModalOpen,
        currentUser,
        activeTab,
        setActiveTab,
        navigateToTab,
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
