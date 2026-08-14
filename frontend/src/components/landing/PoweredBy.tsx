import { POWERED_BY } from '@/content/product'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { cn } from '@/utils/cn'

/**
 * An infinite marquee of the technologies this project actually runs on.
 *
 * Deliberately *not* a "trusted by" customer logo wall: putting real company
 * marks under that heading would claim endorsements that do not exist. Naming
 * the real stack is true, and reads just as well.
 *
 * The track is duplicated and translated by exactly -50%, so the second copy
 * lands where the first began and the loop has no visible seam.
 */
export function PoweredBy() {
  const reduced = useReducedMotion()
  const items = [...POWERED_BY, ...POWERED_BY]

  return (
    <section className="relative border-y border-hairline bg-surface-sunken/30 py-10" aria-label="Built with">
      <p className="mb-6 text-center text-[11px] font-medium uppercase tracking-[0.18em] text-ink-faint">
        Built with
      </p>

      <div
        className="relative overflow-hidden"
        style={{
          maskImage: 'linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)',
          WebkitMaskImage: 'linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)',
        }}
      >
        <div
          className={cn('flex w-max items-center gap-12 px-6', !reduced && 'animate-marquee')}
          // Pausing on hover lets someone actually read a name they noticed.
          onMouseEnter={(event) => (event.currentTarget.style.animationPlayState = 'paused')}
          onMouseLeave={(event) => (event.currentTarget.style.animationPlayState = 'running')}
        >
          {items.map((name, index) => (
            <span
              key={`${name}-${index}`}
              className="shrink-0 font-display text-lg font-semibold tracking-tight text-ink-faint transition-colors duration-300 hover:text-ink"
              // The duplicate half is decorative repetition, not new content.
              aria-hidden={index >= POWERED_BY.length}
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
