import uuid
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.database import get_db

router = APIRouter()

SERVICES = [
    {"id": "smart-tv", "name": "Smart TV & Entertainment Setup",
     "description": "Stremio, Netflix, IPTV, sports streaming, FireStick setup and configuration.",
     "icon": "tv", "pricing": {"from": 1500, "currency": "KES", "model": "fixed"}},
    {"id": "cctv", "name": "CCTV & Home Security",
     "description": "Small CCTV systems, IP cameras, DVR/NVR setup, remote viewing configuration.",
     "icon": "camera", "pricing": {"from": 5000, "currency": "KES", "model": "fixed"}},
    {"id": "networking", "name": "Network Optimisation",
     "description": "Router setup, Wi-Fi optimisation, LAN cabling, network troubleshooting.",
     "icon": "wifi", "pricing": {"from": 2000, "currency": "KES", "model": "fixed"}},
    {"id": "computer", "name": "Computer Maintenance",
     "description": "Software checkup, virus removal, performance optimisation, hardware recommendations.",
     "icon": "laptop", "pricing": {"from": 1000, "currency": "KES", "model": "fixed"}},
    {"id": "cyber", "name": "Cyber Services",
     "description": "KRA returns, eCitizen services, NHIF, NSSF, business registration, and government portals.",
     "icon": "shield", "pricing": {"from": 300, "currency": "KES", "model": "fixed"}},
    {"id": "documents", "name": "Professional Documents",
     "description": "CV writing, business plans, invoices, presentations, logo and graphic design.",
     "icon": "file-text", "pricing": {"from": 500, "currency": "KES", "model": "fixed"}},
    {"id": "it-consultation", "name": "IT Consultation",
     "description": "Project planning, system architecture advice, technology stack recommendations, problem solving.",
     "icon": "briefcase", "pricing": {"from": 2000, "currency": "KES", "model": "hourly"}},
]

class InquiryCreate(BaseModel):
    service_id: str
    name: str
    email: EmailStr
    phone: Optional[str] = None
    message: str
    location: Optional[str] = None
    budget_kes: Optional[float] = None
    preferred_date: Optional[str] = None

@router.get("/")
async def list_services():
    return SERVICES

@router.get("/{service_id}")
async def get_service(service_id: str):
    service = next((s for s in SERVICES if s["id"] == service_id), None)
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    return service

@router.post("/inquire", status_code=201)
async def submit_inquiry(data: InquiryCreate, db: AsyncSession = Depends(get_db)):
    inquiry_id = uuid.uuid4()
    await db.execute(
        text("""
            INSERT INTO service_inquiries
                (id, service_id, name, email, phone, message, location, budget_kes, status)
            VALUES (:id, :sid, :name, :email, :phone, :msg, :loc, :budget, 'new')
        """),
        {"id": inquiry_id, "sid": data.service_id, "name": data.name,
         "email": data.email, "phone": data.phone, "msg": data.message,
         "loc": data.location, "budget": data.budget_kes}
    )
    return {
        "id": str(inquiry_id),
        "message": "Inquiry received. We'll contact you within 24 hours via email or WhatsApp.",
    }

@router.post("/", status_code=201)
async def create_service(payload: dict, db: AsyncSession = Depends(get_db)):
    query = text("""
        INSERT INTO services (name, description, price_kes, features, delivery_time, icon)
        VALUES (:name, :description, :price_kes, :features, :delivery_time, :icon)
        RETURNING id, name, description, price_kes, features, delivery_time, icon
    """)
    result = await db.execute(query, {
        "name": payload.get("name"),
        "description": payload.get("description"),
        "price_kes": payload.get("price_kes"),
        "features": payload.get("features", []),
        "delivery_time": payload.get("delivery_time", "Flexible"),
        "icon": payload.get("icon", "Wrench")
    })
    await db.commit()
    return result.fetchone()._mapping
