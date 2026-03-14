export type ChatMessage =
  | {
      role: 'system' | 'user'
      content: string
    }
  | {
      role: 'assistant'
      content: string
      tool_calls?: Array<{
        id: string
        type: 'function'
        function: {
          name: string
          arguments: string
        }
      }>
    }
  | {
      role: 'tool'
      content: string
      tool_call_id: string
    }

export type LLMResponse =
  | {
      type: 'final'
      content: string
    }
  | {
      type: 'tool_call'
      id: string
      name: string
      arguments: any
    }
