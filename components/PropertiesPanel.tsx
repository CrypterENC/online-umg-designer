'use client'
import React, { useState } from 'react'
import { WidgetNode, StyleData, SlotData, PropData } from '@/lib/types'
import { WMAP } from '@/lib/widgetDefs'

interface Props {
  node: WidgetNode | null
  onChange: (id: string, patch: Partial<WidgetNode>) => void
}

const ROW_STYLE: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 8,
  padding: '3px 12px', minHeight: 28,
}
const LABEL_STYLE: React.CSSProperties = {
  width: 92, flexShrink: 0,
  fontSize: 10, fontWeight: 600, letterSpacing: '0.06em',
  textTransform: 'uppercase', color: '#484f58',
  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={ROW_STYLE}>
      <label style={LABEL_STYLE}>{label}</label>
      <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
    </div>
  )
}

function Section({ label, children, defaultOpen = true }: { label: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <div
        className="prop-sec-hdr"
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '6px 12px', background: '#1a1d24',
          fontSize: 10, fontWeight: 700, letterSpacing: '0.14em',
          textTransform: 'uppercase', color: '#484f58',
          cursor: 'pointer', userSelect: 'none',
        }}
      >
        <span>{label}</span>
        <span style={{ fontSize: 9, transition: 'transform 150ms', display: 'inline-block', transform: open ? '' : 'rotate(-90deg)' }}>▼</span>
      </div>
      {open && <div style={{ padding: '4px 0' }}>{children}</div>}
    </div>
  )
}

function ColorInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <input
        type="color"
        value={value?.slice(0, 7) || '#000000'}
        onChange={e => { const rgb = e.target.value; const alpha = value?.slice(7, 9) || 'ff'; onChange(rgb + (alpha === '00' ? 'ff' : alpha)) }}
        style={{ width: 26, height: 22, padding: 2, borderRadius: 3, border: '1px solid rgba(255,255,255,0.08)', background: '#0d1117', cursor: 'pointer', flexShrink: 0 }}
      />
      <input type="text" value={value || ''} onChange={e => onChange(e.target.value)}
        onFocus={e => e.target.select()} className="prop-input" style={{ fontFamily: 'monospace' }} />
    </div>
  )
}

function NumInput({ value, onChange, min, max, step }: { value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number }) {
  return (
    <input type="number" value={Number.isNaN(value) || value == null ? 0 : value} min={min} max={max} step={step ?? 1}
      onChange={e => { const n = parseFloat(e.target.value); if (!Number.isNaN(n)) onChange(n) }}
      onFocus={e => e.target.select()} className="prop-input" />
  )
}

function TextInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return <input type="text" value={value || ''} onChange={e => onChange(e.target.value)} onFocus={e => e.target.select()} className="prop-input" />
}

function SelectInput({ value, options, onChange }: { value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <select value={value || ''} onChange={e => onChange(e.target.value)} className="prop-input">
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  )
}

function PaddingInput({ value, onChange }: { value: [number,number,number,number] | undefined; onChange: (v: [number,number,number,number]) => void }) {
  const v = value || [0, 0, 0, 0]
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 4 }}>
      {(['T','R','B','L'] as const).map((lbl, i) => (
        <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <span style={{ fontSize: 9, color: '#484f58', fontWeight: 600 }}>{lbl}</span>
          <input type="number" value={v[i]} min={0}
            onChange={e => { const nv = [...v] as [number,number,number,number]; nv[i] = parseFloat(e.target.value) || 0; onChange(nv) }}
            onFocus={e => e.target.select()} className="prop-input" style={{ textAlign: 'center' }} />
        </div>
      ))}
    </div>
  )
}

const ALIGN_H    = ['Fill', 'Left', 'Center', 'Right']
const ALIGN_V    = ['Fill', 'Top', 'Center', 'Bottom']
const SIZE_RULES  = ['Auto', 'Fill']
const VISIBILITY  = ['Visible', 'Hidden', 'Collapsed']
const WEIGHTS     = ['Regular', 'Bold', 'Light', 'Thin']
const JUSTIFY     = ['Left', 'Center', 'Right', 'Fill']

