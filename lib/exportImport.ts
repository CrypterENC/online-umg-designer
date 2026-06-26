import { WidgetNode, CanvasSize } from './types'
import { importNode } from './treeOps'

export type UmgBridgeDoc = {
  version: string
  name: string
  source?: string
  canvas: { width: number; height: number }
  tree: unknown
}

function exportNode(node: WidgetNode, parentType?: string): unknown {
  // Clean slot: CanvasPanel children only need position/size/anchors
  let slot = node.slot
  if (parentType === 'CanvasPanel' && slot) {
    slot = {
      position: slot.position,
      size: slot.size,
      anchors: slot.anchors ?? { min: [0, 0], max: [0, 0] },
    } as typeof slot
  }

  // Lift visual style props into properties so UMG Bridge can apply them
  const s = (node.style || {}) as Record<string, unknown>
  let properties: Record<string, unknown> = { ...(node.properties as Record<string, unknown> || {}) }
  if (node.type === 'Button') {
    if (s.backgroundColor) properties.backgroundColor = s.backgroundColor
    if (s.hoverColor)       properties.hoverColor      = s.hoverColor
    if (s.pressedColor)     properties.pressedColor    = s.pressedColor
    if (s.borderColor) {
      properties.borderColor = s.borderColor
      if (s.borderWidth != null) properties.borderWidth = s.borderWidth
    }
    if (s.borderRadius != null) properties.borderRadius = s.borderRadius
    if (s.padding)          properties.padding         = s.padding
  }
  if (node.type === 'Border') {
    if (s.backgroundColor) { properties.brushColor = s.backgroundColor; properties.drawAs = (node.properties as Record<string,unknown>)?.drawAs ?? 'Image' }
    if (s.borderColor) {
      properties.borderColor = s.borderColor
      if (s.borderWidth  != null) properties.borderWidth  = s.borderWidth
      if (s.borderRadius != null) properties.borderRadius = s.borderRadius
    }
    if (s.padding)         properties.padding     = s.padding
  }
  if (node.type === 'CanvasPanel') {
    if (s.backgroundColor) properties.backgroundColor = s.backgroundColor
    if (s.borderColor)     properties.borderColor     = s.borderColor
  }

  // For Buttons with text, synthesize a Text child so UMG renders the label
  let children = node.children
  if (node.type === 'Button' && properties.text && node.children.length === 0) {
    const font = (properties.font as Record<string, unknown>) || {}
    children = [{
      id: `${node.id}_label`,
      type: 'Text',
      name: `${node.name}_Label`,
      slot: {},
      style: {},
      properties: {
        text: properties.text as string,
        color: (properties.color as string) ?? '#ffffffff',
        font: { size: (font.size as number) ?? 14, weight: (font.weight as string) ?? 'Regular' },
      },
      children: [],
    }]
  }

  const out: Record<string, unknown> = { type: node.type, name: node.name }
  if (slot && Object.keys(slot).length) out.slot = slot
  if (node.style && Object.keys(node.style).length) out.style = node.style
  if (Object.keys(properties).length) out.properties = properties
  if (node.transform) out.transform = node.transform
  out.children = children.map(c => exportNode(c, node.type))
  return out
}

const GOOGLE_FONT_URLS: Record<string, string> = {
  'Inter': 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50Kn42GW7X80WqVm6COA.ttf',
  'Roboto': 'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxKKTU1Kg.ttf',
  'Outfit': 'https://fonts.gstatic.com/s/outfit/v11/F3o1QoGs12C2BM87kF96xuxy.ttf',
  'Cinzel': 'https://fonts.gstatic.com/s/cinzel/v19/8wgl4729O65S4sGS96Kj2t6F.ttf',
  'Orbitron': 'https://fonts.gstatic.com/s/orbitron/v31/yMJRQI5C7vZOK6Ro0MyX59p2.ttf',
  'Montserrat': 'https://fonts.gstatic.com/s/montserrat/v26/JTUSjIg1_i6t8kCHKm459Wlhyw.ttf',
  'Press Start 2P': 'https://fonts.gstatic.com/s/pressstart2p/v15/e3t4euO8Oc5ORd7_cbmnYOBYg7w.ttf',
  'Fira Code': 'https://fonts.gstatic.com/s/firacode/v22/uK_50yUMOVIMqi3G_YQ3275uqyI.ttf',
}

function collectFonts(node: WidgetNode | null, fonts: Set<string>) {
  if (!node) return
  const p = node.properties || {}
  const font = p.font as { family?: string } | undefined
  if (font?.family && font.family !== 'Default') {
    fonts.add(font.family)
  }
  for (const child of node.children) {
    collectFonts(child, fonts)
  }
}

export function exportJSON(tree: WidgetNode | null, canvas: CanvasSize, widgetName: string): void {
  const fontFamilies = new Set<string>()
  if (tree) collectFonts(tree, fontFamilies)
  
  const fontsMeta = Array.from(fontFamilies).map(family => ({
    name: family,
    url: GOOGLE_FONT_URLS[family] || '',
  })).filter(f => f.url !== '')

  const doc: UmgBridgeDoc & { fonts?: { name: string; url: string }[] } = {
    version: '1.0',
    name: widgetName,
    source: 'umg-designer',
    canvas: { width: canvas.w, height: canvas.h },
    fonts: fontsMeta.length > 0 ? fontsMeta : undefined,
    tree: tree ? exportNode(tree) : null,
  }
  const blob = new Blob([JSON.stringify(doc, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${widgetName}.umgbridge.json`
  a.click()
  URL.revokeObjectURL(url)
}

export function parseUmgBridgeJSON(text: string): { tree: WidgetNode | null; canvas: CanvasSize; name: string } {
  const doc = JSON.parse(text) as UmgBridgeDoc & { fonts?: { name: string; url: string }[] }
  
  // Inject font stylesheets on import if running in browser
  if (typeof window !== 'undefined' && doc.fonts && Array.isArray(doc.fonts)) {
    doc.fonts.forEach(f => {
      if (f.name && f.url) {
        const linkId = `gfont-${f.name.toLowerCase().replace(/ /g, '-')}`
        if (!document.getElementById(linkId)) {
          const link = document.createElement('link')
          link.id = linkId
          link.rel = 'stylesheet'
          link.href = `https://fonts.googleapis.com/css2?family=${f.name.replace(/ /g, '+')}&display=swap`
          document.head.appendChild(link)
        }
      }
    })
  }

  const canvas: CanvasSize = {
    w: doc.canvas?.width ?? 1920,
    h: doc.canvas?.height ?? 1080,
  }
  const tree = doc.tree ? importNode(doc.tree as Record<string, unknown>) : null
  return { tree, canvas, name: doc.name || 'WBP_MyWidget' }
}
