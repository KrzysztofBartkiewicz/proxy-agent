import { ChatMessage } from './types.js'

export const buildMessageForModel = (history: ChatMessage[]) => {
  return history.map(msg => ({
    role: msg.role,
    content: msg.content
  }))
}
