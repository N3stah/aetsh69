import os
import redis
import logging
from fastapi import HTTPException, Request

logger = logging.getLogger(__name__)

REDIS_URL = os.getenv("REDIS_URL")
redis_client = None

if REDIS_URL:
    try:
        redis_client = redis.from_url(REDIS_URL, decode_responses=True)
        logger.info("Connected to Upstash Redis for rate limiting.")
    except Exception as e:
        logger.error(f"Failed to connect to Redis: {e}")

def rate_limiter(limit: int, window: int):
    """
    FastAPI dependency for Redis-based rate limiting.
    :param limit: Max requests allowed.
    :param window: Time window in seconds.
    """
    async def limiter(request: Request):
        if not redis_client:
            return # Skip if Redis isn't configured

        client_ip = request.client.host if request.client else "unknown"
        key = f"rate_limit:{request.url.path}:{client_ip}"
        
        try:
            current = redis_client.incr(key)
            if current == 1:
                redis_client.expire(key, window)
            
            if current > limit:
                raise HTTPException(status_code=429, detail="Too many requests. Please try again later.")
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Rate limiter error: {e}")
            # Fail open if Redis goes down, but log it
            pass 
            
    return limiter
