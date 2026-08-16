import uuid, time, logging, random
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, field_validator
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.database import get_db
from app.config import settings
from app.core.prompts import AETSH69_SYSTEM_PROMPT
from app.api.ai_context import build_live_context, save_message, log_analytics
from app.ai.retriever import get_retriever
import re
import asyncio
from google import genai
from google.genai import types

router = APIRouter()
logger = logging.getLogger(__name__)

INJECTION_PATTERNS = [
    r"ignore\s+(all\s+)?previous\s+instructions",
    r"disregard\s+(your\s+)?(system\s+)?prompt",
    r"you\s+are\s+now\s+(?!AETSH)",
    r"reveal\s+(your\s+)?(system\s+prompt|api\s+key)",
    r"forget\s+(everything|your\s+instructions)",
    r"act\s+as\s+(DAN|jailbreak|evil|unrestricted)",
    r"override\s+(your\s+)?(safety|rules|guidelines)",
    r"pretend\s+you\s+(are|have\s+no)",
]

SYSTEM_PROMPT = AETSH69_SYSTEM_PROMPT

class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None
    context: str = "general"

    @field_validator("message")
    @classmethod
    def not_empty(cls, v):
        if not v.strip():
            raise ValueError("Message cannot be empty")
        if len(v) > 4000:
            raise ValueError("Message too long")
        return v.strip()

def get_nvidia_pairs() -> list:
    """Parse NVIDIA_MODEL_PAIRS from settings directly."""
    pairs = []
    raw = settings.NVIDIA_MODEL_PAIRS
    if raw:
        for entry in raw.split('|'):
            if ':' in entry:
                k, m = entry.split(':', 1)
                pairs.append((k.strip(), m.strip()))
    return pairs

@router.post("/chat")
async def chat(data: ChatRequest, request: Request, db: AsyncSession = Depends(get_db)):
    for pattern in INJECTION_PATTERNS:
        if re.search(pattern, data.message, re.IGNORECASE):
            raise HTTPException(status_code=400, detail="Siwezi kufanya hivyo. I can't process that — please ask me something about Mark or his platform.")

    conv_id = data.conversation_id
    history = []
    if conv_id:
        try:
            msgs = await db.execute(
                text("SELECT role, content FROM ai_messages WHERE conversation_id=:id ORDER BY created_at"),
                {"id": uuid.UUID(conv_id)}
            )
            history = [{"role": r.role, "content": r.content} for r in msgs.fetchall()]
        except Exception:
            conv_id = None

    if not conv_id:
        conv_id = str(uuid.uuid4())
        await db.execute(
            text("INSERT INTO ai_conversations (id, context_type) VALUES (:id, :ctx)"),
            {"id": uuid.UUID(conv_id), "ctx": data.context}
        )
        await db.commit()

    messages = history[-10:] + [{"role": "user", "content": data.message}]

    response_text = (
        "Habari! Mimi ni AETSH-69 — Mark Manoti Ndege's personal AI concierge. "
        "I'm not fully online yet as the AI API key hasn't been configured. "
        "In the meantime, feel free to explore the platform or contact Mark directly."
    )
    tokens_used = 0
    provider = settings.ai_provider.lower()

    nvidia_pairs = get_nvidia_pairs()

    if provider == "nvidia" and nvidia_pairs:
        try:
            from openai import OpenAI
            # Use the paired key and model
            key, model = random.choice(nvidia_pairs)
            client = OpenAI(base_url="https://integrate.api.nvidia.com/v1", api_key=key)
            
            live_ctx = await build_live_context(db)
            try:
                retriever = get_retriever()
                kb_context = retriever.get_context_for_query(data.message, top_k=3)
            except Exception as ret_err:
                logger.warning("Retriever failed, continuing without KB context: %s", ret_err)
                kb_context = ""
            enhanced_prompt = SYSTEM_PROMPT + "\n\n" + live_ctx + kb_context
            openai_messages = [{"role": "system", "content": enhanced_prompt}] + messages
            
            start = time.monotonic()
            logger.info("Calling NVIDIA API with model: %s", model)
            response = await asyncio.to_thread(
                client.chat.completions.create,
                model=model,
                messages=openai_messages,
                temperature=settings.ai_temperature,
                max_tokens=settings.ai_max_tokens,
                stream=False
            )
            response_text = response.choices[0].message.content
            tokens_used = response.usage.total_tokens if response.usage else 0
        except Exception as e:
            logger.error("NVIDIA API Error Details: %s", str(e))
            response_text = "Pole sana — I'm having a connection issue right now. Please try again in a moment."

    elif provider == "gemini" and settings.gemini_api_key:
        try:
            client = genai.Client(api_key=settings.gemini_api_key)
            gemini_messages = []
            for msg in messages:
                role = "user" if msg["role"] == "user" else "model"
                gemini_messages.append(types.Content(role=role, parts=[types.Part(text=msg["content"])]))

            live_ctx = await build_live_context(db)
            try:
                retriever = get_retriever()
                kb_context = retriever.get_context_for_query(data.message, top_k=3)
            except Exception as ret_err:
                logger.warning("Retriever failed for Gemini: %s", ret_err)
                kb_context = ""
            enhanced_prompt = SYSTEM_PROMPT + "\n\n" + live_ctx + kb_context

            response = await asyncio.to_thread(
                client.models.generate_content,
                model=settings.gemini_model,
                contents=gemini_messages,
                config=types.GenerateContentConfig(
                    system_instruction=enhanced_prompt,
                    max_output_tokens=settings.ai_max_tokens,
                    temperature=settings.ai_temperature,
                ),
            )
            response_text = response.text
            tokens_used = getattr(response.usage_metadata, 'total_token_count', 0) if response.usage_metadata else 0
        except Exception as e:
            logger.error("AETSH-69 Gemini call failed: %s", e)
            response_text = "Pole sana — I'm having a connection issue right now."

    await save_message(db, str(conv_id), "user", data.message)
    await save_message(db, str(conv_id), "assistant", response_text)
    await log_analytics(db, data.message, data.context or "general", provider)

    return {
        "response": response_text,
        "conversation_id": conv_id,
        "tokens_used": tokens_used,
    }

@router.get("/status")
async def ai_status():
    provider = settings.ai_provider.lower()
    online = False
    model = None
    if provider == "nvidia" and get_nvidia_pairs():
        online = True
        model = "NVIDIA NIM (Multi-model)"
    elif provider == "gemini" and settings.gemini_api_key:
        online = True
        model = settings.gemini_model
    return {
        "name": "AETSH-69",
        "online": online,
        "provider": provider,
        "model": model,
        "message": "AETSH-69 is online and ready." if online else "AETSH-69 is offline.",
    }
