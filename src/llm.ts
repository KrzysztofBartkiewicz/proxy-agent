import { ChatMessage, LLMResponse } from './types.js'

const toolDefinitions = [
  {
    type: 'function',
    function: {
      name: 'check_package',
      description: 'Check package status by package id',
      parameters: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'redirect_package',
      description: 'Redirect package to another city',
      parameters: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          city: { type: 'string' }
        },
        required: ['id', 'city']
      }
    }
  }
]

export async function callLLM(history: ChatMessage[]): Promise<LLMResponse> {
  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: `
You are a logistics assistant.

Rules:
- Use tools when needed.
- Never guess package status without using check_package.
- If tool result is already available, use it to answer the user.
- Do not call the same tool repeatedly when you already have the result.
- Answer clearly and briefly.
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
