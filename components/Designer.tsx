'use client'
import React, { useReducer, useCallback, useEffect, useRef, useState } from 'react'
import { reducer, initialState } from '@/lib/store'
import { WidgetNode } from '@/lib/types'
import { WMAP, SINGLE_CHILD_PANELS } from '@/lib/widgetDefs'
import { uid } from '@/lib/uid'
import { collectPanelIds } from '@/lib/treeOps'
import { exportJSON, parseUmgBridgeJSON } from '@/lib/exportImport'
import Canvas from './Canvas'
import Palette from './Palette'
import Hierarchy from './Hierarchy'
import PropertiesPanel from './PropertiesPanel'
import WidgetRenderer from './WidgetRenderer'
import ThemePicker from './ThemePicker'
import { findNode, findParent } from '@/lib/treeOps'

const ZOOM_STEPS = [0.1, 0.25, 0.33, 0.5, 0.67, 0.75, 1, 1.25, 1.5, 2]
const CANVAS_PRESETS: Record<string, { w: number; h: number }> = {
  '1920×1080': { w: 1920, h: 1080 },
  '2560×1440': { w: 2560, h: 1440 },
  '1280×720':  { w: 1280, h: 720  },
  '3840×2160': { w: 3840, h: 2160 },
}
const DEFAULT_CANVAS_PANEL_SLOT = {
  position: { x: 100, y: 100 },
  size: { x: 200, y: 60 },
  anchors: { min: [0, 0] as [number, number], max: [0, 0] as [number, number] },
}

function makeNode(type: string): WidgetNode {
  const def = WMAP[type] || {}
  const sizeMap: Record<string, { x: number; y: number }> = {
    Text: { x: 200, y: 40 }, Button: { x: 200, y: 60 }, TextInput: { x: 200, y: 40 },
    Image: { x: 200, y: 150 }, ProgressBar: { x: 200, y: 20 }, Slider: { x: 200, y: 30 }, CheckBox: { x: 30, y: 30 },
  }
  return {
    id: uid(), type, name: type,
    slot: sizeMap[type] ? { size: sizeMap[type] } : {},
    style: { ...(def.defaultStyle || {}) } as WidgetNode['style'],
    properties: { ...(def.defaultProps || {}) } as WidgetNode['properties'],
    children: [],
  }
}

const SEP = <div className="w-px h-4 shrink-0" style={{ background: 'rgba(255,255,255,0.08)' }} />

