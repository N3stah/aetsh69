import uuid, logging
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.database import get_db

router = APIRouter()
logger = logging.getLogger(__name__)

class PostCreate(BaseModel):
    title: str
    slug: Optional[str] = None
    excerpt: Optional[str] = None
    content: str
    category_id: Optional[str] = None
    cover_image_url: Optional[str] = None
    status: str = "draft"
    featured: bool = False
    tag_ids: list[str] = []
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None

@router.get("/categories")
async def list_categories(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        text("SELECT id, name, slug, description, COALESCE(color, '#B8552F') as color, COALESCE(icon, 'filetext') as icon, COALESCE(sort_order, 0) as sort_order FROM blog_categories ORDER BY sort_order, name")
    )
    return [dict(r._mapping) for r in result.fetchall()]

@router.get("/posts")
async def list_posts(
    page: int = Query(1, ge=1),
    per_page: int = Query(12, ge=1, le=50),
    category: Optional[str] = Query(None),
    featured: Optional[bool] = Query(None),
    search: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    offset = (page - 1) * per_page
    filters = ["bp.status = 'published'"]
    params: dict = {"limit": per_page, "offset": offset}
    if category:
        filters.append("c.slug = :category")
        params["category"] = category
    if featured is not None:
        filters.append("bp.featured = :featured")
        params["featured"] = featured
    if search:
        filters.append("(bp.title ILIKE :search OR bp.excerpt ILIKE :search)")
        params["search"] = f"%{search}%"
    where = " AND ".join(filters)
    count = await db.execute(
        text(f"SELECT COUNT(*) FROM blog_posts bp LEFT JOIN blog_categories c ON bp.category_id=c.id WHERE {where}"),
        params
    )
    total = count.scalar()
    result = await db.execute(
        text(f"""
            SELECT bp.id, bp.title, bp.slug, bp.excerpt, bp.cover_image_url,
                   bp.featured, bp.reading_time, bp.view_count, bp.like_count,
                   bp.published_at, bp.created_at,
                   c.name as category_name, c.slug as category_slug
            FROM blog_posts bp
            LEFT JOIN blog_categories c ON bp.category_id = c.id
            WHERE {where}
            ORDER BY bp.published_at DESC NULLS LAST
            LIMIT :limit OFFSET :offset
        """), params
    )
    return {
        "posts": [dict(r._mapping) for r in result.fetchall()],
        "total": total, "page": page,
        "pages": (total + per_page - 1) // per_page,
    }

@router.get("/post/{slug}")
async def get_post(slug: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        text("""
            SELECT bp.id, bp.title, bp.slug, bp.excerpt, bp.content,
                   bp.cover_image_url, bp.status, bp.featured, bp.reading_time,
                   bp.view_count, bp.like_count, bp.published_at, bp.created_at,
                   bp.seo_title, bp.seo_description,
                   c.name as category_name, c.slug as category_slug,
                   COALESCE(u.full_name, 'Mark Manoti Ndege') as author_name,
                   u.avatar_url as author_avatar
            FROM blog_posts bp
            LEFT JOIN blog_categories c ON bp.category_id = c.id
            LEFT JOIN users u ON bp.author_id = u.id
            WHERE bp.slug = :slug AND bp.status = 'published'
        """), {"slug": slug}
    )
    post = result.fetchone()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    await db.execute(
        text("UPDATE blog_posts SET view_count = view_count + 1 WHERE slug = :slug"), {"slug": slug}
    )
    tags = await db.execute(
        text("SELECT t.name, t.slug FROM blog_tags t JOIN blog_post_tags bpt ON t.id=bpt.tag_id WHERE bpt.post_id=:id"),
        {"id": post.id}
    )
    return {**dict(post._mapping), "tags": [dict(t._mapping) for t in tags.fetchall()]}

@router.post("/posts", status_code=201)
async def create_post(data: PostCreate, db: AsyncSession = Depends(get_db)):
    from python_slugify import slugify
    slug = data.slug or slugify(data.title)
    words = len(data.content.split())
    reading_time = max(1, round(words / 200))
    post_id = uuid.uuid4()
    from datetime import datetime
    published_at = datetime.utcnow() if data.status == "published" else None
    await db.execute(
        text("""
            INSERT INTO blog_posts (id, author_id, title, slug, excerpt, content,
                cover_image_url, status, featured, reading_time, seo_title,
                seo_description, published_at)
            VALUES (:id, :author_id, :title, :slug, :excerpt, :content,
                :cover, :status, :featured, :rt, :seo_t, :seo_d, :pub)
        """),
        {"id": post_id, "author_id": '00000000-0000-0000-0000-000000000001', "title": data.title, "slug": slug,
         "excerpt": data.excerpt, "content": data.content,
         "cover": data.cover_image_url, "status": data.status,
         "featured": data.featured, "rt": reading_time,
         "seo_t": data.seo_title, "seo_d": data.seo_description, "pub": published_at}
    )
    return {"id": str(post_id), "slug": slug}

@router.post("/{post_id}/like")
async def like_post(post_id: str, db: AsyncSession = Depends(get_db)):
    await db.execute(
        text("UPDATE blog_posts SET like_count = like_count + 1 WHERE id = :id"),
        {"id": uuid.UUID(post_id)}
    )
    return {"liked": True}
