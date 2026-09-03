from datetime import datetime

from app.database.mongodb import db


USER_ID = "demo_user"


def get_outfit_history(month=None):

    query = {
        "user_id": USER_ID
    }

    if month:
        query["date"] = {
            "$regex": f"^{month}"
        }

    history = list(
        db.outfit_history.find(query).sort(
            "date",
            -1
        )
    )

    for item in history:

        item["_id"] = str(item["_id"])

        if isinstance(item.get("worn_at"), datetime):
            item["worn_at"] = item["worn_at"].isoformat()

    return history