export default function Designer() {
  const [state, dispatch] = useReducer(reducer, initialState)

  const stateRef = useRef(state)
  useEffect(() => {
    stateRef.current = state
  }, [state])

  const [roomId, setRoomId] = useState<string>('default')
  const [isVercelBuilding, setIsVercelBuilding] = useState<boolean>(false)
  const [isOwner, setIsOwner] = useState<boolean>(false)
  const [members, setMembers] = useState<any[]>([])
  const [showMembersDropdown, setShowMembersDropdown] = useState<boolean>(false)
  const [dropdownCoords, setDropdownCoords] = useState<{ top: number; left: number }>({ top: 0, left: 0 })

  const membersButtonRef = useRef<HTMLButtonElement>(null)
  const membersDropdownRef = useRef<HTMLDivElement>(null)
  const handleToggleMembers = () => {
    if (membersButtonRef.current) {
      const rect = membersButtonRef.current.getBoundingClientRect()
      setDropdownCoords({
        top: rect.bottom,
        left: rect.left
      })
    }
    setShowMembersDropdown(v => !v)
  }

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        showMembersDropdown &&
        membersDropdownRef.current &&
        !membersDropdownRef.current.contains(e.target as Node) &&
        membersButtonRef.current &&
        !membersButtonRef.current.contains(e.target as Node)
      ) {
        setShowMembersDropdown(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showMembersDropdown])

  const memberIdRef = useRef<string>('')
  const memberNameRef = useRef<string>('')

  // Initialize member identification and room ID on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      let mId = sessionStorage.getItem('memberId')
      if (!mId) {
        mId = Math.random().toString(36).substring(2, 10)
        sessionStorage.setItem('memberId', mId)
      }
      memberIdRef.current = mId

      let mName = sessionStorage.getItem('memberName')
      if (!mName) {
        mName = 'Designer #' + Math.floor(100 + Math.random() * 900)
        sessionStorage.setItem('memberName', mName)
      }
      memberNameRef.current = mName

      const params = new URLSearchParams(window.location.search)
      let r = params.get('room')
      if (!r) {
        r = Math.random().toString(36).substring(2, 8)
        params.set('room', r)
        window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`)
        localStorage.setItem(`owner_${r}`, 'true')
        setIsOwner(true)
      } else {
        if (localStorage.getItem(`owner_${r}`) === 'true') {
          setIsOwner(true)
        } else {
          setIsOwner(false)
        }
      }
      setRoomId(r)
    }
  }, [])

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [leftTab, setLeftTab] = useState<'palette' | 'hierarchy'>('palette')
  const [tool, setTool] = useState<'select' | 'pan'>('select')
  const [showPreview, setShowPreview] = useState(false)
  const [showThemes, setShowThemes] = useState(false)
  const themesButtonRef = useRef<HTMLButtonElement>(null)

  const [syncStatus, setSyncStatus] = useState<'connected' | 'offline' | 'syncing'>('connected')
  const lastSyncedVersion = useRef<number>(0)
  const isSyncingFromServer = useRef<boolean>(false)

  // 1. Polling Effect (pull from server)
  useEffect(() => {
    if (roomId === 'default') return

    // Reset sync version when switching rooms
    lastSyncedVersion.current = 0

    let active = true
    const poll = async () => {
      try {
        const resp = await fetch(`/api/design?room=${roomId}&memberId=${memberIdRef.current}&memberName=${memberNameRef.current}`)
        if (!resp.ok) throw new Error('Offline')
        const data = await resp.json()
        if (!active) return

        if (data.kicked) {
          alert('You have been kicked from this room by the owner.')
          const newRoom = Math.random().toString(36).substring(2, 8)
          const params = new URLSearchParams(window.location.search)
          params.set('room', newRoom)
          window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`)
          localStorage.setItem(`owner_${newRoom}`, 'true')
          setIsOwner(true)
          setRoomId(newRoom)
          dispatch({ type: 'CLEAR' })
          return
        }

        setSyncStatus('connected')
        setMembers(data.members || [])

        // If the server has a different version, load it
        if (data.version !== lastSyncedVersion.current) {
          if (data.version < lastSyncedVersion.current) {
            console.warn(`Server version (${data.version}) is older than client version (${lastSyncedVersion.current}). Server likely recycled. Restoring state...`)
            try {
              const pushResp = await fetch(`/api/design?room=${roomId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  tree: stateRef.current.tree,
                  canvas: stateRef.current.canvas,
                  widgetName: stateRef.current.widgetName,
                }),
              })
              if (pushResp.ok) {
                const pushData = await pushResp.json()
                lastSyncedVersion.current = pushData.version
                console.log(`Server state successfully restored to version ${pushData.version}`)
              }
            } catch (pushErr) {
              console.error('Failed to restore server state after container recycle:', pushErr)
            }
          } else {
            isSyncingFromServer.current = true
            setSyncStatus('syncing')
            
            dispatch({ type: 'SET_TREE', tree: data.tree })
            dispatch({ type: 'SET_CANVAS', canvas: data.canvas })
            dispatch({ type: 'SET_WIDGET_NAME', name: data.widgetName })
            
            lastSyncedVersion.current = data.version
            
            setTimeout(() => {
              if (active) {
                isSyncingFromServer.current = false
                setSyncStatus('connected')
              }
            }, 100)
          }
        }
      } catch (err) {
        if (active) {
          setSyncStatus('offline')
        }
      }
    }

    // Initial poll
    poll()

    // Poll every 1 second
    const interval = setInterval(poll, 1000)
    return () => {
      active = false
      clearInterval(interval)
    }
  }, [roomId])

  // 1b. Vercel Build Status Polling Effect
  useEffect(() => {
    let active = true
    const checkBuildStatus = async () => {
      try {
        const resp = await fetch('/api/build-status')
        if (resp.ok) {
          const data = await resp.json()
          if (active && typeof data.isBuilding === 'boolean') {
            setIsVercelBuilding(data.isBuilding)
          }
        }
      } catch (err) {
        console.error('Failed to fetch build status:', err)
      }
    }

    checkBuildStatus()
    const interval = setInterval(checkBuildStatus, 15000) // check every 15 seconds
    return () => {
      active = false
      clearInterval(interval)
    }
  }, [])

  // 2. Push Effect (send to server when client changes)
  useEffect(() => {
    if (roomId === 'default') return
    if (isSyncingFromServer.current) return

    // Debounce pushing changes to server
    const timer = setTimeout(async () => {
      try {
        const resp = await fetch(`/api/design?room=${roomId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tree: state.tree,
            canvas: state.canvas,
            widgetName: state.widgetName,
          }),
        })
        if (resp.ok) {
          const data = await resp.json()
          lastSyncedVersion.current = data.version
        }
      } catch (err) {
        console.error('Failed to push design to server:', err)
      }
    }, 800) // 800ms debounce

    return () => clearTimeout(timer)
  }, [state.tree, state.canvas, state.widgetName, roomId])

  const selectedNode = state.tree && state.sel ? findNode(state.tree, state.sel) : null

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); dispatch({ type: 'UNDO' }) }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) { e.preventDefault(); dispatch({ type: 'REDO' }) }
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') { e.preventDefault(); if (state.sel) dispatch({ type: 'DUPLICATE_NODE', id: state.sel }) }
      if (e.key === 'Delete' || e.key === 'Backspace') { if (state.sel) dispatch({ type: 'DELETE_NODE', id: state.sel }) }
      if (e.key === 'v' || e.key === 'V') setTool('select')
      if (e.key === 'h' || e.key === 'H') setTool('pan')
      if (e.key === 'Escape') setShowPreview(false)
      if (e.key === 'p' || e.key === 'P') setShowPreview(v => !v)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [state.sel])

  const handleAddWidget = useCallback((type: string) => {
    const node = makeNode(type)
    const def = WMAP[type]
    const targetSel = state.sel || state.tree?.id
    if (!state.tree) {
      dispatch({ type: 'SET_TREE', tree: node })
      if (def?.panel) dispatch({ type: 'EXPAND_ALL_PANELS', ids: [node.id] })
      dispatch({ type: 'SELECT', id: node.id })
    } else if (targetSel) {
      let parentNode = findNode(state.tree, targetSel)
      let parentDef = parentNode ? WMAP[parentNode.type] : null
      let finalParentId = targetSel

      // If target selected node is a single-child panel and already has a child,
      // we must add the new widget to its parent instead.
      if (parentNode && parentDef?.panel && SINGLE_CHILD_PANELS.has(parentNode.type) && parentNode.children.length >= 1) {
        const grandParent = findParent(state.tree, targetSel)
        if (grandParent) {
          parentNode = grandParent
          parentDef = WMAP[grandParent.type]
          finalParentId = grandParent.id
        }
      }

      if (parentDef?.panel) {
        if (parentNode?.type === 'CanvasPanel') node.slot = { ...DEFAULT_CANVAS_PANEL_SLOT }
        dispatch({ type: 'ADD_CHILD', parentId: finalParentId, node })
        if (!state.expanded.has(finalParentId)) dispatch({ type: 'TOGGLE_EXPAND', id: finalParentId })
      } else {
        // Selected node is not a panel (leaf). Add it to the leaf's parent (sibling of leaf).
        const leafParent = findParent(state.tree, targetSel)
        if (leafParent) {
          // If leaf's parent is a single-child panel, it already has the leaf child, so it can't accept another!
          // We must bubble up even further.
          let finalSiblingParent = leafParent
          let finalSiblingDef = WMAP[leafParent.type]
          
          if (SINGLE_CHILD_PANELS.has(leafParent.type)) {
            const grandParent = findParent(state.tree, leafParent.id)
            if (grandParent) {
              finalSiblingParent = grandParent
              finalSiblingDef = WMAP[grandParent.type]
            }
          }
          
          if (finalSiblingDef?.panel) {
            if (finalSiblingParent.type === 'CanvasPanel') node.slot = { ...DEFAULT_CANVAS_PANEL_SLOT }
            dispatch({ type: 'ADD_CHILD', parentId: finalSiblingParent.id, node })
            if (!state.expanded.has(finalSiblingParent.id)) dispatch({ type: 'TOGGLE_EXPAND', id: finalSiblingParent.id })
            return
          }
        }

        if (state.tree.type === 'CanvasPanel') node.slot = { ...DEFAULT_CANVAS_PANEL_SLOT }
        dispatch({ type: 'ADD_CHILD', parentId: state.tree.id, node })
      }
    } else {
      if (state.tree.type === 'CanvasPanel') node.slot = { ...DEFAULT_CANVAS_PANEL_SLOT }
      dispatch({ type: 'ADD_CHILD', parentId: state.tree.id, node })
    }
  }, [state.tree, state.sel, state.expanded])

  const handleDrop = useCallback((targetId: string, widgetType: string, draggedId?: string) => {
    if (draggedId) return
    const node = makeNode(widgetType)
    
    let finalTargetId = targetId
    if (state.tree) {
      const targetNode = findNode(state.tree, targetId)
      if (targetNode && SINGLE_CHILD_PANELS.has(targetNode.type) && targetNode.children.length >= 1) {
        const parentNode = findParent(state.tree, targetId)
        if (parentNode) {
          finalTargetId = parentNode.id
        }
      }
    }

    dispatch({ type: 'ADD_CHILD', parentId: finalTargetId, node })
    if (!state.expanded.has(finalTargetId)) dispatch({ type: 'TOGGLE_EXPAND', id: finalTargetId })
  }, [state.tree, state.expanded])

  const handleRootDrop = useCallback((widgetType: string) => {
    if (state.tree) return
    const node = makeNode(widgetType)
    dispatch({ type: 'SET_TREE', tree: node })
    dispatch({ type: 'SELECT', id: node.id })
  }, [state.tree])

  const handleMove = useCallback((id: string, x: number, y: number) => {
    if (!state.tree) return
    dispatch({ type: 'UPDATE_NODE', id, patch: { slot: { ...findNode(state.tree, id)?.slot, position: { x, y } } } })
  }, [state.tree])

  const handleResize = useCallback((id: string, pos: { x: number; y: number }, size: { x: number; y: number }) => {
    if (!state.tree) return
    const node = findNode(state.tree, id)
    dispatch({ type: 'UPDATE_NODE', id, patch: { slot: { ...node?.slot, position: pos, size } } })
  }, [state.tree])

  const setLockAll = useCallback((node: WidgetNode | null, locked: boolean): WidgetNode | null => {
    if (!node) return null
    return {
      ...node,
      editorLocked: locked,
      children: node.children.map(child => setLockAll(child, locked) as WidgetNode),
    }
  }, [])

  const handleLockAll = useCallback(() => {
    if (!state.tree) return
    const newTree = setLockAll(state.tree, true)
    dispatch({ type: 'SET_TREE', tree: newTree })
  }, [state.tree, setLockAll])

  const handleUnlockAll = useCallback(() => {
    if (!state.tree) return
    const newTree = setLockAll(state.tree, false)
    dispatch({ type: 'SET_TREE', tree: newTree })
  }, [state.tree, setLockAll])

  const handleImport = useCallback((file: File) => {
    file.text().then(text => {
      try {
        const { tree, canvas, name } = parseUmgBridgeJSON(text)
        dispatch({ type: 'SET_TREE', tree })
        dispatch({ type: 'SET_CANVAS', canvas })
        dispatch({ type: 'SET_WIDGET_NAME', name })
        if (tree) {
          const panelIds = collectPanelIds(tree, Object.fromEntries(Object.entries(WMAP).filter(([,v]) => v.panel).map(([k]) => [k, true])))
          dispatch({ type: 'EXPAND_ALL_PANELS', ids: panelIds })
        }
        dispatch({ type: 'SELECT', id: null })
      } catch (e) { alert('Failed to parse JSON: ' + (e as Error).message) }
    })
  }, [])

  const zoomIn  = () => { const n = ZOOM_STEPS.find(z => z > state.zoom); if (n) dispatch({ type: 'SET_ZOOM', zoom: n }) }
  const zoomOut = () => { const p = [...ZOOM_STEPS].reverse().find(z => z < state.zoom); if (p) dispatch({ type: 'SET_ZOOM', zoom: p }) }
  const zoomFit = useCallback(() => {
    const availW = window.innerWidth - 600   // left sidebar 240 + right sidebar 320 + margin 40
    const availH = window.innerHeight - 80   // toolbar 42 + margin 38
    const fit = Math.min(availW / state.canvas.w, availH / state.canvas.h) * 0.88
    dispatch({ type: 'SET_ZOOM', zoom: fit })
  }, [state.canvas.w, state.canvas.h])

  // Auto-fit on mount and whenever the canvas preset changes
  useEffect(() => { zoomFit() }, [zoomFit])

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: '#0d1117', color: '#e6edf3' }}>

      {/* ── Toolbar ──────────────────────────────────────────── */}
      <header
        className="flex items-center gap-2 px-3 shrink-0 overflow-x-auto"
        style={{ height: 42, background: '#1e2229', borderBottom: '1px solid rgba(255,255,255,0.08)', scrollbarWidth: 'none' }}
      >
        {/* Group 1: Title and Badges */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="section-label mr-1.5" style={{ letterSpacing: '0.12em' }}>UMG Designer</span>
          
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold transition-all duration-300" style={{
            background: syncStatus === 'connected' ? 'rgba(64,217,114,0.1)' : syncStatus === 'syncing' ? 'rgba(242,140,26,0.1)' : 'rgba(255,107,107,0.1)',
            color: syncStatus === 'connected' ? '#40d972' : syncStatus === 'syncing' ? '#f28c1a' : '#ff6b6b',
            border: `1px solid ${syncStatus === 'connected' ? 'rgba(64,217,114,0.2)' : syncStatus === 'syncing' ? 'rgba(242,140,26,0.2)' : 'rgba(255,107,107,0.2)'}`
          }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{
              background: syncStatus === 'connected' ? '#40d972' : syncStatus === 'syncing' ? '#f28c1a' : '#ff6b6b'
            }} />
            <span>{syncStatus === 'connected' ? 'LIVE' : syncStatus === 'syncing' ? 'SYNCING' : 'OFFLINE'}</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold transition-all duration-300 ml-0.5" style={{
            background: isVercelBuilding ? 'rgba(232,117,10,0.15)' : 'rgba(255,255,255,0.03)',
            color: isVercelBuilding ? '#ff983d' : '#8b949e',
            border: isVercelBuilding ? '1px solid rgba(232,117,10,0.3)' : '1px solid rgba(255,255,255,0.08)',
          }} title={isVercelBuilding ? "Vercel is building the latest commit." : "Vercel deployments are up to date."}>
            <span className={`w-1.5 h-1.5 rounded-full ${isVercelBuilding ? 'animate-pulse' : ''}`} style={{
              background: isVercelBuilding ? '#ff983d' : '#8b949e'
            }} />
            <span>{isVercelBuilding ? 'NEXT UPDATE IN PROGRESS' : 'VERCEL: IDLE'}</span>
          </div>

          <div 
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(window.location.href)
                alert('Collaborative room link copied to clipboard!')
              } catch (err) {
                alert('Link: ' + window.location.href)
              }
            }}
            className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold transition-all duration-300 ml-0.5 cursor-pointer hover:bg-[rgba(255,255,255,0.06)]"
            style={{
              background: 'rgba(255,255,255,0.03)',
              color: '#8b949e',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
            title="Click to copy collaborative room link"
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#e8750a' }} />
            <span>ROOM: {roomId.toUpperCase()} {isOwner && '(OWNER)'}</span>
          </div>

          {/* Members list dropdown */}
          <div className="relative shrink-0">
            <button
              ref={membersButtonRef}
              onClick={handleToggleMembers}
              className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold transition-all duration-300 ml-0.5 cursor-pointer hover:bg-[rgba(255,255,255,0.06)]"
              style={{
                background: 'rgba(255,255,255,0.03)',
                color: '#8b949e',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
              title="Active members in this room"
            >
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#40d972' }} />
              <span>👥 {members.length}</span>
            </button>
          </div>
        </div>

        {SEP}

        {/* Group 2: Tool toggle */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => setTool('select')}
            title="Select (V)"
            className="tbtn"
            style={{ width: 28, padding: 0, borderColor: tool === 'select' ? '#e8750a' : undefined, color: tool === 'select' ? '#e8750a' : undefined }}
          >▲</button>
          <button
            onClick={() => setTool('pan')}
            title="Pan (H · Space+drag)"
            className="tbtn"
            style={{ width: 28, padding: 0, borderColor: tool === 'pan' ? '#e8750a' : undefined, color: tool === 'pan' ? '#e8750a' : undefined }}
          >✥</button>
        </div>

        {SEP}

        {/* Group 3: Canvas Preset & Widget Name */}
        <div className="flex items-center gap-1.5 shrink-0">
          <select
            className="input-field"
            style={{ width: 112 }}
            value={`${state.canvas.w}×${state.canvas.h}`}
            onChange={e => { const p = CANVAS_PRESETS[e.target.value]; if (p) dispatch({ type: 'SET_CANVAS', canvas: p }) }}
          >
            {Object.keys(CANVAS_PRESETS).map(k => <option key={k} value={k}>{k}</option>)}
          </select>

          <input
            type="text"
            value={state.widgetName}
            onChange={e => dispatch({ type: 'SET_WIDGET_NAME', name: e.target.value })}
            className="input-field"
            style={{ width: 128 }}
            placeholder="Widget name…"
          />
        </div>

        <div className="flex-1" />

        {/* Group 4: History Controls */}
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={() => dispatch({ type: 'UNDO' })} disabled={state.histIndex <= 0} title="Undo (Ctrl+Z)" className="tbtn">↩</button>
          <button onClick={() => dispatch({ type: 'REDO' })} disabled={state.histIndex >= state.history.length - 1} title="Redo (Ctrl+Y)" className="tbtn">↪</button>
        </div>

        {SEP}

        {/* Group 5: Zoom Controls */}
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={zoomFit} className="tbtn" title="Fit to window">Fit</button>
          <button onClick={zoomOut} className="tbtn" style={{ width: 24, padding: 0 }}>−</button>
          <select
            value={state.zoom}
            onChange={e => dispatch({ type: 'SET_ZOOM', zoom: parseFloat(e.target.value) })}
            className="input-field"
            style={{ width: 56, textAlign: 'center' }}
          >
            {ZOOM_STEPS.map(z => <option key={z} value={z}>{Math.round(z * 100)}%</option>)}
          </select>
          <button onClick={zoomIn} className="tbtn" style={{ width: 24, padding: 0 }}>+</button>
        </div>

        {SEP}

        {/* Group 6: Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <button ref={themesButtonRef} onClick={() => setShowThemes(v => !v)} className="tbtn" title="Color Themes" style={{ borderColor: showThemes ? '#e8750a' : undefined, color: showThemes ? '#e8750a' : undefined }}>Themes</button>
          <button onClick={() => setShowPreview(true)} className="tbtn" title="Preview (P)" style={{ borderColor: showPreview ? '#e8750a' : undefined, color: showPreview ? '#e8750a' : undefined }}>Preview</button>
          <button onClick={() => window.open('/docs', '_blank')} className="tbtn" title="Documentation">?</button>
          <button onClick={() => { if (!state.tree || confirm('Clear canvas?')) dispatch({ type: 'CLEAR' }) }} className="tbtn">Clear</button>
          <button onClick={() => fileInputRef.current?.click()} className="tbtn">Import</button>
          <button onClick={() => exportJSON(state.tree, state.canvas, state.widgetName)} className="tbtn-primary">
            Export JSON
          </button>
        </div>

        <input ref={fileInputRef} type="file" accept=".json" className="hidden"
          onChange={e => { if (e.target.files?.[0]) { handleImport(e.target.files[0]); e.target.value = '' } }} />
      </header>

      {/* ── Members dropdown ─────────────────────────────────── */}
      {showMembersDropdown && (
        <div 
          ref={membersDropdownRef}
          className="fixed w-56 py-1.5 rounded-md z-50 flex flex-col gap-1 border shadow-2xl"
          style={{
            top: dropdownCoords.top + 6,
            left: Math.min(dropdownCoords.left, typeof window !== 'undefined' ? window.innerWidth - 240 : dropdownCoords.left),
            background: '#1e2229',
            borderColor: 'rgba(255,255,255,0.08)',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)'
          }}
        >
          <div className="px-3 py-1 text-[9px] font-semibold text-[#8b949e] border-b" style={{ borderColor: 'rgba(255,255,255,0.08)', letterSpacing: '0.05em' }}>
            ACTIVE MEMBERS
          </div>
          <div className="max-h-40 overflow-y-auto flex flex-col">
            {members.map(m => {
              const isSelf = m.id === memberIdRef.current
              return (
                <div key={m.id} className="flex items-center justify-between px-3 py-1.5 text-[11px] hover:bg-[rgba(255,255,255,0.02)]">
                  <div className="flex items-center gap-1.5 truncate mr-2">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: isSelf ? '#40d972' : '#8b949e' }} />
                    <span className="truncate" style={{ color: isSelf ? '#e6edf3' : '#8b949e' }}>
                      {m.name} {isSelf && '(You)'}
                    </span>
                  </div>
                  {!isSelf && isOwner && (
                    <button
                      onClick={async () => {
                        if (confirm(`Kick ${m.name} from this room?`)) {
                          try {
                            const resp = await fetch('/api/kick', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ room: roomId, memberId: m.id })
                            })
                            if (resp.ok) {
                              alert(`${m.name} kicked successfully.`);
                              setMembers(prev => prev.filter(x => x.id !== m.id))
                            }
                          } catch (err) {
                            console.error(err)
                          }
                        }
                      }}
                      className="text-[9px] px-1.5 py-0.5 rounded text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20 cursor-pointer transition-colors"
                    >
                      Kick
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Theme picker ─────────────────────────────────────── */}
      {showThemes && (
        <ThemePicker
          anchorRef={themesButtonRef}
          selectedNode={selectedNode}
          tree={state.tree}
          onApplyToWidget={node => {
            dispatch({ type: 'UPDATE_NODE', id: node.id, patch: { style: node.style, properties: node.properties } })
            setShowThemes(false)
          }}
          onApplyToTree={newTree => {
            dispatch({ type: 'SET_TREE', tree: newTree })
            dispatch({ type: 'PUSH_HISTORY', tree: newTree })
            setShowThemes(false)
          }}
          onClose={() => setShowThemes(false)}
        />
      )}

      {/* ── Preview overlay ──────────────────────────────────── */}
      {showPreview && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center"
          style={{ background: 'rgba(7,9,13,0.96)' }}
          onClick={() => setShowPreview(false)}
        >
          {/* Toolbar strip */}
          <div
            className="flex items-center gap-3 mb-4 px-4"
            style={{ height: 36, background: '#1e2229', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, flexShrink: 0 }}
            onClick={e => e.stopPropagation()}
          >
            <span style={{ fontSize: 11, color: '#484f58', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Preview</span>
            <div style={{ width: 1, height: 14, background: 'rgba(255,255,255,0.08)' }} />
            <span style={{ fontSize: 11, color: '#8b949e', fontFamily: 'monospace' }}>{state.canvas.w} × {state.canvas.h}</span>
            <div style={{ width: 1, height: 14, background: 'rgba(255,255,255,0.08)' }} />
            <span style={{ fontSize: 10, color: '#484f58' }}>Esc or click outside to close</span>
          </div>

          {/* Widget canvas */}
          {state.tree ? (() => {
            const scale = Math.min(
              (window.innerWidth  - 80) / state.canvas.w,
              (window.innerHeight - 140) / state.canvas.h,
              1,
            )
            return (
              <div
                style={{
                  width: state.canvas.w * scale,
                  height: state.canvas.h * scale,
                  boxShadow: '0 0 0 1px rgba(255,255,255,0.08), 0 24px 80px rgba(0,0,0,0.8)',
                  position: 'relative',
                  flexShrink: 0,
                }}
                onClick={e => e.stopPropagation()}
              >
                <div style={{ width: state.canvas.w, height: state.canvas.h, transformOrigin: 'top left', transform: `scale(${scale})`, overflow: 'hidden', position: 'absolute', top: 0, left: 0 }}>
                  <WidgetRenderer
                    node={state.tree}
                    parentType="__root__"
                    selectedId={null}
                    onSelect={() => {}}
                    onDrop={() => {}}
                    zoom={1}
                    interactive
                  />
                </div>
              </div>
            )
          })() : (
            <div style={{ color: '#484f58', fontSize: 13 }}>No widgets on canvas</div>
          )}
        </div>
      )}

      {/* ── Main layout ──────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left panel */}
        <aside
          className="shrink-0 flex flex-col"
          style={{ width: 240, borderRight: '1px solid rgba(255,255,255,0.08)' }}
        >
          {/* Tab strip */}
          <div className="flex shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            {(['palette', 'hierarchy'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setLeftTab(tab)}
                style={{
                  flex: 1,
                  height: 32,
                  background: 'transparent',
                  border: 'none',
                  borderBottom: leftTab === tab ? '2px solid #e8750a' : '2px solid transparent',
                  color: leftTab === tab ? '#e6edf3' : '#484f58',
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  transition: 'color 120ms, border-color 120ms',
                }}
                onMouseEnter={e => { if (leftTab !== tab) (e.target as HTMLButtonElement).style.color = '#8b949e' }}
                onMouseLeave={e => { if (leftTab !== tab) (e.target as HTMLButtonElement).style.color = '#484f58' }}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-hidden">
            {leftTab === 'palette'
              ? <Palette onAddWidget={handleAddWidget} />
              : <Hierarchy
                  tree={state.tree}
                  selectedId={state.sel}
                  expanded={state.expanded}
                  onSelect={id => dispatch({ type: 'SELECT', id })}
                  onToggleExpand={id => dispatch({ type: 'TOGGLE_EXPAND', id })}
                  onDelete={id => dispatch({ type: 'DELETE_NODE', id })}
                  onMoveUp={id => dispatch({ type: 'MOVE_NODE', id, direction: 'up' })}
                  onMoveDown={id => dispatch({ type: 'MOVE_NODE', id, direction: 'down' })}
                  onDuplicate={id => dispatch({ type: 'DUPLICATE_NODE', id })}
                  onToggleVisible={id => {
                    const n = state.tree && findNode(state.tree, id)
                    if (n) dispatch({ type: 'UPDATE_NODE', id, patch: { editorHidden: !n.editorHidden } })
                  }}
                  onToggleLock={id => {
                    const n = state.tree && findNode(state.tree, id)
                    if (n) dispatch({ type: 'UPDATE_NODE', id, patch: { editorLocked: !n.editorLocked } })
                  }}
                  onLockAll={handleLockAll}
                  onUnlockAll={handleUnlockAll}
                />
            }
          </div>
        </aside>

        {/* Canvas */}
        <Canvas
          tree={state.tree}
          selectedId={state.sel}
          canvas={state.canvas}
          zoom={state.zoom}
          panMode={tool === 'pan'}
          onSelect={id => dispatch({ type: 'SELECT', id: id ?? null })}
          onDrop={handleDrop}
          onMove={handleMove}
          onResize={handleResize}
          onRootDrop={handleRootDrop}
          onWheelZoom={dir => dir === 'in' ? zoomIn() : zoomOut()}
        />

        {/* Right panel */}
        <aside
          className="shrink-0 flex flex-col"
          style={{ width: 320, borderLeft: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div
            className="flex items-center justify-between px-3 shrink-0"
            style={{ height: 32, borderBottom: '1px solid rgba(255,255,255,0.08)' }}
          >
            <span className="section-label">Properties</span>
            {selectedNode && (
              <span style={{ fontSize: 10, color: '#e8750a', fontFamily: 'monospace' }}>{selectedNode.type}</span>
            )}
          </div>
          <div className="flex-1 overflow-hidden">
            <PropertiesPanel
              node={selectedNode ?? null}
              tree={state.tree}
              onChange={(id, patch) => dispatch({ type: 'UPDATE_NODE', id, patch })}
            />
          </div>
        </aside>
      </div>

    </div>
  )
}
