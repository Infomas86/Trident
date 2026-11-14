import { supabase } from './supabase';

const ok = ({ data, error }) => {
  if (error) throw error;
  return data;
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
export const deleteNews = async (id) => ok(await supabase.from('news').delete().eq('id', id));

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
export const deleteAchievement = async (id) => ok(await supabase.from('achievements').delete().eq('id', id));

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
export const deleteAgenda = async (id) => ok(await supabase.from('agendas').delete().eq('id', id));
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
export const updateSiteStats = async (patch) => ok(await supabase.from('site_stats').update(toRow(patch, STATS_MAP)).eq('id', 1));

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
  ok(
    await supabase
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
export const updatePillar = async (id, patch) => ok(await supabase.from('pillars').update(toRow(patch, PILLAR_MAP)).eq('id', id));
export const deletePillar = async (id) => ok(await supabase.from('pillars').delete().eq('id', id));

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
export const updateTrainingGround = async (id, patch) => ok(await supabase.from('training_grounds').update(toRow(patch, GROUND_MAP)).eq('id', id));
export const deleteTrainingGround = async (id) => ok(await supabase.from('training_grounds').delete().eq('id', id));
