'use client'
import React, { useEffect, useState, useCallback, useRef } from 'react'

export type SuggestionLevel = 'tip' | 'warning'

export interface Suggestion {
  id: string
  level: SuggestionLevel
  title: string
  message: string
  useInstead?: string
}

interface Props {
  suggestions: Suggestion[]
  onDismiss: (id: string) => void
}

const DURATION_MS = 9000

function SuggestionCard({ s, onDismiss }: { s: Suggestion; onDismiss: (id: string) => void }) {
  const [progress, setProgress] = useState(100)
  const [visible, setVisible] = useState(false)
  const startRef = useRef(Date.now())

  const isWarning = s.level === 'warning'
  const accentColor = isWarning ? '#f28c1a' : '#40d972'
  const bgGlow     = isWarning ? 'rgba(242,140,26,0.05)' : 'rgba(64,217,114,0.04)'
  const borderAcc  = isWarning ? 'rgba(242,140,26,0.18)' : 'rgba(64,217,114,0.18)'
  const icon       = isWarning ? '⚠️' : '💡'

  useEffect(() => {
    // Animate in
    const raf = requestAnimationFrame(() => setVisible(true))

    // Progress countdown
    startRef.current = Date.now()
    const timer = setInterval(() => {
      const elapsed = Date.now() - startRef.current
      const pct = Math.max(0, 100 - (elapsed / DURATION_MS) * 100)
      setProgress(pct)
      if (pct <= 0) {
        clearInterval(timer)
        onDismiss(s.id)
      }
    }, 60)

    return () => {
      cancelAnimationFrame(raf)
      clearInterval(timer)
    }
  }, [s.id, onDismiss])

  return (
    <div
      style={{
        background: bgGlow,
        border: `1px solid ${borderAcc}`,
        borderLeft: `3px solid ${accentColor}`,
        borderRadius: 9,
        overflow: 'hidden',
        boxShadow: `0 12px 36px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.03), inset 0 1px 0 rgba(255,255,255,0.04)`,
        transform: visible ? 'translateX(0) scale(1)' : 'translateX(48px) scale(0.96)',
        opacity: visible ? 1 : 0,
        transition: 'transform 340ms cubic-bezier(0.16,1,0.3,1), opacity 280ms ease',
      } as React.CSSProperties}
    >
      <div style={{ padding: '11px 13px 10px' }}>
        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 13, lineHeight: 1 }}>{icon}</span>
            <span style={{
              fontSize: 10, fontWeight: 700, letterSpacing: '0.07em',
              textTransform: 'uppercase', color: accentColor,
            }}>
              {s.title}
            </span>
          </div>
          <button
            onClick={() => onDismiss(s.id)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: '0 2px',
              fontSize: 15, lineHeight: 1, color: '#484f58', flexShrink: 0,
              transition: 'color 120ms',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = '#8b949e')}
            onMouseLeave={e => (e.currentTarget.style.color = '#484f58')}
          >
            ×
          </button>
        </div>

        {/* Message */}
        <p style={{ margin: 0, fontSize: 11, color: '#8b949e', lineHeight: 1.6 }}>
          {s.message}
        </p>

        {/* Use Instead box */}
        {s.useInstead && (
          <div style={{
            marginTop: 9,
            padding: '8px 10px',
            background: 'rgba(255,255,255,0.025)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 6,
          }}>
            <div style={{
              fontSize: 9, fontWeight: 700, letterSpacing: '0.09em',
              textTransform: 'uppercase', color: '#484f58', marginBottom: 4,
            }}>
              Use Instead
            </div>
            <p style={{ margin: 0, fontSize: 11, color: '#c9d1d9', lineHeight: 1.5 }}>
              {s.useInstead}
            </p>
          </div>
        )}
      </div>

      {/* Auto-dismiss progress bar */}
      <div style={{ height: 2, background: 'rgba(255,255,255,0.04)' }}>
        <div style={{
          height: '100%',
          width: `${progress}%`,
          background: accentColor,
          transition: 'width 60ms linear',
          opacity: 0.6,
        }} />
      </div>
    </div>
  )
}

export default function SuggestionToast({ suggestions, onDismiss }: Props) {
  if (suggestions.length === 0) return null

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 22,
        right: 22,
        zIndex: 1000,
        width: 340,
        display: 'flex',
        flexDirection: 'column-reverse',
        gap: 8,
        pointerEvents: 'all',
      }}
    >
      {suggestions.slice(0, 4).map(s => (
        <SuggestionCard key={s.id} s={s} onDismiss={onDismiss} />
      ))}
    </div>
  )
}

// ─── Widget Tips shown inside Properties Panel ────────────────────────────────
export interface WidgetTip {
  level: SuggestionLevel
  title: string
  message: string
  useInstead?: string
}

