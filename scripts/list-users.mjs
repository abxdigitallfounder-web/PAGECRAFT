// scripts/list-users.mjs
// Lista usuários cadastrados (auth.users via service key) e seus profiles.
// Uso: node scripts/list-users.mjs

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const env = {}
for (const line of readFileSync(resolve(__dirname, '..', '.env.local'), 'utf8').split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
  if (m && !line.trim().startsWith('#')) env[m[1]] = m[2]
}

const url = env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = env.SUPABASE_SERVICE_KEY
const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!url || !serviceKey) {
  console.error('❌ Falta NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_KEY')
  process.exit(1)
}

console.log('🔗', url, '\n')

// 1. auth.users via Admin API (precisa de service key)
const usersRes = await fetch(`${url}/auth/v1/admin/users`, {
  headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
})

if (!usersRes.ok) {
  console.error('❌ Erro auth.users:', usersRes.status, await usersRes.text())
  process.exit(1)
}

const { users } = await usersRes.json()

console.log(`👤 auth.users — ${users.length} usuário(s):\n`)
users.forEach((u, i) => {
  console.log(`${i + 1}. ${u.email}`)
  console.log(`   id: ${u.id}`)
  console.log(`   criado: ${u.created_at}`)
  console.log(`   confirmado: ${u.email_confirmed_at ? '✅' : '⏳ pendente'}`)
  console.log(`   metadata: ${JSON.stringify(u.user_metadata)}`)
  console.log('')
})

// 2. profiles via REST (service key bypassa RLS)
const profRes = await fetch(`${url}/rest/v1/profiles?select=*`, {
  headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
})
const profiles = await profRes.json()

console.log(`📋 public.profiles — ${profiles.length} linha(s):\n`)
profiles.forEach((p, i) => {
  console.log(`${i + 1}. ${p.full_name || '(sem nome)'} — id: ${p.id}`)
})

if (users.length > 0 && profiles.length === 0) {
  console.log('\n⚠️ Há usuários em auth.users mas nenhum profile foi criado.')
  console.log('   Verifique se o trigger on_auth_user_created está ativo (no schema).')
}
