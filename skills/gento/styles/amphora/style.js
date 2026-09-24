/* 幻燈 GENTO · 风格包：希腊陶瓶（amphora）
   黑绘 / 红绘陶瓶与大理石：回纹边、月桂、双耳陶瓶主视觉、柱式柱状图、罗马大写衬线字。 */
const STYLE = defineStyle({
  id: 'amphora',
  palettes: {
    terracotta: { bg: '#C8693A', bg2: '#B85A2E', fg: '#1A1410', muted: '#5E2E18', a1: '#1A1410', a2: '#F2E3C6', a3: '#F0B55A', dark: '#1A1410', onDark: '#E9A26F', line: '#1A1410', white: '#F2E3C6', panelFg: '#1A1410', shadow: 'rgba(26,20,16,.35)', skin: '#1A1410', coat: '#1A1410', hair: '#1A1410', onA1: '#F2E3C6', onA2: '#1A1410', onA3: '#1A1410', lightA2: true, vase: '#D98050', glaze: '#1A1410', flash: '#F2E3C6', scrim: 'rgba(26,20,16,.5)' },
    redfigure:  { bg: '#16110E', bg2: '#221A15', fg: '#E9D6B8', muted: '#9A6A48', a1: '#D9824B', a2: '#E9D6B8', a3: '#E8B04A', dark: '#0C0907', onDark: '#E9D6B8', line: '#D9824B', white: '#241B16', panelFg: '#E9D6B8', shadow: 'rgba(0,0,0,.5)', skin: '#D9824B', coat: '#D9824B', hair: '#16110E', onA1: '#16110E', onA2: '#16110E', onA3: '#16110E', lightA2: true, vase: '#D9824B', glaze: '#16110E', flash: '#D9824B', scrim: 'rgba(0,0,0,.6)' },
    marble:     { bg: '#EFEBE3', bg2: '#E2DCD0', fg: '#22201C', muted: '#8C857A', a1: '#B5532E', a2: '#22201C', a3: '#B8913E', dark: '#22201C', onDark: '#EFEBE3', line: '#22201C', white: '#F8F6F1', panelFg: '#22201C', shadow: 'rgba(34,32,28,.18)', skin: '#D9A27A', coat: '#B5532E', hair: '#22201C', onA1: '#F8F6F1', onA2: '#EFEBE3', onA3: '#22201C', vase: '#C8693A', glaze: '#1E1712', flash: '#F8F6F1', scrim: 'rgba(34,32,28,.45)' },
  },
  fonts: {
    zh: { head: { f: '"Noto Serif SC","Songti SC",serif', w: 900 }, body: { f: '"Noto Serif SC",serif', w: 700, also: [500] }, shout: { f: '"Noto Serif SC",serif', w: 900 }, latin: { f: '"Cinzel","Noto Serif","Noto Serif SC",serif', w: 700, ls: .06 }, mono: { f: '"IBM Plex Mono","Noto Serif SC",monospace', w: 500 }, sub: { f: '"Noto Serif SC",serif', w: 500 } },
    ja: { head: { f: '"Noto Serif JP","Hiragino Mincho ProN",serif', w: 900 }, body: { f: '"Noto Serif JP",serif', w: 700, also: [500] }, shout: { f: '"Noto Serif JP",serif', w: 900 }, latin: { f: '"Cinzel","Noto Serif","Noto Serif JP",serif', w: 700, ls: .06 }, mono: { f: '"IBM Plex Mono","Noto Serif JP",monospace', w: 500 }, sub: { f: '"Noto Serif JP",serif', w: 500 } },
    en: { head: { f: '"Cinzel","Noto Serif",serif', w: 700, ls: .04 }, body: { f: '"Cormorant Garamond","Noto Serif",serif', w: 700, also: [600] }, shout: { f: '"Cinzel","Noto Serif",serif', w: 900, ls: .04 }, latin: { f: '"Cinzel","Noto Serif",serif', w: 700, ls: .06 }, mono: { f: '"IBM Plex Mono","Noto Serif",monospace', w: 500 }, sub: { f: '"Cormorant Garamond","Noto Serif",serif', w: 600 } },
  },
  lw: .7, plates: false, voidTol: .28, takeLabel: 'TABULA',
  motion: { hitFrom: 1.1, hitLen: .2, shake: .5, jitter: 0, push: .025, cutLen: .14 },

  textures() {
    const R = rng(17);
    // 陶土：斑驳 + 小颗粒
    this.clay = cnv(W / 3, H / 3); let g = this.clay.getContext('2d'); const im = g.createImageData(this.clay.width, this.clay.height), dd = im.data;
    for (let y = 0; y < this.clay.height; y++) for (let x = 0; x < this.clay.width; x++) { const i = (y * this.clay.width + x) * 4, v = 128 + (Math.sin(x * .05 + Math.sin(y * .07) * 2) + Math.sin(y * .043 + x * .011)) * 14 + (R() - .5) * 40; dd[i] = dd[i + 1] = dd[i + 2] = v; dd[i + 3] = 255; }
    g.putImageData(im, 0, 0);
    // 大理石：几道灰色纹理
    this.veins = cnv(W, H); g = this.veins.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, W, H); g.lineCap = 'round';
    for (let i = 0; i < 14; i++) {
      let x = R() * W, y = R() * H, a = R() * Math.PI * 2; const w0 = .6 + R() * 2.2;
      g.strokeStyle = `rgba(120,112,100,${.06 + R() * .12})`; g.lineWidth = w0; g.beginPath(); g.moveTo(x, y);
      for (let j = 0; j < 40; j++) { a += (R() - .5) * .6; x += Math.cos(a) * 30; y += Math.sin(a) * 30; g.lineTo(x, y); }
      g.stroke();
    }
    for (let i = 0; i < 30; i++) { const x = R() * W, y = R() * H, r = 60 + R() * 260, gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, `rgba(160,150,135,${.03 + R() * .04})`); gr.addColorStop(1, 'rgba(160,150,135,0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r); }
  },
  // 回纹：一格一个钩，下沿连成一条线；k 为画到的进度
  meander(ctx, x0, y, w, h, col, k = 1) {
    if (k <= 0) return;
    const s = h, n = Math.floor(w / s), off = (w - n * s) / 2, m = Math.ceil(n * clamp(k));
    ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = Math.max(1.5, s * .11); ctx.lineJoin = 'miter'; ctx.lineCap = 'square';
    ctx.beginPath();
    for (let i = 0; i < m; i++) { const x = x0 + off + i * s; ctx.moveTo(x, y + s); ctx.lineTo(x, y); ctx.lineTo(x + s * .8, y); ctx.lineTo(x + s * .8, y + s * .62); ctx.lineTo(x + s * .4, y + s * .62); ctx.lineTo(x + s * .4, y + s * .3); }
    ctx.moveTo(x0 + off, y + s); ctx.lineTo(x0 + off + m * s, y + s); ctx.stroke();
    ctx.lineWidth = Math.max(1, s * .06); ctx.beginPath(); ctx.moveTo(x0 + off, y - s * .35); ctx.lineTo(x0 + off + m * s, y - s * .35); ctx.moveTo(x0 + off, y + s * 1.35); ctx.lineTo(x0 + off + m * s, y + s * 1.35); ctx.stroke();
    ctx.restore();
  },
  // 月桂枝：沿弧线排叶子。side=1 往外长
  laurel(ctx, cx, cy, r, a0, a1, k, col, leaf = 1) {
    if (k <= 0) return;
    const n = 11, aEnd = lerp(a0, a1, clamp(k));
    ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 3 * U; ctx.beginPath(); ctx.arc(cx, cy, r, a0, aEnd, a1 < a0); ctx.stroke();
    for (let i = 0; i < n; i++) {
      const f = i / (n - 1), a = lerp(a0, a1, f); if ((a1 > a0 && a > aEnd) || (a1 < a0 && a < aEnd)) break;
      const px = cx + Math.cos(a) * r, py = cy + Math.sin(a) * r, tang = a + (a1 > a0 ? Math.PI / 2 : -Math.PI / 2), s = r * .16 * leaf * (1 - f * .35);
      for (const side of [-1, 1]) { ctx.save(); ctx.translate(px, py); ctx.rotate(tang + side * .55); ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(s * .5, -s * .3, s, 0); ctx.quadraticCurveTo(s * .5, s * .3, 0, 0); ctx.fillStyle = col; ctx.fill(); ctx.restore(); }
    }
    ctx.restore();
  },
  bands(ctx, col, k = 1) { const h = 18 * U; this.meander(ctx, 0, 14 * U, W, h, col, k); this.meander(ctx, 0, H - 14 * U - h, W, h, col, k); },
  bg(ctx, u, d, t, o = {}) {
    const tn = o.tone || 'base';
    field(ctx, tone(tn));
    const col = tn === 'base' || tn === 'alt' ? (CFG.palette === 'marble' ? C.a1 : C.line) : tn === 'dark' ? C.a1 === C.line ? C.onDark : C.a1 : C.onA1;
    ctx.save(); ctx.globalAlpha = .85; this.bands(ctx, col, o.poster ? eOut(P(u, 0, .6)) : 1); ctx.restore();
  },
  post(ctx, t) {
    if (CFG.palette === 'marble') { ctx.globalCompositeOperation = 'multiply'; ctx.drawImage(this.veins, 0, 0); }
    else { ctx.globalCompositeOperation = 'soft-light'; ctx.globalAlpha = .45; ctx.drawImage(this.clay, 0, 0, W, H); }
    ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
    const dark = hexLum(C.bg) < .2, g = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * .45, W / 2, H / 2, Math.max(W, H) * .68);
    g.addColorStop(0, 'rgba(60,35,15,0)'); g.addColorStop(1, dark ? 'rgba(0,0,0,.45)' : 'rgba(60,35,15,.22)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  },
  cut(ctx, k) { ctx.globalAlpha = .7 * k; ctx.fillStyle = C.flash; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; },
  shade(ctx, x, y, w, h) { ctx.save(); ctx.globalAlpha = .3; ctx.fillStyle = hatch(ctx, C.line, 8, 1.4, 60); ctx.fillRect(x, y, w, h); ctx.restore(); },
  cheek() {},
  panelShadow(ctx, x, y, w, h, r = 0) { ctx.fillStyle = C.shadow; ctx.fillRect(x + 10 * U, y + 10 * U, w, h); },
  panel(ctx, x, y, w, h, o = {}) {
    this.panelShadow(ctx, x, y, w, h);
    ctx.fillStyle = o.fill || C.white; ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = C.line; ctx.lineWidth = 2.5 * U; ctx.strokeRect(x, y, w, h); ctx.lineWidth = 1 * U; ctx.strokeRect(x + 8 * U, y + 8 * U, w - 16 * U, h - 16 * U);
    if (o.head) {
      ctx.fillStyle = C.line; ctx.fillRect(x + 8 * U, y + 8 * U, w - 16 * U, 48 * U);
      text(ctx, o.head, x + 28 * U, y + 33 * U, { size: 24 * U, font: F.latin, align: 'left', color: C.white, meta: true });
      const hw = tw(ctx, o.head, 24 * U, F.latin); this.meander(ctx, x + 50 * U + hw, y + 24 * U, w - 80 * U - hw, 16 * U, C.white);
    }
    return { x: x + 40 * U, y: y + (o.head ? 84 : 36) * U, w: w - 80 * U, h: h - (o.head ? 116 : 72) * U };
  },
  title(ctx, s, x, y, o = {}) { text(ctx, s, x, y, { size: o.size || 120, font: o.font || F.head, align: o.align || 'left', color: o.color || C.fg, scale: o.scale, alpha: o.alpha, g: o.g }); },
  // 重击：像描在陶面上，从左往右显影，下面一道金线
  hit(ctx, s, x, y, u, t0, o = {}) {
    if (u < t0) return;
    const size = o.size || 220, role = o.font || F.head, al = o.align || 'left', k = eOut(P(u, t0, t0 + .32 * PACE.enter));
    const w = tw(ctx, s, size, role), x0 = al === 'left' ? x : al === 'right' ? x - w : x - w / 2;
    ctx.save(); ctx.beginPath(); ctx.rect(x0 - 30 * U, y - size, (w + 60 * U) * k, size * 2); ctx.clip();
    text(ctx, s, x, y, { size, font: role, align: al, color: o.color || C.a1, scale: lerp(1.05, 1, k), g: o.g });
    ctx.restore();
    ctx.fillStyle = C.a3; ctx.fillRect(x0, y + size * .5, w * eOut(P(u, t0 + .15, t0 + .5)), Math.max(2, 3 * U));
  },
  // 章：一枚金币，外圈连珠
  seal(ctx, s, x, y, k, o = {}) {
    if (k <= 0) return;
    const size = Math.min(o.size || 200, 230 * U), r = size * .8, role = /^[\x00-\x7f]+$/.test(s) ? F.latin : F.head, fs = fitText(ctx, s, r * 1.45, size * .42, role), sc = eBack(clamp(k));
    ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc); ctx.rotate((o.rot ?? -.06) * .5);
    circ(ctx, 6 * U, 8 * U, r, C.shadow); circ(ctx, 0, 0, r, C.a3, C.line, 3);
    ctx.lineWidth = 1.5 * U; ctx.strokeStyle = C.line; ctx.beginPath(); ctx.arc(0, 0, r * .82, 0, 7); ctx.stroke();
    for (let i = 0; i < 36; i++) { const a = i / 36 * Math.PI * 2; circ(ctx, Math.cos(a) * r * .91, Math.sin(a) * r * .91, r * .025, C.line); }
    ctx.restore();
    text(ctx, s, x, y + size * .02, { size: fs * sc, font: role, color: C.onA3, rot: (o.rot ?? -.06) * .5, g: 'seal' });
    if (QA.on) QA.boxes.push({ s, x0: x - r * .8, y0: y - r * .8, x1: x + r * .8, y1: y + r * .8, px: size, a: 1, g: 'seal' });
  },
  // 强调：一粗一细两道横线
  marker(ctx, x, y, w, h, k) { if (k <= 0) return; ctx.fillStyle = C.a1 === C.fg ? C.a3 : C.a1; ctx.fillRect(x + 6 * U, y + h - 9 * U, (w - 12 * U) * k, 5 * U); ctx.fillRect(x + 6 * U, y + h - 1 * U, (w - 12 * U) * k, 1.5 * U); },
  wordCard(ctx, u, i, word, o = {}) {
    const tn = o.tone || ['base', 'dark', 'a1', 'alt'][i % 4];
    field(ctx, tone(tn));
    const col = tn === 'base' || tn === 'alt' ? (CFG.palette === 'marble' ? C.a1 : C.line) : tn === 'dark' ? (C.a1 === C.line ? C.onDark : C.a1) : C.onA1;
    ctx.save(); ctx.globalAlpha = .85; this.bands(ctx, col, eOut(P(u, 0, .4))); ctx.restore();
    const latin = /^[\x00-\x7f]+$/.test(word), role = latin ? F.latin : F.head;
    const size = fitText(ctx, word, W * .62, (latin ? 300 : 320) * U, role), k = eOut(P(u, 0, .25)), fg = tn === 'base' || tn === 'alt' ? C.fg : tn === 'dark' ? C.onDark : C.onA1;
    const r = Math.min(W, H) * .4;
    this.laurel(ctx, W / 2, H / 2 + r * .15, r, Math.PI * .72, Math.PI * 1.32, eOut(P(u, 0, .35)), col);
    this.laurel(ctx, W / 2, H / 2 + r * .15, r, Math.PI * .28, -Math.PI * .32, eOut(P(u, 0, .35)), col);
    text(ctx, word, W / 2, H / 2, { size, font: role, color: fg, alpha: k, scale: lerp(1.08, 1, k), g: 'wc' });
  },
  chapter(ctx, u, d, t, o) {
    const tn = o.tone || ['dark', 'a1', 'dark', 'alt'][(o.n - 1) % 4], G = chapterGeom(.9), fg = onTone(tn);
    field(ctx, tone(tn));
    const col = tn === 'dark' ? (C.a1 === C.line ? C.onDark : C.a1) : tn === 'a1' ? C.onA1 : C.a1;
    ctx.save(); ctx.globalAlpha = .85; this.bands(ctx, col, eOut(P(u, 0, .4))); ctx.restore();
    const RN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'][o.n] || String(o.n), k = eOut(P(u, 0, .3));
    const ns = Math.min(G.ns, (WIDE ? W * .36 : W * .7) / Math.max(1, tw(ctx, RN, 1, F.latin)));
    this.laurel(ctx, G.cx, G.cy + ns * .1, ns * .62, Math.PI * .75, Math.PI * 1.35, k, col, .8);
    this.laurel(ctx, G.cx, G.cy + ns * .1, ns * .62, Math.PI * .25, -Math.PI * .35, k, col, .8);
    text(ctx, RN, G.cx, G.cy, { size: ns, font: F.latin, color: col, alpha: k, scale: lerp(1.08, 1, k), g: 'num' });
    text(ctx, o.tag, G.x0, G.y0, { size: 120 * U, font: F.head, align: 'left', color: fg, alpha: k });
    const ts = fitText(ctx, o.title, G.tw, 96 * U, F.head);
    this.hit(ctx, o.title, G.x0, G.y0 + 170 * U, u, .1, { size: ts, color: col });
    text(ctx, `${o.en || 'LIBER'} ${RN} / ${['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'][o.total] || o.total}`, G.x0, G.y0 + 290 * U, { size: 26 * U, font: F.mono, align: 'left', color: fg, alpha: .8 * P(u, .15, .3), meta: true });
  },
  // 柱状图：一根根希腊柱，柱身带凹槽
  bar(ctx, x, y, w, h, col) {
    if (h < 30 * U) { ctx.fillStyle = col; ctx.fillRect(x, y, w, h); return; }
    const cap = Math.min(h * .12, w * .28), baseH = Math.min(h * .08, w * .2);
    ctx.fillStyle = col; ctx.fillRect(x - w * .1, y, w * 1.2, cap * .45); ctx.fillRect(x - w * .04, y + cap * .45, w * 1.08, cap * .55);
    ctx.fillRect(x + w * .06, y + cap, w * .88, h - cap - baseH);
    ctx.fillRect(x - w * .04, y + h - baseH, w * 1.08, baseH * .5); ctx.fillRect(x - w * .1, y + h - baseH * .5, w * 1.2, baseH * .5);
    ctx.save(); ctx.strokeStyle = hexLum(col) > .4 ? 'rgba(0,0,0,.25)' : 'rgba(255,255,255,.3)'; ctx.lineWidth = 2 * U;
    for (let i = 1; i < 6; i++) { const fx = x + w * .06 + i * w * .88 / 6; ctx.beginPath(); ctx.moveTo(fx, y + cap + 6 * U); ctx.lineTo(fx, y + h - baseH - 6 * U); ctx.stroke(); }
    ctx.restore();
  },
  link(ctx, x0, y0, x1, y1, k, o = {}) { arrow(ctx, x0, y0, x1, y1, k, { lw: 4, color: C.a1 === C.fg ? C.line : C.a1, head: o.head, hs: 18 }); },
  // 陶瓶：shape 0 双耳细颈瓶、1 宽腹水罐、2 大口混酒缸；letter 印在腹部的圆徽里
  vase(ctx, cx, base, h, shape, k, o = {}) {
    const S = [{ foot: .11, stem: .05, belly: .31, bellyY: .45, shoulder: .22, shY: .7, neck: .085, neckY: .8, rim: .14 },
               { foot: .13, stem: .07, belly: .36, bellyY: .38, shoulder: .3, shY: .62, neck: .1, neckY: .78, rim: .15 },
               { foot: .12, stem: .06, belly: .3, bellyY: .55, shoulder: .36, shY: .8, neck: .34, neckY: .88, rim: .4 }][shape % 3];
    const P_ = f => base - f * h;
    const outline = () => { ctx.beginPath(); ctx.moveTo(cx + S.rim * h, P_(1)); ctx.lineTo(cx - S.rim * h, P_(1)); ctx.lineTo(cx - S.rim * h, P_(.97)); ctx.lineTo(cx - S.neck * h, P_(.95));
      ctx.lineTo(cx - S.neck * h, P_(S.neckY)); ctx.bezierCurveTo(cx - S.neck * h, P_(S.neckY - .02), cx - S.neck * h * 1.2, P_(S.shY + .06), cx - S.shoulder * h, P_(S.shY));
      ctx.bezierCurveTo(cx - S.shoulder * h * 1.1, P_(S.shY - .05), cx - S.belly * h, P_(S.bellyY + .15), cx - S.belly * h, P_(S.bellyY));
      ctx.bezierCurveTo(cx - S.belly * h, P_(S.bellyY - .12), cx - S.belly * h * 1.05, P_(.14), cx - S.stem * h, P_(.08));
      ctx.lineTo(cx - S.foot * h * .8, P_(.04)); ctx.lineTo(cx - S.foot * h, base); ctx.lineTo(cx + S.foot * h, base); ctx.lineTo(cx + S.foot * h * .8, P_(.04)); ctx.lineTo(cx + S.stem * h, P_(.08));
      ctx.bezierCurveTo(cx + S.belly * h * 1.05, P_(.14), cx + S.belly * h, P_(S.bellyY - .12), cx + S.belly * h, P_(S.bellyY));
      ctx.bezierCurveTo(cx + S.belly * h, P_(S.bellyY + .15), cx + S.shoulder * h * 1.1, P_(S.shY - .05), cx + S.shoulder * h, P_(S.shY));
      ctx.bezierCurveTo(cx + S.neck * h * 1.2, P_(S.shY + .06), cx + S.neck * h, P_(S.neckY - .02), cx + S.neck * h, P_(S.neckY));
      ctx.lineTo(cx + S.neck * h, P_(.95)); ctx.lineTo(cx + S.rim * h, P_(.97)); ctx.closePath(); };
    ell(ctx, cx, base + 6 * U, S.belly * h * 1.1, h * .03, C.shadow);
    ctx.save(); ctx.beginPath(); ctx.rect(cx - h, base - h * 1.05 * clamp(k), 2 * h, h * 1.1); ctx.clip();
    // 把手
    if (shape !== 2) { ctx.strokeStyle = C.glaze; ctx.lineWidth = h * .028; ctx.lineCap = 'round'; for (const sx of shape === 1 ? [1] : [-1, 1]) { ctx.beginPath(); ctx.moveTo(cx + sx * S.shoulder * h * .9, P_(S.shY + .02)); ctx.bezierCurveTo(cx + sx * S.belly * h * 1.25, P_(S.shY + .02), cx + sx * S.belly * h * 1.1, P_(S.neckY + .1), cx + sx * S.neck * h, P_(S.neckY + .08)); ctx.stroke(); } }
    else { ctx.strokeStyle = C.glaze; ctx.lineWidth = h * .03; ctx.lineCap = 'round'; for (const sx of [-1, 1]) { ctx.beginPath(); ctx.moveTo(cx + sx * S.belly * h * .9, P_(S.bellyY + .02)); ctx.quadraticCurveTo(cx + sx * S.belly * h * 1.35, P_(S.bellyY + .12), cx + sx * S.belly * h * .95, P_(S.bellyY + .2)); ctx.stroke(); } }
    outline(); ctx.fillStyle = C.vase; ctx.fill();
    ctx.save(); outline(); ctx.clip();
    ctx.fillStyle = C.glaze; ctx.fillRect(cx - h, P_(.26), 2 * h, h * .1); ctx.fillRect(cx - h, P_(.03), 2 * h, h * .03);
    ctx.fillRect(cx - h, P_(1), 2 * h, h * (1 - S.neckY + .02));
    // 底部光芒纹
    for (let i = -6; i <= 6; i++) { const bx = cx + i * h * .05; ctx.beginPath(); ctx.moveTo(bx - h * .018, P_(.16)); ctx.lineTo(bx, P_(.24)); ctx.lineTo(bx + h * .018, P_(.16)); ctx.fill(); }
    ctx.fillRect(cx - h, P_(.165), 2 * h, h * .01);
    this.meander(ctx, cx - S.shoulder * h, P_(S.shY - .03), S.shoulder * h * 2, h * .045, C.glaze, k > .7 ? eOut(P(k, .7, 1)) : 0);
    const gl = ctx.createLinearGradient(cx - S.belly * h, 0, cx + S.belly * h, 0); gl.addColorStop(0, 'rgba(255,255,255,.18)'); gl.addColorStop(.35, 'rgba(255,255,255,0)'); gl.addColorStop(1, 'rgba(0,0,0,.25)');
    ctx.fillStyle = gl; ctx.fillRect(cx - h, base - h, 2 * h, h);
    ctx.restore();
    outline(); ctx.lineWidth = 2 * U; ctx.strokeStyle = C.glaze; ctx.stroke();
    ctx.restore();
    if (o.letter && k > .8) {
      const mk = eBack(P(k, .8, 1)), my = P_(S.bellyY + .02), mr = h * .1 * mk;
      circ(ctx, cx, my, mr, C.glaze); circ(ctx, cx, my, mr * .86, null, C.vase, 2);
      text(ctx, o.letter, cx, my + mr * .06, { size: mr * 1.15, font: F.latin, color: C.vase, g: 'vase', over: true });
    }
  },
  // 主视觉：陶瓶 + 两枝月桂
  ornament(ctx, x, y, w, h, u, t, o = {}) {
    const seed = o.seed || 0, S = Math.min(w, h), k = i => o.quiet ? 1 : eOut(P(u, i * BT * .5, i * BT * .5 + BT * 1.2));
    const vh = Math.min(h * .9, w * 1.25), cx = x + w / 2, base = y + h * .5 + vh * .48;
    const col = CFG.palette === 'marble' ? C.a3 : CFG.palette === 'terracotta' ? C.line : C.a1;
    this.laurel(ctx, cx, base - vh * .42, vh * .52, Math.PI * .62, Math.PI * 1.05, k(1), col, .9);
    this.laurel(ctx, cx, base - vh * .42, vh * .52, Math.PI * .38, -Math.PI * .05, k(1), col, .9);
    this.vase(ctx, cx, base, vh, o.shape ?? seed, k(0), o);
  },
});
