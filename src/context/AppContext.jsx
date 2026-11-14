import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_CAMPAIGNS, INITIAL_CANDIDATES } from '../data/mockData';
import { INITIAL_TIMELINE } from '../data/static';
import { supabase } from '../lib/supabase';
import * as api from '../lib/api';

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

  // Data states: stats/hero/pillars/grounds/news/achievements/agendas come from Supabase; campaigns & candidates stay mock until Tasks 8-9
  const [stats, setStats] = useState({ activeMembers: 0, medalsCount: 0, padepokanBranches: 0, uktPassRate: 0, masterCouncil: 0 });
  const [heroData, setHeroData] = useState({});
  const [trainingGrounds, setTrainingGrounds] = useState([]);
  const timeline = INITIAL_TIMELINE;
  const [pillars, setPillars] = useState([]);
  const [newsList, setNewsList] = useState([]);
  const [achievementsList, setAchievementsList] = useState([]);
  const [agendaList, setAgendaList] = useState([]);
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
    api.getProfile(userId)
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

  const loaders = {
    news: () => api.listNews().then(setNewsList),
    achievements: () => api.listAchievements().then(setAchievementsList),
    agendas: () => (userId ? api.listAgendas().then(setAgendaList) : setAgendaList([])),
    stats: () => api.getSiteStats().then(setStats),
    content: () => api.getSiteContent().then((c) => setHeroData(c.heroData)),
    pillars: () => api.listPillars().then(setPillars),
    grounds: () => api.listTrainingGrounds().then(setTrainingGrounds),
  };
  const refresh = async () => {
    const results = await Promise.allSettled(Object.values(loaders).map((load) => load()));
    if (results.some((r) => r.status === 'rejected')) showToast('Sebagian data gagal dimuat', 'error');
  };

  // Load on mount and whenever the signed-in user changes (agendas need a session).
  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // Run an api call, toast the outcome, then reload the affected list.
  const mutate = async (call, list, okMsg, failMsg, okType = 'success') => {
    try {
      await call();
    } catch (e) {
      console.error(e);
      showToast(e.message === api.NOT_ALLOWED ? e.message : failMsg, 'error');
      return false;
    }
    showToast(okMsg, okType);
    try {
      await loaders[list]();
    } catch {
      showToast('Gagal menyegarkan data', 'error');
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
    return mutate(
      () => api.upsertRsvp(agendaId, status, reason, currentUser?.name),
      'agendas',
      status === 'hadir' ? 'Konfirmasi HADIR berhasil dicatat pada agenda!' : 'Konfirmasi IZIN berhasil dikirim beserta keterangan.',
      'Gagal menyimpan konfirmasi kehadiran',
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
  const handleAddNews = (n) =>
    mutate(() => api.addNews({ ...n, author: currentUser?.name }), 'news', 'Berita perguruan baru berhasil dipublikasikan!', 'Gagal menerbitkan berita');
  const handleDeleteNews = (id) => mutate(() => api.deleteNews(id), 'news', 'Berita berhasil dihapus.', 'Gagal menghapus berita', 'info');

  const handleAddAchievement = (a) =>
    mutate(() => api.addAchievement(a), 'achievements', 'Prestasi atlet berhasil ditambahkan ke etalase!', 'Gagal menambahkan prestasi');
  const handleDeleteAchievement = (id) =>
    mutate(() => api.deleteAchievement(id), 'achievements', 'Prestasi berhasil dihapus.', 'Gagal menghapus prestasi', 'info');

  const handleAddAgenda = (a) =>
    mutate(() => api.addAgenda(a), 'agendas', 'Agenda kegiatan baru berhasil dijadwalkan!', 'Gagal menjadwalkan agenda');
  const handleDeleteAgenda = (id) => mutate(() => api.deleteAgenda(id), 'agendas', 'Agenda berhasil dihapus.', 'Gagal menghapus agenda', 'info');

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

  const handleUpdateStats = (n) =>
    mutate(() => api.updateSiteStats(n), 'stats', 'Statistik perguruan berhasil diperbarui!', 'Gagal memperbarui statistik');

  // ADMIN CMS MUTATORS (Pilar Visi Misi, Hero, Info Tempat Latihan)
  const handleUpdatePillar = (id, p) =>
    mutate(() => api.updatePillar(id, p), 'pillars', 'Pilar Visi & Misi berhasil diperbarui oleh Administrator!', 'Gagal memperbarui pilar');
  const handleAddPillar = (p) =>
    mutate(() => api.addPillar(p), 'pillars', 'Pilar Visi & Misi baru berhasil ditambahkan!', 'Gagal menambahkan pilar');
  const handleDeletePillar = (id) =>
    mutate(() => api.deletePillar(id), 'pillars', 'Pilar Visi & Misi berhasil dihapus!', 'Gagal menghapus pilar', 'info');

  const handleUpdateTrainingGround = (id, g) =>
    mutate(() => api.updateTrainingGround(id, g), 'grounds', 'Info Tempat Latihan & Kontak Pelatih berhasil diperbarui!', 'Gagal memperbarui tempat latihan');
  const handleAddTrainingGround = (g) =>
    mutate(() => api.addTrainingGround(g), 'grounds', 'Tempat Latihan (PAR) baru berhasil didaftarkan!', 'Gagal menambahkan tempat latihan');
  const handleDeleteTrainingGround = (id) =>
    mutate(() => api.deleteTrainingGround(id), 'grounds', 'Tempat Latihan berhasil dihapus dari daftar!', 'Gagal menghapus tempat latihan', 'info');

  const handleUpdateHero = (h) =>
    mutate(() => api.updateSiteContent({ heroData: h }), 'content', 'Slogan & Teks Hero Padepokan berhasil diperbarui!', 'Gagal memperbarui teks hero');

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
        handleDeleteNews,
        achievementsList,
        handleAddAchievement,
        handleDeleteAchievement,
        agendaList,
        handleAddAgenda,
        handleDeleteAgenda,
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
