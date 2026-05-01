// pages/sites/new.js
// Cadastro de novo site cliente.

import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { supabase } from '../../lib/supabaseClient'

const SLUG_RE = /^[a-z0-9](?:[a-z0-9-]{1,58}[a-z0-9])?$/

function slugify(s) {
  return String(s || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
}

export default function NewSite() {
  const router = useRouter()
  const [authChecked, setAuthChecked] = useState(false)
  const [name, setName] = useState('')
  const [siteId, setSiteId] = useState('')
  const [siteIdEdited, setSiteIdEdited] = useState(false)
  const [url, setUrl] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) router.replace('/login')
      else setAuthChecked(true)
    })
  }, [router])

  // Auto-slug a partir do nome até o usuário editar manualmente
  useEffect(() => {
    if (!siteIdEdited) setSiteId(slugify(name))
  }, [name, siteIdEdited])

  const submit = async () => {
    setError('')
    if (!name.trim() || !siteId.trim() || !url.trim()) {
      setError('Preencha nome, siteId e URL.')
      return
    }
    if (!SLUG_RE.test(siteId)) {
      setError('siteId inválido. Use letras minúsculas, números e hífens.')
      return
    }
    try {
      new URL(url)
    } catch {
      setError('URL inválida. Inclua o https://')
      return
    }

    setSubmitting(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/sites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ name, siteId, url, clientEmail }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Falha')
      router.replace(`/content-editor/${siteId}?welcome=1`)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (!authChecked) {
    return (
      <div style={center}>
        <div style={{ color: '#94a3b8' }}>Carregando...</div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>PageCraft — Cadastrar Site</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </Head>

      <div style={pageBg}>
        <div style={card}>
          <Link href="/dashboard" style={backLink}>← Dashboard</Link>
          <h1 style={title}>Cadastrar novo site</h1>
          <p style={subtitle}>
            Após o deploy do site na Vercel, registre-o aqui para que o cliente possa editar o conteúdo.
          </p>

          <div style={form}>
            <Input label="Nome do cliente / projeto" value={name} onChange={setName} placeholder="Academia do João" />

            <Input
              label="Site ID (slug único)"
              value={siteId}
              onChange={(v) => { setSiteIdEdited(true); setSiteId(slugify(v)) }}
              placeholder="academia-joao"
              hint="Apenas letras minúsculas, números e hífens. Será o identificador interno."
            />

            <Input
              label="URL do site (Vercel)"
              value={url}
              onChange={setUrl}
              placeholder="https://academia-joao.vercel.app"
              type="url"
            />

            <Input
              label="Email do cliente (opcional)"
              value={clientEmail}
              onChange={setClientEmail}
              placeholder="cliente@empresa.com"
              type="email"
            />

            {error && <div style={errorBox}>{error}</div>}

            <button onClick={submit} disabled={submitting} style={submitBtn(submitting)}>
              {submitting ? 'Cadastrando...' : 'Cadastrar Site'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

function Input({ label, value, onChange, placeholder, type = 'text', hint }) {
  return (
    <label style={labelStyle}>
      <span>{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={inputStyle}
        onFocus={(e) => (e.target.style.borderColor = '#6366f1')}
        onBlur={(e) => (e.target.style.borderColor = '#e2e8f0')}
      />
      {hint && <small style={hintStyle}>{hint}</small>}
    </label>
  )
}

const center = { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }
const pageBg = { minHeight: '100vh', background: '#f8fafc', padding: '40px 20px', fontFamily: 'DM Sans, sans-serif' }
const card = {
  maxWidth: 520,
  margin: '0 auto',
  background: 'white',
  borderRadius: 16,
  border: '1px solid #e2e8f0',
  padding: 36,
  boxShadow: '0 4px 20px rgba(15,23,42,0.04)',
}
const backLink = { fontSize: 13, color: '#6366f1', fontWeight: 500, textDecoration: 'none', display: 'inline-block', marginBottom: 16 }
const title = { fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 26, color: '#0f172a', marginBottom: 6 }
const subtitle = { fontSize: 14, color: '#64748b', marginBottom: 28, lineHeight: 1.5 }
const form = { display: 'flex', flexDirection: 'column', gap: 18 }
const labelStyle = { display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, fontWeight: 500, color: '#334155' }
const inputStyle = {
  background: '#f8fafc',
  border: '1px solid #e2e8f0',
  borderRadius: 10,
  padding: '12px 14px',
  fontSize: 14,
  fontFamily: 'DM Sans, sans-serif',
  outline: 'none',
  transition: 'border-color 0.15s',
  color: '#0f172a',
}
const hintStyle = { fontSize: 12, color: '#94a3b8', fontWeight: 400 }
const errorBox = {
  background: '#fee2e2',
  border: '1px solid #fecaca',
  color: '#b91c1c',
  padding: '10px 14px',
  borderRadius: 10,
  fontSize: 13,
}
const submitBtn = (sub) => ({
  background: sub ? '#94a3b8' : '#6366f1',
  color: 'white',
  border: 'none',
  borderRadius: 10,
  padding: 13,
  fontSize: 14,
  fontWeight: 600,
  cursor: sub ? 'wait' : 'pointer',
  fontFamily: 'DM Sans, sans-serif',
})
