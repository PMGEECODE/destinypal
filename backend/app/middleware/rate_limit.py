"""
Rate limiting middleware for API protection.
"""

from datetime import datetime, timedelta
from typing import Dict, Tuple
from collections import defaultdict
import asyncio

from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.status import HTTP_429_TOO_MANY_REQUESTS


class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    Simple in-memory rate limiting middleware.

    NOTE:
    - Safe for single-process deployments
    - NOT suitable for multi-worker production (use Redis)
    """

    def __init__(
        self,
        app,
        requests_per_minute: int = 60,
        burst_limit: int = 10,
    ):
        super().__init__(app)
        self.requests_per_minute = requests_per_minute
        self.burst_limit = burst_limit
        self.request_counts: Dict[str, list[datetime]] = defaultdict(list)
        self._lock = asyncio.Lock()

    def _get_client_ip(self, request: Request) -> str:
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            return forwarded.split(",")[0].strip()
        return request.client.host if request.client else "unknown"

    async def _is_rate_limited(self, client_ip: str) -> Tuple[bool, int]:
        now = datetime.utcnow()
        window_start = now - timedelta(minutes=1)
        last_second = now - timedelta(seconds=1)

        async with self._lock:
            timestamps = [
                ts for ts in self.request_counts[client_ip]
                if ts > window_start
            ]
            self.request_counts[client_ip] = timestamps

            request_count = len(timestamps)
            burst_count = sum(1 for ts in timestamps if ts > last_second)

            if burst_count >= self.burst_limit:
                return True, 1

            if request_count >= self.requests_per_minute:
                oldest = min(timestamps)
                retry_after = int(
                    (oldest + timedelta(minutes=1) - now).total_seconds()
                ) + 1
                return True, max(retry_after, 1)

            self.request_counts[client_ip].append(now)
            return False, 0

    async def dispatch(self, request: Request, call_next):
        if request.url.path in {"/", "/health", "/api/docs", "/api/redoc"}:
            return await call_next(request)

        client_ip = self._get_client_ip(request)
        is_limited, retry_after = await self._is_rate_limited(client_ip)

        if is_limited:
            return JSONResponse(
                status_code=HTTP_429_TOO_MANY_REQUESTS,
                content={"detail": "Rate limit exceeded. Please slow down."},
                headers={"Retry-After": str(retry_after)},
            )

        return await call_next(request)


class AuthRateLimitMiddleware(BaseHTTPMiddleware):
    """
    Stricter rate limiting for authentication endpoints.
    Protects against brute-force attacks.
    """

    def __init__(
        self,
        app,
        max_attempts: int = 5,
        lockout_minutes: int = 15,
    ):
        super().__init__(app)
        self.max_attempts = max_attempts
        self.lockout_minutes = lockout_minutes
        self.failed_attempts: Dict[str, list[datetime]] = defaultdict(list)
        self._lock = asyncio.Lock()

    def _get_client_ip(self, request: Request) -> str:
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            return forwarded.split(",")[0].strip()
        return request.client.host if request.client else "unknown"

    async def _check_lockout(self, client_ip: str) -> Tuple[bool, int]:
        now = datetime.utcnow()
        window_start = now - timedelta(minutes=self.lockout_minutes)

        async with self._lock:
            attempts = [
                ts for ts in self.failed_attempts[client_ip]
                if ts > window_start
            ]
            self.failed_attempts[client_ip] = attempts

            if len(attempts) >= self.max_attempts:
                oldest = min(attempts)
                retry_after = int(
                    (oldest + timedelta(minutes=self.lockout_minutes) - now).total_seconds()
                )
                return True, max(retry_after, 1)

            return False, 0

    async def record_failed_attempt(self, client_ip: str):
        async with self._lock:
            self.failed_attempts[client_ip].append(datetime.utcnow())

    async def clear_attempts(self, client_ip: str):
        async with self._lock:
            self.failed_attempts[client_ip].clear()

    async def dispatch(self, request: Request, call_next):
        auth_paths = {
            "/api/v1/auth/login",
            "/api/v1/auth/2fa/verify",
        }

        if request.url.path not in auth_paths:
            return await call_next(request)

        client_ip = self._get_client_ip(request)
        is_locked, retry_after = await self._check_lockout(client_ip)

        if is_locked:
            return JSONResponse(
                status_code=HTTP_429_TOO_MANY_REQUESTS,
                content={
                    "detail": (
                        f"Too many failed attempts. "
                        f"Please try again in {retry_after} seconds."
                    )
                },
                headers={"Retry-After": str(retry_after)},
            )

        response = await call_next(request)

        if response.status_code == 401:
            await self.record_failed_attempt(client_ip)
        elif response.status_code == 200 and request.url.path.endswith("/login"):
            await self.clear_attempts(client_ip)

        return response
