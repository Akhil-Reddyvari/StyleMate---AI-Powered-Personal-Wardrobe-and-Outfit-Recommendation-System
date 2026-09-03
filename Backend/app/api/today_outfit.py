from fastapi import APIRouter

from app.services.recommendation_service import get_today_recommendation

router = APIRouter()


@router.get("/today-outfit")
def today_outfit():

    return get_today_recommendation()