# Site Template — PageCraft

Template React + Vite para sites de clientes da agência. O conteúdo
(textos, cores, links) vem do Supabase em tempo real via `@pagecraft/content`.

> **Mantra:** o dev controla o código. O cliente controla o conteúdo. Nunca se misturam.

---

## 1. Clonar para um novo cliente

```bash
# Copie a pasta site-template para um novo repositório
cp -r site-template ../meu-cliente-x
cd ../meu-cliente-x

# (opcional) inicialize um repo git
rm -rf .git
git init
git add .
git commit -m "init"
```

---

## 2. Configurar variáveis de ambiente

Crie um `.env` na raiz com:

```env
VITE_SITE_ID=cliente-academia-joao
VITE_SUPABASE_URL=https://yntapbqrrbjeflhzrlzf.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_...
```

> O `VITE_SITE_ID` precisa ser **único** e bater exatamente com o `siteId`
> que você cadastra no PageCraft (próximo passo).

---

## 3. Rodar localmente

```bash
npm install
npm run dev
```

Abra `http://localhost:5173`. O site vai carregar do Supabase. Se não houver
conteúdo ainda, todos os fallbacks padrão aparecem.

---

## 4. Deploy na Vercel

1. Suba o repo no GitHub.
2. Em https://vercel.com → **New Project** → conecte o repo.
3. Em **Environment Variables** adicione:
   - `VITE_SITE_ID`
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy → você terá uma URL como `https://meu-cliente-x.vercel.app`.

---

## 5. Cadastrar o site no PageCraft

1. Acesse o PageCraft → **Cadastrar Site**.
2. Informe:
   - Nome do projeto (ex: "Academia do João")
   - Site ID (ex: `cliente-academia-joao` — **igual** ao do `.env`)
   - URL da Vercel (ex: `https://meu-cliente-x.vercel.app`)
   - Email do cliente (opcional)
3. Você é redirecionado para o **Editor de Conteúdo** com preview ao vivo.

---

## 6. Adicionar campos editáveis novos

O fluxo é simétrico — toda nova chave precisa existir nos **dois lados**:

### A) No componente React (este projeto)

`src/components/Hero.jsx`:
```jsx
<h1>{content?.heroTitle || 'Título Padrão'}</h1>
```

Acrescente o campo onde precisar com `content?.NOVO_CAMPO`.

### B) No SCHEMA do PageCraft

Em `pages/content-editor/[siteId].js`, edite `SCHEMA.hero.fields`:

```js
{ key: 'novoCampo', label: 'Novo campo', type: 'text' },
```

Tipos suportados: `text`, `textarea`, `color`, `url`, `image`.

Após isso, o cliente vê o campo no painel e a edição já reflete em tempo real.

---

## Estrutura

```
site-template/
├── package.json
├── vite.config.js
├── index.html
├── .env.example
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   └── components/
│       ├── Hero.jsx
│       ├── Benefits.jsx
│       ├── Testimonials.jsx
│       ├── Pricing.jsx
│       ├── CtaSection.jsx
│       └── Footer.jsx
└── README.md
```

---

## Stack

- React 18 + Vite
- `@pagecraft/content` (hook `useContent` com realtime)
- `@supabase/supabase-js`

Sem framework de CSS — estilos inline para máxima portabilidade. Fontes Google
(`Syne` + `DM Sans`) carregadas via `<link>` no `index.html`.
