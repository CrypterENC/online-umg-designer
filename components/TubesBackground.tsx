'use client'
import React, { useEffect, useRef, useState } from 'react'

interface TubesBackgroundProps {
  children?: React.ReactNode
  className?: string
  enableClickInteraction?: boolean
  opacity?: number // 0-100, default 60 when idle, 15 when working
}

declare global {
  interface Window {
    TubesCursor?: any
  }
}

export function TubesBackground({
  children,
  className = '',
  enableClickInteraction = true,
  opacity = 60
}: TubesBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const tubesRef = useRef<any>(null)
  const [currentOpacity, setCurrentOpacity] = useState(opacity)

  useEffect(() => {
    let mounted = true
    let cleanup: (() => void) | undefined

    const initTubes = () => {
      if (!canvasRef.current || !window.TubesCursor) return

      try {
        // Load Three.js tubes with UMG Designer theme
        const TubesCursor = window.TubesCursor

        const app = TubesCursor(canvasRef.current, {
          tubes: {
            colors: ['#f28c1a', '#53bc28', '#6958d5'],
            lights: {
              intensity: 150,
              colors: ['#f28c1a', '#fe8a2e', '#ff008a', '#60aed5']
            }
          }
        })

        tubesRef.current = app
        setIsLoaded(true)

        window.addEventListener('resize', () => {
          // threejs-components handles resize automatically
        })

        cleanup = () => {
          window.removeEventListener('resize', () => {})
        }

      } catch (error) {
        console.error('Failed to initialize TubesCursor:', error)
      }
    }

    // Load script if not already loaded
    if (!window.TubesCursor) {
      const script = document.createElement('script')
      script.src = 'https://cdn.jsdelivr.net/npm/threejs-components@0.0.19/build/cursors/tubes1.min.js'
      script.async = true
      script.onload = () => {
        if (mounted) initTubes()
      }
      script.onerror = () => {
        console.warn('TubesCursor CDN load failed, tubes disabled')
      }
      document.body.appendChild(script)

      cleanup = () => {
        try {
          document.body.removeChild(script)
        } catch (e) {
          // ignore if already removed
        }
      }
    } else {
      initTubes()
    }

    return () => {
      mounted = false
      if (cleanup) cleanup()
    }
  }, [])

  const handleClick = () => {
    if (!enableClickInteraction || !tubesRef.current) return

    // Randomize colors
    const randomColor = () =>
      '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')

    const colors = [randomColor(), randomColor(), randomColor()]
    if (tubesRef.current.tubes?.setColors) {
      tubesRef.current.tubes.setColors(colors)
    }
  }

  return (
    <div
      className={`relative w-full h-full overflow-hidden bg-gradient-to-br from-[#0a0e17] via-[#0d1620] to-[#0f1419] ${className}`}
      onClick={handleClick}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block pointer-events-auto transition-opacity duration-300"
        style={{
          touchAction: 'none',
          opacity: currentOpacity / 100
        }}
      />

      {/* Content Overlay */}
      <div className="relative z-10 w-full h-full pointer-events-none">
        {children}
      </div>
    </div>
  )
}

export default TubesBackground
