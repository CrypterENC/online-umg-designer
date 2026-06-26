'use client'
import React, { useEffect, useRef, useState } from 'react'
import { THEMES, Theme, applyThemeToNode } from '@/lib/themes'
import { WidgetNode } from '@/lib/types'

interface Props {
  anchorRef: React.RefObject<HTMLButtonElement | null>
  selectedNode: WidgetNode | null
  tree: WidgetNode | null
  onApplyToWidget: (node: WidgetNode) => void
  onApplyToTree: (tree: WidgetNode) => void
  onClose: () => void
}

const ROLE_LABELS = ['BG', 'Surface', 'Accent', 'Button', 'Text']

export default function ThemePicker({ anchorRef, selectedNode, tree, onApplyToWidget, onApplyToTree, onClose }: Props) {
  const [selected, setSelected] = useState<Theme>(THEMES[0])
  const panelRef = useRef<HTMLDivElement>(null)

  // Position below the anchor button
  const rect = anchorRef.current?.getBoundingClientRect()
  const left = rect ? Math.min(rect.left, window.innerWidth - 380) : 80
  const top  = rect ? rect.bottom + 6 : 42

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node) &&
          anchorRef.current && !anchorRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose, anchorRef])

  const canApplyWidget = !!selectedNode
  const canApplyTree   = !!tree

  return (
    <div
      ref={panelRef}
      style={{
        position: 'fixed', left, top, zIndex: 999, width: 360,
        background: '#161b22', border: '1px solid rgba(255,255,255,0.10)',
        borderRadius: 8, boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#484f58' }}>Color Themes</span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#484f58', cursor: 'pointer', fontSize: 14, lineHeight: 1, padding: '0 2px' }}>×</button>
      </div>

      {/* Scrollable Theme grid container */}
      <div style={{ maxHeight: 220, overflowY: 'auto', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, padding: 12 }}>
          {THEMES.map(theme => (
            <button
              key={theme.id}
              onClick={() => setSelected(theme)}
              style={{
                background: selected.id === theme.id ? 'rgba(232,117,10,0.08)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${selected.id === theme.id ? '#e8750a' : 'rgba(255,255,255,0.07)'}`,
                borderRadius: 6, padding: '10px 12px', cursor: 'pointer', textAlign: 'left',
                transition: 'border-color 120ms, background 120ms',
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 600, color: '#e6edf3', marginBottom: 6 }}>{theme.name}</div>
              <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
                {theme.preview.map((col, i) => (
                  <div key={i} title={ROLE_LABELS[i]} style={{ width: 16, height: 16, borderRadius: 3, background: col, border: '1px solid rgba(255,255,255,0.08)', flexShrink: 0 }} />
                ))}
              </div>
              <div style={{ fontSize: 10, color: '#484f58', lineHeight: 1.4 }}>{theme.hint}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Selected theme detail */}
      <div style={{ margin: '0 12px', padding: '10px 12px', background: 'rgba(0,0,0,0.25)', borderRadius: 6, marginBottom: 12 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: '#484f58', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
          {selected.name} — Color Roles
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 16px' }}>
          {[
            ['Background',    selected.colors.background,    'CanvasPanel bg'],
            ['Surface',       selected.colors.surface,       'Border, panel bg'],
            ['Accent',        selected.colors.accent,        'Highlights, focus'],
            ['Button Normal', selected.colors.buttonNormal,  'Button default'],
            ['Button Hover',  selected.colors.buttonHover,   'Button hovered'],
            ['Button Pressed',selected.colors.buttonPressed, 'Button pressed'],
            ['Border',        selected.colors.border,        'Outlines'],
            ['Text Primary',  selected.colors.textPrimary,   'Text, labels'],
            ['Text Secondary',selected.colors.textSecondary, 'Muted text'],
          ].map(([label, color, widget]) => (
            <div key={label as string} style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
              <div style={{ width: 12, height: 12, borderRadius: 2, background: color as string, border: '1px solid rgba(255,255,255,0.10)', flexShrink: 0 }} />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 10, color: '#e6edf3', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</div>
                <div style={{ fontSize: 9, color: '#484f58' }}>{widget}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8, padding: '0 12px 12px' }}>
        <button
          disabled={!canApplyWidget}
          onClick={() => selectedNode && onApplyToWidget(applyThemeToNode(selectedNode, selected.colors))}
          style={{
            flex: 1, height: 28, borderRadius: 4, border: '1px solid rgba(255,255,255,0.10)',
            background: canApplyWidget ? 'rgba(232,117,10,0.12)' : 'rgba(255,255,255,0.03)',
            color: canApplyWidget ? '#e8750a' : '#484f58',
            fontSize: 11, fontWeight: 600, cursor: canApplyWidget ? 'pointer' : 'not-allowed',
            transition: 'background 120ms, color 120ms',
          }}
        >
          Apply to Widget
        </button>
        <button
          disabled={!canApplyTree}
          onClick={() => tree && onApplyToTree(applyThemeToNode(tree, selected.colors))}
          style={{
            flex: 1, height: 28, borderRadius: 4, border: '1px solid transparent',
            background: canApplyTree ? '#e8750a' : 'rgba(255,255,255,0.05)',
            color: canApplyTree ? '#fff' : '#484f58',
            fontSize: 11, fontWeight: 600, cursor: canApplyTree ? 'pointer' : 'not-allowed',
            transition: 'background 120ms',
          }}
        >
          Apply to All
        </button>
      </div>
    </div>
  )
}
