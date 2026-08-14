/**
 * Factual product content.
 *
 * Unlike `placeholders.ts`, everything here describes what the software
 * actually does — the four pipeline stages from `backend/pipeline.py`, the real
 * dependencies, and features that exist in the workspace. Keep it that way:
 * anything aspirational belongs in the roadmap, not on the page.
 */

import {
  BarChart3,
  BookOpenCheck,
  Braces,
  Clock,
  Download,
  FileSearch,
  Gauge,
  GitBranch,
  Globe,
  Keyboard,
  PenLine,
  Quote,
  Radio,
  Search,
  ShieldQuestion,
  Table2,
  type LucideIcon,
} from 'lucide-react'

/* -------------------------------------------------------------------------- */
/*  The real pipeline — mirrors STEPS in backend/pipeline.py                  */
/* -------------------------------------------------------------------------- */

export interface AgentSpec {
  id: string
  name: string
  role: string
  detail: string
  icon: LucideIcon
  /** Tailwind text colour used for the node's accent. */
  tone: string
}

export const AGENTS: AgentSpec[] = [
  {
    id: 'search',
    name: 'Scout',
    role: 'Searches the web for reliable, recent sources',
    detail:
      'Queries a live web index and collects candidate sources with their titles and snippets, keeping the search engine’s own ranking intact.',
    icon: Search,
    tone: 'text-accent-primary',
  },
  {
    id: 'read',
    name: 'Reader',
    role: 'Opens the best links and extracts the substance',
    detail:
      'Fetches the promising pages and pulls out the readable body text, so the writer works from full articles rather than search snippets.',
    icon: BookOpenCheck,
    tone: 'text-accent-tertiary',
  },
  {
    id: 'write',
    name: 'Writer',
    role: 'Synthesises everything into a structured report',
    detail:
      'Composes an introduction, key findings and a conclusion from the gathered research, listing every source it drew on.',
    icon: PenLine,
    tone: 'text-accent-secondary',
  },
  {
    id: 'critique',
    name: 'Critic',
    role: 'Scores the report and flags what to improve',
    detail:
      'Reviews the finished report against the evidence, scores it out of ten, and names the specific strengths and gaps.',
    icon: ShieldQuestion,
    tone: 'text-accent-emerald',
  },
]

/* -------------------------------------------------------------------------- */
/*  Powered by — real dependencies, not a customer logo wall                  */
/* -------------------------------------------------------------------------- */

export const POWERED_BY = [
  'Groq',
  'Tavily',
  'LangChain',
  'FastAPI',
  'React 19',
  'TypeScript',
  'Framer Motion',
  'Recharts',
  'React Flow',
  'Tailwind CSS',
] as const

/* -------------------------------------------------------------------------- */
/*  Features — each one exists in the workspace                               */
/* -------------------------------------------------------------------------- */

export interface Feature {
  title: string
  description: string
  icon: LucideIcon
  tone: string
}

export const FEATURES: Feature[] = [
  {
    title: 'Multi-agent pipeline',
    description:
      'Four specialised agents hand work down a chain — search, read, write, critique — instead of one model guessing at everything.',
    icon: GitBranch,
    tone: 'text-accent-primary',
  },
  {
    title: 'Live web research',
    description:
      'Every run queries the live web, so answers reflect what is published now rather than a training cut-off.',
    icon: Globe,
    tone: 'text-accent-tertiary',
  },
  {
    title: 'Self-critique and scoring',
    description:
      'A dedicated critic agent reviews the finished report, scores it out of ten, and lists what to strengthen.',
    icon: Gauge,
    tone: 'text-accent-emerald',
  },
  {
    title: 'Source collection',
    description:
      'Links are captured as the run proceeds and presented as cards with domain, favicon and a credibility hint.',
    icon: FileSearch,
    tone: 'text-accent-secondary',
  },
  {
    title: 'Real-time streaming',
    description:
      'Server-sent events push every stage change as it happens — no polling, no waiting on a blank screen.',
    icon: Radio,
    tone: 'text-accent-primary',
  },
  {
    title: 'Live pipeline graph',
    description:
      'Watch data flow between agents on an animated graph: running nodes glow, completed nodes settle green.',
    icon: Braces,
    tone: 'text-accent-tertiary',
  },
  {
    title: 'Report exports',
    description:
      'Take any report away as Markdown, Word or PDF, with the references and critic review attached.',
    icon: Download,
    tone: 'text-accent-emerald',
  },
  {
    title: 'Run insight charts',
    description:
      'See where the time went and how your sources distribute across credibility tiers, with a table view behind every chart.',
    icon: BarChart3,
    tone: 'text-accent-secondary',
  },
  {
    title: 'Markdown and tables',
    description:
      'Reports render as proper documents — headings, tables, code blocks and linked citations, not a wall of text.',
    icon: Table2,
    tone: 'text-accent-primary',
  },
  {
    title: 'Research history',
    description:
      'Past runs are saved with their sources, scores and timings, searchable across full report text.',
    icon: Clock,
    tone: 'text-accent-tertiary',
  },
  {
    title: 'Linked citations',
    description:
      'Sources are numbered and linked from the report body through to the reference list at the end.',
    icon: Quote,
    tone: 'text-accent-emerald',
  },
  {
    title: 'Keyboard-first',
    description:
      'A command palette, global search and shortcuts for every panel — the whole workspace is reachable without a mouse.',
    icon: Keyboard,
    tone: 'text-accent-secondary',
  },
]

