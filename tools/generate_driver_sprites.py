from pathlib import Path
from PIL import Image, ImageDraw


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets" / "drivers"
FRAME_OUT = OUT / "frames"

FRAME_W = 128
FRAME_H = 160
ANIM_FRAMES = 4
DIRECTIONS = ["front", "left", "right"]
EXPRESSIONS = ["idle", "eat", "celebrate", "tired"]
SHEET_W = FRAME_W * ANIM_FRAMES
SHEET_H = FRAME_H * len(DIRECTIONS) * len(EXPRESSIONS)


DRIVERS = {
    "verstappen": {
        "badge": "MV", "number": "1", "team": "Red Bull",
        "skin": ["#8f4f43", "#be7655", "#efb987", "#ffd3a4", "#ffe0bd"],
        "hair": ["#2a180b", "#6b3912", "#a35d1d", "#d58324"],
        "eye": "#2373bd", "eye_hi": "#83c7ff",
        "suit": "#101a42", "stripe": "#2f5be8", "accent": "#ec3b32", "accent2": "#ffd33d",
        "hair_style": "swept", "face": "light_beard", "brow": "strong", "shape": "square", "gaze": "sharp",
    },
    "leclerc": {
        "badge": "CL", "number": "16", "team": "Ferrari",
        "skin": ["#8f4f43", "#bd7355", "#efb88d", "#ffd2a6", "#ffe0bd"],
        "hair": ["#130b07", "#32180f", "#60311d", "#8d5635"],
        "eye": "#2f70a1", "eye_hi": "#7fc5ff",
        "suit": "#b5121b", "stripe": "#ef2635", "accent": "#ffcf45", "accent2": "#f4f0d8",
        "hair_style": "thick", "face": "stubble", "brow": "arched", "shape": "wide", "gaze": "bright",
    },
    "hamilton": {
        "badge": "LH", "number": "44", "team": "Ferrari",
        "skin": ["#3f221b", "#5f3528", "#8f5b3f", "#bd805e", "#d99f78"],
        "hair": ["#05070b", "#111318", "#2c2421", "#514039"],
        "eye": "#3b271d", "eye_hi": "#a77b57",
        "suit": "#b5121b", "stripe": "#ef2635", "accent": "#f4f0d8", "accent2": "#7b3ff2",
        "hair_style": "braids", "face": "beard", "brow": "calm", "shape": "oval", "gaze": "calm",
    },
    "norris": {
        "badge": "LN", "number": "4", "team": "McLaren",
        "skin": ["#8f4f43", "#c47a57", "#f0ba8e", "#ffd2a5", "#ffe0bd"],
        "hair": ["#23140d", "#56311f", "#8a5533", "#bd7b4c"],
        "eye": "#2e80b3", "eye_hi": "#8bd8ff",
        "suit": "#ff8700", "stripe": "#111318", "accent": "#43c1ff", "accent2": "#f6f1d2",
        "hair_style": "curly", "face": "clean", "brow": "soft", "shape": "young", "gaze": "open",
    },
    "antonelli": {
        "badge": "KA", "number": "12", "team": "Mercedes",
        "skin": ["#8f4f43", "#c77e5b", "#efbd92", "#ffd4a8", "#ffe0bd"],
        "hair": ["#0f0d0c", "#2b201b", "#5e4635", "#8a684e"],
        "eye": "#31443d", "eye_hi": "#8fb5a8",
        "suit": "#cfd6dd", "stripe": "#00d2be", "accent": "#111318", "accent2": "#f4f0d8",
        "hair_style": "curly", "face": "clean", "brow": "straight", "shape": "young", "gaze": "open",
    },
    "russell": {
        "badge": "GR", "number": "63", "team": "Mercedes",
        "skin": ["#8f4f43", "#c17957", "#ecba8d", "#ffd1a4", "#ffe0bd"],
        "hair": ["#20120d", "#3a2319", "#613b28", "#8c583a"],
        "eye": "#335575", "eye_hi": "#9ed0f0",
        "suit": "#cfd6dd", "stripe": "#00d2be", "accent": "#111318", "accent2": "#f4f0d8",
        "hair_style": "tall", "face": "clean", "brow": "straight", "shape": "long", "gaze": "precise",
    },
    "alonso": {
        "badge": "FA", "number": "14", "team": "Aston Martin",
        "skin": ["#6a3b2d", "#9d6247", "#d49974", "#efb78c", "#ffd1a4"],
        "hair": ["#1d100b", "#382219", "#5e3927", "#835338"],
        "eye": "#235548", "eye_hi": "#8fd8b7",
        "suit": "#006f62", "stripe": "#b6ff4a", "accent": "#111318", "accent2": "#f4f0d8",
        "hair_style": "veteran", "face": "beard", "brow": "heavy", "shape": "mature", "gaze": "heavy",
    },
    "piastri": {
        "badge": "OP", "number": "81", "team": "McLaren",
        "skin": ["#8f4f43", "#c77e5b", "#efbd92", "#ffd4a8", "#ffe0bd"],
        "hair": ["#160f0b", "#2d211b", "#6a4a33", "#926d4d"],
        "eye": "#335d76", "eye_hi": "#95d3f0",
        "suit": "#ff8700", "stripe": "#47c7fc", "accent": "#1d2430", "accent2": "#f4f0d8",
        "hair_style": "sidepart", "face": "calm", "brow": "flat", "shape": "young", "gaze": "cool",
    },
}


