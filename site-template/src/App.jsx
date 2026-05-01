import { useContent } from '@pagecraft/content'
import Hero from './components/Hero.jsx'
import Benefits from './components/Benefits.jsx'
import Testimonials from './components/Testimonials.jsx'
import Pricing from './components/Pricing.jsx'
import CtaSection from './components/CtaSection.jsx'
import Footer from './components/Footer.jsx'

const SITE_ID = import.meta.env.VITE_SITE_ID

export default function App() {
  const { content, loading, error } = useContent(SITE_ID)

  if (loading) {
    return (
      <div style={spinnerWrap}>
        <div style={spinner} />
      </div>
    )
  }

  if (error) {
    return (
      <div style={spinnerWrap}>
        <p style={{ color: '#fca5a5' }}>Erro ao carregar conteúdo.</p>
      </div>
    )
  }

  return (
    <main>
      <Hero content={content} />
      <Benefits content={content} />
      <Testimonials content={content} />
      <Pricing content={content} />
      <CtaSection content={content} />
      <Footer content={content} />
    </main>
  )
}

const spinnerWrap = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: '#0f172a',
}
const spinner = {
  width: 40,
  height: 40,
  borderRadius: '50%',
  border: '3px solid #334155',
  borderTopColor: '#6366f1',
  animation: 'spin 0.9s linear infinite',
}

// keyframes injetadas inline
if (typeof document !== 'undefined') {
  const id = 'spin-keyframes'
  if (!document.getElementById(id)) {
    const style = document.createElement('style')
    style.id = id
    style.textContent = '@keyframes spin{to{transform:rotate(360deg)}}'
    document.head.appendChild(style)
  }
}
