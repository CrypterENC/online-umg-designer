'use client'
import React, { useRef, useEffect, useState } from 'react'
import { WidgetNode } from '@/lib/types'
import WidgetRenderer from './WidgetRenderer'
import { computeSnap, SnapLine } from '@/lib/snap'

interface Props {
  tree: WidgetNode | null
  selectedId: string | null
  canvas: { w: number; h: number }
  zoom: number
  panMode: boolean
  onSelect: (id: string | null) => void
  onDrop: (targetId: string, widgetType: string, draggedId?: string) => void
  onMove: (id: string, x: number, y: number) => void
  onResize: (id: string, pos: { x: number; y: number }, size: { x: number; y: number }) => void
  onRootDrop: (widgetType: string) => void
  onWheelZoom: (dir: 'in' | 'out') => void
}

// Large virtual world so the canvas can be panned in every direction
const WORLD = 8000

const HANDLES = [
  { id: 'nw', t: -4, l: -4,             cursor: 'nw-resize', px: 1, py: 1, sw: -1, sh: -1 },
  { id: 'n',  t: -4, l: '50%', ml: -4,  cursor: 'n-resize',  px: 0, py: 1, sw:  0, sh: -1 },
  { id: 'ne', t: -4, r: -4,             cursor: 'ne-resize', px: 0, py: 1, sw:  1, sh: -1 },
  { id: 'e',  t: '50%', r: -4, mt: -4,  cursor: 'e-resize',  px: 0, py: 0, sw:  1, sh:  0 },
  { id: 'se', b: -4, r: -4,             cursor: 'se-resize', px: 0, py: 0, sw:  1, sh:  1 },
  { id: 's',  b: -4, l: '50%', ml: -4,  cursor: 's-resize',  px: 0, py: 0, sw:  0, sh:  1 },
  { id: 'sw', b: -4, l: -4,             cursor: 'sw-resize', px: 1, py: 0, sw: -1, sh:  1 },
  { id: 'w',  t: '50%', l: -4, mt: -4,  cursor: 'w-resize',  px: 1, py: 0, sw: -1, sh:  0 },
] as const

function HandleOverlay({ nodeId, pos, size, zoom, onResize }: {
  nodeId: string
  pos: { x: number; y: number }
  size: { x: number; y: number }
  zoom: number
  onResize: (id: string, pos: { x: number; y: number }, size: { x: number; y: number }) => void
}) {
  const startDrag = (handle: typeof HANDLES[number], e: React.MouseEvent) => {
    e.stopPropagation(); e.preventDefault()
    const sx = e.clientX, sy = e.clientY
    const sp = { ...pos }, ss = { ...size }
    const move = (me: MouseEvent) => {
      const ddx = (me.clientX - sx) / zoom, ddy = (me.clientY - sy) / zoom
      onResize(nodeId,
        { x: Math.round(sp.x + (handle.px ? ddx : 0)), y: Math.round(sp.y + (handle.py ? ddy : 0)) },
        { x: Math.max(20, Math.round(ss.x + handle.sw * ddx)), y: Math.max(20, Math.round(ss.y + handle.sh * ddy)) }
      )
    }
    const up = () => { document.removeEventListener('mousemove', move); document.removeEventListener('mouseup', up) }
    document.addEventListener('mousemove', move)
    document.addEventListener('mouseup', up)
  }

  return (
    <div style={{ position: 'absolute', left: pos.x * zoom, top: pos.y * zoom, width: size.x * zoom, height: size.y * zoom, pointerEvents: 'none', zIndex: 10 }}>
      {HANDLES.map(h => (
        <div key={h.id} onMouseDown={e => startDrag(h, e)} style={{
          position: 'absolute', width: 8, height: 8,
          background: '#0d1117', border: '1.5px solid #e8750a', borderRadius: 2,
          pointerEvents: 'all', cursor: h.cursor,
          top: 't' in h ? h.t : undefined, bottom: 'b' in h ? h.b : undefined,
          left: 'l' in h ? h.l : undefined, right: 'r' in h ? h.r : undefined,
          marginLeft: 'ml' in h ? h.ml : undefined, marginTop: 'mt' in h ? h.mt : undefined,
        }} />
      ))}
    </div>
  )
}

