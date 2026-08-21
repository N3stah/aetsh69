import uuid, secrets, hashlib, logging
from datetime import datetime, timezone, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Request, BackgroundTasks, UploadFile, File, Form, status
from pydantic import BaseModel, EmailStr, field_validator
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text, select
import re, jwt
import bcrypt
import os, shutil
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from app.database import get_db, get_secure_db
from app.utils.limiter import rate_limiter
from app.utils.security import get_user_id_from_token
from app.models import User
from app.config import settings
from app.utils.email import send_password_reset_email

router = APIRouter()
logger = logging.getLogger(__name__)

# ---------- Password Hashing ----------
def hash_password(plain: str) -> str:
    password_bytes = plain.encode("utf-8")[:72]
    salt = bcrypt.gensalt(rounds=12)
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode("utf-8")

def verify_password(plain: str, hashed: str) -> bool:
    password_bytes = plain.encode("utf-8")[:72]
    hashed_bytes = hashed.encode("utf-8")
    return bcrypt.checkpw(password_bytes, hashed_bytes)

def get_password_hash(plain: str) -> str:
    return hash_password(plain)

# ---------- JWT ----------
def create_access_token(user_id: str, role: str) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": str(user_id), "role": role, "iat": now,
        "exp": now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
        "type": "access",
    }
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)

def hash_token(raw: str) -> str:
    return hashlib.sha256(raw.encode()).hexdigest()

# ---------- Pydantic ----------
class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None
    username: Optional[str] = None

    @field_validator("password")
    @classmethod
    def password_strength(cls, v):
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        if not re.search(r"[A-Z]", v):
            raise ValueError("Must contain an uppercase letter")
        if not re.search(r"[0-9]", v):
            raise ValueError("Must contain a digit")
        return v

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int

class RefreshRequest(BaseModel):
    refresh_token: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

# ---------- Endpoints ----------
@router.post("/register", status_code=201)
async def register(data: RegisterRequest, request: Request, db: AsyncSession = Depends(get_db), limiter: None = Depends(rate_limiter(limit=5, window=60))):
    existing = await db.execute(text("SELECT id FROM users WHERE email = :e"), {"e": data.email})
    if existing.scalar():
        raise HTTPException(status_code=409, detail="Email already registered")
    user_id = uuid.uuid4()
    await db.execute(
        text("""
            INSERT INTO users (id, email, username, full_name, hashed_password, role, is_active)
            VALUES (:id, :email, :username, :full_name, :pw, 'free', true)
        """),
        {"id": user_id, "email": data.email, "username": data.username,
         "full_name": data.full_name, "pw": hash_password(data.password)}
    )
    logger.info("New user registered: %s", data.email)
    return {"id": str(user_id), "email": data.email, "message": "Registration successful"}

@router.post("/login", response_model=TokenResponse)
async def login(data: LoginRequest, request: Request, db: AsyncSession = Depends(get_db), limiter: None = Depends(rate_limiter(limit=5, window=60))):
    result = await db.execute(
        text("SELECT id, hashed_password, role, is_active, login_attempts, locked_until FROM users WHERE email = :e"),
        {"e": data.email}
    )
    user = result.fetchone()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if user.locked_until and datetime.now(timezone.utc) < user.locked_until:
        raise HTTPException(status_code=423, detail="Account temporarily locked")
    if not verify_password(data.password, user.hashed_password):
        attempts = user.login_attempts + 1
        locked_until = None
        if attempts >= settings.MAX_LOGIN_ATTEMPTS:
            locked_until = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCOUNT_LOCKOUT_MINUTES)
        await db.execute(
            text("UPDATE users SET login_attempts = :a, locked_until = :l WHERE id = :id"),
            {"a": attempts, "l": locked_until, "id": user.id}
        )
        raise HTTPException(status_code=401, detail="Invalid credentials")
    raw_refresh = secrets.token_urlsafe(64)
    refresh_hash = hash_token(raw_refresh)
    expires_at = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    await db.execute(
        text("""
            INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at)
            VALUES (:id, :uid, :hash, :exp)
        """),
        {"id": uuid.uuid4(), "uid": user.id, "hash": refresh_hash, "exp": expires_at}
    )
    await db.execute(
        text("UPDATE users SET login_attempts=0, last_login_at=NOW(), last_login_ip=:ip WHERE id=:id"),
        {"ip": request.client.host if request.client else None, "id": user.id}
    )
    return TokenResponse(
        access_token=create_access_token(str(user.id), user.role),
        refresh_token=raw_refresh,
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )

