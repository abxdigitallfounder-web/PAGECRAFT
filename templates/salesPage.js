// Template de Página de Vendas — usado pelo GrapeJS como conteúdo inicial
export const salesPageTemplate = {
  html: `
<section id="hero" style="background:linear-gradient(135deg,#0f172a 0%,#1e1b4b 100%);padding:100px 20px;text-align:center;min-height:90vh;display:flex;flex-direction:column;align-items:center;justify-content:center;">
  <p style="color:#818cf8;font-family:DM Sans,sans-serif;font-size:14px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:20px;">✦ Oferta Exclusiva</p>
  <h1 style="color:white;font-family:Syne,sans-serif;font-size:clamp(36px,5vw,72px);font-weight:800;line-height:1.1;max-width:800px;margin:0 auto 24px;">Transforme Seu Negócio com Nossa Solução</h1>
  <p style="color:#94a3b8;font-family:DM Sans,sans-serif;font-size:18px;line-height:1.7;max-width:560px;margin:0 auto 40px;">Mais de 2.000 empresas já usam nossa plataforma para escalar resultados. Comece agora e veja a diferença em 30 dias.</p>
  <div style="display:flex;gap:16px;flex-wrap:wrap;justify-content:center;">
    <a href="#" style="background:#6366f1;color:white;padding:18px 40px;border-radius:12px;font-family:DM Sans,sans-serif;font-weight:700;font-size:16px;text-decoration:none;display:inline-block;">Quero Começar Agora →</a>
    <a href="#" style="background:transparent;color:#94a3b8;padding:18px 32px;border-radius:12px;font-family:DM Sans,sans-serif;font-weight:500;font-size:16px;text-decoration:none;border:1px solid #334155;display:inline-block;">Ver Demonstração</a>
  </div>
  <p style="color:#475569;font-family:DM Sans,sans-serif;font-size:13px;margin-top:20px;">✓ Sem contrato  ✓ Cancele quando quiser  ✓ Suporte 24/7</p>
</section>

<section id="social-proof" style="background:#f8fafc;padding:60px 20px;text-align:center;">
  <p style="color:#64748b;font-family:DM Sans,sans-serif;font-size:13px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:40px;">Empresas que confiam em nós</p>
  <div style="display:flex;gap:48px;justify-content:center;align-items:center;flex-wrap:wrap;max-width:800px;margin:0 auto;">
    <span style="font-family:Syne,sans-serif;font-weight:800;font-size:20px;color:#cbd5e1;">EMPRESA A</span>
    <span style="font-family:Syne,sans-serif;font-weight:800;font-size:20px;color:#cbd5e1;">EMPRESA B</span>
    <span style="font-family:Syne,sans-serif;font-weight:800;font-size:20px;color:#cbd5e1;">EMPRESA C</span>
    <span style="font-family:Syne,sans-serif;font-weight:800;font-size:20px;color:#cbd5e1;">EMPRESA D</span>
  </div>
</section>

<section id="benefits" style="background:white;padding:100px 20px;">
  <div style="max-width:1100px;margin:0 auto;">
    <p style="color:#6366f1;font-family:DM Sans,sans-serif;font-size:13px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;text-align:center;margin-bottom:16px;">Benefícios</p>
    <h2 style="font-family:Syne,sans-serif;font-weight:800;font-size:clamp(28px,4vw,48px);color:#0f172a;text-align:center;max-width:600px;margin:0 auto 64px;line-height:1.2;">Por que centenas escolhem a gente</h2>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:32px;">
      <div style="padding:32px;background:#f8fafc;border-radius:16px;border:1px solid #e2e8f0;">
        <div style="font-size:36px;margin-bottom:16px;">🚀</div>
        <h3 style="font-family:Syne,sans-serif;font-weight:700;font-size:20px;color:#0f172a;margin-bottom:10px;">Resultado Rápido</h3>
        <p style="font-family:DM Sans,sans-serif;font-size:15px;color:#64748b;line-height:1.6;">Veja os primeiros resultados em menos de 7 dias após a implementação.</p>
      </div>
      <div style="padding:32px;background:#f8fafc;border-radius:16px;border:1px solid #e2e8f0;">
        <div style="font-size:36px;margin-bottom:16px;">🎯</div>
        <h3 style="font-family:Syne,sans-serif;font-weight:700;font-size:20px;color:#0f172a;margin-bottom:10px;">Foco no que importa</h3>
        <p style="font-family:DM Sans,sans-serif;font-size:15px;color:#64748b;line-height:1.6;">Automatize o operacional e concentre energia no crescimento do seu negócio.</p>
      </div>
      <div style="padding:32px;background:#f8fafc;border-radius:16px;border:1px solid #e2e8f0;">
        <div style="font-size:36px;margin-bottom:16px;">💡</div>
        <h3 style="font-family:Syne,sans-serif;font-weight:700;font-size:20px;color:#0f172a;margin-bottom:10px;">Suporte Real</h3>
        <p style="font-family:DM Sans,sans-serif;font-size:15px;color:#64748b;line-height:1.6;">Time dedicado para te ajudar em cada etapa, do onboarding ao crescimento.</p>
      </div>
    </div>
  </div>
</section>

<section id="testimonials" style="background:#0f172a;padding:100px 20px;">
  <div style="max-width:1000px;margin:0 auto;">
    <p style="color:#6366f1;font-family:DM Sans,sans-serif;font-size:13px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;text-align:center;margin-bottom:16px;">Depoimentos</p>
    <h2 style="font-family:Syne,sans-serif;font-weight:800;font-size:clamp(28px,4vw,44px);color:white;text-align:center;margin-bottom:60px;">O que nossos clientes dizem</h2>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:24px;">
      <div style="background:#1e293b;padding:28px;border-radius:16px;border:1px solid #334155;">
        <p style="font-family:DM Sans,sans-serif;font-size:15px;color:#cbd5e1;line-height:1.7;margin-bottom:20px;">"Triplicamos nossas vendas em 3 meses. Não acreditava que seria possível até ver acontecer."</p>
        <div style="display:flex;align-items:center;gap:12px;">
          <div style="width:40px;height:40px;border-radius:50%;background:#6366f1;display:flex;align-items:center;justify-content:center;color:white;font-weight:700;font-family:Syne,sans-serif;">M</div>
          <div>
            <p style="font-family:Syne,sans-serif;font-weight:700;font-size:14px;color:white;">Marcos Silva</p>
            <p style="font-family:DM Sans,sans-serif;font-size:12px;color:#64748b;">CEO, EmpresaX</p>
          </div>
        </div>
      </div>
      <div style="background:#1e293b;padding:28px;border-radius:16px;border:1px solid #334155;">
        <p style="font-family:DM Sans,sans-serif;font-size:15px;color:#cbd5e1;line-height:1.7;margin-bottom:20px;">"A equipe de suporte é incrível. Resolveram todos os meus problemas no mesmo dia."</p>
        <div style="display:flex;align-items:center;gap:12px;">
          <div style="width:40px;height:40px;border-radius:50%;background:#10b981;display:flex;align-items:center;justify-content:center;color:white;font-weight:700;font-family:Syne,sans-serif;">A</div>
          <div>
            <p style="font-family:Syne,sans-serif;font-weight:700;font-size:14px;color:white;">Ana Ferreira</p>
            <p style="font-family:DM Sans,sans-serif;font-size:12px;color:#64748b;">Diretora, StartupY</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<section id="pricing" style="background:white;padding:100px 20px;text-align:center;">
  <p style="color:#6366f1;font-family:DM Sans,sans-serif;font-size:13px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:16px;">Preços</p>
  <h2 style="font-family:Syne,sans-serif;font-weight:800;font-size:clamp(28px,4vw,48px);color:#0f172a;margin-bottom:16px;">Simples e transparente</h2>
  <p style="font-family:DM Sans,sans-serif;font-size:16px;color:#64748b;margin-bottom:60px;">Sem taxas ocultas. Cancele a qualquer momento.</p>
  <div style="max-width:400px;margin:0 auto;background:linear-gradient(135deg,#0f172a,#1e1b4b);border-radius:24px;padding:48px;text-align:center;">
    <p style="font-family:Syne,sans-serif;font-weight:700;font-size:14px;color:#818cf8;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:16px;">Plano Pro</p>
    <div style="margin-bottom:24px;">
      <span style="font-family:Syne,sans-serif;font-weight:800;font-size:64px;color:white;line-height:1;">R$497</span>
      <span style="font-family:DM Sans,sans-serif;color:#64748b;font-size:16px;">/mês</span>
    </div>
    <ul style="list-style:none;padding:0;margin:0 0 32px;text-align:left;">
      <li style="font-family:DM Sans,sans-serif;font-size:15px;color:#cbd5e1;padding:8px 0;border-bottom:1px solid #1e293b;">✓ Funcionalidade A completa</li>
      <li style="font-family:DM Sans,sans-serif;font-size:15px;color:#cbd5e1;padding:8px 0;border-bottom:1px solid #1e293b;">✓ Funcionalidade B ilimitada</li>
      <li style="font-family:DM Sans,sans-serif;font-size:15px;color:#cbd5e1;padding:8px 0;border-bottom:1px solid #1e293b;">✓ Suporte prioritário 24/7</li>
      <li style="font-family:DM Sans,sans-serif;font-size:15px;color:#cbd5e1;padding:8px 0;">✓ Relatórios avançados</li>
    </ul>
    <a href="#" style="display:block;background:#6366f1;color:white;padding:18px;border-radius:12px;font-family:DM Sans,sans-serif;font-weight:700;font-size:16px;text-decoration:none;">Começar Agora</a>
  </div>
</section>

<section id="cta" style="background:linear-gradient(135deg,#6366f1,#4f46e5);padding:100px 20px;text-align:center;">
  <h2 style="font-family:Syne,sans-serif;font-weight:800;font-size:clamp(28px,4vw,52px);color:white;max-width:700px;margin:0 auto 24px;line-height:1.15;">Pronto para transformar seu negócio?</h2>
  <p style="font-family:DM Sans,sans-serif;font-size:18px;color:rgba(255,255,255,0.8);max-width:500px;margin:0 auto 40px;">Junte-se a mais de 2.000 empresas que já estão crescendo com a gente.</p>
  <a href="#" style="background:white;color:#6366f1;padding:20px 48px;border-radius:12px;font-family:DM Sans,sans-serif;font-weight:700;font-size:18px;text-decoration:none;display:inline-block;">Começar Gratuitamente →</a>
</section>

<footer style="background:#0f172a;padding:40px 20px;text-align:center;">
  <p style="font-family:DM Sans,sans-serif;font-size:13px;color:#475569;">© 2025 Sua Empresa. Todos os direitos reservados.</p>
</footer>
  `,
  css: `
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'DM Sans', sans-serif; }
  `
}
