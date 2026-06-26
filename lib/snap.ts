import { WidgetNode } from './types'

const SNAP_GRID = 8
const SNAP_THRESHOLD = 10

export type SnapLine = { axis: 'x' | 'y'; pos: number }

export function computeSnap(
  nodeId: string,
  rawX: number,
  rawY: number,
  siblings: WidgetNode[],
  cw: number,
  ch: number,
): { x: number; y: number; lines: SnapLine[] } {
  const node = siblings.find(c => c.id === nodeId)
  const w = node?.slot?.size?.x ?? 0
  const h = node?.slot?.size?.y ?? 0

  // Grid is always the baseline
  let snappedX = Math.round(rawX / SNAP_GRID) * SNAP_GRID
  let snappedY = Math.round(rawY / SNAP_GRID) * SNAP_GRID
  let guideX = -1, guideY = -1

  // [snapTo (left-edge position), guidePos (line drawn in canvas space)]
  const xCands: [number, number][] = [
    [0,              0],
    [cw - w,         cw],
    [(cw - w) / 2,   cw / 2],
  ]
  const yCands: [number, number][] = [
    [0,              0],
    [ch - h,         ch],
    [(ch - h) / 2,   ch / 2],
  ]

  for (const sib of siblings) {
    if (sib.id === nodeId || !sib.slot?.position || !sib.slot?.size) continue
    const { x: sx, y: sy } = sib.slot.position
    const { x: sw, y: sh } = sib.slot.size
    xCands.push(
      [sx,             sx],
      [sx + sw - w,    sx + sw],
      [sx + sw,        sx + sw],
      [sx - w,         sx],
      [sx + (sw-w)/2,  sx + sw/2],
    )
    yCands.push(
      [sy,             sy],
      [sy + sh - h,    sy + sh],
      [sy + sh,        sy + sh],
      [sy - h,         sy],
      [sy + (sh-h)/2,  sy + sh/2],
    )
  }

  let bestXDist = SNAP_THRESHOLD
  for (const [snapTo, guide] of xCands) {
    const d = Math.abs(rawX - snapTo)
    if (d <= bestXDist) { bestXDist = d; snappedX = snapTo; guideX = guide }
  }

  let bestYDist = SNAP_THRESHOLD
  for (const [snapTo, guide] of yCands) {
    const d = Math.abs(rawY - snapTo)
    if (d <= bestYDist) { bestYDist = d; snappedY = snapTo; guideY = guide }
  }

  const lines: SnapLine[] = []
  if (guideX >= 0) lines.push({ axis: 'x', pos: guideX })
  if (guideY >= 0) lines.push({ axis: 'y', pos: guideY })

  return { x: Math.round(snappedX), y: Math.round(snappedY), lines }
}
