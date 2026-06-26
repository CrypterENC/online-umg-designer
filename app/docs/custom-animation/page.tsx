'use client'
import Link from 'next/link'
import React, { useEffect, useRef, useState } from 'react'

// ── Data ─────────────────────────────────────────────────────────────────────

const SECTIONS = [
  {
    id: 'intro',
    title: 'Custom Animations in UMG Designer',
    content: (
      <>
        <P>UMG Designer features a rich animation preview engine that renders animations in real-time inside <strong>Preview Mode</strong>. These animations allow layout designers to visualize dynamic UI states (such as hovered buttons, pulsing health warnings, or sliding menu entries) before importing to Unreal Engine.</P>
        <P>Under the hood, the designer uses standard CSS <strong>keyframe animations</strong>. The visual settings (duration, delay, looping) configured in the Properties panel are exported directly in the JSON file inside the <Code>style.animation</Code> block so your UMG Bridge plugin can parse them and build matching Unreal animations.</P>
      </>
    ),
  },
  {
    id: 'designer-setup',
    title: 'Adding a New Animation to the Designer',
    content: (
      <>
        <P>To add a custom animation to the designer's dropdown palette and make it render in the canvas preview, you need to perform a simple two-step process in the codebase:</P>
        
        <Steps items={[
          { n: '01', title: 'Register the Animation Type', desc: 'Open components/PropertiesPanel.tsx. Find the ANIM_TYPES array inside the Animation section. Add your new animation name in Title Case (e.g. "Shake" or "Rainbow Glow").' },
          { n: '02', title: 'Define the CSS Keyframes', desc: 'Open app/globals.css. Scroll to the "Preview animation keyframes" section. Define a new @keyframes rule prefixed with "umg-" followed by your lowercase-hyphenated animation name (e.g. @keyframes umg-shake or @keyframes umg-rainbow-glow).' },
          { n: '03', title: 'Preview & Export', desc: 'Select any widget, find the Animation section in the Properties panel on the right, select your new animation, and press P (or click Preview) to see it play. When exported, the JSON will contain your animation key name.' },
        ]} />

        <Note>The dropdown formatting helper in the Properties Panel automatically converts your user-facing label (e.g. <Code>"Slide Left"</Code>) into a hyphenated CSS key (e.g. <Code>"slide-left"</Code>) which aligns with the keyframes prefixed with <Code>umg-</Code>.</Note>
      </>
    ),
  },
  {
    id: 'examples',
    title: 'Custom Animation Examples',
    subsections: [
      { id: 'ex-shake',   title: 'Shake Animation' },
      { id: 'ex-spin',    title: 'Spin Animation' },
      { id: 'ex-wobble',  title: 'Wobble Animation' },
    ],
    content: (
      <>
        <P>Below are some copy-paste friendly CSS examples you can add directly to <Code>app/globals.css</Code> to expand your animation toolkit:</P>

        {/* ── Shake ── */}
        <SubHeading id="ex-shake">1. Shake (Left-to-Right Wiggle)</SubHeading>
        <P>Great for error inputs or indicating invalid actions.</P>
        <Tree lines={[
          '/* Add this under Preview animation keyframes in app/globals.css */',
          '@keyframes umg-shake {',
          '  0%, 100% { transform: translateX(0); }',
          '  20%, 60% { transform: translateX(-6px); }',
          '  40%, 80% { transform: translateX(6px); }',
          '}',
          '',
          '// Add "Shake" to ANIM_TYPES in components/PropertiesPanel.tsx'
        ]} />

        {/* ── Spin ── */}
        <SubHeading id="ex-spin">2. Spin (Continuous Rotation)</SubHeading>
        <P>Perfect for loading indicators, gear icons, or rotating HUD markers.</P>
        <Tree lines={[
          '/* Add this under Preview animation keyframes in app/globals.css */',
          '@keyframes umg-spin {',
          '  from { transform: rotate(0deg); }',
          '  to   { transform: rotate(360deg); }',
          '}',
          '',
          '// Add "Spin" to ANIM_TYPES in components/PropertiesPanel.tsx'
        ]} />

        {/* ── Wobble ── */}
        <SubHeading id="ex-wobble">3. Wobble (Skew &amp; Rotate)</SubHeading>
        <P>A playful, jelly-like physics hover/pulse effect.</P>
        <Tree lines={[
          '/* Add this under Preview animation keyframes in app/globals.css */',
          '@keyframes umg-wobble {',
          '  0%, 100% { transform: translateX(0) rotate(0deg); }',
          '  15%      { transform: translateX(-8px) rotate(-3deg); }',
          '  30%      { transform: translateX(6px) rotate(2deg); }',
          '  45%      { transform: transform: translateX(-4px) rotate(-1.5deg); }',
          '  60%      { transform: translateX(2px) rotate(1deg); }',
          '  75%      { transform: translateX(-1px) rotate(-0.5deg); }',
          '}',
          '',
          '// Add "Wobble" to ANIM_TYPES in components/PropertiesPanel.tsx'
        ]} />
      </>
    ),
  },
  {
    id: 'ue-mapping',
    title: 'Mapping to Unreal Engine UMG',
    content: (
      <>
        <P>When you click **Export JSON**, the widget's animation configuration is exported inside the <Code>style</Code> block of each node:</P>
        
        <Tree lines={[
          '{',
          '  "type": "Button",',
          '  "name": "Btn_Play",',
          '  "style": {',
          '    "backgroundColor": "#e8750aff",',
          '    "animation": {',
          '      "type": "pulse",',
          '      "duration": 1.5,',
          '      "delay": 0.2,',
          '      "loop": true',
          '    }',
          '  }',
          '}'
        ]} />

        <P>Since UMG itself uses a Timeline-based system rather than CSS keyframes, your UMG Bridge C++ or Blueprint importer is responsible for mapping these styles to actual UMG assets:</P>
        
        <KbTable rows={[
          ['Option A: Blueprint Timelines', 'Upon importing, read the animation JSON. Create a Widget Animation timeline containing tracks that modify Scale, Translation, or Opacity, matching the CSS keyframes. Play this animation in the Construct Event of your Widget Blueprint.'],
          ['Option B: Custom C++ UMG Subclasses', 'If you use C++ base classes for your widgets, implement a base animation component. The C++ code reads the animation struct, initializes a UWidgetAnimation dynamically at runtime, and calls PlayAnimation.'],
          ['Option C: Direct Material parameter driver', 'For visual effects like spinners or flashes, bind the duration/delay parameters to a UI Material Instance Dynamic (MID) to drive transition effects directly inside the GPU.'],
        ]} />

        <Note>In Unreal, the <Code>WidgetAnimation</Code> object is the standard way to execute UI transitions. It is best to create a set of reusable template animations (e.g. FadeAnim, PulseAnim) in your base Widget Class and trigger them dynamically based on the exported JSON type.</Note>
      </>
    ),
  },
  {
    id: 'ue-tutorial',
    title: 'Tutorial: Recreating Animations in Unreal Editor',
    content: (
      <>
        <P>To recreate the animations designed in the web editor inside the Unreal Editor, you construct a native <strong>Widget Animation</strong> and trigger it in your blueprint graph.</P>
        
        <Steps items={[
          {
            n: '01',
            title: 'Create the Widget Animation',
            desc: 'Open your Widget Blueprint. In the bottom-left window, find the "Animations" panel and click "+ Animation". Name it to match your animation style (e.g., "PulseAnim" or "FadeInAnim").'
          },
          {
            n: '02',
            title: 'Add Keyframes to the Timeline',
            desc: 'Select your animation, then select your target widget variable (e.g., Btn_Play). In the Timeline panel, click "+ Track" and select your widget name. Click the "+" next to the track to add a property track (e.g., Render Transform -> Scale, or Color and Opacity). Move the playhead and add keyframe values to match your CSS timing (e.g., key scale at 1.0 at 0.0s, scale at 1.06 at 0.75s, scale at 1.0 at 1.5s).'
          },
          {
            n: '03',
            title: 'Play the Animation on Construction',
            desc: 'Switch to the Graph tab. Under Event Construct, drag your animation variable reference (found under the Variables -> Animations category on the left) to the Event Graph. Drag off it and call the "Play Animation" function node.'
          },
          {
            n: '04',
            title: 'Configure Loop & Delay in Blueprint',
            desc: 'In the Play Animation node details: Set "Num Loops to Play" to 0 for infinite loop (matching loop: true), or 1 for single play. If your JSON includes a delay, you can call "Delay" in your blueprint flow before calling Play Animation.'
          }
        ]} />
      </>
    ),
  },
]