@router.post("/refresh", response_model=TokenResponse)
async def refresh(data: RefreshRequest, db: AsyncSession = Depends(get_db)):
    token_hash = hash_token(data.refresh_token)
    result = await db.execute(
        text("SELECT rt.user_id, rt.expires_at, rt.revoked_at, u.role FROM refresh_tokens rt JOIN users u ON u.id = rt.user_id WHERE rt.token_hash = :h"),
        {"h": token_hash}
    )
    token = result.fetchone()
    if not token or token.revoked_at or datetime.now(timezone.utc) > token.expires_at:
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")
    await db.execute(
        text("UPDATE refresh_tokens SET revoked_at=NOW() WHERE token_hash=:h"), {"h": token_hash}
    )
    new_raw = secrets.token_urlsafe(64)
    new_hash = hash_token(new_raw)
    await db.execute(
        text("INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at) VALUES (:id,:uid,:h,:exp)"),
        {"id": uuid.uuid4(), "uid": token.user_id, "h": new_hash,
         "exp": datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)}
    )
    return TokenResponse(
        access_token=create_access_token(str(token.user_id), token.role),
        refresh_token=new_raw,
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )

@router.post("/logout", status_code=204)
async def logout(data: RefreshRequest, db: AsyncSession = Depends(get_db)):
    await db.execute(
        text("UPDATE refresh_tokens SET revoked_at=NOW() WHERE token_hash=:h"),
        {"h": hash_token(data.refresh_token)}
    )

@router.get("/me")
async def me(user_id: str = Depends(get_user_id_from_token), db: AsyncSession = Depends(get_secure_db)):
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
async def me(user_id: str = Depends(get_user_id_from_token), db: AsyncSession = Depends(get_secure_db)):
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")
    result = await db.execute(
        text("SELECT id, email, username, full_name, avatar_url, role, is_verified, created_at FROM users WHERE id=:id"),
        {"id": uuid.UUID(payload["sub"])}
    )
    user = result.fetchone()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return dict(user._mapping)

# ---------- Email Verification ----------
def send_verification_email(to_email: str, token: str, full_name: str | None):
    if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        logger.warning("SMTP not configured — skipping verification email")
        return
    verify_url = f"{settings.FRONTEND_URL}/verify-email?token={token}"
    msg = MIMEMultipart("alternative")
    msg["Subject"] = "Verify your AETSH-69 account"
    msg["From"] = f"{settings.SMTP_FROM_NAME} <{settings.SMTP_FROM_EMAIL}>"
    msg["To"] = to_email
    name = full_name or to_email.split("@")[0]
    html = f"""
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#161614;color:#F2EFE9;border-radius:8px">
      <h2 style="color:#F2EFE9;margin-bottom:8px">Welcome to AETSH-69, {name}</h2>
      <p style="color:#9E9B95;margin-bottom:24px">Click the button below to verify your email address and unlock full access to the ecosystem.</p>
      <a href="{verify_url}" style="display:inline-block;padding:12px 24px;background:#C0592B;color:#F2EFE9;text-decoration:none;border-radius:6px;font-weight:500">Verify Email</a>
      <p style="color:#6B6860;font-size:12px;margin-top:24px">Link expires in 24 hours. If you didn't register, ignore this email.</p>
    </div>
    """
    msg.attach(MIMEText(html, "html"))
    try:
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.sendmail(settings.SMTP_FROM_EMAIL, to_email, msg.as_string())
        logger.info("Verification email sent to %s", to_email)
    except Exception as e:
        logger.error("Failed to send verification email: %s", e)
        raise Exception("Failed to send email")

