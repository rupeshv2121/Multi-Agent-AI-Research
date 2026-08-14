import { useEffect } from 'react'
import { Navbar } from '@/components/landing/Navbar'
import { Hero } from '@/components/landing/Hero'
import { PoweredBy } from '@/components/landing/PoweredBy'
import { Features } from '@/components/landing/Features'
import { Workflow } from '@/components/landing/Workflow'
import { AgentConstellation } from '@/components/landing/AgentConstellation'
import { Showcase } from '@/components/landing/Showcase'
import { Comparison } from '@/components/landing/Comparison'
import { Metrics } from '@/components/landing/Metrics'
import { LiveDemo } from '@/components/landing/LiveDemo'
import { Testimonials } from '@/components/landing/Testimonials'
import { Pricing } from '@/components/landing/Pricing'
import { FAQ } from '@/components/landing/FAQ'
import { FinalCTA } from '@/components/landing/FinalCTA'
import { Footer } from '@/components/landing/Footer'
import { CursorGlow } from '@/components/common/CursorGlow'
import { useSmoothScroll } from '@/hooks/useSmoothScroll'

export default function LandingPage() {
  useSmoothScroll()

  // Arriving from the workspace can leave the document mid-page.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="relative min-h-screen bg-canvas">
      <CursorGlow />

      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-surface-raised focus:px-3 focus:py-2 focus:text-sm"
      >
        Skip to content
      </a>

      <Navbar />

      <main id="main" className="relative">
        <Hero />
        <PoweredBy />
        <Features />
        <Workflow />
        <AgentConstellation />
        <Showcase />
        <LiveDemo />
        <Comparison />
        <Metrics />
        <Testimonials />
        <Pricing />
        <FAQ />
        <FinalCTA />
      </main>

      <Footer />
    </div>
  )
}
