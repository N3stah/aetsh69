import uuid, time, logging, random
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Request
from sse_starlette.sse import EventSourceResponse
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
import json
import threading
import jwt
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

    # Extract user context for personalization
    user_context_str = "CURRENT USER CONTEXT:\n  - Status: Guest (Not logged in)"
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    if token:
        try:
            payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
            user_id = payload.get("sub")
            if user_id:
                async with db.begin_nested():
                    u_res = await db.execute(text("SELECT full_name, role FROM users WHERE id = :uid"), {"uid": user_id})
                    u = u_res.fetchone()
                if u:
                    user_context_str = f"CURRENT USER CONTEXT:\n  - Name: {u.full_name or 'there'}\n  - Membership Tier: {u.role.upper()}"
        except Exception:
            pass

    if provider == "nvidia" and nvidia_pairs:
        from openai import OpenAI
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

        async def event_generator():
            full_response = ""
            try:
                start = time.monotonic()
                logger.info("Calling NVIDIA API (Streaming) with model: %s", model)
                
                # The OpenAI SDK call must be synchronous and run in a thread
                # because to_thread doesn't support iterating over a stream easily.
                # We will use a queue to pass chunks from the thread to the async generator.
                import queue
                q = queue.Queue()
                SENTINEL = object()

                def _stream_call():
                    try:
                        response = client.chat.completions.create(
                            model=model,
                            messages=openai_messages,
                            temperature=settings.ai_temperature,
                            max_tokens=settings.ai_max_tokens,
                            stream=True
                        )
                        for chunk in response:
                            if chunk.choices and chunk.choices[0].delta.content:
                                q.put(chunk.choices[0].delta.content)
                    except Exception as e:
                        q.put(e)
                    finally:
                        q.put(SENTINEL)

                # Start the thread
                threading.Thread(target=_stream_call).start()

                # Yield chunks from the queue
                while True:
                    item = await asyncio.to_thread(q.get)
                    if item is SENTINEL:
                        break
                    if isinstance(item, Exception):
                        raise item
                    
                    full_response += item
                    yield {"data": json.dumps({"content": item})}

            except Exception as e:
                logger.error("NVIDIA API Error Details: %s", str(e))
                error_msg = "Pole sana — I'm having a connection issue right now. Please try again in a moment."
                full_response = error_msg
                yield {"data": json.dumps({"content": error_msg})}
            finally:
                # Save messages and analytics after stream completes
                await save_message(db, str(conv_id), "user", data.message)
                await save_message(db, str(conv_id), "assistant", full_response)
                await log_analytics(db, data.message, data.context or "general", provider)
                yield {"data": json.dumps({"content": "[DONE]"})}

        return EventSourceResponse(event_generator())

    elif provider == "gemini" and settings.gemini_api_key:
        # Fallback to non-streaming for Gemini if needed, or implement similar stream
        try:
            client = genai.Client(api_key=settings.gemini_api_key)
            gemini_messages = []
            for msg in messages:
                role = "user" if msg["role"] == "user" else "model"
                gemini_messages.append(types.Content(role=role, parts=[types.Part(text=msg["content"])]))

            live_ctx = await build_live_context(db, user_context_str)
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
        except Exception as e:
            logger.error("AETSH-69 Gemini call failed: %s", e)
            response_text = "Pole sana — I'm having a connection issue right now."

        await save_message(db, str(conv_id), "user", data.message)
        await save_message(db, str(conv_id), "assistant", response_text)
        await log_analytics(db, data.message, data.context or "general", provider)

        return {
            "response": response_text,
            "conversation_id": conv_id,
            "tokens_used": 0
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
