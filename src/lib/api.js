import { supabase } from './supabase';

const ok = ({ data, error }) => {
  if (error) throw error;
  return data;
};

// Errors whose Indonesian message is safe to show the user as-is.
export class UserError extends Error {}

export const NOT_ALLOWED = 'Tidak diizinkan atau data tidak ditemukan';
// RLS-blocked update/delete returns no error and 0 rows; surface that as an error.
const hit = async (query) => {
  if (!ok(await query.select('id')).length) throw new Error(NOT_ALLOWED);
};

// Copy only the keys present in `patch`, renamed via map {appKey: dbColumn}.
const toRow = (patch, map) =>
  Object.fromEntries(Object.entries(map).filter(([k]) => patch[k] !== undefined).map(([k, col]) => [col, patch[k]]));

const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });

export async function getProfile(userId) {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
  if (error) throw error;
  return data;
}

// --- Berita ---
const NEWS_MAP = { title: 'title', category: 'category', summary: 'summary', content: 'content', image: 'image_url', tags: 'tags', author: 'author_name' };

export async function listNews() {
  const rows = ok(
    await supabase
      .from('news')
      .select('id,title,category,summary,content,image:image_url,tags,author:author_name,created_at')
      .order('created_at', { ascending: false }),
  );
  return rows.map(({ created_at, ...n }) => ({ ...n, date: fmtDate(created_at) }));
}
export const addNews = async (input) => ok(await supabase.from('news').insert(toRow(input, NEWS_MAP)));
export const deleteNews = async (id) => hit(supabase.from('news').delete().eq('id', id));

// --- Prestasi ---
const ACH_MAP = { athleteName: 'athlete_name', championship: 'championship', scope: 'scope', medal: 'medal', category: 'category', year: 'year', notes: 'notes', photo: 'photo_url' };

export async function listAchievements() {
  return ok(
    await supabase
      .from('achievements')
      .select('id,athleteName:athlete_name,championship,scope,medal,category,year,notes,photo:photo_url')
      .order('created_at', { ascending: false }),
  );
}
export const addAchievement = async (input) =>
  ok(await supabase.from('achievements').insert(toRow({ year: String(new Date().getFullYear()), ...input }, ACH_MAP)));
export const deleteAchievement = async (id) => hit(supabase.from('achievements').delete().eq('id', id));

// --- Agenda + RSVP ---
const AGENDA_MAP = { title: 'title', date: 'date', time: 'time_text', location: 'location', speaker: 'speaker', description: 'description' };

export async function listAgendas() {
  const { data: sess } = await supabase.auth.getSession();
  const uid = sess.session?.user?.id;
  const [agendas, rsvps, mine] = await Promise.all([
    supabase
      .from('agendas')
      .select('id,title,date,time:time_text,location,speaker,description')
      .order('created_at', { ascending: false })
      .then(ok),
    supabase.from('agenda_rsvps_public').select('agenda_id,user_id,full_name,status').then(ok),
    uid ? supabase.from('agenda_rsvps').select('agenda_id,status,reason').eq('user_id', uid).then(ok) : [],
  ]);
  return agendas.map((a) => {
    const m = mine.find((r) => r.agenda_id === a.id);
    return {
      ...a,
      attendees: rsvps
        .filter((r) => r.agenda_id === a.id)
        .map((r) => ({ id: r.user_id, name: r.full_name, status: r.status })),
      myRsvp: m ? { status: m.status, reason: m.reason } : null,
    };
  });
}
export const addAgenda = async (input) => ok(await supabase.from('agendas').insert(toRow(input, AGENDA_MAP)));
export const deleteAgenda = async (id) => hit(supabase.from('agendas').delete().eq('id', id));
// fullName comes from the caller (currentUser.name); user_id defaults to auth.uid() in the DB.
export const upsertRsvp = async (agendaId, status, reason, fullName) =>
  ok(
    await supabase
      .from('agenda_rsvps')
      .upsert(
        { agenda_id: agendaId, status, reason: status === 'izin' ? reason || null : null, full_name: fullName },
        { onConflict: 'agenda_id,user_id' },
      ),
  );

// --- Statistik ---
const STATS_MAP = { activeMembers: 'active_members', medalsCount: 'medals_count', padepokanBranches: 'padepokan_branches', uktPassRate: 'ukt_pass_rate', masterCouncil: 'master_council' };

