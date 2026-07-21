# Personal Tech Ecosystem

> Powered by **AETSH-69** — Adaptive Ecosystem Technology System Hub, Generation 69

A full-stack personal platform: portfolio, blog, shop, photography, recipes, arcade, and an intelligent AI operating system that understands everything on it.

---

## Architecture Overview

```
┌────────────────────────────────────────────────────────────────┐
│                        AETSH-69 AI Layer                       │
│  RAG Pipeline │ Guardrails │ Conversation Memory │ Rate Limits │
└───────────────────────────┬────────────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────────────┐
│                     FastAPI Backend                             │
│  Auth │ Content │ Shop │ Services │ Media │ Notifications      │
│  Analytics │ Search │ Membership │ Payments │ Feature Flags    │
└───────────────────────────┬────────────────────────────────────┘
                            │
         ┌──────────────────┼──────────────────┐
         ▼                  ▼                  ▼
   PostgreSQL 16        Redis 7           Celery Workers
   + pgvector        (cache/sessions)  (email/embed/notify)
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **API** | FastAPI 0.115, Python 3.12, uvicorn |
| **Database** | PostgreSQL 16 + pgvector (semantic search) |
| **ORM / Migrations** | SQLAlchemy 2.0 async + Alembic |
| **Validation** | Pydantic v2 |
| **Auth** | JWT (RS256), bcrypt, refresh token rotation |
| **AI** | Anthropic Claude / OpenAI GPT-4o |
| **Embeddings** | OpenAI text-embedding-3-small (1536d) |
| **Vector Search** | pgvector IVFFlat, cosine similarity |
| **Cache** | Redis 7 |
| **Queue** | Celery + Redis broker |
| **Payments** | Stripe, PayPal, M-Pesa (Daraja API) |
| **Notifications** | SMTP email, Twilio SMS, WhatsApp API |
| **Media** | Pillow, Cloudflare R2 / S3 |
| **Container** | Docker + Docker Compose |
| **Proxy** | Nginx |

---

## Quick Start

### Prerequisites
- Python 3.12+
- Docker + Docker Compose
- Git

### 1. Clone and bootstrap

```bash
git clone https://github.com/yourusername/personal-tech-ecosystem.git
cd personal-tech-ecosystem
bash scripts/bootstrap.sh
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env — minimum required:
#   ANTHROPIC_API_KEY=sk-ant-...
#   OPENAI_API_KEY=sk-...        (for embeddings)
#   JWT_SECRET_KEY=...
#   DB_PASSWORD=...
```

### 3. Start services

```bash
# Development (hot reload)
docker compose up -d postgres redis
cd backend
source .venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

### 4. Verify

```
GET http://localhost:8000/api/health/
GET http://localhost:8000/api/docs
```

---

## AETSH-69 AI

AETSH-69 is the intelligence layer powering the entire platform.

### Roles

| Role | Description |
|------|-------------|
| **Personal Concierge** | Answers questions about skills, experience, services |
| **Knowledge Navigator** | Discovers content across portfolio, blog, shop, arcade |
| **Commerce Assistant** | Product recommendations, specs, WhatsApp ordering |
| **Services Consultant** | CCTV, networking, Linux, smart home, cyber inquiries |
| **Portfolio Guide** | Explains project architecture and engineering decisions |
| **Community Companion** | Arcade game mechanics, achievements, rewards |

### RAG Architecture

```
User Query
    │
    ▼
Guardrails (injection detection, PII filter, rate limits)
    │
    ▼
Embed query → pgvector cosine similarity search
    │
    ▼
Retrieve top-K documents from ai_knowledge_base
    │
    ▼
Assemble system prompt + context + history
    │
    ▼
Claude / GPT-4o → Streaming response
    │
    ▼
Persist conversation + sources + tokens
```

### Ingesting Knowledge

```bash
# Via API
curl -X POST http://localhost:8000/api/aetsh69/knowledge/ingest \
  -H "Content-Type: application/json" \
  -d '{
    "knowledge_type": "project",
    "title": "Smart Home Controller",
    "content": "...",
    "source_type": "project",
    "source_id": "uuid-here"
  }'
```

### Context Types

Send `context_type` in chat requests to route to specialised prompts:

| Value | Activates |
|-------|-----------|
| `general` | Full platform knowledge |
| `shop` | Product/pricing assistant |
| `services` | Service inquiry consultant |
| `blog` | Content discovery guide |
| `arcade` | Game mechanics helper |
| `portfolio` | Engineering portfolio guide |

---

## API Structure

```
/api/health/          Health + readiness checks
/api/auth/            Register, login, JWT, MFA
/api/aetsh69/         AI chat, knowledge base, conversations
/api/blog/            Blog posts, categories, comments
/api/projects/        Portfolio projects
/api/photography/     Albums, photos
/api/recipes/         Recipes, ingredients, instructions
/api/search/          Full-text + semantic search
/api/membership/      Tiers, perks, subscriptions
/api/analytics/       Events, dashboards, reports
/api/media/           Upload, compress, thumbnails
/api/payment/         Stripe, PayPal, M-Pesa webhooks
/api/notifications/   Email, SMS, WhatsApp
/api/flags/           Feature flags
```

---

## Database

Schema: `database/schema.sql`

Key tables:
- `users` — accounts with role-based access
- `memberships` — tiered membership (free/supporter/pro/vip)
- `ai_knowledge_base` — pgvector RAG store
- `ai_conversations` + `ai_messages` — full conversation history
- `ai_guardrail_events` — security audit log
- `analytics_events` — partitioned by quarter for scale
- `search_index` — unified FTS + semantic search index
- `blog_posts`, `projects`, `photos`, `recipes` — content
- `products`, `orders`, `payments` — shop + commerce

---

## Security

- JWT access tokens (30 min) + rotating refresh tokens (30 days)
- bcrypt password hashing (12 rounds)
- Account lockout after 5 failed attempts
- Security headers middleware (CSP, HSTS, X-Frame-Options)
- AI guardrails: prompt injection detection, PII filtering
- Rate limiting: global (100/min) + AI-specific (20/day free tier)
- Input validation via Pydantic v2

---

## Payments (Kenya-first)

| Provider | Use Case |
|----------|----------|
| **M-Pesa** | Primary — Safaricom Daraja STK Push |
| **Stripe** | International cards |
| **PayPal** | International PayPal accounts |

---

## Environment Tiers

| Flag | Free | Supporter | Pro | VIP |
|------|------|-----------|-----|-----|
| AI requests/day | 10 | 50 | 200 | Unlimited |
| Downloads | ✗ | ✓ | ✓ | ✓ |
| Early access | ✗ | ✗ | ✓ | ✓ |
| API access | ✗ | ✗ | ✓ | ✓ |
| Custom AI persona | ✗ | ✗ | ✗ | ✓ |

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

Private project. All rights reserved.
