import { createClient } from 'npm:@supabase/supabase-js@2';

const ROLES = ['anggota', 'penguji', 'admin'];
const ORIGINS = ['capacitor://localhost', 'https://localhost', 'http://localhost:5173', 'http://127.0.0.1:5173',
  ...(Deno.env.get('ALLOWED_ORIGINS') ?? '').split(',').map((s) => s.trim()).filter(Boolean)];
const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  { auth: { persistSession: false, autoRefreshToken: false } });

class HttpError extends Error { constructor(public status: number, msg: string) { super(msg); } }
const bad = (msg: string) => new HttpError(400, msg);

const PROFILE_FIELDS = ['full_name', 'role', 'belt', 'branch', 'reg_number'] as const;
const pick = (b: Record<string, unknown>) =>
  Object.fromEntries(PROFILE_FIELDS.filter((k) => b[k] !== undefined).map((k) => [k, b[k]]));
const checkRole = (r: unknown) => { if (r !== undefined && !ROLES.includes(r as string)) throw bad('role tidak valid'); };
const checkPassword = (p: unknown) => { if (typeof p !== 'string' || p.length < 8) throw bad('sandi minimal 8 karakter'); };
const must = <T>(r: { data: T; error: { message: string } | null }) => { if (r.error) throw new Error(r.error.message); return r.data; };

async function handle(req: Request) {
  const jwt = req.headers.get('Authorization')?.replace(/^Bearer\s+/i, '');
  if (!jwt) throw new HttpError(401, 'tidak ada token');
  const { data: u, error: ue } = await db.auth.getUser(jwt);
  if (ue || !u.user) throw new HttpError(401, 'token tidak valid');
  const me = u.user.id;
  const { data: prof } = await db.from('profiles').select('role').eq('id', me).maybeSingle();
  if (prof?.role !== 'admin') throw new HttpError(403, 'bukan admin');

  const b = await req.json().catch(() => { throw bad('JSON tidak valid'); });
  const uid = b.user_id;
  if (b.action !== 'create' && b.action !== 'list' && typeof uid !== 'string') throw bad('user_id wajib');

  switch (b.action) {
    case 'create': {
      const email = typeof b.email === 'string' ? b.email.trim() : '';
      if (!email) throw bad('email wajib');
      checkPassword(b.password);
      if (typeof b.full_name !== 'string' || !b.full_name.trim()) throw bad('nama wajib');
      if (!ROLES.includes(b.role)) throw bad('role tidak valid');
      const { data, error } = await db.auth.admin.createUser({ email, password: b.password, email_confirm: true });
      if (error) throw bad(error.message);
      const { error: pe } = await db.from('profiles').insert({ id: data.user.id, ...pick(b) });
      if (pe) {
        await db.auth.admin.deleteUser(data.user.id);
        throw bad(pe.message);
      }
      return { id: data.user.id };
    }
    case 'reset_password':
      checkPassword(b.password);
      must(await db.auth.admin.updateUserById(uid, { password: b.password }));
      return { ok: true };
    case 'set_active':
      if (typeof b.active !== 'boolean') throw bad('active harus boolean');
      if (uid === me && !b.active) throw bad('tidak bisa menonaktifkan diri sendiri');
      must(await db.auth.admin.updateUserById(uid, { ban_duration: b.active ? 'none' : '876000h' }));
      return { ok: true };
    case 'update_profile': {
      checkRole(b.role);
      if (uid === me && b.role !== undefined && b.role !== 'admin') throw bad('tidak bisa menurunkan peran sendiri');
      const patch = pick(b);
      if (Object.keys(patch).length) {
        const { error } = await db.from('profiles').update(patch).eq('id', uid);
        if (error) throw bad(error.message);
      }
      return { ok: true };
    }
    case 'list': {
      const users: { id: string; email?: string; banned_until?: string }[] = [];
      for (let page = 1; ; page++) {
        const { data, error } = await db.auth.admin.listUsers({ page, perPage: 200 });
        if (error) throw new Error(error.message);
        users.push(...data.users);
        if (data.users.length < 200) break;
      }
      const profiles = new Map(must(await db.from('profiles').select('*')).map((p) => [p.id, p]));
      return {
        users: users.map((a) => {
          const p = profiles.get(a.id);
          return {
            id: a.id, email: a.email, full_name: p?.full_name ?? null, role: p?.role ?? null,
            belt: p?.belt ?? null, branch: p?.branch ?? null, reg_number: p?.reg_number ?? null,
            active: !(a.banned_until && new Date(a.banned_until) > new Date()),
          };
        }),
      };
    }
    default:
      throw bad('action tidak dikenal');
  }
}

Deno.serve(async (req) => {
  const origin = req.headers.get('Origin') ?? '';
  const cors: Record<string, string> = {
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    Vary: 'Origin',
    ...(ORIGINS.includes(origin) ? { 'Access-Control-Allow-Origin': origin } : {}),
  };
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
  const json = (status: number, body: unknown) =>
    new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });
  try {
    return json(200, await handle(req));
  } catch (e) {
    if (e instanceof HttpError) return json(e.status, { error: e.message });
    console.error(e);
    return json(500, { error: 'kesalahan server' });
  }
});
