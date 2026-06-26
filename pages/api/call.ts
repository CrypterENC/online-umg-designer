import { NextApiRequest, NextApiResponse } from 'next'
import { addWidgetToState, listWidgetsInTree } from '@/lib/mcpHelpers'

const globalAny = global as any

// Initialize design state if it doesn't exist
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

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { name, arguments: args = {} } = req.body as { name: string; arguments: Record<string, any> }

  try {
    let result = ''

    if (name === 'add_widget') {
      const { type, name: wname, properties = {}, style = {}, slot = {}, parentId } = args
      const addedNode = addWidgetToState(globalAny.designState, type, wname, properties, style, slot, parentId)
      globalAny.designState.version += 1
      globalAny.designState.updatedAt = Date.now()
      result = `Added ${type} widget: ${wname} (ID: ${addedNode.id})`
    } else if (name === 'list_widgets') {
      const widgets = listWidgetsInTree(globalAny.designState.tree)
      result = widgets.length === 0 ? 'No widgets yet' : JSON.stringify(widgets, null, 2)
    } else if (name === 'export_design') {
      const { filename } = args
      const widgetName = filename ? filename.replace(/\.(umgbridge\.)?json$/i, '') : globalAny.designState.widgetName
      
      globalAny.designState.widgetName = widgetName
      globalAny.designState.version += 1
      globalAny.designState.updatedAt = Date.now()

      const output = {
        version: '1.0',
        name: widgetName,
        canvas: {
          width: globalAny.designState.canvas.w,
          height: globalAny.designState.canvas.h,
        },
        tree: globalAny.designState.tree,
      }
      result = JSON.stringify(output, null, 2)
    } else if (name === 'clear_canvas') {
      globalAny.designState.tree = null
      globalAny.designState.version += 1
      globalAny.designState.updatedAt = Date.now()
      result = 'Canvas cleared'
    } else {
      return res.status(400).json({ error: `Unknown tool: ${name}` })
    }

    return res.status(200).json({ result })
  } catch (err) {
    return res.status(500).json({ error: (err as Error).message })
  }
}
