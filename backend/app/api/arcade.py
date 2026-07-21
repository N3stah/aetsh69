import uuid
from typing import Optional
from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.database import get_db

router = APIRouter()

GAMES = [
    {"id": "snake", "name": "Snake", "description": "Classic snake game. Eat food, grow longer, don't hit the walls.",
     "genre": "arcade", "icon": "🐍", "high_score_label": "Length"},
    {"id": "tic-tac-toe", "name": "Tic-Tac-Toe", "description": "Play against the AI or a friend.",
     "genre": "strategy", "icon": "⭕", "high_score_label": "Wins"},
    {"id": "memory-match", "name": "Memory Match", "description": "Flip cards and find matching pairs.",
     "genre": "memory", "icon": "🃏", "high_score_label": "Best time (s)"},
    {"id": "sudoku", "name": "Sudoku", "description": "Classic 9×9 number puzzle.",
     "genre": "puzzle", "icon": "🔢", "high_score_label": "Best time (s)"},
]

class ScoreSubmit(BaseModel):
    game_id: str
    score: int
    duration_seconds: Optional[int] = None
    metadata: dict = {}
    user_id: Optional[str] = None

@router.get("/games")
async def list_games():
    return GAMES

@router.get("/games/{game_id}")
async def get_game(game_id: str):
    game = next((g for g in GAMES if g["id"] == game_id), None)
    if not game:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Game not found")
    return game

@router.get("/leaderboard/{game_id}")
async def get_leaderboard(
    game_id: str,
    limit: int = Query(10, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        text("""
            SELECT gs.score, gs.duration_s, gs.played_at,
                   COALESCE(u.username, u.full_name, 'Anonymous') as player
            FROM game_sessions gs
            LEFT JOIN users u ON gs.user_id = u.id
            JOIN games g ON gs.game_id = g.id
            WHERE g.slug = :game_id
            ORDER BY gs.score DESC
            LIMIT :limit
        """),
        {"game_id": game_id, "limit": limit}
    )
    return [dict(r._mapping) for r in result.fetchall()]

@router.post("/scores", status_code=201)
async def submit_score(data: ScoreSubmit, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        text("SELECT id FROM games WHERE slug = :slug"), {"slug": data.game_id}
    )
    game = result.fetchone()
    if not game:
        result2 = await db.execute(
            text("INSERT INTO games (id, name, slug, is_active) VALUES (:id,:name,:slug,TRUE) ON CONFLICT (slug) DO NOTHING RETURNING id"),
            {"id": uuid.uuid4(), "name": data.game_id.replace("-"," ").title(), "slug": data.game_id}
        )
        game_db_id = (result2.fetchone() or await db.execute(
            text("SELECT id FROM games WHERE slug=:slug"), {"slug": data.game_id}
        ).fetchone()).id
    else:
        game_db_id = game.id
    import json
    session_id = uuid.uuid4()
    await db.execute(
        text("""
            INSERT INTO game_sessions (id, game_id, user_id, score, duration_s, metadata)
            VALUES (:id, :gid, :uid, :score, :dur, :meta::jsonb)
        """),
        {"id": session_id, "gid": game_db_id, "uid": data.user_id, "score": data.score,
         "dur": data.duration_seconds, "meta": json.dumps(data.metadata)}
    )
    return {"session_id": str(session_id), "score": data.score}
