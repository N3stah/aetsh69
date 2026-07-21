import uuid, json
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.database import get_db

router = APIRouter()

class ProjectCreate(BaseModel):
    title: str
    slug: Optional[str] = None
    tagline: Optional[str] = None
    description: str
    content: Optional[str] = None
    cover_image_url: Optional[str] = None
    tech_stack: list[str] = []
    links: dict = {}
    status: str = "published"
    featured: bool = False

@router.get("/")
async def list_projects(
    featured: Optional[bool] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    filters = ["status = 'published'"]
    params: dict = {}
    if featured is not None:
        filters.append("featured = :featured")
        params["featured"] = featured
    result = await db.execute(
        text(f"""
            SELECT id, title, slug, tagline, cover_image_url, tech_stack,
                   links, featured, sort_order, start_date, end_date, is_ongoing
            FROM projects WHERE {" AND ".join(filters)}
            ORDER BY sort_order ASC, featured DESC, created_at DESC
        """), params
    )
    return [dict(r._mapping) for r in result.fetchall()]

@router.get("/{slug}")
async def get_project(slug: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        text("SELECT * FROM projects WHERE slug = :slug AND status = 'published'"), {"slug": slug}
    )
    project = result.fetchone()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    await db.execute(
        text("UPDATE projects SET view_count = view_count + 1 WHERE slug = :slug"), {"slug": slug}
    )
    return dict(project._mapping)

@router.post("/", status_code=201)
async def create_project(data: ProjectCreate, db: AsyncSession = Depends(get_db)):
    from python_slugify import slugify
    slug = data.slug or slugify(data.title)
    project_id = uuid.uuid4()
    await db.execute(
        text("""
            INSERT INTO projects (id, title, slug, tagline, description, content,
                cover_image_url, tech_stack, links, status, featured)
            VALUES (:id, :title, :slug, :tagline, :desc, :content,
                :cover, :tech::jsonb, :links::jsonb, :status, :featured)
        """),
        {"id": project_id, "title": data.title, "slug": slug, "tagline": data.tagline,
         "desc": data.description, "content": data.content, "cover": data.cover_image_url,
         "tech": json.dumps(data.tech_stack), "links": json.dumps(data.links),
         "status": data.status, "featured": data.featured}
    )
    return {"id": str(project_id), "slug": slug}
