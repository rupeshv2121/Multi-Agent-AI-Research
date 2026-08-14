import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { useReducedMotion } from '@/hooks/useReducedMotion'

/**
 * The ambient backdrop: three drifting colour blobs behind a fine grid, plus a
 * sparse particle field on canvas.
 *
 * GSAP drives the blobs because they are long, overlapping, infinitely
 * repeating tweens — cheaper and smoother here than keeping them in React
 * state. Everything is `pointer-events-none` and `aria-hidden`; when motion is
 * reduced the blobs are placed once and left static, and the canvas never
 * starts its loop.
 */
export function AuroraBackground() {
  const container = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    if (reduced || !container.current) return

    const context = gsap.context(() => {
      gsap.to('.aurora-blob-1', {
        x: 160,
        y: -90,
        scale: 1.18,
        duration: 18,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      })
      gsap.to('.aurora-blob-2', {
        x: -140,
        y: 110,
        scale: 0.88,
        duration: 22,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      })
      gsap.to('.aurora-blob-3', {
        x: 100,
        y: 140,
        scale: 1.25,
        duration: 26,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      })
    }, container)

    return () => context.revert()
  }, [reduced])

  useEffect(() => {
    if (reduced) return
    const element = canvas.current
    const ctx = element?.getContext('2d')
    if (!element || !ctx) return

    let frame = 0
    let width = 0
    let height = 0
    // Cap the device pixel ratio: past 2x the cost outweighs anything visible
    // for a field of blurred dots.
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    const particles: Array<{ x: number; y: number; vx: number; vy: number; r: number; a: number }> = []

    const resize = () => {
      const rect = element.getBoundingClientRect()
      width = rect.width
      height = rect.height
      element.width = width * dpr
      element.height = height * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      // Scale count with area so a large monitor is not sparse and a phone is
      // not overloaded.
      const target = Math.min(70, Math.round((width * height) / 26_000))
      particles.length = 0
      for (let i = 0; i < target; i += 1) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.16,
          vy: (Math.random() - 0.5) * 0.16,
          r: Math.random() * 1.6 + 0.4,
          a: Math.random() * 0.4 + 0.12,
        })
      }
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height)
      for (const particle of particles) {
        particle.x += particle.vx
        particle.y += particle.vy
        // Wrap rather than bounce, so there is no visible edge rhythm.
        if (particle.x < -10) particle.x = width + 10
        if (particle.x > width + 10) particle.x = -10
        if (particle.y < -10) particle.y = height + 10
        if (particle.y > height + 10) particle.y = -10

        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,255,255,${particle.a})`
        ctx.fill()
      }
      frame = requestAnimationFrame(draw)
    }

    resize()
    draw()

    const observer = new ResizeObserver(resize)
    observer.observe(element)

    // Pause entirely in a background tab.
    const onVisibility = () => {
      if (document.hidden) cancelAnimationFrame(frame)
      else frame = requestAnimationFrame(draw)
    }
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [reduced])

  return (
    <div ref={container} className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
      <div className="absolute inset-0 bg-canvas" />

      <div className="aurora-blob-1 absolute -left-40 -top-40 h-[560px] w-[560px] rounded-full bg-accent-blue/[0.13] blur-[120px]" />
      <div className="aurora-blob-2 absolute -right-32 top-1/4 h-[520px] w-[520px] rounded-full bg-accent-purple/[0.12] blur-[130px]" />
      <div className="aurora-blob-3 absolute -bottom-48 left-1/3 h-[600px] w-[600px] rounded-full bg-accent-cyan/[0.09] blur-[140px]" />

      {/* Fine grid, faded out toward the edges so it never reads as a border. */}
      <div
        className="absolute inset-0 opacity-[0.55]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.022) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.022) 1px, transparent 1px)',
          backgroundSize: '56px 56px',
          maskImage: 'radial-gradient(ellipse 90% 70% at 50% 40%, #000 40%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 90% 70% at 50% 40%, #000 40%, transparent 100%)',
        }}
      />

      <canvas ref={canvas} className="absolute inset-0 h-full w-full" />

      {/* Vignette to seat the content above the field. */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(9,9,11,0.7)_100%)]" />
    </div>
  )
}
