import express from 'express'
import dotenv from 'dotenv'
import { ChatMessage } from './types.js'

import { runAgent } from './agent.js'

dotenv.config()

const sessions = new Map<string, ChatMessage[]>()

const app = express()
app.use(express.json())

const port = Number(process.env.PORT) || 3000

app.post('/', async (req, res) => {
  try {
    const { sessionID, msg } = req.body as { sessionID: string; msg: string }

    if (!sessionID || !msg) {
      return res.status(400).json({ error: 'Missing sessionID or msg' })
    }

    if (msg === 'DISCONNECT') {
      sessions.delete(sessionID)
      return res.json({ msg: 'OK' })
    }

    const sessionHistory = sessions.get(sessionID) ?? []

    const userMessage: ChatMessage = {
      role: 'user',
      content: msg
    }

    const historyWithUser: ChatMessage[] = [...sessionHistory, userMessage]

    const { reply, updatedHistory } = await runAgent(historyWithUser)

    sessions.set(sessionID, updatedHistory)

    return res.json({ msg: reply })
  } catch (error) {
    console.error('POST / failed:', error)
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown server error'
    })
  }
})

app.get('/', (req, res) => {
  res.send('Server alive')
})

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
