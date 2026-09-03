from fastapi import APIRouter

from app.services.outfit_generator import generate_random_outfit

router = APIRouter()


@router.get("/generate-outfit")
def generate_outfit():

    return generate_random_outfit()