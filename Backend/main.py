from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.wardrobe import router as wardrobe_router
from app.api.test_db import router as test_router
from app.api.outfit import router as outfit_router
from app.api.best_outfit import router as best_outfit_router
from app.api.top_outfits import router as top_outfits_router
from app.api.match_item import router as match_item_router
from app.api.today_outfit import router as today_router
from app.api.next_outfit import router as next_outfit_router
from app.api.wear_outfit import router as wear_outfit_router
from app.api.image_upload import router as image_upload_router
from app.api.outfit_history import router as outfit_history_router


app = FastAPI(
    title="AI Personal Stylist API"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(wardrobe_router)
app.include_router(test_router)
app.include_router(outfit_router)
app.include_router(best_outfit_router)
app.include_router(top_outfits_router)
app.include_router(match_item_router)
app.include_router(today_router)
app.include_router(next_outfit_router)
app.include_router(wear_outfit_router)
app.include_router(image_upload_router)
app.include_router(outfit_history_router)


@app.get("/")
def home():
    return {
        "message": "AI Personal Stylist API Running"
    }