import { callLLM } from './llm.js'
import { tools } from './tools.js'
import { ChatMessage } from './types.js'

const MAX_STEPS = 5

export async function runAgent(history: ChatMessage[]): Promise<string> {
  for (let step = 0; step < MAX_STEPS; step++) {
    console.log('Agent step:', step)
    console.log('History before LLM:', JSON.stringify(history, null, 2))

    const modelResponse = await callLLM(history)
    console.log('Model response:', JSON.stringify(modelResponse, null, 2))

    if (modelResponse.type === 'final') {
      return modelResponse.content
    }

    const { id, name, arguments: args } = modelResponse

    if (name === 'check_package') {
      if (!args || typeof args.id !== 'string') {
        return 'Invalid arguments for check_package'
      }
    }

    if (name === 'redirect_package') {
      if (!args || typeof args.id !== 'string' || typeof args.city !== 'string') {
        return 'Invalid arguments for redirect_package'
      }
    }

    const tool = tools[name]

    if (!tool) {
      return `Unknown tool: ${name}`
    }

    history.push({
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
    })

    const result = await tool(args)

    history.push({
      role: 'tool',
      tool_call_id: id,
      content: JSON.stringify(result)
    })
  }

  return 'Agent iteration limit reached'
}
