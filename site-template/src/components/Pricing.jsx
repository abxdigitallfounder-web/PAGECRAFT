export default function Pricing({ content = {} }) {
  const features = [
    content.planFeature1,
    content.planFeature2,
    content.planFeature3,
    content.planFeature4,
  ].filter(Boolean)

  return (
    <section style={{ background: 'white', color: '#0f172a', padding: '100px 20px', textAlign: 'center' }}>
      <h2
        style={{
          fontFamily: 'Syne, sans-serif',
          fontWeight: 800,
          fontSize: 'clamp(28px, 4vw, 48px)',
          marginBottom: 16,
        }}
      >
        {content.pricingTitle || 'Simples e transparente'}
      </h2>
      <p style={{ fontSize: 16, color: '#64748b', marginBottom: 60 }}>
        {content.pricingSubtitle || 'Sem taxas ocultas. Cancele a qualquer momento.'}
      </p>
      <div
        style={{
          maxWidth: 400,
          margin: '0 auto',
          background: content.planBg || 'linear-gradient(135deg,#0f172a,#1e1b4b)',
          color: 'white',
          borderRadius: 24,
          padding: 48,
        }}
      >
        <p
          style={{
            fontFamily: 'Syne, sans-serif',
            fontWeight: 700,
            fontSize: 14,
            color: '#818cf8',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: 16,
          }}
        >
          {content.planName || 'Plano Pro'}
        </p>
        <div style={{ marginBottom: 24 }}>
          <span
            style={{
              fontFamily: 'Syne, sans-serif',
              fontWeight: 800,
              fontSize: 64,
              lineHeight: 1,
            }}
          >
            {content.planPrice || 'R$497'}
          </span>
          <span style={{ color: '#64748b', fontSize: 16 }}>{content.planPeriod || '/mês'}</span>
        </div>
        <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px', textAlign: 'left' }}>
          {(features.length ? features : ['✓ Funcionalidade A', '✓ Funcionalidade B', '✓ Suporte 24/7']).map((f, i) => (
            <li
              key={i}
              style={{
                fontSize: 15,
                color: '#cbd5e1',
                padding: '8px 0',
                borderBottom: i < features.length - 1 ? '1px solid #1e293b' : 'none',
              }}
            >
              {f}
            </li>
          ))}
        </ul>
        <a
          href={content.planCtaUrl || '#'}
          style={{
            display: 'block',
            background: '#6366f1',
            color: 'white',
            padding: 18,
            borderRadius: 12,
            fontWeight: 700,
            fontSize: 16,
          }}
        >
          {content.planCtaText || 'Começar Agora'}
        </a>
      </div>
    </section>
  )
}