export async function getSiteStats() {
  return ok(
    await supabase
      .from('site_stats')
      .select('activeMembers:active_members,medalsCount:medals_count,padepokanBranches:padepokan_branches,uktPassRate:ukt_pass_rate,masterCouncil:master_council')
      .eq('id', 1)
      .single(),
  );
}
export const updateSiteStats = async (patch) => hit(supabase.from('site_stats').update(toRow(patch, STATS_MAP)).eq('id', 1));

// --- Konten situs (hero; rekening/QRIS dipakai Task 9) ---
const CONTENT_MAP = { bankName: 'bank_name', bankAccount: 'bank_account', bankHolder: 'bank_holder', qrisImageUrl: 'qris_image_url' };
const HERO_MAP = { badge: 'hero_badge', titleMain: 'hero_title_main', titleHighlight: 'hero_title_highlight', subtitle: 'hero_subtitle' };

export async function getSiteContent() {
  const r = ok(await supabase.from('site_content').select('*').eq('id', 1).single());
  return {
    heroData: { badge: r.hero_badge, titleMain: r.hero_title_main, titleHighlight: r.hero_title_highlight, subtitle: r.hero_subtitle },
    bankName: r.bank_name,
    bankAccount: r.bank_account,
    bankHolder: r.bank_holder,
    qrisImageUrl: r.qris_image_url,
  };
}
export const updateSiteContent = async (patch) =>
  hit(
    supabase
      .from('site_content')
      .update({ ...toRow(patch, CONTENT_MAP), ...toRow(patch.heroData ?? {}, HERO_MAP) })
      .eq('id', 1),
  );

// --- Pilar ---
const PILLAR_MAP = { title: 'title', desc: 'desc', icon: 'icon' };

export const listPillars = async () => ok(await supabase.from('pillars').select('id,title,desc,icon').order('sort_order'));
export async function addPillar(input) {
  const last = ok(await supabase.from('pillars').select('sort_order').order('sort_order', { ascending: false }).limit(1));
  return ok(await supabase.from('pillars').insert({ ...toRow(input, PILLAR_MAP), sort_order: (last[0]?.sort_order ?? 0) + 1 }));
}
export const updatePillar = async (id, patch) => hit(supabase.from('pillars').update(toRow(patch, PILLAR_MAP)).eq('id', id));
export const deletePillar = async (id) => hit(supabase.from('pillars').delete().eq('id', id));

// --- Tempat latihan ---
const GROUND_MAP = {
  name: 'name', tier: 'tier', parentPR: 'parent_pr', address: 'address', trainerName: 'trainer_name', trainerBelt: 'trainer_belt',
  trainerPhone: 'trainer_phone', trainerPhoto: 'trainer_photo_url', schedule: 'schedule', facilities: 'facilities',
  activeStudents: 'active_students', badge: 'badge', description: 'description',
};

export const listTrainingGrounds = async () =>
  ok(
    await supabase
      .from('training_grounds')
      .select('id,name,tier,parentPR:parent_pr,address,trainerName:trainer_name,trainerBelt:trainer_belt,trainerPhone:trainer_phone,trainerPhoto:trainer_photo_url,schedule,facilities,activeStudents:active_students,badge,description')
      .order('created_at', { ascending: false }),
  );
export const addTrainingGround = async (input) => ok(await supabase.from('training_grounds').insert(toRow(input, GROUND_MAP)));
export const updateTrainingGround = async (id, patch) => hit(supabase.from('training_grounds').update(toRow(patch, GROUND_MAP)).eq('id', id));
export const deleteTrainingGround = async (id) => hit(supabase.from('training_grounds').delete().eq('id', id));

// --- UKT ---
const POS_KEYS = ['pos1', 'pos2', 'pos3', 'pos4'];
const SUB_KEYS = {
  pos1: ['stamina', 'physicalEndurance', 'agility'],
  pos2: ['jurusPrecision', 'strikeAccuracy', 'stancesStability'],
  pos3: ['theory', 'history', 'ethicsRespect'],
  pos4: ['fightingCourage', 'techniqueApplication', 'emotionalControl'],
};
const STRUCT_KEYS = ['pp', 'pw', 'pc', 'pac', 'pr', 'par'];
const DEFAULT_PHOTO = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80';