@router.post("/send-verification")
async def send_verification(request: Request, db: AsyncSession = Depends(get_db)):
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        user_id = payload["sub"]
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    verification_token = secrets.token_urlsafe(32)
    expires_at = datetime.now(timezone.utc) + timedelta(hours=settings.EMAIL_VERIFICATION_EXPIRE_HOURS)
    await db.execute(
        text("UPDATE users SET verification_token=:token, verification_token_expires=:exp WHERE id=:id"),
        {"token": verification_token, "exp": expires_at, "id": user_id}
    )
    await db.commit()
    result = await db.execute(text("SELECT email, full_name FROM users WHERE id=:id"), {"id": user_id})
    user = result.fetchone()
    send_verification_email(user.email, verification_token, user.full_name)
    return {"message": "Verification email sent"}

@router.get("/verify-email")
async def verify_email(token: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        text("SELECT id, verification_token_expires FROM users WHERE verification_token=:token AND is_verified=false"),
        {"token": token}
    )
    user = result.fetchone()
    if not user:
        raise HTTPException(status_code=400, detail="Invalid or already used verification token")
    if datetime.now(timezone.utc) > user.verification_token_expires:
        raise HTTPException(status_code=400, detail="Verification token expired")
    await db.execute(
        text("UPDATE users SET is_verified=true, verification_token=null, verification_token_expires=null WHERE id=:id"),
        {"id": user.id}
    )
    await db.commit()
    return {"message": "Email verified successfully"}

# ---------- Profile Update ----------
UPLOAD_DIR = "/app/uploads/avatars"

@router.patch("/profile")
async def update_profile(
    request: Request,
    full_name: str = Form(None),
    username: str = Form(None),
    avatar: UploadFile = File(None),
    db: AsyncSession = Depends(get_db)
):
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        user_id = payload["sub"]
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

    avatar_url = None
    if avatar:
        os.makedirs(UPLOAD_DIR, exist_ok=True)
        ext = avatar.filename.rsplit(".", 1)[-1].lower()
        if ext not in ("jpg", "jpeg", "png", "webp"):
            raise HTTPException(status_code=400, detail="Only jpg, png, webp allowed")
        filename = f"{user_id}.{ext}"
        filepath = os.path.join(UPLOAD_DIR, filename)
        with open(filepath, "wb") as f:
            shutil.copyfileobj(avatar.file, f)
        avatar_url = f"/media/avatars/{filename}"

    fields = []
    params: dict = {"id": user_id}
    if full_name is not None:
        fields.append("full_name = :full_name")
        params["full_name"] = full_name
    if username is not None:
        fields.append("username = :username")
        params["username"] = username
    if avatar_url:
        fields.append("avatar_url = :avatar_url")
        params["avatar_url"] = avatar_url

    if fields:
        await db.execute(
            text(f"UPDATE users SET {', '.join(fields)} WHERE id = :id"),
            params
        )
        await db.commit()

    result = await db.execute(
        text("SELECT id, email, username, full_name, avatar_url, role, is_verified, created_at FROM users WHERE id=:id"),
        {"id": user_id}
    )
    user = result.fetchone()
    return {
        "id": str(user.id),
        "email": user.email,
        "username": user.username,
        "full_name": user.full_name,
        "avatar_url": user.avatar_url,
        "role": user.role,
        "is_verified": user.is_verified,
        "created_at": user.created_at,
    }

# ---------- Password Reset (Corrected) ----------
@router.post("/forgot-password")
async def forgot_password(
    data: ForgotPasswordRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
):
    email = data.email
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()
    if not user:
        return {"message": "If your email is registered, you will receive a reset link."}
    
    token = secrets.token_urlsafe(32)
    user.reset_token = token
    user.reset_token_expires = datetime.utcnow() + timedelta(hours=24)
    await db.commit()
    
    reset_link = f"{settings.FRONTEND_URL}/reset-password?token={token}"
    background_tasks.add_task(send_password_reset_email, user.email, reset_link)
    
    return {"message": "Password reset email sent."}

@router.post("/reset-password")
async def reset_password(
    data: ResetPasswordRequest,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(User).where(
            User.reset_token == data.token,
            User.reset_token_expires > datetime.utcnow()
        )
    )
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(400, "Invalid or expired token")
    
    user.hashed_password = get_password_hash(data.new_password)
    user.reset_token = None
    user.reset_token_expires = None
    await db.commit()
    
    return {"message": "Password updated successfully."}