def rect(draw, x, y, w, h, color):
    draw.rectangle([x, y, x + w - 1, y + h - 1], fill=color)


def px_text(draw, text, x, y, color):
    draw.text((x, y), text, fill=color)


def shifted(direction):
    if direction == "left":
        return -5, -2, 1
    if direction == "right":
        return 5, 2, -1
    return 0, 0, 0


def draw_background(draw, d):
    rect(draw, 0, 0, FRAME_W, FRAME_H, "#0c1018")
    rect(draw, 4, 4, FRAME_W - 8, FRAME_H - 8, "#382412")
    rect(draw, 7, 7, FRAME_W - 14, FRAME_H - 14, "#d18a30")
    rect(draw, 10, 10, FRAME_W - 20, FRAME_H - 20, "#f2d89e")
    rect(draw, 13, 13, FRAME_W - 26, FRAME_H - 26, "#273247")
    for y, c in [(16, "#303d55"), (20, "#2b354b"), (24, "#252f43"), (28, "#20293b")]:
        rect(draw, 16, y, FRAME_W - 32, 12, c)
    rect(draw, 13, 13, FRAME_W - 26, 7, d["suit"])
    rect(draw, 13, 20, FRAME_W - 26, 3, d["stripe"])
    rect(draw, 14, FRAME_H - 21, FRAME_W - 28, 8, d["suit"])
    rect(draw, 37, FRAME_H - 24, 54, 5, d["accent"])
    rect(draw, 18, 17, 22, 12, d["accent"])
    rect(draw, 40, 17, 16, 12, d["stripe"])
    px_text(draw, d["badge"], 21, 19, "#ffffff")


def draw_shoulders(draw, d, bob):
    skin = d["skin"]
    rect(draw, 50, 115 + bob, 28, 13, skin[1])
    rect(draw, 28, 127 + bob, 72, 24, "#151a25")
    rect(draw, 31, 124 + bob, 66, 26, d["suit"])
    rect(draw, 42, 124 + bob, 44, 9, d["stripe"])
    rect(draw, 53, 135 + bob, 22, 13, d["accent2"])
    rect(draw, 46, 149 + bob, 36, 4, d["accent"])
    rect(draw, 26, 137 + bob, 18, 6, d["accent2"])
    rect(draw, 84, 137 + bob, 18, 6, d["accent"])
    px_text(draw, d["number"], 57, 137 + bob, "#111318")


