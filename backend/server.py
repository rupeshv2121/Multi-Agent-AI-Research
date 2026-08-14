"""Web server for the Multi-Agent AI Research platform.

Serves the built React app in `frontend/dist/` and exposes a small JSON + SSE
API so the browser can watch a research run happen agent by agent.

    python backend/server.py        # then open http://127.0.0.1:8000
"""

import asyncio
import json
import os
import threading
import uuid
from datetime import datetime, timezone
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import PlainTextResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from starlette.exceptions import HTTPException as StarletteHTTPException

from pipeline import STEPS, describe_error, run_research_pipeline

BASE_DIR = Path(__file__).parent
ROOT_DIR = BASE_DIR.parent

# .env lives at the repository root, shared by the backend and any tooling.
# Passing the path explicitly means the server behaves the same whether it is
# started from the root, from backend/, or by an editor with its own cwd.
load_dotenv(ROOT_DIR / ".env")

# The React app builds to frontend/dist; `npm run build` in frontend/ is all it
# takes. WEB_DIR is the original no-build page, kept as a fallback for checkouts
# that still have it.
WEB_DIR = ROOT_DIR / "web"
DIST_DIR = ROOT_DIR / "frontend" / "dist"

app = FastAPI(title="Multi-Agent AI Research", docs_url="/api/docs")

# Only needed while the React dev server proxies from its own origin. The
# built app is served from this same origin, where CORS does not apply.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# job_id -> {"topic", "status", "created_at", "state", "error", "events"}
# `events` is append-only, so any number of SSE clients can follow (or re-follow)
# a run just by tracking how far through the list they are.
JOBS: dict[str, dict] = {}
JOBS_LOCK = threading.Lock()


class ResearchRequest(BaseModel):
    topic: str


def _run_job(job_id: str, topic: str):
    """Execute the pipeline on a worker thread, recording events as they happen."""
    job = JOBS[job_id]

    try:
        state = run_research_pipeline(topic, on_event=job["events"].append)
        job["state"] = state
        job["status"] = "complete"
    except Exception as exc:
        message = describe_error(exc)
        job["status"] = "error"
        job["error"] = message
        job["events"].append({"type": "error", "message": message})
    finally:
        job["finished_at"] = datetime.now(timezone.utc).isoformat()


@app.get("/api/health")
def health():
    """Let the UI warn about missing keys before someone waits on a doomed run."""
    return {
        "ok": True,
        "keys": {
            "tavily": bool(os.getenv("TAVILY_API_KEY")),
            "groq": bool(os.getenv("GROQ_API_KEY")),
        },
        "steps": STEPS,
    }


@app.post("/api/research")
def start_research(req: ResearchRequest):
    topic = req.topic.strip()
    if not topic:
        raise HTTPException(status_code=400, detail="Please provide a research topic.")
    if len(topic) > 500:
        raise HTTPException(status_code=400, detail="That topic is too long (500 characters max).")

    job_id = uuid.uuid4().hex[:12]
    with JOBS_LOCK:
        JOBS[job_id] = {
            "id": job_id,
            "topic": topic,
            "status": "running",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "state": None,
            "error": None,
            "events": [],
        }

    threading.Thread(target=_run_job, args=(job_id, topic), daemon=True).start()
    return {"job_id": job_id, "topic": topic}


@app.get("/api/research/{job_id}/stream")
async def stream_research(job_id: str):
    """Server-sent events: replays anything already emitted, then follows live."""
    job = JOBS.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Unknown job.")

    async def event_source():
        cursor = 0
        idle = 0
        while True:
            # Sample status *before* draining: if the job finishes mid-drain we
            # still come back for one more pass and pick up its final events.
            running = job["status"] == "running"
            events = job["events"]
            # Anything appended since our last pass, including a full replay on
            # the first iteration so late/reconnecting clients miss nothing.
            while cursor < len(events):
                yield f"data: {json.dumps(events[cursor])}\n\n"
                cursor += 1
                idle = 0

            if not running:
                break

            idle += 1
            if idle > 100:  # ~20s quiet: nudge proxies so they don't drop us
                yield ": keep-alive\n\n"
                idle = 0
            await asyncio.sleep(0.2)

        yield "data: {\"type\": \"eof\"}\n\n"

    return StreamingResponse(
        event_source(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


@app.get("/api/research/{job_id}")
def get_research(job_id: str):
    job = JOBS.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Unknown job.")
    return {k: v for k, v in job.items() if k not in ("queue", "events")}


@app.get("/api/research/{job_id}/report.md", response_class=PlainTextResponse)
def download_report(job_id: str):
    job = JOBS.get(job_id)
    if not job or not job.get("state"):
        raise HTTPException(status_code=404, detail="No report available for that job.")

    state = job["state"]
    markdown = (
        f"# {job['topic']}\n\n"
        f"_Generated by Multi-Agent AI Research on {job['created_at'][:10]}_\n\n"
        f"{state.get('report', '')}\n\n---\n\n## Critic Review\n\n{state.get('feedback', '')}\n"
    )
    slug = "".join(c if c.isalnum() else "-" for c in job["topic"]).strip("-")[:60] or "report"
    return PlainTextResponse(
        markdown,
        media_type="text/markdown",
        headers={"Content-Disposition": f'attachment; filename="{slug}.md"'},
    )


class SPAStaticFiles(StaticFiles):
    """StaticFiles that serves index.html for unknown paths.

    The React app routes /app, /app/dashboard and friends on the client, so a
    hard refresh on one of those asks the server for a file that does not
    exist. `html=True` alone only covers directories, so a missing *file* still
    404s — this turns that into the app shell and lets the router take over.
    Genuinely missing assets (a stale /assets/... hash) keep their 404.
    """

    async def get_response(self, path: str, scope):
        try:
            return await super().get_response(path, scope)
        except StarletteHTTPException as exc:
            # Starlette *raises* on a miss rather than returning a 404 response.
            # `path` has already been through os.path.normpath, so on Windows
            # it arrives with backslashes — normalise before matching.
            normalised = path.replace("\\", "/").lstrip("/")
            if exc.status_code != 404 or normalised.startswith("assets/"):
                raise
            return await super().get_response("index.html", scope)


BUILD_HINT = (
    "The frontend has not been built yet.\n\n"
    "    cd frontend && npm install && npm run build\n\n"
    "Then restart this server. The JSON API at /api is already running — see "
    "/api/docs."
)


# Serve the frontend from the root. Mounted last, so the /api routes above are
# matched first.
if DIST_DIR.is_dir():
    app.mount("/", SPAStaticFiles(directory=DIST_DIR, html=True), name="app")
elif WEB_DIR.is_dir():
    # The original no-build page, if it is still around.
    app.mount("/", StaticFiles(directory=WEB_DIR, html=True), name="web")
else:
    # Neither exists. Mounting StaticFiles on a missing directory raises at
    # startup, which would take the API down with it — so serve the build
    # instructions instead and leave /api working.
    @app.get("/{_path:path}", response_class=PlainTextResponse)
    def missing_frontend(_path: str):
        return PlainTextResponse(BUILD_HINT, status_code=503)


if __name__ == "__main__":
    import uvicorn

    print("\n  Multi-Agent AI Research  ->  http://127.0.0.1:8000\n")
    uvicorn.run(app, host="127.0.0.1", port=8000, log_level="info")
