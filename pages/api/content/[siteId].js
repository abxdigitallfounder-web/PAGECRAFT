// pages/api/content/[siteId].js
// GET: lê o conteúdo público (qualquer um pode)
// POST: faz upsert (precisa de JWT de usuário autenticado — RLS valida)

import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  const { siteId } = req.query
  if (!siteId) return res.status(400).json({ error: 'siteId obrigatório' })

  if (req.method === 'GET') {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
    const { data, error } = await supabase
      .from('site_content')
      .select('content, updated_at')
      .eq('site_id', siteId)
      .maybeSingle()
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ content: data?.content || {}, updatedAt: data?.updated_at })
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

    const { content } = req.body || {}
    if (!content || typeof content !== 'object') {
      return res.status(400).json({ error: 'content (object) obrigatório' })
    }

    const { data, error } = await supabase
      .from('site_content')
      .upsert({ site_id: siteId, content }, { onConflict: 'site_id' })
      .select()
      .single()

    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ success: true, content: data.content })
  }

  res.setHeader('Allow', ['GET', 'POST'])
  return res.status(405).end()
}
