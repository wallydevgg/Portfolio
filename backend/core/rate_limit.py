"""In-memory sliding window rate limiter.

Shared by the public write endpoints (contact form, blog comments). State lives
in the process, so it resets on container restart and is not shared across
replicas — adequate for a single-instance portfolio, and the place to swap in
Redis if that ever changes.
"""

import time
from typing import Dict, List

_buckets: Dict[str, List[float]] = {}


def check_rate_limit(key: str, limit: int, window: int = 3600) -> bool:
    """Consume one slot for `key`. Returns True if allowed, False if throttled.

    An empty key (unknown client) is always allowed rather than sharing one
    global bucket with every other unidentified caller.
    """
    if not key:
        return True

    now = time.time()
    history = [t for t in _buckets.get(key, []) if now - t < window]

    if len(history) >= limit:
        _buckets[key] = history
        return False

    history.append(now)
    _buckets[key] = history
    return True
