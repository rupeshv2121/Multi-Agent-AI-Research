import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Check } from 'lucide-react'
import { GithubIcon, LinkedinIcon, TwitterIcon } from './BrandIcons'
import { toast } from 'sonner'
import { Logo } from '@/components/common/Logo'
import { cn } from '@/utils/cn'

const COLUMNS: Array<{ heading: string; links: Array<{ label: string; to: string; external?: boolean }> }> = [
  {
    heading: 'Product',
    links: [
      { label: 'Features', to: '#features' },
      { label: 'How it works', to: '#how-it-works' },
      { label: 'The pipeline', to: '#agents' },
      { label: 'Pricing', to: '#pricing' },
      { label: 'Live demo', to: '#demo' },
    ],
  },
  {
    heading: 'Workspace',
    links: [
      { label: 'Start research', to: '/app' },
      { label: 'Dashboard', to: '/app/dashboard' },
      { label: 'Library', to: '/app/library' },
      { label: 'Settings', to: '/app/settings' },
    ],
  },
  {
    heading: 'Developers',
    links: [
      { label: 'API docs', to: '/api/docs', external: true },
      { label: 'Source code', to: 'https://github.com', external: true },
      { label: 'FAQ', to: '#faq' },
    ],
  },
]

const SOCIAL = [
  { label: 'GitHub', href: 'https://github.com', icon: GithubIcon },
  { label: 'LinkedIn', href: 'https://linkedin.com', icon: LinkedinIcon },
  { label: 'Twitter', href: 'https://twitter.com', icon: TwitterIcon },
]

export function Footer() {
  return (
    <footer className="relative border-t border-hairline bg-surface-sunken/40">
      <div className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_2fr]">
          {/* Brand + newsletter */}
          <div>
            <Link to="/" className="flex items-center gap-2.5" aria-label="Multi-Agent AI Research, home">
              <Logo className="h-8 w-8" animated={false} />
              <span className="font-display text-[15px] font-semibold tracking-tight">Multi-Agent</span>
            </Link>

            <p className="mt-4 max-w-xs text-[13px] leading-relaxed text-ink-muted">
              An open-source research workspace where four specialised agents search, read, write and
              critique — with every step visible as it runs.
            </p>

            <Newsletter />

            <div className="mt-6 flex gap-2">
              {SOCIAL.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={item.label}
                  className="grid h-9 w-9 place-items-center rounded-xl border border-hairline text-ink-faint transition-colors hover:border-white/20 hover:text-ink"
                >
                  <item.icon className="h-3.5 w-3.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {COLUMNS.map((column) => (
              <div key={column.heading}>
                <h3 className="mb-3.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-faint">
                  {column.heading}
                </h3>
                <ul className="space-y-2.5">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      {link.external || link.to.startsWith('#') ? (
                        <a
                          href={link.to}
                          {...(link.external
                            ? { target: '_blank', rel: 'noopener noreferrer' }
                            : {})}
                          className="group inline-flex text-[13px] text-ink-muted transition-colors hover:text-ink"
                        >
                          <span className="relative">
                            {link.label}
                            <span className="absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-accent-blue transition-transform duration-300 group-hover:scale-x-100" />
                          </span>
                        </a>
                      ) : (
                        <Link
                          to={link.to}
                          className="group inline-flex text-[13px] text-ink-muted transition-colors hover:text-ink"
                        >
                          <span className="relative">
                            {link.label}
                            <span className="absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-accent-blue transition-transform duration-300 group-hover:scale-x-100" />
                          </span>
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-hairline pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[11px] text-ink-faint">
            © {new Date().getFullYear()} Multi-Agent AI Research. Open source.
          </p>
          <p className="text-[11px] text-ink-faint">
            Reports are AI-generated — check the sources before relying on them.
          </p>
        </div>
      </div>
    </footer>
  )
}

/**
 * Newsletter form.
 *
 * There is no mailing list behind this. Rather than pretend a subscription
 * happened, submitting says plainly that the form is not wired up — a fake
 * "You're subscribed!" would be a lie the visitor acts on.
 */
function Newsletter() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!email.trim()) return
    setSubmitted(true)
    toast.info('This form is not connected to a mailing list yet.')
    window.setTimeout(() => setSubmitted(false), 2600)
  }

  return (
    <form onSubmit={submit} className="mt-6">
      <label htmlFor="newsletter-email" className="mb-2 block text-[11px] font-medium text-ink-muted">
        Get notified about new agent stages
      </label>

      <div
        className={cn(
          'flex items-center gap-1 rounded-xl border bg-white/[0.03] p-1 transition-colors',
          'focus-within:border-accent-blue/40 border-hairline',
        )}
      >
        <input
          id="newsletter-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          className="h-9 min-w-0 flex-1 bg-transparent px-3 text-[13px] outline-none placeholder:text-ink-faint"
        />
        <motion.button
          type="submit"
          whileTap={{ scale: 0.94 }}
          aria-label="Subscribe"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gradient-accent text-white"
        >
          {submitted ? <Check className="h-3.5 w-3.5" /> : <ArrowRight className="h-3.5 w-3.5" />}
        </motion.button>
      </div>
    </form>
  )
}
