// Backup manual: skema + data database dan semua berkas bukti donasi.
// Jalankan: npm run backup  (membaca .env.local)
import { spawnSync } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { createClient } from '@supabase/supabase-js'

const BUCKET = 'donation-proofs'
const { VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_DB_URL } = process.env

function gagal(pesan) {
  console.error(`GAGAL: ${pesan}`)
  process.exit(1)
}

if (!VITE_SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !SUPABASE_DB_URL) {
  gagal('VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, atau SUPABASE_DB_URL belum diisi di .env.local.')
}

const dir = join('backups', new Date().toISOString().slice(0, 10))
mkdirSync(dir, { recursive: true })

// URL database dioper lewat variabel lingkungan agar tidak tampil di log.
const ref = process.platform === 'win32' ? '"%SUPABASE_DB_URL%"' : '"$SUPABASE_DB_URL"'
function dump(label, file, extra = '') {
  console.log(`Dump ${label} ...`)
  const r = spawnSync(`npx supabase db dump --db-url ${ref} ${extra} -f "${file}"`, {
    shell: true, env: process.env, encoding: 'utf8',
  })
  if (r.status !== 0) {
    const err = ((r.stderr || '') + (r.error ? String(r.error) : '')).split(SUPABASE_DB_URL).join('[URL]').trim()
    gagal(`dump ${label} gagal (kode ${r.status}). ${err.slice(-1500)}`)
  }
}
dump('skema', join(dir, 'schema.sql'))
dump('data', join(dir, 'data.sql'), '--data-only')

const sb = createClient(VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })

async function unduh(prefix) {
  let jumlah = 0
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await sb.storage.from(BUCKET).list(prefix, { limit: 1000, offset })
    if (error) gagal(`daftar bucket ${BUCKET}/${prefix} gagal: ${error.message}`)
    for (const o of data) {
      const path = prefix ? `${prefix}/${o.name}` : o.name
      if (!o.id) { jumlah += await unduh(path); continue } // folder tidak punya id
      const { data: blob, error: e } = await sb.storage.from(BUCKET).download(path)
      if (e) gagal(`unduh ${path} gagal: ${e.message}`)
      const out = join(dir, BUCKET, path)
      mkdirSync(dirname(out), { recursive: true })
      writeFileSync(out, Buffer.from(await blob.arrayBuffer()))
      jumlah++
    }
    if (data.length < 1000) break
  }
  return jumlah
}

console.log(`Unduh bukti donasi ...`)
mkdirSync(join(dir, BUCKET), { recursive: true })
const n = await unduh('')
console.log(`Selesai: ${dir} (${n} berkas bukti).`)
