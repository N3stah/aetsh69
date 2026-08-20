from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy import text
from fastapi import Depends
from app.config import settings
from app.utils.security import get_user_id_from_token

Base = declarative_base()

engine = create_async_engine(
    settings.DATABASE_URL,
    pool_size=5,
    max_overflow=5,
    pool_timeout=30,
    pool_pre_ping=True,
    echo=False
)

AsyncSessionLocal = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False
)

# Public database session (no RLS)
async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

# Secure database session (requires auth, sets RLS context)
async def get_secure_db(user_id: str = Depends(get_user_id_from_token)):
    async with AsyncSessionLocal() as session:
        # Set the PostgreSQL session variable for Row-Level Security
        await session.execute(text("SET LOCAL app.user_id = :uid"), {"uid": user_id})
        yield session
