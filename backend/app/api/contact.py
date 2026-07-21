import uuid
from fastapi import APIRouter, Depends
from pydantic import BaseModel, EmailStr
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.database import get_db
from typing import Optional

router = APIRouter()

class ContactMessage(BaseModel):
    name: str
    email: EmailStr
    subject: Optional[str] = None
    message: str

@router.post("/", status_code=201)
async def send_message(data: ContactMessage, db: AsyncSession = Depends(get_db)):
    msg_id = uuid.uuid4()
    await db.execute(
        text("""
            INSERT INTO service_inquiries 
            (id, service_type, service_name, customer_name, customer_email, 
             customer_phone, customer_location, description, status, source)
            VALUES 
            (:id, 'enterprise', :subject, :name, :email, 
             'N/A', 'N/A', :message, 'new', 'website')
        """),
        {
            "id": msg_id,
            "subject": data.subject or "Enterprise Enquiry",
            "name": data.name,
            "email": data.email,
            "message": data.message,
        }
    )
    await db.commit()
    return {"id": str(msg_id), "message": "Message received. I'll get back to you within 24 hours."}
