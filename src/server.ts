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
  const { sessionID, msg } = req.body as { sessionID: string; msg: string }

  if (!sessionID || !msg) {
    return res.status(400).json({ error: 'Missing sessionID or msg' })
  }

  // obsługa DISCONNECT najpierw
  if (msg === 'DISCONNECT') {
    sessions.delete(sessionID)
    return res.json({ msg: 'OK' })
  }

  if (!sessions.has(sessionID)) {
    sessions.set(sessionID, [])
  }

  const history = sessions.get(sessionID)

  if (!history) {
    return res.status(500).json({ error: 'Session history not found' })
  }

  history.push({ role: 'user', content: msg })

  const reply = await runAgent(history)

  history.push({ role: 'assistant', content: reply })

  return res.json({ msg: reply })
})

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})

app.get('/', (req, res) => {
  res.send('Server alive')
})

app.post('/', async (req, res) => {
  console.log('Incoming request:', req.body)
})
