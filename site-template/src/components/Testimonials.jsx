export default function Testimonials({ content = {} }) {
  const items = [
    {
      text: content.t1Text || '"Triplicamos nossas vendas em 3 meses."',
      name: content.t1Name || 'Marcos Silva',
      role: content.t1Role || 'CEO, EmpresaX',
      avatar: content.t1AvatarLetter || (content.t1Name?.[0] || 'M'),
      avatarBg: content.t1AvatarBg || '#6366f1',
    },
    {
      text: content.t2Text || '"O suporte resolveu tudo no mesmo dia."',
      name: content.t2Name || 'Ana Ferreira',
      role: content.t2Role || 'Diretora, StartupY',
      avatar: content.t2AvatarLetter || (content.t2Name?.[0] || 'A'),
      avatarBg: content.t2AvatarBg || '#10b981',
    },
  ]

  return (
    <section style={{ background: '#0f172a', color: 'white', padding: '100px 20px' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <h2
          style={{
            fontFamily: 'Syne, sans-serif',
            fontWeight: 800,
            fontSize: 'clamp(28px, 4vw, 44px)',
            textAlign: 'center',
            marginBottom: 60,
          }}
        >
          {content.testimonialsTitle || 'O que nossos clientes dizem'}
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 24,
          }}
        >
          {items.map((t, i) => (
            <div
              key={i}
              style={{
                background: '#1e293b',
                padding: 28,
                borderRadius: 16,
                border: '1px solid #334155',
              }}
            >
              <p style={{ fontSize: 15, color: '#cbd5e1', lineHeight: 1.7, marginBottom: 20 }}>
                {t.text}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: t.avatarBg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 700,
                    fontFamily: 'Syne, sans-serif',
                  }}
                >
                  {String(t.avatar).charAt(0).toUpperCase()}
                </div>
                <div>
                  <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 14 }}>{t.name}</p>
                  <p style={{ fontSize: 12, color: '#64748b' }}>{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
