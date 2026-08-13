# Security & Guardrail Protocols
Authentication uses JWT access tokens (30 min) with 30-day rotating refresh tokens. Passwords are hashed using Bcrypt (12 rounds). The system enforces login attempt lockouts to prevent brute force and restricts CORS to specific domains. AI guardrails include prompt injection defense, system prompt isolation, and daily IP-based rate limiting to prevent abuse.
