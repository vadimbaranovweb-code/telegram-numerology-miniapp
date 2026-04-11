"""
AI Illustration service.
Generates and caches card illustrations via DALL-E 3.
Cache key: (life_path, card_type) → /tmp/numerology-illustrations/{life_path}_{card_type}.png
If OPENAI_API_KEY is not set, returns None and the endpoint serves 404.
"""

import logging
from pathlib import Path
from typing import Optional

logger = logging.getLogger(__name__)

CACHE_DIR = Path("/tmp/numerology-illustrations")

# Life path archetypal descriptions for DALL-E prompt
_LIFE_PATH_THEMES: dict[int, str] = {
    1: "a solitary blazing star at the center, pioneer energy, bold singularity, radiant outward force",
    2: "two luminous orbs gently orbiting each other, soft duality, yin-yang balance, intertwining light streams",
    3: "bursting creative sparks and prismatic light rays, expressive cosmic bloom, vibrant radiance",
    4: "crystalline geometric lattice, sacred cube structure, deep grounding energy, ordered sacred geometry",
    5: "swirling cosmic winds and flowing stardust, dynamic motion, freedom and transformation, spiraling currents",
    6: "blooming cosmic flower, hexagonal harmony, nurturing golden warmth at the center, gentle radiance",
    7: "solitary distant star in vast deep space, mystical void, ancient stargate portal, hidden cosmic depths",
    8: "powerful double helix spiral of light, abundance vortex, infinite loop of cosmic energy, golden power",
    9: "expanding universal light sphere, all-encompassing radiance, cosmic completion, full circle of stars",
}

# Card type visual focus descriptions
_CARD_TYPE_THEMES: dict[str, str] = {
    "core_energy": "central energy core emanating outward, life force at the center, primary essence",
    "current_timing": "flowing time cycles, celestial orbital rings, cosmic calendar wheel in motion",
    "inner_drive": "deep inner flame glowing from within, hidden soul fire, mysterious inner light",
    "strength": "rising powerful light pillar, upward ascension, bold luminous strength",
    "blind_spot": "partially obscured light, shadow and illumination interplay, hidden revelation",
    "relationship_style": "two connected orbits of light, relational energy field, attraction and connection",
}


def _build_prompt(life_path: int, card_type: str) -> str:
    life_theme = _LIFE_PATH_THEMES.get(life_path, "cosmic energy, sacred light")
    card_theme = _CARD_TYPE_THEMES.get(card_type, "mystical cosmic energy")
    return (
        f"Mystical dark cosmic illustration: {life_theme}. "
        f"Visual focus: {card_theme}. "
        "Style: deep dark space background (#0A0A14), glowing violet and indigo sacred geometry, "
        "soft luminous particles, ethereal atmosphere, cinematic depth of field. "
        "No text, no numbers, no letters, no faces. Square format. Highly detailed digital art."
    )


def _cache_path(life_path: int, card_type: str) -> Path:
    return CACHE_DIR / f"{life_path}_{card_type}.png"


def get_cached(life_path: int, card_type: str) -> Optional[bytes]:
    p = _cache_path(life_path, card_type)
    if p.exists():
        return p.read_bytes()
    return None


async def generate_illustration(life_path: int, card_type: str, api_key: str) -> bytes:
    """Generate illustration via DALL-E 3 and cache to disk."""
    try:
        from openai import AsyncOpenAI
    except ImportError:
        raise RuntimeError("openai package not installed")

    client = AsyncOpenAI(api_key=api_key)
    prompt = _build_prompt(life_path, card_type)
    logger.info("Generating illustration: life_path=%d card_type=%s", life_path, card_type)

    response = await client.images.generate(
        model="dall-e-3",
        prompt=prompt,
        size="1024x1024",
        quality="standard",
        response_format="b64_json",
        n=1,
    )

    import base64
    b64 = response.data[0].b64_json
    if not b64:
        raise RuntimeError("DALL-E returned empty b64_json")

    image_bytes = base64.b64decode(b64)

    # Save to disk cache
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    _cache_path(life_path, card_type).write_bytes(image_bytes)
    logger.info("Cached illustration: life_path=%d card_type=%s (%d bytes)", life_path, card_type, len(image_bytes))

    return image_bytes


async def get_or_generate(life_path: int, card_type: str, api_key: str) -> bytes:
    cached = get_cached(life_path, card_type)
    if cached is not None:
        return cached
    return await generate_illustration(life_path, card_type, api_key)
