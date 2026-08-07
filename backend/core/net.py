"""Client IP resolution behind the reverse-proxy chain.

Request path in production:

    client -> host nginx -> portfolio_frontend (nginx) -> portfolio_backend

`request.client.host` is therefore always the frontend container address, which
makes any per-IP logic (rate limits, one-like-per-IP) collapse into a single
global bucket. The real address has to be recovered from the forwarding headers.
"""

import ipaddress
from typing import Optional

from fastapi import Request

from core.config import settings


def _is_public(value: str) -> bool:
    """True only for globally routable addresses.

    `is_global` already excludes private, loopback, link-local, multicast,
    reserved and documentation ranges — which is exactly the set our own
    infrastructure hops fall into.
    """
    try:
        return ipaddress.ip_address(value).is_global
    except ValueError:
        return False


def _valid(value: Optional[str]) -> Optional[str]:
    if not value:
        return None
    value = value.strip()
    try:
        ipaddress.ip_address(value)
    except ValueError:
        return None
    return value


def get_client_ip(request: Request) -> Optional[str]:
    """Best-effort real client IP.

    X-Forwarded-For is scanned right-to-left and the first public address wins.
    Each proxy appends the address it saw, so the rightmost entries are our own
    infrastructure (private) and anything a client injected itself sits further
    left, past the address the outermost proxy actually observed. Reading the
    leftmost entry instead would let a caller spoof its way around rate limits.
    """
    if settings.TRUST_CF_CONNECTING_IP:
        # Cloudflare overwrites this header at the edge, so it cannot be spoofed
        # while the domain is proxied. Off by default: without Cloudflare in
        # front, the header is just client-supplied input.
        cf_ip = _valid(request.headers.get("CF-Connecting-IP"))
        if cf_ip:
            return cf_ip

    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        for hop in reversed([h.strip() for h in forwarded.split(",")]):
            if _is_public(hop):
                return hop

    real_ip = _valid(request.headers.get("X-Real-IP"))
    if real_ip:
        return real_ip

    return request.client.host if request.client else None
