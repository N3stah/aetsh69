import uuid, base64, logging, json, asyncio
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
import jwt
import requests

from app.database import get_db
from app.config import settings

router = APIRouter()
logger = logging.getLogger(__name__)

# ── Auth helper ───────────────────────────────────────────────────────────────

def get_user_id_from_token(request: Request) -> str:
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        return payload["sub"]
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# ── M-Pesa helpers ────────────────────────────────────────────────────────────

def get_mpesa_base_url() -> str:
    return "https://api.safaricom.co.ke" if settings.MPESA_ENV == "production" else "https://sandbox.safaricom.co.ke"

def get_mpesa_token() -> str:
    url = f"{get_mpesa_base_url()}/oauth/v1/generate?grant_type=client_credentials"
    key = settings.MPESA_CONSUMER_KEY.strip()
    secret = settings.MPESA_CONSUMER_SECRET.strip()
    credentials = base64.b64encode(f"{key}:{secret}".encode()).decode()
    
    r = requests.get(url, headers={"Authorization": f"Basic {credentials}"}, timeout=15)
    if r.status_code != 200:
        logger.error("Safaricom OAuth failed: %s %s", r.status_code, r.text)
        raise HTTPException(status_code=502, detail="Safaricom OAuth failed.")
    return r.json()["access_token"]

def get_mpesa_password() -> tuple[str, str]:
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d%H%M%S")
    raw = settings.MPESA_SHORTCODE + settings.MPESA_PASSKEY + timestamp
    password = base64.b64encode(raw.encode()).decode()
    return password, timestamp

def _send_stk_push(payload: dict, headers: dict) -> requests.Response:
    """Synchronous requests call to be run in a thread."""
    url = f"{get_mpesa_base_url()}/mpesa/stkpush/v1/processrequest"
    return requests.post(url, json=payload, headers=headers, timeout=15)

# ── Schemas ───────────────────────────────────────────────────────────────────

class StkPushRequest(BaseModel):
    phone: str
    tier: str = "builder"

class DonationRequest(BaseModel):
    phone: str
    amount: int
    name: str = "Anonymous"

# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.post("/mpesa/stk-push")
async def mpesa_stk_push(data: StkPushRequest, request: Request, db: AsyncSession = Depends(get_db)):
    user_id = get_user_id_from_token(request)

    tier_prices = {"builder": 1500, "enterprise": 5000}
    amount = tier_prices.get(data.tier)
    if not amount:
        raise HTTPException(status_code=400, detail=f"Invalid tier: {data.tier}")

    phone = data.phone.strip().replace("+", "").replace(" ", "")
    if phone.startswith("0"):
        phone = "254" + phone[1:]
    if not phone.startswith("254") or len(phone) != 12:
        raise HTTPException(status_code=400, detail="Invalid phone number. Use format: 254712345678")

    try:
        token = get_mpesa_token()
        password, timestamp = get_mpesa_password()

        payload = {
            "BusinessShortCode": settings.MPESA_SHORTCODE,
            "Password": password,
            "Timestamp": timestamp,
            "TransactionType": "CustomerPayBillOnline",
            "Amount": amount,
            "PartyA": phone,
            "PartyB": settings.MPESA_SHORTCODE,
            "PhoneNumber": phone,
            "CallBackURL": settings.MPESA_CALLBACK_URL,
            "AccountReference": f"AETSH69-{data.tier.upper()}",
            "TransactionDesc": f"AETSH-69 {data.tier.capitalize()} Membership"
        }
        headers = {"Authorization": f"Bearer {token}"}
        
        # Run blocking request in a thread to avoid freezing the event loop
        resp = await asyncio.to_thread(_send_stk_push, payload, headers)
        resp.raise_for_status()
        result = resp.json()

        if result.get("ResponseCode") != "0":
            raise HTTPException(status_code=400, detail=result.get("ResponseDescription", "STK Push failed"))

        payment_id = uuid.uuid4()
        await db.execute(text("""
            INSERT INTO payments (id, user_id, amount_kes, provider, status,
                merchant_request_id, checkout_request_id, tier_unlocked)
            VALUES (:id, :user_id, :amount, 'mpesa', 'pending',
                :merchant_req, :checkout_req, :tier)
        """), {
            "id": payment_id,
            "user_id": user_id,
            "amount": amount,
            "merchant_req": result.get("MerchantRequestID"),
            "checkout_req": result.get("CheckoutRequestID"),
            "tier": data.tier,
        })
        await db.commit()

        return {
            "payment_id": str(payment_id),
            "merchant_request_id": result.get("MerchantRequestID"),
            "checkout_request_id": result.get("CheckoutRequestID"),
            "message": f"STK Push sent to {phone}. Enter your M-Pesa PIN to complete payment."
        }

    except requests.RequestException as e:
        logger.error("M-Pesa STK Push failed: %s", e)
        raise HTTPException(status_code=502, detail="Could not reach M-Pesa. Try again.")

