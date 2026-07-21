from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp
import time, uuid, logging

logger = logging.getLogger("ecosystem.access")

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    HEADERS = {
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
        "Referrer-Policy": "strict-origin-when-cross-origin",
        "Strict-Transport-Security": "max-age=63072000; includeSubDomains",
    }
    async def dispatch(self, request: Request, call_next) -> Response:
        response = await call_next(request)
        for k, v in self.HEADERS.items():
            response.headers[k] = v
        return response

class RequestLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        request_id = str(uuid.uuid4())
        start = time.monotonic()
        response = await call_next(request)
        ms = int((time.monotonic() - start) * 1000)
        response.headers["X-Request-ID"] = request_id
        logger.info("%s %s %d %dms", request.method, request.url.path, response.status_code, ms)
        return response

class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app: ASGIApp, calls: int = 100, period: int = 60):
        super().__init__(app)
        self.calls = calls
        self.period = period
        self._cache: dict = {}

    async def dispatch(self, request: Request, call_next) -> Response:
        if request.url.path in ("/api/health/ping", "/api/health/"):
            return await call_next(request)
        from fastapi.responses import JSONResponse
        ip = request.client.host if request.client else "unknown"
        now = time.monotonic()
        timestamps = [t for t in self._cache.get(ip, []) if t > now - self.period]
        if len(timestamps) >= self.calls:
            return JSONResponse(status_code=429, content={"detail": "Rate limit exceeded"})
        timestamps.append(now)
        self._cache[ip] = timestamps
        return await call_next(request)
