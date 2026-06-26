import { NextApiRequest, NextApiResponse } from 'next'
import { addWidgetToState, listWidgetsInTree } from '@/lib/mcpHelpers'

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

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { name, arguments: args = {} } = req.body as { name: string; arguments: Record<string, any> }

  // Resolve room from query params or arguments
  const room = (req.query.room as string) || (args.room as string) || 'default'
  const state = getDesignState(room)

  try {
    let result = ''

    if (name === 'add_widget') {
      const { type, name: wname, properties = {}, style = {}, slot = {}, parentId } = args
      const addedNode = addWidgetToState(state, type, wname, properties, style, slot, parentId)
      state.version += 1
      state.updatedAt = Date.now()
      result = `Added ${type} widget: ${wname} (ID: ${addedNode.id})`
    } else if (name === 'list_widgets') {
      const widgets = listWidgetsInTree(state.tree)
      result = widgets.length === 0 ? 'No widgets yet' : JSON.stringify(widgets, null, 2)
    } else if (name === 'export_design') {
      const { filename } = args
      const widgetName = filename ? filename.replace(/\.(umgbridge\.)?json$/i, '') : state.widgetName
      
      state.widgetName = widgetName
      state.version += 1
      state.updatedAt = Date.now()

      const output = {
        version: '1.0',
        name: widgetName,
        canvas: {
          width: state.canvas.w,
          height: state.canvas.h,
        },
        tree: state.tree,
      }
      result = JSON.stringify(output, null, 2)
    } else if (name === 'clear_canvas') {
      state.tree = null
      state.version += 1
      state.updatedAt = Date.now()
      result = 'Canvas cleared'
    } else {
      return res.status(400).json({ error: `Unknown tool: ${name}` })
    }

    return res.status(200).json({ result })
  } catch (err) {
    return res.status(500).json({ error: (err as Error).message })
  }
}
