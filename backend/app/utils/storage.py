import cloudinary
import cloudinary.uploader
import os
import logging

logger = logging.getLogger(__name__)

# Configure Cloudinary
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True
)

def upload_file_to_cloudinary(file_bytes: bytes, file_name: str, content_type: str) -> str:
    """Uploads a file to Cloudinary and returns the secure public URL."""
    if not all([os.getenv("CLOUDINARY_CLOUD_NAME"), os.getenv("CLOUDINARY_API_KEY"), os.getenv("CLOUDINARY_API_SECRET")]):
        raise ValueError("Cloudinary credentials are not fully configured in environment variables.")

    try:
        # Upload directly from bytes
        upload_result = cloudinary.uploader.upload(
            file_bytes,
            resource_type="auto", # Auto-detects image/video
            folder="aetsh69_media"
        )
        url = upload_result.get("secure_url")
        logger.info(f"Successfully uploaded {file_name} to Cloudinary: {url}")
        return url
    except Exception as e:
        logger.error(f"Failed to upload to Cloudinary: {e}")
        raise Exception(f"Failed to upload file to cloud storage: {e}")
