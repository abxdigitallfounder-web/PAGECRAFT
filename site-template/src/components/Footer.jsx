export default function Footer({ content = {} }) {
  return (
    <footer
      style={{
        background: content.footerBg || '#0f172a',
        padding: '40px 20px',
        textAlign: 'center',
        color: '#475569',
      }}
    >
      <p style={{ fontSize: 13 }}>
        {content.footerText || `© ${new Date().getFullYear()} Sua Empresa. Todos os direitos reservados.`}
      </p>
    </footer>
  )
}
