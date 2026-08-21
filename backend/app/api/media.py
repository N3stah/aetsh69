from fastapi import APIRouter, Depends, HTTPException, Request
from app.utils.security import get_user_id_from_token
import cloudinary
import os
import time
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

# Configure Cloudinary
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True
)

@router.get("/sign-upload")
async def sign_upload(request: Request):
    """
    Generates a secure signature for direct-to-Cloudinary uploads.
    Requires authentication.
    """
    user_id = get_user_id_from_token(request) # Ensures only logged-in users can upload
    
    timestamp = int(time.time())
    folder = "aetsh69_media"
    
    try:
        params_to_sign = {"timestamp": timestamp, "folder": folder}
        signature = cloudinary.utils.api_sign_request(
            params_to_sign, 
            os.getenv("CLOUDINARY_API_SECRET")
        )
        
        return {
            "signature": signature,
            "timestamp": timestamp,
            "api_key": os.getenv("CLOUDINARY_API_KEY"),
            "cloud_name": os.getenv("CLOUDINARY_CLOUD_NAME"),
            "folder": folder
        }
    except Exception as e:
        logger.error(f"Failed to sign upload: {e}")
        raise HTTPException(status_code=500, detail="Could not sign upload.")
