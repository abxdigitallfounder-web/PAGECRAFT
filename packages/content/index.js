// @pagecraft/content
// Hook + helpers para consumir conteúdo dinâmico de sites PageCraft.
// Compatível com Vite (import.meta.env) e Next.js (process.env).

import { useEffect, useState, useMemo } from 'react'
import { createClient } from '@supabase/supabase-js'

// ─────────────────────────────────────────────
// Resolve env vars (Vite OU Next.js OU custom)
// ─────────────────────────────────────────────
function readEnv(key) {
  // Vite
  try {
    // eslint-disable-next-line no-undef
    if (typeof import.meta !== 'undefined' && import.meta?.env) {
      const v = import.meta.env[`VITE_${key}`] ?? import.meta.env[key]
      if (v) return v
    }
  } catch (_) {}
  // Next.js / Node
  if (typeof process !== 'undefined' && process?.env) {
    return (
      process.env[`NEXT_PUBLIC_${key}`] ||
      process.env[`VITE_${key}`] ||
      process.env[key]
    )
  }
  return undefined
}

// ─────────────────────────────────────────────
// createContentClient (factory) + cliente padrão
// ─────────────────────────────────────────────
export function createContentClient(supabaseUrl, supabaseAnonKey) {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
    realtime: { params: { eventsPerSecond: 5 } },
  })
}

let _defaultClient = null
export function getDefaultClient() {
  if (_defaultClient) return _defaultClient
  const url = readEnv('SUPABASE_URL')
  const key = readEnv('SUPABASE_ANON_KEY')
  if (!url || !key) {
    throw new Error(
      '[@pagecraft/content] Variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY (ou NEXT_PUBLIC_*) não definidas.'
    )
  }
  _defaultClient = createContentClient(url, key)
  return _defaultClient
}

// ─────────────────────────────────────────────
// Hook principal: useContent(siteId, opts?)
// Busca + realtime
// ─────────────────────────────────────────────
export function useContent(siteId, opts = {}) {
  const { client } = opts
  const sb = useMemo(() => client || getDefaultClient(), [client])
  const [content, setContent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!siteId) {
      setLoading(false)
      return
    }
    let cancelled = false

    async function fetchContent() {
      setLoading(true)
      const { data, error } = await sb
        .from('site_content')
        .select('content')
        .eq('site_id', siteId)
        .maybeSingle()
      if (cancelled) return
      if (error) {
        setError(error)
        setContent(null)
      } else {
        setContent(data?.content || {})
        setError(null)
      }
      setLoading(false)
    }

    fetchContent()

    // Realtime: ouvir UPDATE/INSERT na linha deste siteId
    const channel = sb
      .channel(`site_content:${siteId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'site_content',
          filter: `site_id=eq.${siteId}`,
        },
        (payload) => {
          const next = payload.new?.content
          if (next) setContent(next)
        }
      )
      .subscribe()

    return () => {
      cancelled = true
      sb.removeChannel(channel)
    }
  }, [siteId, sb])

  return { content, loading, error }
}

// ─────────────────────────────────────────────
// HOC: withContent(Component, siteId)
// Injeta a prop `content` no componente
// ─────────────────────────────────────────────
export function withContent(Component, siteId) {
  return function WithContentWrapper(props) {
    const { content, loading, error } = useContent(siteId)
    return <Component {...props} content={content} contentLoading={loading} contentError={error} />
  }
}

export default { useContent, withContent, createContentClient, getDefaultClient }
