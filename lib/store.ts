import { DesignerState, DesignerAction, WidgetNode } from './types'
import { updateNode, deleteNode, addChild, moveNode, duplicateNode } from './treeOps'

const MAX_HISTORY = 50

function pushHistory(state: DesignerState, tree: WidgetNode | null): DesignerState {
  const history = [...state.history.slice(0, state.histIndex + 1), tree ? JSON.parse(JSON.stringify([tree])) : [null]]
  if (history.length > MAX_HISTORY) history.shift()
  return { ...state, history, histIndex: history.length - 1 }
}

export const initialState: DesignerState = {
  tree: null,
  sel: null,
  canvas: { w: 1920, h: 1080 },
  zoom: 0.5,
  history: [[null] as unknown as WidgetNode[]],
  histIndex: 0,
  expanded: new Set(),
  widgetName: 'WBP_MyWidget',
  dragging: null,
}

export function reducer(state: DesignerState, action: DesignerAction): DesignerState {
  switch (action.type) {
    case 'SET_TREE': {
      return { ...pushHistory(state, action.tree), tree: action.tree }
    }
    case 'SET_TREE_SILENT': {
      // ponytail: sync from server — no undo history entry
      return { ...state, tree: action.tree }
    }
    case 'SELECT':
      return { ...state, sel: action.id }
    case 'SET_CANVAS':
      return { ...state, canvas: action.canvas }
    case 'SET_ZOOM':
      return { ...state, zoom: Math.min(2, Math.max(0.1, action.zoom)) }
    case 'SET_WIDGET_NAME':
      return { ...state, widgetName: action.name }
    case 'TOGGLE_EXPAND': {
      const expanded = new Set(state.expanded)
      if (expanded.has(action.id)) expanded.delete(action.id)
      else expanded.add(action.id)
      return { ...state, expanded }
    }
    case 'EXPAND_ALL_PANELS': {
      const expanded = new Set(state.expanded)
      action.ids.forEach(id => expanded.add(id))
      return { ...state, expanded }
    }
    case 'SET_DRAGGING':
      return { ...state, dragging: action.id }
    case 'UNDO': {
      if (state.histIndex <= 0) return state
      const histIndex = state.histIndex - 1
      const entry = state.history[histIndex]
      const tree = Array.isArray(entry) ? (entry[0] ?? null) : null
      return { ...state, histIndex, tree, sel: null }
    }
    case 'REDO': {
      if (state.histIndex >= state.history.length - 1) return state
      const histIndex = state.histIndex + 1
      const entry = state.history[histIndex]
      const tree = Array.isArray(entry) ? (entry[0] ?? null) : null
      return { ...state, histIndex, tree, sel: null }
    }
    case 'PUSH_HISTORY':
      return pushHistory(state, action.tree)
    case 'UPDATE_NODE': {
      if (!state.tree) return state
      const newTree = updateNode(state.tree, action.id, action.patch)
      return pushHistory({ ...state, tree: newTree }, newTree)
    }
    case 'DELETE_NODE': {
      if (!state.tree) return state
      const newTree = state.tree.id === action.id ? null : deleteNode(state.tree, action.id)
      return pushHistory({ ...state, tree: newTree, sel: null }, newTree)
    }
    case 'ADD_CHILD': {
      if (!state.tree) {
        return pushHistory({ ...state, tree: action.node }, action.node)
      }
      const newTree = addChild(state.tree, action.parentId, action.node)
      return pushHistory({ ...state, tree: newTree, sel: action.node.id }, newTree)
    }
    case 'MOVE_NODE': {
      if (!state.tree) return state
      const newTree = moveNode(state.tree, action.id, action.direction)
      return pushHistory({ ...state, tree: newTree }, newTree)
    }
    case 'DUPLICATE_NODE': {
      if (!state.tree) return state
      const newTree = duplicateNode(state.tree, action.id)
      return pushHistory({ ...state, tree: newTree }, newTree)
    }
    case 'CLEAR':
      return pushHistory({ ...state, tree: null, sel: null }, null)
    default:
      return state
  }
}
