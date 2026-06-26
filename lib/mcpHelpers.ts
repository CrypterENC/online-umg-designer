import { WMAP } from './widgetDefs'

// Generate a unique ID
export function generateId(): string {
  return 'w_' + Math.random().toString(36).substring(2, 9)
}

// Create a new widget node
export function createWidgetNode(type: string, name: string, props: any = {}, style: any = {}, slot: any = {}): any {
  const def = WMAP[type] || {}
  const sizeMap: Record<string, { x: number; y: number }> = {
    Text: { x: 200, y: 40 }, Button: { x: 200, y: 60 }, TextInput: { x: 200, y: 40 },
    Image: { x: 200, y: 150 }, ProgressBar: { x: 200, y: 20 }, Slider: { x: 200, y: 30 }, CheckBox: { x: 30, y: 30 },
  }

  const defaultSlot = sizeMap[type] ? { size: sizeMap[type] } : {}

  return {
    id: generateId(),
    type,
    name: name || type,
    slot: { ...defaultSlot, ...(def.defaultSlot || {}), ...slot },
    style: { ...(def.defaultStyle || {}), ...style },
    properties: { ...(def.defaultProps || {}), ...props },
    children: [],
  }
}

// Recursively add a child node to a parent node by ID or name
export function addChildToTree(root: any, parentIdOrName: string | undefined, node: any): boolean {
  if (!root) return false

  if (parentIdOrName) {
    if (root.id === parentIdOrName || root.name === parentIdOrName) {
      const parentDef = WMAP[root.type]
      if (parentDef && parentDef.panel) {
        root.children = root.children || []
        root.children.push(node)
        return true
      }
      return false
    }
  }

  for (const child of root.children || []) {
    const success = addChildToTree(child, parentIdOrName, node)
    if (success) return true
  }
  return false
}

// Traverses tree to list widgets
export function listWidgetsInTree(node: any): any[] {
  if (!node) return []
  const list = [{ id: node.id, type: node.type, name: node.name, properties: node.properties }]
  for (const child of node.children || []) {
    list.push(...listWidgetsInTree(child))
  }
  return list
}

// Add widget to state, automatically creating root/containers if needed
export function addWidgetToState(state: any, type: string, name: string, props: any, style: any, slot: any, parentId?: string) {
  const node = createWidgetNode(type, name, props, style, slot)

  if (!state.tree) {
    const def = WMAP[type]
    if (def && def.panel) {
      state.tree = node
    } else {
      // Wrap leaf in CanvasPanel
      const rootNode = createWidgetNode('CanvasPanel', 'CanvasPanel_Root')
      node.slot = {
        position: { x: 100, y: 100 },
        size: node.slot.size || { x: 200, y: 60 }
      }
      rootNode.children.push(node)
      state.tree = rootNode
    }
    return node
  }

  const success = addChildToTree(state.tree, parentId, node)
  if (!success && !parentId) {
    // Add to root directly if root is a panel
    const rootDef = WMAP[state.tree.type]
    if (rootDef && rootDef.panel) {
      if (state.tree.type === 'CanvasPanel') {
        node.slot = {
          position: { x: 100, y: 100 },
          size: node.slot.size || { x: 200, y: 60 }
        }
      }
      state.tree.children = state.tree.children || []
      state.tree.children.push(node)
    } else {
      // Root is leaf, wrap root and new node in CanvasPanel
      const oldRoot = state.tree
      const rootNode = createWidgetNode('CanvasPanel', 'CanvasPanel_Root')
      rootNode.children.push({
        ...oldRoot,
        slot: { position: { x: 0, y: 0 }, size: { x: 1920, y: 1080 } }
      })
      node.slot = {
        position: { x: 100, y: 100 },
        size: node.slot.size || { x: 200, y: 60 }
      }
      rootNode.children.push(node)
      state.tree = rootNode
    }
  } else if (!success && parentId) {
    throw new Error(`Parent node with ID or Name "${parentId}" not found or is not a container layout.`)
  }
  return node
}
