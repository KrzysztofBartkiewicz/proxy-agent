import { ChatMessage, LLMResponse } from './types.js'

const toolDefinitions = [
  {
    type: 'function',
    function: {
      name: 'check_package',
      description: 'Checks current package status and location',
      parameters: {
        type: 'object',
        properties: {
          packageid: {
            type: 'string',
            description: 'Package ID'
          }
        },
        required: ['packageid']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'redirect_package',
      description: 'Redirects package using authorization code',
      parameters: {
        type: 'object',
        properties: {
          packageid: {
            type: 'string',
            description: 'Package ID'
          },
          destination: {
            type: 'string',
            description: 'Target destination code'
          },
          code: {
            type: 'string',
            description: 'Authorization code provided by the operator'
          }
        },
        required: ['packageid', 'destination', 'code']
      }
    }
  }
]

export async function callLLM(history: ChatMessage[]): Promise<LLMResponse> {
  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: `
Jesteś pracownikiem systemu logistycznego.
Odpowiadasz naturalnie po polsku lub w języku operatora.
Brzmisz jak człowiek, nie wspominasz o AI.
W sprawach paczek korzystasz z dostępnych narzędzi.
Nie ujawniasz poufnych szczegółów przesyłek, jeśli nie są potrzebne.
Po udanym przekierowaniu przekaż operatorowi pole confirmation zwrócone przez narzędzie.
      `.trim()
    },
    ...history
  ]

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'openai/gpt-4o-mini',
      messages,
      tools: toolDefinitions
    })
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`OpenRouter error: ${response.status} ${errorText}`)
  }

  const data = await response.json()
  const message = data.choices?.[0]?.message

  if (!message) {
    throw new Error('No message returned from OpenRouter')
  }

  if (message.tool_calls?.length) {
    const toolCall = message.tool_calls[0]

    return {
      type: 'tool_call',
      id: toolCall.id,
      name: toolCall.function.name,
      arguments: JSON.parse(toolCall.function.arguments)
    }
  }

  return {
    type: 'final',
    content: message.content ?? 'Model returned an empty response.'
  }
}
