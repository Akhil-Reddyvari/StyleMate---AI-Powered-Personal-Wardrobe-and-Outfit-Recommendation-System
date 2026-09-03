from fastapi import APIRouter

from app.services.recommendation_service import wear_today_outfit


router = APIRouter()


@router.post("/wear-outfit")
def wear_outfit():

    return wear_today_outfit()