import { WidgetNode } from './types'
import { uid } from './uid'

export function findNode(tree: WidgetNode | null, id: string): WidgetNode | null {
  if (!tree) return null
  if (tree.id === id) return tree
  for (const c of tree.children) {
    const found = findNode(c, id)
    if (found) return found
  }
  return null
}

export function findParent(tree: WidgetNode | null, id: string): WidgetNode | null {
  if (!tree) return null
  for (let i = 0; i < tree.children.length; i++) {
    if (tree.children[i].id === id) return tree
    const found = findParent(tree.children[i], id)
    if (found) return found
  }
  return null
}

export function updateNode(tree: WidgetNode, id: string, patch: Partial<WidgetNode>): WidgetNode {
  if (tree.id === id) return { ...tree, ...patch }
  return { ...tree, children: tree.children.map(c => updateNode(c, id, patch)) }
}

export function deleteNode(tree: WidgetNode, id: string): WidgetNode {
  return {
    ...tree,
    children: tree.children
      .filter(c => c.id !== id)
      .map(c => deleteNode(c, id)),
  }
}

export function addChild(tree: WidgetNode, parentId: string, node: WidgetNode): WidgetNode {
  if (tree.id === parentId) return { ...tree, children: [...tree.children, node] }
  return { ...tree, children: tree.children.map(c => addChild(c, parentId, node)) }
}

export function moveNode(tree: WidgetNode, id: string, dir: 'up' | 'down'): WidgetNode {
  const parent = findParent(tree, id)
  if (!parent) return tree
  const idx = parent.children.findIndex(c => c.id === id)
  if (idx === -1) return tree
  const newChildren = [...parent.children]
  const swapIdx = dir === 'up' ? idx - 1 : idx + 1
  if (swapIdx < 0 || swapIdx >= newChildren.length) return tree;
  [newChildren[idx], newChildren[swapIdx]] = [newChildren[swapIdx], newChildren[idx]]
  return updateNode(tree, parent.id, { children: newChildren })
}

export function duplicateNode(tree: WidgetNode, id: string): WidgetNode {
  const parent = findParent(tree, id)
  if (!parent) return tree
  const idx = parent.children.findIndex(c => c.id === id)
  if (idx === -1) return tree
  const clone = deepCloneWithNewIds(parent.children[idx])
  const newChildren = [...parent.children]
  newChildren.splice(idx + 1, 0, clone)
  return updateNode(tree, parent.id, { children: newChildren })
}

export function deepCloneWithNewIds(node: WidgetNode): WidgetNode {
  return {
    ...JSON.parse(JSON.stringify(node)),
    id: uid(),
    children: node.children.map(deepCloneWithNewIds),
  }
}

export function collectPanelIds(node: WidgetNode, panels: Record<string, boolean>): string[] {
  const ids: string[] = []
  if (panels[node.type]) ids.push(node.id)
  for (const c of node.children) ids.push(...collectPanelIds(c, panels))
  return ids
}

export function importNode(raw: Record<string, unknown>): WidgetNode {
  // Normalize old-format JSON that puts style props in properties
  const rawProps = (raw.properties as Record<string, unknown>) || {}
  const rawStyle = (raw.style as Record<string, unknown>) || {}

  // Style keys that belong in style, not properties
  const STYLE_KEYS = new Set(['backgroundColor','borderColor','borderWidth','borderRadius','padding','opacity','visibility','tint','hoverColor','pressedColor'])
  const migratedStyle: Record<string, unknown> = { ...rawStyle }
  const cleanProps: Record<string, unknown> = {}

  for (const [k, v] of Object.entries(rawProps)) {
    if (STYLE_KEYS.has(k)) {
      if (migratedStyle[k] === undefined) migratedStyle[k] = v
    } else {
      cleanProps[k] = v
    }
  }

  // Normalize font: fontSize+fontStyle → font object
  if (cleanProps.fontSize && !(cleanProps.font)) {
    cleanProps.font = { size: cleanProps.fontSize, weight: cleanProps.fontStyle === 'Bold' ? 'Bold' : 'Regular' }
    delete cleanProps.fontSize
    delete cleanProps.fontStyle
  }

  const node: WidgetNode = {
    id: uid(),
    type: (raw.type as string) || 'VerticalBox',
    name: (raw.name as string) || (raw.type as string),
    slot: (raw.slot as WidgetNode['slot']) || {},
    style: migratedStyle as WidgetNode['style'],
    properties: cleanProps as WidgetNode['properties'],
    transform: raw.transform as WidgetNode['transform'],
    children: [],
  }

  const rawChildren = (raw.children as Record<string, unknown>[]) || []
  node.children = rawChildren.map(importNode)
  return node
}