export default function PropertiesPanel({ node, onChange }: Props) {
  if (!node) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <div style={{ textAlign: 'center', color: '#484f58', fontSize: 11 }}>
          <div style={{ fontSize: 20, marginBottom: 6 }}>○</div>
          Select a widget
        </div>
      </div>
    )
  }

  const def  = WMAP[node.type]
  const s    = node.style || {}
  const p    = node.properties || {}
  const slot = node.slot || {}

  const patchStyle = (patch: Partial<StyleData>) => onChange(node.id, { style: { ...s, ...patch } })
  const patchProps = (patch: Partial<PropData>)  => onChange(node.id, { properties: { ...p, ...patch } })
  const patchSlot  = (patch: Partial<SlotData>)  => onChange(node.id, { slot: { ...slot, ...patch } })

  const font = (p.font as Record<string, unknown>) || {}
  const isTextWidget = node.type === 'Text' || node.type === 'RichText'
  const isPanel = def?.panel ?? false

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

      {/* ── Widget badge ─────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 12px', background: '#1e2229',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        flexShrink: 0,
      }}>
        <span style={{ fontSize: 18, width: 28, textAlign: 'center', flexShrink: 0 }}>{def?.icon ?? '▢'}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 10, color: '#484f58', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{node.type}</div>
          <input
            value={node.name}
            onChange={e => onChange(node.id, { name: e.target.value })}
            style={{
              width: '100%', background: 'transparent', border: 'none',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              color: '#e6edf3', fontSize: 13, fontWeight: 600,
              padding: '2px 0', marginTop: 2, outline: 'none', fontFamily: 'inherit',
            }}
            onFocus={e => (e.target.style.borderBottomColor = '#e8750a')}
            onBlur={e => (e.target.style.borderBottomColor = 'rgba(255,255,255,0.08)')}
          />
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>

        {/* ── Layout ─────────────────────────── */}
        {node.type !== 'CanvasPanel' && (
          <Section label="Layout">
            {slot.position !== undefined ? (<>
              <Row label="Pos X"><NumInput value={slot.position?.x ?? 0} onChange={v => patchSlot({ position: { x: v, y: slot.position?.y ?? 0 } })} /></Row>
              <Row label="Pos Y"><NumInput value={slot.position?.y ?? 0} onChange={v => patchSlot({ position: { x: slot.position?.x ?? 0, y: v } })} /></Row>
              <Row label="Width"><NumInput value={slot.size?.x ?? 200} min={1} onChange={v => patchSlot({ size: { x: v, y: slot.size?.y ?? 100 } })} /></Row>
              <Row label="Height"><NumInput value={slot.size?.y ?? 100} min={1} onChange={v => patchSlot({ size: { x: slot.size?.x ?? 200, y: v } })} /></Row>
            </>) : (<>
              <Row label="Size Rule">
                <SelectInput value={slot.sizeRule || 'Auto'} options={SIZE_RULES} onChange={v => patchSlot({ sizeRule: v as 'Auto'|'Fill' })} />
              </Row>
              {slot.sizeRule === 'Fill' && (
                <Row label="Fill Weight">
                  <NumInput value={slot.fillWeight ?? 1} min={0} step={0.1} onChange={v => patchSlot({ fillWeight: v })} />
                </Row>
              )}
              <Row label="H Align">
                <SelectInput value={slot.horizontalAlignment || 'Fill'} options={ALIGN_H} onChange={v => patchSlot({ horizontalAlignment: v as SlotData['horizontalAlignment'] })} />
              </Row>
              <Row label="V Align">
                <SelectInput value={slot.verticalAlignment || 'Fill'} options={ALIGN_V} onChange={v => patchSlot({ verticalAlignment: v as SlotData['verticalAlignment'] })} />
              </Row>
              <Row label="Padding">
                <PaddingInput value={slot.padding} onChange={v => patchSlot({ padding: v })} />
              </Row>
            </>)}
          </Section>
        )}

        {/* ── Grid config ──────────────────── */}
        {(node.type === 'GridPanel' || node.type === 'UniformGridPanel') && (
          <Section label="Grid">
            <Row label="Columns">
              <NumInput value={(p.columnsCount as number) || 2} min={1} max={20} onChange={v => patchProps({ columnsCount: Math.round(v) })} />
            </Row>
            <Row label="Rows">
              <NumInput value={(p.rowsCount as number) || 2} min={1} max={20} onChange={v => patchProps({ rowsCount: Math.round(v) })} />
            </Row>
          </Section>
        )}

        {/* ── SizeBox ──────────────────────── */}
        {node.type === 'SizeBox' && (
          <Section label="Size Constraints">
            <Row label="Min W"><NumInput value={(p.minDesiredWidth as number) ?? 0} min={0} onChange={v => patchProps({ minDesiredWidth: v })} /></Row>
            <Row label="Min H"><NumInput value={(p.minDesiredHeight as number) ?? 0} min={0} onChange={v => patchProps({ minDesiredHeight: v })} /></Row>
            <Row label="Max W"><NumInput value={(p.maxDesiredWidth as number) ?? 0} min={0} onChange={v => patchProps({ maxDesiredWidth: v })} /></Row>
            <Row label="Max H"><NumInput value={(p.maxDesiredHeight as number) ?? 0} min={0} onChange={v => patchProps({ maxDesiredHeight: v })} /></Row>
          </Section>
        )}

        {/* ── BackgroundBlur ───────────────── */}
        {node.type === 'BackgroundBlur' && (
          <Section label="Blur">
            <Row label="Strength">
              <NumInput value={(p.blurStrength as number) ?? 10} min={0} max={100} onChange={v => patchProps({ blurStrength: v })} />
            </Row>
          </Section>
        )}

        {/* ── NamedSlot ────────────────────── */}
        {node.type === 'NamedSlot' && (
          <Section label="Slot">
            <Row label="Slot Name">
              <TextInput value={(p.slotName as string) || 'Default'} onChange={v => patchProps({ slotName: v })} />
            </Row>
          </Section>
        )}

        {/* ── Style ────────────────────────── */}
        <Section label="Style">
          {(isPanel || node.type === 'Button') && (<>
            <Row label="Background">
              <ColorInput value={s.backgroundColor || '#00000000'} onChange={v => patchStyle({ backgroundColor: v })} />
            </Row>
            {node.type === 'Button' && (<>
              <Row label="Hover">
                <ColorInput value={(s.hoverColor as string) || '#382208f5'} onChange={v => patchStyle({ hoverColor: v })} />
              </Row>
              <Row label="Pressed">
                <ColorInput value={(s.pressedColor as string) || '#1a0e02f5'} onChange={v => patchStyle({ pressedColor: v })} />
              </Row>
            </>)}
            <Row label="Border Color">
              <ColorInput value={s.borderColor || '#00000000'} onChange={v => patchStyle({ borderColor: v })} />
            </Row>
            <Row label="Border W">
              <NumInput value={s.borderWidth ?? 0} min={0} onChange={v => patchStyle({ borderWidth: v })} />
            </Row>
            <Row label="Radius">
              <NumInput value={s.borderRadius ?? 0} min={0} onChange={v => patchStyle({ borderRadius: v })} />
            </Row>
            {node.type === 'Border' && (
              <Row label="Draw As">
                <SelectInput value={(p.drawAs as string) || 'Image'} options={['Image','Box','Border','RoundedBox','NoDrawType']} onChange={v => patchProps({ drawAs: v as 'Image'|'Box'|'Border'|'RoundedBox'|'NoDrawType' })} />
              </Row>
            )}
            <Row label="Padding">
              <PaddingInput value={s.padding} onChange={v => patchStyle({ padding: v })} />
            </Row>
            {/* Gradient */}
            {(() => {
              const grad = s.gradient as { type: 'linear'|'radial'; angle?: number; stops: {color:string;position:number}[] } | undefined
              const a = grad?.angle ?? 0
              const s0 = grad?.stops?.[0] ?? { color: '#ffffffff', position: 0 }
              const s1 = grad?.stops?.[1] ?? { color: '#00000000', position: 1 }
              const save = (g: typeof grad) => patchStyle({ gradient: g })
              return (<>
                <Row label="Gradient">
                  <SelectInput
                    value={!grad ? 'None' : grad.type === 'linear' ? 'Linear' : 'Radial'}
                    options={['None','Linear','Radial']}
                    onChange={v => save(v === 'None' ? undefined : { type: v.toLowerCase() as 'linear'|'radial', angle: a, stops: [s0, s1] })} />
                </Row>
                {grad && (<>
                  {grad.type === 'linear' && (
                    <Row label="Angle °">
                      <NumInput value={a} min={0} max={360} onChange={v => save({ ...grad, angle: v })} />
                    </Row>
                  )}
                  <Row label="Stop 1">
                    <ColorInput value={s0.color} onChange={v => save({ ...grad, stops: [{ ...s0, color: v }, s1] })} />
                  </Row>
                  <Row label="Stop 2">
                    <ColorInput value={s1.color} onChange={v => save({ ...grad, stops: [s0, { ...s1, color: v }] })} />
                  </Row>
                </>)}
              </>)
            })()}
          </>)}
          {node.type === 'Image' && (
            <Row label="Tint">
              <ColorInput value={s.tint || '#ffffffff'} onChange={v => patchStyle({ tint: v })} />
            </Row>
          )}
          <Row label="Opacity">
            <NumInput value={s.opacity ?? 1} min={0} max={1} step={0.05} onChange={v => patchStyle({ opacity: v })} />
          </Row>
          <Row label="Visibility">
            <SelectInput value={s.visibility || 'Visible'} options={VISIBILITY} onChange={v => patchStyle({ visibility: v as StyleData['visibility'] })} />
          </Row>
        </Section>

        {/* ── Animation ────────────────────── */}
        <Section label="Animation">
          {(() => {
            const anim = s.animation as { type: string; duration?: number; delay?: number; loop?: boolean } | undefined
            const save = (a: typeof anim) => patchStyle({ animation: a })
            const ANIM_TYPES = ['None','Fade','Pulse','Slide Up','Slide Left','Scale','Bounce']
            const toKey = (v: string) => v.toLowerCase().replace(' ', '-')
            const toLabel = (k: string) => k === 'none' ? 'None' : k.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
            return (<>
              <Row label="Type">
                <SelectInput
                  value={toLabel(anim?.type ?? 'none')}
                  options={ANIM_TYPES}
                  onChange={v => save(v === 'None' ? undefined : { type: toKey(v), duration: anim?.duration ?? 1, delay: anim?.delay ?? 0, loop: anim?.loop ?? true })} />
              </Row>
              {anim && anim.type !== 'none' && (<>
                <Row label="Duration s">
                  <NumInput value={anim.duration ?? 1} min={0.1} max={10} step={0.1} onChange={v => save({ ...anim, duration: v })} />
                </Row>
                <Row label="Delay s">
                  <NumInput value={anim.delay ?? 0} min={0} max={10} step={0.1} onChange={v => save({ ...anim, delay: v })} />
                </Row>
                <Row label="Loop">
                  <SelectInput value={anim.loop !== false ? 'Yes' : 'No'} options={['Yes','No']} onChange={v => save({ ...anim, loop: v === 'Yes' })} />
                </Row>
              </>)}
            </>)
          })()}
        </Section>

        {/* ── Image ────────────────────────── */}
        {node.type === 'Image' && (
          <Section label="Image">
            <Row label="Source URL">
              <TextInput value={(p.src as string) || ''} onChange={v => patchProps({ src: v })} />
            </Row>
          </Section>
        )}

        {/* ── Content (Text / Button) ──────── */}
        {(isTextWidget || node.type === 'Button') && (
          <Section label="Content">
            <Row label="Text">
              <TextInput value={(p.text as string) || ''} onChange={v => patchProps({ text: v })} />
            </Row>
            <Row label="Color">
              <ColorInput value={(p.color as string) || '#faf5ebff'} onChange={v => patchProps({ color: v })} />
            </Row>
            <Row label="Font Size">
              <NumInput value={(font.size as number) || 14} min={1} onChange={v => patchProps({ font: { ...font, size: v } })} />
            </Row>
            <Row label="Weight">
              <SelectInput value={(font.weight as string) || 'Regular'} options={WEIGHTS} onChange={v => patchProps({ font: { ...font, weight: v } })} />
            </Row>
            <Row label="Letter Sp.">
              <NumInput value={(font.letterSpacing as number) || 0} min={0} onChange={v => patchProps({ font: { ...font, letterSpacing: v } })} />
            </Row>
            {isTextWidget && (
              <Row label="Justify">
                <SelectInput value={(p.justification as string) || 'Left'} options={JUSTIFY} onChange={v => patchProps({ justification: v })} />
              </Row>
            )}
          </Section>
        )}

        {/* ── TextInput ────────────────────── */}
        {node.type === 'TextInput' && (
          <Section label="Content">
            <Row label="Hint Text">
              <TextInput value={(p.hintText as string) || ''} onChange={v => patchProps({ hintText: v })} />
            </Row>
            <Row label="Color">
              <ColorInput value={(p.color as string) || '#888888ff'} onChange={v => patchProps({ color: v })} />
            </Row>
            <Row label="Font Size">
              <NumInput value={(font.size as number) || 12} min={1} onChange={v => patchProps({ font: { ...font, size: v } })} />
            </Row>
            <Row label="Weight">
              <SelectInput value={(font.weight as string) || 'Regular'} options={WEIGHTS} onChange={v => patchProps({ font: { ...font, weight: v } })} />
            </Row>
          </Section>
        )}

        {/* ── ProgressBar ──────────────────── */}
        {node.type === 'ProgressBar' && (
          <Section label="Progress">
            <Row label="Percent">
              <NumInput value={(p.percent as number) ?? 0.5} min={0} max={1} step={0.01} onChange={v => patchProps({ percent: v })} />
            </Row>
            <Row label="Fill Color">
              <ColorInput value={(p.fillColor as string) || '#e8750aff'} onChange={v => patchProps({ fillColor: v })} />
            </Row>
          </Section>
        )}

        {/* ── Slider ───────────────────────── */}
        {node.type === 'Slider' && (
          <Section label="Slider">
            <Row label="Value">
              <NumInput value={(p.value as number) ?? 0.5} min={(p.minValue as number) ?? 0} max={(p.maxValue as number) ?? 1} step={(p.stepSize as number) ?? 0.01} onChange={v => patchProps({ value: v })} />
            </Row>
            <Row label="Min"><NumInput value={(p.minValue as number) ?? 0} onChange={v => patchProps({ minValue: v })} /></Row>
            <Row label="Max"><NumInput value={(p.maxValue as number) ?? 1} onChange={v => patchProps({ maxValue: v })} /></Row>
            <Row label="Step"><NumInput value={(p.stepSize as number) ?? 0.01} min={0} step={0.001} onChange={v => patchProps({ stepSize: v })} /></Row>
          </Section>
        )}

        {/* ── CheckBox ─────────────────────── */}
        {node.type === 'CheckBox' && (
          <Section label="CheckBox">
            <Row label="Checked">
              <input type="checkbox" checked={!!(p.isChecked)} onChange={e => patchProps({ isChecked: e.target.checked })}
                style={{ width: 16, height: 16, accentColor: '#e8750a', cursor: 'pointer' }} />
            </Row>
            <Row label="Label">
              <TextInput value={(p.label as string) || ''} onChange={v => patchProps({ label: v })} />
            </Row>
          </Section>
        )}

        {/* ── SpinBox ──────────────────────── */}
        {node.type === 'SpinBox' && (
          <Section label="SpinBox">
            <Row label="Value"><NumInput value={(p.value as number) ?? 0} onChange={v => patchProps({ value: v })} /></Row>
            <Row label="Min"><NumInput value={(p.minValue as number) ?? 0} onChange={v => patchProps({ minValue: v })} /></Row>
            <Row label="Max"><NumInput value={(p.maxValue as number) ?? 100} onChange={v => patchProps({ maxValue: v })} /></Row>
            <Row label="Delta"><NumInput value={(p.delta as number) ?? 1} min={0} step={0.1} onChange={v => patchProps({ delta: v })} /></Row>
          </Section>
        )}

        {/* ── ComboBox ─────────────────────── */}
        {node.type === 'ComboBox' && (
          <Section label="ComboBox">
            <Row label="Selected">
              <NumInput value={(p.selectedIndex as number) ?? 0} min={0} onChange={v => patchProps({ selectedIndex: Math.round(v) })} />
            </Row>
            <Row label="Options">
              <TextInput
                value={((p.options as string[]) || []).join(', ')}
                onChange={v => patchProps({ options: v.split(',').map(s => s.trim()).filter(Boolean) })}
              />
            </Row>
          </Section>
        )}

        {/* ── Spacer ───────────────────────── */}
        {node.type === 'Spacer' && (
          <Section label="Spacer">
            <Row label="Size">
              <NumInput value={(p.size as number) || 20} min={0} onChange={v => patchProps({ size: v })} />
            </Row>
          </Section>
        )}

      </div>
    </div>
  )
}
