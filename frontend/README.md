# Multi-Agent AI Research — Frontend

A React interface for the Python research pipeline in `backend/`: a marketing
landing page at `/` and the research workspace at `/app`. The workspace drives the real
backend — every agent status, timing, source and score on screen comes from the SSE
stream that `backend/pipeline.py` emits.

## Running it

The backend serves this app once it has been built, so for normal use you only need
one process:

```bash
cd frontend && npm install && npm run build
cd .. && python backend/server.py  # http://127.0.0.1:8000
```

For frontend work, run the Vite dev server alongside it — `/api` is proxied to port
8000, and `backend/server.py` allows the dev origin via CORS:

```bash
python backend/server.py           # terminal 1
cd frontend && npm run dev         # terminal 2 -> http://localhost:5173
```

If you start the server before building, the JSON API at `/api` still runs and the
root path returns the build instructions rather than crashing.

## Routes

| Route | What it is |
|---|---|
| `/` | Landing page — hero, features, pipeline walkthrough, pricing, FAQ |
| `/app` | Research workspace — composer, transcript, live agent panel |
| `/app/dashboard` | Metrics over your stored runs |
| `/app/library` | Saved research, filterable |
| `/app/settings` | Backend health, motion and accent preferences |

Deep links work on a hard refresh: the server returns `index.html` for unknown paths
so the client router can take over, while genuinely missing `/assets/*` still 404.

## ⚠️ Before you publish the landing page

`src/content/placeholders.ts` holds **invented** marketing content — metrics,
testimonials and the paid pricing tiers. None of it is measured, quoted or agreed with
anyone. Replace it or delete those sections before the page goes anywhere public;
publishing fabricated reviews or statistics as if they were real is deceptive and in
most jurisdictions unlawful. The relevant sections currently render a visible note
saying the content is placeholder.

Everything in `src/content/product.ts` is factual by contrast — the four real pipeline
stages, the real dependency list, and features that exist in the workspace today. The
"Built with" strip names actual dependencies rather than posing as a customer logo
wall, and the newsletter form says plainly that it is not connected to a list.

## What is wired to the backend

| Feature | Source |
|---|---|
| Agent roster, names, roles | `GET /api/health` → `STEPS` in `backend/pipeline.py` |
| Live agent status, timings, retries | SSE `step` events |
| Log feed | SSE `log` events |
| Sources | SSE `sources` events |
| Report, critic review, score | SSE `done` event |
| Failure messages | SSE `error` (already made actionable by `describe_error`) |
| Report download | `GET /api/research/{id}/report.md` |

The pipeline has **four** agents — Scout → Reader → Writer → Critic. The graph and the
agent cards are built from whatever `/api/health` returns, so adding a stage to
`STEPS` shows up in the UI with no frontend change.

## What is client-side only

These are real features, but they are not backed by an endpoint — the backend has
none for them. Each one says so in the interface rather than implying otherwise:

- **History, Library, Dashboard metrics** — the backend keeps jobs in an in-process
  dict with no history endpoint, so everything is recorded in `localStorage` by
  `services/storage.ts`.
- **Research depth / search mode / agent selection** — shape the UI only;
  `POST /api/research` accepts `{topic}` alone.
- **File attachments** — listed by name; there is no upload endpoint.
- **Stop** — detaches this view from the stream. The worker thread runs to
  completion server-side; there is no cancel endpoint.
- **Token counts** — estimated from text length (~4 chars/token). The backend
  reports no usage.
- **Source credibility** — a transparent heuristic over the domain (TLD, known
  publishers, HTTPS, path depth). Not a fact-check.
- **Streaming reveal** — the report arrives in one `done` event, so the typewriter
  paces an already-received string rather than streaming tokens.
- **Landing page demo** — a scripted simulation, labelled as such on the page.

## Layout

```
src/
  animations/    shared framer-motion variants
  components/
    agents/      React Flow pipeline graph, agent cards, activity feed
    charts/      validated chart palette + ChartFrame wrapper
    chat/        composer, messages, markdown renderer, actions
    common/      buttons, cards, tooltips, background, command palette
    dashboard/   stat cards
    landing/     hero, features, workflow, pricing, FAQ, footer …
    layout/      app shell, sidebar, top bar, drawers
    research/    sources, critic review, run insight charts
  content/       product.ts (factual) · placeholders.ts (replace me)
  hooks/         health, smooth scroll, a11y, shortcuts
  pages/         Landing, Research, Dashboard, Library, Settings
  services/      axios client, endpoints, SSE subscription, storage
  store/         zustand: research run state + UI preferences
  types/         shapes mirrored from the Python backend
  utils/         formatting, export, source enrichment
```

## Notes on a few implementation choices

**No React Three Fiber.** The hero's neural-network backdrop is a plain canvas
(`landing/NeuralField.tsx`). R3F plus three.js adds roughly 600KB gzipped to draw
something a few hundred lines of canvas handles, at a much lower power draw.

**Charts.** Chart colours are not hand-picked. `components/charts/theme.ts` documents
the palettes and the validator results they passed against this app's chart surface
(`#111114`) in dark mode — a 3-slot categorical set and a 4-step single-hue ordinal
ramp. Every chart is single-series, so identity never rides on colour alone, values
are direct-labelled, and each chart has a table view behind the toggle in its header.

**Syntax highlighting** uses `PrismLight` with an explicit language list. The full
Prism build registers every grammar and adds well over a megabyte.

## Accessibility

Keyboard navigation throughout (`⌘K` palette, `⌘/` search, `⌘B`/`⌘J` panels), focus
trapping in drawers and dialogs, ARIA labels on icon-only controls, skip links on both
the landing page and the workspace, and a live region on the transcript. The pipeline
graph exposes its state as a sentence for screen readers rather than as an image;
comparison-table cells carry text labels rather than relying on icon colour.

Reduced motion is honoured from the OS setting and can also be forced in Settings. It
disables the ambient background, particle and neural fields, cursor glow, streaming
reveal, marquee, carousel auto-advance, and Lenis smooth scrolling — hijacking the
scroll wheel is exactly what that preference exists to opt out of.
