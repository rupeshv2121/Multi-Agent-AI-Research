import { motion } from 'framer-motion'
import { ArrowRight, BookOpenCheck, PenLine, Search, ShieldQuestion, type LucideIcon } from 'lucide-react'
import { Logo } from '@/components/common/Logo'
import { Card } from '@/components/common/Card'
import { useResearchStore } from '@/store/researchStore'
import { stagger, fadeUp } from '@/animations/variants'

const PROMPTS = [
  {
    title: 'Compare two technologies',
    prompt: 'Compare solid-state and lithium-ion batteries for electric vehicles in 2026',
  },
  {
    title: 'Survey recent research',
    prompt: 'What are the most significant results in protein folding prediction this year?',
  },
  {
    title: 'Explain a policy change',
    prompt: 'What does the EU AI Act require of general-purpose model providers, and when?',
  },
  {
    title: 'Assess the evidence',
    prompt: 'What does current clinical evidence say about GLP-1 drugs for weight maintenance?',
  },
]

const AGENT_ICONS: Record<string, LucideIcon> = {
  search: Search,
  read: BookOpenCheck,
  write: PenLine,
  critique: ShieldQuestion,
}

/** The empty state: what the system does, and four ways to start. */
export function WelcomeScreen() {
  const submit = useResearchStore((s) => s.submit)
  const agents = useResearchStore((s) => s.agents)

  return (
    <motion.div
      variants={stagger(0.07)}
      initial="hidden"
      animate="visible"
      className="mx-auto flex w-full max-w-3xl flex-col items-center px-4 py-10 text-center"
    >
      <motion.div variants={fadeUp} className="relative mb-6">
        <div className="absolute inset-0 scale-150 rounded-full bg-accent-blue/20 blur-3xl" aria-hidden />
        <Logo className="relative h-14 w-14 rounded-2xl" />
      </motion.div>

      <motion.h1 variants={fadeUp} className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
        What should the <span className="text-gradient">agents</span> research?
      </motion.h1>

      <motion.p variants={fadeUp} className="mt-3 max-w-lg text-balance text-sm leading-relaxed text-ink-muted">
        Give it a topic and a chain of specialised agents will search the web, read the best sources,
        write a structured report, and critique its own work — all visible as it happens.
      </motion.p>

      {/* The real pipeline, named. */}
      <motion.div variants={fadeUp} className="mt-8 flex flex-wrap items-center justify-center gap-2">
        {agents.map((agent, index) => {
          const Icon = AGENT_ICONS[agent.id] ?? Search
          return (
            <div key={agent.id} className="flex items-center gap-2">
              <span className="flex items-center gap-2 rounded-full border border-hairline bg-white/[0.04] px-3 py-1.5 text-[11px] font-medium">
                <Icon className="h-3 w-3 text-accent-blue" />
                {agent.name}
              </span>
              {index < agents.length - 1 && <ArrowRight className="h-3 w-3 text-ink-faint" />}
            </div>
          )
        })}
      </motion.div>

      <motion.div variants={fadeUp} className="mt-10 grid w-full gap-2.5 sm:grid-cols-2">
        {PROMPTS.map((item) => (
          <Card
            key={item.title}
            interactive
            spotlight
            className="cursor-pointer p-4 text-left"
            onClick={() => void submit(item.prompt)}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                void submit(item.prompt)
              }
            }}
          >
            <p className="text-[11px] font-semibold uppercase tracking-wide text-accent-blue">{item.title}</p>
            <p className="mt-1.5 text-[13px] leading-relaxed text-ink-muted">{item.prompt}</p>
          </Card>
        ))}
      </motion.div>
    </motion.div>
  )
}
