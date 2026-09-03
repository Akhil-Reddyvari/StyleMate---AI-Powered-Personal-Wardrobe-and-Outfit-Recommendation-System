from pydantic import BaseModel


class WardrobeItem(BaseModel):

    category: str

    subcategory: str

    primary_color: str

    secondary_color: str | None = None

    pattern: str

    style: str

    occasion: str

    season: str = "all"

    times_worn: int = 0

    last_worn: str | None = None

    image_url: str | None = None