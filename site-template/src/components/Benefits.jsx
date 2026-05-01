export default function Benefits({ content = {} }) {
  const items = [
    {
      icon: content.benefit1Icon || '🚀',
      title: content.benefit1Title || 'Resultado Rápido',
      text: content.benefit1Text || 'Veja os primeiros resultados em menos de 7 dias.',
    },
    {
      icon: content.benefit2Icon || '🎯',
      title: content.benefit2Title || 'Foco no que importa',
      text: content.benefit2Text || 'Automatize o operacional e cresça mais rápido.',
    },
    {
      icon: content.benefit3Icon || '💡',
      title: content.benefit3Title || 'Suporte Real',
      text: content.benefit3Text || 'Time dedicado para te ajudar em cada etapa.',
    },
  ]

  return (
    <section style={{ background: 'white', color: '#0f172a', padding: '100px 20px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        {content.benefitsSubtitle && (
          <p
            style={{
              color: '#6366f1',
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              textAlign: 'center',
              marginBottom: 16,
            }}
          >
            {content.benefitsSubtitle}
          </p>
        )}
        <h2
          style={{
            fontFamily: 'Syne, sans-serif',
            fontWeight: 800,
            fontSize: 'clamp(28px, 4vw, 48px)',
            textAlign: 'center',
            maxWidth: 600,
            margin: '0 auto 64px',
            lineHeight: 1.2,
          }}
        >
          {content.benefitsTitle || 'Por que centenas escolhem a gente'}
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 32,
          }}
        >
          {items.map((b, i) => (
            <div
              key={i}
              style={{
                padding: 32,
                background: '#f8fafc',
                borderRadius: 16,
                border: '1px solid #e2e8f0',
              }}
            >
              <div style={{ fontSize: 36, marginBottom: 16 }}>{b.icon}</div>
              <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 20, marginBottom: 10 }}>
                {b.title}
              </h3>
              <p style={{ fontSize: 15, color: '#64748b', lineHeight: 1.6 }}>{b.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
