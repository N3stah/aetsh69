from sqlalchemy import Column, String, Boolean, DateTime, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.database import Base
import uuid

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    username = Column(String, unique=True, index=True, nullable=True)
    role = Column(String, default="free")
    is_verified = Column(Boolean, default=False)
    avatar_url = Column(String, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
    last_login_at = Column(DateTime, nullable=True)
    last_login_ip = Column(String, nullable=True)
    login_attempts = Column(Integer, default=0)
    locked_until = Column(DateTime, nullable=True)
    verification_token = Column(String, nullable=True, unique=True)
    verification_token_expires = Column(DateTime, nullable=True)
    reset_token = Column(String, nullable=True, unique=True, index=True)
    reset_token_expires = Column(DateTime, nullable=True)
