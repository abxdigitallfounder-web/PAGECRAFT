// pages/content-editor/[siteId].js
// Editor de conteúdo estruturado: campos à esquerda, preview iframe à direita.

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { supabase } from '../../lib/supabaseClient'

const SCHEMA = {
  hero: {
    label: '🏠 Hero',
    fields: [
      { key: 'heroTag', label: 'Tag acima do título', type: 'text' },
      { key: 'heroTitle', label: 'Título principal', type: 'textarea' },
      { key: 'heroSubtitle', label: 'Subtítulo', type: 'textarea' },
      { key: 'heroBg', label: 'Cor de fundo', type: 'color' },
      { key: 'heroTextColor', label: 'Cor do texto', type: 'color' },
      { key: 'ctaPrimaryText', label: 'Botão primário — texto', type: 'text' },
      { key: 'ctaPrimaryUrl', label: 'Botão primário — link', type: 'url' },
      { key: 'ctaPrimaryBg', label: 'Botão primário — cor', type: 'color' },
      { key: 'ctaSecondaryText', label: 'Botão secundário — texto', type: 'text' },
      { key: 'heroGuaranteeText', label: 'Texto de garantia', type: 'text' },
    ],
  },
  benefits: {
    label: '✨ Benefícios',
    fields: [
      { key: 'benefitsTitle', label: 'Título da seção', type: 'text' },
      { key: 'benefit1Icon', label: 'Benefício 1 — emoji', type: 'text' },
      { key: 'benefit1Title', label: 'Benefício 1 — título', type: 'text' },
      { key: 'benefit1Text', label: 'Benefício 1 — descrição', type: 'textarea' },
      { key: 'benefit2Icon', label: 'Benefício 2 — emoji', type: 'text' },
      { key: 'benefit2Title', label: 'Benefício 2 — título', type: 'text' },
      { key: 'benefit2Text', label: 'Benefício 2 — descrição', type: 'textarea' },
      { key: 'benefit3Icon', label: 'Benefício 3 — emoji', type: 'text' },
      { key: 'benefit3Title', label: 'Benefício 3 — título', type: 'text' },
      { key: 'benefit3Text', label: 'Benefício 3 — descrição', type: 'textarea' },
    ],
  },
  testimonials: {
    label: '💬 Depoimentos',
    fields: [
      { key: 'testimonialsTitle', label: 'Título da seção', type: 'text' },
      { key: 't1Text', label: 'Depoimento 1 — texto', type: 'textarea' },
      { key: 't1Name', label: 'Depoimento 1 — nome', type: 'text' },
      { key: 't1Role', label: 'Depoimento 1 — cargo', type: 'text' },
      { key: 't1AvatarBg', label: 'Depoimento 1 — cor avatar', type: 'color' },
      { key: 't2Text', label: 'Depoimento 2 — texto', type: 'textarea' },
      { key: 't2Name', label: 'Depoimento 2 — nome', type: 'text' },
      { key: 't2Role', label: 'Depoimento 2 — cargo', type: 'text' },
      { key: 't2AvatarBg', label: 'Depoimento 2 — cor avatar', type: 'color' },
    ],
  },
  pricing: {
    label: '💰 Preços',
    fields: [
      { key: 'pricingTitle', label: 'Título da seção', type: 'text' },
      { key: 'planName', label: 'Nome do plano', type: 'text' },
      { key: 'planPrice', label: 'Preço (ex: R$497)', type: 'text' },
      { key: 'planPeriod', label: 'Período (ex: /mês)', type: 'text' },
      { key: 'planFeature1', label: 'Feature 1', type: 'text' },
      { key: 'planFeature2', label: 'Feature 2', type: 'text' },
      { key: 'planFeature3', label: 'Feature 3', type: 'text' },
      { key: 'planCtaText', label: 'Botão — texto', type: 'text' },
      { key: 'planCtaUrl', label: 'Botão — link', type: 'url' },
    ],
  },
  cta: {
    label: '🎯 CTA',
    fields: [
      { key: 'ctaTitle', label: 'Título do CTA', type: 'textarea' },
      { key: 'ctaSubtitle', label: 'Subtítulo', type: 'text' },
      { key: 'ctaButtonText', label: 'Texto do botão', type: 'text' },
      { key: 'ctaButtonUrl', label: 'Link do botão', type: 'url' },
      { key: 'ctaBg', label: 'Cor de fundo', type: 'color' },
    ],
  },
  footer: {
    label: '🔗 Footer',
    fields: [
      { key: 'footerText', label: 'Texto do rodapé', type: 'text' },
      { key: 'footerBg', label: 'Cor de fundo', type: 'color' },
    ],
  },
}

