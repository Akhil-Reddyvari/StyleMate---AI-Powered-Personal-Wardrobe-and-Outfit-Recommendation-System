from fastapi import APIRouter

from app.services.outfit_generator import generate_top_outfits

router = APIRouter()


@router.get("/top-outfits")
def top_outfits():

    return generate_top_outfits()