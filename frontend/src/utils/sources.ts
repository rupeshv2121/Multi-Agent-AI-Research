import type { EnrichedSource, Source } from '@/types'

/** Domains that get a credibility bump, keyed by suffix. */
const TRUSTED_SUFFIXES: Array<[string, number]> = [
  ['.edu', 24],
  ['.gov', 26],
  ['.ac.uk', 24],
  ['.org', 10],
  ['.int', 18],
]

/** Well-known primary/reference sources, matched on the registrable domain. */
const TRUSTED_DOMAINS: Record<string, number> = {
  'arxiv.org': 26,
  'nature.com': 26,
  'science.org': 26,
  'sciencedirect.com': 22,
  'springer.com': 22,
  'ieee.org': 24,
  'acm.org': 22,
  'pubmed.ncbi.nlm.nih.gov': 26,
  'nih.gov': 26,
  'who.int': 24,
  'reuters.com': 20,
  'apnews.com': 20,
  'bbc.com': 18,
  'economist.com': 16,
  'ft.com': 16,
  'nytimes.com': 14,
  'wikipedia.org': 12,
  'github.com': 12,
  'medium.com': -8,
  'reddit.com': -14,
  'quora.com': -16,
  'blogspot.com': -18,
  'wordpress.com': -14,
}

export function domainOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url.split('/')[2]?.replace(/^www\./, '') ?? url
  }
}

/** A readable site name from a domain: `arxiv.org` -> `Arxiv`. */
export function siteNameOf(domain: string): string {
  const core = domain.split('.').slice(0, -1).pop() ?? domain
  return core.charAt(0).toUpperCase() + core.slice(1)
}

/**
 * A transparent heuristic, not a real trust signal.
 *
 * The backend returns bare `{url, title}` pairs with no ranking, so the score
 * is derived from the domain alone (TLD, known publishers, HTTPS, path depth).
 * It is surfaced as a hint for skimming a long source list — the tooltip in the
 * UI says as much.
 */
export function credibilityOf(url: string): number {
  const domain = domainOf(url)
  let score = 62

  for (const [suffix, bonus] of TRUSTED_SUFFIXES) {
    if (domain.endsWith(suffix)) {
      score += bonus
      break
    }
  }

  for (const [known, delta] of Object.entries(TRUSTED_DOMAINS)) {
    if (domain === known || domain.endsWith(`.${known}`)) {
      score += delta
      break
    }
  }

  if (url.startsWith('https://')) score += 4
  // Deep permalinks tend to be specific articles rather than tag/landing pages.
  const depth = url.split('/').filter(Boolean).length - 2
  if (depth >= 2) score += 4
  if (depth === 0) score -= 6

  return Math.max(20, Math.min(99, score))
}

export function credibilityLabel(score: number): string {
  if (score >= 85) return 'High'
  if (score >= 70) return 'Good'
  if (score >= 55) return 'Moderate'
  return 'Low'
}

/**
 * A readable title from the URL path, for the common case where the pipeline
 * extracted a bare URL with no `Title:` line. Repeating the domain as the title
 * tells the reader nothing they cannot already see on the card, whereas the
 * slug usually names the article.
 */
export function titleFromUrl(url: string, domain: string): string {
  let path = ''
  try {
    path = new URL(url).pathname
  } catch {
    return domain
  }

  const slug = path
    .split('/')
    .filter(Boolean)
    // Drop trailing file extensions and pure-numeric path segments (ids, dates).
    .map((part) => part.replace(/\.(html?|php|aspx?)$/i, ''))
    .filter((part) => part && !/^\d+$/.test(part))
    .pop()

  if (!slug) return domain

  const words = decodeURIComponent(slug)
    .replace(/[-_+]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  if (words.length < 3) return domain
  return words.charAt(0).toUpperCase() + words.slice(1)
}

export function enrichSource(source: Source): EnrichedSource {
  const domain = domainOf(source.url)
  const credibility = credibilityOf(source.url)
  return {
    ...source,
    title: source.title?.trim() || titleFromUrl(source.url, domain),
    domain,
    // Google's favicon service avoids per-site CORS/404 handling.
    faviconUrl: `https://www.google.com/s2/favicons?domain=${domain}&sz=64`,
    credibility,
    credibilityLabel: credibilityLabel(credibility),
  }
}

export function enrichSources(sources: Source[]): EnrichedSource[] {
  const seen = new Set<string>()
  return sources
    .filter((s) => {
      if (seen.has(s.url)) return false
      seen.add(s.url)
      return true
    })
    .map(enrichSource)
}