export default function ContentEditor() {
  const router = useRouter()
  const { siteId } = router.query

  const [authChecked, setAuthChecked] = useState(false)
  const [site, setSite] = useState(null)
  const [content, setContent] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [openSections, setOpenSections] = useState({ hero: true })
  const [iframeKey, setIframeKey] = useState(0)
  const [toast, setToast] = useState({ show: false, text: '' })

  // IA
  const [aiInput, setAiInput] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiMessage, setAiMessage] = useState('')

  const debounceRef = useRef(null)

  // Auth gate
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) router.replace('/login')
      else setAuthChecked(true)
    })
  }, [router])

  // Carrega site + conteúdo
  useEffect(() => {
    if (!authChecked || !siteId) return
    let cancelled = false
    ;(async () => {
      setLoading(true)
      const [{ data: siteRow }, contentRes] = await Promise.all([
        supabase.from('sites').select('*').eq('site_id', siteId).maybeSingle(),
        fetch(`/api/content/${siteId}`).then((r) => r.json()),
      ])
      if (cancelled) return
      setSite(siteRow)
      setContent(contentRes?.content || {})
      setLoading(false)
    })()
    return () => { cancelled = true }
  }, [authChecked, siteId])

  // Debounce reload do iframe
  const scheduleReload = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setIframeKey((k) => k + 1)
    }, 800)
  }

  const updateField = (key, value) => {
    setContent((prev) => ({ ...prev, [key]: value }))
    scheduleReload()
  }

  const showToast = (text) => {
    setToast({ show: true, text })
    setTimeout(() => setToast({ show: false, text: '' }), 3000)
  }

  const save = async () => {
    if (saving) return
    setSaving(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch(`/api/content/${siteId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ content }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Falha')
      showToast('✅ Conteúdo salvo!')
      setIframeKey((k) => k + 1)
    } catch (err) {
      showToast('⚠️ Erro: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const askAI = async () => {
    if (!aiInput.trim() || aiLoading) return
    setAiLoading(true)
    setAiMessage('')
    try {
      const res = await fetch('/api/ai-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: aiInput, currentContent: content, siteId }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Falha')
      const updates = json.updates || {}
      if (Object.keys(updates).length === 0) {
        setAiMessage(json.message || 'Sem alterações.')
      } else {
        setContent((prev) => ({ ...prev, ...updates }))
        setAiMessage(`✨ ${Object.keys(updates).length} campo(s) atualizado(s).`)
        scheduleReload()
        setAiInput('')
      }
    } catch (err) {
      setAiMessage('⚠️ ' + err.message)
    } finally {
      setAiLoading(false)
    }
  }

  if (!authChecked || loading) {
    return (
      <div style={fullCenter}>
        <div style={{ color: '#94A3B8', fontFamily: 'DM Sans, sans-serif' }}>Carregando...</div>
      </div>
    )
  }

  if (!site) {
    return (
      <div style={fullCenter}>
        <div style={{ color: '#fca5a5' }}>Site não encontrado</div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>PageCraft — Editor de {site.name}</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </Head>

      <div style={layout}>
        {/* COLUNA ESQUERDA */}
        <aside style={leftCol}>
          <div style={topBar}>
            <div style={logoStyle}>
              Page<span style={{ color: '#818cf8' }}>Craft</span>
            </div>
            <span style={badgeStyle}>{site.name}</span>
            <div style={{ flex: 1 }} />
            <button onClick={save} disabled={saving} style={saveBtn(saving)}>
              {saving ? 'Salvando...' : '💾 Salvar'}
            </button>
          </div>

          <div style={scrollWrap}>
            {Object.entries(SCHEMA).map(([sectionKey, section]) => {
              const open = openSections[sectionKey]
              return (
                <div key={sectionKey} style={accordion}>
                  <div
                    onClick={() => setOpenSections((p) => ({ ...p, [sectionKey]: !p[sectionKey] }))}
                    style={accordionHeader}
                  >
                    <span>{section.label}</span>
                    <span style={{ fontSize: 12, color: '#64748b' }}>{open ? '▾' : '▸'}</span>
                  </div>
                  {open && (
                    <div style={fieldsWrap}>
                      {section.fields.map((f) => (
                        <Field
                          key={f.key}
                          field={f}
                          value={content[f.key] ?? ''}
                          onChange={(v) => updateField(f.key, v)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* AI panel fixo no rodapé */}
          <div style={aiPanel}>
            <div style={aiHeader}>
              <span style={{ fontSize: 16 }}>✦</span>
              <strong style={{ fontFamily: 'Syne', fontSize: 14 }}>Assistente IA</strong>
              <span style={aiBadge}>Claude</span>
            </div>
            {aiMessage && <div style={aiFeedback}>{aiMessage}</div>}
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && askAI()}
                placeholder="Ex: deixa o hero mais urgente, muda o tom para fitness..."
                style={aiInputStyle}
              />
              <button onClick={askAI} disabled={aiLoading || !aiInput.trim()} style={aiSendBtn(aiLoading)}>
                {aiLoading ? '...' : '➤'}
              </button>
            </div>
          </div>
        </aside>

        {/* COLUNA DIREITA — preview */}
        <div style={rightCol}>
          <button
            onClick={() => setIframeKey((k) => k + 1)}
            style={refreshBtn}
            title="Atualizar preview"
          >
            🔄 Atualizar Preview
          </button>
          <iframe
            key={iframeKey}
            src={site.url}
            sandbox="allow-scripts allow-same-origin"
            style={iframeStyle}
          />
        </div>
      </div>

      {toast.show && <div style={toastStyle}>{toast.text}</div>}
    </>
  )
}

// ─────── Field component ───────
function Field({ field, value, onChange }) {
  const baseInput = {
    width: '100%',
    background: '#1e293b',
    border: '1px solid #334155',
    borderRadius: 8,
    padding: '10px 12px',
    color: '#f1f5f9',
    fontSize: 13,
    fontFamily: 'DM Sans, sans-serif',
    outline: 'none',
    transition: 'border-color 0.15s',
  }

  if (field.type === 'textarea') {
    return (
      <label style={fieldLabel}>
        <span>{field.label}</span>
        <textarea
          value={value}
          rows={3}
          onChange={(e) => onChange(e.target.value)}
          style={{ ...baseInput, resize: 'vertical' }}
          onFocus={(e) => (e.target.style.borderColor = '#6366f1')}
          onBlur={(e) => (e.target.style.borderColor = '#334155')}
        />
      </label>
    )
  }

  if (field.type === 'color') {
    return (
      <label style={fieldLabel}>
        <span>{field.label}</span>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            type="color"
            value={isHex(value) ? value : '#0f172a'}
            onChange={(e) => onChange(e.target.value)}
            style={{ width: 44, height: 36, border: 'none', borderRadius: 6, background: 'transparent', cursor: 'pointer' }}
          />
          <input
            type="text"
            value={value}
            placeholder="#0f172a ou linear-gradient(...)"
            onChange={(e) => onChange(e.target.value)}
            style={baseInput}
          />
        </div>
      </label>
    )
  }

  if (field.type === 'url') {
    return (
      <label style={fieldLabel}>
        <span>{field.label}</span>
        <div style={{ position: 'relative' }}>
          <span style={iconLeft}>🔗</span>
          <input
            type="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://..."
            style={{ ...baseInput, paddingLeft: 32 }}
          />
        </div>
      </label>
    )
  }

  return (
    <label style={fieldLabel}>
      <span>{field.label}</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={baseInput}
        onFocus={(e) => (e.target.style.borderColor = '#6366f1')}
        onBlur={(e) => (e.target.style.borderColor = '#334155')}
      />
    </label>
  )
}

const isHex = (v) => typeof v === 'string' && /^#[0-9a-f]{3,8}$/i.test(v)

// ─────── styles ───────
const layout = { display: 'flex', height: '100vh', overflow: 'hidden', fontFamily: 'DM Sans, sans-serif' }
const fullCenter = { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a' }

const leftCol = {
  width: 420,
  background: '#0f172a',
  display: 'flex',
  flexDirection: 'column',
  borderRight: '1px solid #1e293b',
}

const topBar = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  padding: '14px 16px',
  borderBottom: '1px solid #1e293b',
}

const logoStyle = { fontFamily: 'Syne, sans-serif', fontWeight: 800, color: 'white', fontSize: 16 }
const badgeStyle = {
  fontSize: 11,
  padding: '4px 8px',
  background: '#1e293b',
  border: '1px solid #334155',
  borderRadius: 99,
  color: '#cbd5e1',
  maxWidth: 160,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
}

const saveBtn = (saving) => ({
  background: saving ? '#334155' : '#10b981',
  color: 'white',
  border: 'none',
  borderRadius: 8,
  padding: '8px 14px',
  fontSize: 13,
  fontWeight: 600,
  cursor: saving ? 'wait' : 'pointer',
})

const scrollWrap = { flex: 1, overflowY: 'auto', padding: '12px 16px' }

const accordion = { marginBottom: 8, background: '#0a0f1e', border: '1px solid #1e293b', borderRadius: 10, overflow: 'hidden' }
const accordionHeader = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '12px 14px',
  cursor: 'pointer',
  color: '#e2e8f0',
  fontWeight: 600,
  fontSize: 13.5,
  background: '#0a0f1e',
}
const fieldsWrap = { padding: '4px 14px 14px', display: 'flex', flexDirection: 'column', gap: 12 }
const fieldLabel = {
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
  fontSize: 12,
  color: '#94a3b8',
  fontWeight: 500,
}
const iconLeft = { position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: '#475569' }

const aiPanel = {
  borderTop: '1px solid #1e293b',
  background: '#0a0f1e',
  padding: 14,
  display: 'flex',
  flexDirection: 'column',
  gap: 10,
}
const aiHeader = { display: 'flex', alignItems: 'center', gap: 8, color: '#e2e8f0' }
const aiBadge = {
  fontSize: 9,
  background: '#6366f1',
  color: 'white',
  padding: '2px 6px',
  borderRadius: 99,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  fontWeight: 700,
}
const aiFeedback = { fontSize: 12, color: '#94a3b8', background: '#1e293b', padding: '6px 10px', borderRadius: 6 }
const aiInputStyle = {
  flex: 1,
  background: '#1e293b',
  border: '1px solid #334155',
  borderRadius: 8,
  padding: '9px 12px',
  color: '#f1f5f9',
  fontSize: 12.5,
  outline: 'none',
  fontFamily: 'DM Sans, sans-serif',
}
const aiSendBtn = (l) => ({
  width: 38,
  height: 38,
  background: l ? '#334155' : '#6366f1',
  color: 'white',
  border: 'none',
  borderRadius: 8,
  cursor: l ? 'wait' : 'pointer',
  fontSize: 14,
})

const rightCol = { flex: 1, position: 'relative', background: '#1e293b' }
const refreshBtn = {
  position: 'absolute',
  top: 14,
  right: 14,
  zIndex: 10,
  background: 'rgba(15,23,42,0.9)',
  color: 'white',
  border: '1px solid #334155',
  borderRadius: 8,
  padding: '8px 14px',
  fontSize: 12,
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: 'DM Sans, sans-serif',
}
const iframeStyle = { width: '100%', height: '100%', border: 'none', background: 'white' }

const toastStyle = {
  position: 'fixed',
  bottom: 24,
  left: '50%',
  transform: 'translateX(-50%)',
  background: '#10b981',
  color: 'white',
  padding: '12px 24px',
  borderRadius: 10,
  fontSize: 14,
  fontWeight: 500,
  zIndex: 9999,
  boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
}
