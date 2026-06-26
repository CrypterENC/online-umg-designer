import { NextApiRequest, NextApiResponse } from 'next'

const globalAny = global as any
if (!globalAny.designStates) {
  globalAny.designStates = {}
}

function getDesignState(room: string) {
  const r = room || 'default'
  if (!globalAny.designStates[r]) {
    globalAny.designStates[r] = {
      version: 1,
      updatedAt: Date.now(),
      tree: null,
      canvas: { w: 1920, h: 1080 },
      widgetName: 'WBP_MyWidget',
    }
  }
  return globalAny.designStates[r]
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  const room = (req.query.room as string) || 'default'
  const state = getDesignState(room)

  if (req.method === 'GET') {
    return res.status(200).json(state)
  }

  if (req.method === 'POST' || req.method === 'PUT') {
    try {
      const { tree, canvas, widgetName } = req.body

      if (tree !== undefined) state.tree = tree
      if (canvas !== undefined) state.canvas = canvas
      if (widgetName !== undefined) state.widgetName = widgetName

      // Increment version and update timestamp
      state.version += 1
      state.updatedAt = Date.now()

      return res.status(200).json({
        success: true,
        version: state.version,
        updatedAt: state.updatedAt,
      })
    } catch (error) {
      return res.status(500).json({ error: (error as Error).message })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
