"""Locate and load the .env file.

Every backend module needs the API keys, and each used to call `load_dotenv()`
with its own idea of where the file lives. Centralising it here means the
lookup is defined once and works regardless of the working directory the
process was started from — running `python backend/server.py` from the repo
root and `python server.py` from inside backend/ behave identically.

Both locations are accepted: `backend/.env` (next to the code) takes priority,
with the repository root as a fallback for older checkouts.
"""

from pathlib import Path

from dotenv import load_dotenv

BACKEND_DIR = Path(__file__).parent
ROOT_DIR = BACKEND_DIR.parent

# Ordered by preference; the first that exists wins.
CANDIDATES = (BACKEND_DIR / ".env", ROOT_DIR / ".env")


def env_path() -> Path | None:
    """The .env file that will be used, or None if there isn't one."""
    return next((path for path in CANDIDATES if path.is_file()), None)


def load_env(*, override: bool = False) -> Path | None:
    """Load the .env file and return the path used.

    `override=True` lets an edited .env take effect on the next restart even
    when a stale value is already present in the environment.
    """
    path = env_path()
    if path is not None:
        load_dotenv(path, override=override)
    return path
