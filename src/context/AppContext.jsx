import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { INITIAL_TIMELINE } from '../data/static';
import { supabase } from '../lib/supabase';
import * as api from '../lib/api';
import { enqueueForUser, withoutUser, syncQueue, loadQueue, saveQueue, loadConflicts, saveConflicts, loadCache, saveCache, clearCaches, overlayQueued, mineScores, mergeKeys, storedAuthUserId } from '../lib/offline';

const PROFILE_TIMEOUT_MS = 8000;

const AppContext = createContext();

export const ROLES = {
  PUBLIC: 'public',
  MEMBER: 'anggota',
  EXAMINER: 'penguji',
  ADMIN: 'admin',
};

export function AppProvider({ children }) {
  const [session, setSession] = useState(null);
  // Offline fallback: user id of the stored session when auth-js can't refresh it (see session effect).
  const [offlineUid, setOfflineUid] = useState(null);
  const [loadedProfile, setProfile] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [failedId, setFailedId] = useState(null);

  const [activeTab, setActiveTab] = useState('visi');
  const [lockedModal, setLockedModal] = useState({ open: false, featureName: '' });
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Data states: stats/hero/pillars/grounds/news/achievements/agendas come from Supabase; campaigns/donations from Supabase
  const [stats, setStats] = useState({ activeMembers: 0, medalsCount: 0, padepokanBranches: 0, uktPassRate: 0, masterCouncil: 0 });
  const [heroData, setHeroData] = useState({});
  const [trainingGrounds, setTrainingGrounds] = useState([]);
  const timeline = INITIAL_TIMELINE;
  const [pillars, setPillars] = useState([]);
  const [newsList, setNewsList] = useState([]);
  const [achievementsList, setAchievementsList] = useState([]);
  const [agendaList, setAgendaList] = useState([]);
  const [campaignList, setCampaignList] = useState([]);
  const [myDonations, setMyDonations] = useState([]);
  const [pendingDonations, setPendingDonations] = useState([]);
  const [siteContent, setSiteContent] = useState({});

  const [candidatesList, setCandidatesList] = useState([]);

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

  // Offline state: online flag, persisted score queue, conflicts awaiting the examiner's choice
  const [isOnline, setIsOnline] = useState(typeof navigator === 'undefined' ? true : navigator.onLine);
  const [offlineQueue, setOfflineQueueState] = useState(loadQueue);
  const [allConflicts, setAllConflictsState] = useState(loadConflicts);
  const queueRef = useRef(offlineQueue);
  const conflictsRef = useRef(allConflicts);
  const syncing = useRef(false);
  const syncRef = useRef(() => {});
  const setOfflineQueue = (q) => {
    queueRef.current = q;
    setOfflineQueueState(q);
    saveQueue(q);
  };

  // Persist like the queue; accepts a value or an updater.
  const setAllConflicts = (u) => {
    const next = typeof u === 'function' ? u(conflictsRef.current) : u;
    conflictsRef.current = next;
    setAllConflictsState(next);
    saveConflicts(next);
  };

  useEffect(() => {
    const on = () => {
      setIsOnline(true);
      syncRef.current();
    };
    const off = () => setIsOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  // Session + profile
  useEffect(() => {
    // Offline with an expired access token auth-js returns no session but keeps it stored:
    // stay signed in on the cached profile so the examiner can keep scoring.
    const fallback = () => {
      if (navigator.onLine) return;
      const uid = storedAuthUserId(supabase.auth.storageKey);
      if (uid && loadCache('trident_cache_profile')?.id === uid) setOfflineUid(uid);
    };
    supabase.auth
      .getSession()
      .then(({ data }) => {
        setSession(data.session);
        if (!data.session) fallback();
      })
      .catch(fallback)
      .finally(() => setInitializing(false));
    const { data: sub } = supabase.auth.onAuthStateChange((event, next) => {
      setSession(next);
      if (next || event === 'SIGNED_OUT') setOfflineUid(null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // Back online in the fallback: get the real session back, or sign out cleanly if it was revoked.
  useEffect(() => {
    if (!isOnline || !offlineUid) return;
    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (data.session) return setSession(data.session);
        if (storedAuthUserId(supabase.auth.storageKey)) return; // retryable failure: auth-js keeps refreshing (TOKEN_REFRESHED)
        setOfflineUid(null);
        showToast('Sesi berakhir, silakan masuk lagi. Nilai yang belum terkirim tetap tersimpan.', 'error');
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnline, offlineUid]);

  const userId = session?.user?.id ?? offlineUid;
  // Only this user's items are shown or synced; other users' items wait for their next sign-in.
  const offlineQueueMine = offlineQueue.filter((i) => i.userId === userId);
  const conflicts = allConflicts.filter((c) => c.userId === userId);
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    setFailedId(null);
    const timeout = new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), PROFILE_TIMEOUT_MS));
    Promise.race([api.getProfile(userId), timeout])
      .then((p) => {
        if (cancelled) return;
        saveCache('trident_cache_profile', p);
        setProfile(p);
      })
      .catch(() => {
        if (cancelled) return;
        const cached = loadCache('trident_cache_profile');
        if (cached?.id === userId) {
          setProfile(cached);
          return;
        }
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
    const pending = queueRef.current.filter((i) => i.userId === userId).length + conflictsRef.current.filter((i) => i.userId === userId).length;
    if (pending && !window.confirm(`Ada ${pending} nilai belum terkirim. Keluar dan buang?`)) return;
    const { error } = await supabase.auth.signOut({ scope: 'local' });
    // 'local' drops this device's session even offline; the error is then only the failed revoke request.
    if (error && storedAuthUserId(supabase.auth.storageKey)) {
      showToast('Gagal keluar, coba lagi', 'error');
      return;
    }
    setOfflineUid(null);
    clearCaches();
    setOfflineQueue(withoutUser(queueRef.current, userId));
    setAllConflicts(withoutUser(conflictsRef.current, userId));
    showToast('Anda telah keluar dari akun.', 'info');
  };

  const loaders = {
    news: () => api.listNews().then(setNewsList),
    achievements: () => api.listAchievements().then(setAchievementsList),
    agendas: () => (userId ? api.listAgendas().then(setAgendaList) : setAgendaList([])),
    stats: () => api.getSiteStats().then(setStats),
    content: () =>
      api.getSiteContent().then((c) => {
        setHeroData(c.heroData);
        setSiteContent(c);
      }),
    campaigns: () => (userId ? api.listCampaigns().then(setCampaignList) : setCampaignList([])),
    myDonations: () => (userId ? api.listMyDonations().then(setMyDonations) : setMyDonations([])),
    pendingDonations: () => (isAdmin ? api.listPendingDonations().then(setPendingDonations) : setPendingDonations([])),
    pillars: () => api.listPillars().then(setPillars),
    grounds: () => api.listTrainingGrounds().then(setTrainingGrounds),
    candidates: async () => {
      if (!userId) return setCandidatesList([]);
      try {
        const list = await api.listCandidates();
        if (isStaff) saveCache('trident_cache_candidates', list);
        setCandidatesList(list);
      } catch (e) {
        const cached = isStaff ? loadCache('trident_cache_candidates') : null;
        if (!cached) throw e;
        setCandidatesList(cached);
      }
    },
  };
  const refresh = async () => {
    const results = await Promise.allSettled(Object.values(loaders).map((load) => load()));
    if (results.some((r) => r.status === 'rejected')) showToast('Sebagian data gagal dimuat', 'error');
  };

  // Load on mount and whenever the signed-in user changes (agendas need a session).
  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, role, !!session]);

  // Run an api call, toast the outcome, then reload the affected list.
  const mutate = async (call, list, okMsg, failMsg, okType = 'success') => {
    try {
      await call();
    } catch (e) {
      console.error(e);
      showToast(e.message === api.NOT_ALLOWED || e instanceof api.UserError ? e.message : failMsg, 'error');
      return false;
    }
    showToast(okMsg, okType);
    try {
      await Promise.all([].concat(list).map((l) => loaders[l]()));
    } catch {
      showToast('Gagal menyegarkan data', 'error');
    }
    return true;
  };

  // Leave the admin-only tab when admin rights go away (logout, role change).
  useEffect(() => {
    if ((activeTab === 'verifikasi' || activeTab === 'akun') && !isAdmin) setActiveTab('visi');
  }, [activeTab, isAdmin]);

  // Switch tab with access check
  const navigateToTab = (tabName) => {
    if (['agenda', 'donasi', 'ukt'].includes(tabName) && role === ROLES.PUBLIC) {
      setIsLoginModalOpen(true);
      return;
    }
    if ((tabName === 'verifikasi' || tabName === 'akun') && !isAdmin) return;
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

  // Donation: proof is uploaded, donation stays pending until an admin accepts it (no receipt yet).
  const handleDonate = (campaignId, { amount, donorName, message, paymentMethod, proofFile }) =>
    mutate(
      () => api.submitDonation({ campaignId, amount, donorName: donorName || currentUser?.name || 'Hamba Allah', message, paymentMethod, proofFile }),
      ['myDonations', 'pendingDonations'],
      'Donasi terkirim, menunggu verifikasi admin',
      'Gagal mengirim donasi',
    );

  const handleVerifyDonation = (id, status) =>
    mutate(
      () => api.setDonationStatus(id, status),
      ['pendingDonations', 'campaigns', 'myDonations'],
      status === 'accepted' ? 'Donasi diterima.' : 'Donasi ditolak.',
      'Gagal memverifikasi donasi',
      status === 'accepted' ? 'success' : 'info',
    );

  const refreshCandidates = () => loaders.candidates().catch(() => showToast('Gagal menyegarkan data', 'error'));

  // Send the whole queue; one run at a time. Network errors keep items queued, conflicts go to the panel.
  const syncNow = async () => {
    const snapshot = queueRef.current.filter((i) => i.userId === userId);
    // needs a real session: without one (offline fallback) saves would run as a guest and look like conflicts
    if (syncing.current || !session || !navigator.onLine || !snapshot.length) return;
    syncing.current = true;
    try {
      const r = await syncQueue(
        snapshot,
        (item) => api.saveCandidateScores(item.candidateId, item.posScores, item.notes, { baseUpdatedAt: item.baseUpdatedAt }),
        { online: () => navigator.onLine },
      );
      // others' items untouched; mine: replaced by the remaining version (may be marked failed), new/changed-while-syncing kept
      const sent = (i) => snapshot.some((s) => s.candidateId === i.candidateId && s.savedAt === i.savedAt);
      setOfflineQueue(
        queueRef.current.flatMap((i) => (i.userId !== userId || !sent(i) ? [i] : r.remaining.filter((x) => x.candidateId === i.candidateId))),
      );
      if (r.conflicts.length) {
        setAllConflicts((prev) => [...prev.filter((c) => c.userId !== userId || !r.conflicts.some((x) => x.candidateId === c.candidateId)), ...r.conflicts]);
        showToast(`${r.conflicts.length} nilai bentrok dengan penguji lain, pilih di panel Nilai bentrok`, 'error');
      }
      if (r.synced) showToast(`${r.synced} nilai terkirim`, 'success');
      if (r.synced || r.conflicts.length) await refreshCandidates();
    } finally {
      syncing.current = false;
    }
  };
  syncRef.current = syncNow;

  // Sync when the app opens signed in (profile ready).
  useEffect(() => {
    if (profile && session) syncRef.current();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id, !!session]);

  const resolveConflict = async (candidateId, choice) => {
    const item = conflicts.find((c) => c.candidateId === candidateId);
    if (!item) return;
    if (choice === 'mine') {
      if (!session) {
        showToast('Gagal mengirim nilai, periksa koneksi', 'error');
        return;
      }
      let r;
      try {
        if (item.posKeys == null) {
          // full evaluation: my whole sheet wins
          r = await api.saveCandidateScores(item.candidateId, item.posScores, item.notes, { baseUpdatedAt: item.baseUpdatedAt, force: true });
        } else {
          // quick-pos: put only my posts into the fresh row, guarded by its updated_at
          const fresh = await api.getCandidate(item.candidateId);
          r = fresh ? await api.saveCandidateScores(item.candidateId, mineScores(fresh, item), fresh.examinerNotes, { baseUpdatedAt: fresh.updatedAt }) : 'gone';
        }
      } catch (e) {
        console.error(e);
        showToast('Gagal mengirim nilai, periksa koneksi', 'error');
        return;
      }
      if (r === 'conflict') {
        showToast('Nilai baru saja diubah lagi oleh penguji lain, coba lagi', 'error');
        refreshCandidates();
        return;
      }
      if (r !== 'ok') {
        showToast('Nilai tidak bisa dikirim (ditolak server atau peserta dihapus)', 'error');
        return;
      }
      showToast(`Nilai ${item.candidateName ?? 'peserta'} dikirim`, 'success');
    }
    setAllConflicts((prev) => prev.filter((c) => c.userId !== userId || c.candidateId !== candidateId));
    refreshCandidates();
  };

  // Drop a stuck queued item (after confirm).
  const discardQueued = (candidateId) => {
    if (!window.confirm('Buang nilai yang belum terkirim ini?')) return;
    setOfflineQueue(queueRef.current.filter((i) => i.userId !== userId || i.candidateId !== candidateId));
  };

  // UKT Candidate Score Update. baseUpdatedAt = updatedAt of the snapshot the examiner edited.
  // posKeys = posts changed (quick-pos), null = full evaluation. newPosScores already includes my queued posts.
  // Always resolves true: the score is saved on the server, queued on the phone, or parked as a conflict.
  const handleUpdateCandidateScores = async (candidateId, newPosScores, notes, baseUpdatedAt, posKeys = null) => {
    const target = candidatesList.find((c) => c.id === candidateId);
    const queued = offlineQueueMine.find((q) => q.candidateId === candidateId);
    const item = {
      userId, candidateId, candidateName: target?.name, posScores: newPosScores, notes, baseUpdatedAt,
      posKeys: queued ? mergeKeys(queued.posKeys, posKeys) : posKeys, savedAt: new Date().toISOString(),
    };
    let result;
    if (navigator.onLine && session) {
      try {
        result = await api.saveCandidateScores(candidateId, newPosScores, notes, { baseUpdatedAt });
      } catch (e) {
        console.error(e);
      }
    }
    if (!result) {
      setOfflineQueue(enqueueForUser(queueRef.current, userId, item));
      showToast('Disimpan di HP ini, dikirim saat sinyal kembali', 'info');
      return true;
    }
    setOfflineQueue(queueRef.current.filter((q) => q.userId !== userId || q.candidateId !== candidateId));
    setAllConflicts((prev) => prev.filter((c) => c.userId !== userId || c.candidateId !== candidateId));
    if (result === 'conflict') {
      setAllConflicts((prev) => [...prev, item]);
      showToast('Nilai sudah diubah penguji lain, pilih di panel Nilai bentrok', 'error');
      refreshCandidates();
      return true;
    }
    showToast(`Nilai UKT ${target?.name ?? 'Peserta UKT'} berhasil disimpan!`, 'success');
    refreshCandidates();
    return true;
  };

  // Import Candidates (rows = CandidateInput[] from parseCandidatesCsv)
  const handleImportCandidates = async (rows) => {
    let count;
    try {
      count = await api.upsertCandidates(rows);
    } catch (e) {
      console.error(e);
      showToast(e.message === api.NOT_ALLOWED ? e.message : 'Gagal mengimpor peserta', 'error');
      return false;
    }
    showToast(`Berhasil mengimpor ${count} peserta Ujian Kenaikan Tingkat!`, 'success');
    loaders.candidates().catch(() => showToast('Gagal menyegarkan data', 'error'));
    return true;
  };

  const handleDeleteCandidate = (id) =>
    mutate(() => api.deleteCandidate(id), 'candidates', 'Peserta berhasil dihapus.', 'Gagal menghapus peserta', 'info');

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

  const handleAddCampaign = (c) =>
    mutate(() => api.addCampaign(c), 'campaigns', 'Program donasi padepokan baru berhasil diluncurkan!', 'Gagal membuat program donasi');
  const handleUpdateCampaign = (id, c) =>
    mutate(() => api.updateCampaign(id, c), 'campaigns', 'Program donasi berhasil diperbarui.', 'Gagal memperbarui program donasi');
  const handleDeleteCampaign = (id) =>
    mutate(() => api.deleteCampaign(id), 'campaigns', 'Program donasi berhasil dihapus.', 'Gagal menghapus program donasi', 'info');

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

  const handleUpdateSiteContent = (patch, okMsg = 'Konten situs berhasil diperbarui!') =>
    mutate(() => api.updateSiteContent(patch), 'content', okMsg, 'Gagal memperbarui konten situs');
  const handleUpdateHero = (h) =>
    handleUpdateSiteContent({ heroData: h }, 'Slogan & Teks Hero Padepokan berhasil diperbarui!');

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
        handleUpdateCampaign,
        handleDeleteCampaign,
        handleDonate,
        myDonations,
        pendingDonations,
        handleVerifyDonation,
        siteContent,
        handleUpdateSiteContent,
        candidatesList: overlayQueued(candidatesList, offlineQueueMine),
        serverCandidatesList: candidatesList,
        handleUpdateCandidateScores,
        isOnline,
        offlineQueue: offlineQueueMine,
        conflicts,
        discardQueued,
        syncNow,
        resolveConflict,
        handleImportCandidates,
        handleDeleteCandidate,
        myCandidate: candidatesList.find((c) => c.userId === currentUser?.id) ?? null,
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
