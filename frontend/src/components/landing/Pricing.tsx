import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Check, Sparkles } from 'lucide-react'
import { Reveal, Section, SectionHeading } from './Section'
import { Button } from '@/components/common/Button'
import { IS_PLACEHOLDER_CONTENT, PLANS } from '@/content/placeholders'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { cn } from '@/utils/cn'

/**
 * Pricing tiers.
 *
 * The tiers come from `content/placeholders.ts`; the project has no billing
 * today, which the note below the grid states rather than implying a checkout
 * exists. Only the free tier links anywhere real — the paid CTAs are inert
 * buttons rather than links to a page that does not exist.
 */
export function Pricing() {
  return (
    <Section id="pricing">
      <SectionHeading
        eyebrow="Pricing"
        title="Start free, on your own machine"
        description="The pipeline is open source and runs locally with your own API keys. The hosted tiers below are indicative."
      />

      <div className="grid items-start gap-4 lg:grid-cols-3">
        {PLANS.map((plan, index) => (
          <Reveal key={plan.name} delay={index * 0.08}>
            <PlanCard plan={plan} />
          </Reveal>
        ))}
      </div>

      {IS_PLACEHOLDER_CONTENT && (
        <Reveal delay={0.3}>
          <p className="mt-8 text-center text-[11px] text-ink-faint/70">
            The Starter tier is real — clone the repository and run it. Professional and Enterprise are
            placeholder tiers with no billing behind them; edit or remove them in{' '}
            <code className="rounded bg-white/[0.05] px-1 py-0.5 font-mono">
              src/content/placeholders.ts
            </code>
            .
          </p>
        </Reveal>
      )}
    </Section>
  )
}

function PlanCard({ plan }: { plan: (typeof PLANS)[number] }) {
  const reduced = useReducedMotion()
  const isFree = plan.price === 'Free'

  return (
    <motion.div
      animate={plan.featured && !reduced ? { y: [0, -8, 0] } : { y: 0 }}
      transition={{ duration: 6, repeat: plan.featured && !reduced ? Infinity : 0, ease: 'easeInOut' }}
      whileHover={reduced ? undefined : { y: plan.featured ? -12 : -6 }}
      className={cn(
        'relative flex h-full flex-col rounded-[24px] border p-6 backdrop-blur-2xl',
        plan.featured
          ? 'gradient-border border-transparent bg-surface/70 shadow-glow-purple'
          : 'border-hairline bg-surface/40',
      )}
    >
      {plan.featured && (
        <>
          <span
            className="pointer-events-none absolute -inset-6 -z-10 rounded-[36px] bg-accent-purple/20 blur-[50px]"
            aria-hidden
          />
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-accent px-3 py-1 text-[10px] font-semibold uppercase tracking-wider">
            Most popular
          </span>
        </>
      )}

      <div className="mb-5">
        <h3 className="flex items-center gap-2 font-display text-lg font-semibold tracking-tight">
          {plan.name}
          {plan.featured && <Sparkles className="h-3.5 w-3.5 text-accent-purple" aria-hidden />}
        </h3>
        <p className="mt-1.5 text-[12px] leading-relaxed text-ink-muted">{plan.description}</p>
      </div>

      <p className="mb-6 flex items-baseline gap-1.5">
        <span
          className={cn(
            'font-display text-4xl font-semibold tracking-tight',
            plan.featured && 'text-gradient',
          )}
        >
          {plan.price}
        </span>
        <span className="text-[12px] text-ink-faint">{plan.cadence}</span>
      </p>

      <ul className="mb-7 flex-1 space-y-2.5">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5 text-[13px]">
            <span
              className={cn(
                'mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full',
                plan.featured ? 'bg-accent-purple/20 text-accent-purple' : 'bg-white/[0.06] text-ink-muted',
              )}
            >
              <Check className="h-2.5 w-2.5" aria-hidden />
            </span>
            <span className="text-ink-muted">{feature}</span>
          </li>
        ))}
      </ul>

      {isFree ? (
        <Link to="/app" className="block">
          <Button variant={plan.featured ? 'primary' : 'secondary'} size="md" className="w-full" magnetic>
            {plan.cta}
          </Button>
        </Link>
      ) : (
        <Button
          variant={plan.featured ? 'primary' : 'secondary'}
          size="md"
          className="w-full"
          magnetic
          // No checkout exists; the button is deliberately non-navigating.
          title="Placeholder tier — no billing is wired up"
        >
          {plan.cta}
        </Button>
      )}
    </motion.div>
  )
}
