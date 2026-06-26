import { WidgetNode, SlotData } from './types'

export function hexToRgba(hex: string): string {
  if (!hex || !hex.startsWith('#')) return hex || 'transparent'
  const h = hex.slice(1)
  if (h.length === 6) return `#${h}`
  if (h.length === 8) {
    const a = parseInt(h.slice(6, 8), 16) / 255
    return `rgba(${parseInt(h.slice(0,2),16)},${parseInt(h.slice(2,4),16)},${parseInt(h.slice(4,6),16)},${a.toFixed(3)})`
  }
  return '#' + h
}

export function buildSlotCss(slot: SlotData, parentType: string): string {
  let css = ''
  if (!slot) return css

  if (parentType === 'CanvasPanel') {
    const pos = slot.position || { x: 0, y: 0 }
    const sz = slot.size || { x: 200, y: 100 }
    const a = slot.anchors || { min: [0,0] as [number,number], max: [0,0] as [number,number] }
    const min = a.min || [0, 0]
    const max = a.max || [0, 0]
    css += `position:absolute;`
    if (min[0] === 0 && max[0] === 1) css += `left:0;right:0;`
    else if (min[0] === 1 && max[0] === 1) css += `right:${-pos.x}px;width:${sz.x}px;`
    else css += `left:${pos.x}px;width:${sz.x}px;`
    if (min[1] === 0 && max[1] === 1) css += `top:0;bottom:0;`
    else if (min[1] === 1 && max[1] === 1) css += `bottom:${-pos.y}px;height:${sz.y}px;`
    else css += `top:${pos.y}px;height:${sz.y}px;`
    return css
  }

  const pad = slot.padding || [0, 0, 0, 0]
  css += `margin:${pad[0]}px ${pad[1]}px ${pad[2]}px ${pad[3]}px;`

  if (['VerticalBox', 'HorizontalBox', 'ScrollBox', 'Overlay', 'GridPanel', 'UniformGridPanel'].includes(parentType)) {
    css += `width:auto;height:auto;`
  }

  if (parentType === 'VerticalBox' || parentType === 'ScrollBox') {
    css += slot.sizeRule === 'Fill' ? `flex:${slot.fillWeight||1} 1 0;min-height:0;` : `flex:0 0 auto;`
    const ha = slot.horizontalAlignment || 'Fill'
    css += ha === 'Fill' ? `align-self:stretch;` : ha === 'Left' ? `align-self:flex-start;` : ha === 'Right' ? `align-self:flex-end;` : `align-self:center;`
  } else if (parentType === 'HorizontalBox') {
    css += slot.sizeRule === 'Fill' ? `flex:${slot.fillWeight||1} 1 0;min-width:0;` : `flex:0 0 auto;`
    const va = slot.verticalAlignment || 'Fill'
    css += va === 'Fill' ? `align-self:stretch;` : va === 'Top' ? `align-self:flex-start;` : va === 'Bottom' ? `align-self:flex-end;` : `align-self:center;`
  } else if (parentType === 'Overlay') {
    const ha = slot.horizontalAlignment || 'Fill'
    const va = slot.verticalAlignment || 'Fill'
    css += `justify-self:${ha==='Fill'?'stretch':ha==='Left'?'start':ha==='Right'?'end':'center'};`
    css += `align-self:${va==='Fill'?'stretch':va==='Top'?'start':va==='Bottom'?'end':'center'};`
  } else if (parentType === 'GridPanel' || parentType === 'UniformGridPanel') {
    const row = slot.row ?? 0
    const col = slot.column ?? 0
    css += `grid-row:${row+1};grid-column:${col+1};`
    const ha = slot.horizontalAlignment || 'Fill'
    const va = slot.verticalAlignment || 'Fill'
    css += `justify-self:${ha==='Fill'?'stretch':ha==='Left'?'start':ha==='Right'?'end':'center'};`
    css += `align-self:${va==='Fill'?'stretch':va==='Top'?'start':va==='Bottom'?'end':'center'};`
  } else if (['Border','SizeBox','ScaleBox','Button','NamedSlot','InvalidationBox'].includes(parentType)) {
    const ha = slot.horizontalAlignment || 'Fill'
    const va = slot.verticalAlignment || 'Fill'
    if (va === 'Fill') css += `align-self:stretch;`
    else if (va === 'Top') css += `align-self:flex-start;`
    else if (va === 'Bottom') css += `align-self:flex-end;`
    else css += `align-self:center;`
    
    if (ha === 'Fill') {
      css += `flex:1;width:100%;`
    } else {
      css += `flex:0 0 auto;width:auto;`
      if (ha === 'Left') css += `margin-right:auto;`
      else if (ha === 'Right') css += `margin-left:auto;`
      else css += `margin-left:auto;margin-right:auto;`
    }
  } else {
    css += slot.sizeRule === 'Fill' ? `flex:${slot.fillWeight||1} 1 0;` : `flex:0 0 auto;`
  }
  return css
}

