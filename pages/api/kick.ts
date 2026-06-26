import { NextApiRequest, NextApiResponse } from 'next'

const globalAny = global as any

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { room, memberId } = req.body

    if (!room || !memberId) {
      return res.status(400).json({ error: 'Missing room or memberId' })
    }

    if (!globalAny.kickedMembers) {
      globalAny.kickedMembers = {}
    }
    if (!globalAny.kickedMembers[room]) {
      globalAny.kickedMembers[room] = []
    }
    if (!globalAny.kickedMembers[room].includes(memberId)) {
      globalAny.kickedMembers[room].push(memberId)
    }

    // Immediately remove from active members
    if (globalAny.roomMembers?.[room]) {
      delete globalAny.roomMembers[room][memberId]
    }

    return res.status(200).json({ success: true })
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message })
  }
}
