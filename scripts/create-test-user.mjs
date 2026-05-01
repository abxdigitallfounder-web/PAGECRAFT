// scripts/create-test-user.mjs
// Cria um usuário de teste já confirmado (pula o email).
// Uso: node scripts/create-test-user.mjs

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

const email = `teste${Date.now().toString().slice(-6)}@pagecraft.dev`
const password = 'Teste1234!'
const fullName = 'Usuário de Teste'

console.log('🛠️  Criando usuário...')
const res = await fetch(`${url}/auth/v1/admin/users`, {
  method: 'POST',
  headers: {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email,
    password,
    email_confirm: true, // pula confirmação por email
    user_metadata: { full_name: fullName },
  }),
})

if (!res.ok) {
  console.error('❌ Erro:', res.status, await res.text())
  process.exit(1)
}

const user = await res.json()
console.log('✅ Usuário criado!\n')

// Garantir profile (caso o trigger não tenha rodado)
const profRes = await fetch(`${url}/rest/v1/profiles`, {
  method: 'POST',
  headers: {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    'Content-Type': 'application/json',
    Prefer: 'resolution=merge-duplicates,return=representation',
  },
  body: JSON.stringify({ id: user.id, full_name: fullName }),
})
if (profRes.ok) console.log('✅ Profile garantido em public.profiles\n')

console.log('═══════════════════════════════════════')
console.log('  📧  Email: ', email)
console.log('  🔑  Senha: ', password)
console.log('  👤  Nome:  ', fullName)
console.log('═══════════════════════════════════════')
console.log('\n→ Acesse http://localhost:3000/login e use essas credenciais.')
