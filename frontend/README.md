# Multi-Agent AI Research — Frontend

A React interface for the Python research pipeline in the repository root. It drives
the real backend: every agent status, timing, source and score on screen comes from
the SSE stream that `pipeline.py` emits.

## Running it

The backend serves this app once it has been built, so for normal use you only need
one process:

```bash
cd frontend && npm install && npm run build
cd .. && python server.py          # http://127.0.0.1:8000
```

For frontend work, run the Vite dev server alongside it — `/api` is proxied to port
8000, and `server.py` allows the dev origin via CORS:

```bash
python server.py                   # terminal 1
cd frontend && npm run dev         # terminal 2 -> http://localhost:5173
```

`server.py` falls back to the original `web/` page when `frontend/dist` is absent, so
the project still runs with no Node toolchain installed.

## What is wired to the backend

| Feature | Source |
|---|---|
| Agent roster, names, roles | `GET /api/health` → `STEPS` in `pipeline.py` |
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

- **History, Library, Dashboard metrics** — `server.py` keeps jobs in an in-process
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
    layout/      app shell, sidebar, top bar, drawers
    research/    sources, critic review, run insight charts
  hooks/         health, SSE-adjacent UI hooks, a11y, shortcuts
  pages/         Research, Dashboard, Library, Settings
  services/      axios client, endpoints, SSE subscription, storage
  store/         zustand: research run state + UI preferences
  types/         shapes mirrored from the Python backend
  utils/         formatting, export, source enrichment
```

## Charts

Chart colours are not hand-picked. `components/charts/theme.ts` documents the
palettes and the validator results they passed against this app's chart surface
(`#111114`) in dark mode — a 3-slot categorical set and a 4-step single-hue ordinal
ramp. Every chart is single-series, so identity never rides on colour alone, values
are direct-labelled, and each chart has a table view behind the toggle in its header.

## Accessibility

Keyboard navigation throughout (`⌘K` palette, `⌘/` search, `⌘B`/`⌘J` panels), focus
trapping in drawers and dialogs, ARIA labels on icon-only controls, a skip link, and
a live region on the transcript. The pipeline graph exposes its state as a sentence
for screen readers rather than as an image. Reduced motion is honoured from the OS
setting and can also be forced in Settings — it disables the ambient background,
particle field, cursor glow and the streaming reveal.
