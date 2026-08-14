import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, ArrowUp, PlayCircle, Sparkles } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { NeuralField } from './NeuralField'
import { AGENTS } from '@/content/product'
import { useResearchStore } from '@/store/researchStore'
import { useReducedMotion } from '@/hooks/useReducedMotion'

const ROTATING = ['search the web.', 'read the sources.', 'write the report.', 'critique the result.']

/**
 * The hero.
 *
 * The input is not a decorative mock — typing a topic and submitting starts a
 * real run and hands off to the workspace, so the first interaction on the page
 * is the product itself.
 */
export function Hero() {
  const [topic, setTopic] = useState('')
  const [wordIndex, setWordIndex] = useState(0)
  const container = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const reduced = useReducedMotion()
  const submit = useResearchStore((s) => s.submit)

  // Parallax: the copy drifts up and fades as the next section arrives.
  const { scrollYProgress } = useScroll({ target: container, offset: ['start start', 'end start'] })
  const contentY = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : 120])
  const contentOpacity = useTransform(scrollYProgress, [0, 0.8], [1, reduced ? 1 : 0])

  useEffect(() => {
    if (reduced) return
    const timer = window.setInterval(() => setWordIndex((index) => (index + 1) % ROTATING.length), 2600)
    return () => window.clearInterval(timer)
  }, [reduced])

  const start = () => {
    const trimmed = topic.trim()
    navigate('/app')
    // Let the workspace mount before the stream starts writing into it.
    if (trimmed) window.setTimeout(() => void submit(trimmed), 80)
  }

  return (
    <div ref={container} className="relative min-h-[100svh] overflow-hidden">
      {/* Backdrop layers */}
      <div className="absolute inset-0" aria-hidden>
        <div className="absolute inset-0 bg-canvas" />

        <div className="absolute -left-40 top-[-15%] h-[620px] w-[620px] animate-float rounded-full bg-accent-blue/[0.16] blur-[130px]" />
        <div
          className="absolute -right-32 top-[8%] h-[560px] w-[560px] animate-float rounded-full bg-accent-purple/[0.15] blur-[140px]"
          style={{ animationDelay: '-3s' }}
        />
        <div
          className="absolute bottom-[-25%] left-1/3 h-[600px] w-[600px] animate-float rounded-full bg-accent-cyan/[0.11] blur-[150px]"
          style={{ animationDelay: '-6s' }}
        />

        <NeuralField className="absolute inset-0 h-full w-full" />

        {/* Grid, masked to the centre so it never reads as a hard edge. */}
        <div
          className="absolute inset-0 opacity-60"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
            maskImage: 'radial-gradient(ellipse 80% 60% at 50% 45%, #000 30%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 45%, #000 30%, transparent 100%)',
          }}
        />

        {/* Noise, for a bit of grain over the gradients. */}
        <div
          className="absolute inset-0 opacity-[0.16] mix-blend-overlay"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")",
          }}
        />

        {/* Fade into the section below. */}
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-canvas" />
      </div>

      {/* Content */}
      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="relative mx-auto flex min-h-[100svh] w-full max-w-4xl flex-col items-center justify-center px-5 pb-24 pt-28 text-center sm:px-8"
      >
        <motion.a
          href="#how-it-works"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="group mb-7 inline-flex items-center gap-2 rounded-full border border-hairline bg-white/[0.04] py-1.5 pl-2 pr-3.5 text-[12px] backdrop-blur-xl transition-colors hover:border-white/20"
        >
          <span className="rounded-full bg-gradient-accent px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
            New
          </span>
          <span className="text-ink-muted transition-colors group-hover:text-ink">
            Four agents, one research run
          </span>
          <ArrowRight className="h-3 w-3 text-ink-faint transition-transform group-hover:translate-x-0.5" />
        </motion.a>

        <motion.h1
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="text-balance font-display text-[2.6rem] font-semibold leading-[1.06] tracking-tight sm:text-6xl md:text-[4.2rem]"
        >
          Research smarter.
          <br />
          Let AI agents{' '}
          {/* The rotating clause is decorative; a screen reader gets the static
              phrase instead of a word that changes underneath it. */}
          <span className="relative inline-block align-top" aria-hidden>
            <motion.span
              key={wordIndex}
              initial={reduced ? false : { opacity: 0, y: 18, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="text-gradient inline-block animate-gradient-pan"
            >
              {ROTATING[wordIndex]}
            </motion.span>
          </span>
          <span className="sr-only">do the work.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-6 max-w-xl text-balance text-[15px] leading-relaxed text-ink-muted sm:text-lg"
        >
          A research workspace where specialised agents collaborate to search, read, synthesise and
          critique — and you watch every step happen, live.
        </motion.p>

        {/* Working input */}
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-9 w-full max-w-xl"
        >
          <div className="gradient-border group relative rounded-2xl bg-surface/60 p-1.5 shadow-lift backdrop-blur-2xl">
            <div className="flex items-center gap-2">
              <Sparkles className="ml-3 h-4 w-4 shrink-0 text-accent-blue" aria-hidden />
              <label htmlFor="hero-topic" className="sr-only">
                Research topic
              </label>
              <input
                id="hero-topic"
                value={topic}
                onChange={(event) => setTopic(event.target.value.slice(0, 500))}
                onKeyDown={(event) => event.key === 'Enter' && start()}
                placeholder="What should the agents research?"
                className="h-11 flex-1 bg-transparent text-[15px] outline-none placeholder:text-ink-faint"
              />
              <Button variant="primary" size="sm" onClick={start} className="shrink-0" magnetic>
                <span className="hidden sm:inline">Research</span>
                <ArrowUp className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          <p className="mt-2.5 text-[11px] text-ink-faint">
            Runs on your own Groq and Tavily keys · Nothing is stored on a server
          </p>
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.38 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-3"
        >
          <Button variant="primary" size="lg" magnetic onClick={() => navigate('/app')}>
            Start research
            <ArrowRight className="h-4 w-4" />
          </Button>
          <a href="#demo">
            <Button variant="outline" size="lg" magnetic>
              <PlayCircle className="h-4 w-4" />
              Watch it work
            </Button>
          </a>
        </motion.div>

        {/* The real pipeline, named */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-x-2 gap-y-2"
        >
          {AGENTS.map((agent, index) => (
            <div key={agent.id} className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 rounded-full border border-hairline bg-white/[0.03] px-2.5 py-1 text-[11px] font-medium backdrop-blur-xl">
                <agent.icon className={`h-3 w-3 ${agent.tone}`} aria-hidden />
                {agent.name}
              </span>
              {index < AGENTS.length - 1 && (
                <ArrowRight className="h-3 w-3 shrink-0 text-ink-faint/60" aria-hidden />
              )}
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll cue */}
      <motion.div
        className="absolute inset-x-0 bottom-7 flex justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1, duration: 0.8 }}
        aria-hidden
      >
        <div className="flex h-9 w-5 items-start justify-center rounded-full border border-white/15 p-1">
          <motion.span
            className="h-1.5 w-1 rounded-full bg-white/50"
            animate={reduced ? undefined : { y: [0, 12, 0], opacity: [1, 0.2, 1] }}
            transition={{ duration: 1.9, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
      </motion.div>
    </div>
  )
}