export function buildWidgetCss(node: WidgetNode): string {
  const s = node.style || {}
  const p = node.properties || {}
  let css = ''

  if (node.type === 'VerticalBox') css += `display:flex;flex-direction:column;width:100%;height:100%;`
  if (node.type === 'HorizontalBox') css += `display:flex;flex-direction:row;width:100%;height:100%;`
  if (node.type === 'Overlay') css += `display:grid;position:relative;width:100%;height:100%;`
  if (node.type === 'GridPanel') {
    const cols = (p.columnsCount as number) || 2
    const rows = (p.rowsCount as number) || 2
    css += `display:grid;width:100%;height:100%;grid-template-columns:repeat(${cols},1fr);grid-template-rows:repeat(${rows},1fr);`
  }
  if (node.type === 'UniformGridPanel') {
    const cols = (p.columnsCount as number) || 3
    const rows = (p.rowsCount as number) || 3
    css += `display:grid;width:100%;height:100%;grid-template-columns:repeat(${cols},1fr);grid-template-rows:repeat(${rows},1fr);`
  }
  if (node.type === 'ScrollBox') css += `display:flex;flex-direction:column;overflow:auto;width:100%;height:100%;`
  if (node.type === 'WrapBox') css += `display:flex;flex-wrap:wrap;width:100%;height:100%;`
  if (node.type === 'CanvasPanel') css += `position:relative;width:100%;height:100%;`
  if (node.type === 'Border') css += `display:flex;width:100%;height:100%;`
  if (node.type === 'SizeBox') {
    css += `display:flex;width:100%;height:100%;`
    if (p.minDesiredWidth && (p.minDesiredWidth as number) > 0) css += `min-width:${p.minDesiredWidth}px;width:${p.minDesiredWidth}px;`
    if (p.minDesiredHeight && (p.minDesiredHeight as number) > 0) css += `min-height:${p.minDesiredHeight}px;height:${p.minDesiredHeight}px;`
    if (p.maxDesiredWidth && (p.maxDesiredWidth as number) > 0) css += `max-width:${p.maxDesiredWidth}px;`
    if (p.maxDesiredHeight && (p.maxDesiredHeight as number) > 0) css += `max-height:${p.maxDesiredHeight}px;`
  }
  if (node.type === 'Button') css += `display:flex;align-items:center;justify-content:center;cursor:pointer;`
  if (node.type === 'BackgroundBlur') {
    const blur = (p.blurStrength as number) ?? 10
    css += `backdrop-filter:blur(${blur}px);-webkit-backdrop-filter:blur(${blur}px);`
  }

  const bgColor = s.backgroundColor || (p.backgroundColor as string)
  if (bgColor) css += `background:${hexToRgba(bgColor)};`

  const grad = s.gradient as { type: string; angle?: number; stops: Array<{ color: string; position: number }> } | undefined
  if (grad?.stops && grad.stops.length >= 2) {
    const stops = grad.stops.map(st => `${hexToRgba(st.color)} ${(st.position * 100).toFixed(0)}%`).join(', ')
    css += grad.type === 'radial'
      ? `background:radial-gradient(circle, ${stops});`
      : `background:linear-gradient(${grad.angle ?? 0}deg, ${stops});`
  }

  const borderRadius = s.borderRadius ?? (p.borderRadius as number)
  const borderColor = s.borderColor || (p.borderColor as string)
  const borderWidth = s.borderWidth ?? (p.borderWidth as number)
  if (borderRadius != null) css += `border-radius:${borderRadius}px;`
  if (borderColor) css += `border:${borderWidth ?? 1}px solid ${hexToRgba(borderColor)};`

  const padding = s.padding || (p.padding as [number,number,number,number])
  if (padding && Array.isArray(padding))
    css += `padding:${padding[0]}px ${padding[1]}px ${padding[2]}px ${padding[3]}px;`

  if (s.opacity != null) css += `opacity:${s.opacity};`
  if (s.visibility === 'Hidden') css += `opacity:0.2;`
  if (s.visibility === 'Collapsed') css += `display:none;`
  if (s.tint) css += `background:${hexToRgba(s.tint)};`

  const glowColor = s.glowColor as string | undefined
  const glowStrength = (s.glowStrength as number) ?? 15
  if (glowColor && glowColor !== '#00000000') {
    css += `box-shadow: 0 0 ${glowStrength}px ${Math.max(1, Math.round(glowStrength / 4))}px ${hexToRgba(glowColor)};`
  }

  return css
}
