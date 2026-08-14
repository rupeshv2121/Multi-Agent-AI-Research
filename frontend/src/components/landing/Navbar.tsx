import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, Menu, X } from 'lucide-react'
import { GithubIcon } from './BrandIcons'
import { cn } from '@/utils/cn'
import { Logo } from '@/components/common/Logo'
import { Button } from '@/components/common/Button'

const LINKS = [
  { href: '#features', label: 'Features' },
  { href: '#how-it-works', label: 'How it works' },
  { href: '#showcase', label: 'Product' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#faq', label: 'FAQ' },
]

/**
 * Sticky navigation that only grows its glass background once the page has
 * scrolled — over the hero it stays transparent so nothing competes with the
 * headline.
 */
export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close the mobile sheet when the viewport grows past it.
  useEffect(() => {
    const query = window.matchMedia('(min-width: 768px)')
    const handler = (event: MediaQueryListEvent) => event.matches && setMenuOpen(false)
    query.addEventListener('change', handler)
    return () => query.removeEventListener('change', handler)
  }, [])

  return (
    <>
      <motion.header
        className={cn(
          'fixed inset-x-0 top-0 z-50 transition-all duration-500',
          scrolled ? 'border-b border-hairline bg-canvas/70 backdrop-blur-2xl' : 'border-b border-transparent',
        )}
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <nav
          className="mx-auto flex h-16 w-full max-w-6xl items-center gap-6 px-5 sm:px-8"
          aria-label="Main navigation"
        >
          <Link to="/" className="flex shrink-0 items-center gap-2.5" aria-label="Multi-Agent AI Research, home">
            <Logo className="h-8 w-8" />
            <span className="hidden font-display text-[15px] font-semibold tracking-tight sm:block">
              Multi-Agent
            </span>
          </Link>

          <div className="hidden flex-1 items-center justify-center gap-1 md:flex">
            {LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="group relative rounded-lg px-3 py-2 text-[13px] text-ink-muted transition-colors hover:text-ink"
              >
                {link.label}
                <span className="absolute inset-x-3 bottom-1 h-px origin-left scale-x-0 bg-gradient-accent transition-transform duration-300 group-hover:scale-x-100" />
              </a>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-2 md:ml-0">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View the source on GitHub"
              className="hidden h-9 w-9 place-items-center rounded-xl text-ink-muted transition-colors hover:bg-white/[0.06] hover:text-ink sm:grid"
            >
              <GithubIcon className="h-4 w-4" />
            </a>

            <Link to="/app" className="hidden sm:block">
              <Button variant="primary" size="sm" magnetic>
                Start research
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>

            <button
              onClick={() => setMenuOpen((open) => !open)}
              className="grid h-9 w-9 place-items-center rounded-xl text-ink-muted transition-colors hover:bg-white/[0.06] hover:text-ink md:hidden"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </nav>
      </motion.header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="fixed inset-x-0 top-16 z-40 border-b border-hairline bg-canvas/95 backdrop-blur-2xl md:hidden"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="space-y-1 px-5 py-4">
              {LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-xl px-3 py-2.5 text-sm text-ink-muted transition-colors hover:bg-white/[0.05] hover:text-ink"
                >
                  {link.label}
                </a>
              ))}
              <Link to="/app" onClick={() => setMenuOpen(false)} className="block pt-2">
                <Button variant="primary" size="md" className="w-full">
                  Start research
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