const fromCandidateRow = (r) => ({
  id: r.id,
  regNumber: r.reg_number,
  name: r.name,
  branch: r.branch ?? '',
  currentBelt: r.current_belt ?? '',
  targetBelt: r.target_belt ?? '',
  photo: r.photo_url || DEFAULT_PHOTO,
  userId: r.user_id,
  posScores: Object.fromEntries(POS_KEYS.map((k) => [k, { score: Number(r[k]), sub: r.sub_scores?.[k] ?? {} }])),
  finalScore: Number(r.final_score),
  examinerNotes: r.examiner_notes ?? '',
  examinerName: r.examiner_name,
  dateExam: r.exam_date ? fmtDate(r.exam_date) : null,
  structure: Object.fromEntries(STRUCT_KEYS.map((k) => [k, r[`struct_${k}`] ?? ''])),
  updatedAt: r.updated_at,
});

export async function listCandidates() {
  return ok(await supabase.from('ukt_candidates').select('*').order('name')).map(fromCandidateRow);
}

const today = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(new Date()); // YYYY-MM-DD

// Returns 'conflict' when the row changed since baseUpdatedAt (unless force); network/other errors throw.
export async function saveCandidateScores(id, posScores, notes, { baseUpdatedAt, force = false } = {}) {
  const { data: sess } = await supabase.auth.getSession();
  const uid = sess.session?.user?.id;
  const { data: prof } = await supabase.from('profiles').select('full_name').eq('id', uid).single();
  const patch = {
    ...Object.fromEntries(POS_KEYS.map((k) => [k, posScores[k].score])),
    sub_scores: Object.fromEntries(POS_KEYS.map((k) => [k, posScores[k].sub])),
    examiner_notes: notes,
    examiner_id: uid,
    examiner_name: prof?.full_name ?? null,
    exam_date: today(),
  };
  let q = supabase.from('ukt_candidates').update(patch).eq('id', id);
  if (!force) q = q.eq('updated_at', baseUpdatedAt);
  const rows = ok(await q.select('id'));
  return rows.length ? 'ok' : 'conflict';
}

export async function upsertCandidates(rows) {
  const payload = rows.map((r) => ({
    reg_number: r.regNumber,
    name: r.name,
    branch: r.branch,
    current_belt: r.currentBelt,
    target_belt: r.targetBelt,
    ...Object.fromEntries(POS_KEYS.map((k) => [k, r[k]])),
    sub_scores: Object.fromEntries(POS_KEYS.map((k) => [k, Object.fromEntries(SUB_KEYS[k].map((s) => [s, r[k]]))])),
    examiner_notes: r.examinerNotes,
    ...Object.fromEntries(STRUCT_KEYS.map((k) => [`struct_${k}`, r.structure?.[k] ?? ''])),
  }));
  ok(await supabase.from('ukt_candidates').upsert(payload, { onConflict: 'reg_number' }));
  return payload.length;
}

export const deleteCandidate = async (id) => hit(supabase.from('ukt_candidates').delete().eq('id', id));

// --- Donasi ---
const CAMPAIGN_MAP = { title: 'title', category: 'category', targetAmount: 'target_amount', deadline: 'deadline', description: 'description' };
export const PROOF_TYPES = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };
export const MAX_PROOF_BYTES = 5 * 1024 * 1024;
export const MIN_DONATION = 1000;
export const MAX_DONATION = 1_000_000_000_000;
export const AMOUNT_ERROR = 'Nominal donasi harus bilangan bulat antara Rp 1.000 dan Rp 1.000.000.000.000';
export const DELETE_CAMPAIGN_BLOCKED = 'Program tidak bisa dihapus karena sudah ada donasi';

export async function listCampaigns() {
  const [camps, totals, recent] = await Promise.all([
    supabase.from('campaigns').select('id,title,category,target_amount,deadline,description').order('created_at', { ascending: false }).then(ok),
    supabase.from('campaign_totals').select('campaign_id,collected_amount,donors_count').then(ok),
    supabase.from('public_donations').select('id,campaign_id,donor_name,amount,message,created_at').order('created_at', { ascending: false }).then(ok),
  ]);
  return camps.map((c) => {
    const t = totals.find((x) => x.campaign_id === c.id);
    return {
      id: c.id,
      title: c.title,
      category: c.category,
      targetAmount: Number(c.target_amount),
      deadlineDate: c.deadline ?? '',
      deadline: c.deadline ? fmtDate(c.deadline) : '-',
      description: c.description,
      collectedAmount: Number(t?.collected_amount ?? 0),
      donorsCount: t?.donors_count ?? 0,
      recentDonations: recent
        .filter((d) => d.campaign_id === c.id)
        .slice(0, 5)
        .map((d) => ({ id: d.id, donorName: d.donor_name, amount: Number(d.amount), message: d.message, date: fmtDate(d.created_at) })),
    };
  });
}
export const addCampaign = async (input) => ok(await supabase.from('campaigns').insert(toRow(input, CAMPAIGN_MAP)));
export const updateCampaign = async (id, patch) => hit(supabase.from('campaigns').update(toRow(patch, CAMPAIGN_MAP)).eq('id', id));
export async function deleteCampaign(id) {
  const { data, error } = await supabase.from('campaigns').delete().eq('id', id).select('id');
  if (error) throw error.code === '23503' ? new UserError(DELETE_CAMPAIGN_BLOCKED) : error;
  if (!data.length) throw new Error(NOT_ALLOWED);
}