def draw_face(draw, driver_id, d, direction, expression, frame, bob):
    sx, eye_shift, ear_bias = shifted(direction)
    skin = d["skin"]
    outline = "#3f2226"
    shape = d.get("shape", "oval")
    cheek_w = {
        "wide": 62,
        "square": 60,
        "long": 54,
        "mature": 58,
        "young": 56,
        "oval": 56,
    }.get(shape, 56)
    jaw_w = {
        "wide": 52,
        "square": 54,
        "long": 42,
        "mature": 50,
        "young": 44,
        "oval": 46,
    }.get(shape, 46)
    face_x = 64 - cheek_w // 2 + sx
    jaw_x = 64 - jaw_w // 2 + sx

    rect(draw, face_x - 4, 40 + bob, cheek_w + 8, 9, outline)
    rect(draw, face_x - 5, 49 + bob, cheek_w + 10, 58, outline)
    rect(draw, jaw_x - 5, 107 + bob, jaw_w + 10, 15, outline)
    rect(draw, face_x, 42 + bob, cheek_w, 11, skin[2])
    rect(draw, face_x, 53 + bob, cheek_w, 53, skin[2])
    rect(draw, jaw_x, 106 + bob, jaw_w, 14, skin[2])
    rect(draw, face_x + 9, 55 + bob, 27, 22, skin[3])
    rect(draw, face_x + 2, 88 + bob, 8, 16, skin[1])
    rect(draw, face_x + cheek_w - 9, 77 + bob, 7, 28, skin[1])
    rect(draw, 27 + sx - ear_bias, 67 + bob, 8, 18, skin[1])
    rect(draw, 93 + sx - ear_bias, 67 + bob, 8, 18, skin[1])
    rect(draw, jaw_x + 7, 116 + bob, jaw_w - 14, 4, skin[1])

    draw_hair(draw, d, sx, bob)
    draw_eyes(draw, d, sx, eye_shift, expression, frame, bob)

    nose_x = 63 + sx + eye_shift
    rect(draw, nose_x, 77 + bob, 4, 17, skin[1])
    rect(draw, nose_x + 4, 91 + bob, 7, 3, skin[0])
    rect(draw, nose_x + 1, 78 + bob, 2, 11, skin[4])

    draw_mouth(draw, d, sx + eye_shift, expression, bob)
    draw_facial_hair(draw, d, sx + eye_shift, expression, bob)
    draw_driver_signature(draw, driver_id, d, sx + eye_shift, bob)


def draw_hair(draw, d, sx, bob):
    h0, h1, h2, h3 = d["hair"]
    style = d["hair_style"]
    rect(draw, 31 + sx, 29 + bob, 66, 15, h0)
    rect(draw, 27 + sx, 42 + bob, 74, 15, h1)
    rect(draw, 29 + sx, 56 + bob, 14, 38, h1)
    rect(draw, 86 + sx, 56 + bob, 13, 38, h1)

    if style == "curly":
        for x, y, w, h in [(28, 31, 18, 15), (41, 22, 20, 16), (58, 19, 19, 15), (73, 24, 18, 15), (88, 35, 14, 16)]:
            rect(draw, x + sx, y + bob, w, h, h2)
            rect(draw, x + sx + 5, y + bob + 4, max(7, w - 10), 4, h3)
        rect(draw, 38 + sx, 47 + bob, 48, 6, h0)
    elif style == "braids":
        rect(draw, 35 + sx, 30 + bob, 58, 11, h0)
        rect(draw, 42 + sx, 38 + bob, 43, 6, h2)
        for y in range(45, 112, 11):
            rect(draw, 22 + sx, y + bob, 13, 8, h2)
            rect(draw, 93 + sx, y + bob + 3, 13, 8, h2)
            rect(draw, 27 + sx, y + bob + 2, 4, 3, h3)
            rect(draw, 98 + sx, y + bob + 5, 4, 3, h3)
    elif style == "tall":
        rect(draw, 40 + sx, 18 + bob, 48, 15, h1)
        rect(draw, 54 + sx, 11 + bob, 23, 8, h1)
        rect(draw, 49 + sx, 24 + bob, 25, 5, h3)
        rect(draw, 72 + sx, 29 + bob, 17, 5, h2)
    elif style == "veteran":
        rect(draw, 30 + sx, 33 + bob, 64, 12, h1)
        rect(draw, 27 + sx, 51 + bob, 13, 45, h1)
        rect(draw, 89 + sx, 51 + bob, 11, 45, h1)
        rect(draw, 47 + sx, 29 + bob, 34, 5, h3)
        rect(draw, 36 + sx, 44 + bob, 12, 4, h3)
    elif style == "sidepart":
        rect(draw, 33 + sx, 29 + bob, 55, 13, h1)
        rect(draw, 73 + sx, 38 + bob, 23, 9, h2)
        rect(draw, 47 + sx, 35 + bob, 36, 4, h3)
        rect(draw, 36 + sx, 42 + bob, 27, 4, h0)
    elif style == "thick":
        rect(draw, 30 + sx, 30 + bob, 62, 13, h0)
        rect(draw, 36 + sx, 24 + bob, 46, 10, h1)
        rect(draw, 49 + sx, 20 + bob, 26, 5, h2)
        rect(draw, 34 + sx, 43 + bob, 56, 6, h0)
        rect(draw, 42 + sx, 31 + bob, 31, 4, h3)
    else:
        rect(draw, 34 + sx, 27 + bob, 56, 11, h2)
        rect(draw, 46 + sx, 22 + bob, 32, 5, h3)
        rect(draw, 57 + sx, 35 + bob, 34, 4, h3)
        rect(draw, 33 + sx, 42 + bob, 20, 4, h0)


