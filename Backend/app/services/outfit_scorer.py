from app.services.fashion_rules import COLOR_COMPATIBILITY


def score_colors(top, bottom):

    top_color = top["primary_color"].lower()
    bottom_color = bottom["primary_color"].lower()

    pair = (top_color, bottom_color)
    reverse_pair = (bottom_color, top_color)

    if pair in COLOR_COMPATIBILITY:
        return COLOR_COMPATIBILITY[pair]

    if reverse_pair in COLOR_COMPATIBILITY:
        return COLOR_COMPATIBILITY[reverse_pair]

    return 30


def score_style(top, bottom):

    if top["style"] == bottom["style"]:
        return 25

    return 10


def score_occasion(top, bottom):

    if top["occasion"] == bottom["occasion"]:
        return 20

    return 5


def score_footwear(shoe, top):

    if shoe is None:
        return 0

    if shoe["primary_color"].lower() == "white":
        return 8

    if shoe["subcategory"].lower() == "sneakers":
        return 6

    return 2


def score_rotation(top, bottom, shoe):

    top_worn = top.get("times_worn", 0)
    bottom_worn = bottom.get("times_worn", 0)
    shoe_worn = shoe.get("times_worn", 0)

    total_worn = top_worn + bottom_worn + shoe_worn

    if total_worn == 0:
        return 20

    if total_worn <= 2:
        return 15

    if total_worn <= 5:
        return 10

    if total_worn <= 8:
        return 5

    return 0


def style_bonus(top, bottom, shoe):

    bonus = 0

    top_sub = top["subcategory"].lower()
    bottom_sub = bottom["subcategory"].lower()
    shoe_sub = shoe["subcategory"].lower()

    # Smart casual combination
    if (
        top_sub == "polo"
        and bottom_sub == "chinos"
        and shoe_sub == "sneakers"
    ):
        bonus += 8

    # College classic
    if (
        top_sub == "shirt"
        and bottom_sub == "jeans"
    ):
        bonus += 5

    # Casual combination
    if (
        top_sub == "t-shirt"
        and bottom_sub == "jeans"
    ):
        bonus += 3

    # Styling conflict
    if (
        top_sub == "shirt"
        and bottom_sub == "shorts"
    ):
        bonus -= 10

    return bonus


def score_outfit(top, bottom, shoe):

    score = 0
    reasons = []

    # -------------------------
    # COLOR
    # -------------------------

    color_score = score_colors(top, bottom)
    score += color_score

    if color_score >= 45:
        reasons.append("Strong color harmony")

    # -------------------------
    # STYLE
    # -------------------------

    style_score = score_style(top, bottom)
    score += style_score

    if style_score >= 20:
        reasons.append("Consistent styling")

    # -------------------------
    # OCCASION
    # -------------------------

    occasion_score = score_occasion(top, bottom)
    score += occasion_score

    if occasion_score >= 15:
        reasons.append("Suitable for the occasion")

    # -------------------------
    # FOOTWEAR
    # -------------------------

    footwear_score = score_footwear(shoe, top)
    score += footwear_score

    if footwear_score >= 6:
        reasons.append("Footwear complements outfit")

    # -------------------------
    # WARDROBE ROTATION
    # -------------------------

    rotation_score = score_rotation(
        top,
        bottom,
        shoe
    )

    score += rotation_score

    if rotation_score >= 10:
        reasons.append("Good wardrobe rotation")

    # -------------------------
    # STYLIST BONUS
    # -------------------------

    bonus = style_bonus(
        top,
        bottom,
        shoe
    )

    score += bonus

    if bonus > 0:
        reasons.append("Strong stylist recommendation")

    if bonus < 0:
        reasons.append("Styling conflict detected")

    # -------------------------
    # FINAL RESULT
    # -------------------------

    return {
        "score": score,
        "reasons": reasons
    }