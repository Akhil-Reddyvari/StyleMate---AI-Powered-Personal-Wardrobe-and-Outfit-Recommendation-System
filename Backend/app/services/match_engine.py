from app.services.pair_scorer import score_pair


def find_matches(selected_item, candidate_items):

    matches = []

    for item in candidate_items:

        result = score_pair(
            selected_item,
            item
        )

        matches.append({

            "item": item,

            "score": result["score"],

            "reasons": result["reasons"]

        })

    matches.sort(
        key=lambda x: x["score"],
        reverse=True
    )

    return matches[:3]