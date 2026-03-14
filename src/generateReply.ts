import { ChatMessage } from './types.js'

export const generateReply = (history: ChatMessage[]): string => {
  const lastUserMessage = [...history].reverse().find(msg => msg.role === 'user')

  if (!lastUserMessage) {
    return 'Nie mam żadnych wiadomości od użytkownika.'
  }

  return `Odebrałem: ${lastUserMessage.content}`
}
