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

# Life path archetypal visual concepts — each has distinct imagery and mood
_LIFE_PATH_THEMES: dict[int, str] = {
    1: (
        "a lone blazing comet cutting a bold streak through absolute darkness, "
        "single concentrated point of white-hot light expanding outward, "
        "pioneer energy — one force, one direction, no hesitation"
    ),
    2: (
        "two luminous pearls suspended in perfect equilibrium above a still cosmic lake, "
        "silver and rose light reflecting between them, "
        "moonlit duality — soft pull of opposing forces finding harmony"
    ),
    3: (
        "fractal burst of prismatic color — every hue exploding from a central creative spark, "
        "painterly chaos resolving into a blooming spiral form, "
        "expressive joy made visible as light and pigment"
    ),
    4: (
        "ancient granite foundation stone suspended in space, "
        "four luminous grid lines forming a perfect square of ochre-gold light, "
        "bedrock energy — solidity, geometry, the architecture of the cosmos"
    ),
    5: (
        "mercury-quick spiral trail blazing through five constellations, "
        "motion-blur stardust in electric teal and silver, "
        "restless kinetic energy — perpetual becoming, wind made of starlight"
    ),
    6: (
        "warm amber hearthlight blooming at the center of a hexagonal rose window, "
        "six golden petals of radiant warmth opening like a flower, "
        "sheltering nurture — home in the center of the universe"
    ),
    7: (
        "solitary amethyst crystal spire rising through a field of silent deep-space stars, "
        "one thin beam of violet-white starlight piercing absolute stillness, "
        "mystical solitude — the seeker alone with the infinite"
    ),
    8: (
        "double copper-gold infinity spiral ascending through a column of rising light, "
        "power vortex with deep amber core fading to brilliant white at the apex, "
        "unstoppable upward force — ambition as cosmic law"
    ),
    9: (
        "cosmic supernova dissolving outward into a thousand luminous seeds of light, "
        "deep violet-rose bloom at the moment of ultimate completion, "
        "universal release — everything given back to the cosmos"
    ),
}

# Card type: distinct palette and emotional tone per card
_CARD_TYPE_THEMES: dict[str, tuple[str, str]] = {
    # (visual focus description, color palette hint)
    "core_energy": (
        "the primal life force radiating from an incandescent center, essence laid bare",
        "warm violet-gold palette, luminous core, deep indigo outer space"
    ),
    "current_timing": (
        "celestial orbital rings showing time in motion, a cosmic calendar wheel turning slowly",
        "cool cyan-blue and silver tones, orbital light trails, flowing temporal arcs"
    ),
    "inner_drive": (
        "a hidden inner flame burning deep within shadow, the soul fire visible only to those who look closely",
        "deep crimson-rose and dark indigo, smoldering ember glow, intimate darkness"
    ),
    "strength": (
        "a rising pillar of pure light breaking through darkness, ascension and power made visible",
        "amber-white and gold tones, radiant upward burst, strength as luminous clarity"
    ),
    "blind_spot": (
        "a half-revealed form emerging from shadow — light illuminates one side, deep mystery on the other",
        "cool indigo and charcoal shadows with a single streak of revealing silver light"
    ),
    "relationship_style": (
        "two orbits of warm light intertwining — distinct yet drawn together, a dance of attraction and resonance",
        "rose-gold dual tones, twin light spirals, soft warmth of connection"
    ),
}

# Art style variants — rotated by (life_path + card_type_index) to ensure variety
_ART_STYLES: list[str] = [
    "highly detailed dark digital art, cinematic depth of field, ultra-sharp particles",
    "cosmic watercolor wash, soft ink bleeds, translucent layered washes on black",
    "dark oil painting with impasto texture, rich deep color, painterly luminous highlights",
    "sacred geometry line art with soft color fills, precise geometric forms, ethereal glow",
    "soft pastel cosmic illustration, dreamy atmospheric depth, delicate color gradients",
    "photorealistic space photography style, NASA deep-field aesthetic, sharp star detail",
]

_CARD_TYPE_ORDER = list(_CARD_TYPE_THEMES.keys())


def _build_prompt(life_path: int, card_type: str) -> str:
    life_theme = _LIFE_PATH_THEMES.get(life_path, "cosmic energy, sacred geometry, mystical light")
    card_focus, card_palette = _CARD_TYPE_THEMES.get(
        card_type, ("mystical cosmic energy", "deep violet and indigo")
    )

    # Rotate art style deterministically so same life_path+card_type always gets same style
    # but different combinations get different styles
    card_idx = _CARD_TYPE_ORDER.index(card_type) if card_type in _CARD_TYPE_ORDER else 0
    style_idx = (life_path + card_idx * 3) % len(_ART_STYLES)
    art_style = _ART_STYLES[style_idx]

    return (
        f"Dark mystical illustration: {life_theme}. "
        f"Emotional focus: {card_focus}. "
        f"Color palette: {card_palette}. "
        f"Background: absolute dark space, near-black (#0A0A14). "
        f"Style: {art_style}. "
        "No text, no numbers, no letters, no human faces or figures. "
        "Square 1:1 format. Stunning, otherworldly, premium quality."
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
