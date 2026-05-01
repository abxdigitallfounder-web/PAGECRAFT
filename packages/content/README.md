# @pagecraft/content

Hook React para consumir conteúdo dinâmico de sites PageCraft em tempo real.

## Instalação (workspace local)

```bash
npm install ../packages/content
# ou no package.json:
# "@pagecraft/content": "file:../packages/content"
```

## Uso

```jsx
import { useContent } from '@pagecraft/content'

export default function Hero() {
  const { content, loading } = useContent('cliente-joao-academia')
  if (loading) return <div>Carregando...</div>
  return <h1>{content?.heroTitle || 'Título Padrão'}</h1>
}
```

## Variáveis de ambiente

Vite: `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`
Next.js: `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Ou passe um client customizado:

```jsx
import { createContentClient, useContent } from '@pagecraft/content'
const client = createContentClient(url, key)
useContent('site-id', { client })
```

## Realtime

O hook se inscreve nas mudanças da linha do `site_id` automaticamente.
Quando o PageCraft salvar, o site atualiza sem reload.
