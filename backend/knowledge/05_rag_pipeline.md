# Data Flow & RAG Pipeline Mechanics
User Query -> Guardrail Filter (PII & Prompt Injection Detection) -> Semantic Embedding Generation (text-embedding-3-small) -> pgvector Top-K Retrieval (Cosine Similarity) -> System Prompt Assembly with Conversation Memory -> Claude/GPT-4o Streaming Response -> Database Persistence (ai_messages). This ensures sub-second latency and context-aware answers.
