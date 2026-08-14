import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { GithubIcon } from './BrandIcons'
import { Reveal } from './Section'
import { Button } from '@/components/common/Button'
import { useReducedMotion } from '@/hooks/useReducedMotion'

export function FinalCTA() {
  const reduced = useReducedMotion()

  return (
    <section className="relative overflow-hidden py-24 sm:py-32">
      {/* Aurora backdrop */}
      <div className="absolute inset-0" aria-hidden>
        <div className="absolute left-1/2 top-1/2 h-[560px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-primary/[0.14] blur-[130px]" />
        <div
          className="absolute left-1/3 top-1/3 h-[420px] w-[560px] animate-float rounded-full bg-accent-secondary/[0.14] blur-[120px]"
          style={{ animationDelay: '-2s' }}
        />
        <div
          className="absolute right-1/4 bottom-1/4 h-[380px] w-[500px] animate-float rounded-full bg-accent-tertiary/[0.11] blur-[120px]"
          style={{ animationDelay: '-5s' }}
        />

        {/* Drifting motes. Fixed offsets, so they do not reshuffle each render. */}
        {!reduced &&
          Array.from({ length: 14 }, (_, index) => (
            <motion.span
              key={index}
              className="absolute h-1 w-1 rounded-full bg-white/40"
              style={{ left: `${(index * 37) % 100}%`, top: `${(index * 53) % 100}%` }}
              animate={{ y: [0, -28, 0], opacity: [0.15, 0.65, 0.15] }}
              transition={{
                duration: 5 + (index % 5),
                repeat: Infinity,
                delay: index * 0.35,
                ease: 'easeInOut',
              }}
            />
          ))}
      </div>

      <Reveal className="relative mx-auto max-w-3xl px-5 text-center sm:px-8">
        <h2 className="text-balance font-display text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl md:text-[3.4rem]">
          Ready to supercharge
          <br className="hidden sm:block" /> your <span className="text-gradient animate-gradient-pan">research</span>?
        </h2>

        <p className="mx-auto mt-5 max-w-xl text-balance text-[15px] leading-relaxed text-ink-muted sm:text-base">
          Clone the repository, add your Groq and Tavily keys, and run your first four-agent research
          pass in under five minutes.
        </p>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Link to="/app">
            <Button variant="primary" size="lg" magnetic>
              Start researching
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <a href="https://github.com" target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="lg" magnetic>
              <GithubIcon className="h-4 w-4" />
              View the source
            </Button>
          </a>
        </div>

        <p className="mt-6 text-[11px] text-ink-faint">
          Free and open source · Runs on your own API keys · No account required
        </p>
      </Reveal>
    </section>
  )
}
