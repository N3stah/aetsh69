import os
import secrets
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # Database
    DATABASE_URL: str

    @property
    def database_url_sync(self) -> str:
        return self.DATABASE_URL.replace("+asyncpg", "+psycopg2")
    DATABASE_POOL_SIZE: int = 10
    DATABASE_MAX_OVERFLOW: int = 20
    DATABASE_POOL_TIMEOUT: int = 30

    # JWT
    JWT_SECRET_KEY: str = secrets.token_urlsafe(32)
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30

    # Security
    MAX_LOGIN_ATTEMPTS: int = 5
    ACCOUNT_LOCKOUT_MINUTES: int = 15

    # Email
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    SMTP_FROM_NAME: str = "AETSH-69"
    SMTP_FROM_EMAIL: str = "aetsh69.com@gmail.com"
    EMAIL_VERIFICATION_EXPIRE_HOURS: int = 24
    smtp_use_ssl: bool = False

    # Frontend URL
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:5173")

    # AI Config
    ai_provider: str = "nvidia"  # Options: nvidia, gemini, anthropic
    
    # NVIDIA (OpenAI compatible)
    nvidia_api_keys: str = ""  # Set NVIDIA_API_KEYS in .env as comma-separated list
    NVIDIA_API_KEYS: str = ""  # alias read from env
    ai_model: str = "meta/llama-3.1-70b-instruct"
    ai_temperature: float = 0.7
    ai_max_tokens: int = 1024

    # Gemini (Fallback)
    gemini_api_key: Optional[str] = None
    gemini_model: str = "gemini-2.5-flash"

    # Anthropic (Fallback)
    anthropic_api_key: Optional[str] = None

    # Production flag
    is_production: bool = False

    # M-Pesa Daraja
    MPESA_CONSUMER_KEY: str = ""
    MPESA_CONSUMER_SECRET: str = ""
    MPESA_SHORTCODE: str = ""
    MPESA_PASSKEY: str = ""
    MPESA_CALLBACK_URL: str = ""
    RESEND_API_KEY: str = ""
    MPESA_ENV: str = "sandbox"
    
    # Debug
    DEBUG: bool = True

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"

    @property
    def nvidia_keys_list(self) -> list:
        keys_str = self.NVIDIA_API_KEYS or self.nvidia_api_keys or ""
        return [k.strip() for k in keys_str.split(',') if k.strip()]

    NVIDIA_MODEL_PAIRS: str = ""

    @property
    def nvidia_key_model_pairs(self) -> list:
        """Returns list of (api_key, model) tuples parsed from NVIDIA_MODEL_PAIRS."""
        if not self.NVIDIA_MODEL_PAIRS:
            return []
        pairs = []
        for entry in self.NVIDIA_MODEL_PAIRS.split('|'):
            entry = entry.strip()
            if ':' in entry:
                key, model = entry.split(':', 1)
                pairs.append((key.strip(), model.strip()))
        return pairs

settings = Settings()
