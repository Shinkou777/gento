#!/usr/bin/env python3
"""幻燈 GENTO · 素材图处理：抠图、统一调色、裁切、限尺寸。

用法：
  python3 prep_art.py 输入.jpg 输出.png --cutout --grade marble --max 2200
  python3 prep_art.py 输入.jpg 输出.jpg --grade "#22201C,#6B3A26,#B5532E,#E3C9A6,#EFEBE3" --mix .15 --crop .1,.0,.9,1

--cutout   用 rembg 抠出主体（雕像、器物），输出带透明通道的 PNG，并裁到主体外框
--grade    渐变映射：按亮度从暗到亮映射到一组颜色。可写预设名（见 GRADES）或逗号分隔的色值
--mix      调色后再混回多少原色（0〜1），默认 0.12
--crop     先按比例裁切：x0,y0,x1,y1（0〜1）
--max      长边上限，默认 2400
--contrast 调色前的对比度，默认 1.08

依赖：Pillow、numpy；抠图另需 rembg（本机有 ~/.venvs/snscover 就用它的 python 跑）。
"""
import argparse, sys
from PIL import Image, ImageEnhance
import numpy as np

GRADES = {
    'marble':    ['#1E1B18', '#5A3322', '#A64E2C', '#D9B28C', '#F1ECE3'],
    'terracotta':['#140F0C', '#4A2415', '#A9502B', '#E08A55', '#F6E2C4'],
    'redfigure': ['#0E0A08', '#2A1C15', '#8C4A2A', '#D9824B', '#F2DDBE'],
    'sepia':     ['#17120E', '#4B3A2C', '#8E7457', '#CDB694', '#F4ECDD'],
    'ink':       ['#111111', '#3A3A3A', '#7A7A7A', '#C8C8C8', '#F5F5F2'],
}

def hex2rgb(h):
    h = h.strip().lstrip('#'); return [int(h[i:i + 2], 16) for i in (0, 2, 4)]

def grade(img, stops, mix=.12, contrast=1.08):
    rgb = img.convert('RGB')
    if contrast != 1: rgb = ImageEnhance.Contrast(rgb).enhance(contrast)
    a = np.asarray(rgb).astype(np.float32) / 255
    lum = (a[..., 0] * .2126 + a[..., 1] * .7152 + a[..., 2] * .0722)
    cols = np.array([hex2rgb(s) for s in stops], np.float32) / 255
    pos = np.linspace(0, 1, len(cols))
    out = np.stack([np.interp(lum, pos, cols[:, c]) for c in range(3)], -1)
    out = out * (1 - mix) + a * mix
    res = Image.fromarray((np.clip(out, 0, 1) * 255).astype(np.uint8), 'RGB')
    if img.mode == 'RGBA': res.putalpha(img.getchannel('A'))
    return res

def cutout(img):
    from rembg import remove, new_session
    s = new_session('isnet-general-use')
    out = remove(img.convert('RGB'), session=s, post_process_mask=True)
    bbox = out.getchannel('A').point(lambda v: 255 if v > 24 else 0).getbbox()
    if bbox:
        pad = int(max(out.size) * .02)
        bbox = (max(0, bbox[0] - pad), max(0, bbox[1] - pad), min(out.width, bbox[2] + pad), min(out.height, bbox[3] + pad))
        out = out.crop(bbox)
    return out

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('src'); ap.add_argument('dst')
    ap.add_argument('--cutout', action='store_true')
    ap.add_argument('--grade'); ap.add_argument('--mix', type=float, default=.12)
    ap.add_argument('--crop'); ap.add_argument('--max', type=int, default=2400)
    ap.add_argument('--contrast', type=float, default=1.08)
    o = ap.parse_args()
    img = Image.open(o.src); img.load()
    img = img.convert('RGBA') if img.mode in ('RGBA', 'LA', 'P') else img.convert('RGB')
    if o.crop:
        x0, y0, x1, y1 = [float(v) for v in o.crop.split(',')]
        img = img.crop((int(x0 * img.width), int(y0 * img.height), int(x1 * img.width), int(y1 * img.height)))
    if max(img.size) > o.max * 1.4: img.thumbnail((int(o.max * 1.4), int(o.max * 1.4)), Image.LANCZOS)
    if o.cutout: img = cutout(img)
    if o.grade: img = grade(img, GRADES.get(o.grade) or o.grade.split(','), o.mix, o.contrast)
    img.thumbnail((o.max, o.max), Image.LANCZOS)
    if o.dst.lower().endswith(('.jpg', '.jpeg')): img.convert('RGB').save(o.dst, quality=84, optimize=True, progressive=True)
    else: img.save(o.dst, optimize=True)
    print(f'{o.dst}  {img.size[0]}×{img.size[1]}  {img.mode}')

if __name__ == '__main__':
    main()
