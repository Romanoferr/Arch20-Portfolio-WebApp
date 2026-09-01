#!/usr/bin/env python3
"""
Gera a imagem Open Graph (og-image.jpg) do site em public/images/.

Usa as cores da marca (fundo #fafaf8, acento #8b7355) e o logo BC para
produzir uma imagem 1200x630 (proporção recomendada pelo Google/Facebook).
"""

import os
from PIL import Image, ImageDraw, ImageFont

OUT_DIR = os.path.join('public', 'images')
OUT_PATH = os.path.join(OUT_DIR, 'og-image.jpg')
WIDTH, HEIGHT = 1200, 630

BG = (250, 250, 248)      # --color-bg
ACCENT = (139, 115, 85)   # --color-accent
TEXT = (26, 26, 26)       # --color-text
MUTED = (107, 107, 107)   # --color-muted

# Configurável por env (ex.: OG_TITLE="Escritório X"), com fallback genérico.
TITLE = os.environ.get('OG_TITLE', 'Escritório de Arquitetura')
LOGO_PATH = os.environ.get('LOGO_PATH', os.path.join('src', 'assets', 'logos', 'logo.png'))


def load_font(size):
    """Tenta carregar uma fonte serifada; cai para a fonte padrão se falhar."""
    candidates = [
        'CormorantGaramond-SemiBold.ttf',
        'CormorantGaramond-Medium.ttf',
        'Georgia.ttf',
        'DejaVuSerif.ttf',
        'arial.ttf',
    ]
    for name in candidates:
        try:
            return ImageFont.truetype(name, size)
        except OSError:
            continue
    return ImageFont.load_default()


def main():
    os.makedirs(OUT_DIR, exist_ok=True)

    img = Image.new('RGB', (WIDTH, HEIGHT), BG)
    draw = ImageDraw.Draw(img)

    # Linha decorativa de acento no topo
    draw.rectangle([0, 0, WIDTH, 8], fill=ACCENT)

    # Logo (se disponível)
    if os.path.exists(LOGO_PATH):
        logo = Image.open(LOGO_PATH).convert('RGBA')
        logo.thumbnail((220, 220))
        logo_x = (WIDTH - logo.width) // 2
        logo_y = 90
        img.paste(logo, (logo_x, logo_y), logo)

    # Título
    title_font = load_font(64)
    title = TITLE
    title_bbox = draw.textbbox((0, 0), title, font=title_font)
    title_w = title_bbox[2] - title_bbox[0]
    draw.text(
        ((WIDTH - title_w) / 2, 330),
        title,
        font=title_font,
        fill=TEXT,
    )

    # Subtítulo
    sub_font = load_font(34)
    subtitle = 'Arquitetura & Design de Interiores'
    sub_bbox = draw.textbbox((0, 0), subtitle, font=sub_font)
    sub_w = sub_bbox[2] - sub_bbox[0]
    draw.text(
        ((WIDTH - sub_w) / 2, 430),
        subtitle,
        font=sub_font,
        fill=ACCENT,
    )

    # Localização
    loc_font = load_font(26)
    location = 'Rio de Janeiro · Niterói'
    loc_bbox = draw.textbbox((0, 0), location, font=loc_font)
    loc_w = loc_bbox[2] - loc_bbox[0]
    draw.text(
        ((WIDTH - loc_w) / 2, 510),
        location,
        font=loc_font,
        fill=MUTED,
    )

    img.save(OUT_PATH, quality=92)
    print(f'✅ {OUT_PATH} ({os.path.getsize(OUT_PATH)} bytes)')


if __name__ == '__main__':
    main()