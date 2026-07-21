from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.database import get_db

router = APIRouter()

@router.get("/")
async def search(q: str = Query(..., min_length=1), db: AsyncSession = Depends(get_db)):
    query = text("""
        SELECT id, title, slug, 'blog' as type, excerpt,
               ts_rank_cd(
                   to_tsvector('english', coalesce(title, '') || ' ' || coalesce(excerpt, '') || ' ' || coalesce(content, '')), 
                   plainto_tsquery(:q)
               ) as rank
        FROM blog_posts 
        WHERE status = 'published' AND to_tsvector('english', coalesce(title, '') || ' ' || coalesce(excerpt, '') || ' ' || coalesce(content, '')) @@ plainto_tsquery(:q)
        
        UNION ALL
        
        SELECT id, title, slug, 'project' as type, tagline as excerpt,
               ts_rank_cd(
                   to_tsvector('english', coalesce(title, '') || ' ' || coalesce(tagline, '') || ' ' || coalesce(tech_stack::text, '')), 
                   plainto_tsquery(:q)
               ) as rank
        FROM projects 
        WHERE status = 'published' AND to_tsvector('english', coalesce(title, '') || ' ' || coalesce(tagline, '') || ' ' || coalesce(tech_stack::text, '')) @@ plainto_tsquery(:q)
        
        ORDER BY rank DESC
        LIMIT 10
    """)
    result = await db.execute(query, {"q": q})
    return [dict(r._mapping) for r in result.fetchall()]
