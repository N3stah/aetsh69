from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import Request, Response
import time
import logging

logger = logging.getLogger(__name__)

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response: Response = await call_next(request)
        # HSTS: Force HTTPS for 1 year, including subdomains
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        # Prevent MIME-sniffing
        response.headers["X-Content-Type-Options"] = "nosniff"
        # Clickjacking protection
        response.headers["X-Frame-Options"] = "DENY"
        # XSS Protection (legacy, but good to have)
        response.headers["X-XSS-Protection"] = "1; mode=block"
        # Referrer Policy
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        return response

class RequestLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        response = await call_next(request)
        process_time = (time.time() - start_time) * 1000
        formatted_time = "{:.2f}".format(process_time)
        logger.info(f"{request.method} {request.url.path} - {response.status_code} - {formatted_time}ms")
        return response

class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, calls: int = 100, period: int = 60):
        super().__init__(app)
        self.calls = calls
        self.period = period
        self.records = {}

    async def dispatch(self, request: Request, call_next):
        client_ip = request.client.host if request.client else "unknown"
        current_time = time.time()
        
        if client_ip not in self.records:
            self.records[client_ip] = []
            
        # Remove old timestamps
        self.records[client_ip] = [t for t in self.records[client_ip] if current_time - t < self.period]
        
        if len(self.records[client_ip]) >= self.calls:
            return Response(content="Rate limit exceeded", status_code=429)
            
        self.records[client_ip].append(current_time)
        return await call_next(request)