def draw_eyes(draw, d, sx, eye_shift, expression, frame, bob):
    brow = d["hair"][0]
    gaze = d.get("gaze", "open")
    brow_y = 64 + bob
    if expression == "tired":
        brow_y += 4
    if d["brow"] == "arched":
        rect(draw, 41 + sx, brow_y, 15, 3, brow)
        rect(draw, 54 + sx, brow_y - 3, 9, 3, brow)
        rect(draw, 68 + sx, brow_y - 3, 9, 3, brow)
        rect(draw, 77 + sx, brow_y, 15, 3, brow)
    elif d["brow"] == "heavy":
        rect(draw, 39 + sx, brow_y, 25, 4, brow)
        rect(draw, 68 + sx, brow_y, 25, 4, brow)
    else:
        rect(draw, 40 + sx, brow_y, 23, 3, brow)
        rect(draw, 68 + sx, brow_y, 23, 3, brow)

    blink = expression == "idle" and frame == 1
    sleepy = expression == "tired"
    eye_h = 9 if gaze in ("sharp", "precise", "cool") else 10
    if sleepy:
        eye_h = 6
    for x in (42, 72):
        ex = x + sx + eye_shift
        if blink:
            rect(draw, ex, 75 + bob, 20, 3, "#3a2319")
            continue
        rect(draw, ex, 70 + bob, 20, 2, "#2a1518")
        rect(draw, ex, 71 + bob, 20, eye_h, "#f7f4e8")
        rect(draw, ex, 71 + bob + eye_h - 1, 20, 2, "#d6bd9b")
        if gaze in ("sharp", "precise", "cool"):
            rect(draw, ex, 71 + bob, 20, 2, "#3a2319")
            rect(draw, ex + 2, 72 + bob, 4, 2, "#3a2319")
        rect(draw, ex + 7, 71 + bob, 7, eye_h, d["eye"])
        rect(draw, ex + 9, 73 + bob, 3, max(3, eye_h - 4), "#111318")
        rect(draw, ex + 7, 72 + bob, 2, 2, "#ffffff")
        rect(draw, ex + 15, 75 + bob, 2, 2, d["eye_hi"])
    if gaze == "heavy":
        rect(draw, 41 + sx + eye_shift, 69 + bob, 22, 3, brow)
        rect(draw, 71 + sx + eye_shift, 69 + bob, 22, 3, brow)


def draw_mouth(draw, d, sx, expression, bob):
    if expression == "eat":
        rect(draw, 53 + sx, 98 + bob, 23, 13, "#6f2024")
        rect(draw, 57 + sx, 99 + bob, 15, 3, "#f2d0be")
        rect(draw, 60 + sx, 106 + bob, 12, 3, "#f19999")
    elif expression == "celebrate":
        rect(draw, 49 + sx, 96 + bob, 31, 12, "#6f2024")
        rect(draw, 54 + sx, 98 + bob, 21, 4, "#ffffff")
    elif expression == "tired":
        rect(draw, 54 + sx, 103 + bob, 22, 3, "#7b2c2a")
        rect(draw, 50 + sx, 93 + bob, 8, 3, d["skin"][1])
        rect(draw, 76 + sx, 93 + bob, 8, 3, d["skin"][1])
    else:
        rect(draw, 52 + sx, 98 + bob, 25, 3, "#7b2c2a")
        rect(draw, 57 + sx, 101 + bob, 15, 3, "#d75e5e")


