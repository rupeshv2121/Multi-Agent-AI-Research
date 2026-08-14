# Multi-Agent AI Research

Four AI agents turn a topic into a sourced, peer-reviewed research report:

| # | Agent  | Does                                                        | Tool |
|---|--------|-------------------------------------------------------------|------|
| 1 | Scout  | Searches the live web for reliable, recent sources           | `web_search` (Tavily) |
| 2 | Reader | Opens the best links and extracts the readable text          | `scrape_url` |
| 3 | Writer | Synthesises everything into a structured report              | `llama-3.3-70b` on Groq |
| 4 | Critic | Scores the report out of ten and flags what to improve       | `llama-3.3-70b` on Groq |

## Setup

Put your keys in `.env`:

```
TAVILY_API_KEY=...
GROQ_API_KEY=...
```

Install dependencies:

```bash
uv pip install -r backend/requirements.txt     # or: pip install -r backend/requirements.txt
```

## Run the website

Build the React interface once, then start the server:

```bash
cd frontend && npm install && npm run build && cd ..
python backend/server.py
```

Then open <http://127.0.0.1:8000>. The landing page is at `/`; the research
workspace is at `/app`. Enter a topic and each agent reports its status live as
it works — the page follows the run over server-sent events, with a pipeline
graph, per-agent timings and a live log feed alongside.

`backend/server.py` serves `frontend/dist`. If you start it before building, the API at
`/api` still runs and the root path returns the build instructions rather than
crashing. See [frontend/README.md](frontend/README.md) for the dev-server
workflow and for which features are backed by the API versus stored in the
browser.

> **Before publishing the landing page:** the metrics, testimonials and paid
> pricing tiers in `frontend/src/content/placeholders.ts` are invented
> placeholders. Replace them or delete those sections — publishing fabricated
> statistics or reviews as real is deceptive. The sections currently render a
> visible note saying so.

When the run finishes you get:

- **Report** — the rendered Markdown report
- **Critique** — the critic's score, strengths and gaps
- **Sources** — every URL the scout found, as clickable cards
- **Raw output** — the unedited search and reader agent output

Reports can be copied or downloaded as Markdown, and completed runs are listed
under *Recent research* (stored in your browser only).

## Other entry points

```bash
python backend/pipeline.py           # CLI: prompts for a topic, prints each stage
streamlit run backend/Streamlit.py
```

## Layout

```
backend/
  server.py       FastAPI app — JSON + SSE API, serves the frontend
  pipeline.py     The four-step run, emits progress events
  agents.py       Agent + chain definitions
  tools.py        web_search and scrape_url
  Streamlit.py    Alternative Streamlit UI
  requirements.txt
frontend/         React + TypeScript interface (see frontend/README.md)
.env              API keys, shared by everything above
```

## Troubleshooting

**"Could not reach the research server"** — the agents run server-side, so
`python backend/server.py` must be running. Browse to <http://127.0.0.1:8000>, or to
<http://localhost:5173> if you are using the Vite dev server.

**The root path returns build instructions** — `frontend/dist` is missing. Run
`cd frontend && npm install && npm run build`, then restart the server.

**"Groq's daily token limit ... has been used up"** — the free Groq tier caps
tokens per day (100k on `on_demand`). It resets on a 24-hour rolling window;
a full research run costs roughly 10–20k tokens.

**A step shows "Retrying"** — Groq occasionally returns `tool_use_failed` when
the model emits a malformed function call. Each step retries up to 3 times;
quota errors are not retried, since they can't clear.

## Notes

- The reader step is treated as optional: if a scrape or tool call fails, the
  run is marked *skipped* for that agent and still produces a report from the
  search results rather than failing outright.
- Runs are held in server memory, so restarting the server clears history
  replay (the browser then simply re-runs the topic).
- Reports are AI-generated — check the sources before relying on them.
