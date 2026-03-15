import { callLLM } from './llm.js'
import { tools } from './tools.js'
import { ChatMessage } from './types.js'

const MAX_STEPS = 5

export async function runAgent(
  inputHistory: ChatMessage[]
): Promise<{ reply: string; updatedHistory: ChatMessage[] }> {
  const history: ChatMessage[] = [...inputHistory]

  for (let step = 0; step < MAX_STEPS; step++) {
    console.log('Agent step:', step)
    console.log('History before LLM:', JSON.stringify(history, null, 2))

    const modelResponse = await callLLM(history)
    console.log('Model response:', JSON.stringify(modelResponse, null, 2))

    if (modelResponse.type === 'final') {
      const finalMessage: ChatMessage = {
        role: 'assistant',
        content: modelResponse.content
      }

      return {
        reply: modelResponse.content,
        updatedHistory: [...history, finalMessage]
      }
    }

    const { id, name, arguments: args } = modelResponse

    if (name === 'check_package') {
      if (!args || typeof args.packageid !== 'string') {
        throw new Error('Invalid arguments for check_package')
      }
    }

    if (name === 'redirect_package') {
      if (
        !args ||
        typeof args.packageid !== 'string' ||
        typeof args.destination !== 'string' ||
        typeof args.code !== 'string'
      ) {
        throw new Error('Invalid arguments for redirect_package')
      }
    }

    const tool = tools[name as keyof typeof tools]

    if (!tool) {
      throw new Error(`Unknown tool: ${name}`)
    }

    const assistantToolCallMessage: ChatMessage = {
      role: 'assistant',
      content: '',
      tool_calls: [
        {
          id,
          type: 'function',
          function: {
            name,
            arguments: JSON.stringify(args)
          }
        }
      ]
    }

    history.push(assistantToolCallMessage)

    const result = await tool(args)

    const toolMessage: ChatMessage = {
      role: 'tool',
      tool_call_id: id,
      content: JSON.stringify(result)
    }

    history.push(toolMessage)
  }

  throw new Error('Agent iteration limit reached')
}
