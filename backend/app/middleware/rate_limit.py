"""
Rate limiting middleware for API protection.
"""
from datetime import datetime, timedelta
from typing import Dict, Tuple
from collections import defaultdict
import asyncio

from fastapi import Request, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware

from app.core.config import settings


class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    Simple in-memory rate limiting middleware.
    For production, use Redis-based rate limiting.
    """
    
    def __init__(self, app, requests_per_minute: int = 60, burst_limit: int = 10):
        super().__init__(app)
        self.requests_per_minute = requests_per_minute
        self.burst_limit = burst_limit
        self.request_counts: Dict[str, list] = defaultdict(list)
        self._lock = asyncio.Lock()
    
    def _get_client_ip(self, request: Request) -> str:
        """Get client IP from request, handling proxies."""
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            return forwarded.split(",")[0].strip()
        return request.client.host if request.client else "unknown"
    
    async def _is_rate_limited(self, client_ip: str) -> Tuple[bool, int]:
        """Check if client is rate limited. Returns (is_limited, retry_after_seconds)."""
        now = datetime.now()
        window_start = now - timedelta(minutes=1)
        
        async with self._lock:
            # Clean old requests
            self.request_counts[client_ip] = [
                ts for ts in self.request_counts[client_ip]
                if ts > window_start
            ]
            
            request_count = len(self.request_counts[client_ip])
            
            # Check burst limit (requests in last second)
            last_second = now - timedelta(seconds=1)
            burst_count = sum(1 for ts in self.request_counts[client_ip] if ts > last_second)
            
            if burst_count >= self.burst_limit:
                return True, 1
            
            if request_count >= self.requests_per_minute:
                oldest = min(self.request_counts[client_ip])
                retry_after = int((oldest + timedelta(minutes=1) - now).total_seconds()) + 1
                return True, max(retry_after, 1)
            
            # Record this request
            self.request_counts[client_ip].append(now)
            return False, 0
    
    async def dispatch(self, request: Request, call_next):
        # Skip rate limiting for health checks
        if request.url.path in ["/health", "/", "/api/docs", "/api/redoc"]:
            return await call_next(request)
        
        client_ip = self._get_client_ip(request)
        is_limited, retry_after = await self._is_rate_limited(client_ip)
        
        if is_limited:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Rate limit exceeded. Please slow down.",
                headers={"Retry-After": str(retry_after)},
            )
        
        response = await call_next(request)
        return response


class AuthRateLimitMiddleware(BaseHTTPMiddleware):
    """
    Stricter rate limiting for authentication endpoints.
    Prevents brute force attacks.
    """
    
    def __init__(self, app, max_attempts: int = 5, lockout_minutes: int = 15):
        super().__init__(app)
        self.max_attempts = max_attempts
        self.lockout_minutes = lockout_minutes
        self.failed_attempts: Dict[str, list] = defaultdict(list)
        self._lock = asyncio.Lock()
    
    def _get_client_ip(self, request: Request) -> str:
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            return forwarded.split(",")[0].strip()
        return request.client.host if request.client else "unknown"
    
    async def _check_lockout(self, client_ip: str) -> Tuple[bool, int]:
        """Check if client is locked out."""
        now = datetime.now()
        lockout_window = now - timedelta(minutes=self.lockout_minutes)
        
        async with self._lock:
            # Clean old attempts
            self.failed_attempts[client_ip] = [
                ts for ts in self.failed_attempts[client_ip]
                if ts > lockout_window
            ]
            
            if len(self.failed_attempts[client_ip]) >= self.max_attempts:
                oldest = min(self.failed_attempts[client_ip])
                retry_after = int((oldest + timedelta(minutes=self.lockout_minutes) - now).total_seconds())
                return True, max(retry_after, 1)
            
            return False, 0
    
    async def record_failed_attempt(self, client_ip: str):
        """Record a failed login attempt."""
        async with self._lock:
            self.failed_attempts[client_ip].append(datetime.now())
    
    async def clear_attempts(self, client_ip: str):
        """Clear failed attempts after successful login."""
        async with self._lock:
            self.failed_attempts[client_ip] = []
    
    async def dispatch(self, request: Request, call_next):
        # Only apply to auth endpoints
        auth_paths = ["/api/v1/auth/login", "/api/v1/auth/2fa/verify"]
        if request.url.path not in auth_paths:
            return await call_next(request)
        
        client_ip = self._get_client_ip(request)
        is_locked, retry_after = await self._check_lockout(client_ip)
        
        if is_locked:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Too many failed attempts. Please try again in {retry_after} seconds.",
                headers={"Retry-After": str(retry_after)},
            )
        
        response = await call_next(request)
        
        # Record failed attempt if login failed
        if response.status_code == 401:
            await self.record_failed_attempt(client_ip)
        elif response.status_code == 200 and request.url.path == "/api/v1/auth/login":
            await self.clear_attempts(client_ip)
        
        return response
