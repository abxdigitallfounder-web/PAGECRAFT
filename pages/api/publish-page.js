// pages/api/publish-page.js
// Publica ou despublica uma página. Usa o JWT do usuário (RLS isola dados).

import { createClient } from '@supabase/supabase-js'

function slugify(str) {
  return String(str || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
}

async function findUniqueSlug(supabase, base, currentPageId) {
  let candidate = base || 'pagina'
  let n = 0
  // tenta no máximo 50 variações
  while (n < 50) {
    const { data } = await supabase
      .from('pages')
      .select('id')
      .eq('slug', candidate)
      .maybeSingle()
    if (!data || data.id === currentPageId) return candidate
    n += 1
    candidate = `${base}-${n + 1}`
  }
  // fallback: sufixo aleatório
  return `${base}-${Math.random().toString(36).slice(2, 6)}`
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '')
  if (!token) return res.status(401).json({ error: 'Não autenticado' })

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  )

  const { data: userData, error: userErr } = await supabase.auth.getUser(token)
  if (userErr || !userData?.user) {
    return res.status(401).json({ error: 'Sessão inválida' })
  }

  const { pageId, action, slug: requestedSlug } = req.body || {}
  if (!pageId) return res.status(400).json({ error: 'pageId obrigatório' })

  // Busca a página (RLS garante que é do dono)
  const { data: page, error: pErr } = await supabase
    .from('pages')
    .select('id, title, slug')
    .eq('id', pageId)
    .maybeSingle()

  if (pErr || !page) return res.status(404).json({ error: 'Página não encontrada' })

  if (action === 'unpublish') {
    const { data, error } = await supabase
      .from('pages')
      .update({ published: false })
      .eq('id', pageId)
      .select()
      .single()
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ success: true, page: data })
  }

  // Publicar: define slug único
  const baseSlug = slugify(requestedSlug || page.slug || page.title) || 'pagina'
  const finalSlug = await findUniqueSlug(supabase, baseSlug, pageId)

  const { data, error } = await supabase
    .from('pages')
    .update({ published: true, slug: finalSlug })
    .eq('id', pageId)
    .select()
    .single()

  if (error) return res.status(500).json({ error: error.message })

  return res.status(200).json({ success: true, page: data, slug: finalSlug })
}
