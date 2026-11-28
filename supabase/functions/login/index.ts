import { createClient } from 'npm:@supabase/supabase-js@2';

// Login dilewatkan fungsi ini (bukan langsung dari browser ke Supabase Auth) agar penguncian
// akun setelah beberapa kali gagal bisa diterapkan dengan aman: fungsi inilah yang memanggil
// Supabase dan melihat sendiri apakah percobaannya benar-benar gagal, sehingga tak seorang pun
// bisa "melaporkan kegagalan" palsu untuk mengunci akun orang lain tanpa pernah mencoba
// passwordnya (lihat catatan di migrasi login_guard_table).
// Domain situs live ditulis langsung di sini (bukan hanya ALLOWED_ORIGINS) karena secret itu
// ternyata belum pernah di-set - akibatnya login dari situs asli ditolak CORS browser dan
// tampak seperti "gagal masuk" padahal akun & password benar.
const ORIGINS = ['capacitor://localhost', 'https://localhost', 'http://localhost:5173', 'http://127.0.0.1:5173',
  'https://trisula.pages.dev', 'https://trident-academy.pages.dev', 'https://pagarnusa-batam.pages.dev',
  ...(Deno.env.get('ALLOWED_ORIGINS') ?? '').split(',').map((s) => s.trim()).filter(Boolean)];

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
const db = createClient(SUPABASE_URL, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  { auth: { persistSession: false, autoRefreshToken: false } });

const MAX_FAILS = 5;
const WINDOW = '15 minutes';
const LOCKED_MSG = 'Terlalu banyak percobaan gagal untuk akun ini. Coba lagi dalam 15 menit.';

class HttpError extends Error { constructor(public status: number, msg: string) { super(msg); } }

function corsHeaders(origin: string | null) {
  const allow = origin && ORIGINS.includes(origin) ? origin : ORIGINS[0];
  return { 'Access-Control-Allow-Origin': allow, 'Access-Control-Allow-Headers': 'authorization, apikey, content-type', 'Access-Control-Allow-Methods': 'POST, OPTIONS', Vary: 'Origin' };
}

async function recentFails(email: string): Promise<number> {
  const since = new Date(Date.now() - 15 * 60 * 1000).toISOString();
  const { count, error } = await db.from('login_guard').select('*', { count: 'exact', head: true })
    .ilike('email', email).eq('success', false).gte('attempted_at', since);
  if (error) throw new Error(error.message);
  return count ?? 0;
}

const record = (email: string, success: boolean) => db.from('login_guard').insert({ email, success });

async function handle(req: Request) {
  const b = await req.json().catch(() => { throw new HttpError(400, 'JSON tidak valid'); });
  const email = typeof b.email === 'string' ? b.email.trim() : '';
  const password = typeof b.password === 'string' ? b.password : '';
  const captchaToken = typeof b.captchaToken === 'string' ? b.captchaToken : undefined;
  if (!email || !password) throw new HttpError(400, 'email dan password wajib diisi');

  // Pembersihan ringan: baris lebih tua dari sehari tidak lagi relevan untuk jendela 15 menit.
  db.from('login_guard').delete().lt('attempted_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()).then(() => {});

  if ((await recentFails(email)) >= MAX_FAILS) throw new HttpError(429, LOCKED_MSG);

  const r = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST', headers: { apikey: ANON_KEY, 'content-type': 'application/json' }, body: JSON.stringify({ email, password, gotrue_meta_security: { captcha_token: captchaToken } }),
  });
  let body = await r.text();
  await record(email, r.ok);

  // GoTrue sengaja membalas "invalid_credentials" yang sama untuk password salah MAUPUN email
  // belum dikonfirmasi (menghindari kebocoran status akun). Di sini kita beda-kan supaya pesan di
  // aplikasi tepat ("cek email" vs "password salah") - akibatnya memang sedikit membocorkan bahwa
  // email terdaftar tapi belum dikonfirmasi; untuk aplikasi komunitas kecil ini, trade-off itu wajar.
  if (!r.ok && r.status === 400) {
    const { data: confirmed } = await db.rpc('is_email_confirmed', { p_email: email });
    if (confirmed === false) {
      body = JSON.stringify({ error_code: 'email_not_confirmed', msg: 'Email belum dikonfirmasi. Cek email Anda dan klik link konfirmasi.' });
    }
  }
  return new Response(body, { status: r.status, headers: { 'content-type': 'application/json' } });
}

Deno.serve(async (req) => {
  const origin = req.headers.get('Origin');
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders(origin) });
  try {
    const res = await handle(req);
    for (const [k, v] of Object.entries(corsHeaders(origin))) res.headers.set(k, v);
    return res;
  } catch (e) {
    const status = e instanceof HttpError ? e.status : 500;
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : 'internal error' }), { status, headers: { 'content-type': 'application/json', ...corsHeaders(origin) } });
  }
});
