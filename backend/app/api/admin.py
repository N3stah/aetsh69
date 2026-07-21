import logging
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
import jwt
from app.database import get_db
from app.config import settings

router = APIRouter()
logger = logging.getLogger(__name__)

def require_admin(request: Request) -> str:
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        if payload.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Admin access required")
        return payload["sub"]
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

@router.get("/stats")
async def get_stats(request: Request, db: AsyncSession = Depends(get_db)):
    require_admin(request)
    users = await db.execute(text("SELECT COUNT(*) FROM users"))
    contacts = await db.execute(text("SELECT COUNT(*) FROM service_inquiries"))
    payments = await db.execute(text("SELECT COUNT(*), COALESCE(SUM(amount_kes),0) FROM payments WHERE status='success'"))
    u = users.scalar()
    c = contacts.scalar()
    p = payments.fetchone()
    return {"total_users": u, "total_contacts": c, "total_orders": p[0], "total_revenue_kes": float(p[1])}

@router.get("/users")
async def get_users(request: Request, db: AsyncSession = Depends(get_db)):
    require_admin(request)
    result = await db.execute(text("""
        SELECT id, email, full_name, role, is_verified, created_at
        FROM users ORDER BY created_at DESC LIMIT 100
    """))
    rows = result.fetchall()
    return [{"id": str(r.id), "email": r.email, "full_name": r.full_name,
             "role": r.role, "is_verified": r.is_verified,
             "created_at": r.created_at} for r in rows]

class RoleUpdate(BaseModel):
    role: str

@router.patch("/users/{user_id}/role")
async def update_user_role(user_id: str, data: RoleUpdate, request: Request, db: AsyncSession = Depends(get_db)):
    require_admin(request)
    valid_roles = ['free', 'supporter', 'builder', 'pro', 'enterprise', 'vip', 'admin']
    if data.role not in valid_roles:
        raise HTTPException(status_code=400, detail=f"Invalid role. Must be one of: {valid_roles}")
    await db.execute(text("UPDATE users SET role=:role WHERE id=:id"), {"role": data.role, "id": user_id})
    await db.commit()
    return {"message": f"Role updated to {data.role}"}

@router.get("/contacts")
async def get_contacts(request: Request, db: AsyncSession = Depends(get_db)):
    require_admin(request)
    result = await db.execute(text("""
        SELECT id, customer_name, customer_email, description, status, created_at
        FROM service_inquiries ORDER BY created_at DESC LIMIT 50
    """))
    rows = result.fetchall()
    return [{"id": str(r.id), "customer_name": r.customer_name,
             "customer_email": r.customer_email, "description": r.description,
             "status": r.status, "created_at": r.created_at} for r in rows]

@router.get("/ai-analytics")
async def get_ai_analytics(request: Request, db: AsyncSession = Depends(get_db)):
    require_admin(request)
    result = await db.execute(text(
        "SELECT question, context, provider, created_at FROM ai_analytics ORDER BY created_at DESC LIMIT 50"
    ))
    return [dict(r._mapping) for r in result.fetchall()]
