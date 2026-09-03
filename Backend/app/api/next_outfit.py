from fastapi import APIRouter

from app.services.recommendation_service import get_next_outfit


router = APIRouter()


@router.post("/next-outfit")
def next_outfit():

    return get_next_outfit()