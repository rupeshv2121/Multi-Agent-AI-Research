import re
import time

from agents import build_search_agent, build_reader_agent, writer_chain, critic_chain

# The four agents that make up a run, in execution order. The web UI renders one
# card per entry, so keep ids in sync with `web/app.js`.
STEPS = [
    {"id": "search", "name": "Scout", "role": "Searches the web for reliable, recent sources"},
    {"id": "read", "name": "Reader", "role": "Opens the best links and extracts the substance"},
    {"id": "write", "name": "Writer", "role": "Synthesises everything into a structured report"},
    {"id": "critique", "name": "Critic", "role": "Scores the report and flags what to improve"},
]

URL_RE = re.compile(r"https?://[^\s<>\)\]\"']+")


def is_retryable(exc: Exception) -> bool:
    """A per-day quota won't clear by trying again; most other errors might."""
    text = str(exc)
    return not ("tokens per day" in text or "TPD" in text)


def describe_error(exc: Exception) -> str:
    """Turn a provider error into something a reader can act on."""
    text = str(exc)

    if "tokens per day" in text or "TPD" in text:
        # Groq usually tells us when capacity frees up; it's a rolling window,
        # and the limit applies per organization per model — so a new API key on
        # the same account shares it, but a different model has its own budget.
        retry = re.search(r"try again in ([^.,}\"']+)", text)
        when = f" Capacity frees up in about {retry.group(1).strip()}." if retry else ""
        return ("Groq's daily token limit for this model has been used up." + when +
                " The limit is per organization (a new API key on the same account "
                "shares it) — set GROQ_MODEL in .env to another model, e.g. "
                "llama-3.1-8b-instant, to keep working.")
    if "rate limit" in text.lower() or "429" in text:
        return "Groq is rate-limiting this key right now. Wait a minute and run it again."
    if "tool_use_failed" in text:
        return ("The model kept returning a malformed tool call for this topic. "
                "Trying a differently-worded topic usually clears it.")
    if "api_key" in text.lower() or "authentication" in text.lower() or "401" in text:
        return "The API key was rejected. Check TAVILY_API_KEY and GROQ_API_KEY in your .env file."
    return text


def collect_tool_output(messages) -> str:
    """Join the raw tool results out of an agent transcript.

    The agent's *final* message is an LLM summary that usually drops the URLs;
    the `Title/URL/Snippet` blocks only survive on the intermediate tool
    messages, which is what we need for the sources list.
    """
    parts = []
    for message in messages:
        if getattr(message, "type", "") == "tool" or type(message).__name__ == "ToolMessage":
            content = getattr(message, "content", "")
            if isinstance(content, str) and content.strip():
                parts.append(content)
    return "\n\n".join(parts)


def extract_sources(text: str) -> list[dict]:
    """Pull `Title: ... URL: ...` pairs (and any loose URLs) out of the search output."""
    sources: dict[str, str] = {}

    # The search tool emits blocks of "Title: x\nURL: y\nSnippet: z", so try to
    # pair each URL with the title that precedes it.
    for block in re.split(r"\n\s*\n", text or ""):
        title = re.search(r"Title:\s*(.+)", block)
        url = re.search(r"URL:\s*(\S+)", block)
        if url:
            sources.setdefault(url.group(1).rstrip(".,)"), title.group(1).strip() if title else "")

    for url in URL_RE.findall(text or ""):
        sources.setdefault(url.rstrip(".,)"), "")

    return [{"url": url, "title": title or url.split("//")[-1].split("/")[0]}
            for url, title in sources.items()]


def extract_score(feedback: str) -> float | None:
    """Read the `Score: X/10` line the critic is prompted to produce."""
    match = re.search(r"Score:\s*([\d.]+)\s*/\s*10", feedback or "", re.IGNORECASE)
    if not match:
        return None
    try:
        return max(0.0, min(10.0, float(match.group(1))))
    except ValueError:
        return None


