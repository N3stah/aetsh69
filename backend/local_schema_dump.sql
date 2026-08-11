--
-- PostgreSQL database dump
--

\restrict wwBFHR1IzhDcV89fKbNbXK0rKC93o133rtibOxyMbV2EaGtiUvoaCLG81BrvJNn

-- Dumped from database version 16.14 (Debian 16.14-1.pgdg12+1)
-- Dumped by pg_dump version 18.4 (Ubuntu 18.4-0ubuntu0.26.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: pg_trgm; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA public;


--
-- Name: EXTENSION pg_trgm; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pg_trgm IS 'text similarity measurement and index searching based on trigrams';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: vector; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA public;


--
-- Name: EXTENSION vector; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION vector IS 'vector data type and ivfflat and hnsw access methods';


--
-- Name: ai_role; Type: TYPE; Schema: public; Owner: ecosystem
--

CREATE TYPE public.ai_role AS ENUM (
    'user',
    'assistant',
    'system'
);


ALTER TYPE public.ai_role OWNER TO ecosystem;

--
-- Name: inquiry_status; Type: TYPE; Schema: public; Owner: ecosystem
--

CREATE TYPE public.inquiry_status AS ENUM (
    'new',
    'contacted',
    'in_progress',
    'completed',
    'closed'
);


ALTER TYPE public.inquiry_status OWNER TO ecosystem;

--
-- Name: order_status; Type: TYPE; Schema: public; Owner: ecosystem
--

CREATE TYPE public.order_status AS ENUM (
    'pending',
    'confirmed',
    'shipped',
    'delivered',
    'cancelled'
);


ALTER TYPE public.order_status OWNER TO ecosystem;

--
-- Name: payment_provider; Type: TYPE; Schema: public; Owner: ecosystem
--

CREATE TYPE public.payment_provider AS ENUM (
    'mpesa',
    'stripe'
);


ALTER TYPE public.payment_provider OWNER TO ecosystem;

--
-- Name: payment_status; Type: TYPE; Schema: public; Owner: ecosystem
--

CREATE TYPE public.payment_status AS ENUM (
    'pending',
    'success',
    'failed',
    'cancelled'
);


ALTER TYPE public.payment_status OWNER TO ecosystem;

--
-- Name: post_status; Type: TYPE; Schema: public; Owner: ecosystem
--

CREATE TYPE public.post_status AS ENUM (
    'draft',
    'published',
    'archived'
);


ALTER TYPE public.post_status OWNER TO ecosystem;

--
-- Name: project_status; Type: TYPE; Schema: public; Owner: ecosystem
--

CREATE TYPE public.project_status AS ENUM (
    'planning',
    'in_development',
    'active',
    'maintenance',
    'archived'
);


ALTER TYPE public.project_status OWNER TO ecosystem;

--
-- Name: user_role; Type: TYPE; Schema: public; Owner: ecosystem
--

CREATE TYPE public.user_role AS ENUM (
    'free',
    'supporter',
    'pro',
    'vip',
    'admin',
    'builder',
    'enterprise'
);


ALTER TYPE public.user_role OWNER TO ecosystem;

--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: ecosystem
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO ecosystem;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: activity_logs; Type: TABLE; Schema: public; Owner: ecosystem
--

CREATE TABLE public.activity_logs (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid,
    action character varying(50) NOT NULL,
    entity_type character varying(50) NOT NULL,
    entity_id uuid,
    ip_address inet,
    user_agent text,
    request_path text,
    request_method character varying(10),
    old_data jsonb,
    new_data jsonb,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.activity_logs OWNER TO ecosystem;

--
-- Name: ai_analytics; Type: TABLE; Schema: public; Owner: ecosystem
--

CREATE TABLE public.ai_analytics (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    question text NOT NULL,
    context character varying(100),
    provider character varying(50),
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.ai_analytics OWNER TO ecosystem;

--
-- Name: ai_conversations; Type: TABLE; Schema: public; Owner: ecosystem
--

CREATE TABLE public.ai_conversations (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    context_type character varying(50) DEFAULT 'general'::character varying NOT NULL,
    total_messages integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    last_message_at timestamp with time zone DEFAULT now(),
    user_id uuid,
    session_id character varying(100),
    title character varying(200),
    total_tokens_used integer DEFAULT 0 NOT NULL,
    is_pinned boolean DEFAULT false NOT NULL,
    is_archived boolean DEFAULT false NOT NULL,
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.ai_conversations OWNER TO ecosystem;

--
-- Name: ai_messages; Type: TABLE; Schema: public; Owner: ecosystem
--

CREATE TABLE public.ai_messages (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    conversation_id uuid NOT NULL,
    role character varying(20) NOT NULL,
    content text NOT NULL,
    tokens_used integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    content_type character varying(20) DEFAULT 'text'::character varying,
    model_used character varying(50),
    tokens_input integer DEFAULT 0,
    tokens_output integer DEFAULT 0,
    latency_ms integer,
    user_feedback smallint,
    feedback_note text,
    flagged boolean DEFAULT false NOT NULL,
    flag_reason character varying(100)
);


ALTER TABLE public.ai_messages OWNER TO ecosystem;

--
-- Name: alembic_version; Type: TABLE; Schema: public; Owner: ecosystem
--

CREATE TABLE public.alembic_version (
    version_num character varying(32) NOT NULL
);


ALTER TABLE public.alembic_version OWNER TO ecosystem;

--
-- Name: api_keys; Type: TABLE; Schema: public; Owner: ecosystem
--

CREATE TABLE public.api_keys (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    name character varying(100) NOT NULL,
    key_hash character varying(255) NOT NULL,
    key_prefix character varying(8) NOT NULL,
    rate_limit integer DEFAULT 100,
    usage_count integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    expires_at timestamp with time zone,
    last_used_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.api_keys OWNER TO ecosystem;

--
-- Name: arcade_games; Type: TABLE; Schema: public; Owner: ecosystem
--

CREATE TABLE public.arcade_games (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title character varying(255) NOT NULL,
    slug character varying(255) NOT NULL,
    description text,
    genre character varying(100),
    status character varying(50) DEFAULT 'live'::character varying,
    iframe_url character varying(500),
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.arcade_games OWNER TO ecosystem;

--
-- Name: arcade_scores; Type: TABLE; Schema: public; Owner: ecosystem
--

CREATE TABLE public.arcade_scores (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    player_name character varying(50) NOT NULL,
    player_id uuid,
    game_name character varying(50) NOT NULL,
    game_slug character varying(50) NOT NULL,
    score integer NOT NULL,
    level_reached integer DEFAULT 1,
    time_played_seconds integer,
    game_settings jsonb DEFAULT '{}'::jsonb,
    is_verified boolean DEFAULT false NOT NULL,
    ip_address inet,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.arcade_scores OWNER TO ecosystem;

--
-- Name: blog_categories; Type: TABLE; Schema: public; Owner: ecosystem
--

CREATE TABLE public.blog_categories (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(100) NOT NULL,
    slug character varying(100) NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now(),
    color character varying(50) DEFAULT '#B8552F'::character varying,
    icon character varying(50) DEFAULT 'filetext'::character varying,
    sort_order integer DEFAULT 0
);


ALTER TABLE public.blog_categories OWNER TO ecosystem;

--
-- Name: blog_post_tags; Type: TABLE; Schema: public; Owner: ecosystem
--

CREATE TABLE public.blog_post_tags (
    post_id uuid NOT NULL,
    tag_id uuid NOT NULL
);


ALTER TABLE public.blog_post_tags OWNER TO ecosystem;

--
-- Name: blog_posts; Type: TABLE; Schema: public; Owner: ecosystem
--

CREATE TABLE public.blog_posts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title character varying(255) NOT NULL,
    slug character varying(255) NOT NULL,
    excerpt text,
    content text,
    category_id uuid,
    cover_image_url character varying(500),
    status character varying(50) DEFAULT 'draft'::character varying,
    featured boolean DEFAULT false,
    reading_time integer DEFAULT 0,
    view_count integer DEFAULT 0,
    like_count integer DEFAULT 0,
    published_at timestamp with time zone,
    seo_title character varying(255),
    seo_description text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    author_id uuid
);


ALTER TABLE public.blog_posts OWNER TO ecosystem;

--
-- Name: blog_tags; Type: TABLE; Schema: public; Owner: ecosystem
--

CREATE TABLE public.blog_tags (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(50) NOT NULL,
    slug character varying(50) NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.blog_tags OWNER TO ecosystem;

--
-- Name: contact_submissions; Type: TABLE; Schema: public; Owner: ecosystem
--

CREATE TABLE public.contact_submissions (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(100) NOT NULL,
    email character varying(255) NOT NULL,
    phone character varying(20),
    subject character varying(200),
    message text NOT NULL,
    is_read boolean DEFAULT false NOT NULL,
    is_replied boolean DEFAULT false NOT NULL,
    replied_at timestamp with time zone,
    replied_by uuid,
    page_source character varying(100),
    ip_address inet,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.contact_submissions OWNER TO ecosystem;

--
-- Name: conversation_messages; Type: TABLE; Schema: public; Owner: ecosystem
--

CREATE TABLE public.conversation_messages (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    conversation_id uuid NOT NULL,
    role character varying(20) NOT NULL,
    content text NOT NULL,
    user_id uuid,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.conversation_messages OWNER TO ecosystem;

--
-- Name: donations; Type: TABLE; Schema: public; Owner: ecosystem
--

CREATE TABLE public.donations (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    donor_name character varying(100),
    donor_email character varying(255),
    donor_phone character varying(20),
    donor_message text,
    is_anonymous boolean DEFAULT false NOT NULL,
    amount_kes numeric(10,2) NOT NULL,
    amount_usd numeric(10,2),
    payment_method character varying(50) DEFAULT 'mpesa'::character varying NOT NULL,
    payment_status character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    payment_reference character varying(100),
    paid_at timestamp with time zone,
    display_on_wall boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.donations OWNER TO ecosystem;

--
-- Name: knowledge_chunks; Type: TABLE; Schema: public; Owner: ecosystem
--

CREATE TABLE public.knowledge_chunks (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    source character varying(100) NOT NULL,
    title character varying(255),
    content text NOT NULL,
    embedding public.vector(1536),
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.knowledge_chunks OWNER TO ecosystem;

--
-- Name: memberships; Type: TABLE; Schema: public; Owner: ecosystem
--

CREATE TABLE public.memberships (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    tier character varying(20) NOT NULL,
    tier_name character varying(50) NOT NULL,
    price_kes numeric(10,2) NOT NULL,
    billing_cycle character varying(20) DEFAULT 'monthly'::character varying NOT NULL,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    cancelled_at timestamp with time zone,
    is_active boolean DEFAULT true NOT NULL,
    is_recurring boolean DEFAULT true NOT NULL,
    payment_method character varying(50) DEFAULT 'mpesa'::character varying,
    payment_reference character varying(100),
    ai_requests_used integer DEFAULT 0 NOT NULL,
    ai_requests_limit integer DEFAULT 10 NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.memberships OWNER TO ecosystem;

--
-- Name: newsletter_subscribers; Type: TABLE; Schema: public; Owner: ecosystem
--

CREATE TABLE public.newsletter_subscribers (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    email character varying(255) NOT NULL,
    name character varying(100),
    is_active boolean DEFAULT true NOT NULL,
    is_verified boolean DEFAULT false NOT NULL,
    signup_source character varying(50) DEFAULT 'website'::character varying,
    verified_at timestamp with time zone,
    unsubscribed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.newsletter_subscribers OWNER TO ecosystem;

--
-- Name: payments; Type: TABLE; Schema: public; Owner: ecosystem
--

CREATE TABLE public.payments (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    amount_kes numeric(10,2) NOT NULL,
    currency character varying(3) DEFAULT 'KES'::character varying NOT NULL,
    provider public.payment_provider NOT NULL,
    status public.payment_status DEFAULT 'pending'::public.payment_status NOT NULL,
    provider_ref character varying(255),
    merchant_request_id character varying(255),
    checkout_request_id character varying(255),
    metadata jsonb,
    tier_unlocked character varying(50),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.payments OWNER TO ecosystem;

--
-- Name: photos; Type: TABLE; Schema: public; Owner: ecosystem
--

CREATE TABLE public.photos (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    image_url text NOT NULL,
    location character varying(255),
    description text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.photos OWNER TO ecosystem;

--
-- Name: photos_id_seq; Type: SEQUENCE; Schema: public; Owner: ecosystem
--

CREATE SEQUENCE public.photos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.photos_id_seq OWNER TO ecosystem;

--
-- Name: photos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ecosystem
--

ALTER SEQUENCE public.photos_id_seq OWNED BY public.photos.id;


--
-- Name: product_categories; Type: TABLE; Schema: public; Owner: ecosystem
--

CREATE TABLE public.product_categories (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(100) NOT NULL,
    slug character varying(100) NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.product_categories OWNER TO ecosystem;

--
-- Name: products; Type: TABLE; Schema: public; Owner: ecosystem
--

CREATE TABLE public.products (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    slug character varying(255) NOT NULL,
    short_description text,
    description text,
    images jsonb DEFAULT '[]'::jsonb,
    price_kes integer DEFAULT 0,
    price_usd integer DEFAULT 0,
    stock_quantity integer DEFAULT 0,
    is_featured boolean DEFAULT false,
    is_active boolean DEFAULT true,
    specifications jsonb DEFAULT '{}'::jsonb,
    tags jsonb DEFAULT '[]'::jsonb,
    category_id uuid,
    view_count integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.products OWNER TO ecosystem;

--
-- Name: projects; Type: TABLE; Schema: public; Owner: ecosystem
--

CREATE TABLE public.projects (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title character varying(255) NOT NULL,
    slug character varying(255) NOT NULL,
    tagline character varying(500),
    description text,
    content text,
    cover_image_url character varying(500),
    tech_stack jsonb DEFAULT '[]'::jsonb,
    links jsonb DEFAULT '{}'::jsonb,
    status character varying(50) DEFAULT 'published'::character varying,
    featured boolean DEFAULT false,
    sort_order integer DEFAULT 0,
    start_date date,
    end_date date,
    is_ongoing boolean DEFAULT false,
    view_count integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.projects OWNER TO ecosystem;

--
-- Name: recipes; Type: TABLE; Schema: public; Owner: ecosystem
--

CREATE TABLE public.recipes (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    slug character varying(100) NOT NULL,
    title character varying(200) NOT NULL,
    description text,
    cuisine_type character varying(50),
    difficulty character varying(20) DEFAULT 'medium'::character varying,
    prep_time_minutes integer,
    cook_time_minutes integer,
    servings integer,
    ingredients jsonb DEFAULT '[]'::jsonb NOT NULL,
    instructions jsonb DEFAULT '[]'::jsonb NOT NULL,
    tips text,
    images text[] DEFAULT '{}'::text[],
    video_url text,
    meal_type character varying(50),
    dietary_tags text[] DEFAULT '{}'::text[],
    tags text[] DEFAULT '{}'::text[],
    is_featured boolean DEFAULT false NOT NULL,
    view_count integer DEFAULT 0,
    like_count integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.recipes OWNER TO ecosystem;

--
-- Name: refresh_tokens; Type: TABLE; Schema: public; Owner: ecosystem
--

CREATE TABLE public.refresh_tokens (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    token_hash character varying(255) NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    revoked_at timestamp with time zone,
    ip_address inet,
    user_agent text,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.refresh_tokens OWNER TO ecosystem;

--
-- Name: service_inquiries; Type: TABLE; Schema: public; Owner: ecosystem
--

CREATE TABLE public.service_inquiries (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    service_type character varying(50) NOT NULL,
    service_name character varying(100) NOT NULL,
    customer_name character varying(100) NOT NULL,
    customer_email character varying(255),
    customer_phone character varying(20) NOT NULL,
    customer_location character varying(200) NOT NULL,
    description text NOT NULL,
    budget_kes numeric(10,2),
    urgency character varying(20) DEFAULT 'normal'::character varying,
    status public.inquiry_status DEFAULT 'new'::public.inquiry_status NOT NULL,
    quoted_price_kes numeric(10,2),
    scheduled_date date,
    completed_at timestamp with time zone,
    assigned_to uuid,
    admin_notes text,
    source character varying(50) DEFAULT 'website'::character varying,
    referrer text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.service_inquiries OWNER TO ecosystem;

--
-- Name: services; Type: TABLE; Schema: public; Owner: ecosystem
--

CREATE TABLE public.services (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title character varying(255) NOT NULL,
    slug character varying(255) NOT NULL,
    description text,
    icon character varying(50),
    features jsonb DEFAULT '[]'::jsonb,
    price character varying(100),
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.services OWNER TO ecosystem;

--
-- Name: shop_orders; Type: TABLE; Schema: public; Owner: ecosystem
--

CREATE TABLE public.shop_orders (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    order_number character varying(20) NOT NULL,
    customer_name character varying(100) NOT NULL,
    customer_email character varying(255),
    customer_phone character varying(20) NOT NULL,
    customer_location character varying(200) NOT NULL,
    status public.order_status DEFAULT 'pending'::public.order_status NOT NULL,
    items jsonb DEFAULT '[]'::jsonb NOT NULL,
    subtotal_kes numeric(10,2) NOT NULL,
    shipping_kes numeric(10,2) DEFAULT 0,
    discount_kes numeric(10,2) DEFAULT 0,
    total_kes numeric(10,2) NOT NULL,
    payment_method character varying(50) DEFAULT 'mpesa'::character varying,
    payment_status character varying(20) DEFAULT 'pending'::character varying,
    payment_reference character varying(100),
    paid_at timestamp with time zone,
    notes text,
    admin_notes text,
    delivered_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.shop_orders OWNER TO ecosystem;

--
-- Name: shop_products; Type: TABLE; Schema: public; Owner: ecosystem
--

CREATE TABLE public.shop_products (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    slug character varying(100) NOT NULL,
    name character varying(200) NOT NULL,
    description text,
    short_description character varying(300),
    price_kes numeric(10,2) NOT NULL,
    compare_price_kes numeric(10,2),
    cost_price_kes numeric(10,2),
    sku character varying(50),
    stock_quantity integer DEFAULT 0 NOT NULL,
    track_inventory boolean DEFAULT true NOT NULL,
    is_available boolean DEFAULT true NOT NULL,
    images text[] DEFAULT '{}'::text[],
    thumbnail text,
    category character varying(50) DEFAULT 'accessories'::character varying NOT NULL,
    tags text[] DEFAULT '{}'::text[],
    brand character varying(50),
    specifications jsonb DEFAULT '{}'::jsonb,
    condition_type character varying(20) DEFAULT 'new'::character varying,
    warranty_months integer DEFAULT 0,
    meta_title character varying(200),
    meta_description character varying(300),
    display_order integer DEFAULT 0,
    view_count integer DEFAULT 0,
    sold_count integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.shop_products OWNER TO ecosystem;

--
-- Name: users; Type: TABLE; Schema: public; Owner: ecosystem
--

CREATE TABLE public.users (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    email character varying(255) NOT NULL,
    username character varying(50),
    hashed_password character varying(255),
    full_name character varying(100),
    avatar_url text,
    bio text,
    location character varying(100),
    phone character varying(20),
    role public.user_role DEFAULT 'free'::public.user_role NOT NULL,
    membership_tier character varying(20) DEFAULT 'free'::character varying,
    membership_expires timestamp with time zone,
    ai_requests_today integer DEFAULT 0 NOT NULL,
    ai_requests_limit integer DEFAULT 10 NOT NULL,
    github_url text,
    linkedin_url text,
    twitter_url text,
    website_url text,
    is_active boolean DEFAULT true NOT NULL,
    is_verified boolean DEFAULT false NOT NULL,
    is_superuser boolean DEFAULT false NOT NULL,
    last_login_at timestamp with time zone,
    email_verified_at timestamp with time zone,
    preferences jsonb DEFAULT '{}'::jsonb,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    login_attempts integer DEFAULT 0 NOT NULL,
    locked_until timestamp with time zone,
    last_login_ip character varying(45),
    verification_token character varying(128),
    verification_token_expires timestamp with time zone,
    reset_token character varying,
    reset_token_expires timestamp without time zone
);


ALTER TABLE public.users OWNER TO ecosystem;

--
-- Name: photos id; Type: DEFAULT; Schema: public; Owner: ecosystem
--

ALTER TABLE ONLY public.photos ALTER COLUMN id SET DEFAULT nextval('public.photos_id_seq'::regclass);


--
-- Name: activity_logs activity_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: ecosystem
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_pkey PRIMARY KEY (id);


--
-- Name: ai_analytics ai_analytics_pkey; Type: CONSTRAINT; Schema: public; Owner: ecosystem
--

ALTER TABLE ONLY public.ai_analytics
    ADD CONSTRAINT ai_analytics_pkey PRIMARY KEY (id);


--
-- Name: ai_conversations ai_conversations_pkey; Type: CONSTRAINT; Schema: public; Owner: ecosystem
--

ALTER TABLE ONLY public.ai_conversations
    ADD CONSTRAINT ai_conversations_pkey PRIMARY KEY (id);


--
-- Name: ai_messages ai_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: ecosystem
--

ALTER TABLE ONLY public.ai_messages
    ADD CONSTRAINT ai_messages_pkey PRIMARY KEY (id);


--
-- Name: alembic_version alembic_version_pkc; Type: CONSTRAINT; Schema: public; Owner: ecosystem
--

ALTER TABLE ONLY public.alembic_version
    ADD CONSTRAINT alembic_version_pkc PRIMARY KEY (version_num);


--
-- Name: api_keys api_keys_pkey; Type: CONSTRAINT; Schema: public; Owner: ecosystem
--

ALTER TABLE ONLY public.api_keys
    ADD CONSTRAINT api_keys_pkey PRIMARY KEY (id);


--
-- Name: arcade_games arcade_games_pkey; Type: CONSTRAINT; Schema: public; Owner: ecosystem
--

ALTER TABLE ONLY public.arcade_games
    ADD CONSTRAINT arcade_games_pkey PRIMARY KEY (id);


--
-- Name: arcade_games arcade_games_slug_key; Type: CONSTRAINT; Schema: public; Owner: ecosystem
--

ALTER TABLE ONLY public.arcade_games
    ADD CONSTRAINT arcade_games_slug_key UNIQUE (slug);


--
-- Name: arcade_scores arcade_scores_pkey; Type: CONSTRAINT; Schema: public; Owner: ecosystem
--

ALTER TABLE ONLY public.arcade_scores
    ADD CONSTRAINT arcade_scores_pkey PRIMARY KEY (id);


--
-- Name: blog_categories blog_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: ecosystem
--

ALTER TABLE ONLY public.blog_categories
    ADD CONSTRAINT blog_categories_pkey PRIMARY KEY (id);


--
-- Name: blog_categories blog_categories_slug_key; Type: CONSTRAINT; Schema: public; Owner: ecosystem
--

ALTER TABLE ONLY public.blog_categories
    ADD CONSTRAINT blog_categories_slug_key UNIQUE (slug);


--
-- Name: blog_post_tags blog_post_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: ecosystem
--

ALTER TABLE ONLY public.blog_post_tags
    ADD CONSTRAINT blog_post_tags_pkey PRIMARY KEY (post_id, tag_id);


--
-- Name: blog_posts blog_posts_pkey; Type: CONSTRAINT; Schema: public; Owner: ecosystem
--

ALTER TABLE ONLY public.blog_posts
    ADD CONSTRAINT blog_posts_pkey PRIMARY KEY (id);


--
-- Name: blog_posts blog_posts_slug_key; Type: CONSTRAINT; Schema: public; Owner: ecosystem
--

ALTER TABLE ONLY public.blog_posts
    ADD CONSTRAINT blog_posts_slug_key UNIQUE (slug);


--
-- Name: blog_tags blog_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: ecosystem
--

ALTER TABLE ONLY public.blog_tags
    ADD CONSTRAINT blog_tags_pkey PRIMARY KEY (id);


--
-- Name: blog_tags blog_tags_slug_key; Type: CONSTRAINT; Schema: public; Owner: ecosystem
--

ALTER TABLE ONLY public.blog_tags
    ADD CONSTRAINT blog_tags_slug_key UNIQUE (slug);


--
-- Name: contact_submissions contact_submissions_pkey; Type: CONSTRAINT; Schema: public; Owner: ecosystem
--

ALTER TABLE ONLY public.contact_submissions
    ADD CONSTRAINT contact_submissions_pkey PRIMARY KEY (id);


--
-- Name: conversation_messages conversation_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: ecosystem
--

ALTER TABLE ONLY public.conversation_messages
    ADD CONSTRAINT conversation_messages_pkey PRIMARY KEY (id);


--
-- Name: donations donations_pkey; Type: CONSTRAINT; Schema: public; Owner: ecosystem
--

ALTER TABLE ONLY public.donations
    ADD CONSTRAINT donations_pkey PRIMARY KEY (id);


--
-- Name: knowledge_chunks knowledge_chunks_pkey; Type: CONSTRAINT; Schema: public; Owner: ecosystem
--

ALTER TABLE ONLY public.knowledge_chunks
    ADD CONSTRAINT knowledge_chunks_pkey PRIMARY KEY (id);


--
-- Name: memberships memberships_pkey; Type: CONSTRAINT; Schema: public; Owner: ecosystem
--

ALTER TABLE ONLY public.memberships
    ADD CONSTRAINT memberships_pkey PRIMARY KEY (id);


--
-- Name: newsletter_subscribers newsletter_subscribers_email_key; Type: CONSTRAINT; Schema: public; Owner: ecosystem
--

ALTER TABLE ONLY public.newsletter_subscribers
    ADD CONSTRAINT newsletter_subscribers_email_key UNIQUE (email);


--
-- Name: newsletter_subscribers newsletter_subscribers_pkey; Type: CONSTRAINT; Schema: public; Owner: ecosystem
--

ALTER TABLE ONLY public.newsletter_subscribers
    ADD CONSTRAINT newsletter_subscribers_pkey PRIMARY KEY (id);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: ecosystem
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: photos photos_pkey; Type: CONSTRAINT; Schema: public; Owner: ecosystem
--

ALTER TABLE ONLY public.photos
    ADD CONSTRAINT photos_pkey PRIMARY KEY (id);


--
-- Name: product_categories product_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: ecosystem
--

ALTER TABLE ONLY public.product_categories
    ADD CONSTRAINT product_categories_pkey PRIMARY KEY (id);


--
-- Name: product_categories product_categories_slug_key; Type: CONSTRAINT; Schema: public; Owner: ecosystem
--

ALTER TABLE ONLY public.product_categories
    ADD CONSTRAINT product_categories_slug_key UNIQUE (slug);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: ecosystem
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: products products_slug_key; Type: CONSTRAINT; Schema: public; Owner: ecosystem
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_slug_key UNIQUE (slug);


--
-- Name: projects projects_pkey; Type: CONSTRAINT; Schema: public; Owner: ecosystem
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (id);


--
-- Name: projects projects_slug_key; Type: CONSTRAINT; Schema: public; Owner: ecosystem
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_slug_key UNIQUE (slug);


--
-- Name: recipes recipes_pkey; Type: CONSTRAINT; Schema: public; Owner: ecosystem
--

ALTER TABLE ONLY public.recipes
    ADD CONSTRAINT recipes_pkey PRIMARY KEY (id);


--
-- Name: recipes recipes_slug_key; Type: CONSTRAINT; Schema: public; Owner: ecosystem
--

ALTER TABLE ONLY public.recipes
    ADD CONSTRAINT recipes_slug_key UNIQUE (slug);


--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: ecosystem
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- Name: service_inquiries service_inquiries_pkey; Type: CONSTRAINT; Schema: public; Owner: ecosystem
--

ALTER TABLE ONLY public.service_inquiries
    ADD CONSTRAINT service_inquiries_pkey PRIMARY KEY (id);


--
-- Name: services services_pkey; Type: CONSTRAINT; Schema: public; Owner: ecosystem
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT services_pkey PRIMARY KEY (id);


--
-- Name: services services_slug_key; Type: CONSTRAINT; Schema: public; Owner: ecosystem
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT services_slug_key UNIQUE (slug);


--
-- Name: shop_orders shop_orders_order_number_key; Type: CONSTRAINT; Schema: public; Owner: ecosystem
--

ALTER TABLE ONLY public.shop_orders
    ADD CONSTRAINT shop_orders_order_number_key UNIQUE (order_number);


--
-- Name: shop_orders shop_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: ecosystem
--

ALTER TABLE ONLY public.shop_orders
    ADD CONSTRAINT shop_orders_pkey PRIMARY KEY (id);


--
-- Name: shop_products shop_products_pkey; Type: CONSTRAINT; Schema: public; Owner: ecosystem
--

ALTER TABLE ONLY public.shop_products
    ADD CONSTRAINT shop_products_pkey PRIMARY KEY (id);


--
-- Name: shop_products shop_products_sku_key; Type: CONSTRAINT; Schema: public; Owner: ecosystem
--

ALTER TABLE ONLY public.shop_products
    ADD CONSTRAINT shop_products_sku_key UNIQUE (sku);


--
-- Name: shop_products shop_products_slug_key; Type: CONSTRAINT; Schema: public; Owner: ecosystem
--

ALTER TABLE ONLY public.shop_products
    ADD CONSTRAINT shop_products_slug_key UNIQUE (slug);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: ecosystem
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: ecosystem
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_reset_token_key; Type: CONSTRAINT; Schema: public; Owner: ecosystem
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_reset_token_key UNIQUE (reset_token);


--
-- Name: users users_reset_token_unique; Type: CONSTRAINT; Schema: public; Owner: ecosystem
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_reset_token_unique UNIQUE (reset_token);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: ecosystem
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: idx_activity_logs_action; Type: INDEX; Schema: public; Owner: ecosystem
--

CREATE INDEX idx_activity_logs_action ON public.activity_logs USING btree (action);


--
-- Name: idx_activity_logs_created; Type: INDEX; Schema: public; Owner: ecosystem
--

CREATE INDEX idx_activity_logs_created ON public.activity_logs USING btree (created_at DESC);


--
-- Name: idx_activity_logs_entity; Type: INDEX; Schema: public; Owner: ecosystem
--

CREATE INDEX idx_activity_logs_entity ON public.activity_logs USING btree (entity_type, entity_id);


--
-- Name: idx_activity_logs_user; Type: INDEX; Schema: public; Owner: ecosystem
--

CREATE INDEX idx_activity_logs_user ON public.activity_logs USING btree (user_id);


--
-- Name: idx_ai_analytics_created; Type: INDEX; Schema: public; Owner: ecosystem
--

CREATE INDEX idx_ai_analytics_created ON public.ai_analytics USING btree (created_at DESC);


--
-- Name: idx_ai_conversations_last_message; Type: INDEX; Schema: public; Owner: ecosystem
--

CREATE INDEX idx_ai_conversations_last_message ON public.ai_conversations USING btree (last_message_at DESC);


--
-- Name: idx_ai_messages_conversation; Type: INDEX; Schema: public; Owner: ecosystem
--

CREATE INDEX idx_ai_messages_conversation ON public.ai_messages USING btree (conversation_id, created_at);


--
-- Name: idx_api_keys_hash; Type: INDEX; Schema: public; Owner: ecosystem
--

CREATE INDEX idx_api_keys_hash ON public.api_keys USING btree (key_hash);


--
-- Name: idx_api_keys_user; Type: INDEX; Schema: public; Owner: ecosystem
--

CREATE INDEX idx_api_keys_user ON public.api_keys USING btree (user_id);


--
-- Name: idx_arcade_scores_game; Type: INDEX; Schema: public; Owner: ecosystem
--

CREATE INDEX idx_arcade_scores_game ON public.arcade_scores USING btree (game_slug);


--
-- Name: idx_arcade_scores_leaderboard; Type: INDEX; Schema: public; Owner: ecosystem
--

CREATE INDEX idx_arcade_scores_leaderboard ON public.arcade_scores USING btree (game_slug, score DESC);


--
-- Name: idx_arcade_scores_player; Type: INDEX; Schema: public; Owner: ecosystem
--

CREATE INDEX idx_arcade_scores_player ON public.arcade_scores USING btree (player_id);


--
-- Name: idx_contact_submissions_created; Type: INDEX; Schema: public; Owner: ecosystem
--

CREATE INDEX idx_contact_submissions_created ON public.contact_submissions USING btree (created_at DESC);


--
-- Name: idx_contact_submissions_read; Type: INDEX; Schema: public; Owner: ecosystem
--

CREATE INDEX idx_contact_submissions_read ON public.contact_submissions USING btree (is_read);


--
-- Name: idx_conv_messages_cid; Type: INDEX; Schema: public; Owner: ecosystem
--

CREATE INDEX idx_conv_messages_cid ON public.conversation_messages USING btree (conversation_id);


--
-- Name: idx_conv_messages_created; Type: INDEX; Schema: public; Owner: ecosystem
--

CREATE INDEX idx_conv_messages_created ON public.conversation_messages USING btree (created_at DESC);


--
-- Name: idx_donations_created; Type: INDEX; Schema: public; Owner: ecosystem
--

CREATE INDEX idx_donations_created ON public.donations USING btree (created_at DESC);


--
-- Name: idx_donations_display; Type: INDEX; Schema: public; Owner: ecosystem
--

CREATE INDEX idx_donations_display ON public.donations USING btree (display_on_wall) WHERE (display_on_wall = true);


--
-- Name: idx_donations_status; Type: INDEX; Schema: public; Owner: ecosystem
--

CREATE INDEX idx_donations_status ON public.donations USING btree (payment_status);


--
-- Name: idx_knowledge_embedding; Type: INDEX; Schema: public; Owner: ecosystem
--

CREATE INDEX idx_knowledge_embedding ON public.knowledge_chunks USING ivfflat (embedding public.vector_cosine_ops);


--
-- Name: idx_knowledge_source; Type: INDEX; Schema: public; Owner: ecosystem
--

CREATE INDEX idx_knowledge_source ON public.knowledge_chunks USING btree (source);


--
-- Name: idx_memberships_active; Type: INDEX; Schema: public; Owner: ecosystem
--

CREATE INDEX idx_memberships_active ON public.memberships USING btree (is_active) WHERE (is_active = true);


--
-- Name: idx_memberships_expires; Type: INDEX; Schema: public; Owner: ecosystem
--

CREATE INDEX idx_memberships_expires ON public.memberships USING btree (expires_at);


--
-- Name: idx_memberships_user; Type: INDEX; Schema: public; Owner: ecosystem
--

CREATE INDEX idx_memberships_user ON public.memberships USING btree (user_id);


--
-- Name: idx_newsletter_active; Type: INDEX; Schema: public; Owner: ecosystem
--

CREATE INDEX idx_newsletter_active ON public.newsletter_subscribers USING btree (is_active) WHERE (is_active = true);


--
-- Name: idx_payments_provider_ref; Type: INDEX; Schema: public; Owner: ecosystem
--

CREATE INDEX idx_payments_provider_ref ON public.payments USING btree (provider_ref);


--
-- Name: idx_payments_status; Type: INDEX; Schema: public; Owner: ecosystem
--

CREATE INDEX idx_payments_status ON public.payments USING btree (status);


--
-- Name: idx_payments_user_id; Type: INDEX; Schema: public; Owner: ecosystem
--

CREATE INDEX idx_payments_user_id ON public.payments USING btree (user_id);


--
-- Name: idx_recipes_cuisine; Type: INDEX; Schema: public; Owner: ecosystem
--

CREATE INDEX idx_recipes_cuisine ON public.recipes USING btree (cuisine_type);


--
-- Name: idx_recipes_featured; Type: INDEX; Schema: public; Owner: ecosystem
--

CREATE INDEX idx_recipes_featured ON public.recipes USING btree (is_featured) WHERE (is_featured = true);


--
-- Name: idx_recipes_search; Type: INDEX; Schema: public; Owner: ecosystem
--

CREATE INDEX idx_recipes_search ON public.recipes USING gin (to_tsvector('english'::regconfig, (((title)::text || ' '::text) || COALESCE(description, ''::text))));


--
-- Name: idx_recipes_slug; Type: INDEX; Schema: public; Owner: ecosystem
--

CREATE INDEX idx_recipes_slug ON public.recipes USING btree (slug);


--
-- Name: idx_refresh_tokens_hash; Type: INDEX; Schema: public; Owner: ecosystem
--

CREATE INDEX idx_refresh_tokens_hash ON public.refresh_tokens USING btree (token_hash);


--
-- Name: idx_refresh_tokens_user; Type: INDEX; Schema: public; Owner: ecosystem
--

CREATE INDEX idx_refresh_tokens_user ON public.refresh_tokens USING btree (user_id);


--
-- Name: idx_service_inquiries_created; Type: INDEX; Schema: public; Owner: ecosystem
--

CREATE INDEX idx_service_inquiries_created ON public.service_inquiries USING btree (created_at DESC);


--
-- Name: idx_service_inquiries_phone; Type: INDEX; Schema: public; Owner: ecosystem
--

CREATE INDEX idx_service_inquiries_phone ON public.service_inquiries USING btree (customer_phone);


--
-- Name: idx_service_inquiries_status; Type: INDEX; Schema: public; Owner: ecosystem
--

CREATE INDEX idx_service_inquiries_status ON public.service_inquiries USING btree (status);


--
-- Name: idx_service_inquiries_type; Type: INDEX; Schema: public; Owner: ecosystem
--

CREATE INDEX idx_service_inquiries_type ON public.service_inquiries USING btree (service_type);


--
-- Name: idx_shop_orders_created; Type: INDEX; Schema: public; Owner: ecosystem
--

CREATE INDEX idx_shop_orders_created ON public.shop_orders USING btree (created_at DESC);


--
-- Name: idx_shop_orders_number; Type: INDEX; Schema: public; Owner: ecosystem
--

CREATE INDEX idx_shop_orders_number ON public.shop_orders USING btree (order_number);


--
-- Name: idx_shop_orders_phone; Type: INDEX; Schema: public; Owner: ecosystem
--

CREATE INDEX idx_shop_orders_phone ON public.shop_orders USING btree (customer_phone);


--
-- Name: idx_shop_orders_status; Type: INDEX; Schema: public; Owner: ecosystem
--

CREATE INDEX idx_shop_orders_status ON public.shop_orders USING btree (status);


--
-- Name: idx_shop_products_available; Type: INDEX; Schema: public; Owner: ecosystem
--

CREATE INDEX idx_shop_products_available ON public.shop_products USING btree (is_available) WHERE (is_available = true);


--
-- Name: idx_shop_products_category; Type: INDEX; Schema: public; Owner: ecosystem
--

CREATE INDEX idx_shop_products_category ON public.shop_products USING btree (category);


--
-- Name: idx_shop_products_search; Type: INDEX; Schema: public; Owner: ecosystem
--

CREATE INDEX idx_shop_products_search ON public.shop_products USING gin (to_tsvector('english'::regconfig, (((name)::text || ' '::text) || COALESCE(description, ''::text))));


--
-- Name: idx_shop_products_slug; Type: INDEX; Schema: public; Owner: ecosystem
--

CREATE INDEX idx_shop_products_slug ON public.shop_products USING btree (slug);


--
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: ecosystem
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- Name: idx_users_membership; Type: INDEX; Schema: public; Owner: ecosystem
--

CREATE INDEX idx_users_membership ON public.users USING btree (membership_tier, membership_expires);


--
-- Name: idx_users_role; Type: INDEX; Schema: public; Owner: ecosystem
--

CREATE INDEX idx_users_role ON public.users USING btree (role);


--
-- Name: idx_users_username; Type: INDEX; Schema: public; Owner: ecosystem
--

CREATE INDEX idx_users_username ON public.users USING btree (username);


--
-- Name: ix_users_reset_token; Type: INDEX; Schema: public; Owner: ecosystem
--

CREATE INDEX ix_users_reset_token ON public.users USING btree (reset_token);


--
-- Name: contact_submissions trg_contact_submissions_updated_at; Type: TRIGGER; Schema: public; Owner: ecosystem
--

CREATE TRIGGER trg_contact_submissions_updated_at BEFORE UPDATE ON public.contact_submissions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: knowledge_chunks trg_knowledge_chunks_updated_at; Type: TRIGGER; Schema: public; Owner: ecosystem
--

CREATE TRIGGER trg_knowledge_chunks_updated_at BEFORE UPDATE ON public.knowledge_chunks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: memberships trg_memberships_updated_at; Type: TRIGGER; Schema: public; Owner: ecosystem
--

CREATE TRIGGER trg_memberships_updated_at BEFORE UPDATE ON public.memberships FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: recipes trg_recipes_updated_at; Type: TRIGGER; Schema: public; Owner: ecosystem
--

CREATE TRIGGER trg_recipes_updated_at BEFORE UPDATE ON public.recipes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: service_inquiries trg_service_inquiries_updated_at; Type: TRIGGER; Schema: public; Owner: ecosystem
--

CREATE TRIGGER trg_service_inquiries_updated_at BEFORE UPDATE ON public.service_inquiries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: shop_orders trg_shop_orders_updated_at; Type: TRIGGER; Schema: public; Owner: ecosystem
--

CREATE TRIGGER trg_shop_orders_updated_at BEFORE UPDATE ON public.shop_orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: shop_products trg_shop_products_updated_at; Type: TRIGGER; Schema: public; Owner: ecosystem
--

CREATE TRIGGER trg_shop_products_updated_at BEFORE UPDATE ON public.shop_products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: users trg_users_updated_at; Type: TRIGGER; Schema: public; Owner: ecosystem
--

CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: activity_logs activity_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ecosystem
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: ai_conversations ai_conversations_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ecosystem
--

ALTER TABLE ONLY public.ai_conversations
    ADD CONSTRAINT ai_conversations_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: ai_messages ai_messages_conversation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ecosystem
--

ALTER TABLE ONLY public.ai_messages
    ADD CONSTRAINT ai_messages_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.ai_conversations(id) ON DELETE CASCADE;


--
-- Name: api_keys api_keys_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ecosystem
--

ALTER TABLE ONLY public.api_keys
    ADD CONSTRAINT api_keys_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: arcade_scores arcade_scores_player_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ecosystem
--

ALTER TABLE ONLY public.arcade_scores
    ADD CONSTRAINT arcade_scores_player_id_fkey FOREIGN KEY (player_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: blog_post_tags blog_post_tags_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ecosystem
--

ALTER TABLE ONLY public.blog_post_tags
    ADD CONSTRAINT blog_post_tags_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.blog_posts(id) ON DELETE CASCADE;


--
-- Name: blog_post_tags blog_post_tags_tag_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ecosystem
--

ALTER TABLE ONLY public.blog_post_tags
    ADD CONSTRAINT blog_post_tags_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES public.blog_tags(id) ON DELETE CASCADE;


--
-- Name: blog_posts blog_posts_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ecosystem
--

ALTER TABLE ONLY public.blog_posts
    ADD CONSTRAINT blog_posts_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.blog_categories(id) ON DELETE SET NULL;


--
-- Name: contact_submissions contact_submissions_replied_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ecosystem
--

ALTER TABLE ONLY public.contact_submissions
    ADD CONSTRAINT contact_submissions_replied_by_fkey FOREIGN KEY (replied_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: conversation_messages conversation_messages_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ecosystem
--

ALTER TABLE ONLY public.conversation_messages
    ADD CONSTRAINT conversation_messages_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: memberships memberships_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ecosystem
--

ALTER TABLE ONLY public.memberships
    ADD CONSTRAINT memberships_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: payments payments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ecosystem
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: products products_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ecosystem
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.product_categories(id) ON DELETE SET NULL;


--
-- Name: refresh_tokens refresh_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ecosystem
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: service_inquiries service_inquiries_assigned_to_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ecosystem
--

ALTER TABLE ONLY public.service_inquiries
    ADD CONSTRAINT service_inquiries_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

\unrestrict wwBFHR1IzhDcV89fKbNbXK0rKC93o133rtibOxyMbV2EaGtiUvoaCLG81BrvJNn

