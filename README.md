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
uv pip install -r requirements.txt     # or: pip install -r requirements.txt
```

## Run the website

Build the React interface once, then start the server:

```bash
cd frontend && npm install && npm run build && cd ..
python server.py
```

Then open <http://127.0.0.1:8000>. Enter a topic and each agent reports its
status live as it works — the page follows the run over server-sent events,
with a pipeline graph, per-agent timings and a live log feed alongside.

`server.py` serves `frontend/dist` when it exists and falls back to the plain
`web/` page otherwise, so the project still runs without a Node toolchain. See
[frontend/README.md](frontend/README.md) for the dev-server workflow and for
which features are backed by the API versus stored in the browser.

When the run finishes you get:

- **Report** — the rendered Markdown report
- **Critique** — the critic's score, strengths and gaps
- **Sources** — every URL the scout found, as clickable cards
- **Raw output** — the unedited search and reader agent output

Reports can be copied or downloaded as Markdown, and completed runs are listed
under *Recent research* (stored in your browser only).

## Other entry points

```bash
python pipeline.py     # CLI: prompts for a topic, prints each stage
streamlit run Streamlit.py
```

## Layout

```
server.py       FastAPI app — JSON + SSE API, serves the frontend
pipeline.py     The four-step run, emits progress events
agents.py       Agent + chain definitions
tools.py        web_search and scrape_url
frontend/       React + TypeScript interface (see frontend/README.md)
web/            index.html · style.css · app.js  — fallback, no build step
```

## Troubleshooting

**"Couldn't reach the backend"** — the page was opened as a file (or via Live
Server) instead of through the app. The agents run server-side, so you must
start `python server.py` and browse to <http://127.0.0.1:8000>.

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
- Runs are held in server memory, so restarting `server.py` clears history
  replay (the browser then simply re-runs the topic).
- Reports are AI-generated — check the sources before relying on them.
