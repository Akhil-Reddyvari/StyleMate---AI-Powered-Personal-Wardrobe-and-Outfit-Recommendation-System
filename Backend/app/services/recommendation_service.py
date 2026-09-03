from datetime import date, datetime
from bson import ObjectId
from app.database.mongodb import db
from app.services.outfit_generator import (
    generate_best_outfit,
    generate_all_outfits
)


USER_ID = "demo_user"


# =========================================
# OUTFIT KEY
# =========================================

def outfit_key(outfit):
    return (
        outfit["top"]["_id"],
        outfit["bottom"]["_id"],
        outfit["footwear"]["_id"]
    )


# =========================================
# GET TODAY'S RECOMMENDATION
# =========================================

def get_today_recommendation():

    today = str(date.today())

    recommendation = db.daily_recommendations.find_one({
        "user_id": USER_ID,
        "date": today
    })

    # -----------------------------------------
    # Today's recommendation already exists
    # -----------------------------------------

    if recommendation:

        recommendation["_id"] = str(
            recommendation["_id"]
        )

        return recommendation


    # -----------------------------------------
    # Generate first recommendation of the day
    # -----------------------------------------

    outfit = generate_best_outfit()

    recommendation = {

        "user_id": USER_ID,

        "date": today,

        "status": "pending",

        "current_outfit": outfit,

        "shown_outfits": [
            {
                "top_id": outfit["top"]["_id"],
                "bottom_id": outfit["bottom"]["_id"],
                "footwear_id": outfit["footwear"]["_id"]
            }
        ],

        "worn_outfits": []
    }


    result = db.daily_recommendations.insert_one(
        recommendation
    )

    recommendation["_id"] = str(
        result.inserted_id
    )

    return recommendation


# =========================================
# GET NEXT OUTFIT
# =========================================

def get_next_outfit():

    today_recommendation = get_today_recommendation()


    # -----------------------------------------
    # Don't allow changing outfit after wearing
    # -----------------------------------------

    if today_recommendation.get("status") == "worn":

        return {
            "message": "Today's outfit has already been worn."
        }


    # -----------------------------------------
    # Get already shown outfits
    # -----------------------------------------

    shown = {

        (
            outfit["top_id"],
            outfit["bottom_id"],
            outfit["footwear_id"]
        )

        for outfit in today_recommendation.get(
            "shown_outfits",
            []
        )

    }


    # -----------------------------------------
    # Generate all possible outfits
    # -----------------------------------------

    outfits = generate_all_outfits()


    remaining = [

        outfit

        for outfit in outfits

        if outfit_key(outfit) not in shown

    ]


    # -----------------------------------------
    # No more combinations
    # -----------------------------------------

    if not remaining:

        return {
            "message": "No more outfits available today."
        }


    # -----------------------------------------
    # Select next outfit
    # -----------------------------------------

    next_outfit = remaining[0]


    today_recommendation["current_outfit"] = (
        next_outfit
    )


    today_recommendation["shown_outfits"].append({

        "top_id": next_outfit["top"]["_id"],

        "bottom_id": next_outfit["bottom"]["_id"],

        "footwear_id": next_outfit["footwear"]["_id"]

    })


    # -----------------------------------------
    # Save new current outfit
    # -----------------------------------------

    db.daily_recommendations.update_one(

        {
            "_id": ObjectId(
                today_recommendation["_id"]
            )
        },

        {
            "$set": {

                "current_outfit":
                    today_recommendation[
                        "current_outfit"
                    ],

                "shown_outfits":
                    today_recommendation[
                        "shown_outfits"
                    ]

            }
        }

    )


    return next_outfit


# =========================================
# WEAR TODAY'S OUTFIT
# =========================================

def wear_today_outfit():

    today_recommendation = get_today_recommendation()

    if not today_recommendation:
        return {
            "message": "No outfit available for today."
        }

    outfit = today_recommendation["current_outfit"]

    top_id = outfit["top"]["_id"]
    bottom_id = outfit["bottom"]["_id"]
    footwear_id = outfit["footwear"]["_id"]

    current_outfit_key = (
        top_id,
        bottom_id,
        footwear_id
    )

    # --------------------------------
    # Get outfits already worn today
    # --------------------------------

    worn_outfits = today_recommendation.get(
        "worn_outfits",
        []
    )

    # --------------------------------
    # Prevent duplicate wear
    # --------------------------------

    for worn in worn_outfits:

        worn_key = (
            worn["top_id"],
            worn["bottom_id"],
            worn["footwear_id"]
        )

        if worn_key == current_outfit_key:

            return {
                "message": "This outfit has already been marked as worn.",
                "outfit": outfit
            }

    # --------------------------------
    # Increment wardrobe wear counts
    # --------------------------------

    db.wardrobe.update_one(
        {"_id": ObjectId(top_id)},
        {"$inc": {"times_worn": 1}}
    )

    db.wardrobe.update_one(
        {"_id": ObjectId(bottom_id)},
        {"$inc": {"times_worn": 1}}
    )

    db.wardrobe.update_one(
        {"_id": ObjectId(footwear_id)},
        {"$inc": {"times_worn": 1}}
    )

    # --------------------------------
    # Record this specific outfit
    # --------------------------------

    worn_record = {
        "top_id": top_id,
        "bottom_id": bottom_id,
        "footwear_id": footwear_id
    }

    db.daily_recommendations.update_one(
        {"_id": ObjectId(today_recommendation["_id"])},
        {
            "$push": {
                "worn_outfits": worn_record
            },
            "$set": {
                "status": "active"
            }
        }
    )

    # ==========================================
    # OUTFIT HISTORY
    # ==========================================

    history_record = {
        "user_id": USER_ID,

        "date": today_recommendation["date"],

        "worn_at": datetime.utcnow(),

        "outfit": outfit,

        "score": outfit.get("score", 0),

        "reasons": outfit.get(
            "reasons",
            []
        )
    }

    db.outfit_history.insert_one(
        history_record
    )

    # ==========================================
    # RESPONSE
    # ==========================================

    return {
        "message": "Outfit marked as worn.",
        "outfit": outfit
    }

def get_outfit_history():

    cursor = db.outfit_history.find(
        {
            "user_id": USER_ID
        }
    )

    cursor = cursor.sort([
        ("date", -1),
        ("worn_at", -1)
    ])

    history = list(cursor)

    for record in history:

        record["_id"] = str(
            record["_id"]
        )

        if isinstance(
            record.get("worn_at"),
            datetime
        ):
            record["worn_at"] = (
                record["worn_at"]
                .isoformat()
            )

    return history