// ── Prose components ──────────────────────────────────────────────────────────

function P({ children }: { children: React.ReactNode }) {
  return <p style={{ fontSize: 13, color: '#8b949e', lineHeight: 1.7, marginBottom: 12 }}>{children}</p>
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code style={{
      fontFamily: 'var(--font-geist-mono)', fontSize: 11,
      background: 'rgba(168,85,247,0.12)', color: '#c084fc',
      border: '1px solid rgba(168,85,247,0.25)', borderRadius: 3,
      padding: '1px 5px',
    }}>{children}</code>
  )
}

function SubHeading({ id, children }: { id?: string; children: React.ReactNode }) {
  return <h3 id={id} style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#7c3aed', marginTop: 24, marginBottom: 8, scrollMarginTop: 72 }}>{children}</h3>
}

function Tree({ lines }: { lines: string[] }) {
  return (
    <pre style={{
      fontFamily: 'var(--font-geist-mono)', fontSize: 11, color: '#8b949e',
      background: '#0d1117', border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 6, padding: '12px 16px', marginBottom: 12,
      lineHeight: 1.9, overflowX: 'auto', whiteSpace: 'pre',
    }}>{lines.join('\n')}</pre>
  )
}

function Note({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', gap: 10, background: 'rgba(168,85,247,0.06)', border: '1px solid rgba(168,85,247,0.18)', borderRadius: 6, padding: '10px 14px', marginTop: 12 }}>
      <span style={{ color: '#c084fc', fontSize: 13, flexShrink: 0 }}>◆</span>
      <span style={{ fontSize: 12, color: '#8b949e', lineHeight: 1.6 }}>{children}</span>
    </div>
  )
}

