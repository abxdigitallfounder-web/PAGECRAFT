// pages/dashboard.js
// Dashboard — lista de sites cadastrados pela agência.

import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { supabase } from '../lib/supabaseClient'

const GRADIENTS = [
  'linear-gradient(135deg,#6366f1,#4f46e5)',
  'linear-gradient(135deg,#0f172a,#1e1b4b)',
  'linear-gradient(135deg,#10b981,#059669)',
  'linear-gradient(135deg,#f59e0b,#ea580c)',
  'linear-gradient(135deg,#ec4899,#be185d)',
]

function formatRelative(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  const diff = Date.now() - d.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'agora'
  if (mins < 60) return `há ${mins} min`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `há ${hrs}h`
  const days = Math.floor(hrs / 24)
  if (days === 1) return 'ontem'
  if (days < 7) return `há ${days} dias`
  return d.toLocaleDateString('pt-BR')
}

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [checking, setChecking] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)
  const [sites, setSites] = useState([])
  const [loadingSites, setLoadingSites] = useState(true)

  const loadSites = async () => {
    setLoadingSites(true)
    try {
      const res = await fetch('/api/sites')
      const json = await res.json()
      setSites(json.sites || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingSites(false)
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace('/login')
        return
      }
      setUser(session.user)
      setChecking(false)
      loadSites()
    })

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) router.replace('/login')
      else setUser(session.user)
    })
    return () => sub.subscription.unsubscribe()
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.replace('/login')
  }

  if (checking) {
    return (
      <div className="auth-bg">
        <div style={{ color: '#94A3B8', fontFamily: 'DM Sans, sans-serif' }}>Carregando...</div>
      </div>
    )
  }

  const initial = (user?.user_metadata?.full_name || user?.email || 'C').charAt(0).toUpperCase()
  const displayName = user?.user_metadata?.full_name || user?.email

  return (
    <>
      <Head>
        <title>PageCraft — Sites</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </Head>

      <div className="dashboard">
        <nav className="dashboard-nav">
          <div className="dashboard-logo">
            Page<span>Craft</span>
          </div>
          <div style={{ flex: 1 }} />
          <div style={{ position: 'relative' }}>
            <div onClick={() => setMenuOpen((v) => !v)} style={avatarStyle} title={displayName}>
              {initial}
            </div>
            {menuOpen && (
              <div style={dropdownStyle}>
                <div style={dropdownInfo}>
                  <div style={{ fontWeight: 600, color: '#0f172a', marginBottom: 2 }}>{displayName}</div>
                  <div style={{ fontSize: 12 }}>{user?.email}</div>
                </div>
                <button onClick={handleLogout} style={dropdownBtn}>🚪 Sair</button>
              </div>
            )}
          </div>
        </nav>

        <div style={{ padding: '48px 32px', maxWidth: 1200, margin: '0 auto' }}>
          <div style={headerRow}>
            <div>
              <h1 style={h1Style}>Sites do Cliente</h1>
              <p style={subStyle}>Cada site da agência aparece aqui. Edite o conteúdo dinâmico em tempo real.</p>
            </div>
            <Link href="/sites/new">
              <button style={primaryBtn}>＋ Cadastrar Site</button>
            </Link>
          </div>

          {/* Stats */}
          <div style={statsGrid}>
            {[
              { label: 'Sites Cadastrados', value: String(sites.length), icon: '🌐' },
              { label: 'Em Produção', value: String(sites.length), icon: '🚀' },
              { label: 'Edições Hoje', value: '—', icon: '✏️' },
            ].map((s) => (
              <div key={s.label} style={statCard}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>{s.icon}</div>
                <div style={statValue}>{s.value}</div>
                <div style={statLabel}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Grid */}
          {loadingSites ? (
            <div style={loadingBox}>Carregando sites...</div>
          ) : sites.length === 0 ? (
            <div style={emptyBox}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🌐</div>
              <h3 style={emptyTitle}>Nenhum site cadastrado ainda</h3>
              <p style={emptyText}>
                Faça o deploy do template React de um cliente na Vercel e cadastre o site aqui.
              </p>
              <Link href="/sites/new">
                <button style={primaryBtn}>＋ Cadastrar primeiro site</button>
              </Link>
            </div>
          ) : (
            <div style={cardsGrid}>
              {sites.map((site, idx) => (
                <div key={site.id} className="page-card">
                  <div className="page-card-preview" style={{ background: GRADIENTS[idx % GRADIENTS.length] }}>
                    {site.site_id}
                  </div>
                  <div className="page-card-body">
                    <div className="page-card-title">{site.name}</div>
                    <div className="page-card-meta">
                      Cadastrado {formatRelative(site.created_at)}
                    </div>
                  </div>
                  <div className="page-card-actions">
                    <Link href={`/content-editor/${site.site_id}`} style={{ flex: 1 }}>
                      <button style={editBtn}>✏️ Editar Conteúdo</button>
                    </Link>
                    <a
                      href={site.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ textDecoration: 'none' }}
                    >
                      <button style={viewBtn} title="Abrir site em nova aba">🔗 Ver Site</button>
                    </a>
                  </div>
                </div>
              ))}
              <Link href="/sites/new">
                <div style={addCard}>
                  <div style={addIcon}>+</div>
                  <div style={addText}>Cadastrar Site</div>
                </div>
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

const avatarStyle = {
  width: 36,
  height: 36,
  borderRadius: '50%',
  background: '#6366f1',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'white',
  fontFamily: 'Syne, sans-serif',
  fontWeight: 700,
  fontSize: 14,
  cursor: 'pointer',
}
const dropdownStyle = {
  position: 'absolute',
  top: 44,
  right: 0,
  background: 'white',
  border: '1px solid #e2e8f0',
  borderRadius: 10,
  boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
  minWidth: 200,
  overflow: 'hidden',
  zIndex: 50,
}
const dropdownInfo = {
  padding: '12px 14px',
  borderBottom: '1px solid #f1f5f9',
  fontFamily: 'DM Sans, sans-serif',
  fontSize: 13,
  color: '#64748b',
}
const dropdownBtn = {
  width: '100%',
  padding: '10px 14px',
  background: 'transparent',
  border: 'none',
  textAlign: 'left',
  fontFamily: 'DM Sans, sans-serif',
  fontSize: 13,
  color: '#ef4444',
  cursor: 'pointer',
}
const headerRow = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40 }
const h1Style = { fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 28, color: '#0f172a', marginBottom: 6 }
const subStyle = { fontFamily: 'DM Sans, sans-serif', color: '#64748b', fontSize: 15 }
const primaryBtn = {
  background: '#6366f1',
  color: 'white',
  padding: '12px 24px',
  borderRadius: 10,
  border: 'none',
  fontFamily: 'DM Sans, sans-serif',
  fontWeight: 600,
  fontSize: 14,
  cursor: 'pointer',
}
const statsGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 40 }
const statCard = { background: 'white', border: '1px solid #e2e8f0', borderRadius: 12, padding: '20px 24px' }
const statValue = { fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 28, color: '#0f172a', lineHeight: 1, marginBottom: 4 }
const statLabel = { fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: '#94a3b8' }
const cardsGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }
const loadingBox = { color: '#94a3b8', fontFamily: 'DM Sans, sans-serif', padding: 40, textAlign: 'center' }
const emptyBox = {
  background: 'white',
  border: '2px dashed #e2e8f0',
  borderRadius: 16,
  padding: 60,
  textAlign: 'center',
  fontFamily: 'DM Sans, sans-serif',
}
const emptyTitle = { fontFamily: 'Syne, sans-serif', fontWeight: 700, color: '#0f172a', fontSize: 20, marginBottom: 8 }
const emptyText = { color: '#64748b', fontSize: 14, marginBottom: 24, maxWidth: 400, margin: '0 auto 24px' }
const editBtn = {
  width: '100%',
  background: '#6366f1',
  color: 'white',
  padding: '9px 16px',
  borderRadius: 8,
  border: 'none',
  fontFamily: 'DM Sans, sans-serif',
  fontWeight: 600,
  fontSize: 13,
  cursor: 'pointer',
}
const viewBtn = {
  background: 'transparent',
  color: '#64748b',
  padding: '9px 16px',
  borderRadius: 8,
  border: '1px solid #e2e8f0',
  fontFamily: 'DM Sans, sans-serif',
  fontWeight: 500,
  fontSize: 13,
  cursor: 'pointer',
}
const addCard = {
  border: '2px dashed #e2e8f0',
  borderRadius: 16,
  minHeight: 280,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 12,
  cursor: 'pointer',
  fontFamily: 'DM Sans, sans-serif',
}
const addIcon = {
  width: 48,
  height: 48,
  borderRadius: 12,
  background: '#f1f5f9',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 24,
  color: '#6366f1',
}
const addText = { fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 14, color: '#94a3b8' }
