import random

from app.database.mongodb import db
from app.services.outfit_scorer import score_outfit


def serialize_item(item):
    """
    Convert MongoDB ObjectId into string.
    """

    item = item.copy()

    item["_id"] = str(item["_id"])

    return item


def split_items(items):

    tops = [
        item for item in items
        if item["category"] == "topwear"
    ]

    bottoms = [
        item for item in items
        if item["category"] == "bottomwear"
    ]

    shoes = [
        item for item in items
        if item["category"] == "footwear"
    ]

    return tops, bottoms, shoes


def generate_all_outfits():

    items = list(db.wardrobe.find())

    tops, bottoms, shoes = split_items(items)

    outfits = []

    for top in tops:

        for bottom in bottoms:

            for shoe in shoes:

                result = score_outfit(top, bottom, shoe)

                outfits.append({

                    "score": result["score"],

                    "reasons": result["reasons"],

                    "top": serialize_item(top),

                    "bottom": serialize_item(bottom),

                    "footwear": serialize_item(shoe)

                })

    outfits.sort(
        key=lambda x: x["score"],
        reverse=True
    )

    return outfits


def generate_best_outfit():

    outfits = generate_all_outfits()

    if not outfits:
        return {
            "message": "No outfits found."
        }

    return outfits[0]


def generate_top_outfits(limit=5):

    outfits = generate_all_outfits()

    return outfits[:limit]


def generate_random_outfit():

    outfits = generate_all_outfits()

    if not outfits:
        return {
            "message": "No outfits found."
        }

    return random.choice(outfits)