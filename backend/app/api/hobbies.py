from fastapi import APIRouter

router = APIRouter()

@router.get("/")
async def list_hobbies():
    return [
        {"id": "photography", "name": "Photography", "description": "Street, nature, and urban photography around Nairobi.", "icon": "camera", "url": "/photography"},
        {"id": "gaming", "name": "Mobile Gaming — CODM", "description": "Call of Duty Mobile gameplay, tips, and highlights.", "icon": "gamepad"},
        {"id": "cooking", "name": "Cooking & Recipes", "description": "Home cooking, Kenyan cuisine, and experiments in the kitchen.", "icon": "chef-hat", "url": "/cooking"},
        {"id": "travelling", "name": "Travelling", "description": "Exploring Kenya and beyond — places, experiences, and travel tips.", "icon": "map-pin"},
    ]
