# 🚀 PageCraft — Editor de Páginas de Vendas com IA

Editor visual de páginas de vendas com assistente de IA integrado (Claude).  
Clientes editam via drag-and-drop ou por comandos em linguagem natural.

---

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | Next.js 14 + Tailwind |
| Editor visual | GrapeJS |
| IA | Claude (Anthropic) |
| Banco + Auth | Supabase |
| Deploy | Vercel |

---

## Setup em 5 passos

### 1. Clone e instale

```bash
git clone <seu-repo>
cd pagecraft
npm install
```

### 2. Configure as variáveis de ambiente

```bash
cp .env.example .env.local
```

Preencha o `.env.local`:

```env
ANTHROPIC_API_KEY=sk-ant-...        # console.anthropic.com
NEXT_PUBLIC_SUPABASE_URL=https://...  # supabase.com
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_KEY=...
```

### 3. Configure o Supabase

1. Crie um projeto em https://supabase.com
2. Vá em **SQL Editor**
3. Cole e execute o conteúdo de `supabase-schema.sql`
4. Ative **Email Auth** em Authentication > Providers

### 4. Rode localmente

```bash
npm run dev
```

Acesse: http://localhost:3000

### 5. Deploy na Vercel

```bash
npx vercel --prod
```

Ou conecte o repositório no painel da Vercel e adicione as variáveis de ambiente.

---

## Estrutura do Projeto

```
pagecraft/
├── pages/
│   ├── index.js              → Redireciona para /dashboard
│   ├── dashboard.js          → Lista de páginas do cliente
│   ├── editor/[pageId].js    → Editor principal (GrapeJS + IA)
│   └── api/
│       ├── ai-edit.js        → Endpoint IA (Claude)
│       └── save-page.js      → Salva página no Supabase
├── templates/
│   └── salesPage.js          → Template HTML da página de vendas
├── styles/
│   └── globals.css           → Estilos globais
├── supabase-schema.sql       → Schema do banco
└── .env.example              → Variáveis de ambiente
```

---

## Funcionalidades

### ✅ MVP (pronto)
- [x] Editor visual GrapeJS com template de página de vendas
- [x] Chat com IA (Claude) em português
- [x] IA interpreta comandos e edita a página em tempo real
- [x] Salvar página no Supabase
- [x] Dashboard com lista de páginas
- [x] Preview mobile/desktop

### 🔲 Próximos passos
- [ ] Autenticação de clientes (Supabase Auth)
- [ ] Publicação com subdomínio próprio
- [ ] Mais templates (webinar, lead capture, obrigado)
- [ ] Histórico de versões
- [ ] Analytics por seção

---

## Como funciona a IA

1. Cliente digita um comando no chat: *"muda o título para Aumente suas Vendas"*
2. O comando vai para `/api/ai-edit` junto com o contexto da página
3. Claude interpreta e retorna um JSON de operações:
   ```json
   {
     "actions": [
       { "type": "replace_text", "selector": "#hero h1", "newText": "Aumente suas Vendas" }
     ],
     "message": "✅ Título atualizado!"
   }
   ```
4. O frontend aplica as operações diretamente no canvas do GrapeJS

---

## Custos estimados (em produção)

| Item | Custo |
|---|---|
| Vercel Pro | $20/mês |
| Supabase Pro | $25/mês |
| Claude API (50 clientes, ~100 edições/mês cada) | ~$30-80/mês |
| **Total** | **~R$400-700/mês** |

Para 20+ clientes pagando R$500/mês = R$10.000/mês de receita.  
Margem bruta estimada: ~93%.

---

## Licença

Propriedade da agência. Uso interno.
