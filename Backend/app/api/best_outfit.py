from fastapi import APIRouter

from app.services.outfit_generator import generate_best_outfit

router = APIRouter()


@router.get("/generate-best-outfit")
def best_outfit():

    return generate_best_outfit()