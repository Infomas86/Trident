import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { memoClear } from '../lib/memo';
import { isTabEnabled } from '../config';
import { ttlGet, ttlSet } from '../lib/ttlCache';
import * as api from '../lib/api';
import { withoutUser, loadCache, saveCache, clearCaches, storedAuthUserId, loadPredikatQueue, savePredikatQueue, enqueuePredikat, removePredikatItem } from '../lib/offline';

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
  const [profileVersion, setProfileVersion] = useState(0); // bump to re-fetch the profile (e.g. after role change)

  const [activeTab, setActiveTab] = useState('visi');
  const [lockedModal, setLockedModal] = useState({ open: false, featureName: '' });
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Data states: stats/hero/pillars/grounds/news/achievements/agendas come from Supabase; campaigns/donations from Supabase
  const [stats, setStats] = useState({ activeMembers: 0, medalsCount: 0, padepokanBranches: 0, uktPassRate: 0, masterCouncil: 0 });
  const [heroData, setHeroData] = useState({});
  const [trainingGrounds, setTrainingGrounds] = useState([]);
  const [trainingUnits, setTrainingUnits] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [pillars, setPillars] = useState([]);
  const [newsList, setNewsList] = useState([]);
  const [achievementsList, setAchievementsList] = useState([]);
  const [agendaList, setAgendaList] = useState([]);
  const [campaignList, setCampaignList] = useState([]);
  const [myDonations, setMyDonations] = useState([]);
  const [pendingDonations, setPendingDonations] = useState([]);
  const [siteContent, setSiteContent] = useState({});
  const [officials, setOfficials] = useState([]);

  const [candidatesList, setCandidatesList] = useState([]);
  // UKT events visible to this user (own-PAC admin, pusat admin, or joined examiner) and the one being worked on.
  const [uktEvents, setUktEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [myResult, setMyResult] = useState(null); // the signed-in member's own UKT row, if any

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

  // Offline state: online flag and the persisted predikat queue
  const [isOnline, setIsOnline] = useState(typeof navigator === 'undefined' ? true : navigator.onLine);
  const [predikatQueue, setPredikatQueueState] = useState(loadPredikatQueue);
  const predikatQueueRef = useRef(predikatQueue);
  const syncingPredikat = useRef(false);
  const syncPredikatRef = useRef(() => {});
  const setPredikatQueue = (q) => {
    predikatQueueRef.current = q;
    setPredikatQueueState(q);
    savePredikatQueue(q);
  };

  useEffect(() => {
    const on = () => {
      setIsOnline(true);
      syncPredikatRef.current();
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
  const predikatQueueMine = predikatQueue.filter((i) => i.userId === userId);
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
  }, [userId, profileVersion]);

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
        isSuper: profile.is_super === true,
        mustChangePassword: profile.must_change_password === true,
        belt: profile.belt,
        branch: profile.branch,
        regNumber: profile.reg_number,
        pac: profile.pac,
        avatar: profile.photo_url,
      }
    : null;

  const changeOwnPassword = async (password) => {
    await api.changeOwnPassword(password);
    setProfile((p) => (p ? { ...p, must_change_password: false } : p));
    showToast('Sandi berhasil diganti', 'success');
  };

  const signIn = async (email, password, captchaToken) => {
    const r = await api.signIn(email, password, captchaToken);
    if (r === 'locked') {
      showToast('Terlalu banyak percobaan gagal untuk akun ini. Coba lagi dalam 15 menit.', 'error');
      return false;
    }
    if (r === 'captcha') {
      showToast('Verifikasi gagal, muat ulang halaman lalu coba lagi', 'error');
      return false;
    }
    if (r === 'network_error') {
      showToast('Gagal masuk, periksa koneksi', 'error');
      return false;
    }
    if (r === 'unconfirmed') {
      showToast('Email belum dikonfirmasi. Cek email Anda dan klik link konfirmasi sebelum masuk.', 'error');
      return false;
    }
    if (r !== true) {
      showToast('Email atau kata sandi salah', 'error');
      return false;
    }
    setIsLoginModalOpen(false);
    showToast('Berhasil masuk. Selamat datang!', 'success');
    return true;
  };

  // Self sign-up always creates an anggota account.
  const signUp = async ({ fullName, email, password, regCode, captchaToken }) => {
    try {
      const { session: s } = await api.signUp(email, password, fullName, regCode, captchaToken);
      showToast(s ? 'Akun berhasil dibuat. Selamat datang!' : 'Pendaftaran berhasil. Cek email Anda dan klik link konfirmasi sebelum bisa masuk.', 'success');
      if (s) setIsLoginModalOpen(false);
      return true;
    } catch (e) {
      console.error(e);
      showToast(e instanceof api.UserError ? e.message : 'Gagal mendaftar, periksa koneksi', 'error');
      return false;
    }
  };

  // A signed-in user joins one UKT as examiner with that event's code from its PAC admin.
  const joinUktByCode = async (code) => {
    let eventId;
    try {
      eventId = await api.joinUktByCode(code);
    } catch (e) {
      console.error(e);
      showToast(e instanceof api.UserError ? e.message : 'Gagal memverifikasi kode, periksa koneksi', 'error');
      return false;
    }
    await loaders.events().catch(() => {});
    setSelectedEventId(eventId);
    showToast('Kode valid. Anda menjadi penguji untuk UKT ini.', 'success');
    return true;
  };

  const handleCreateUktEvent = async (input) => {
    try {
      const { id } = await api.createUktEvent({ ...input, pac: profile?.pac });
      await loaders.events();
      setSelectedEventId(id);
      showToast('UKT baru berhasil dibuat. Bagikan kode ke para penguji.', 'success');
      return true;
    } catch (e) {
      console.error(e);
      showToast('Gagal membuat UKT', 'error');
      return false;
    }
  };
  const handleRegenerateEventCode = (id) =>
    mutate(() => api.regenerateEventCode(id), 'events', 'Kode baru dibuat. Kode lama tidak berlaku lagi.', 'Gagal membuat kode baru');
  const handleDeleteUktEvent = (id) =>
    mutate(() => api.deleteUktEvent(id), 'events', 'UKT dihapus beserta seluruh pesertanya.', 'Gagal menghapus UKT', 'info');

  const signOut = async () => {
    const pending = predikatQueueRef.current.filter((i) => i.userId === userId).length;
    if (pending && !window.confirm(`Ada ${pending} nilai belum terkirim. Keluar dan buang?`)) return;
    const { error } = await supabase.auth.signOut({ scope: 'local' });
    // 'local' drops this device's session even offline; the error is then only the failed revoke request.
    if (error && storedAuthUserId(supabase.auth.storageKey)) {
      showToast('Gagal keluar, coba lagi', 'error');
      return;
    }
    setOfflineUid(null);
    clearCaches();
    memoClear();
    setPredikatQueue(withoutUser(predikatQueueRef.current, userId));
    showToast('Anda telah keluar dari akun.', 'info');
  };

  // Data publik: useCache=true (hanya saat aplikasi dibuka) memakai cache perangkat bila masih segar; selain itu selalu ambil baru.
  const loadPublic = async (key, fetcher, set, useCache) => {
    const hit = useCache ? ttlGet(key) : undefined;
    if (hit !== undefined) return set(hit);
    const value = await fetcher();
    ttlSet(key, value);
    set(value);
  };
  const loaders = {
    news: (c) => loadPublic('news', api.listNews, setNewsList, c),
    achievements: (c) => loadPublic('achievements', api.listAchievements, setAchievementsList, c),
    agendas: () => (userId ? api.listAgendas().then(setAgendaList) : setAgendaList([])),
    stats: (c) => loadPublic('stats', api.getSiteStats, setStats, c),
    content: (c) =>
      loadPublic('content', api.getSiteContent, (v) => {
        setHeroData(v.heroData);
        setSiteContent(v);
      }, c),
    campaigns: () => (userId ? api.listCampaigns().then(setCampaignList) : setCampaignList([])),
    myDonations: () => (userId ? api.listMyDonations().then(setMyDonations) : setMyDonations([])),
    pendingDonations: () => (isAdmin ? api.listPendingDonations().then(setPendingDonations) : setPendingDonations([])),
    // Admin melihat semua (termasuk nonaktif, untuk bisa diaktifkan lagi); publik hanya yang aktif.
    officials: () => (isAdmin ? api.listOfficialsAdmin() : api.listOfficials()).then(setOfficials),
    pillars: (c) => loadPublic('pillars', api.listPillars, setPillars, c),
    timeline: (c) => loadPublic('timeline', api.listTimeline, setTimeline, c),
    grounds: (c) => loadPublic('grounds', api.listTrainingGrounds, setTrainingGrounds, c),
    units: (c) => loadPublic('units', api.listTrainingUnits, setTrainingUnits, c),
    events: async () => {
      if (!userId) return setUktEvents([]);
      try {
        setUktEvents(await api.listUktEvents());
      } catch (e) {
        const cached = loadCache('trident_cache_candidates');
        if (!cached?.events) throw e;
        setUktEvents(cached.events);
      }
    },
    candidates: async () => {
      const eventId = selectedEventIdRef.current;
      if (!userId || !eventId) return setCandidatesList([]);
      try {
        const list = await api.listCandidates(eventId);
        saveCache('trident_cache_candidates', { events: uktEventsRef.current, eventId, list });
        setCandidatesList(list);
      } catch (e) {
        const cached = loadCache('trident_cache_candidates');
        if (cached?.eventId !== eventId) throw e;
        setCandidatesList(cached.list);
      }
    },
    myResult: async () => {
      if (!userId) return setMyResult(null);
      const own = await api.listCandidates(undefined, userId);
      setMyResult(own[0] ?? null);
    },
  };
  // Refs so loaders always read the latest selection without re-creating them.
  const selectedEventIdRef = useRef(selectedEventId);
  selectedEventIdRef.current = selectedEventId;
  const uktEventsRef = useRef(uktEvents);
  uktEventsRef.current = uktEvents;
  // Keep a valid selection: the newest event this user can see.
  useEffect(() => {
    if (!uktEvents.some((e) => e.id === selectedEventId)) setSelectedEventId(uktEvents[0]?.id ?? null);
  }, [uktEvents]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    loaders.candidates().catch(() => showToast('Gagal memuat peserta UKT', 'error'));
  }, [selectedEventId]); // eslint-disable-line react-hooks/exhaustive-deps

  const runLoaders = async (names, useCache = false) => {
    const results = await Promise.allSettled(names.map((n) => loaders[n](useCache)));
    if (results.some((r) => r.status === 'rejected')) showToast('Sebagian data gagal dimuat', 'error');
  };
  // Data tab disimpan di state context: pindah tab tidak mengambil ulang. Hanya dua kondisi yang memuat:
  // (1) sekali saat aplikasi dibuka untuk data publik, (2) sekali per akun/peran untuk data milik pengguna.
  const PUBLIC_LOADERS = ['news', 'achievements', 'stats', 'content', 'pillars', 'timeline', 'grounds', 'units'].filter((n) => n !== 'achievements' || isTabEnabled('prestasi')); // prestasi nonaktif: datanya tidak diambil
  const USER_LOADERS = ['pendingDonations', 'events', 'candidates', 'myResult', 'officials'].filter((n) => n !== 'officials' || isTabEnabled('pengurus')); // pengurus nonaktif: datanya tidak diambil
  // Data tab yang berat dimuat saat tab pertama kali dibuka (bukan saat login), lalu di-cache sampai ganti akun.
  const LAZY_TABS = { agenda: ['agendas'], donasi: ['campaigns', 'myDonations'] };
  const lazyLoaded = useRef(new Set());
  const refresh = () => runLoaders([...PUBLIC_LOADERS, ...USER_LOADERS, ...Object.entries(LAZY_TABS).filter(([tab]) => isTabEnabled(tab)).flatMap(([, names]) => names)]); // muat ulang manual

  useEffect(() => {
    runLoaders(PUBLIC_LOADERS, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Data pengguna dimuat setelah profil (peran) siap, jadi tidak diulang saat sesi lalu profil datang bergantian.
  // null = menunggu profil; 'guest' = belum masuk (hanya mengosongkan state, tanpa request).
  const userScope = !userId ? 'guest' : profile || failedId === userId ? `${userId}:${role}` : null;
  useEffect(() => {
    if (userScope === null) return;
    memoClear(); // cache tab lazy (Akun, Kode Daftar) milik akun sebelumnya tidak boleh terbawa
    lazyLoaded.current = new Set();
    runLoaders(USER_LOADERS);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userScope]);

  // Muat data tab saat pertama kali dibuka (setelah profil siap); buka ulang tab = tanpa request.
  useEffect(() => {
    if (userScope === null) return;
    const names = (isTabEnabled(activeTab) ? LAZY_TABS[activeTab] ?? [] : []).filter((n) => !lazyLoaded.current.has(n));
    if (!names.length) return;
    names.forEach((n) => lazyLoaded.current.add(n));
    runLoaders(names);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, userScope]);

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
    if (!isTabEnabled(tabName)) return;
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

  // Sync when the app opens signed in (profile ready).
  useEffect(() => {
    if (profile && session) {
      syncPredikatRef.current();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id, !!session]);

  // Predikat huruf per materi (UKT model rubrik). Tampil langsung (optimistis). Gagal karena
  // jaringan -> disimpan di HP dan diantre (set_predikat atomik per materi, jadi aman dikirim
  // belakangan tanpa menimpa penguji lain); ditolak server (UserError, bukan soal jaringan) ->
  // tampilan dikembalikan dari server, tidak diantre (akan gagal lagi kalau dicoba ulang).
  const handleSetPredikat = async (candidateId, materi, grade) => {
    setCandidatesList((list) => list.map((c) => {
      if (c.id !== candidateId) return c;
      const predikat = { ...c.predikat };
      if (grade) predikat[materi] = grade; else delete predikat[materi];
      return { ...c, predikat };
    }));
    if (navigator.onLine && session) {
      try {
        await api.setPredikat(candidateId, materi, grade);
        setPredikatQueue(removePredikatItem(predikatQueueRef.current, { candidateId, materi, userId }));
        return;
      } catch (e) {
        console.error(e);
        if (e instanceof api.UserError) {
          showToast(e.message, 'error');
          refreshCandidates();
          return;
        }
        // bukan penolakan server, kemungkinan jaringan -> lanjut diantre di bawah
      }
    }
    setPredikatQueue(enqueuePredikat(predikatQueueRef.current, { userId, candidateId, materi, grade, savedAt: new Date().toISOString() }));
    showToast('Disimpan di HP ini, dikirim saat sinyal kembali', 'info');
  };

  // Kirim antrean predikat yang tertunda; satu per satu, dalam urutan diketuk.
  const syncPredikatNow = async () => {
    const mine = predikatQueueRef.current.filter((i) => i.userId === userId);
    if (syncingPredikat.current || !session || !navigator.onLine || !mine.length) return;
    syncingPredikat.current = true;
    let sent = 0;
    try {
      for (const item of mine) {
        try {
          await api.setPredikat(item.candidateId, item.materi, item.grade);
          setPredikatQueue(removePredikatItem(predikatQueueRef.current, item));
          sent++;
        } catch (e) {
          if (e instanceof api.UserError) {
            setPredikatQueue(removePredikatItem(predikatQueueRef.current, item));
            showToast(`Satu predikat ditolak server: ${e.message}`, 'error');
            continue; // bukan soal jaringan, lanjutkan yang lain
          }
          break; // masih gagal jaringan, hentikan dan coba lagi lain kali
        }
      }
    } finally {
      if (sent) {
        showToast(`${sent} predikat terkirim`, 'success');
        refreshCandidates();
      }
      syncingPredikat.current = false;
    }
  };
  syncPredikatRef.current = syncPredikatNow;

  // Impor peserta model rubrik (rows dari parseRubrikCsv atau form tambah peserta).
  const handleImportParticipants = async (rows) => {
    let count;
    try {
      if (!selectedEventId) throw new api.UserError('Pilih atau buat UKT terlebih dahulu');
      count = await api.upsertParticipants(rows, selectedEventId);
    } catch (e) {
      console.error(e);
      showToast(e.message === api.NOT_ALLOWED || e instanceof api.UserError ? e.message : 'Gagal menyimpan peserta', 'error');
      return false;
    }
    showToast(`${count} peserta UKT tersimpan.`, 'success');
    refreshCandidates();
    return true;
  };

  const handleDeleteCandidate = (id) =>
    mutate(() => api.deleteCandidate(id), 'candidates', 'Peserta berhasil dihapus.', 'Gagal menghapus peserta', 'info');

  // Examiner additions
  const handleAddNews = (n) =>
    mutate(() => api.addNews({ ...n, author: currentUser?.name }), 'news', 'Berita organisasi baru berhasil dipublikasikan!', 'Gagal menerbitkan berita');
  const handleDeleteNews = (id) => mutate(() => api.deleteNews(id), 'news', 'Berita berhasil dihapus.', 'Gagal menghapus berita', 'info');

  const handleAddAchievement = (a) =>
    mutate(() => api.addAchievement(a), 'achievements', 'Prestasi atlet berhasil ditambahkan ke etalase!', 'Gagal menambahkan prestasi');
  const handleDeleteAchievement = (id) =>
    mutate(() => api.deleteAchievement(id), 'achievements', 'Prestasi berhasil dihapus.', 'Gagal menghapus prestasi', 'info');

  const handleAddAgenda = (a) =>
    mutate(() => api.addAgenda(a), 'agendas', 'Agenda kegiatan baru berhasil dijadwalkan!', 'Gagal menjadwalkan agenda');
  const handleDeleteAgenda = (id) => mutate(() => api.deleteAgenda(id), 'agendas', 'Agenda berhasil dihapus.', 'Gagal menghapus agenda', 'info');

  const handleAddCampaign = (c) =>
    mutate(() => api.addCampaign(c), 'campaigns', 'Program donasi organisasi baru berhasil diluncurkan!', 'Gagal membuat program donasi');
  const handleUpdateCampaign = (id, c) =>
    mutate(() => api.updateCampaign(id, c), 'campaigns', 'Program donasi berhasil diperbarui.', 'Gagal memperbarui program donasi');
  const handleDeleteCampaign = (id) =>
    mutate(() => api.deleteCampaign(id), 'campaigns', 'Program donasi berhasil dihapus.', 'Gagal menghapus program donasi', 'info');

  const handleUpdateStats = (n) =>
    mutate(() => api.updateSiteStats(n), 'stats', 'Statistik organisasi berhasil diperbarui!', 'Gagal memperbarui statistik');

  // ADMIN CMS MUTATORS (Pilar Visi Misi, Hero, Info Tempat Latihan)
  const handleUpdatePillar = (id, p) =>
    mutate(() => api.updatePillar(id, p), 'pillars', 'Pilar Visi & Misi berhasil diperbarui oleh Administrator!', 'Gagal memperbarui pilar');
  const handleAddPillar = (p) =>
    mutate(() => api.addPillar(p), 'pillars', 'Pilar Visi & Misi baru berhasil ditambahkan!', 'Gagal menambahkan pilar');
  const handleDeletePillar = (id) =>
    mutate(() => api.deletePillar(id), 'pillars', 'Pilar Visi & Misi berhasil dihapus!', 'Gagal menghapus pilar', 'info');
  const handleAddTimeline = (t) =>
    mutate(() => api.addTimelineEvent(t), 'timeline', 'Sejarah perjalanan berhasil ditambahkan!', 'Gagal menambahkan sejarah');
  const handleUpdateTimeline = (id, t) =>
    mutate(() => api.updateTimelineEvent(id, t), 'timeline', 'Sejarah perjalanan berhasil diperbarui!', 'Gagal memperbarui sejarah');
  const handleDeleteTimeline = (id) =>
    mutate(() => api.deleteTimelineEvent(id), 'timeline', 'Sejarah perjalanan berhasil dihapus!', 'Gagal menghapus sejarah', 'info');

  const handleUpdateTrainingGround = (id, g) =>
    mutate(() => api.updateTrainingGround(id, g), 'grounds', 'Info Tempat Latihan & Kontak Pelatih berhasil diperbarui!', 'Gagal memperbarui tempat latihan');
  const handleAddTrainingGround = (g) =>
    mutate(() => api.addTrainingGround(g), 'grounds', 'Tempat Latihan (PAR) baru berhasil didaftarkan!', 'Gagal menambahkan tempat latihan');
  const handleAddTrainingUnit = (u) =>
    mutate(() => api.addTrainingUnit(u), 'units', u.level === 'PAC' ? 'PAC baru ditambahkan' : 'Ranting baru ditambahkan', 'Gagal menambahkan (nama mungkin sudah ada)');
  const handleDeleteTrainingUnit = (id) =>
    mutate(() => api.deleteTrainingUnit(id), 'units', 'Berhasil dihapus', 'Gagal menghapus', 'info');
  const handleDeleteTrainingGround = (id) =>
    mutate(() => api.deleteTrainingGround(id), 'grounds', 'Tempat Latihan berhasil dihapus dari daftar!', 'Gagal menghapus tempat latihan', 'info');

  const handleAddOfficial = (o) =>
    mutate(() => api.addOfficial(o), 'officials', 'Pengurus berhasil ditambahkan!', 'Gagal menambahkan pengurus');
  const handleUpdateOfficial = (id, o) =>
    mutate(() => api.updateOfficial(id, o), 'officials', 'Data pengurus berhasil diperbarui!', 'Gagal memperbarui pengurus');
  const handleDeleteOfficial = (id) =>
    mutate(() => api.deleteOfficial(id), 'officials', 'Pengurus berhasil dihapus.', 'Gagal menghapus pengurus', 'info');

  const handleUpdateSiteContent = (patch, okMsg = 'Konten situs berhasil diperbarui!') =>
    mutate(() => api.updateSiteContent(patch), 'content', okMsg, 'Gagal memperbarui konten situs');
  const handleUpdateHero = (h) =>
    handleUpdateSiteContent({ heroData: h }, 'Slogan & Teks Hero Organisasi berhasil diperbarui!');

  return (
    <AppContext.Provider
      value={{
        role,
        ROLES,
        isStaff,
        isAdmin,
        authLoading,
        signIn,
        changeOwnPassword,
        signUp,
        joinUktByCode,
        uktEvents,
        selectedEventId,
        setSelectedEventId,
        selectedEvent: uktEvents.find((e) => e.id === selectedEventId) ?? null,
        canManageEvents: isAdmin,
        handleCreateUktEvent,
        handleRegenerateEventCode,
        handleDeleteUktEvent,
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
        trainingUnits,
        handleAddTrainingUnit,
        handleDeleteTrainingUnit,
        handleUpdateTrainingGround,
        handleAddTrainingGround,
        handleDeleteTrainingGround,
        timeline,
        handleAddTimeline,
        handleUpdateTimeline,
        handleDeleteTimeline,
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
        officials,
        handleAddOfficial,
        handleUpdateOfficial,
        handleDeleteOfficial,
        candidatesList,
        isOnline,
        predikatQueueCount: predikatQueueMine.length,
        handleSetPredikat,
        handleImportParticipants,
        handleDeleteCandidate,
        myCandidate: myResult,
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
