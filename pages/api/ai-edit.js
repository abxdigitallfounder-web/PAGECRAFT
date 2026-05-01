// pages/api/ai-edit.js
// Recebe o comando do usuário + HTML atual da página
// Retorna a operação de edição a ser aplicada pelo editor

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { message, pageHtml, pageContext } = req.body

  if (!message) return res.status(400).json({ error: 'Mensagem obrigatória' })

  const systemPrompt = `Você é um assistente especialista em edição de páginas de vendas.
O usuário está editando uma página de vendas e vai te dar instruções em linguagem natural, em português.

Sua tarefa é interpretar o pedido e retornar um JSON com as operações a serem feitas.

IMPORTANTE: Responda SOMENTE com JSON válido, sem texto antes ou depois, sem markdown.

Estrutura do JSON de resposta:
{
  "actions": [
    {
      "type": "replace_text",
      "selector": "CSS selector do elemento",
      "newText": "novo texto"
    },
    {
      "type": "replace_html",
      "selector": "CSS selector do elemento",
      "newHtml": "novo HTML interno"
    },
    {
      "type": "change_style",
      "selector": "CSS selector do elemento",
      "property": "propriedade CSS",
      "value": "valor"
    },
    {
      "type": "change_color",
      "selector": "CSS selector do elemento",
      "property": "background|color|border-color",
      "value": "cor em hex ou rgb"
    }
  ],
  "message": "Mensagem amigável explicando o que foi feito"
}

Contexto da página atual:
${pageContext || 'Página de vendas padrão com seções: hero, benefícios, depoimentos, preços e CTA.'}

Seletores disponíveis na página:
- #hero — seção principal do topo
- #hero h1 — título principal
- #hero p:first-of-type — subtítulo/tag acima do título
- #hero p:last-of-type — texto com garantias abaixo dos botões
- #hero a:first-of-type — botão principal (CTA)
- #hero a:last-of-type — botão secundário
- #benefits h2 — título da seção de benefícios
- #testimonials h2 — título da seção de depoimentos
- #pricing h2 — título de preços
- #cta h2 — título do CTA final
- #cta a — botão do CTA final

Se o usuário pedir algo impossível ou fora do escopo, retorne:
{
  "actions": [],
  "message": "Desculpe, não consegui entender o que você quer fazer. Tente ser mais específico, como: 'muda o título principal para X' ou 'deixa o botão do hero verde'."
}`

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: systemPrompt,
        messages: [{ role: 'user', content: message }],
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Anthropic error:', data)
      return res.status(500).json({ error: 'Erro na API de IA' })
    }

    const rawText = data.content[0]?.text || '{}'
    
    // Limpa possíveis backticks de markdown
    const cleanJson = rawText.replace(/```json\n?|\n?```/g, '').trim()
    
    let parsed
    try {
      parsed = JSON.parse(cleanJson)
    } catch {
      return res.status(200).json({
        actions: [],
        message: 'Entendi seu pedido, mas não consegui processar a edição. Tente reformular.'
      })
    }

    return res.status(200).json(parsed)
  } catch (err) {
    console.error('Server error:', err)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
}
