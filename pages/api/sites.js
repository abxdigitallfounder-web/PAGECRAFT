// pages/api/sites.js
// GET: lista todos os sites
// POST: cadastra um novo site (precisa de auth)

import { createClient } from '@supabase/supabase-js'

const SITE_ID_RE = /^[a-z0-9](?:[a-z0-9-]{1,58}[a-z0-9])?$/

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
    const { data, error } = await supabase
      .from('sites')
      .select('id, site_id, name, url, client_email, created_at')
      .order('created_at', { ascending: false })
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ sites: data || [] })
  }

  if (req.method === 'POST') {
    const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '')
    if (!token) return res.status(401).json({ error: 'Não autenticado' })

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    )

    const { data: userData, error: userErr } = await supabase.auth.getUser(token)
    if (userErr || !userData?.user) return res.status(401).json({ error: 'Sessão inválida' })

    const { name, siteId, url, clientEmail } = req.body || {}
    if (!name || !siteId || !url) {
      return res.status(400).json({ error: 'name, siteId e url são obrigatórios' })
    }
    if (!SITE_ID_RE.test(siteId)) {
      return res.status(400).json({
        error: 'siteId inválido. Use letras minúsculas, números e hífens (ex: academia-joao).',
      })
    }

    const { data: site, error } = await supabase
      .from('sites')
      .insert({
        site_id: siteId,
        name,
        url,
        client_email: clientEmail || null,
        owner_id: userData.user.id,
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return res.status(409).json({ error: 'Já existe um site com esse siteId' })
      }
      return res.status(500).json({ error: error.message })
    }

    // Cria linha vazia de conteúdo para esse site
    await supabase.from('site_content').insert({ site_id: siteId, content: {} })

    return res.status(201).json({ success: true, site })
  }

  res.setHeader('Allow', ['GET', 'POST'])
  return res.status(405).end()
}
