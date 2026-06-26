'use client'
import Link from 'next/link'
import React, { useEffect, useRef, useState } from 'react'

// ── Data ─────────────────────────────────────────────────────────────────────

const SECTIONS = [
  {
    id: 'intro',
    title: 'Custom Widgets in Unreal Engine',
    content: (
      <>
        <P>Creating custom widgets in Unreal Engine involves two primary approaches: using **Widget Blueprints** for visual, node-based development, or using **C++ with Slate** for high-performance, deeply customized UI.</P>
        <P>Both approaches can be combined. You can write the core logic and properties in a C++ base class and then inherit from it in a Widget Blueprint to construct the styling and layout visually in UMG.</P>
      </>
    ),
  },
  {
    id: 'widget-blueprints',
    title: 'Widget Blueprints (UMG)',
    content: (
      <>
        <P>For most projects, Widget Blueprints are the standard method. You create a User Widget class via the Content Browser and design the layout using the UMG designer.</P>
        <P>To create reusable components, you can build **Widget Templates** by exposing variables with the <Code>Instance Editable</Code> and <Code>Expose on Spawn</Code> flags. This allows you to style a base element (like a button) once and modify its properties (text, color, font size) from any parent widget without duplicating code. Event dispatchers can be used to handle clicks or hover states on a per-instance basis.</P>
        
        <Note>Exposing properties on spawn is the best way to instantiate dynamic UI components (such as list entries or game stats cards) at runtime while supplying their data immediately.</Note>
      </>
    ),
  },
  {
    id: 'cpp-slate',
    title: 'C++ and Slate Integration',
    content: (
      <>
        <P>For advanced customization or performance optimization, you can create custom widgets using C++:</P>
        
        <Steps items={[
          { n: '01', title: 'Create a C++ Class', desc: 'Derive a new C++ class from UUserWidget in the Unreal Editor (Tools -> New C++ Class).' },
          { n: '02', title: 'Initialize Properties', desc: 'Override the NativeConstruct() function in your .cpp file to set up the widget\'s internal variables, event listeners, and default style bindings.' },
          { n: '03', title: 'Integrate Slate (Optional)', desc: 'For custom rendering, define a low-level Slate widget class (e.g. SCompoundWidget) and wrap it inside your UUserWidget class.' },
        ]} />

        <P>Below is a standard C++ base class template:</P>
        <Tree lines={[
          '// MyCustomWidget.h',
          '#pragma once',
          '#include "CoreMinimal.h"',
          '#include "Blueprint/UserWidget.h"',
          '#include "MyCustomWidget.generated.h"',
          '',
          'UCLASS()',
          'class MYPROJECT_API UMyCustomWidget : public UUserWidget',
          '{',
          '    GENERATED_BODY()',
          'public:',
          '    virtual void NativeConstruct() override;',
          '};'
        ]} />

        <Tree lines={[
          '// MyCustomWidget.cpp',
          '#include "MyCustomWidget.h"',
          '',
          'void UMyCustomWidget::NativeConstruct()',
          '{',
          '    Super::NativeConstruct();',
          '    // Initialize widget contents, bind delegates, or setup defaults here',
          '}'
        ]} />
      </>
    ),
  },
  {
    id: 'loading-screen',
    title: 'Tutorial: Custom Loading Screen Progress Bar',
    content: (
      <>
        <P>This tutorial demonstrates how to build and wire a custom progress bar loading screen. We will back the widget with a C++ class using the <Code>BindWidget</Code> meta property to link the visual components automatically.</P>

        <SubHeading id="loading-layout">Step 1: Visual Layout in the Designer</SubHeading>
        <P>Create a layout containing a background artwork, a status text block, and a progress bar. Ensure the UMG variables are named exactly to match the C++ pointers.</P>
        <Tree lines={[
          'CanvasPanel',
          '  ├── Image "Img_Background" (Fills screen, shows level splash art)',
          '  └── VerticalBox (Anchored bottom center, holding loading controls)',
          '        ├── Text "Txt_LoadingStatus" (Is Variable = True, displays active task)',
          '        └── ProgressBar "Bar_LoadingProgress" (Is Variable = True, displays percentage)'
        ]} />

        <SubHeading id="loading-cpp">Step 2: Declare the C++ Backing Class</SubHeading>
        <P>By declaring pointers with the <Code>BindWidget</Code> metadata, the engine automatically binds the visual widgets created in the UMG editor to the C++ properties upon widget initialization.</P>
        <Tree lines={[
          '// LoadingWidget.h',
          '#pragma once',
          '#include "CoreMinimal.h"',
          '#include "Blueprint/UserWidget.h"',
          '#include "LoadingWidget.generated.h"',
          '',
          'UCLASS()',
          'class MYPROJECT_API ULoadingWidget : public UUserWidget',
          '{',
          '    GENERATED_BODY()',
          'protected:',
          '    // Automatically binds to UMG widget named "Bar_LoadingProgress"',
          '    UPROPERTY(meta = (BindWidget))',
          '    class UProgressBar* Bar_LoadingProgress;',
          '',
          '    // Automatically binds to UMG widget named "Txt_LoadingStatus"',
          '    UPROPERTY(meta = (BindWidget))',
          '    class UTextBlock* Txt_LoadingStatus;',
          '',
          'public:',
          '    // Updates the progress ratio (0.0 to 1.0) and status description',
          '    UFUNCTION(BlueprintCallable, Category = "Loading Screen")',
          '    void UpdateProgress(float InPercent, const FText& InStatusMessage);',
          '};'
        ]} />

        <SubHeading id="loading-cpp-imp">Step 3: Implement the Progress Logic</SubHeading>
        <P>The C++ implementation updates the UMG properties directly, validating the pointers before applying the values:</P>
        <Tree lines={[
          '// LoadingWidget.cpp',
          '#include "LoadingWidget.h"',
          '#include "Components/ProgressBar.h"',
          '#include "Components/TextBlock.h"',
          '',
          'void ULoadingWidget::UpdateProgress(float InPercent, const FText& InStatusMessage)',
          '{',
          '    if (Bar_LoadingProgress)',
          '    {',
          '        Bar_LoadingProgress->SetPercent(FMath::Clamp(InPercent, 0.0f, 1.0f));',
          '    }',
          '    if (Txt_LoadingStatus)',
          '    {',
          '        Txt_LoadingStatus->SetText(InStatusMessage);',
          '    }',
          '}'
        ]} />

        <Note>In your level blueprint or game instance level transition handler, you instantiate this widget using <Code>CreateWidget&lt;ULoadingWidget&gt;(GetWorld(), LoadingWidgetClass)</Code>, add it to the viewport, and call <Code>UpdateProgress()</Code> during asset streaming.</Note>
      </>
    ),
  },
  {
    id: 'custom-fonts',
    title: 'Custom Fonts Integration (Web to Unreal Engine)',
    content: (
      <>
        <P>To use a custom font in Unreal Engine UI (UMG), you typically import the <Code>.ttf</Code> or <Code>.otf</Code> file directly into your Content Browser, which automatically creates a composite **Font Asset**, and then assign this asset to the Font property in the UMG details panel.</P>
        <P>For **3D Text Render** components, you must configure the font asset for distance fields: Set Font Cache Type to Offline, enable Use Distance Field Alpha, and adjust the Texture Page Width/Height (e.g. 512 or 1024) to optimize rendering performance.</P>
        
        <SubHeading id="font-export-json">Automatic Font Packaging in UMG Bridge</SubHeading>
        <P>Our UMG Designer simplifies this process. When you select a custom Google Font (such as <Code>Orbitron</Code> or <Code>Inter</Code>) in the property panel, it dynamically loads on the web canvas. When you click **Export JSON**, the font names and direct TTF download URLs are exported in the root <Code>fonts</Code> block:</P>
        
        <Tree lines={[
          '{',
          '  "version": "1.0",',
          '  "name": "WBP_MyWidget",',
          '  "fonts": [',
          '    {',
          '      "name": "Orbitron",',
          '      "url": "https://fonts.gstatic.com/s/orbitron/v31/yMJRQI5C7vZOK6Ro0MyX59p2.ttf"',
          '    }',
          '  ],',
          '  "tree": { ... }',
          '}'
        ]} />

        <SubHeading id="font-ue-import">How the UMG Bridge Plugin Imports Fonts</SubHeading>
        <P>Upon importing the JSON file inside Unreal Engine, the UMG Bridge C++ plugin automates the font download and registration process:</P>
        
        <Steps items={[
          { n: '01', title: 'Download Font Files', desc: 'The plugin parses the "fonts" block, invokes UHttpModule/IHttpRequest to download the .ttf binary file, and saves it directly to the project directory: Content/UI/Fonts/FontName.ttf.' },
          { n: '02', title: 'Create UFont Asset', desc: 'Using AssetTools and UFontFactory at edit-time, the plugin registers the newly downloaded file as a composite UFont asset and generates its default typeface entries.' },
          { n: '03', title: 'Bind to Text Blocks', desc: 'The plugin iterates through the reconstructed widget hierarchy, loads the newly generated UFont asset using StaticLoadObject, and assigns it to the widget\'s FontInfo structure.' }
        ]} />
      </>
    )
  },
  {
    id: 'best-practices',
    title: 'Best Practices',
    content: (
      <>
        <KbTable rows={[
          ['Modular Design', 'Build a library of base widgets (buttons, panels) and reuse them across your project to maintain visual consistency.'],
          ['Data Binding', 'Use custom events or event dispatchers to push data updates to widgets. Avoid tick-bound functions as they cause high CPU overhead.'],
          ['Performance Separation', 'For simple UI layouts, stick to Widget Blueprints. Switch to Slate/C++ base classes only when you require specific rendering capabilities, structural reuse, or need to optimize for high-frequency updates.'],
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
      background: 'rgba(59,130,246,0.12)', color: '#60a5fa',
      border: '1px solid rgba(59,130,246,0.25)', borderRadius: 3,
      padding: '1px 5px',
    }}>{children}</code>
  )
}

function SubHeading({ id, children }: { id?: string; children: React.ReactNode }) {
  return <h3 id={id} style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#3b82f6', marginTop: 24, marginBottom: 8, scrollMarginTop: 72 }}>{children}</h3>
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
    <div style={{ display: 'flex', gap: 10, background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.18)', borderRadius: 6, padding: '10px 14px', marginTop: 12 }}>
      <span style={{ color: '#60a5fa', fontSize: 13, flexShrink: 0 }}>◆</span>
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
          <span style={{ fontSize: 10, fontWeight: 700, color: '#60a5fa', paddingTop: 2, flexShrink: 0, width: 22, fontVariantNumeric: 'tabular-nums' }}>{s.n}</span>
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

export default function CustomWidgetsDocsPage() {
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
              fontWeight: 500, 
              color: '#8b949e', 
              textDecoration: 'none',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              padding: '0 4px',
              transition: 'color 150ms'
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#e6edf3' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#8b949e' }}
          >
            Custom Animations
          </Link>
          <Link 
            href="/docs/custom-widgets" 
            style={{ 
              fontSize: 12, 
              fontWeight: 600, 
              color: '#3b82f6', 
              textDecoration: 'none',
              borderBottom: '2px solid #3b82f6',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              padding: '0 4px',
              transition: 'color 150ms'
            }}
          >
            Custom Widgets
          </Link>
        </nav>
      </header>

      {/* ── Parallax hero ───────────────────────────────────── */}
      <div style={{ position: 'relative', height: 240, overflow: 'hidden' }}>

        {/* Parallax gradient layer — blue/cyan theme */}
        <div style={{
          position: 'absolute', inset: '-60px -60px',
          background: [
            'radial-gradient(ellipse 90% 70% at 65% 55%, rgba(59, 130, 246, 0.15) 0%, transparent 65%)',
            'radial-gradient(ellipse 50% 90% at 15% 80%, rgba(37, 99, 235, 0.08) 0%, transparent 60%)',
            'radial-gradient(ellipse 60% 40% at 85% 20%, rgba(59, 130, 246, 0.06) 0%, transparent 55%)',
          ].join(', '),
          transform: `translateY(${heroOffset}px)`,
          willChange: 'transform',
        }} />

        {/* Floating elements */}
        <div style={{
          position: 'absolute', top: 24, right: '12%',
          width: 140, height: 140, borderRadius: '50%',
          border: '1px solid rgba(59, 130, 246, 0.10)',
          transform: `translateY(${scrollY * 0.25}px)`,
          willChange: 'transform',
        }} />

        <div style={{
          position: 'absolute', top: 56, right: '24%',
          width: 52, height: 52, borderRadius: 8,
          border: '1px solid rgba(59, 130, 246, 0.08)',
          transform: `translateY(${scrollY * 0.15}px) rotate(${scrollY * 0.04}deg)`,
          willChange: 'transform',
        }} />

        {/* Hero text */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          maxWidth: 1100, margin: '0 auto', padding: '0 calc(200px + 24px + 32px) 0 24px',
          transform: `translateY(${scrollY * 0.2}px)`,
          willChange: 'transform',
        }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#60a5fa', marginBottom: 10 }}>UMG Designer</div>
          <h1 style={{ fontSize: 34, fontWeight: 700, color: '#e6edf3', margin: 0, lineHeight: 1.15 }}>Custom Widgets</h1>
          <p style={{ fontSize: 13, color: '#8b949e', marginTop: 10, marginBottom: 0 }}>Design reusable visual templates and map custom C++ logic to your UMG loading screens and HUD assets.</p>
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
            const parentActive = activeId === s.id
            return (
              <a
                key={s.id}
                href={`#${s.id}`}
                style={{
                  display: 'block', fontSize: 12, textDecoration: 'none',
                  padding: '5px 0 5px 10px',
                  borderLeft: `2px solid ${parentActive ? '#60a5fa' : 'transparent'}`,
                  color: parentActive ? '#e6edf3' : '#8b949e',
                  transition: 'color 150ms, border-color 150ms',
                }}
                onMouseEnter={e => { if (!parentActive) (e.currentTarget as HTMLElement).style.color = '#c9d1d9' }}
                onMouseLeave={e => { if (!parentActive) (e.currentTarget as HTMLElement).style.color = '#8b949e' }}
              >
                {s.title}
              </a>
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
