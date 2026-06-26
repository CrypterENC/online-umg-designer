import { NextApiRequest, NextApiResponse } from 'next'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js'
import { z } from 'zod'
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

// Initialize MCP server instance once
if (!globalAny.mcpServer) {
  const server = new McpServer({ name: 'umg-designer-mcp', version: '1.0.0' })

  // Tool: add_widget
  server.tool(
    'add_widget',
    'Add a widget to the canvas tree layout.',
    {
      type: z.string().describe('Widget type (e.g. Button, Text, Image, VerticalBox, HorizontalBox, CanvasPanel, Overlay, ScrollBox, GridPanel, Border, ProgressBar, etc.)'),
      name: z.string().describe('Unique descriptive name for the widget (e.g. Btn_HostGame, Txt_Title)'),
      properties: z.record(z.string(), z.any()).optional().describe('Widget properties (e.g., text, fontSize, color, percent, hintText)'),
      style: z.record(z.string(), z.any()).optional().describe('Styling properties (e.g., backgroundColor, borderColor, borderRadius, borderWidth, opacity, padding)'),
      slot: z.record(z.string(), z.any()).optional().describe('Layout slot parameters (e.g., position, size, sizeRule, horizontalAlignment, verticalAlignment)'),
      parentId: z.string().optional().describe('Optional ID or name of the parent container widget to nest this widget under.'),
      room: z.string().optional().describe('Optional room/workspace ID. Defaults to "default".'),
    },
    async ({ type, name, properties = {}, style = {}, slot = {}, parentId, room = 'default' }) => {
      try {
        const state = getDesignState(room)
        const addedNode = addWidgetToState(state, type, name, properties, style, slot, parentId)
        state.version += 1
        state.updatedAt = Date.now()
        return {
          content: [
            {
              type: 'text',
              text: `Added ${type} widget "${name}" (ID: ${addedNode.id}) to layout.`,
            },
          ],
        }
      } catch (err) {
        return {
          isError: true,
          content: [{ type: 'text', text: `Failed to add widget: ${(err as Error).message}` }],
        }
      }
    }
  )

  // Tool: list_widgets
  server.tool(
    'list_widgets',
    'List all widgets currently on the canvas design.',
    {
      room: z.string().optional().describe('Optional room/workspace ID. Defaults to "default".'),
    },
    async ({ room = 'default' }) => {
      const state = getDesignState(room)
      const widgets = listWidgetsInTree(state.tree)
      const text = widgets.length === 0 ? 'No widgets on canvas.' : JSON.stringify(widgets, null, 2)
      return { content: [{ type: 'text', text }] }
    }
  )

  // Tool: clear_canvas
  server.tool(
    'clear_canvas',
    'Clear all widgets and reset the canvas design layout.',
    {
      room: z.string().optional().describe('Optional room/workspace ID. Defaults to "default".'),
    },
    async ({ room = 'default' }) => {
      const state = getDesignState(room)
      state.tree = null
      state.version += 1
      state.updatedAt = Date.now()
      return { content: [{ type: 'text', text: 'Canvas successfully cleared.' }] }
    }
  )

  // Tool: export_design
  server.tool(
    'export_design',
    'Export current design state in .umgbridge.json schema format.',
    {
      filename: z.string().describe('The target output filename (e.g. WBP_MainMenu.umgbridge.json)'),
      room: z.string().optional().describe('Optional room/workspace ID. Defaults to "default".'),
    },
    async ({ filename, room = 'default' }) => {
      const state = getDesignState(room)
      const widgetName = filename.replace(/\.(umgbridge\.)?json$/i, '')
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

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(output, null, 2),
          },
        ],
      }
    }
  )

  globalAny.mcpServer = server
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  // ponytail: fresh transport per request — SDK requires this for stateless mode
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined })
  await globalAny.mcpServer.connect(transport)

  try {
    await transport.handleRequest(req, res, req.body)
    res.on('close', () => transport.close())
  } catch (error) {
    console.error('MCP handler error:', error)
    if (!res.writableEnded) {
      res.status(500).json({ error: (error as Error).message })
    }
  }
}
