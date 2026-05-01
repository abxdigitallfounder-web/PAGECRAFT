export default function Hero({ content = {} }) {
  return (
    <section
      style={{
        background: content.heroBg || 'linear-gradient(135deg,#0f172a 0%,#1e1b4b 100%)',
        color: content.heroTextColor || 'white',
        padding: '100px 20px',
        textAlign: 'center',
        minHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <p
        style={{
          color: '#818cf8',
          fontSize: 14,
          fontWeight: 600,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          marginBottom: 20,
        }}
      >
        {content.heroTag || '✦ Oferta Exclusiva'}
      </p>
      <h1
        style={{
          fontFamily: 'Syne, sans-serif',
          fontSize: 'clamp(36px, 5vw, 72px)',
          fontWeight: 800,
          lineHeight: 1.1,
          maxWidth: 800,
          margin: '0 auto 24px',
        }}
      >
        {content.heroTitle || 'Transforme Seu Negócio com Nossa Solução'}
      </h1>
      <p
        style={{
          color: '#94a3b8',
          fontSize: 18,
          lineHeight: 1.7,
          maxWidth: 560,
          margin: '0 auto 40px',
        }}
      >
        {content.heroSubtitle ||
          'Mais de 2.000 empresas já usam nossa plataforma para escalar resultados.'}
      </p>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
        <a
          href={content.ctaPrimaryUrl || '#'}
          style={{
            background: content.ctaPrimaryBg || '#6366f1',
            color: 'white',
            padding: '18px 40px',
            borderRadius: 12,
            fontWeight: 700,
            fontSize: 16,
          }}
        >
          {content.ctaPrimaryText || 'Quero Começar Agora →'}
        </a>
        {content.ctaSecondaryText && (
          <a
            href={content.ctaSecondaryUrl || '#'}
            style={{
              background: 'transparent',
              color: '#94a3b8',
              padding: '18px 32px',
              borderRadius: 12,
              fontWeight: 500,
              fontSize: 16,
              border: '1px solid #334155',
            }}
          >
            {content.ctaSecondaryText}
          </a>
        )}
      </div>
      {content.heroGuaranteeText !== '' && (
        <p style={{ color: '#475569', fontSize: 13, marginTop: 20 }}>
          {content.heroGuaranteeText || '✓ Sem contrato  ✓ Cancele quando quiser  ✓ Suporte 24/7'}
        </p>
      )}
    </section>
  )
}
