from fastapi import APIRouter, UploadFile, File, HTTPException
from app.utils.storage import upload_file_to_cloudinary
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/upload")
async def upload_media(file: UploadFile = File(...)):
    """
    Upload an image/file to Cloudinary cloud storage.
    Returns the public URL of the uploaded file.
    """
    if not file.content_type or not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="Only image files are allowed.")

    # Limit file size to 10MB
    contents = await file.read()
    if len(contents) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File size exceeds 10MB limit.")

    try:
        public_url = upload_file_to_cloudinary(
            file_bytes=contents,
            file_name=file.filename or "upload.jpg",
            content_type=file.content_type
        )
        return {"url": public_url, "filename": file.filename}
    except Exception as e:
        logger.error(f"Media upload failed: {e}")
        raise HTTPException(status_code=500, detail="Could not upload file to cloud storage.")
