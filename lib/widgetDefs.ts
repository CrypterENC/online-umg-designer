export type WidgetDef = {
  panel: boolean
  icon: string
  label: string
  defaultStyle?: Record<string, unknown>
  defaultProps?: Record<string, unknown>
  defaultSlot?: Record<string, unknown>
}

export const WMAP: Record<string, WidgetDef> = {
  CanvasPanel:       { panel: true,  icon: '⬡', label: 'Canvas Panel' },
  Overlay:           { panel: true,  icon: '⧉', label: 'Overlay' },
  VerticalBox:       { panel: true,  icon: '☰', label: 'Vertical Box' },
  HorizontalBox:     { panel: true,  icon: '⇔', label: 'Horizontal Box' },
  GridPanel:         { panel: true,  icon: '⊞', label: 'Grid Panel',      defaultProps: { columnsCount: 2, rowsCount: 2 } },
  UniformGridPanel:  { panel: true,  icon: '⊟', label: 'Uniform Grid',    defaultProps: { columnsCount: 3, rowsCount: 3 } },
  ScrollBox:         { panel: true,  icon: '↕', label: 'Scroll Box' },
  WrapBox:           { panel: true,  icon: '↩', label: 'Wrap Box' },
  Border:            { panel: true,  icon: '▢', label: 'Border',           defaultStyle: { backgroundColor: '#0c0f16eb', borderColor: '#ffffff0f', borderRadius: 8, borderWidth: 1 } },
  SizeBox:           { panel: true,  icon: '⤡', label: 'Size Box',         defaultProps: { minDesiredWidth: 0, minDesiredHeight: 0, maxDesiredWidth: 0, maxDesiredHeight: 0 } },
  ScaleBox:          { panel: true,  icon: '⤢', label: 'Scale Box' },
  BackgroundBlur:    { panel: true,  icon: '◫', label: 'Background Blur',  defaultProps: { blurStrength: 10 } },
  RetainerBox:       { panel: true,  icon: '⬚', label: 'Retainer Box' },
  NamedSlot:         { panel: true,  icon: '◈', label: 'Named Slot',       defaultProps: { slotName: 'Default' } },
  InvalidationBox:   { panel: true,  icon: '⚡', label: 'Invalidation Box' },
  Button:            { panel: false, icon: '⬜', label: 'Button',
    defaultStyle: { backgroundColor: '#2c1905f5', hoverColor: '#382208f5', pressedColor: '#1a0e02f5', borderColor: '#f28c1a80', borderRadius: 7, borderWidth: 1, padding: [14, 20, 14, 20] as [number,number,number,number] },
    defaultProps: { text: 'Button' } },
  Text:              { panel: false, icon: 'T',  label: 'Text',             defaultProps: { text: 'Text', color: '#faf5ebff', font: { size: 14, weight: 'Regular' } } },
  RichText:          { panel: false, icon: 'Ŧ',  label: 'Rich Text',        defaultProps: { text: 'Rich Text', color: '#faf5ebff', font: { size: 14, weight: 'Regular' } } },
  Image:             { panel: false, icon: '🖼', label: 'Image',            defaultStyle: { tint: '#ffffffff' }, defaultProps: { src: '' } },
  TextInput:         { panel: false, icon: '▭', label: 'Text Input',        defaultProps: { hintText: 'Enter text...', color: '#888888ff', font: { size: 12, weight: 'Regular' } } },
  ProgressBar:       { panel: false, icon: '▬', label: 'Progress Bar',      defaultProps: { percent: 0.5, fillColor: '#f28c1aff' } },
  Slider:            { panel: false, icon: '⊟', label: 'Slider',            defaultProps: { value: 0.5, minValue: 0, maxValue: 1, stepSize: 0.01 } },
  CheckBox:          { panel: false, icon: '☑', label: 'Check Box',         defaultProps: { isChecked: false, label: 'CheckBox' } },
  SpinBox:           { panel: false, icon: '🔢', label: 'Spin Box',         defaultProps: { value: 0, minValue: 0, maxValue: 100, delta: 1 } },
  ComboBox:          { panel: false, icon: '▾', label: 'Combo Box',         defaultProps: { options: ['Option 1', 'Option 2', 'Option 3'], selectedIndex: 0 } },
  Spacer:            { panel: false, icon: '↔', label: 'Spacer',            defaultProps: { size: 20 } },
  Throbber:          { panel: false, icon: '⟳', label: 'Throbber' },
  CircularThrobber:  { panel: false, icon: '◌', label: 'Circular Throbber' },
}

export const SINGLE_CHILD_PANELS = new Set([
  'Border',
  'SizeBox',
  'ScaleBox',
  'BackgroundBlur',
  'RetainerBox',
  'InvalidationBox',
  'NamedSlot'
])

export const PALETTE_GROUPS = [
  {
    label: 'Panels',
    types: ['CanvasPanel','Overlay','VerticalBox','HorizontalBox','GridPanel','UniformGridPanel','ScrollBox','WrapBox','Border','SizeBox','ScaleBox','BackgroundBlur','RetainerBox','NamedSlot','InvalidationBox'],
  },
  {
    label: 'Common',
    types: ['Button','Text','RichText','Image','TextInput','Spacer'],
  },
  {
    label: 'Input',
    types: ['CheckBox','Slider','SpinBox','ComboBox'],
  },
  {
    label: 'Misc',
    types: ['ProgressBar','Throbber','CircularThrobber'],
  },
]
