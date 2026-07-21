-- =============================================================================
-- Personal Tech Ecosystem — Master Database Schema
-- PostgreSQL 15+ with pgvector extension
-- =============================================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";           -- pgvector for RAG/embeddings
CREATE EXTENSION IF NOT EXISTS "pg_trgm";          -- Fuzzy text search
CREATE EXTENSION IF NOT EXISTS "unaccent";         -- Accent-insensitive search
CREATE EXTENSION IF NOT EXISTS "btree_gin";        -- GIN index support

-- =============================================================================
-- ENUMS
-- =============================================================================

CREATE TYPE user_role AS ENUM ('visitor', 'member', 'admin', 'superadmin');
CREATE TYPE user_status AS ENUM ('pending_verification', 'active', 'suspended', 'deleted');
CREATE TYPE membership_tier AS ENUM ('free', 'supporter', 'pro', 'vip');
CREATE TYPE membership_status AS ENUM ('active', 'expired', 'cancelled', 'pending');
CREATE TYPE content_status AS ENUM ('draft', 'published', 'archived', 'scheduled');
CREATE TYPE payment_provider AS ENUM ('stripe', 'paypal', 'mpesa', 'manual');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded', 'cancelled');
CREATE TYPE media_type AS ENUM ('image', 'video', 'audio', 'document', 'archive');
CREATE TYPE notification_channel AS ENUM ('email', 'sms', 'whatsapp', 'push', 'in_app');
CREATE TYPE notification_status AS ENUM ('pending', 'sent', 'delivered', 'failed', 'read');
CREATE TYPE ai_role AS ENUM ('user', 'assistant', 'system');
CREATE TYPE knowledge_type AS ENUM (
    'about_me', 'project', 'blog_post', 'service', 'product',
    'recipe', 'photography', 'game', 'general', 'faq'
);
CREATE TYPE search_index_status AS ENUM ('pending', 'indexed', 'failed', 'stale');
CREATE TYPE event_type AS ENUM (
    'page_view', 'click', 'search', 'ai_chat', 'download',
    'purchase', 'signup', 'login', 'share', 'reaction'
);

-- =============================================================================
-- UTILITY FUNCTION: auto-update updated_at
-- =============================================================================

CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- AUTH & USERS
-- =============================================================================

CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email           VARCHAR(320) NOT NULL UNIQUE,
    username        VARCHAR(50) UNIQUE,
    hashed_password TEXT NOT NULL,
    full_name       VARCHAR(255),
    avatar_url      TEXT,
    bio             TEXT,
    role            user_role NOT NULL DEFAULT 'visitor',
    status          user_status NOT NULL DEFAULT 'pending_verification',
    is_verified     BOOLEAN NOT NULL DEFAULT FALSE,

    -- Security
    last_login_at   TIMESTAMPTZ,
    last_login_ip   INET,
    login_attempts  SMALLINT NOT NULL DEFAULT 0,
    locked_until    TIMESTAMPTZ,
    mfa_enabled     BOOLEAN NOT NULL DEFAULT FALSE,
    mfa_secret      TEXT,

    -- Preferences
    timezone        VARCHAR(64) DEFAULT 'Africa/Nairobi',
    locale          VARCHAR(10) DEFAULT 'en-KE',
    preferences     JSONB NOT NULL DEFAULT '{}',

    -- Timestamps
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ
);

CREATE INDEX idx_users_email       ON users (email);
CREATE INDEX idx_users_username    ON users (username);
CREATE INDEX idx_users_role        ON users (role);
CREATE INDEX idx_users_status      ON users (status);
CREATE INDEX idx_users_deleted_at  ON users (deleted_at) WHERE deleted_at IS NULL;

CREATE TRIGGER set_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();


