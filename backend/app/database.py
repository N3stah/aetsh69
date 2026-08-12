from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from app.config import settings

engine = create_async_engine(
    settings.DATABASE_URL,
    pool_size=5,          # Reduced for Render free tier
    max_overflow=5,       # Reduced for Render free tier
    pool_timeout=30,      # Wait max 30s for a connection
    pool_pre_ping=True,   # Automatically recover dropped connections
    echo=False
)

AsyncSessionLocal = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False
)

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