export default function Canvas({ tree, selectedId, canvas, zoom, panMode, onSelect, onDrop, onMove, onResize, onRootDrop, onWheelZoom }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [spaceHeld, setSpaceHeld] = useState(false)
  const [shiftHeld, setShiftHeld] = useState(false)
  const [snapLines, setSnapLines] = useState<SnapLine[]>([])

  // Scroll to center of virtual world when canvas preset changes or on mount
  const scrollToCenter = () => {
    const el = scrollRef.current
    if (!el) return
    el.scrollLeft = WORLD / 2 - el.clientWidth / 2
    el.scrollTop  = WORLD / 2 - el.clientHeight / 2
  }

  useEffect(() => {
    const id = requestAnimationFrame(scrollToCenter)
    return () => cancelAnimationFrame(id)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvas.w, canvas.h])

  // Non-passive wheel listener so we can preventDefault and zoom instead of scroll
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      onWheelZoom(e.deltaY < 0 ? 'in' : 'out')
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [onWheelZoom])

  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      if (e.code !== 'Space') return
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      e.preventDefault(); setSpaceHeld(true)
    }
    const onUp = (e: KeyboardEvent) => { if (e.code === 'Space') setSpaceHeld(false) }
    window.addEventListener('keydown', onDown)
    window.addEventListener('keyup', onUp)
    return () => { window.removeEventListener('keydown', onDown); window.removeEventListener('keyup', onUp) }
  }, [])

  useEffect(() => {
    const onDown = (e: KeyboardEvent) => { if (e.key === 'Shift') setShiftHeld(true) }
    const onUp   = (e: KeyboardEvent) => { if (e.key === 'Shift') setShiftHeld(false) }
    window.addEventListener('keydown', onDown)
    window.addEventListener('keyup', onUp)
    return () => { window.removeEventListener('keydown', onDown); window.removeEventListener('keyup', onUp) }
  }, [])

  const isPanning = panMode || spaceHeld

  const handleBgMouseDown = (e: React.MouseEvent) => {
    if (!isPanning || !scrollRef.current) return
    e.preventDefault()
    const sx = e.clientX, sy = e.clientY
    const sl = scrollRef.current.scrollLeft, st = scrollRef.current.scrollTop
    const move = (me: MouseEvent) => {
      if (!scrollRef.current) return
      scrollRef.current.scrollLeft = sl - (me.clientX - sx)
      scrollRef.current.scrollTop  = st - (me.clientY - sy)
    }
    const up = () => { document.removeEventListener('mousemove', move); document.removeEventListener('mouseup', up) }
    document.addEventListener('mousemove', move)
    document.addEventListener('mouseup', up)
  }

  const handleMove = (id: string, rawX: number, rawY: number) => {
    if (shiftHeld || tree?.type !== 'CanvasPanel') {
      setSnapLines([])
      onMove(id, rawX, rawY)
      return
    }
    const { x, y, lines } = computeSnap(id, rawX, rawY, tree.children, canvas.w, canvas.h)
    setSnapLines(lines)
    onMove(id, x, y)
  }

  const handleRootDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const t = e.dataTransfer.getData('widgetType')
    if (t) onRootDrop(t)
  }

  const selectedChild = tree?.type === 'CanvasPanel' ? tree.children.find(c => c.id === selectedId) : null
  const showHandles = selectedChild && selectedChild.slot?.position && selectedChild.slot?.size

  // Canvas frame top-left in the virtual world
  const frameLeft = WORLD / 2 - (canvas.w * zoom) / 2
  const frameTop  = WORLD / 2 - (canvas.h * zoom) / 2

  return (
    <div
      ref={scrollRef}
      onMouseDown={handleBgMouseDown}
      style={{ flex: 1, overflow: 'auto', background: '#0a0c10', backgroundImage: 'radial-gradient(circle, rgba(34,40,51,0.88) 1px, transparent 1px)', backgroundSize: '24px 24px', cursor: isPanning ? 'grab' : 'default', userSelect: 'none' }}
    >
      {/* Virtual world — larger than any viewport so pan works in all directions */}
      <div style={{ width: WORLD, height: WORLD, position: 'relative', flexShrink: 0 }}>

        {/* Canvas frame, absolutely centered in the world */}
        <div style={{
          position: 'absolute',
          left: frameLeft,
          top: frameTop,
          width: canvas.w * zoom,
          height: canvas.h * zoom,
          boxShadow: '0 0 0 1px #3a3f50, 0 12px 60px rgba(0,0,0,0.7)',
        }}>
          {/* Scaled widget layer */}
          <div
            style={{
              width: canvas.w, height: canvas.h,
              transformOrigin: 'top left',
              transform: `scale(${zoom})`,
              position: 'relative',
              overflow: 'hidden',
              pointerEvents: isPanning ? 'none' : 'auto',
            }}
            onClick={() => { if (!isPanning) onSelect(null) }}
            onDragOver={e => e.preventDefault()}
            onDrop={handleRootDrop}
          >
            {tree
              ? <WidgetRenderer node={tree} parentType="__root__" selectedId={selectedId} onSelect={onSelect} onDrop={onDrop} onMove={handleMove} onDragEnd={() => setSnapLines([])} zoom={zoom} />
              : <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, color: '#333' }}>
                  <div style={{ fontSize: 48 }}>⬡</div>
                  <div style={{ fontSize: 14 }}>Drop a widget here or use the palette</div>
                </div>
            }
          </div>

          {/* Resize handles — in frame (post-zoom) coords */}
          {showHandles && !isPanning && (
            <HandleOverlay
              nodeId={selectedChild.id}
              pos={selectedChild.slot!.position!}
              size={selectedChild.slot!.size!}
              zoom={zoom}
              onResize={onResize}
            />
          )}
          {/* Snap guide lines */}
          {snapLines.map((line, i) =>
            line.axis === 'x'
              ? <div key={`gx${i}`} style={{ position: 'absolute', left: line.pos * zoom, top: 0, width: 1, height: '100%', background: 'rgba(232,117,10,0.8)', pointerEvents: 'none', zIndex: 30 }} />
              : <div key={`gy${i}`} style={{ position: 'absolute', top: line.pos * zoom, left: 0, height: 1, width: '100%', background: 'rgba(232,117,10,0.8)', pointerEvents: 'none', zIndex: 30 }} />
          )}
        </div>
      </div>
    </div>
  )
}
