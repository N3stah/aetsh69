"""
Dynamic context builder for AETSH-69.
Fetches live platform data to inject into the AI system prompt.
"""
import logging
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

logger = logging.getLogger(__name__)

async def build_live_context(db: AsyncSession, user_context: str = "CURRENT USER CONTEXT:\n  - Status: Guest (Not logged in)") -> str:
    """Fetch live platform data and return as formatted context string."""
    ctx = []
    now = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    ctx.append(f"LIVE PLATFORM DATA (as of {now}):")
    ctx.append(user_context)

    # Shop inventory
    try:
        async with db.begin_nested():
            result = await db.execute(text("SELECT name, price_kes, category, stock_quantity FROM products WHERE stock_quantity > 0 ORDER BY created_at DESC LIMIT 15"))
            products = result.fetchall()
        if products:
            ctx.append("\nSHOP INVENTORY (in stock):")
            for p in products:
                ctx.append(f"  - {p.name}: KSh {p.price_kes} ({p.category}) — {p.stock_quantity} in stock")
        else:
            ctx.append("\nSHOP: No products currently in stock.")
    except Exception as e:
        logger.warning("Could not fetch shop data: %s", e)

    # Latest blog posts
    try:
        async with db.begin_nested():
            result = await db.execute(text("SELECT title, excerpt, published_at FROM blog_posts WHERE status = 'published' ORDER BY published_at DESC LIMIT 5"))
            posts = result.fetchall()
        if posts:
            ctx.append("\nLATEST BLOG POSTS:")
            for p in posts:
                date = p.published_at.strftime("%b %Y") if p.published_at else "Recent"
                ctx.append(f"  - '{p.title}' ({date}): {(p.excerpt or '')[:100]}")
        else:
            ctx.append("\nBLOG: No published posts yet.")
    except Exception as e:
        logger.warning("Could not fetch blog data: %s", e)

    # Portfolio projects
    try:
        async with db.begin_nested():
            result = await db.execute(text("SELECT title, tagline, tech_stack FROM projects WHERE status = 'published' ORDER BY created_at DESC LIMIT 8"))
            projects = result.fetchall()
        if projects:
            ctx.append("\nPORTFOLIO PROJECTS:")
            for p in projects:
                tech = ", ".join(p.tech_stack[:4]) if p.tech_stack else "Various"
                ctx.append(f"  - {p.title}: {p.tagline or ''} [Stack: {tech}]")
        else:
            ctx.append("\nPORTFOLIO: No published projects yet.")
    except Exception as e:
        logger.warning("Could not fetch projects: %s", e)

    # Services
    try:
        async with db.begin_nested():
            result = await db.execute(text("SELECT name, description FROM services ORDER BY created_at DESC LIMIT 8"))
            services = result.fetchall()
        if services:
            ctx.append("\nSERVICES AVAILABLE:")
            for s in services:
                ctx.append(f"  - {s.name}: {s.description[:80] if s.description else ''}")
        else:
            ctx.append("\nSERVICES: No services configured yet.")
    except Exception as e:
        logger.warning("Could not fetch services: %s", e)

    # Arcade games and top scores
    try:
        async with db.begin_nested():
            result = await db.execute(text("SELECT name, slug FROM arcade_games WHERE is_active = true ORDER BY name"))
            games = result.fetchall()
        if games:
            ctx.append("\nARCADE GAMES AVAILABLE:")
            for g in games:
                ctx.append(f"  - {g.name} (slug: {g.slug})")
        else:
            ctx.append("\nARCADE: Games include Snake, Tetris, 2048, Memory Match, Pong.")
    except Exception as e:
        logger.warning("Could not fetch arcade games: %s", e)

    # Photography photos count
    try:
        async with db.begin_nested():
            result = await db.execute(text("SELECT COUNT(*) FROM photos WHERE status = 'published'"))
            photo_count = result.scalar()
        ctx.append(f"\nPHOTOGRAPHY: {photo_count} published photos in the gallery.")
    except Exception as e:
        logger.warning("Could not fetch photos: %s", e)

    # Cooking recipes count
    try:
        async with db.begin_nested():
            result = await db.execute(text("SELECT COUNT(*) FROM recipes WHERE status = 'published'"))
            recipe_count = result.scalar()
        ctx.append(f"COOKING: {recipe_count} published recipes available.")
    except Exception as e:
        logger.warning("Could not fetch recipes: %s", e)

    # Recent contact inquiries (count only for privacy)
    try:
        async with db.begin_nested():
            result = await db.execute(text("SELECT COUNT(*) FROM service_inquiries WHERE created_at > NOW() - INTERVAL '7 days'"))
            count = result.scalar()
        ctx.append(f"RECENT INQUIRIES: {count} in the last 7 days")
    except Exception as e:
        logger.warning("Could not fetch inquiries: %s", e)

    return "\n".join(ctx)


async def get_conversation_history(db: AsyncSession, conversation_id: str, limit: int = 10) -> list:
    """Fetch past messages for a conversation to provide memory."""
    try:
        async with db.begin_nested():
            result = await db.execute(text("""
                SELECT role, content FROM conversation_messages
                WHERE conversation_id = :cid
                ORDER BY created_at DESC LIMIT :limit
            """), {"cid": conversation_id, "limit": limit})
            rows = result.fetchall()
        return [{"role": r.role, "content": r.content} for r in reversed(rows)]
    except Exception:
        return []


async def save_message(db: AsyncSession, conversation_id: str, role: str, content: str, user_id: str = None):
    """Save a message to conversation history."""
    try:
        async with db.begin_nested():
            await db.execute(text("""
                INSERT INTO conversation_messages (conversation_id, role, content, user_id, created_at)
                VALUES (:cid, :role, :content, :uid, NOW())
                ON CONFLICT DO NOTHING
            """), {"cid": conversation_id, "role": role, "content": content, "uid": user_id})
    except Exception as e:
        logger.warning("Could not save message: %s", e)


async def log_analytics(db: AsyncSession, question: str, context: str, provider: str):
    """Log visitor questions for analytics."""
    try:
        async with db.begin_nested():
            await db.execute(text("""
                INSERT INTO ai_analytics (question, context, provider, created_at)
                VALUES (:q, :ctx, :provider, NOW())
            """), {"q": question[:500], "ctx": context, "provider": provider})
    except Exception as e:
        logger.warning("Could not log analytics: %s", e)