-- Email verification tokens
CREATE TABLE email_verification_tokens (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token       TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
    expires_at  TIMESTAMPTZ NOT NULL,
    used_at     TIMESTAMPTZ,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_email_tokens_user    ON email_verification_tokens (user_id);
CREATE INDEX idx_email_tokens_token   ON email_verification_tokens (token);
CREATE INDEX idx_email_tokens_expiry  ON email_verification_tokens (expires_at);


-- Password reset tokens
CREATE TABLE password_reset_tokens (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token       TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
    expires_at  TIMESTAMPTZ NOT NULL,
    used_at     TIMESTAMPTZ,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_pw_reset_user    ON password_reset_tokens (user_id);
CREATE INDEX idx_pw_reset_token   ON password_reset_tokens (token);


-- Refresh tokens (JWT rotation)
CREATE TABLE refresh_tokens (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash  TEXT NOT NULL UNIQUE,          -- Hashed; raw token never stored
    device_info JSONB DEFAULT '{}',            -- Browser, OS, IP for session display
    expires_at  TIMESTAMPTZ NOT NULL,
    revoked_at  TIMESTAMPTZ,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_refresh_user       ON refresh_tokens (user_id);
CREATE INDEX idx_refresh_token_hash ON refresh_tokens (token_hash);
CREATE INDEX idx_refresh_active     ON refresh_tokens (user_id, revoked_at) WHERE revoked_at IS NULL;


-- Audit log for auth events
CREATE TABLE auth_audit_log (
    id          BIGSERIAL PRIMARY KEY,
    user_id     UUID REFERENCES users(id) ON DELETE SET NULL,
    event       VARCHAR(64) NOT NULL,          -- login_success, login_failed, password_changed, etc.
    ip_address  INET,
    user_agent  TEXT,
    metadata    JSONB DEFAULT '{}',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_auth_audit_user ON auth_audit_log (user_id);
CREATE INDEX idx_auth_audit_time ON auth_audit_log (created_at DESC);

-- =============================================================================
-- MEMBERSHIP
-- =============================================================================

CREATE TABLE memberships (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    tier            membership_tier NOT NULL DEFAULT 'free',
    status          membership_status NOT NULL DEFAULT 'active',
    starts_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at      TIMESTAMPTZ,
    auto_renew      BOOLEAN NOT NULL DEFAULT TRUE,
    stripe_sub_id   TEXT UNIQUE,
    paypal_sub_id   TEXT UNIQUE,
    metadata        JSONB DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_memberships_user   ON memberships (user_id);
CREATE INDEX idx_memberships_tier   ON memberships (tier);
CREATE INDEX idx_memberships_status ON memberships (status);
CREATE INDEX idx_memberships_expiry ON memberships (expires_at);

CREATE TRIGGER set_memberships_updated_at
    BEFORE UPDATE ON memberships
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();


-- Membership perks definition
CREATE TABLE membership_perks (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tier        membership_tier NOT NULL,
    perk_key    VARCHAR(100) NOT NULL,         -- e.g. 'ai_requests_per_day', 'early_access'
    perk_value  JSONB NOT NULL,
    description TEXT,
    UNIQUE (tier, perk_key)
);

-- =============================================================================
-- CONTENT: BLOG
-- =============================================================================

CREATE TABLE blog_categories (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        VARCHAR(100) NOT NULL,
    slug        VARCHAR(120) NOT NULL UNIQUE,
    description TEXT,
    color       VARCHAR(7),
    icon        VARCHAR(50),
    parent_id   UUID REFERENCES blog_categories(id) ON DELETE SET NULL,
    sort_order  SMALLINT DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE blog_posts (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id     UUID REFERENCES blog_categories(id) ON DELETE SET NULL,
    title           VARCHAR(500) NOT NULL,
    slug            VARCHAR(550) NOT NULL UNIQUE,
    excerpt         TEXT,
    content         TEXT NOT NULL,             -- Markdown
    content_html    TEXT,                      -- Rendered HTML (cached)
    cover_image_url TEXT,
    status          content_status NOT NULL DEFAULT 'draft',
    featured        BOOLEAN NOT NULL DEFAULT FALSE,
    allow_comments  BOOLEAN NOT NULL DEFAULT TRUE,
    reading_time    SMALLINT,                  -- Minutes
    view_count      INTEGER NOT NULL DEFAULT 0,
    like_count      INTEGER NOT NULL DEFAULT 0,
    seo_title       VARCHAR(70),
    seo_description VARCHAR(160),
    og_image_url    TEXT,
    published_at    TIMESTAMPTZ,
    scheduled_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_blog_author      ON blog_posts (author_id);
CREATE INDEX idx_blog_category    ON blog_posts (category_id);
CREATE INDEX idx_blog_slug        ON blog_posts (slug);
CREATE INDEX idx_blog_status      ON blog_posts (status);
CREATE INDEX idx_blog_published   ON blog_posts (published_at DESC) WHERE status = 'published';
CREATE INDEX idx_blog_featured    ON blog_posts (featured) WHERE featured = TRUE;
CREATE INDEX idx_blog_fts         ON blog_posts USING GIN (to_tsvector('english', title || ' ' || COALESCE(excerpt, '') || ' ' || content));

CREATE TRIGGER set_blog_updated_at
    BEFORE UPDATE ON blog_posts
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();


CREATE TABLE blog_tags (
    id    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name  VARCHAR(50) NOT NULL,
    slug  VARCHAR(60) NOT NULL UNIQUE,
    color VARCHAR(7)
);

CREATE TABLE blog_post_tags (
    post_id UUID NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
    tag_id  UUID NOT NULL REFERENCES blog_tags(id) ON DELETE CASCADE,
    PRIMARY KEY (post_id, tag_id)
);

CREATE TABLE blog_comments (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id     UUID NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
    author_id   UUID REFERENCES users(id) ON DELETE SET NULL,
    parent_id   UUID REFERENCES blog_comments(id) ON DELETE CASCADE,
    content     TEXT NOT NULL,
    is_approved BOOLEAN NOT NULL DEFAULT FALSE,
    like_count  INTEGER NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_blog_comments_post   ON blog_comments (post_id, created_at);
CREATE INDEX idx_blog_comments_author ON blog_comments (author_id);

-- =============================================================================
-- CONTENT: PROJECTS / PORTFOLIO
-- =============================================================================

CREATE TABLE projects (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title               VARCHAR(300) NOT NULL,
    slug                VARCHAR(350) NOT NULL UNIQUE,
    tagline             VARCHAR(255),
    description         TEXT NOT NULL,
    content             TEXT,                  -- Detailed case study (Markdown)
    cover_image_url     TEXT,
    gallery             JSONB DEFAULT '[]',    -- [{url, caption, alt}]
    tech_stack          JSONB DEFAULT '[]',    -- ["FastAPI", "PostgreSQL", ...]
    links               JSONB DEFAULT '{}',    -- {github, live, demo, docs}
    status              content_status NOT NULL DEFAULT 'published',
    featured            BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order          SMALLINT DEFAULT 0,
    start_date          DATE,
    end_date            DATE,
    is_ongoing          BOOLEAN NOT NULL DEFAULT FALSE,
    view_count          INTEGER NOT NULL DEFAULT 0,
    seo_title           VARCHAR(70),
    seo_description     VARCHAR(160),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_projects_slug     ON projects (slug);
CREATE INDEX idx_projects_status   ON projects (status);
CREATE INDEX idx_projects_featured ON projects (featured, sort_order);
CREATE INDEX idx_projects_fts      ON projects USING GIN (to_tsvector('english', title || ' ' || COALESCE(tagline, '') || ' ' || description));

CREATE TRIGGER set_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- =============================================================================
-- CONTENT: PHOTOGRAPHY
-- =============================================================================

CREATE TABLE photo_albums (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title           VARCHAR(300) NOT NULL,
    slug            VARCHAR(350) NOT NULL UNIQUE,
    description     TEXT,
    cover_photo_id  UUID,                      -- FK added after photos table
    status          content_status NOT NULL DEFAULT 'published',
    location        VARCHAR(255),
    shot_date       DATE,
    sort_order      SMALLINT DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE photos (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    album_id        UUID REFERENCES photo_albums(id) ON DELETE SET NULL,
    title           VARCHAR(300),
    description     TEXT,
    url             TEXT NOT NULL,
    thumbnail_url   TEXT,
    width           INTEGER,
    height          INTEGER,
    file_size       INTEGER,                   -- Bytes
    exif_data       JSONB DEFAULT '{}',        -- Camera, lens, settings
    location        VARCHAR(255),
    gps_lat         DECIMAL(9, 6),
    gps_lng         DECIMAL(9, 6),
    tags            JSONB DEFAULT '[]',
    status          content_status NOT NULL DEFAULT 'published',
    featured        BOOLEAN NOT NULL DEFAULT FALSE,
    view_count      INTEGER NOT NULL DEFAULT 0,
    sort_order      SMALLINT DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE photo_albums
    ADD CONSTRAINT fk_album_cover FOREIGN KEY (cover_photo_id) REFERENCES photos(id) ON DELETE SET NULL;

CREATE INDEX idx_photos_album   ON photos (album_id, sort_order);
CREATE INDEX idx_photos_status  ON photos (status);
CREATE INDEX idx_photos_gps     ON photos (gps_lat, gps_lng) WHERE gps_lat IS NOT NULL;

-- =============================================================================
-- CONTENT: RECIPES / COOKING
-- =============================================================================

CREATE TABLE recipe_categories (
    id   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(120) NOT NULL UNIQUE,
    icon VARCHAR(50)
);

CREATE TABLE recipes (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id        UUID NOT NULL REFERENCES users(id),
    category_id      UUID REFERENCES recipe_categories(id) ON DELETE SET NULL,
    title            VARCHAR(300) NOT NULL,
    slug             VARCHAR(350) NOT NULL UNIQUE,
    description      TEXT,
    cover_image_url  TEXT,
    prep_minutes     SMALLINT,
    cook_minutes     SMALLINT,
    servings         SMALLINT,
    difficulty       VARCHAR(20),              -- easy | medium | hard
    cuisine          VARCHAR(100),
    ingredients      JSONB NOT NULL DEFAULT '[]', -- [{name, quantity, unit, notes}]
    instructions     JSONB NOT NULL DEFAULT '[]', -- [{step, text, image_url, timer_seconds}]
    nutrition        JSONB DEFAULT '{}',       -- {calories, protein, carbs, fat, ...}
    tags             JSONB DEFAULT '[]',
    status           content_status NOT NULL DEFAULT 'published',
    featured         BOOLEAN NOT NULL DEFAULT FALSE,
    view_count       INTEGER NOT NULL DEFAULT 0,
    rating_avg       DECIMAL(3,2),
    rating_count     INTEGER NOT NULL DEFAULT 0,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_recipes_slug     ON recipes (slug);
CREATE INDEX idx_recipes_status   ON recipes (status);
CREATE INDEX idx_recipes_category ON recipes (category_id);
CREATE INDEX idx_recipes_fts      ON recipes USING GIN (to_tsvector('english', title || ' ' || COALESCE(description, '') || ' ' || cuisine));

CREATE TRIGGER set_recipes_updated_at
    BEFORE UPDATE ON recipes
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- =============================================================================
-- SHOP / E-COMMERCE
-- =============================================================================

CREATE TABLE product_categories (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        VARCHAR(100) NOT NULL,
    slug        VARCHAR(120) NOT NULL UNIQUE,
    description TEXT,
    image_url   TEXT,
    parent_id   UUID REFERENCES product_categories(id) ON DELETE SET NULL,
    sort_order  SMALLINT DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE products (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id      UUID REFERENCES product_categories(id) ON DELETE SET NULL,
    name             VARCHAR(300) NOT NULL,
    slug             VARCHAR(350) NOT NULL UNIQUE,
    sku              VARCHAR(100) UNIQUE,
    description      TEXT,
    short_description TEXT,
    images           JSONB DEFAULT '[]',       -- [{url, alt, is_primary}]
    specifications   JSONB DEFAULT '{}',       -- Technical specs
    price_kes        DECIMAL(12,2) NOT NULL,   -- Kenya Shillings
    price_usd        DECIMAL(12,2),
    stock_quantity   INTEGER NOT NULL DEFAULT 0,
    track_inventory  BOOLEAN NOT NULL DEFAULT TRUE,
    is_active        BOOLEAN NOT NULL DEFAULT TRUE,
    is_featured      BOOLEAN NOT NULL DEFAULT FALSE,
    weight_grams     INTEGER,
    tags             JSONB DEFAULT '[]',
    seo_title        VARCHAR(70),
    seo_description  VARCHAR(160),
    view_count       INTEGER NOT NULL DEFAULT 0,
    sold_count       INTEGER NOT NULL DEFAULT 0,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_products_slug     ON products (slug);
CREATE INDEX idx_products_category ON products (category_id);
CREATE INDEX idx_products_active   ON products (is_active, is_featured);
CREATE INDEX idx_products_stock    ON products (stock_quantity) WHERE track_inventory = TRUE;
CREATE INDEX idx_products_fts      ON products USING GIN (to_tsvector('english', name || ' ' || COALESCE(description, '')));

CREATE TRIGGER set_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();


CREATE TABLE orders (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID REFERENCES users(id) ON DELETE SET NULL,
    order_number    VARCHAR(20) NOT NULL UNIQUE DEFAULT 'ORD-' || upper(substr(md5(random()::text), 1, 8)),
    status          VARCHAR(30) NOT NULL DEFAULT 'pending',
    subtotal        DECIMAL(12,2) NOT NULL,
    discount        DECIMAL(12,2) NOT NULL DEFAULT 0,
    total           DECIMAL(12,2) NOT NULL,
    currency        VARCHAR(3) NOT NULL DEFAULT 'KES',
    shipping_info   JSONB DEFAULT '{}',
    billing_info    JSONB DEFAULT '{}',
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE order_items (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id    UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id  UUID REFERENCES products(id) ON DELETE SET NULL,
    product_name VARCHAR(300) NOT NULL,        -- Snapshot at time of order
    quantity    INTEGER NOT NULL,
    unit_price  DECIMAL(12,2) NOT NULL,
    total_price DECIMAL(12,2) NOT NULL,
    metadata    JSONB DEFAULT '{}'
);

CREATE INDEX idx_order_items_order ON order_items (order_id);

-- =============================================================================
-- PAYMENTS
-- =============================================================================

CREATE TABLE payments (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id          UUID REFERENCES users(id) ON DELETE SET NULL,
    order_id         UUID REFERENCES orders(id) ON DELETE SET NULL,
    membership_id    UUID REFERENCES memberships(id) ON DELETE SET NULL,
    provider         payment_provider NOT NULL,
    status           payment_status NOT NULL DEFAULT 'pending',
    amount           DECIMAL(12,2) NOT NULL,
    currency         VARCHAR(3) NOT NULL,
    provider_tx_id   TEXT,                     -- Stripe/PayPal/M-Pesa transaction ID
    provider_ref     TEXT,                     -- Provider reference number
    webhook_payload  JSONB DEFAULT '{}',
    error_message    TEXT,
    paid_at          TIMESTAMPTZ,
    refunded_at      TIMESTAMPTZ,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payments_user     ON payments (user_id);
CREATE INDEX idx_payments_order    ON payments (order_id);
CREATE INDEX idx_payments_provider ON payments (provider, provider_tx_id);
CREATE INDEX idx_payments_status   ON payments (status);

CREATE TRIGGER set_payments_updated_at
    BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- =============================================================================
-- SERVICES (CCTV, Networking, Linux, Smart Home, Cyber)
-- =============================================================================

CREATE TABLE services (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name             VARCHAR(200) NOT NULL,
    slug             VARCHAR(250) NOT NULL UNIQUE,
    tagline          VARCHAR(255),
    description      TEXT NOT NULL,
    icon             VARCHAR(100),
    cover_image_url  TEXT,
    features         JSONB DEFAULT '[]',       -- List of features/deliverables
    pricing          JSONB DEFAULT '{}',       -- {model: 'fixed'|'hourly', from: 5000, currency: 'KES'}
    faqs             JSONB DEFAULT '[]',       -- [{question, answer}]
    is_active        BOOLEAN NOT NULL DEFAULT TRUE,
    is_featured      BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order       SMALLINT DEFAULT 0,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE service_inquiries (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_id      UUID REFERENCES services(id) ON DELETE SET NULL,
    user_id         UUID REFERENCES users(id) ON DELETE SET NULL,
    name            VARCHAR(255) NOT NULL,
    email           VARCHAR(320) NOT NULL,
    phone           VARCHAR(30),
    message         TEXT NOT NULL,
    location        VARCHAR(255),
    budget_kes      DECIMAL(12,2),
    preferred_date  DATE,
    status          VARCHAR(30) NOT NULL DEFAULT 'new',   -- new | reviewing | quoted | closed
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_services_slug    ON services (slug);
CREATE INDEX idx_inquiries_status ON service_inquiries (status, created_at);

-- =============================================================================
-- ARCADE / GAMES
-- =============================================================================

CREATE TABLE games (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name         VARCHAR(200) NOT NULL,
    slug         VARCHAR(250) NOT NULL UNIQUE,
    description  TEXT,
    cover_url    TEXT,
    genre        VARCHAR(50),
    is_active    BOOLEAN NOT NULL DEFAULT TRUE,
    requires_auth BOOLEAN NOT NULL DEFAULT FALSE,
    config       JSONB DEFAULT '{}',
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE game_sessions (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_id      UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    user_id      UUID REFERENCES users(id) ON DELETE SET NULL,
    score        INTEGER NOT NULL DEFAULT 0,
    duration_s   INTEGER,                      -- Session duration in seconds
    metadata     JSONB DEFAULT '{}',           -- Level reached, items collected, etc.
    played_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE game_achievements (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_id      UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    key          VARCHAR(100) NOT NULL,
    name         VARCHAR(200) NOT NULL,
    description  TEXT,
    icon         VARCHAR(100),
    points       INTEGER NOT NULL DEFAULT 0,
    UNIQUE (game_id, key)
);

CREATE TABLE user_achievements (
    user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    achievement_id UUID NOT NULL REFERENCES game_achievements(id) ON DELETE CASCADE,
    unlocked_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, achievement_id)
);

CREATE INDEX idx_game_sessions_user   ON game_sessions (user_id, game_id);
CREATE INDEX idx_game_sessions_score  ON game_sessions (game_id, score DESC);

-- =============================================================================
-- AETSH-69 AI INTELLIGENCE LAYER
-- =============================================================================

-- Knowledge base: documents embedded for RAG
CREATE TABLE ai_knowledge_base (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    knowledge_type    knowledge_type NOT NULL,
    source_type       VARCHAR(50),             -- blog_post | project | product | manual | faq
    source_id         UUID,                    -- FK to source entity (nullable for manual entries)
    title             VARCHAR(500) NOT NULL,
    content           TEXT NOT NULL,           -- Raw text used for embedding
    content_metadata  JSONB DEFAULT '{}',      -- Extra context {url, tags, category, ...}
    embedding         vector(1536),            -- pgvector column
    index_status      search_index_status NOT NULL DEFAULT 'pending',
    language          VARCHAR(10) DEFAULT 'en',
    chunk_index       SMALLINT DEFAULT 0,      -- For multi-chunk documents
    chunk_total       SMALLINT DEFAULT 1,
    token_count       INTEGER,
    last_indexed_at   TIMESTAMPTZ,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- IVFFlat index for approximate nearest-neighbour search (cosine similarity)
-- Build after loading initial data: CREATE INDEX CONCURRENTLY
CREATE INDEX idx_kb_embedding ON ai_knowledge_base USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 100);
CREATE INDEX idx_kb_type      ON ai_knowledge_base (knowledge_type);
CREATE INDEX idx_kb_source    ON ai_knowledge_base (source_type, source_id);
CREATE INDEX idx_kb_status    ON ai_knowledge_base (index_status);

CREATE TRIGGER set_kb_updated_at
    BEFORE UPDATE ON ai_knowledge_base
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();


-- AI Conversations
CREATE TABLE ai_conversations (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID REFERENCES users(id) ON DELETE SET NULL,
    session_token   TEXT,                      -- For anonymous sessions
    title           VARCHAR(500),
    context_type    VARCHAR(50) DEFAULT 'general',  -- general | shop | services | blog | arcade
    total_messages  INTEGER NOT NULL DEFAULT 0,
    total_tokens    INTEGER NOT NULL DEFAULT 0,
    is_archived     BOOLEAN NOT NULL DEFAULT FALSE,
    metadata        JSONB DEFAULT '{}',
    started_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_message_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ai_conv_user    ON ai_conversations (user_id, last_message_at DESC);
CREATE INDEX idx_ai_conv_session ON ai_conversations (session_token) WHERE session_token IS NOT NULL;


-- AI Messages
CREATE TABLE ai_messages (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id  UUID NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
    role             ai_role NOT NULL,
    content          TEXT NOT NULL,
    sources_used     JSONB DEFAULT '[]',       -- [{kb_id, title, similarity_score}]
    model_used       VARCHAR(100),
    tokens_used      INTEGER,
    latency_ms       INTEGER,
    guardrail_flags  JSONB DEFAULT '[]',       -- Any triggered safety checks
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ai_messages_conv ON ai_messages (conversation_id, created_at);


-- AI Guardrails log
CREATE TABLE ai_guardrail_events (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES ai_conversations(id) ON DELETE SET NULL,
    user_id         UUID REFERENCES users(id) ON DELETE SET NULL,
    rule_triggered  VARCHAR(100) NOT NULL,     -- e.g. 'prompt_injection', 'pii_detected'
    severity        VARCHAR(20) NOT NULL,      -- low | medium | high | critical
    input_snippet   TEXT,                      -- Truncated input that triggered the rule
    action_taken    VARCHAR(50) NOT NULL,       -- blocked | warned | logged
    ip_address      INET,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_guardrail_time ON ai_guardrail_events (created_at DESC);
CREATE INDEX idx_guardrail_rule ON ai_guardrail_events (rule_triggered);


-- AI Rate limiting per user/session
CREATE TABLE ai_usage_quotas (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    session_token   TEXT,
    period_start    TIMESTAMPTZ NOT NULL,
    period_end      TIMESTAMPTZ NOT NULL,
    requests_used   INTEGER NOT NULL DEFAULT 0,
    tokens_used     INTEGER NOT NULL DEFAULT 0,
    UNIQUE NULLS NOT DISTINCT (user_id, period_start),
    UNIQUE NULLS NOT DISTINCT (session_token, period_start)
);

CREATE INDEX idx_ai_quota_user ON ai_usage_quotas (user_id, period_end DESC);

-- =============================================================================
-- MEDIA
-- =============================================================================

CREATE TABLE media_files (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    uploader_id  UUID REFERENCES users(id) ON DELETE SET NULL,
    filename     VARCHAR(500) NOT NULL,
    original_name VARCHAR(500) NOT NULL,
    mime_type    VARCHAR(100) NOT NULL,
    file_type    media_type NOT NULL,
    storage_key  TEXT NOT NULL UNIQUE,         -- S3/R2 object key or local path
    public_url   TEXT,
    file_size    INTEGER NOT NULL,             -- Bytes
    width        INTEGER,
    height       INTEGER,
    duration_s   INTEGER,                      -- For video/audio
    alt_text     TEXT,
    is_public    BOOLEAN NOT NULL DEFAULT TRUE,
    metadata     JSONB DEFAULT '{}',
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_media_uploader  ON media_files (uploader_id);
CREATE INDEX idx_media_type      ON media_files (file_type);
CREATE INDEX idx_media_public    ON media_files (is_public, created_at DESC);

-- =============================================================================
-- NOTIFICATIONS
-- =============================================================================

CREATE TABLE notification_templates (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key         VARCHAR(100) NOT NULL UNIQUE,  -- e.g. 'welcome_email', 'order_confirmed'
    channel     notification_channel NOT NULL,
    subject     VARCHAR(255),
    body        TEXT NOT NULL,                 -- Jinja2 template
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE notifications (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id      UUID REFERENCES users(id) ON DELETE CASCADE,
    template_id  UUID REFERENCES notification_templates(id) ON DELETE SET NULL,
    channel      notification_channel NOT NULL,
    status       notification_status NOT NULL DEFAULT 'pending',
    subject      VARCHAR(255),
    body         TEXT NOT NULL,
    metadata     JSONB DEFAULT '{}',
    scheduled_at TIMESTAMPTZ,
    sent_at      TIMESTAMPTZ,
    read_at      TIMESTAMPTZ,
    error        TEXT,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notif_user    ON notifications (user_id, created_at DESC);
CREATE INDEX idx_notif_status  ON notifications (status, scheduled_at);
CREATE INDEX idx_notif_unread  ON notifications (user_id, read_at) WHERE read_at IS NULL;

-- =============================================================================
-- ANALYTICS
-- =============================================================================

CREATE TABLE analytics_events (
    id           BIGSERIAL PRIMARY KEY,
    session_id   UUID NOT NULL,
    user_id      UUID REFERENCES users(id) ON DELETE SET NULL,
    event_type   event_type NOT NULL,
    page_path    TEXT,
    referrer     TEXT,
    resource_type VARCHAR(50),               -- blog_post | product | project | etc.
    resource_id  UUID,
    properties   JSONB DEFAULT '{}',
    ip_hash      TEXT,                       -- Hashed for privacy
    country      VARCHAR(2),
    city         VARCHAR(100),
    device_type  VARCHAR(20),               -- desktop | mobile | tablet
    browser      VARCHAR(50),
    os           VARCHAR(50),
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
) PARTITION BY RANGE (created_at);          -- Partition by month for scale

-- Create initial partitions
CREATE TABLE analytics_events_2025_q1 PARTITION OF analytics_events
    FOR VALUES FROM ('2025-01-01') TO ('2025-04-01');
CREATE TABLE analytics_events_2025_q2 PARTITION OF analytics_events
    FOR VALUES FROM ('2025-04-01') TO ('2025-07-01');
CREATE TABLE analytics_events_2025_q3 PARTITION OF analytics_events
    FOR VALUES FROM ('2025-07-01') TO ('2025-10-01');
CREATE TABLE analytics_events_2025_q4 PARTITION OF analytics_events
    FOR VALUES FROM ('2025-10-01') TO ('2026-01-01');
CREATE TABLE analytics_events_2026_q1 PARTITION OF analytics_events
    FOR VALUES FROM ('2026-01-01') TO ('2026-04-01');
CREATE TABLE analytics_events_2026_q2 PARTITION OF analytics_events
    FOR VALUES FROM ('2026-04-01') TO ('2026-07-01');

CREATE INDEX idx_analytics_session   ON analytics_events (session_id, created_at);
CREATE INDEX idx_analytics_user      ON analytics_events (user_id, created_at);
CREATE INDEX idx_analytics_type      ON analytics_events (event_type, created_at);
CREATE INDEX idx_analytics_resource  ON analytics_events (resource_type, resource_id);

-- =============================================================================
-- SEARCH
-- =============================================================================

CREATE TABLE search_index (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resource_type   VARCHAR(50) NOT NULL,
    resource_id     UUID NOT NULL,
    title           TEXT NOT NULL,
    body            TEXT,
    tags            JSONB DEFAULT '[]',
    url_path        TEXT NOT NULL,
    image_url       TEXT,
    published_at    TIMESTAMPTZ,
    weight          SMALLINT NOT NULL DEFAULT 1,   -- Ranking boost (1–5)
    status          search_index_status NOT NULL DEFAULT 'pending',
    fts_vector      tsvector,
    embedding       vector(1536),              -- Semantic search
    indexed_at      TIMESTAMPTZ,
    UNIQUE (resource_type, resource_id)
);

CREATE INDEX idx_search_type        ON search_index (resource_type);
CREATE INDEX idx_search_fts         ON search_index USING GIN (fts_vector);
CREATE INDEX idx_search_embedding   ON search_index USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 100);

-- Auto-update fts_vector
CREATE OR REPLACE FUNCTION update_search_fts()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fts_vector = setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
                     setweight(to_tsvector('english', COALESCE(NEW.body, '')), 'B');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_search_fts
    BEFORE INSERT OR UPDATE OF title, body ON search_index
    FOR EACH ROW EXECUTE FUNCTION update_search_fts();

-- =============================================================================
-- FEATURE FLAGS
-- =============================================================================

CREATE TABLE feature_flags (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key          VARCHAR(100) NOT NULL UNIQUE,
    description  TEXT,
    is_enabled   BOOLEAN NOT NULL DEFAULT FALSE,
    rollout_pct  SMALLINT DEFAULT 100,         -- Percentage of users who see this
    conditions   JSONB DEFAULT '{}',           -- {user_roles: ['admin'], env: 'production'}
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- INITIAL SEED DATA
-- =============================================================================

-- Default feature flags
INSERT INTO feature_flags (key, description, is_enabled, rollout_pct) VALUES
    ('ai_chat',              'AETSH-69 chat interface',            TRUE,  100),
    ('ai_semantic_search',   'Semantic search via embeddings',     TRUE,  100),
    ('shop',                 'Hardware shop',                      TRUE,  100),
    ('arcade',               'Games arcade',                       TRUE,  100),
    ('membership',           'Membership tiers',                   TRUE,  100),
    ('analytics_public',     'Public analytics dashboard',         FALSE, 0),
    ('beta_features',        'Beta feature rollout',               FALSE, 10),
    ('ai_image_analysis',    'AI-powered image analysis',          FALSE, 0),
    ('whatsapp_ordering',    'WhatsApp commerce ordering',         TRUE,  100);

-- Membership perks
INSERT INTO membership_perks (tier, perk_key, perk_value, description) VALUES
    ('free',      'ai_requests_per_day',  '10',          'Daily AI chat requests'),
    ('free',      'download_access',      'false',       'Access to downloadable resources'),
    ('supporter', 'ai_requests_per_day',  '50',          'Daily AI chat requests'),
    ('supporter', 'download_access',      'true',        'Access to downloadable resources'),
    ('supporter', 'early_access',         'false',       'Early access to new content'),
    ('pro',       'ai_requests_per_day',  '200',         'Daily AI chat requests'),
    ('pro',       'download_access',      'true',        'Access to downloadable resources'),
    ('pro',       'early_access',         'true',        'Early access to new content'),
    ('pro',       'api_access',           'true',        'Direct API access'),
    ('vip',       'ai_requests_per_day',  'unlimited',   'Unlimited AI chat requests'),
    ('vip',       'download_access',      'true',        'Access to downloadable resources'),
    ('vip',       'early_access',         'true',        'Early access to new content'),
    ('vip',       'api_access',           'true',        'Direct API access'),
    ('vip',       'custom_ai_persona',    'true',        'Customise AETSH-69 persona');
