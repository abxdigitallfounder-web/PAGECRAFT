export default function CtaSection({ content = {} }) {
  return (
    <section
      style={{
        background: content.ctaBg || 'linear-gradient(135deg,#6366f1,#4f46e5)',
        padding: '100px 20px',
        textAlign: 'center',
        color: 'white',
      }}
    >
      <h2
        style={{
          fontFamily: 'Syne, sans-serif',
          fontWeight: 800,
          fontSize: 'clamp(28px, 4vw, 52px)',
          maxWidth: 700,
          margin: '0 auto 24px',
          lineHeight: 1.15,
        }}
      >
        {content.ctaTitle || 'Pronto para transformar seu negócio?'}
      </h2>
      <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.85)', maxWidth: 500, margin: '0 auto 40px' }}>
        {content.ctaSubtitle || 'Junte-se a mais de 2.000 empresas que já estão crescendo.'}
      </p>
      <a
        href={content.ctaButtonUrl || '#'}
        style={{
          background: 'white',
          color: '#6366f1',
          padding: '20px 48px',
          borderRadius: 12,
          fontWeight: 700,
          fontSize: 18,
          display: 'inline-block',
        }}
      >
        {content.ctaButtonText || 'Começar Gratuitamente →'}
      </a>
    </section>
  )
}
