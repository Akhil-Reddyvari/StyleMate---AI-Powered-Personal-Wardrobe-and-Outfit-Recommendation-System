from fastapi import APIRouter

from app.database.mongodb import db
from app.schemas.wardrobe import WardrobeItem
from bson import ObjectId

router = APIRouter()


@router.post("/wardrobe")
def create_wardrobe_item(item: WardrobeItem):

    result = db.wardrobe.insert_one(item.dict())

    return {
        "message": "Wardrobe item saved",
        "id": str(result.inserted_id)
    }

@router.get("/wardrobe")
def get_wardrobe():

    items = list(db.wardrobe.find())

    for item in items:
        item["_id"] = str(item["_id"])

    return items

@router.delete("/wardrobe/{item_id}")
def delete_wardrobe_item(item_id: str):

    result = db.wardrobe.delete_one(
        {"_id": ObjectId(item_id)}
    )

    if result.deleted_count == 0:
        return {
            "message": "Item not found"
        }

    return {
        "message": "Item deleted"
    }

@router.put("/wardrobe/{item_id}")
def update_wardrobe_item(
    item_id: str,
    item: WardrobeItem
):

    result = db.wardrobe.update_one(
        {"_id": ObjectId(item_id)},
        {"$set": item.model_dump()}
    )

    if result.modified_count == 0:
        return {
            "message": "No changes made"
        }

    return {
        "message": "Item updated"
    }