/* -------------------------------------------------------------------------- */
/*  Comparison                                                                */
/* -------------------------------------------------------------------------- */

export interface ComparisonRow {
  capability: string
  search: boolean | string
  chatbot: boolean | string
  platform: boolean | string
}

export const COMPARISON: ComparisonRow[] = [
  { capability: 'Searches the live web', search: true, chatbot: 'Sometimes', platform: true },
  { capability: 'Reads full pages, not snippets', search: false, chatbot: 'Sometimes', platform: true },
  { capability: 'Produces a structured report', search: false, chatbot: true, platform: true },
  { capability: 'Lists the sources it used', search: true, chatbot: 'Sometimes', platform: true },
  { capability: 'Reviews and scores its own output', search: false, chatbot: false, platform: true },
  { capability: 'Shows each step as it runs', search: false, chatbot: false, platform: true },
  { capability: 'Exports to Markdown, Word, PDF', search: false, chatbot: 'Copy-paste', platform: true },
  { capability: 'Runs entirely on your own keys', search: false, chatbot: false, platform: true },
]

/* -------------------------------------------------------------------------- */
/*  FAQ                                                                       */
/* -------------------------------------------------------------------------- */

export const FAQ = [
  {
    question: 'How does the multi-agent pipeline actually work?',
    answer:
      'A run passes through four stages in order. Scout searches the web and collects candidate sources. Reader opens the most promising links and extracts their body text. Writer synthesises both into a structured report. Critic then reviews that report, scores it out of ten and names the gaps. Each stage streams its status to the interface as it happens, so you can see exactly where a run is and how long each step took.',
  },
  {
    question: 'Can I export the reports?',
    answer:
      'Yes — Markdown, Word and PDF, plus copy to clipboard. Exports include the report body, the numbered reference list and the critic review with its score. PDF goes through your browser’s own print pipeline, so it picks up your page size and margins.',
  },
  {
    question: 'Which AI models are supported?',
    answer:
      'Runs go through Groq, with the model set by the GROQ_MODEL variable in your .env file — it defaults to llama-3.1-8b-instant. Because Groq’s rate limits apply per model, switching that variable is also how you keep working when one model’s daily quota is exhausted. Web search is handled by Tavily.',
  },
  {
    question: 'Can I upload PDFs or other documents?',
    answer:
      'Not yet. The composer accepts files and passes their names along for context, but there is no document ingestion endpoint — a run researches a topic from the live web. Document upload is a natural next step for the pipeline rather than something available today.',
  },
  {
    question: 'Is there API access?',
    answer:
      'Yes. The backend is a FastAPI service and this interface is only one client of it. POST /api/research starts a run, GET /api/research/{id}/stream follows it over server-sent events, and GET /api/research/{id}/report.md returns the finished document. Interactive API docs are served at /api/docs.',
  },
  {
    question: 'How are citations produced?',
    answer:
      'Sources are captured directly from the search results and from the report’s own sources section, deduplicated by URL, then rendered as numbered reference cards. Each card shows the site, domain and a credibility hint derived from the domain itself — a heuristic to help you triage a long list, not a fact-check. Always open the source before relying on a claim.',
  },
]