const fromDonationRow = (r) => ({
  id: r.id,
  refNumber: r.ref_number,
  campaignId: r.campaign_id,
  campaignTitle: r.campaigns?.title ?? '',
  donorName: r.donor_name,
  amount: Number(r.amount),
  message: r.message,
  paymentMethod: r.payment_method,
  status: r.status,
  proofPath: r.proof_path,
  timestamp: new Date(r.created_at).toLocaleString('id-ID'),
});
const DONATION_COLS = '*,campaigns(title)';

export async function submitDonation({ campaignId, amount, donorName, message, paymentMethod, proofFile }) {
  const n = Number(amount);
  if (!Number.isInteger(n) || n < MIN_DONATION || n > MAX_DONATION) throw new UserError(AMOUNT_ERROR);
  const ext = PROOF_TYPES[proofFile?.type];
  if (!ext) throw new UserError('Bukti transfer harus berupa foto JPEG, PNG, atau WebP');
  if (proofFile.size > MAX_PROOF_BYTES) throw new UserError('Ukuran bukti transfer maksimal 5 MB');
  const { data: sess } = await supabase.auth.getSession();
  const uid = sess.session?.user?.id;
  if (!uid) throw new UserError('Silakan masuk terlebih dahulu');
  const path = `${uid}/${crypto.randomUUID()}.${ext}`;
  const up = await supabase.storage.from('donation-proofs').upload(path, proofFile, { contentType: proofFile.type });
  if (up.error) throw up.error;
  // status is never sent: the force_pending trigger sets it.
  const ins = await supabase
    .from('donations')
    .insert({ campaign_id: campaignId, amount: n, donor_name: donorName, message, payment_method: paymentMethod, proof_path: path })
    .select(DONATION_COLS)
    .single();
  if (ins.error) {
    const rm = await supabase.storage.from('donation-proofs').remove([path]);
    if (rm.error || !rm.data?.length) console.error('Gagal membersihkan bukti yatim', path, rm.error);
    throw ins.error;
  }
  return fromDonationRow(ins.data);
}

export async function listMyDonations() {
  const { data: sess } = await supabase.auth.getSession();
  const uid = sess.session?.user?.id;
  if (!uid) return [];
  return ok(await supabase.from('donations').select(DONATION_COLS).eq('user_id', uid).order('created_at', { ascending: false })).map(fromDonationRow);
}

export async function listPendingDonations() {
  const rows = ok(await supabase.from('donations').select(DONATION_COLS).eq('status', 'pending').order('created_at')).map(fromDonationRow);
  return Promise.all(
    rows.map(async (d) => {
      const { data } = await supabase.storage.from('donation-proofs').createSignedUrl(d.proofPath, 600);
      return { ...d, signedProofUrl: data?.signedUrl ?? null };
    }),
  );
}

export async function setDonationStatus(id, status) {
  const { data: sess } = await supabase.auth.getSession();
  return hit(
    supabase
      .from('donations')
      .update({ status, verified_by: sess.session?.user?.id, verified_at: new Date().toISOString() })
      .eq('id', id)
      .eq('status', 'pending'),
  );
}

// --- Kelola Akun (Edge Function manage-user, admin only) ---
async function manageUser(body) {
  const { data, error } = await supabase.functions.invoke('manage-user', { body });
  if (!error) return data;
  const msg = await error.context?.json?.().then((j) => j?.error, () => null);
  throw msg ? new UserError(msg) : error;
}
export const listUsers = async () => (await manageUser({ action: 'list' })).users;
export const createUser = (input) => manageUser({ action: 'create', ...input });
export const resetPassword = (userId, password) => manageUser({ action: 'reset_password', user_id: userId, password });
export const setUserActive = (userId, active) => manageUser({ action: 'set_active', user_id: userId, active });
export const updateUserProfile = (userId, patch) => manageUser({ action: 'update_profile', user_id: userId, ...patch });
