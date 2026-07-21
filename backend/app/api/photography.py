from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.database import get_db

router = APIRouter(tags=["Photography"])

@router.get("/")
async def get_photos(db: AsyncSession = Depends(get_db)):
    result = await db.execute(text("SELECT * FROM photos ORDER BY created_at DESC"))
    return [row._mapping for row in result.fetchall()]

@router.post("/", status_code=201)
async def create_photo(payload: dict, db: AsyncSession = Depends(get_db)):
    query = text("""
        INSERT INTO photos (title, image_url, location, description)
        VALUES (:title, :image_url, :location, :description)
        RETURNING id, title, image_url, location, description
    """)
    result = await db.execute(query, {
        "title": payload.get("title"),
        "image_url": payload.get("image_url"),
        "location": payload.get("location", "Nairobi, Kenya"),
        "description": payload.get("description", "")
    })
    await db.commit()
    return result.fetchone()._mapping
