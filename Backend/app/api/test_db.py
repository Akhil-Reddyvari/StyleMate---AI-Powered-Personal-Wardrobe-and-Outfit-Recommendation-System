from fastapi import APIRouter

from app.database.mongodb import db

router = APIRouter()

@router.get("/test-db")
def test_db():

    collections = db.list_collection_names()

    return {
        "status": "connected",
        "collections": collections
    }