function KbTable({ rows }: { rows: [string, string][] }) {
  return (
    <div style={{ border: '1px solid rgba(255,255,255,0.06)', borderRadius: 6, overflow: 'hidden', marginBottom: 12 }}>
      {rows.map(([key, desc], i) => (
        <div key={i} style={{ display: 'flex', gap: 0, borderBottom: i < rows.length - 1 ? '1px solid rgba(255,255,255,0.05)' : undefined }}>
          <div style={{ width: 220, flexShrink: 0, padding: '7px 12px', background: '#161b22', fontFamily: 'var(--font-geist-mono)', fontSize: 11, color: '#e6edf3' }}>{key}</div>
          <div style={{ flex: 1, padding: '7px 12px', fontSize: 12, color: '#8b949e', lineHeight: 1.5 }}>{desc}</div>
        </div>
      ))}
    </div>
  )
}

function Steps({ items }: { items: { n: string; title: string; desc: string }[] }) {
  return (
    <div>
      {items.map(s => (
        <div key={s.n} style={{ display: 'flex', gap: 14, paddingBottom: 16, borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: 16 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: '#c084fc', paddingTop: 2, flexShrink: 0, width: 22, fontVariantNumeric: 'tabular-nums' }}>{s.n}</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#e6edf3', marginBottom: 3 }}>{s.title}</div>
            <P>{s.desc}</P>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Reveal wrapper (intersection observer fade-in) ───────────────────────────

function RevealSection({ id, last, children }: { id: string; last?: boolean; children: React.ReactNode }) {
  const ref = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect() }
    }, { threshold: 0.04 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  return (
    <section
      ref={ref}
      id={id}
      style={{
        marginBottom: 56, paddingBottom: 40,
        borderBottom: last ? undefined : '1px solid rgba(255,255,255,0.06)',
        scrollMarginTop: 72,
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : 'translateY(28px)',
        transition: 'opacity 500ms ease, transform 500ms ease',
      }}
    >
      {children}
    </section>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function CustomAnimationDocsPage() {
  const [scrollY, setScrollY] = useState(0)
  const [activeId, setActiveId] = useState(SECTIONS[0].id)

  // globals.css sets overflow:hidden on body (for the designer) — undo it for docs
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'auto'
    document.documentElement.style.overflow = 'auto'
    document.documentElement.style.scrollBehavior = 'smooth'
    return () => {
      document.body.style.overflow = prev
      document.documentElement.style.overflow = ''
      document.documentElement.style.scrollBehavior = ''
    }
  }, [])

  // Parallax scroll tracking
  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Scroll spy — highlight the deepest heading above the fold
  useEffect(() => {
    const ids: string[] = []
    SECTIONS.forEach(s => {
      ids.push(s.id)
      const subs = (s as { subsections?: { id: string }[] }).subsections
      subs?.forEach(sub => ids.push(sub.id))
    })
    const onScroll = () => {
      const threshold = 80 // px from top of viewport
      for (let i = ids.length - 1; i >= 0; i--) {
        const el = document.getElementById(ids[i])
        if (el && el.getBoundingClientRect().top <= threshold) {
          setActiveId(ids[i])
          return
        }
      }
      setActiveId(ids[0])
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const heroOffset = Math.min(scrollY * 0.45, 120)

  return (
    <div style={{ minHeight: '100vh', background: '#0d1117', color: '#e6edf3', fontFamily: 'var(--font-geist-sans)' }}>

      {/* ── Sticky header ───────────────────────────────────── */}
      <header style={{ height: 52, background: '#1e2229', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', padding: '0 24px', gap: 16, position: 'sticky', top: 0, zIndex: 20 }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <span style={{ fontSize: 10, color: '#484f58', letterSpacing: '0.1em', textTransform: 'uppercase' }}>← Designer</span>
        </Link>
        <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.08)' }} />
        <span style={{ fontSize: 13, fontWeight: 600, color: '#e6edf3' }}>UMG Designer</span>
        <span style={{ fontSize: 13, color: '#484f58' }}>/</span>
        <span style={{ fontSize: 13, color: '#8b949e' }}>Documentation</span>

        <div style={{ flex: 1 }} />

        <nav style={{ display: 'flex', gap: 24, height: '100%', alignItems: 'center' }}>
          <Link 
            href="/docs" 
            style={{ 
              fontSize: 12, 
              fontWeight: 500, 
              color: '#8b949e', 
              textDecoration: 'none',
              borderBottom: '2px solid transparent',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              padding: '0 4px',
              transition: 'color 150ms'
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#e6edf3' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#8b949e' }}
          >
            General Guide
          </Link>
          <Link 
            href="/docs/blueprints" 
            style={{ 
              fontSize: 12, 
              fontWeight: 500, 
              color: '#8b949e', 
              textDecoration: 'none',
              borderBottom: '2px solid transparent',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              padding: '0 4px',
              transition: 'color 150ms'
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#e6edf3' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#8b949e' }}
          >
            Blueprint Wiring
          </Link>
          <Link 
            href="/docs/custom-animation" 
            style={{ 
              fontSize: 12, 
              fontWeight: 600, 
              color: '#c084fc', 
              textDecoration: 'none',
              borderBottom: '2px solid #c084fc',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              padding: '0 4px',
              transition: 'color 150ms'
            }}
          >
            Custom Animations
          </Link>
        </nav>
      </header>

      {/* ── Parallax hero ───────────────────────────────────── */}
      <div style={{ position: 'relative', height: 240, overflow: 'hidden' }}>

        {/* Parallax gradient layer — purple theme, moves at 0.45× scroll speed */}
        <div style={{
          position: 'absolute', inset: '-60px -60px',
          background: [
            'radial-gradient(ellipse 90% 70% at 65% 55%, rgba(168, 85, 247, 0.15) 0%, transparent 65%)',
            'radial-gradient(ellipse 50% 90% at 15% 80%, rgba(139, 92, 246, 0.08) 0%, transparent 60%)',
            'radial-gradient(ellipse 60% 40% at 85% 20%, rgba(168, 85, 247, 0.06) 0%, transparent 55%)',
          ].join(', '),
          transform: `translateY(${heroOffset}px)`,
          willChange: 'transform',
        }} />

        {/* Floating ring — moves at 0.25× */}
        <div style={{
          position: 'absolute', top: 24, right: '12%',
          width: 140, height: 140, borderRadius: '50%',
          border: '1px solid rgba(168, 85, 247, 0.10)',
          transform: `translateY(${scrollY * 0.25}px)`,
          willChange: 'transform',
        }} />

        {/* Floating square — moves at 0.15× and rotates */}
        <div style={{
          position: 'absolute', top: 56, right: '24%',
          width: 52, height: 52, borderRadius: 8,
          border: '1px solid rgba(168, 85, 247, 0.08)',
          transform: `translateY(${scrollY * 0.15}px) rotate(${scrollY * 0.04}deg)`,
          willChange: 'transform',
        }} />

        {/* Small dot — moves at 0.6× */}
        <div style={{
          position: 'absolute', top: 100, right: '18%',
          width: 6, height: 6, borderRadius: '50%',
          background: 'rgba(168, 85, 247, 0.25)',
          transform: `translateY(${scrollY * 0.6}px)`,
          willChange: 'transform',
        }} />

        {/* Hero text — moves at 0.2× */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          maxWidth: 1100, margin: '0 auto', padding: '0 calc(200px + 24px + 32px) 0 24px',
          transform: `translateY(${scrollY * 0.2}px)`,
          willChange: 'transform',
        }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#c084fc', marginBottom: 10 }}>UMG Designer</div>
          <h1 style={{ fontSize: 34, fontWeight: 700, color: '#e6edf3', margin: 0, lineHeight: 1.15 }}>Custom Animations</h1>
          <p style={{ fontSize: 13, color: '#8b949e', marginTop: 10, marginBottom: 0 }}>Register custom preview keyframes and configure animation data mapping for Unreal Engine UI.</p>
        </div>

        {/* Bottom fade */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 48, background: 'linear-gradient(transparent, #0d1117)' }} />
      </div>

      {/* ── Sidebar + content ───────────────────────────────── */}
      <div style={{ display: 'flex', maxWidth: 1100, margin: '0 auto', padding: '0 24px' }}>

        {/* Sidebar */}
        <nav style={{ width: 200, flexShrink: 0, paddingTop: 32, paddingRight: 32, position: 'sticky', top: 52, alignSelf: 'flex-start', height: 'calc(100vh - 52px)', overflowY: 'auto', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#484f58', marginBottom: 12 }}>On this page</div>
          {SECTIONS.map(s => {
            const subs = (s as { subsections?: { id: string; title: string }[] }).subsections
            const parentActive = activeId === s.id || (subs?.some(sub => sub.id === activeId) ?? false)
            return (
              <div key={s.id}>
                <a
                  href={`#${s.id}`}
                  style={{
                    display: 'block', fontSize: 12, textDecoration: 'none',
                    padding: '5px 0 5px 10px',
                    borderLeft: `2px solid ${parentActive ? '#c084fc' : 'transparent'}`,
                    color: parentActive ? '#e6edf3' : '#8b949e',
                    transition: 'color 150ms, border-color 150ms',
                  }}
                  onMouseEnter={e => { if (!parentActive) (e.currentTarget as HTMLElement).style.color = '#c9d1d9' }}
                  onMouseLeave={e => { if (!parentActive) (e.currentTarget as HTMLElement).style.color = '#8b949e' }}
                >
                  {s.title}
                </a>
                {subs && (
                  <div style={{ paddingLeft: 10, borderLeft: '2px solid rgba(255,255,255,0.06)', marginLeft: 10, marginBottom: 2 }}>
                    {subs.map(sub => {
                      const subActive = activeId === sub.id
                      return (
                        <a
                          key={sub.id}
                          href={`#${sub.id}`}
                          style={{
                            display: 'block', fontSize: 11, textDecoration: 'none',
                            padding: '3px 0 3px 8px',
                            color: subActive ? '#c084fc' : '#484f58',
                            transition: 'color 150ms',
                          }}
                          onMouseEnter={e => { if (!subActive) (e.currentTarget as HTMLElement).style.color = '#8b949e' }}
                          onMouseLeave={e => { if (!subActive) (e.currentTarget as HTMLElement).style.color = '#484f58' }}
                        >
                          {sub.title}
                        </a>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        {/* Content */}
        <main style={{ flex: 1, paddingTop: 32, paddingBottom: 80, paddingLeft: 40, minWidth: 0 }}>
          {SECTIONS.map((s, i) => (
            <RevealSection key={s.id} id={s.id} last={i === SECTIONS.length - 1}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: '#e6edf3', marginBottom: 16 }}>{s.title}</h2>
              {s.content}
            </RevealSection>
          ))}
        </main>
      </div>
    </div>
  )
}
