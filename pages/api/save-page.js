// pages/api/save-page.js
// Salva o HTML/CSS da página no Supabase. Cada chamada usa o JWT do usuário
// (header Authorization), e o RLS garante que ninguém edita página alheia.

import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const authHeader = req.headers.authorization || ''
  const token = authHeader.replace(/^Bearer\s+/i, '')
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
  const userId = userData.user.id

  const { pageId, html, css, title, template } = req.body
  if (!html) return res.status(400).json({ error: 'HTML é obrigatório' })

  // Update se existir e pertencer ao user; senão insert
  if (pageId) {
    const { data, error } = await supabase
      .from('pages')
      .update({
        html,
        css,
        title: title || 'Minha Página',
        template: template || undefined,
      })
      .eq('id', pageId)
      .eq('user_id', userId)
      .select()
      .single()

    if (error || !data) {
      // se não encontrou, tenta criar
      const ins = await supabase
        .from('pages')
        .insert({
          id: pageId,
          html,
          css,
          title: title || 'Minha Página',
          template: template || 'Vendas Pro',
          user_id: userId,
        })
        .select()
        .single()
      if (ins.error) {
        console.error('Supabase error:', ins.error)
        return res.status(500).json({ error: 'Erro ao salvar', details: ins.error.message })
      }
      return res.status(200).json({ success: true, page: ins.data })
    }
    return res.status(200).json({ success: true, page: data })
  }

  // Sem pageId: cria nova
  const { data, error } = await supabase
    .from('pages')
    .insert({
      html,
      css,
      title: title || 'Minha Página',
      template: template || 'Vendas Pro',
      user_id: userId,
    })
    .select()
    .single()

  if (error) {
    console.error('Supabase error:', error)
    return res.status(500).json({ error: 'Erro ao salvar', details: error.message })
  }
  return res.status(200).json({ success: true, page: data })
}
