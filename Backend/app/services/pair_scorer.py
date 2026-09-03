from app.services.fashion_rules import (
    COLOR_COMPATIBILITY,
    STYLE_COMPATIBILITY,
    OCCASION_COMPATIBILITY,
)


def score_color_pair(item1, item2):

    color1 = item1["primary_color"].lower()
    color2 = item2["primary_color"].lower()

    pair = (color1, color2)
    reverse_pair = (color2, color1)

    if pair in COLOR_COMPATIBILITY:
        return COLOR_COMPATIBILITY[pair]

    if reverse_pair in COLOR_COMPATIBILITY:
        return COLOR_COMPATIBILITY[reverse_pair]

    return 30


def score_style_pair(item1, item2):

    style1 = item1["style"].lower()
    style2 = item2["style"].lower()

    pair = (style1, style2)

    return STYLE_COMPATIBILITY.get(pair, 10)


def score_occasion_pair(item1, item2):

    occasion1 = item1["occasion"].lower()
    occasion2 = item2["occasion"].lower()

    pair = (occasion1, occasion2)

    return OCCASION_COMPATIBILITY.get(pair, 5)


def score_pair(item1, item2):

    total_score = 0
    reasons = []

    # -------------------------
    # Color
    # -------------------------
    color_score = score_color_pair(item1, item2)
    total_score += color_score

    if color_score >= 50:
        reasons.append("Classic color combination")

    elif color_score >= 45:
        reasons.append("Balanced color contrast")

    elif color_score >= 35:
        reasons.append("Safe everyday color pairing")

    else:
        reasons.append("Color combination could be improved")

    # -------------------------
    # Style
    # -------------------------
    style_score = score_style_pair(item1, item2)
    total_score += style_score

    if style_score == 25:
        reasons.append("Both pieces share the same style")

    elif style_score >= 20:
        reasons.append("Styles complement each other")

    elif style_score >= 15:
        reasons.append("Styles work reasonably well together")

    else:
        reasons.append("Styles are not an ideal match")

    # -------------------------
    # Occasion
    # -------------------------
    occasion_score = score_occasion_pair(item1, item2)
    total_score += occasion_score

    if occasion_score == 20:
        reasons.append("Perfect for the same occasion")

    elif occasion_score >= 18:
        reasons.append("Suitable across similar occasions")

    elif occasion_score >= 10:
        reasons.append("Can work with some styling")

    else:
        reasons.append("Occasion compatibility is limited")

    return {
        "score": total_score,
        "reasons": reasons
    }