// pages/editor/[pageId].js
// Editor principal — GrapeJS + Chat IA

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { salesPageTemplate } from '../../templates/salesPage'
import { supabase } from '../../lib/supabaseClient'

const SUGGESTIONS = [
  'Muda o título principal',
  'Deixa o botão do hero verde',
  'Troca a cor de fundo do hero',
  'Melhora o texto do CTA',
  'Adiciona urgência ao título',
]

export default function EditorPage() {
  const router = useRouter()
  const { pageId } = router.query
  const editorRef = useRef(null)
  const grapeRef = useRef(null)
  const messagesEndRef = useRef(null)
  const [authChecked, setAuthChecked] = useState(false)
  const [pageRecord, setPageRecord] = useState(null)
  const [pageLoading, setPageLoading] = useState(true)
  const [pageNotFound, setPageNotFound] = useState(false)

  // Auth gate
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) router.replace('/login')
      else setAuthChecked(true)
    })
  }, [router])

  // Carrega a página do banco
  useEffect(() => {
    if (!authChecked || !pageId) return
    let cancelled = false
    ;(async () => {
      const { data, error } = await supabase
        .from('pages')
        .select('*')
        .eq('id', pageId)
        .maybeSingle()
      if (cancelled) return
      if (error) {
        console.error('Erro ao carregar página:', error)
        setPageNotFound(true)
      } else if (!data) {
        setPageNotFound(true)
      } else {
        setPageRecord(data)
      }
      setPageLoading(false)
    })()
    return () => { cancelled = true }
  }, [authChecked, pageId])

  const [messages, setMessages] = useState([
    {
      role: 'ai',
      text: '👋 Olá! Sou seu assistente de edição. Me diga o que quer mudar na página — pode ser em linguagem natural!\n\nExemplos:\n• "Muda o título para Aumente suas Vendas"\n• "Deixa o fundo do hero azul escuro"\n• "Troca o texto do botão para Quero Começar"',
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState({ show: false, text: '' })
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)

  // Inicializa GrapeJS (só após auth confirmado e página carregada)
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!authChecked) return
    if (pageLoading) return
    if (pageNotFound) return

    // Importa dinamicamente pois GrapeJS é client-only
    const initGrapes = async () => {
      const grapesjs = (await import('grapesjs')).default
      await import('grapesjs/dist/css/grapes.min.css')
      await import('grapesjs-blocks-basic')

      if (grapeRef.current) return // já inicializado

      const editor = grapesjs.init({
        container: '#gjs',
        height: '100%',
        width: 'auto',
        storageManager: false,
        panels: { defaults: [] },
        deviceManager: {
          devices: [
            { name: 'Desktop', width: '' },
            { name: 'Mobile', width: '375px', widthMedia: '480px' },
          ],
        },
        plugins: ['gjs-blocks-basic'],
        pluginsOpts: {
          'gjs-blocks-basic': { flexGrid: true },
        },
        canvas: {
          styles: [
            'https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500;600;700&display=swap',
          ],
        },
      })

      // Se a página já tem conteúdo salvo, usa ele; senão carrega o template
      const hasContent = pageRecord?.html && pageRecord.html.trim().length > 0
      editor.setComponents(hasContent ? pageRecord.html : salesPageTemplate.html)
      editor.setStyle(hasContent && pageRecord.css ? pageRecord.css : salesPageTemplate.css)

      grapeRef.current = editor
    }

    initGrapes()

    return () => {
      if (grapeRef.current) {
        grapeRef.current.destroy()
        grapeRef.current = null
      }
    }
  }, [authChecked, pageLoading, pageNotFound, pageRecord])

  // Auto-scroll no chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Aplica as ações da IA no editor GrapeJS
  const applyActions = (actions) => {
    const editor = grapeRef.current
    if (!editor || !actions?.length) return

    const canvas = editor.Canvas
    const doc = canvas.getDocument()

    actions.forEach((action) => {
      try {
        const el = doc.querySelector(action.selector)
        if (!el) {
          console.warn('Seletor não encontrado:', action.selector)
          return
        }

        if (action.type === 'replace_text') {
          el.innerText = action.newText
        } else if (action.type === 'replace_html') {
          el.innerHTML = action.newHtml
        } else if (action.type === 'change_style' || action.type === 'change_color') {
          el.style[action.property] = action.value
        }
      } catch (err) {
        console.error('Erro ao aplicar ação:', err)
      }
    })

    // Força o editor a reconhecer as mudanças
    editor.trigger('change:changesCount')
  }

  const sendMessage = async (text) => {
    const msg = text || input
    if (!msg.trim() || loading) return

    setInput('')
    setMessages((prev) => [...prev, { role: 'user', text: msg }])
    setLoading(true)

    // Mensagem de loading
    setMessages((prev) => [...prev, { role: 'ai', text: '...', loading: true }])

    try {
      const response = await fetch('/api/ai-edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: msg,
          pageContext: 'Página de vendas com seções: hero, benefícios, depoimentos, preços e CTA.',
        }),
      })

      const data = await response.json()

      // Remove mensagem de loading
      setMessages((prev) => prev.filter((m) => !m.loading))

      if (data.actions?.length) {
        applyActions(data.actions)
        setMessages((prev) => [
          ...prev,
          { role: 'ai', text: data.message || '✅ Feito! Verifique a mudança na página.' },
        ])
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: 'ai',
            text: data.message || 'Não consegui entender o pedido. Tente ser mais específico.',
          },
        ])
      }
    } catch {
      setMessages((prev) => prev.filter((m) => !m.loading))
      setMessages((prev) => [
        ...prev,
        { role: 'ai', text: '⚠️ Erro ao conectar com a IA. Verifique sua conexão.' },
      ])
    } finally {
      setLoading(false)
    }
  }

  const savePage = async (opts = {}) => {
    const { silent = false } = opts
    const editor = grapeRef.current
    if (!editor) return

    setSaving(true)
    const html = editor.getHtml()
    const css = editor.getCss()

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token
      if (!token) {
        showToast('⚠️ Sessão expirada')
        router.replace('/login')
        return
      }
      const res = await fetch('/api/save-page', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          pageId,
          html,
          css,
          title: pageRecord?.title || 'Minha Página',
          template: pageRecord?.template,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Falha ao salvar')
      if (json.page) setPageRecord(json.page)
      if (!silent) showToast('✅ Página salva com sucesso!')
    } catch (err) {
      console.error(err)
      if (!silent) showToast('⚠️ Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  const showToast = (text) => {
    setToast({ show: true, text })
    setTimeout(() => setToast({ show: false, text: '' }), 4000)
  }

  const publishPage = async () => {
    if (!grapeRef.current || publishing) return

    // Se já está publicada, oferece copiar URL ou despublicar
    if (pageRecord?.published && pageRecord?.slug) {
      const url = `${window.location.origin}/p/${pageRecord.slug}`
      const choice = confirm(
        `Esta página já está publicada em:\n${url}\n\n[OK] Copiar URL  ·  [Cancelar] Despublicar`
      )
      if (choice) {
        try {
          await navigator.clipboard.writeText(url)
          showToast('🔗 Link copiado!')
        } catch {
          window.prompt('Copie a URL:', url)
        }
        return
      }
      // Despublicar
      setPublishing(true)
      try {
        const { data: { session } } = await supabase.auth.getSession()
        const res = await fetch('/api/publish-page', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({ pageId, action: 'unpublish' }),
        })
        const json = await res.json()
        if (!res.ok) throw new Error(json.error)
        setPageRecord(json.page)
        showToast('Página despublicada')
      } catch (err) {
        showToast('⚠️ Erro: ' + err.message)
      } finally {
        setPublishing(false)
      }
      return
    }

    // Publicar pela primeira vez — sugere slug a partir do título
    const suggested = (pageRecord?.title || 'pagina')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60)

    const slug = window.prompt(
      'Escolha um endereço para sua página (ex: minha-oferta):',
      suggested
    )
    if (slug === null) return // cancelou

    setPublishing(true)
    try {
      // Salva primeiro o conteúdo atual
      await savePage({ silent: true })

      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/publish-page', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ pageId, action: 'publish', slug }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Falha')

      setPageRecord(json.page)
      const url = `${window.location.origin}/p/${json.slug}`
      try {
        await navigator.clipboard.writeText(url)
        showToast('🚀 Publicado! Link copiado: /p/' + json.slug)
      } catch {
        showToast('🚀 Publicado em /p/' + json.slug)
      }
    } catch (err) {
      showToast('⚠️ Erro ao publicar: ' + err.message)
    } finally {
      setPublishing(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  if (pageNotFound) {
    return (
      <div className="auth-bg">
        <div className="auth-card">
          <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
          <h1 className="auth-title">Página não encontrada</h1>
          <p className="auth-subtitle">
            Esta página não existe ou você não tem acesso a ela.
          </p>
          <button
            onClick={() => router.replace('/dashboard')}
            className="auth-btn"
          >
            Voltar ao dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>PageCraft — Editor</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </Head>

      {/* Top Bar */}
      <div className="top-bar">
        <div className="top-bar-logo">
          Page<span>Craft</span>
        </div>
        <div className="top-bar-spacer" />
        <button
          className="top-bar-btn btn-ghost"
          onClick={() => {
            const editor = grapeRef.current
            if (editor) editor.runCommand('preview')
          }}
        >
          Preview
        </button>
        <button
          className="top-bar-btn btn-ghost"
          onClick={() => {
            const editor = grapeRef.current
            if (editor) {
              const device = editor.getDevice()
              editor.setDevice(device === 'Mobile' ? 'Desktop' : 'Mobile')
            }
          }}
        >
          📱 Mobile
        </button>
        <button
          className="top-bar-btn btn-success"
          onClick={savePage}
          disabled={saving}
        >
          {saving ? 'Salvando...' : '💾 Salvar'}
        </button>
        <button
          className="top-bar-btn btn-primary"
          onClick={publishPage}
          disabled={publishing}
        >
          {publishing
            ? 'Publicando...'
            : pageRecord?.published
              ? '🔗 Publicada'
              : '🚀 Publicar'}
        </button>
      </div>

      {/* Editor Layout */}
      <div className="editor-wrap" style={{ height: 'calc(100vh - 52px)' }}>
        {/* GrapeJS Canvas */}
        <div className="editor-canvas">
          <div id="gjs" ref={editorRef} />
        </div>

        {/* AI Chat Panel */}
        <div className="ai-panel">
          <div className="ai-panel-header">
            <span style={{ fontSize: 20 }}>✦</span>
            <h2>Assistente IA</h2>
            <span className="ai-badge">Claude</span>
          </div>

          {/* Messages */}
          <div className="ai-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`msg ${msg.role} ${msg.loading ? 'loading' : ''}`}>
                {msg.loading ? (
                  <span>Analisando seu pedido...</span>
                ) : (
                  msg.text
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestion Chips */}
          <div className="ai-suggestions">
            {SUGGESTIONS.map((s) => (
              <button key={s} className="suggestion-chip" onClick={() => sendMessage(s)}>
                {s}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="ai-input-area">
            <textarea
              className="ai-input"
              placeholder="Ex: muda o título para..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
            />
            <button
              className="ai-send-btn"
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Toast */}
      <div className={`toast ${toast.show ? 'show' : ''}`}>{toast.text}</div>
    </>
  )
}
