// scripts/check-db.mjs
// Verifica se a conexão com Supabase está funcionando e quais tabelas existem.
// Uso: node scripts/check-db.mjs

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const envPath = resolve(__dirname, '..', '.env.local')

// Lê .env.local manualmente
const env = {}
try {
  const text = readFileSync(envPath, 'utf8')
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (m && !line.trim().startsWith('#')) env[m[1]] = m[2]
  }
} catch (e) {
  console.error('❌ Não consegui ler .env.local:', e.message)
  process.exit(1)
}

const url = env.NEXT_PUBLIC_SUPABASE_URL
const key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!url || !key) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL ou NEXT_PUBLIC_SUPABASE_ANON_KEY ausente.')
  process.exit(1)
}

console.log('🔗 URL:', url)
console.log('🔑 Anon key:', key.slice(0, 20) + '...')
console.log('')

const headers = { apikey: key, Authorization: `Bearer ${key}` }

async function checkTable(name) {
  const r = await fetch(`${url}/rest/v1/${name}?select=*&limit=1`, { headers })
  if (r.status === 200) {
    const data = await r.json()
    return { ok: true, status: 200, count: data.length }
  }
  const body = await r.text().catch(() => '')
  return { ok: false, status: r.status, body: body.slice(0, 200) }
}

async function main() {
  const tables = ['profiles', 'pages', 'sites', 'site_content']
  const results = {}
  for (const t of tables) {
    process.stdout.write(`📋 ${t.padEnd(15)} ... `)
    try {
      const r = await checkTable(t)
      results[t] = r
      if (r.ok) console.log(`✅ OK (${r.count} linhas visíveis)`)
      else console.log(`❌ HTTP ${r.status} — ${r.body}`)
    } catch (e) {
      console.log(`❌ ${e.message}`)
      results[t] = { ok: false, error: e.message }
    }
  }

  console.log('')
  const missing = Object.entries(results).filter(([, r]) => !r.ok)
  if (missing.length === 0) {
    console.log('🎉 Tudo certo. Banco integrado e schema aplicado.')
  } else {
    console.log('⚠️ Tabelas com problema:', missing.map(([t]) => t).join(', '))
    console.log('   → Rode supabase-schema.sql no SQL Editor do Supabase.')
  }
}

main().catch((e) => {
  console.error('Erro:', e)
  process.exit(1)
})
