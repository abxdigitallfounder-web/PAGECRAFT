// pages/signup.js
// Tela de criação de conta com Supabase Auth

import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { supabase } from '../lib/supabaseClient'

export default function Signup() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace('/dashboard')
    })
  }, [router])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('A senha precisa ter pelo menos 6 caracteres.')
      return
    }

    setLoading(true)

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { full_name: fullName.trim() },
      },
    })

    setLoading(false)

    if (error) {
      setError(traduzErro(error.message))
      return
    }

    // Cria perfil (best-effort — falha silenciosa se RLS bloquear sem sessão)
    if (data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        full_name: fullName.trim(),
      })
    }

    // Se confirmação de email estiver desligada, já tem session → vai pro dashboard
    if (data.session) {
      router.replace('/dashboard')
      return
    }

    setSuccess(true)
  }

  if (success) {
    return (
      <div className="auth-bg">
        <div className="auth-card">
          <div className="auth-logo">
            Page<span>Craft</span>
          </div>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📧</div>
          <h1 className="auth-title">Confira seu email</h1>
          <p className="auth-subtitle">
            Enviamos um link de confirmação para <strong>{email}</strong>.
            <br />
            Clique no link para ativar sua conta.
          </p>
          <Link href="/login" className="auth-btn" style={{ marginTop: 24, textAlign: 'center' }}>
            Ir para login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>PageCraft — Criar conta</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </Head>

      <div className="auth-bg">
        <div className="auth-card">
          <div className="auth-logo">
            Page<span>Craft</span>
          </div>
          <h1 className="auth-title">Criar conta</h1>
          <p className="auth-subtitle">Comece a editar suas páginas com IA</p>

          <form onSubmit={handleSubmit} className="auth-form">
            <label className="auth-label">
              Nome completo
              <input
                type="text"
                className="auth-input"
                placeholder="Seu nome"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                autoComplete="name"
              />
            </label>

            <label className="auth-label">
              Email
              <input
                type="email"
                className="auth-input"
                placeholder="voce@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </label>

            <label className="auth-label">
              Senha
              <input
                type="password"
                className="auth-input"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
              />
            </label>

            {error && <div className="auth-error">{error}</div>}

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? 'Criando conta...' : 'Criar conta'}
            </button>
          </form>

          <div className="auth-footer">
            Já tem conta?{' '}
            <Link href="/login" className="auth-link">
              Entrar
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}

function traduzErro(msg) {
  const m = msg.toLowerCase()
  if (m.includes('already registered') || m.includes('already exists'))
    return 'Este email já está cadastrado. Faça login.'
  if (m.includes('password')) return 'Senha inválida. Use pelo menos 6 caracteres.'
  if (m.includes('invalid email')) return 'Email inválido.'
  if (m.includes('rate limit')) return 'Muitas tentativas. Tente novamente em alguns minutos.'
  return msg
}