def draw_facial_hair(draw, d, sx, expression, bob):
    if d["face"] == "clean":
        return
    color = d["hair"][1] if d["face"] != "light_beard" else d["skin"][1]
    if d["face"] == "calm":
        rect(draw, 52 + sx, 110 + bob, 25, 3, d["skin"][1])
        return
    if d["face"] == "stubble":
        color = d["skin"][1]
    rect(draw, 50 + sx, 109 + bob, 29, 5, color)
    rect(draw, 46 + sx, 101 + bob, 8, 5, color)
    rect(draw, 76 + sx, 101 + bob, 8, 5, color)
    if d["face"] == "beard":
        rect(draw, 43 + sx, 96 + bob, 7, 15, color)
        rect(draw, 82 + sx, 96 + bob, 7, 15, color)
        rect(draw, 54 + sx, 113 + bob, 21, 5, d["hair"][2])
    elif d["face"] == "stubble":
        rect(draw, 54 + sx, 114 + bob, 20, 2, d["skin"][0])


def draw_expression_props(draw, d, direction, expression, frame, bob):
    if expression == "eat":
        x = 93 if direction != "right" else 20
        rect(draw, x, 88 + bob, 14, 14, d["accent2"])
        rect(draw, x + 5, 82 + bob, 4, 4, "#ffffff")
    elif expression == "celebrate":
        rect(draw, 96, 69 + bob - frame % 2, 9, 32, d["skin"][2])
        rect(draw, 95, 62 + bob - frame % 2, 13, 9, d["skin"][3])
        rect(draw, 101, 53 + bob - frame % 2, 4, 12, d["skin"][3])
        rect(draw, 17, 72 + bob + frame % 2, 10, 10, d["accent2"])
        rect(draw, 21, 66 + bob + frame % 2, 2, 22, "#ffffff")
        rect(draw, 11, 76 + bob + frame % 2, 22, 2, "#ffffff")
    elif expression == "tired":
        rect(draw, 98, 49, 12, 4, "#8aa0b4")
        rect(draw, 102, 53, 8, 4, "#8aa0b4")
        rect(draw, 106, 57, 4, 4, "#8aa0b4")


def draw_driver_signature(draw, driver_id, d, sx, bob):
    if driver_id == "verstappen":
        rect(draw, 38 + sx, 61 + bob, 8, 3, d["skin"][1])
        rect(draw, 82 + sx, 61 + bob, 8, 3, d["skin"][1])
    elif driver_id == "hamilton":
        rect(draw, 54 + sx, 116 + bob, 22, 5, d["hair"][0])
        rect(draw, 59 + sx, 101 + bob, 11, 4, d["hair"][2])
    elif driver_id == "norris":
        rect(draw, 55 + sx, 100 + bob, 20, 3, "#c74f5d")
    elif driver_id == "russell":
        rect(draw, 44 + sx, 58 + bob, 42, 3, d["skin"][3])
    elif driver_id == "alonso":
        rect(draw, 39 + sx, 63 + bob, 52, 4, d["hair"][0])
        rect(draw, 55 + sx, 113 + bob, 19, 5, d["hair"][0])
    elif driver_id == "piastri":
        rect(draw, 50 + sx, 101 + bob, 28, 2, "#b8505b")


def draw_frame(driver_id, d, expression, direction, frame):
    image = Image.new("RGBA", (FRAME_W, FRAME_H), (0, 0, 0, 0))
    draw = ImageDraw.Draw(image, "RGBA")
    bob = -2 if expression == "idle" and frame in (2, 3) else 0
    if expression == "tired":
        bob = 2

    draw_background(draw, d)
    draw_shoulders(draw, d, bob)
    draw_face(draw, driver_id, d, direction, expression, frame, bob)
    draw_expression_props(draw, d, direction, expression, frame, bob)
    return image


def generate():
    OUT.mkdir(parents=True, exist_ok=True)
    FRAME_OUT.mkdir(parents=True, exist_ok=True)
    for driver_id, data in DRIVERS.items():
        sheet = Image.new("RGBA", (SHEET_W, SHEET_H), (0, 0, 0, 0))
        for expr_index, expression in enumerate(EXPRESSIONS):
            for dir_index, direction in enumerate(DIRECTIONS):
                row = expr_index * len(DIRECTIONS) + dir_index
                for frame in range(ANIM_FRAMES):
                    frame_image = draw_frame(driver_id, data, expression, direction, frame)
                    frame_image.save(FRAME_OUT / f"{driver_id}_{expression}_{direction}_{frame}.png")
                    sheet.alpha_composite(frame_image, (frame * FRAME_W, row * FRAME_H))
        path = OUT / f"{driver_id}.png"
        sheet.save(path)
        print(path)


if __name__ == "__main__":
    generate()