def run_research_pipeline(topic: str, on_event=None) -> dict:
    """Run Search -> Read -> Write -> Critique.

    `on_event(event: dict)` is called as each step starts and finishes so callers
    (the web server) can stream progress. It is optional — without it this
    behaves exactly like the original CLI pipeline.
    """
    state: dict = {}

    def emit(**event):
        if on_event:
            on_event(event)

    def log(message: str):
        print(message)
        emit(type="log", message=message)

    def run_step(step_id: str, message: str, fn, fallback=None, attempts=3):
        """Run one agent, retrying transient upstream failures.

        Groq intermittently returns `tool_use_failed` when the model emits
        malformed function-call syntax; a plain retry almost always clears it.
        If `fallback` is given the step is optional and a final failure degrades
        the run instead of ending it.
        """
        emit(type="step", step=step_id, status="running")
        started = time.time()
        log(message)

        last_exc = None
        for attempt in range(1, attempts + 1):
            try:
                result = fn()
            except Exception as exc:
                last_exc = exc
                if attempt < attempts and is_retryable(exc):
                    log(f"Step '{step_id}' attempt {attempt} failed ({exc}); retrying...")
                    emit(type="step", step=step_id, status="running",
                         note=f"Retrying ({attempt}/{attempts - 1})…")
                    time.sleep(1.5 * attempt)
                    continue
                break
            emit(type="step", step=step_id, status="done",
                 duration=round(time.time() - started, 1))
            return result

        if fallback is None:
            emit(type="step", step=step_id, status="error", error=describe_error(last_exc))
            raise last_exc

        log(f"Step '{step_id}' failed, continuing without it: {last_exc}")
        emit(type="step", step=step_id, status="warn", error=str(last_exc),
             duration=round(time.time() - started, 1))
        return fallback

    emit(type="start", topic=topic, steps=STEPS)

    # Step 1: Search for relevant information
    def _search():
        search_agent = build_search_agent()
        result = search_agent.invoke({
            "messages": [("user", f"Find recent, reliable and detailed information about: {topic}")]
        })
        return result["messages"][-1].content, collect_tool_output(result["messages"])

    state["search_result"], state["search_raw"] = run_step(
        "search", f"Searching for information on: {topic}", _search
    )
    state["sources"] = extract_sources(f"{state['search_raw']}\n\n{state['search_result']}")
    emit(type="sources", sources=state["sources"])

    # Step 2: Read and extract information from the URLs we found
    def _read():
        reader_agent = build_reader_agent()
        result = reader_agent.invoke({
            "messages": [("user", f"Extract detailed information from the following URLs:\n{state['search_result'][:800]}")]
        })
        return result["messages"][-1].content

    # Optional: the reader deepens the research, but the writer can work from the
    # search results alone if a scrape or tool call misbehaves.
    state["scraped_content"] = run_step(
        "read",
        "Extracting information from URLs found in search results...",
        _read,
        fallback="(The reader agent could not extract page content for this run.)",
    )

    # Step 3: Write a research report
    def _write():
        research_combined = (
            f"Search Results:\n{state['search_result']}\n\n"
            f"Scraped Content:\n{state['scraped_content']}"
        )
        return writer_chain.invoke({"topic": topic, "research": research_combined})

    state["report"] = run_step("write", "Writing a research report based on the gathered information...", _write)

    # The report's own Sources section can name links the search summary lost.
    known = {s["url"] for s in state["sources"]}
    state["sources"] += [s for s in extract_sources(state["report"]) if s["url"] not in known]
    emit(type="sources", sources=state["sources"])

    # Step 4: Critique the research report
    state["feedback"] = run_step(
        "critique",
        "Critiquing the research report...",
        lambda: critic_chain.invoke({"report": state["report"]}),
    )
    state["score"] = extract_score(state["feedback"])

    emit(type="done", state=state)
    return state


if __name__ == "__main__":
    topic = input("Enter a research topic: ")
    run_research_pipeline(topic)
