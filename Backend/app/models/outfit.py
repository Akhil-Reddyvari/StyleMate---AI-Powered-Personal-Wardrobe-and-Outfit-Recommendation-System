from pydantic import BaseModel
from typing import List


class Outfit(BaseModel):

    top_id: str

    bottom_id: str

    footwear_id: str

    score: int

    reasons: List[str]