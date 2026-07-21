import uuid, json
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.database import get_db

router = APIRouter()

class OrderCreate(BaseModel):
    items: list[dict]        # [{product_id, quantity}]
    shipping_info: dict = {}
    payment_method: str = "mpesa"
    notes: Optional[str] = None

@router.get("/products")
async def list_products(
    category: Optional[str] = Query(None),
    featured: Optional[bool] = Query(None),
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    db: AsyncSession = Depends(get_db),
):
    filters = ["p.is_active = TRUE"]
    params: dict = {"limit": 20, "offset": (page-1)*20}
    if category:
        filters.append("pc.slug = :category")
        params["category"] = category
    if featured is not None:
        filters.append("p.is_featured = :featured")
        params["featured"] = featured
    if search:
        filters.append("p.name ILIKE :search")
        params["search"] = f"%{search}%"
    result = await db.execute(
        text(f"""
            SELECT p.id, p.name, p.slug, p.short_description, p.images,
                   p.price_kes, p.price_usd, p.stock_quantity, p.is_featured,
                   p.specifications, p.tags, pc.name as category_name
            FROM products p
            LEFT JOIN product_categories pc ON p.category_id = pc.id
            WHERE {" AND ".join(filters)}
            ORDER BY p.is_featured DESC, p.created_at DESC
            LIMIT :limit OFFSET :offset
        """), params
    )
    return [dict(r._mapping) for r in result.fetchall()]

@router.get("/products/{slug}")
async def get_product(slug: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        text("SELECT * FROM products WHERE slug = :slug AND is_active = TRUE"), {"slug": slug}
    )
    product = result.fetchone()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    await db.execute(
        text("UPDATE products SET view_count = view_count + 1 WHERE slug = :slug"), {"slug": slug}
    )
    return dict(product._mapping)

@router.get("/categories")
async def list_categories(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        text("SELECT id, name, slug, description, image_url FROM product_categories ORDER BY sort_order, name")
    )
    return [dict(r._mapping) for r in result.fetchall()]

@router.post("/orders", status_code=201)
async def create_order(data: OrderCreate, db: AsyncSession = Depends(get_db)):
    if not data.items:
        raise HTTPException(status_code=400, detail="Order must have at least one item")
    order_id = uuid.uuid4()
    subtotal = 0.0
    order_items = []
    for item in data.items:
        result = await db.execute(
            text("SELECT id, name, price_kes, stock_quantity FROM products WHERE id = :id AND is_active = TRUE"),
            {"id": uuid.UUID(item["product_id"])}
        )
        product = result.fetchone()
        if not product:
            raise HTTPException(status_code=404, detail=f"Product {item['product_id']} not found")
        if product.stock_quantity < item["quantity"]:
            raise HTTPException(status_code=400, detail=f"Insufficient stock for {product.name}")
        item_total = float(product.price_kes) * item["quantity"]
        subtotal += item_total
        order_items.append({"product": product, "quantity": item["quantity"], "total": item_total})
    await db.execute(
        text("""
            INSERT INTO orders (id, subtotal, total, currency, shipping_info, notes)
            VALUES (:id, :subtotal, :total, 'KES', :shipping::jsonb, :notes)
        """),
        {"id": order_id, "subtotal": subtotal, "total": subtotal,
         "shipping": json.dumps(data.shipping_info), "notes": data.notes}
    )
    for item in order_items:
        await db.execute(
            text("""
                INSERT INTO order_items (id, order_id, product_id, product_name, quantity, unit_price, total_price)
                VALUES (:id, :oid, :pid, :pname, :qty, :uprice, :total)
            """),
            {"id": uuid.uuid4(), "oid": order_id, "pid": item["product"].id,
             "pname": item["product"].name, "qty": item["quantity"],
             "uprice": float(item["product"].price_kes), "total": item["total"]}
        )
        await db.execute(
            text("UPDATE products SET stock_quantity = stock_quantity - :qty WHERE id = :id"),
            {"qty": item["quantity"], "id": item["product"].id}
        )
    return {
        "order_id": str(order_id),
        "total_kes": subtotal,
        "message": "Order placed. Complete payment via M-Pesa or contact us on WhatsApp.",
        "whatsapp": "https://wa.me/254XXXXXXXXX?text=Order%20" + str(order_id)[:8].upper(),
    }

@router.post("/products", status_code=201)
async def create_product(payload: dict, db: AsyncSession = Depends(get_db)):
    query = text("""
        INSERT INTO products (name, slug, description, price_kes, stock_quantity, category, image_url)
        VALUES (:name, :slug, :description, :price_kes, :stock_quantity, :category, :image_url)
        RETURNING id, name, slug, description, price_kes, stock_quantity, category, image_url
    """)
    result = await db.execute(query, {
        "name": payload.get("name"),
        "slug": payload.get("slug", payload.get("name", "").lower().replace(" ", "-")),
        "description": payload.get("description"),
        "price_kes": payload.get("price_kes"),
        "stock_quantity": payload.get("stock_quantity", 1),
        "category": payload.get("category", "general"),
        "image_url": payload.get("image_url", "")
    })
    await db.commit()
    return result.fetchone()._mapping