@router.post("/stk-callback")
async def mpesa_callback(request: Request, db: AsyncSession = Depends(get_db)):
    body = await request.json()
    logger.info("M-Pesa callback received: %s", body)

    try:
        stk = body["Body"]["stkCallback"]
        result_code = stk["ResultCode"]
        merchant_request_id = stk["MerchantRequestID"]
        checkout_request_id = stk["CheckoutRequestID"]

        if result_code == 0:
            items = {i["Name"]: i.get("Value") for i in stk.get("CallbackMetadata", {}).get("Item", [])}
            provider_ref = items.get("MpesaReceiptNumber")

            await db.execute(text("""
                UPDATE payments SET
                    status = 'success',
                    provider_ref = :ref,
                    updated_at = NOW()
                WHERE merchant_request_id = :merchant_req
                  AND checkout_request_id = :checkout_req
            """), {
                "ref": provider_ref,
                "merchant_req": merchant_request_id,
                "checkout_req": checkout_request_id,
            })

            result = await db.execute(text("""
                SELECT user_id, tier_unlocked FROM payments
                WHERE merchant_request_id = :merchant_req
            """), {"merchant_req": merchant_request_id})
            payment = result.fetchone()

            if payment and payment.tier_unlocked:
                await db.execute(text("""
                    UPDATE users SET role = :role WHERE id = :user_id
                """), {"role": payment.tier_unlocked, "user_id": payment.user_id})
                logger.info("Upgraded user %s to %s", payment.user_id, payment.tier_unlocked)

        else:
            await db.execute(text("""
                UPDATE payments SET status = 'failed', updated_at = NOW()
                WHERE merchant_request_id = :merchant_req
            """), {"merchant_req": merchant_request_id})

        await db.commit()

    except Exception as e:
        logger.error("M-Pesa callback processing error: %s", e)
        # Return 500 so Safaricom retries the callback
        raise HTTPException(status_code=500, detail="Internal processing error")

    return {"ResultCode": 0, "ResultDesc": "Accepted"}

@router.post("/mpesa/donate")
async def mpesa_donate(data: DonationRequest, db: AsyncSession = Depends(get_db)):
    if data.amount < 10:
        raise HTTPException(status_code=400, detail="Minimum donation is KES 10")

    phone = data.phone.strip().replace("+", "").replace(" ", "")
    if phone.startswith("0"):
        phone = "254" + phone[1:]
    if not phone.startswith("254") or len(phone) != 12:
        raise HTTPException(status_code=400, detail="Invalid phone number")

    try:
        token = get_mpesa_token()
        password, timestamp = get_mpesa_password()

        payload = {
            "BusinessShortCode": settings.MPESA_SHORTCODE,
            "Password": password,
            "Timestamp": timestamp,
            "TransactionType": "CustomerPayBillOnline",
            "Amount": data.amount,
            "PartyA": phone,
            "PartyB": settings.MPESA_SHORTCODE,
            "PhoneNumber": phone,
            "CallBackURL": settings.MPESA_CALLBACK_URL,
            "AccountReference": "AETSH69-DONATION",
            "TransactionDesc": f"Donation from {data.name}"
        }
        headers = {"Authorization": f"Bearer {token}"}
        
        resp = await asyncio.to_thread(_send_stk_push, payload, headers)
        resp.raise_for_status()
        result = resp.json()

        if result.get("ResponseCode") != "0":
            raise HTTPException(status_code=400, detail="Could not initiate payment")

        payment_id = uuid.uuid4()
        await db.execute(text("""
            INSERT INTO payments (id, user_id, amount_kes, provider, status,
                merchant_request_id, checkout_request_id, metadata)
            VALUES (:id, '00000000-0000-0000-0000-000000000000', :amount, 'mpesa', 'pending',
                :merchant_req, :checkout_req, CAST(:meta AS jsonb))
        """), {
            "id": payment_id,
            "amount": data.amount,
            "merchant_req": result.get("MerchantRequestID"),
            "checkout_req": result.get("CheckoutRequestID"),
            "meta": json.dumps({"donor_name": data.name}),
        })
        await db.commit()

        return {
            "payment_id": str(payment_id),
            "message": f"Payment request sent to {phone}. Enter your M-Pesa PIN to donate KES {data.amount}."
        }

    except requests.RequestException as e:
        logger.error("Donation STK Push failed: %s", e)
        raise HTTPException(status_code=502, detail="Could not reach M-Pesa. Try again.")

@router.get("/status/{payment_id}")
async def get_payment_status(payment_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(text("""
        SELECT id, status, tier_unlocked, provider_ref, amount_kes, created_at
        FROM payments WHERE id = :id
    """), {"id": payment_id})
    payment = result.fetchone()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    return {
        "payment_id": str(payment.id),
        "status": payment.status,
        "tier_unlocked": payment.tier_unlocked,
        "provider_ref": payment.provider_ref,
        "amount_kes": float(payment.amount_kes),
        "created_at": payment.created_at,
    }

@router.get("/history")
async def payment_history(request: Request, db: AsyncSession = Depends(get_db)):
    user_id = get_user_id_from_token(request)
    result = await db.execute(text("""
        SELECT id, amount_kes, provider, status, tier_unlocked, provider_ref, created_at
        FROM payments WHERE user_id = :user_id
        ORDER BY created_at DESC LIMIT 20
    """), {"user_id": user_id})
    rows = result.fetchall()
    return [{"payment_id": str(r.id), "amount_kes": float(r.amount_kes),
             "provider": r.provider, "status": r.status,
             "tier_unlocked": r.tier_unlocked, "provider_ref": r.provider_ref,
             "created_at": r.created_at} for r in rows]
