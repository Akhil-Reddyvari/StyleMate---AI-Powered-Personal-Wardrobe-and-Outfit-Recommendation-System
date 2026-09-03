from fastapi import APIRouter

from app.services.recommendation_service import get_outfit_history


router = APIRouter()


@router.get("/outfit-history")
def outfit_history():

    return get_outfit_history()