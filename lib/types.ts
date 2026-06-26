export type SlotData = {
  padding?: [number, number, number, number]
  sizeRule?: 'Auto' | 'Fill'
  fillWeight?: number
  horizontalAlignment?: 'Fill' | 'Left' | 'Center' | 'Right'
  verticalAlignment?: 'Fill' | 'Top' | 'Center' | 'Bottom'
  // CanvasPanel
  position?: { x: number; y: number }
  size?: { x: number; y: number }
  anchors?: { min: [number, number]; max: [number, number] }
  // GridPanel
  row?: number
  column?: number
}

export type GradientStop = { color: string; position: number }
export type GradientData = { type: 'linear' | 'radial'; angle?: number; stops: GradientStop[] }
export type AnimationData = { type: string; duration?: number; delay?: number; loop?: boolean }

export type StyleData = {
  backgroundColor?: string
  borderColor?: string
  borderWidth?: number
  borderRadius?: number
  padding?: [number, number, number, number]
  opacity?: number
  visibility?: 'Visible' | 'Hidden' | 'Collapsed'
  tint?: string
  hoverColor?: string
  pressedColor?: string
  gradient?: GradientData
  animation?: AnimationData
  glowColor?: string
  glowStrength?: number
  [key: string]: unknown
}

export type PropData = {
  text?: string
  fontSize?: number
  fontStyle?: string
  color?: string
  font?: { size?: number; weight?: string; letterSpacing?: number; family?: string }
  horizontalAlignment?: string
  verticalAlignment?: string
  hintText?: string
  isChecked?: boolean
  percent?: number
  fillColor?: string
  size?: number
  columnsCount?: number
  rowsCount?: number
  drawAs?: 'Image' | 'Box' | 'Border' | 'RoundedBox' | 'NoDrawType'
  [key: string]: unknown
}

export type WidgetNode = {
  id: string
  type: string
  name: string
  slot: SlotData
  style: StyleData
  properties: PropData
  transform?: { angle?: number; scale?: [number, number] }
  children: WidgetNode[]
  editorHidden?: boolean
  editorLocked?: boolean
}

export type CanvasSize = { w: number; h: number }

export type DesignerState = {
  tree: WidgetNode | null
  sel: string | null
  canvas: CanvasSize
  zoom: number
  history: WidgetNode[][]
  histIndex: number
  expanded: Set<string>
  widgetName: string
  dragging: string | null
}

export type DesignerAction =
  | { type: 'SET_TREE'; tree: WidgetNode | null }
  | { type: 'SELECT'; id: string | null }
  | { type: 'SET_CANVAS'; canvas: CanvasSize }
  | { type: 'SET_ZOOM'; zoom: number }
  | { type: 'SET_WIDGET_NAME'; name: string }
  | { type: 'TOGGLE_EXPAND'; id: string }
  | { type: 'EXPAND_ALL_PANELS'; ids: string[] }
  | { type: 'SET_DRAGGING'; id: string | null }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'PUSH_HISTORY'; tree: WidgetNode | null }
  | { type: 'UPDATE_NODE'; id: string; patch: Partial<WidgetNode> }
  | { type: 'DELETE_NODE'; id: string }
  | { type: 'ADD_CHILD'; parentId: string; node: WidgetNode }
  | { type: 'MOVE_NODE'; id: string; direction: 'up' | 'down' }
  | { type: 'DUPLICATE_NODE'; id: string }
  | { type: 'CLEAR' }
