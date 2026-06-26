import { NextApiRequest, NextApiResponse } from 'next'

// Attach to global scope to survive serverless function recycles in the same runtime instance
const globalAny = global as any
if (!globalAny.designState) {
  globalAny.designState = {
    version: 1,
    updatedAt: Date.now(),
    tree: null,
    canvas: { w: 1920, h: 1080 },
    widgetName: 'WBP_MyWidget',
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method === 'GET') {
    return res.status(200).json(globalAny.designState)
  }

  if (req.method === 'POST' || req.method === 'PUT') {
    try {
      const { tree, canvas, widgetName } = req.body

      if (tree !== undefined) globalAny.designState.tree = tree
      if (canvas !== undefined) globalAny.designState.canvas = canvas
      if (widgetName !== undefined) globalAny.designState.widgetName = widgetName

      // Increment version and update timestamp
      globalAny.designState.version += 1
      globalAny.designState.updatedAt = Date.now()

      return res.status(200).json({
        success: true,
        version: globalAny.designState.version,
        updatedAt: globalAny.designState.updatedAt,
      })
    } catch (error) {
      return res.status(500).json({ error: (error as Error).message })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