export const WIDGET_TIPS: Record<string, WidgetTip> = {
  Border: {
    level: 'warning',
    title: 'Single-slot panel',
    message: 'Border (UBorder) accepts exactly 1 child in Unreal Engine. Attempting to add a 2nd child will be silently rejected by UMG.',
    useInstead: 'HorizontalBox (side by side) or VerticalBox (stacked) to hold multiple children, then place that inside the Border.',
  },
  SizeBox: {
    level: 'warning',
    title: 'Single-slot panel',
    message: 'SizeBox enforces a fixed min/max size on its single child. It cannot hold multiple widgets.',
    useInstead: 'Wrap children in HorizontalBox or VerticalBox first, then place that inside SizeBox.',
  },
  ScaleBox: {
    level: 'tip',
    title: 'Single-slot — scales content',
    message: 'ScaleBox scales its one child to fill available space. Great for responsive UIs, but still single-slot.',
    useInstead: 'Use an Overlay or CanvasPanel if you need to stack multiple children.',
  },
  Button: {
    level: 'tip',
    title: 'Interactive — 1 slot',
    message: "Button accepts 1 child widget (typically Text or an HBox with icon + text). Interactive children inside a Button won't receive click events in UMG.",
    useInstead: 'Place a HorizontalBox with an icon Image and Text inside the Button for a rich label.',
  },
  CanvasPanel: {
    level: 'tip',
    title: 'Absolute positioning',
    message: 'CanvasPanel positions children using absolute X/Y coordinates and anchors. Ideal for HUDs and overlays. Every child slot requires explicit position and size.',
    useInstead: 'HorizontalBox / VerticalBox for auto-flow layouts that adapt to content size.',
  },
  OverlayPanel: {
    level: 'tip',
    title: 'Z-order stacking',
    message: 'Overlay stacks children on top of each other (last child = topmost). Use it to layer icons, badges, or gradients over a background.',
    useInstead: undefined,
  },
  HorizontalBox: {
    level: 'tip',
    title: 'Horizontal flow layout',
    message: 'HorizontalBox arranges children left-to-right. Use slot "Fill" alignment and Size Rule "Fill" for flexible proportional widths across children.',
    useInstead: undefined,
  },
  VerticalBox: {
    level: 'tip',
    title: 'Vertical flow layout',
    message: 'VerticalBox stacks children top-to-bottom. Perfect for menus, forms, and settings lists. Children auto-size based on their content.',
    useInstead: undefined,
  },
  Text: {
    level: 'tip',
    title: 'Text rendering',
    message: 'Set Font, Size, Weight, and Letter Spacing in Properties. For mixed bold/italic/color text in a single widget, use RichText with inline markup instead.',
    useInstead: 'RichText widget for rich inline formatting (bold, color, links).',
  },
  Image: {
    level: 'tip',
    title: 'Texture required',
    message: 'Image requires a UTexture2D asset reference. Import your image into the UE Content Browser first, then reference it via its asset path in the Image properties.',
    useInstead: 'Border with a background brush if you only need a colored/gradient rectangle.',
  },
  ProgressBar: {
    level: 'tip',
    title: 'Value is 0–1 float',
    message: 'ProgressBar percent is clamped between 0.0 (empty) and 1.0 (full). Bind it to a Blueprint float variable for real-time updates.',
    useInstead: undefined,
  },
  Slider: {
    level: 'tip',
    title: 'Value is 0–1 float',
    message: 'Slider value ranges from 0 to 1 by default. Use OnValueChanged event in Blueprint to read the dragged value in real time.',
    useInstead: undefined,
  },
  TextInput: {
    level: 'tip',
    title: 'Editable text field',
    message: 'Bind OnTextCommitted or OnTextChanged in Blueprint. Set HintText for placeholder copy. EditableTextBox includes a border; EditableText does not.',
    useInstead: undefined,
  },
  ScrollBox: {
    level: 'tip',
    title: 'Scrollable container',
    message: 'ScrollBox clips and scrolls its content. Add a VerticalBox (or HorizontalBox) inside to stack scrollable items; avoid adding items directly.',
    useInstead: 'VerticalBox inside ScrollBox to stack scrollable content cleanly.',
  },
  WrapBox: {
    level: 'tip',
    title: 'Wrapping flow layout',
    message: 'WrapBox wraps children to a new row when they exceed the available width. Great for tag lists, icon grids, and badge layouts.',
    useInstead: undefined,
  },
  GridPanel: {
    level: 'tip',
    title: 'Column-based grid',
    message: 'GridPanel splits children into equal columns defined by the Column Fill array. Each child slot specifies its Row and Column index.',
    useInstead: undefined,
  },
  UniformGridPanel: {
    level: 'tip',
    title: 'Uniform grid',
    message: 'UniformGridPanel divides all children into equally-sized cells. Row and Column are set per slot. All cells share the same size.',
    useInstead: 'GridPanel if you need unequal column widths.',
  },
  CheckBox: {
    level: 'tip',
    title: 'Toggle widget',
    message: 'Bind IsChecked and OnCheckStateChanged in Blueprint. CheckBox has a built-in label slot — add a Text child for the label text.',
    useInstead: undefined,
  },
  ComboBox: {
    level: 'tip',
    title: 'Dropdown selection',
    message: 'Populate Options in Properties. Bind OnSelectionChanged in Blueprint to react when the user picks an item.',
    useInstead: undefined,
  },
  SpinBox: {
    level: 'tip',
    title: 'Numeric input',
    message: 'SpinBox lets users type or drag to change a number. Set Min/Max Value and Delta in Properties. Bind OnValueChanged in Blueprint.',
    useInstead: undefined,
  },
}
