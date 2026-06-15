#!/usr/bin/env python3
"""Render 'Korean Family in USA' EP.1 as a vertical (9:16) subtitle video.
Silent v1 for visual/pacing feedback. Native voice is dubbed later (hybrid).
"""
import os, subprocess, textwrap as _tw
from PIL import Image, ImageDraw, ImageFont
import imageio_ffmpeg

W, H = 1080, 1920
FPS = 30
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUILD = os.path.join(ROOT, "build", "frames")
OUT = os.path.join(ROOT, "output", "ep1.mp4")
os.makedirs(BUILD, exist_ok=True)
os.makedirs(os.path.dirname(OUT), exist_ok=True)

FDIR = "/usr/share/fonts/truetype/nanum"
def F(name, size):
    return ImageFont.truetype(os.path.join(FDIR, name), size)

# fonts
f_label   = F("NanumSquareRoundB.ttf", 34)
f_name    = F("NanumSquareRoundB.ttf", 46)
f_en      = F("NanumSquareRoundB.ttf", 66)
f_ko      = F("NanumSquareRoundR.ttf", 46)
f_foot    = F("NanumSquareRoundR.ttf", 30)
f_title1  = F("NanumSquareRoundB.ttf", 70)
f_title2  = F("NanumSquareRoundB.ttf", 96)
f_set     = F("NanumSquareRoundR.ttf", 50)
f_reaphdr = F("NanumSquareRoundB.ttf", 72)
f_rea_en  = F("NanumSquareRoundB.ttf", 52)
f_rea_ko  = F("NanumSquareRoundR.ttf", 38)

# character palette: (accent, bg_top, bg_bottom, initial)
CHARS = {
    "Jenny": ((255, 122, 89),  (47, 28, 30),  (28, 18, 22),  "J", "이웃"),
    "Grace": ((46, 196, 182),  (20, 38, 40),  (14, 24, 28),  "G", "엄마"),
    "David": ((84, 150, 255),  (22, 30, 50),  (14, 20, 36),  "D", "아빠"),
    "Leo":   ((255, 193, 71),  (44, 36, 18),  (28, 24, 14),  "L", "아들"),
}

def vgrad(top, bottom):
    img = Image.new("RGB", (W, H), top)
    d = ImageDraw.Draw(img)
    for y in range(H):
        t = y / H
        c = tuple(int(top[i] + (bottom[i]-top[i])*t) for i in range(3))
        d.line([(0, y), (W, y)], fill=c)
    return img

def wrap(draw, text, font, max_w):
    words = text.split()
    lines, cur = [], ""
    for w in words:
        trial = (cur + " " + w).strip()
        if draw.textlength(trial, font=font) <= max_w:
            cur = trial
        else:
            if cur: lines.append(cur)
            cur = w
    if cur: lines.append(cur)
    return lines

