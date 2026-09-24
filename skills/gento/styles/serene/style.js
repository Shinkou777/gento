/* 幻燈 GENTO · 风格包：岁月静好（serene）
   暖光、柔和色、胶片颗粒、漏光、浮尘；字从模糊里慢慢浮上来；枝叶、茶杯热气、窗光。 */
const STYLE = defineStyle({
  id: 'serene',
  palettes: {
    sage:    { bg: '#F3EEE3', bg2: '#E9E2D2', fg: '#3F4A3C', muted: '#9A9A88', a1: '#C9785B', a2: '#8FA58A', a3: '#EBC98B', dark: '#2F3A33', onDark: '#F3EEE3', line: '#4B5548', white: '#FBF8F1', panelFg: '#3F4A3C', shadow: 'rgba(80,70,40,.14)', skin: '#F0D2B6', coat: '#8FA58A', hair: '#5A4A3E', onA1: '#FBF8F1', onA2: '#FBF8F1', onA3: '#3F4A3C', lightA2: true, flash: '#FFF9EC', scrim: 'rgba(60,55,45,.35)' },
    apricot: { bg: '#FBEFE3', bg2: '#F5E2CF', fg: '#5A3E33', muted: '#B09383', a1: '#E07A5F', a2: '#F2A873', a3: '#F6D49A', dark: '#4A3129', onDark: '#FBEFE3', line: '#6B4B3E', white: '#FFF8F0', panelFg: '#5A3E33', shadow: 'rgba(110,70,40,.14)', skin: '#F4D0B4', coat: '#E07A5F', hair: '#6B4B3E', onA1: '#FFF8F0', onA2: '#5A3E33', onA3: '#5A3E33', lightA2: true, flash: '#FFF6EA', scrim: 'rgba(80,50,40,.35)' },
    mist:    { bg: '#EEF2F3', bg2: '#E1E8EA', fg: '#33475B', muted: '#8C9CAA', a1: '#6E8FB3', a2: '#A9BCC9', a3: '#E6D3B1', dark: '#26374A', onDark: '#EEF2F3', line: '#3F5366', white: '#F9FBFB', panelFg: '#33475B', shadow: 'rgba(40,60,80,.14)', skin: '#F0D5C0', coat: '#6E8FB3', hair: '#3F5366', onA1: '#F9FBFB', onA2: '#33475B', onA3: '#33475B', lightA2: true, flash: '#FFFFFF', scrim: 'rgba(40,55,70,.35)' },
  },
  fonts: {
    zh: { head: { f: '"Noto Serif SC","Songti SC",serif', w: 500, ls: .06, also: [700] }, body: { f: '"Noto Serif SC",serif', w: 500, also: [700] }, shout: { f: '"Long Cang","Noto Serif SC",serif', w: 400 }, latin: { f: '"Cormorant Garamond","Noto Serif SC",serif', w: 500, st: 'italic' }, mono: { f: '"IBM Plex Mono","Noto Serif SC",monospace', w: 400 } },
    ja: { head: { f: '"Zen Old Mincho","Hiragino Mincho ProN",serif', w: 500, ls: .06, also: [700] }, body: { f: '"Zen Old Mincho",serif', w: 500 }, shout: { f: '"Klee One","Zen Old Mincho",serif', w: 600 }, latin: { f: '"Cormorant Garamond","Zen Old Mincho",serif', w: 500, st: 'italic' }, mono: { f: '"IBM Plex Mono","Zen Old Mincho",monospace', w: 400 } },
    en: { head: { f: '"Noto Serif",Georgia,serif', w: 500, ls: .02 }, body: { f: '"Noto Serif",Georgia,serif', w: 500 }, shout: { f: '"Cormorant Garamond",serif', w: 500, st: 'italic' }, latin: { f: '"Cormorant Garamond",serif', w: 500, st: 'italic' }, mono: { f: '"IBM Plex Mono",monospace', w: 400 } },
  },
  lw: .55, plates: false, voidTol: .38, takeLabel: 'scene',
  motion: { soft: true, hitLen: .6, shake: 0, jitter: 0, push: .045, cutLen: .45 },
  fadeTo: () => C.bg,

  textures() {
    const R = rng(13); this.grain = [];
    for (let k = 0; k < 4; k++) { const c = cnv(W / 2, H / 2), q = c.getContext('2d'), im = q.createImageData(c.width, c.height), dd = im.data; for (let i = 0; i < dd.length; i += 4) { const v = 128 + (R() - .5) * 110; dd[i] = dd[i + 1] = dd[i + 2] = v; dd[i + 3] = 255; } q.putImageData(im, 0, 0); this.grain.push(c); }
    this.bokeh = Array.from({ length: 14 }, (_, i) => [R(), R(), 30 + R() * 110, R()]);
    this.dust = Array.from({ length: 50 }, () => [R(), R(), .5 + R() * 1.8, R()]);
  },
  bg(ctx, u, d, t, o = {}) {
    const tn = o.tone || 'base';
    field(ctx, tone(tn));
    const dark = tn === 'dark';
    const i = o.deco ?? 0, cx = WIDE ? W * (.78 - (i % 2) * .06) : W * .7, cy = WIDE ? H * .22 : H * .62, R = Math.max(W, H) * .62;
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, R); g.addColorStop(0, C.a3 + (dark ? '40' : 'c0')); g.addColorStop(.45, C.a3 + (dark ? '14' : '40')); g.addColorStop(1, C.a3 + '00');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.save(); ctx.globalCompositeOperation = dark ? 'screen' : 'soft-light';
    for (const [bx, by, br, ph] of this.bokeh) { const x = ((bx * W + t * 12 * (ph - .5)) % W + W) % W, y = by * H + Math.sin(t * .4 + ph * 6) * 20; const gg = ctx.createRadialGradient(x, y, 0, x, y, br * U); gg.addColorStop(0, 'rgba(255,250,235,.55)'); gg.addColorStop(1, 'rgba(255,250,235,0)'); ctx.fillStyle = gg; ctx.fillRect(x - br * U, y - br * U, br * 2 * U, br * 2 * U); }
    ctx.restore();
  },
  post(ctx, t) {
    ctx.globalCompositeOperation = 'soft-light'; ctx.globalAlpha = .22; ctx.drawImage(this.grain[Math.floor(t * 24) % 4], 0, 0, W, H);
    // 漏光：边上一团暖色慢慢游
    ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = 1;
    const lx = W * (.5 + .55 * Math.sin(t * .13)), ly = H * (-.05 + .1 * Math.cos(t * .17)), lg = ctx.createRadialGradient(lx, ly, 0, lx, ly, Math.max(W, H) * .45);
    lg.addColorStop(0, C.a1 + '30'); lg.addColorStop(1, C.a1 + '00'); ctx.fillStyle = lg; ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'source-over';
    // 浮尘
    ctx.fillStyle = '#FFFFFF';
    for (const [dx, dy, r, ph] of this.dust) { const x = (dx * W + Math.sin(t * .3 + ph * 9) * 30) % W, y = ((dy * H - t * (8 + ph * 14)) % H + H) % H; ctx.globalAlpha = .25 + .35 * Math.sin(t * .8 + ph * 7) ** 2; ctx.beginPath(); ctx.arc(x, y, r * U, 0, 7); ctx.fill(); }
    ctx.globalAlpha = 1;
    const g = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * .45, W / 2, H / 2, Math.max(W, H) * .7);
    g.addColorStop(0, 'rgba(90,70,40,0)'); g.addColorStop(1, 'rgba(90,70,40,.16)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  },
  cut(ctx, k) { ctx.globalAlpha = .6 * eSine(k); ctx.fillStyle = C.flash; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; },
  shade(ctx, x, y, w, h) { const g = ctx.createLinearGradient(x, 0, x + w, 0); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(60,40,20,.14)'); ctx.fillStyle = g; ctx.fillRect(x, y, w, h); },
  cheek(ctx, x, y, w, h) { const g = ctx.createRadialGradient(x + 40, y + 70, 0, x + 40, y + 70, 50); g.addColorStop(0, C.a1 + '66'); g.addColorStop(1, C.a1 + '00'); ctx.fillStyle = g; ctx.fillRect(x - 30, y, 150, 150); },
  panelShadow(ctx, x, y, w, h, r = 28 * U) { ctx.save(); ctx.shadowColor = C.shadow; ctx.shadowBlur = 40 * U; ctx.shadowOffsetY = 14 * U; ctx.fillStyle = C.white; ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.fill(); ctx.restore(); },
  panel(ctx, x, y, w, h, o = {}) {
    const r = 28 * U; this.panelShadow(ctx, x, y, w, h, r);
    rr(ctx, x, y, w, h, r, o.fill || C.white);
    if (o.head) { text(ctx, o.head, x + 40 * U, y + 44 * U, { size: 30 * U, font: F.latin, align: 'left', color: C.muted, meta: true }); ctx.save(); ctx.globalAlpha = .25; ctx.fillStyle = C.fg; ctx.fillRect(x + 40 * U, y + 72 * U, 80 * U, 1.5 * U); ctx.restore(); }
    return { x: x + 44 * U, y: y + (o.head ? 96 : 40) * U, w: w - 88 * U, h: h - (o.head ? 130 : 80) * U };
  },
  title(ctx, s, x, y, o = {}) { text(ctx, s, x, y, { size: o.size || 120, font: o.font || F.head, align: o.align || 'left', color: o.color || C.fg, scale: o.scale, alpha: o.alpha, g: o.g }); },
  // 重击：从模糊里慢慢浮上来
  hit(ctx, s, x, y, u, t0, o = {}) {
    if (u < t0) return;
    const size = o.size || 220, k = eOut(P(u, t0, t0 + this.motion.hitLen * PACE.enter));
    ctx.save(); if (k < 1) ctx.filter = `blur(${((1 - k) * 12 * U).toFixed(1)}px)`;
    text(ctx, s, x, y + (1 - k) * size * .15, { size, font: o.font || F.head, align: o.align || 'left', color: o.color || C.a1, alpha: k, g: o.g });
    ctx.restore();
  },
  // 章：手写字 + 一圈手画的椭圆
  seal(ctx, s, x, y, k, o = {}) {
    if (k <= 0) return;
    const size = Math.min(o.size || 200, 220 * U), role = /^[\x00-\x7f]+$/.test(s) ? F.latin : F.head, fs = size * .72, w = tw(ctx, s, fs, role), col = o.color && o.color !== C.a3 ? o.color : C.a1;
    const kt = eOut(P(k, 0, .6)), kc = eOut(P(k, .3, 1));
    ctx.save(); if (kt < 1) ctx.filter = `blur(${((1 - kt) * 8 * U).toFixed(1)}px)`;
    text(ctx, s, x, y, { size: fs, font: role, color: col, alpha: kt, rot: (o.rot ?? -.05) * .5, g: 'seal' });
    ctx.restore();
    ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 3.5 * U; ctx.lineCap = 'round'; ctx.globalAlpha = .85;
    const rx = w * .62 + size * .2, ry = size * .62; ctx.beginPath();
    for (let a = 0; a <= Math.PI * 2.15 * kc; a += .05) { const px = x + Math.cos(a - 2.2) * rx * (1 + .04 * Math.sin(a * 3)), py = y + Math.sin(a - 2.2) * ry * (1 + .06 * Math.cos(a * 2)); a ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
    ctx.stroke(); ctx.restore();
    if (QA.on) QA.boxes.push({ s, x0: x - rx, y0: y - ry, x1: x + rx, y1: y + ry, px: size, a: 1, over: true, g: 'seal' });
  },
  // 强调：水彩一抹
  marker(ctx, x, y, w, h, k) {
    if (k <= 0) return;
    ctx.save(); ctx.globalCompositeOperation = 'multiply';
    for (let i = 0; i < 3; i++) { ctx.globalAlpha = .28; ctx.fillStyle = C.a3; ctx.beginPath(); ctx.roundRect(x - 6 * U + i * 3, y + h * (.45 + i * .06), (w + 12 * U) * k - i * 6, h * .5, h * .25); ctx.fill(); }
    ctx.restore();
  },
  caption(ctx, u, t0, t1, segs, o = {}) {
    if (u < t0 || u > t1) return;
    const size = o.size || 46 * U, role = o.font || F.body, pad = 44 * U;
    const w = segs.reduce((a, [s]) => a + tw(ctx, s, size, role), 0) + pad * 2, h = size + 44 * U, x = W / 2 - w / 2, y = (o.y ?? L.capY) - h / 2;
    const k = eOut(P(u, t0, t0 + .5)) * (1 - eIn(P(u, t1 - .4, t1)));
    ctx.save(); ctx.globalAlpha = k * .88; rr(ctx, x, y, w, h, h / 2, C.white); ctx.globalAlpha = k;
    rich(ctx, segs.map(([s, c]) => [s, c === C.a3 ? C.a1 : c || C.fg]), x + pad, y + h / 2 + 2, size, { font: role });
    ctx.restore();
  },
  wordCard(ctx, u, i, word, o = {}) {
    const tn = o.tone || ['base', 'alt', 'base', 'a2'][i % 4];
    this.bg(ctx, u, 0, u + i, { tone: tn, deco: i });
    const latin = /^[\x00-\x7f]+$/.test(word), role = latin ? F.latin : F.head;
    const size = fitText(ctx, word, W * .76, (latin ? 360 : 300) * U, role), k = eOut(P(u, 0, BT * .85));
    ctx.save(); if (k < 1) ctx.filter = `blur(${((1 - k) * 14 * U).toFixed(1)}px)`;
    text(ctx, word, W / 2, H / 2 + (1 - k) * 30 * U, { size, font: role, color: onTone(tn), alpha: k, g: 'wc' });
    ctx.restore();
  },
  chapter(ctx, u, d, t, o) {
    const tn = o.tone || ['base', 'alt', 'base', 'alt'][(o.n - 1) % 4], fg = onTone(tn);
    this.bg(ctx, u, d, t, { tone: tn, deco: o.n });
    const G = chapterGeom(.9), k = eOut(P(u, 0, BT * 1.2)), ns = G.ns;
    text(ctx, pad2(o.n), WIDE ? W * .74 : G.cx, (WIDE ? H * .5 : G.cy) + (1 - k) * 30 * U, { size: ns, font: F.latin, color: C.a2, alpha: .55 * k, g: 'num', bleed: true });
    const x0 = WIDE ? 150 * U : G.x0, y0 = WIDE ? 400 * U : G.y0;
    text(ctx, `${o.en || 'chapter'} ${o.n}`, x0, y0 - 100 * U, { size: 44 * U, font: F.latin, align: 'left', color: C.muted, alpha: k, meta: true });
    const ts = fitText(ctx, o.title, WIDE ? W * .5 : L.cw, 110 * U, F.head);
    this.hit(ctx, o.title, x0, y0 + 20 * U, u, .05, { size: ts, color: fg });
    ctx.save(); ctx.globalAlpha = .5 * k; ctx.fillStyle = C.a1; ctx.fillRect(x0, y0 + 110 * U, 120 * U * k, 2 * U); ctx.restore();
    text(ctx, o.tag, x0, y0 + 160 * U, { size: 30 * U, font: F.body, align: 'left', color: C.muted, alpha: P(u, BT * .5, BT), meta: true });
  },
  // HUD：只留一行细字
  hud(ctx, t, sc) {
    if (HUDCFG.off || sc.hud === false || !(sc.kind === 'content' || sc.hud === true)) return;
    const x = L.m * .6, lab = (sc.chapNow ? `${sc.chapNow.title}` : (HUDCFG.label || CFG.title));
    text(ctx, lab, x, 62 * U, { size: 26 * U, font: F.body, align: 'left', color: C.muted, meta: true });
    if (sc.date) text(ctx, sc.date, W - x, 62 * U, { size: 30 * U, font: F.latin, align: 'right', color: C.muted, meta: true });
  },
  bar(ctx, x, y, w, h, col) {
    ctx.save(); ctx.shadowColor = C.shadow; ctx.shadowBlur = 20 * U; ctx.shadowOffsetY = 8 * U; rr(ctx, x, y, w, h + 10 * U, [w / 2, w / 2, 0, 0], col); ctx.restore();
    const g = ctx.createLinearGradient(x, 0, x + w, 0); g.addColorStop(0, 'rgba(255,255,255,.25)'); g.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.roundRect(x, y, w, h, [w / 2, w / 2, 0, 0]); ctx.fill();
  },
  link(ctx, x0, y0, x1, y1, k, o = {}) {
    if (k <= 0) return;
    const mx = (x0 + x1) / 2, my = (y0 + y1) / 2 - Math.hypot(x1 - x0, y1 - y0) * .15;
    ctx.save(); ctx.strokeStyle = C.muted; ctx.lineWidth = 2.5 * U; ctx.setLineDash([2 * U, 9 * U]); ctx.lineCap = 'round'; ctx.beginPath();
    for (let s = 0; s <= k; s += .02) { const px = (1 - s) * (1 - s) * x0 + 2 * (1 - s) * s * mx + s * s * x1, py = (1 - s) * (1 - s) * y0 + 2 * (1 - s) * s * my + s * s * y1; s ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
    ctx.stroke(); ctx.restore();
    if (k > .95 && o.head !== false) circ(ctx, x1, y1, 5 * U, C.a1);
  },
  leaf(ctx, x, y, s, a, col) { ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(s * .5, -s * .35, s, 0); ctx.quadraticCurveTo(s * .5, s * .35, 0, 0); ctx.fillStyle = col; ctx.fill(); ctx.strokeStyle = 'rgba(0,0,0,.12)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(s * .9, 0); ctx.stroke(); ctx.restore(); },
  // 主视觉：枝叶 / 一杯热茶 / 窗光，轮换
  ornament(ctx, x, y, w, h, u, t, o = {}) {
    const S = Math.min(w, h), seed = o.seed || 0, kind = o.kind || ['branch', 'tea', 'window'][seed % 3];
    const k = i => o.quiet ? 1 : eOut(P(u, i * BT * .5, i * BT * .5 + BT * 1.5));
    const cx = x + w * .52, cy = y + h * .48;
    circ(ctx, cx + S * .12, cy - S * .12, S * .2 * k(0), C.a3 + 'cc');
    if (kind === 'branch') {
      const sway = Math.sin(t * .8) * .04, bx = x + w * .08, by = y + h * .95, ex = x + w * .9, ey = y + h * .12;
      ctx.save(); ctx.strokeStyle = C.line; ctx.lineWidth = 5 * U; ctx.lineCap = 'round'; ctx.globalAlpha = .75;
      ctx.beginPath(); const n = 40, pts = [];
      for (let i = 0; i <= n * k(0); i++) { const s = i / n, px = lerp(bx, ex, s) + Math.sin(s * 3) * w * .08, py = lerp(by, ey, s) - Math.sin(s * Math.PI) * h * .08 + Math.sin(t * .8 + s * 3) * 6 * s; pts.push([px, py, s]); i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
      ctx.stroke(); ctx.restore();
      pts.forEach(([px, py, s], i) => { if (i % 3 || i < 4) return; const kk = k(1 + s * 2), side = (i / 3) % 2 ? 1 : -1; if (kk <= 0) return; this.leaf(ctx, px, py, S * .16 * kk * (1 - s * .35), -1.1 + side * .9 + sway * 6 + Math.sin(t + i) * .06, i % 2 ? C.a2 : tint(C.a2, .78)); });
      for (let i = 0; i < 5; i++) { const ph = (t * .08 + hash(i + seed)) % 1; this.leaf(ctx, x + w * (.15 + .7 * hash(i + 3)) + Math.sin(ph * 8 + i) * 30 * U, y + ph * h, S * .05, ph * 6 + i, C.a1 + '99'); }
    } else if (kind === 'tea') {
      const cw = S * .46, chh = S * .32, bx = cx - cw / 2, by = cy + S * .02;
      ell(ctx, cx, by + chh + 10 * U, cw * .8, cw * .13, tint(C.bg2, .95), C.line, 2);
      ctx.save(); ctx.globalAlpha = k(0);
      ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx + cw, by); ctx.quadraticCurveTo(bx + cw, by + chh, cx + cw * .2, by + chh); ctx.lineTo(cx - cw * .2, by + chh); ctx.quadraticCurveTo(bx, by + chh, bx, by); ctx.closePath();
      ctx.fillStyle = C.white; ctx.fill(); ctx.lineWidth = 2.5 * U; ctx.strokeStyle = C.line; ctx.stroke();
      ctx.beginPath(); ctx.arc(bx + cw + 14 * U, by + chh * .38, chh * .22, -1.2, 1.2); ctx.stroke();
      ell(ctx, cx, by, cw / 2, cw * .09, C.a1 + 'aa', C.line, 2);
      ctx.restore();
      ctx.save(); ctx.strokeStyle = C.muted; ctx.lineWidth = 3 * U; ctx.lineCap = 'round';
      for (let j = 0; j < 3; j++) { ctx.globalAlpha = .45 * k(1); ctx.beginPath(); for (let s = 0; s <= 1; s += .04) { const px = cx + (j - 1) * cw * .22 + Math.sin(s * 7 + t * 1.6 + j) * 16 * U * s, py = by - 20 * U - s * S * .38; s ? ctx.lineTo(px, py) : ctx.moveTo(px, py); } ctx.stroke(); }
      ctx.restore();
    } else {
      const fw = S * .7, fh = S * .78, fx = cx - fw / 2, fy = cy - fh / 2;
      ctx.save(); ctx.globalAlpha = .35 * k(1); ctx.fillStyle = C.a3; ctx.beginPath(); ctx.moveTo(fx, fy + fh); ctx.lineTo(fx + fw, fy + fh); ctx.lineTo(fx + fw + w * .35, y + h); ctx.lineTo(fx - w * .05, y + h); ctx.closePath(); ctx.fill(); ctx.restore();
      ctx.save(); ctx.globalAlpha = k(0); rr(ctx, fx, fy, fw, fh, 8 * U, C.white + 'aa', C.line, 3);
      ctx.strokeStyle = C.line; ctx.lineWidth = 3 * U; ctx.beginPath(); ctx.moveTo(fx + fw / 2, fy); ctx.lineTo(fx + fw / 2, fy + fh); ctx.moveTo(fx, fy + fh / 2); ctx.lineTo(fx + fw, fy + fh / 2); ctx.stroke(); ctx.restore();
      for (let i = 0; i < 3; i++) this.leaf(ctx, fx + fw * (.1 + i * .3), fy + fh * .85, S * .12 * k(2), -1.3 - i * .2 + Math.sin(t + i) * .05, C.a2);
    }
  },
});
