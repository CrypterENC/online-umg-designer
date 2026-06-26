'use client'
import React, { useRef, useState } from 'react'
import { WidgetNode } from '@/lib/types'
import { buildSlotCss, buildWidgetCss, hexToRgba } from '@/lib/cssBuilder'
import { WMAP } from '@/lib/widgetDefs'

interface Props {
  node: WidgetNode
  parentType: string
  selectedId: string | null
  onSelect: (id: string) => void
  onDrop: (targetId: string, draggedType: string, draggedId?: string) => void
  onMove?: (id: string, x: number, y: number) => void
  onDragEnd?: () => void
  zoom: number
  interactive?: boolean
}

function LeafContent({ node }: { node: WidgetNode }) {
  const p = node.properties || {}
  switch (node.type) {
    case 'Text':
    case 'RichText': {
      const col = hexToRgba((p.color as string) || '#faf5ebff')
      const font = p.font as { size?: number; weight?: string; letterSpacing?: number; family?: string } | undefined
      const ff = font?.family && font.family !== 'Default' ? `"${font.family}", sans-serif` : 'inherit'
      const sz = (p.fontSize as number) || font?.size || 14
      const fw = p.fontStyle === 'Bold' || font?.weight === 'Bold' ? '700' : '400'
      const ls = font?.letterSpacing ? `${font.letterSpacing / 1000}em` : 'normal'
      const j = (p.justification as string) || 'Left'
      const ta = j === 'Center' ? 'center' : j === 'Right' ? 'right' : j === 'Fill' ? 'justify' : 'left'
      return (
        <span style={{ fontFamily: ff, color: col, fontSize: sz, fontWeight: fw, letterSpacing: ls, textAlign: ta as React.CSSProperties['textAlign'], display: 'block', width: '100%', pointerEvents: 'none', whiteSpace: 'pre-wrap' }}>
          {(p.text as string) || 'Text'}
        </span>
      )
    }
    case 'Button': {
      const col = hexToRgba((p.color as string) || '#faf5ebff')
      const font = p.font as { size?: number; weight?: string; family?: string } | undefined
      const ff = font?.family && font.family !== 'Default' ? `"${font.family}", sans-serif` : 'inherit'
      const sz = (p.fontSize as number) || font?.size || 16
      const fw = p.fontStyle === 'Bold' || font?.weight === 'Bold' ? '700' : '400'
      return <span style={{ fontFamily: ff, color: col, fontSize: sz, fontWeight: fw, pointerEvents: 'none' }}>{(p.text as string) || 'Button'}</span>
    }
    case 'Image': {
      const src = p.src as string
      if (src) return <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', pointerEvents: 'none' }} />
      return <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#444', fontSize: 11, gap: 4, pointerEvents: 'none', border: '1px dashed #333' }}>🖼 Image</div>
    }
    case 'TextInput': {
      const hint = (p.hintText as string) || 'Enter text...'
      const col = hexToRgba((p.color as string) || '#888888ff')
      const font = p.font as { size?: number; family?: string } | undefined
      const ff = font?.family && font.family !== 'Default' ? `"${font.family}", sans-serif` : 'inherit'
      const sz = font?.size || 12
      return (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', padding: '0 8px', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 4, pointerEvents: 'none' }}>
          <span style={{ fontFamily: ff, color: col, fontSize: sz, fontStyle: 'italic' }}>{hint}</span>
        </div>
      )
    }
    case 'ProgressBar': {
      const pct = ((p.percent as number) ?? 0.5) * 100
      const fc = hexToRgba((p.fillColor as string) || '#f28c1aff')
      return (
        <div style={{ width: '100%', height: '100%', background: '#222', borderRadius: 3, overflow: 'hidden', pointerEvents: 'none' }}>
          <div style={{ width: `${pct}%`, height: '100%', background: fc }} />
        </div>
      )
    }
    case 'Slider': {
      const val = (p.value as number) ?? 0.5
      const min = (p.minValue as number) ?? 0
      const max = (p.maxValue as number) ?? 1
      const pct = Math.max(0, Math.min(100, ((val - min) / (max - min)) * 100))
      return (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '0 4px', pointerEvents: 'none' }}>
          <div style={{ flex: 1, height: 4, background: '#333', borderRadius: 2, position: 'relative' }}>
            <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${pct}%`, background: '#e8750a', borderRadius: 2 }} />
            <div style={{ position: 'absolute', top: '50%', left: `${pct}%`, transform: 'translate(-50%,-50%)', width: 12, height: 12, background: '#e8750a', borderRadius: '50%', border: '2px solid #fff' }} />
          </div>
          <span style={{ fontSize: 10, color: '#8b949e', minWidth: 28, textAlign: 'right' }}>{val.toFixed(2)}</span>
        </div>
      )
    }
    case 'CheckBox': {
      const checked = !!(p.isChecked)
      const label = (p.label as string) || ''
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, pointerEvents: 'none' }}>
          <div style={{ width: 16, height: 16, border: `2px solid ${checked ? '#e8750a' : '#555'}`, background: checked ? '#e8750a22' : 'transparent', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {checked && <span style={{ color: '#e8750a', fontSize: 10, fontWeight: 700 }}>✓</span>}
          </div>
          {label && <span style={{ color: '#e6edf3', fontSize: 12 }}>{label}</span>}
        </div>
      )
    }
    case 'SpinBox': {
      const val = (p.value as number) ?? 0
      return (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 4, overflow: 'hidden', pointerEvents: 'none' }}>
          <span style={{ flex: 1, padding: '0 8px', fontSize: 12, color: '#e6edf3' }}>{val}</span>
          <div style={{ display: 'flex', flexDirection: 'column', borderLeft: '1px solid rgba(255,255,255,0.08)', flexShrink: 0 }}>
            <div style={{ padding: '1px 5px', fontSize: 8, color: '#8b949e', borderBottom: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>▲</div>
            <div style={{ padding: '1px 5px', fontSize: 8, color: '#8b949e', textAlign: 'center' }}>▼</div>
          </div>
        </div>
      )
    }
    case 'ComboBox': {
      const options = (p.options as string[]) || ['Option 1']
      const idx = (p.selectedIndex as number) || 0
      const selected = options[Math.min(idx, options.length - 1)] || 'Select...'
      return (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 4, padding: '0 8px', pointerEvents: 'none' }}>
          <span style={{ fontSize: 12, color: '#e6edf3' }}>{selected}</span>
          <span style={{ fontSize: 10, color: '#8b949e' }}>▾</span>
        </div>
      )
    }
    case 'Spacer':
      return null
    case 'Throbber':
    case 'CircularThrobber':
      return <span style={{ color: '#888', fontSize: 18, pointerEvents: 'none', animation: 'spin 1s linear infinite', display: 'block', textAlign: 'center' }}>⟳</span>
    default:
      return null
  }
}

export default function WidgetRenderer({ node, parentType, selectedId, onSelect, onDrop, onMove, onDragEnd, zoom, interactive }: Props) {
  const slotCss   = buildSlotCss(node.slot, parentType)
  const widgetCss = buildWidgetCss(node)
  const isSelected = !interactive && node.id === selectedId
  const def    = WMAP[node.type]
  const isPanel = def?.panel ?? false

  const dragPosRef = useRef<{ x: number; y: number } | null>(null)
  const [btnState, setBtnState] = useState<'idle' | 'hover' | 'pressed'>('idle')

  const style: React.CSSProperties = {}
  const allCss = widgetCss + slotCss
  allCss.split(';').forEach(rule => {
    const colonIdx = rule.indexOf(':')
    if (colonIdx === -1) return
    const prop = rule.slice(0, colonIdx).trim()
    const val  = rule.slice(colonIdx + 1).trim()
    if (!prop || !val) return
    const camel = prop.replace(/-([a-z])/g, (_, c) => c.toUpperCase()) as keyof React.CSSProperties
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(style as any)[camel] = val
  })

const handleDragOver = (e: React.DragEvent) => { if (isPanel) { e.preventDefault(); e.stopPropagation() } }
  const handleDrop = (e: React.DragEvent) => {
    if (!isPanel) return
    e.preventDefault(); e.stopPropagation()
    const widgetType = e.dataTransfer.getData('widgetType')
    const draggedId  = e.dataTransfer.getData('widgetId')
    if (widgetType) onDrop(node.id, widgetType, draggedId || undefined)
  }
  const handleClick = (e: React.MouseEvent) => { e.stopPropagation(); onSelect(node.id) }
  const handleDragStart = (e: React.DragEvent) => {
    if (parentType === 'CanvasPanel' && onMove) { e.preventDefault(); return }
    e.dataTransfer.setData('widgetId', node.id)
    e.dataTransfer.setData('widgetType', node.type)
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (node.editorLocked) return
    if (parentType !== 'CanvasPanel' || !onMove) return
    e.preventDefault()
    e.stopPropagation()
    onSelect(node.id)
    const startX = e.clientX, startY = e.clientY
    const startPos = node.slot?.position || { x: 0, y: 0 }

    const onMouseMove = (me: MouseEvent) => {
      const pos = {
        x: Math.round(startPos.x + (me.clientX - startX) / zoom),
        y: Math.round(startPos.y + (me.clientY - startY) / zoom),
      }
      dragPosRef.current = pos
      onMove!(node.id, pos.x, pos.y)
    }
    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
      dragPosRef.current = null
      onDragEnd?.()
    }
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }

  // Interactive preview: resolve button color + animation from style
  const s = (node.style || {}) as Record<string, unknown>
  const animData = interactive ? (s.animation as { type: string; duration?: number; delay?: number; loop?: boolean } | undefined) : undefined
  const previewAnim = animData?.type && animData.type !== 'none'
    ? `umg-${animData.type} ${animData.duration ?? 1}s ease ${animData.delay ?? 0}s ${animData.loop !== false ? 'infinite' : '1'} both`
    : undefined
  const previewBg = interactive && node.type === 'Button'
    ? btnState === 'pressed' ? (s.pressedColor as string)
    : btnState === 'hover'   ? (s.hoverColor as string)
    : (s.backgroundColor as string)
    : undefined

  return (
    <div
      data-widget-id={node.id}
      data-widget-type={node.type}
      className={`widget-host${isSelected ? ' is-selected' : ''}`}
      draggable={!interactive}
      onDragStart={interactive ? undefined : handleDragStart}
      onDragOver={interactive ? undefined : handleDragOver}
      onDrop={interactive ? undefined : handleDrop}
      onClick={interactive ? undefined : handleClick}
      onMouseDown={interactive && node.type === 'Button'
        ? e => { e.preventDefault(); setBtnState('pressed') }
        : handleMouseDown}
      onMouseUp={interactive && node.type === 'Button'
        ? () => setBtnState('hover')
        : undefined}
      onMouseEnter={interactive && node.type === 'Button'
        ? () => setBtnState('hover')
        : undefined}
      onMouseLeave={interactive && node.type === 'Button'
        ? () => setBtnState('idle')
        : undefined}
      style={{
        ...style,
        ...(previewBg  ? { background: hexToRgba(previewBg) } : {}),
        ...(previewAnim ? { animation: previewAnim } : {}),
        outline: isSelected ? '2px solid #e8750a' : undefined,
        outlineOffset: isSelected ? '1px' : undefined,
        boxSizing: 'border-box',
        minWidth:  node.type === 'Spacer' ? ((node.properties?.size as number) || 20) : undefined,
        minHeight: node.type === 'Spacer' ? ((node.properties?.size as number) || 20) : undefined,
        opacity: node.editorHidden ? 0.18 : undefined,
        cursor: interactive ? (node.type === 'Button' ? 'pointer' : 'default') : (node.editorLocked ? 'not-allowed' : parentType === 'CanvasPanel' ? 'move' : 'pointer'),
        transition: interactive && node.type === 'Button' ? 'background 120ms ease' : undefined,
      }}
      title={interactive ? undefined : node.name}
    >
      {!interactive && <div className="widget-tag">{node.type}</div>}
      {isPanel
        ? node.children.map(child => (
            <WidgetRenderer key={child.id} node={child} parentType={node.type} selectedId={selectedId}
              onSelect={onSelect} onDrop={onDrop} onMove={onMove} onDragEnd={onDragEnd} zoom={zoom} interactive={interactive} />
          ))
        : <LeafContent node={node} />
      }
    </div>
  )
}
