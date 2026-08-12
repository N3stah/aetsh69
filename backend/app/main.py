import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
import logging

from app.config import settings
from app.database import engine, Base
from app.middleware.security import SecurityHeadersMiddleware, RequestLoggingMiddleware, RateLimitMiddleware

from app.api.health import router as health_router
from app.api.auth import router as auth_router
from app.api.ai import router as ai_router
from app.api.blog import router as blog_router
from app.api.portfolio import router as projects_router
from app.api.photography import router as photography_router
from app.api.cooking import router as recipes_router
from app.api.shop import router as shop_router
from app.api.services import router as services_router
from app.api.hobbies import router as hobbies_router
from app.api.arcade import router as arcade_router
from app.api.membership import router as membership_router
from app.api.contact import router as contact_router
from app.api.payments import router as payments_router
from app.api.admin import router as admin_router
from app.api.search import router as search_router
from app.api.media import router as media_router

logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("AETSH-69 Ecosystem starting...")
    UPLOAD_DIR = "uploads/avatars"
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Backend online.")
    yield
    await engine.dispose()

app = FastAPI(
    title="Personal Tech Ecosystem — AETSH-69",
    description="Backend for the aetsh69.com personal platform",
    version="1.0.0",
    docs_url="/api/docs" if not settings.is_production else None,
    redoc_url="/api/redoc" if not settings.is_production else None,
    openapi_url="/api/openapi.json" if not settings.is_production else None,
    lifespan=lifespan,
    redirect_slashes=False,
)

# --- SECURITY MIDDLEWARES ---

# 1. Trusted Host Middleware (Prevents Host header spoofing)
allowed_hosts = ["localhost", "127.0.0.1", "aetsh69-backend.onrender.com", ".vercel.app"]
if settings.is_production:
    allowed_hosts.append("aetsh69.duckdns.org") # Add this later when DuckDNS is setup

app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=allowed_hosts
)

# 2. CORS Configuration
origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "https://aetsh69.vercel.app",
    "https://aetsh69.duckdns.org",
    "https://www.aetsh69.duckdns.org",
    settings.FRONTEND_URL,
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. Security Headers (Includes HSTS, XSS Protection, Content-Type Options)
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(RequestLoggingMiddleware)
app.add_middleware(RateLimitMiddleware, calls=100, period=60)
app.add_middleware(GZipMiddleware, minimum_size=1000)

# 4. Request Size Limiting Middleware (Prevents DoS via large payloads)
@app.middleware("http")
async def limit_request_size(request: Request, call_next):
    if request.method in ["POST", "PUT", "PATCH"]:
        content_length = request.headers.get("content-length")
        if content_length and int(content_length) > 15 * 1024 * 1024:  # 15 MB limit
            raise HTTPException(status_code=413, detail="Request body too large. Maximum size is 15MB.")
    return await call_next(request)

# Mount uploads directory for static serving
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.include_router(health_router,   prefix="/api/health",      tags=["Health"])
app.include_router(auth_router,     prefix="/api/auth",        tags=["Auth"])
app.include_router(ai_router,       prefix="/api/aetsh69",     tags=["AETSH-69"])
app.include_router(blog_router,     prefix="/api/blog",        tags=["Blog"])
app.include_router(projects_router, prefix="/api/projects",    tags=["Portfolio"])
app.include_router(photography_router, prefix="/api/photography", tags=["Photography"])
app.include_router(recipes_router,  prefix="/api/cooking",     tags=["Cooking"])
app.include_router(shop_router,     prefix="/api/shop",        tags=["Shop"])
app.include_router(services_router, prefix="/api/services",    tags=["Services"])
app.include_router(hobbies_router,  prefix="/api/hobbies",     tags=["Hobbies"])
app.include_router(arcade_router,   prefix="/api/arcade",      tags=["Arcade"])
app.include_router(membership_router, prefix="/api/membership", tags=["Membership"])
app.include_router(search_router,   prefix="/api/search",     tags=["Search"])
app.include_router(admin_router,    prefix="/api/admin",       tags=["Admin"])
app.include_router(media_router)
app.include_router(payments_router,  prefix="/api/payments",    tags=["Payments"])
app.include_router(contact_router,  prefix="/api/contact",     tags=["Contact"])

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error("Unhandled exception on %s: %s", request.url, exc, exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "An unexpected error occurred.",
                 "request_id": request.headers.get("X-Request-ID")},
    )

@app.get("/", include_in_schema=False)
async def root():
    return {"message": "AETSH-69 — Mark Manoti Ndege's Personal Tech Ecosystem", "version": "1.0.0", "ai": "AETSH-69 online"}

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "AETSH-69"}