def draw_center(draw, lines, font, cy, fill, lh):
    total = len(lines)*lh
    y = cy - total//2
    for ln in lines:
        w = draw.textlength(ln, font=font)
        draw.text((W//2 - w//2, y), ln, font=font, fill=fill)
        y += lh
    return y

def rounded_chip(draw, cx, y, text, font, accent):
    tw = draw.textlength(text, font=font)
    pad = 34
    bw = tw + pad*2
    x0 = cx - bw//2
    draw.rounded_rectangle([x0, y, x0+bw, y+78], radius=39, fill=accent)
    draw.text((cx - tw//2, y+14), text, font=font, fill=(20, 20, 24))

def avatar(draw, cx, cy, r, accent, initial):
    draw.ellipse([cx-r, cy-r, cx+r, cy+r], fill=accent)
    fa = F("NanumSquareRoundB.ttf", int(r*1.1))
    tw = draw.textlength(initial, font=fa)
    bb = fa.getbbox(initial)
    draw.text((cx-tw//2, cy-(bb[3]-bb[1])//2 - bb[1]), initial, font=fa, fill=(20,20,24))

def header(draw):
    draw.text((60, 56), "코리안 패밀리 in USA", font=f_label, fill=(150,150,160))
    draw.text((60, 100), "EP.1  The New Neighbor", font=f_label, fill=(110,110,120))

def footer(draw):
    t = "오늘의 영어 · Today's English"
    w = draw.textlength(t, font=f_foot)
    draw.text((W//2-w//2, H-70), t, font=f_foot, fill=(120,120,130))

frames = []  # (png_path, seconds)

def add(img, sec):
    p = os.path.join(BUILD, f"f{len(frames):03d}.png")
    img.save(p)
    frames.append((p, sec))

# ---- TITLE ----
img = vgrad((30, 34, 52), (12, 14, 24)); d = ImageDraw.Draw(img)
d.rounded_rectangle([90, 740, W-90, 1180], radius=40, outline=(90,100,140), width=3)
draw_center(d, ["코리안 패밀리"], f_title2, 880, (255,255,255), 110)
draw_center(d, ["in USA"], f_title2, 1000, (84,150,255), 110)
tt = "EP.1  새 이웃 · The New Neighbor"
w = d.textlength(tt, font=f_title1)
d.text((W//2-w//2, 1095), tt, font=f_title1, fill=(200,205,220))
footer(d); add(img, 3.0)

# ---- SETTING ----
img = vgrad((26, 30, 36), (14, 16, 20)); d = ImageDraw.Draw(img)
header(d)
draw_center(d, ["딩 — 동"], f_title1, 760, (255,193,71), 90)
draw_center(d, wrap(d, "이사 첫날, 짐을 정리하는데", f_set, 900), f_set, 920, (235,235,240), 70)
draw_center(d, wrap(d, "초인종이 울린다.", f_set, 900), f_set, 1000, (235,235,240), 70)
footer(d); add(img, 2.6)

# ---- DIALOGUE ----
DIALOG = [
    ("Jenny", "Hi there! I'm Jenny — I live right next door. Welcome to the neighborhood!",
              "안녕하세요! 저 제니예요, 바로 옆집 살아요. 이 동네에 오신 걸 환영해요!"),
    ("Grace", "Oh, hello! Thank you so much. I'm Grace. We just moved in yesterday.",
              "어머, 안녕하세요! 정말 감사해요. 저는 그레이스예요. 저희 어제 막 이사 왔어요."),
    ("Jenny", "I figured! I brought you some cookies — just a little something to say welcome.",
              "그럴 것 같았어요! 쿠키 좀 가져왔어요. 환영한다는 작은 성의예요."),
    ("Grace", "That's so sweet of you. Please, come on in — sorry it's such a mess.",
              "정말 친절하시네요. 어서 들어오세요. 어수선해서 죄송해요."),
    ("Jenny", "Oh, don't worry about it. Moving is always chaos.",
              "어머, 신경 쓰지 마세요. 이사는 원래 늘 정신없죠."),
    ("David", "Honey, where does this go — oh, hello!",
              "여보, 이건 어디다 놓지 — 어, 안녕하세요!"),
    ("Grace", "David, this is Jenny, our neighbor. She brought us cookies.",
              "데이빗, 이쪽은 이웃 제니 씨야. 우리한테 쿠키 가져다 주셨어."),
    ("David", "Wow, thank you. That's really kind. Nice to meet you.",
              "와, 감사합니다. 정말 친절하시네요. 만나서 반가워요."),
    ("Jenny", "Nice to meet you too! Hey — if you need anything, a good pizza place, the Wi-Fi guy, anything — just let me know.",
              "저도 반가워요! 혹시 필요한 거 있으면, 맛있는 피자집이든 인터넷 기사든 뭐든, 그냥 말씀하세요."),
    ("Leo",   "Mom! Is she our new friend?",
              "엄마! 이 분이 우리 새 친구예요?"),
    ("Jenny", "Aww, I sure am! What's your name, buddy?",
              "어머, 당연하지! 이름이 뭐니, 꼬마야?"),
    ("Leo",   "Leo!", "레오요!"),
    ("Jenny", "Well, Leo — welcome to the block.",
              "레오, 우리 동네에 온 걸 환영해."),
]

def dur(en, ko):
    s = len(en.split())*0.34 + len(ko)*0.05 + 1.4
    return max(2.8, min(6.2, s))

for spk, en, ko in DIALOG:
    accent, top, bot, ini, role = CHARS[spk]
    img = vgrad(top, bot); d = ImageDraw.Draw(img)
    header(d)
    # avatar + name chip
    avatar(d, W//2, 470, 96, accent, ini)
    rounded_chip(d, W//2, 600, f"{spk}  ·  {role}", f_name, accent)
    # english
    en_lines = wrap(d, en, f_en, 920)
    y = draw_center(d, en_lines, f_en, 1010, (255,255,255), 84)
    # divider
    d.line([(W//2-60, y+30), (W//2+60, y+30)], fill=accent, width=4)
    # korean
    ko_lines = wrap(d, ko, f_ko, 900)
    draw_center(d, ko_lines, f_ko, y+130, (200,205,215), 64)
    footer(d)
    add(img, dur(en, ko))

# ---- RECAP intro ----
img = vgrad((30, 34, 52), (12, 14, 24)); d = ImageDraw.Draw(img)
draw_center(d, ["오늘의 표현 5"], f_reaphdr, 900, (255,255,255), 90)
draw_center(d, ["Today's 5 Expressions"], f_rea_en, 1010, (84,150,255), 60)
footer(d); add(img, 2.4)

EXPR = [
    ("Welcome to the neighborhood!", "이 동네에 오신 걸 환영해요"),
    ("We just moved in.", "저희 막 이사 왔어요"),
    ("That's so sweet of you.", "정말 친절하시네요"),
    ("Don't worry about it.", "신경 쓰지 마세요"),
    ("Just let me know.", "그냥 말씀하세요"),
]
for i, (en, ko) in enumerate(EXPR, 1):
    img = vgrad((22, 26, 40), (12, 14, 22)); d = ImageDraw.Draw(img)
    header(d)
    accent = (84,150,255)
    d.ellipse([W//2-70, 560, W//2+70, 700], fill=accent)
    nb = f_reaphdr.getbbox(str(i))
    nw = d.textlength(str(i), font=f_reaphdr)
    d.text((W//2-nw//2, 630-(nb[3]-nb[1])//2-nb[1]), str(i), font=f_reaphdr, fill=(20,20,24))
    draw_center(d, wrap(d, en, f_rea_en, 940), f_rea_en, 900, (255,255,255), 66)
    draw_center(d, wrap(d, ko, f_ko, 900), f_ko, 1040, (200,205,215), 60)
    footer(d); add(img, 2.6)

# ---- OUTRO ----
img = vgrad((30, 34, 52), (12, 14, 24)); d = ImageDraw.Draw(img)
draw_center(d, ["다음 화에서 또 만나요!"], f_title1, 880, (255,255,255), 90)
draw_center(d, ["See you next time!"], f_rea_en, 1000, (200,205,220), 60)
footer(d); add(img, 2.4)

# ---- build concat + encode ----
concat = os.path.join(BUILD, "list.txt")
with open(concat, "w") as fh:
    for p, sec in frames:
        fh.write(f"file '{p}'\n")
        fh.write(f"duration {sec:.2f}\n")
    fh.write(f"file '{frames[-1][0]}'\n")  # last frame repeat (concat quirk)

ff = imageio_ffmpeg.get_ffmpeg_exe()
total = sum(s for _, s in frames)
cmd = [ff, "-y", "-f", "concat", "-safe", "0", "-i", concat,
       "-vf", f"fps={FPS},format=yuv420p,scale={W}:{H}",
       "-c:v", "libx264", "-preset", "medium", "-crf", "20",
       "-movflags", "+faststart", OUT]
print("scenes:", len(frames), "total sec:", round(total,1))
subprocess.run(cmd, check=True)
print("WROTE", OUT, os.path.getsize(OUT), "bytes")
