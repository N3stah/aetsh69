import json
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.database import get_db

router = APIRouter(tags=["Cooking"])

@router.get("/")
async def get_recipes(db: AsyncSession = Depends(get_db)):
    result = await db.execute(text("SELECT * FROM recipes ORDER BY created_at DESC"))
    return [row._mapping for row in result.fetchall()]

@router.post("/", status_code=201)
async def create_recipe(payload: dict, db: AsyncSession = Depends(get_db)):
    query = text("""
        INSERT INTO recipes (
            id, slug, title, description, cuisine_type, difficulty, 
            prep_time_minutes, cook_time_minutes, servings, ingredients, 
            instructions, meal_type, dietary_tags, tags, is_featured
        ) VALUES (
            gen_random_uuid(), :slug, :title, :description, :cuisine_type, :difficulty,
            :prep_time_minutes, :cook_time_minutes, :servings, CAST(:ingredients AS jsonb),
            CAST(:instructions AS jsonb), :meal_type, CAST(:dietary_tags AS text[]), CAST(:tags AS text[]), false
        )
        RETURNING *
    """)
    result = await db.execute(query, {
        "slug": payload.get("slug", payload.get("title", "").lower().replace(" ", "-")),
        "title": payload.get("title"),
        "description": payload.get("description", ""),
        "cuisine_type": payload.get("cuisine_type", "Kenyan"),
        "difficulty": payload.get("difficulty", "easy"),
        "prep_time_minutes": payload.get("prep_time_minutes", 10),
        "cook_time_minutes": payload.get("cook_time_minutes", 20),
        "servings": payload.get("servings", 4),
        "ingredients": json.dumps(payload.get("ingredients", [])),
        "instructions": json.dumps(payload.get("instructions", [])),
        "meal_type": payload.get("meal_type", "dinner"),
        "dietary_tags": payload.get("dietary_tags", []),
        "tags": payload.get("tags", ["kenyan"])
    })
    await db.commit()
    return result.fetchone()._mapping
