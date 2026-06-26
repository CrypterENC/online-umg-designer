'use client'
import React, { useState } from 'react'
import { WidgetNode } from '@/lib/types'
import { WMAP } from '@/lib/widgetDefs'

interface Props {
  tree: WidgetNode | null
  selectedId: string | null
  expanded: Set<string>
  onSelect: (id: string) => void
  onToggleExpand: (id: string) => void
  onDelete: (id: string) => void
  onMoveUp: (id: string) => void
  onMoveDown: (id: string) => void
  onDuplicate: (id: string) => void
  onToggleVisible: (id: string) => void
  onToggleLock: (id: string) => void
}

export default function Hierarchy({ tree, selectedId, expanded, onSelect, onToggleExpand, onDelete, onMoveUp, onMoveDown, onDuplicate, onToggleVisible, onToggleLock }: Props) {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Action bar */}
      <div className="flex items-center gap-1 px-2 py-1.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        {[
          { label: '↑', title: 'Move Up',    action: () => selectedId && onMoveUp(selectedId),    danger: false },
          { label: '↓', title: 'Move Down',  action: () => selectedId && onMoveDown(selectedId),  danger: false },
          { label: '⧉', title: 'Duplicate',  action: () => selectedId && onDuplicate(selectedId), danger: false },
          { label: '✕', title: 'Delete',     action: () => selectedId && onDelete(selectedId),    danger: true  },
        ].map(btn => (
          <button key={btn.label} title={btn.title} onClick={btn.action} disabled={!selectedId} className={btn.danger ? 'hbtn hbtn-danger' : 'hbtn'}>
            {btn.label}
          </button>
        ))}
      </div>

      {/* Tree */}
      <div className="overflow-y-auto flex-1 py-1">
        {tree
          ? <HierNode node={tree} depth={0} selectedId={selectedId} expanded={expanded}
              onSelect={onSelect} onToggle={onToggleExpand}
              onToggleVisible={onToggleVisible} onToggleLock={onToggleLock} />
          : <div className="section-label text-center py-6">empty</div>
        }
      </div>
    </div>
  )
}

function HierNode({ node, depth, selectedId, expanded, onSelect, onToggle, onToggleVisible, onToggleLock }: {
  node: WidgetNode; depth: number; selectedId: string | null
  expanded: Set<string>; onSelect: (id: string) => void; onToggle: (id: string) => void
  onToggleVisible: (id: string) => void; onToggleLock: (id: string) => void
}) {
  const def       = WMAP[node.type]
  const isPanel   = def?.panel ?? false
  const isExpanded = expanded.has(node.id)
  const isSel     = node.id === selectedId
  const isHidden  = !!node.editorHidden
  const isLocked  = !!node.editorLocked
  const [hovered, setHovered] = useState(false)

  return (
    <div>
      <div
        onClick={() => onSelect(node.id)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="flex items-center gap-1 select-none cursor-pointer"
        style={{
          paddingLeft: depth * 12 + 8, paddingRight: 4,
          paddingTop: 4, paddingBottom: 4, fontSize: 11,
          background: isSel ? 'rgba(232,117,10,0.12)' : hovered ? 'rgba(255,255,255,0.04)' : '',
          borderLeft: isSel ? '2px solid #e8750a' : '2px solid transparent',
          color: isHidden ? '#484f58' : isSel ? '#e6edf3' : '#8b949e',
          transition: 'background 80ms',
          opacity: isHidden ? 0.55 : 1,
        }}
      >
        {/* Expand toggle */}
        <span
          style={{ width: 12, textAlign: 'center', fontSize: 9, flexShrink: 0, color: '#484f58' }}
          onClick={isPanel && node.children.length > 0 ? e => { e.stopPropagation(); onToggle(node.id) } : undefined}
        >
          {isPanel && node.children.length > 0 ? (isExpanded ? '▾' : '▸') : ''}
        </span>

        {/* Widget icon */}
        <span style={{ color: isHidden ? '#484f58' : '#e8750a', width: 14, textAlign: 'center', fontSize: 11, flexShrink: 0 }}>
          {def?.icon || '?'}
        </span>

        {/* Name */}
        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {node.name}
        </span>

        {/* Visibility + Lock icons */}
        <div style={{ display: 'flex', gap: 2, flexShrink: 0 }} onClick={e => e.stopPropagation()}>
          {/* Visibility */}
          <button
            title={isHidden ? 'Show widget' : 'Hide widget'}
            onClick={e => { e.stopPropagation(); onToggleVisible(node.id) }}
            style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: '0 3px',
              fontSize: 10, lineHeight: 1,
              color: isHidden ? '#e8750a' : '#484f58',
              opacity: hovered || isHidden ? 1 : 0,
              transition: 'opacity 120ms, color 120ms',
            }}
          >
            {isHidden ? '○' : '◉'}
          </button>

          {/* Lock */}
          <button
            title={isLocked ? 'Unlock widget' : 'Lock widget'}
            onClick={e => { e.stopPropagation(); onToggleLock(node.id) }}
            style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: '0 3px',
              fontSize: 10, lineHeight: 1,
              color: isLocked ? '#e8750a' : '#484f58',
              opacity: hovered || isLocked ? 1 : 0,
              transition: 'opacity 120ms, color 120ms',
            }}
          >
            {isLocked ? '⊠' : '⊡'}
          </button>
        </div>

        {/* Type badge */}
        <span className="section-label" style={{ fontSize: 9, flexShrink: 0, paddingRight: 4 }}>{node.type}</span>
      </div>

      {isPanel && isExpanded && node.children.map(child => (
        <HierNode key={child.id} node={child} depth={depth + 1} selectedId={selectedId} expanded={expanded}
          onSelect={onSelect} onToggle={onToggle}
          onToggleVisible={onToggleVisible} onToggleLock={onToggleLock} />
      ))}
    </div>
  )
}
