// pages/api/ai-content.js
// Recebe { command, currentContent, siteId } e retorna SOMENTE os campos a alterar.

const SYSTEM_PROMPT = `Você é um assistente especialista em copywriting para páginas de vendas.
O usuário vai dar uma instrução em português para melhorar o conteúdo da página.
Você receberá os valores atuais de todos os campos.
Retorne SOMENTE JSON válido com apenas os campos que devem ser alterados:
{ "campoQueDeveSerAlterado": "novo valor", ... }
Altere apenas o que foi pedido. Nunca invente campos novos.
Mantenha o tom profissional e focado em conversão.`

function stripFences(s) {
  return String(s)
    .replace(/^\s*```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/i, '')
    .trim()
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { command, currentContent = {}, siteId } = req.body || {}
  if (!command) return res.status(400).json({ error: 'command obrigatório' })

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey || apiKey.startsWith('sk-ant-XXX')) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY não configurada' })
  }

  const userPrompt = `Site ID: ${siteId || 'n/a'}

Valores atuais dos campos:
${JSON.stringify(currentContent, null, 2)}

Instrução do usuário:
"${command}"

Retorne APENAS o JSON com os campos a alterar.`

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    })

    if (!response.ok) {
      const errText = await response.text()
      console.error('Claude error:', errText)
      return res.status(502).json({ error: 'Falha na chamada à IA', details: errText })
    }

    const data = await response.json()
    const raw = data?.content?.[0]?.text || ''
    let updates = {}
    try {
      updates = JSON.parse(stripFences(raw))
    } catch (e) {
      // fallback: tenta extrair primeiro bloco { ... }
      const match = raw.match(/\{[\s\S]*\}/)
      if (match) {
        try { updates = JSON.parse(match[0]) } catch (_) {}
      }
    }

    if (!updates || typeof updates !== 'object' || Array.isArray(updates)) {
      return res.status(200).json({ updates: {}, message: 'Não consegui interpretar o pedido.' })
    }

    return res.status(200).json({
      updates,
      message: `Aplicado: ${Object.keys(updates).join(', ') || 'nenhum campo'}`,
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: err.message })
  }
}
