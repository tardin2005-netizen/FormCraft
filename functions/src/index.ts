import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { defineSecret } from 'firebase-functions/params'

const anthropicKey = defineSecret('ANTHROPIC_KEY')

interface Tool { name: string; cat: string; desc: string }

export const askClaude = onCall(
  { secrets: [anthropicKey], cors: true, region: 'us-central1' },
  async (request) => {
    const { question, tools } = request.data as { question: string; tools: Tool[] }

    if (!question?.trim()) throw new HttpsError('invalid-argument', 'question is required')
    if (!tools?.length)    throw new HttpsError('invalid-argument', 'tools list is required')

    const key = anthropicKey.value()
    const toolList = tools.map(t => `${t.name} (${t.cat}): ${t.desc}`).join('\n')

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 350,
        messages: [{
          role: 'user',
          content: `Você é um assistente do FormCraft que recomenda ferramentas digitais.\n\nFerramentas disponíveis:\n${toolList}\n\nPergunta do usuário: "${question}"\n\nRecomende de 1 a 3 ferramentas da lista acima que resolvem melhor a dor do usuário. Responda em português, de forma direta. Para cada ferramenta recomendada, cite o nome EXATAMENTE como está na lista e explique em uma frase curta por quê ela ajuda. Não invente ferramentas fora da lista.`,
        }],
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      throw new HttpsError('internal', `Claude API error: ${err}`)
    }

    const data = await res.json() as { content: Array<{ text: string }> }
    return { answer: data.content?.[0]?.text ?? '' }
  }
)
