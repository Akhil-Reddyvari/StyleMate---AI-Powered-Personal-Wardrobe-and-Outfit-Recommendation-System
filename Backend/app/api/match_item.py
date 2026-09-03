from bson import ObjectId
from fastapi import APIRouter, HTTPException

from app.database.mongodb import db
from app.services.match_engine import find_matches

router = APIRouter()


@router.get("/match-item/{item_id}")
def match_item(item_id: str):

    selected = db.wardrobe.find_one(
        {"_id": ObjectId(item_id)}
    )

    if not selected:
        raise HTTPException(
            status_code=404,
            detail="Item not found"
        )

    category = selected["category"]

    if category == "topwear":

        candidates = list(
            db.wardrobe.find(
                {"category": "bottomwear"}
            )
        )

    elif category == "bottomwear":

        candidates = list(
            db.wardrobe.find(
                {"category": "topwear"}
            )
        )

    else:

        raise HTTPException(
            status_code=400,
            detail="Matching not supported for this category yet"
        )

    matches = find_matches(
        selected,
        candidates
    )

    selected["_id"] = str(selected["_id"])

    for match in matches:
        match["item"]["_id"] = str(match["item"]["_id"])

    return {

        "selected_item": selected,

        "matches": matches

    }