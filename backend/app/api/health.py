from fastapi import APIRouter

router = APIRouter()


@router.get("/")
async def health_check():
    return {
        "status": "healthy",
        "service": "AETSH-69 Backend",
    }
