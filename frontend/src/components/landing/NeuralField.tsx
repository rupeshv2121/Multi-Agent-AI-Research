import { useEffect, useRef } from 'react'
import { useReducedMotion } from '@/hooks/useReducedMotion'

interface Node {
  x: number
  y: number
  vx: number
  vy: number
  r: number
  hue: number
}

/**
 * The hero's neural-network backdrop: drifting nodes joined by lines that fade
 * with distance, and brighten near the pointer.
 *
 * Canvas rather than React Three Fiber on purpose — R3F plus three.js is ~600KB
 * gzipped to draw something this page renders in a few hundred lines with no
 * dependency and a much lower power draw on laptops. Everything here is
 * decorative and `aria-hidden`; the effect never starts under reduced motion.
 */
export function NeuralField({ className }: { className?: string }) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    if (reduced) return
    const element = canvas.current
    const ctx = element?.getContext('2d')
    if (!element || !ctx) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let width = 0
    let height = 0
    let frame = 0
    let nodes: Node[] = []

    // Pointer lives in a ref-like local, never React state — this runs at 60fps.
    const pointer = { x: -9999, y: -9999 }
    const LINK_DISTANCE = 132
    const POINTER_RADIUS = 190

    const resize = () => {
      const rect = element.getBoundingClientRect()
      width = rect.width
      height = rect.height
      element.width = width * dpr
      element.height = height * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      // Density scales with area but is capped: past ~90 nodes the link pass is
      // O(n²) enough to show up on mid-range hardware.
      const count = Math.min(90, Math.max(28, Math.round((width * height) / 15_000)))
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
        r: Math.random() * 1.5 + 0.9,
        // Blue -> purple -> cyan, matching the accent ramp.
        hue: [212, 262, 189][Math.floor(Math.random() * 3)],
      }))
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height)

      for (const node of nodes) {
        node.x += node.vx
        node.y += node.vy
        if (node.x < -20) node.x = width + 20
        if (node.x > width + 20) node.x = -20
        if (node.y < -20) node.y = height + 20
        if (node.y > height + 20) node.y = -20
      }

      // Links first, so nodes sit on top of them.
      for (let i = 0; i < nodes.length; i += 1) {
        const a = nodes[i]
        for (let j = i + 1; j < nodes.length; j += 1) {
          const b = nodes[j]
          const dx = a.x - b.x
          const dy = a.y - b.y
          const distance = Math.hypot(dx, dy)
          if (distance > LINK_DISTANCE) continue

          // Fade with distance, then lift the whole link near the pointer.
          let alpha = (1 - distance / LINK_DISTANCE) * 0.19
          const midX = (a.x + b.x) / 2
          const midY = (a.y + b.y) / 2
          const toPointer = Math.hypot(midX - pointer.x, midY - pointer.y)
          if (toPointer < POINTER_RADIUS) {
            alpha += (1 - toPointer / POINTER_RADIUS) * 0.42
          }

          ctx.beginPath()
          ctx.moveTo(a.x, a.y)
          ctx.lineTo(b.x, b.y)
          ctx.strokeStyle = `hsla(${a.hue}, 90%, 68%, ${alpha})`
          ctx.lineWidth = 0.7
          ctx.stroke()
        }
      }

      for (const node of nodes) {
        const toPointer = Math.hypot(node.x - pointer.x, node.y - pointer.y)
        const boost = toPointer < POINTER_RADIUS ? (1 - toPointer / POINTER_RADIUS) * 0.7 : 0

        ctx.beginPath()
        ctx.arc(node.x, node.y, node.r + boost * 1.6, 0, Math.PI * 2)
        ctx.fillStyle = `hsla(${node.hue}, 92%, 72%, ${0.42 + boost * 0.5})`
        ctx.fill()
      }

      frame = requestAnimationFrame(draw)
    }

    const onPointerMove = (event: PointerEvent) => {
      const rect = element.getBoundingClientRect()
      pointer.x = event.clientX - rect.left
      pointer.y = event.clientY - rect.top
    }
    const onPointerLeave = () => {
      pointer.x = -9999
      pointer.y = -9999
    }

    resize()
    draw()

    const observer = new ResizeObserver(resize)
    observer.observe(element)
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('pointerleave', onPointerLeave)

    // Do not burn a core animating a tab nobody is looking at.
    const onVisibility = () => {
      cancelAnimationFrame(frame)
      if (!document.hidden) frame = requestAnimationFrame(draw)
    }
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerleave', onPointerLeave)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [reduced])

  return <canvas ref={canvas} className={className} aria-hidden />
}
