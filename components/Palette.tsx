'use client'
import React, { useState } from 'react'
import { WMAP, PALETTE_GROUPS } from '@/lib/widgetDefs'

interface Props {
  onAddWidget: (type: string) => void
}

export default function Palette({ onAddWidget }: Props) {
  const [search, setSearch] = useState('')

  const filtered = search.trim()
    ? Object.entries(WMAP).filter(([k]) => k.toLowerCase().includes(search.toLowerCase())).map(([k]) => k)
    : null

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-2 py-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <input
          className="input-field"
          style={{ width: '100%' }}
          placeholder="Filter widgets…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
      <div className="overflow-y-auto flex-1 py-1">
        {filtered
          ? filtered.map(type => <PaletteItem key={type} type={type} onAdd={onAddWidget} />)
          : PALETTE_GROUPS.map(group => (
              <div key={group.label}>
                <div
                  className="section-label px-3"
                  style={{ paddingTop: 8, paddingBottom: 4 }}
                >
                  {group.label}
                </div>
                {group.types.map(type => (
                  <PaletteItem key={type} type={type} onAdd={onAddWidget} />
                ))}
              </div>
            ))
        }
      </div>
    </div>
  )
}

function PaletteItem({ type, onAdd }: { type: string; onAdd: (t: string) => void }) {
  const def = WMAP[type]
  if (!def) return null
  return (
    <div
      className="flex items-center gap-2 select-none cursor-pointer"
      style={{
        padding: '5px 12px',
        fontSize: 11,
        color: '#8b949e',
        borderLeft: '2px solid transparent',
        transition: 'background 100ms, color 100ms, border-color 100ms',
      }}
      draggable
      onDragStart={e => e.dataTransfer.setData('widgetType', type)}
      onClick={() => onAdd(type)}
      title={`Add ${def.label}`}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLDivElement
        el.style.background = 'rgba(232,117,10,0.06)'
        el.style.color = '#e6edf3'
        el.style.borderLeftColor = '#e8750a'
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLDivElement
        el.style.background = ''
        el.style.color = '#8b949e'
        el.style.borderLeftColor = 'transparent'
      }}
    >
      <span style={{
        width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(232,117,10,0.10)', border: '1px solid rgba(232,117,10,0.20)',
        borderRadius: 3, fontSize: 11, color: '#e8750a', flexShrink: 0,
      }}>{def.icon}</span>
      <span style={{ flex: 1 }}>{def.label}</span>
      {def.panel && <span className="section-label" style={{ fontSize: 9 }}>panel</span>}
    </div>
  )
}
