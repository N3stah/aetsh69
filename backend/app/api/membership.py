import uuid
from typing import Optional
from fastapi import APIRouter, Depends
from pydantic import BaseModel, EmailStr
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.database import get_db

router = APIRouter()

TIERS = [
    {"id": "free", "name": "Free", "price_kes": 0, "price_usd": 0,
     "perks": ["10 AI requests/day", "Access to all public content", "Arcade games"]},
    {"id": "supporter", "name": "Supporter", "price_kes": 500, "price_usd": 4,
     "perks": ["50 AI requests/day", "Downloadable resources", "Early content access", "Community badge"]},
    {"id": "pro", "name": "Pro", "price_kes": 2000, "price_usd": 15,
     "perks": ["200 AI requests/day", "All Supporter perks", "API access", "Priority support"]},
    {"id": "vip", "name": "VIP", "price_kes": 5000, "price_usd": 38,
     "perks": ["Unlimited AI requests", "All Pro perks", "Custom AI persona", "Direct WhatsApp line"]},
]

class DonationRequest(BaseModel):
    name: str
    email: EmailStr
    amount_kes: float
    message: Optional[str] = None
    payment_method: str = "mpesa"

@router.get("/tiers")
async def get_tiers():
    return TIERS

@router.post("/donate", status_code=201)
async def donate(data: DonationRequest, db: AsyncSession = Depends(get_db)):
    donation_id = uuid.uuid4()
    await db.execute(
        text("""
            INSERT INTO payments (id, provider, status, amount, currency)
            VALUES (:id, :provider, 'pending', :amount, 'KES')
        """),
        {"id": donation_id, "provider": data.payment_method, "amount": data.amount_kes}
    )
    return {
        "donation_id": str(donation_id),
        "amount_kes": data.amount_kes,
        "message": f"Thank you {data.name}! Complete your donation via {data.payment_method.upper()}.",
        "mpesa_number": "254XXXXXXXXX",
    }
