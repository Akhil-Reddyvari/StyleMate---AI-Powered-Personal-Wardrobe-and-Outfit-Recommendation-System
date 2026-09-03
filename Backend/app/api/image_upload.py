import os

import cloudinary
import cloudinary.uploader

from fastapi import APIRouter, UploadFile, File, HTTPException
from dotenv import load_dotenv


load_dotenv()


cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET")
)


router = APIRouter()


@router.post("/upload-image")
async def upload_image(file: UploadFile = File(...)):

    try:

        result = cloudinary.uploader.upload(
            file.file,
            folder="ai_personal_stylist/wardrobe"
        )

        return {
            "message": "Image uploaded successfully",
            "image_url": result["secure_url"]
        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )