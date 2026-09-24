/* 幻燈 GENTO · 风格包：木版浮世绘（woodblock）
   和纸、靛蓝朱红、天空的晕染（ぼかし）、霞、青海波、朱印落款、套色轻微错位。 */
const STYLE = defineStyle({
  id: 'woodblock',
  palettes: {
    indigo: { bg: '#EFE3C8', bg2: '#E4D5B4', fg: '#1F2A44', muted: '#8C7B5E', a1: '#C2362B', a2: '#23407A', a3: '#E0A93B', dark: '#1B2233', onDark: '#EFE3C8', line: '#1F1B18', white: '#F6EDD8', shadow: '#23407A', skin: '#F1D3AE', coat: '#23407A', hair: '#1F1B18', onA1: '#F6EDD8', onA2: '#F6EDD8', onA3: '#1F1B18', flash: '#F6EDD8' },
    pine:   { bg: '#EDE3CC', bg2: '#E1D4B6', fg: '#1E2A26', muted: '#8B7F62', a1: '#B8412E', a2: '#2F5D50', a3: '#C9A34A', dark: '#1E2A26', onDark: '#EDE3CC', line: '#1D1A16', white: '#F5ECD9', shadow: '#2F5D50', skin: '#F0D2AE', coat: '#2F5D50', hair: '#1D1A16', onA1: '#F5ECD9', onA2: '#F5ECD9', onA3: '#1D1A16', flash: '#F5ECD9' },
    sakura: { bg: '#F3E6E2', bg2: '#EAD6D0', fg: '#2A2433', muted: '#9A8591', a1: '#D9546E', a2: '#3C4F7C', a3: '#E3B04B', dark: '#2A2433', onDark: '#F3E6E2', line: '#241F29', white: '#FAF0EC', shadow: '#3C4F7C', skin: '#F3D6BE', coat: '#3C4F7C', hair: '#241F29', onA1: '#FAF0EC', onA2: '#FAF0EC', onA3: '#241F29', flash: '#FAF0EC' },
  },
  fonts: {
    zh: { head: { f: '"Noto Serif SC","Songti SC",serif', w: 900 }, body: { f: '"Noto Sans SC",sans-serif', w: 700, also: [500] }, shout: { f: '"Ma Shan Zheng","Noto Serif SC",serif', w: 400 }, latin: { f: '"Cormorant Garamond","Noto Serif SC",serif', w: 700 }, mono: { f: '"IBM Plex Mono","Noto Sans SC",monospace', w: 500 } },
    ja: { head: { f: '"Shippori Mincho B1","Hiragino Mincho ProN",serif', w: 800 }, body: { f: '"Noto Sans JP",sans-serif', w: 700, also: [500] }, shout: { f: '"Yuji Syuku","Shippori Mincho B1",serif', w: 400 }, latin: { f: '"Cormorant Garamond","Shippori Mincho B1",serif', w: 700 }, mono: { f: '"IBM Plex Mono","Noto Sans JP",monospace', w: 500 } },
    en: { head: { f: '"Noto Serif",Georgia,serif', w: 700 }, body: { f: '"Noto Serif",Georgia,serif', w: 700 }, shout: { f: '"Cormorant Garamond",serif', w: 700 }, latin: { f: '"Cormorant Garamond",serif', w: 700 }, mono: { f: '"IBM Plex Mono",monospace', w: 500 } },
  },
  lw: .9, plates: true, voidTol: .28, takeLabel: '場', fadeTo: '#1F1B18',
  motion: { hitFrom: 1.25, hitLen: .1, shake: .7, jitter: .9, push: .025, cutLen: .12 },

  textures() {
    const R = rng(21), A = W * H / 2073600;
    this.washi = cnv(W, H); let g = this.washi.getContext('2d');
    g.fillStyle = '#fff'; g.fillRect(0, 0, W, H);
    for (let i = 0; i < 60 * A; i++) { const x = R() * W, y = R() * H, r = 100 + R() * 380; const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, `rgba(140,110,70,${.03 + R() * .04})`); gr.addColorStop(1, 'rgba(140,110,70,0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r); }
    g.lineCap = 'round';
    for (let i = 0; i < 1400 * A; i++) { const x = R() * W, y = R() * H, l = 20 + R() * 90, a = R() * Math.PI * 2; g.strokeStyle = `rgba(120,95,60,${.05 + R() * .07})`; g.lineWidth = .5 + R() * .8; g.beginPath(); g.moveTo(x, y); g.bezierCurveTo(x + Math.cos(a) * l * .3 + (R() - .5) * 20, y + Math.sin(a) * l * .3, x + Math.cos(a) * l * .7, y + Math.sin(a) * l * .7 + (R() - .5) * 20, x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke(); }
    // 木纹：画刷子印的纹理
    this.grainC = cnv(400, 400); g = this.grainC.getContext('2d');
    g.strokeStyle = 'rgba(0,0,0,.5)';
    for (let i = 0; i < 70; i++) { const x0 = R() * 400, amp = 3 + R() * 8, fq = .01 + R() * .02; g.lineWidth = .6 + R() * 1.4; g.beginPath(); for (let y = 0; y <= 400; y += 8) { const x = x0 + Math.sin(y * fq + i) * amp; y ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); }
    this.baren = cnv(W / 3, H / 3); g = this.baren.getContext('2d');
    const im = g.createImageData(this.baren.width, this.baren.height), dd = im.data;
    for (let i = 0; i < dd.length; i += 4) { const v = 128 + (R() - .5) * 60; dd[i] = dd[i + 1] = dd[i + 2] = v; dd[i + 3] = 255; }
    g.putImageData(im, 0, 0);
  },
  grain(ctx) { if (!this._gp) this._gp = ctx.createPattern(this.grainC, 'repeat'); return this._gp; },
  bokashi(ctx, col, a0, top = true) {
    const g = ctx.createLinearGradient(0, top ? 0 : H, 0, top ? H * .42 : H * .6);
    g.addColorStop(0, col + a0); g.addColorStop(1, col + '00'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  },
  // 霞：横向拉长的圆角带
  kasumi(ctx, x, y, w, h, col, a = .55) {
    ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = col; ctx.beginPath(); ctx.roundRect(x, y, w, h, h / 2); ctx.fill();
    ctx.globalAlpha = .35; ctx.strokeStyle = C.line; ctx.lineWidth = 1.5 * U; ctx.stroke(); ctx.restore();
  },
  bg(ctx, u, d, t, o = {}) {
    const tn = o.tone || 'base';
    field(ctx, tone(tn));
    if (tn === 'base' || tn === 'alt') {
      this.bokashi(ctx, C.a2, '8c');
      const i = o.deco ?? 0, ax = WIDE ? W * .6 : W * .1, ay = WIDE ? H * (.25 + (i % 2) * .5) : H * .82;
      this.kasumi(ctx, ax + Math.sin(t * .3 + i) * 20 * U, ay, W * .42, 56 * U, C.a3);
      this.kasumi(ctx, ax + W * .12 + Math.sin(t * .25 + i + 2) * 20 * U, ay + 80 * U, W * .3, 44 * U, C.a3, .4);
    } else if (tn === 'dark') {
      ctx.save(); ctx.fillStyle = C.a3; for (let i = 0; i < 40; i++) { ctx.globalAlpha = .3 + .5 * hash(i + 3); ctx.beginPath(); ctx.arc(hash(i) * W, hash(i + 9) * H * .6, (1 + hash(i + 5) * 2.5) * U, 0, 7); ctx.fill(); } ctx.restore();
    } else this.bokashi(ctx, '#000000', '40', false);
    ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = tn === 'base' ? .05 : .12; ctx.fillStyle = this.grain(ctx); ctx.fillRect(0, 0, W, H); ctx.restore();
    if (o.poster) { const r = Math.min(W, H) * .22; circ(ctx, W - L.m - r * 1.2, L.top + r, r * eOut(P(u, 0, .5)), C.a1); }
  },
  post(ctx, t) {
    ctx.globalCompositeOperation = 'multiply'; ctx.drawImage(this.washi, 0, 0);
    ctx.globalCompositeOperation = 'soft-light'; ctx.globalAlpha = .3; ctx.drawImage(this.baren, 0, 0, W, H);
    ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
    const g = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * .45, W / 2, H / 2, Math.max(W, H) * .65);
    g.addColorStop(0, 'rgba(60,40,20,0)'); g.addColorStop(1, 'rgba(60,40,20,.28)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  },
  cut(ctx, k) { ctx.globalAlpha = .8 * k; ctx.fillStyle = C.flash; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; },
  shade(ctx, x, y, w, h) { ctx.save(); ctx.globalAlpha = .3; ctx.fillStyle = hatch(ctx, C.line, 7, 1.6, 75); ctx.fillRect(x, y, w, h); ctx.restore(); },
  cheek(ctx, x, y, w, h) { ctx.save(); ctx.globalAlpha = .28; circ(ctx, x + 40, y + 70, 36, C.a1); ctx.restore(); },
  panelShadow(ctx, x, y, w, h, r = 0) { ctx.save(); ctx.globalAlpha = .4; ctx.fillStyle = C.shadow; ctx.fillRect(x + 9 * U, y + 7 * U, w, h); ctx.restore(); },
  panel(ctx, x, y, w, h, o = {}) {
    this.panelShadow(ctx, x, y, w, h);
    ctx.fillStyle = o.fill || C.white; ctx.fillRect(x, y, w, h);
    ctx.lineWidth = 5 * U; ctx.strokeStyle = C.line; ctx.strokeRect(x, y, w, h);
    ctx.lineWidth = 2 * U; ctx.strokeStyle = C.a1; ctx.strokeRect(x + 10 * U, y + 10 * U, w - 20 * U, h - 20 * U);
    if (o.head) { ctx.fillStyle = C.a2; ctx.fillRect(x + 10 * U, y + 10 * U, w - 20 * U, 50 * U); text(ctx, o.head, x + 36 * U, y + 36 * U, { size: 24 * U, font: F.mono, align: 'left', color: C.onA2, meta: true }); }
    return { x: x + 40 * U, y: y + (o.head ? 88 : 36) * U, w: w - 80 * U, h: h - (o.head ? 120 : 72) * U };
  },
  title(ctx, s, x, y, o = {}) {
    const size = o.size || 120;
    text(ctx, s, x, y, { size, font: o.font || F.head, align: o.align || 'left', color: o.color || C.fg, shadow: C.a1, sdx: size * .028, sdy: size * .02, scale: o.scale, alpha: o.alpha, g: o.g });
  },
  // 朱印：方形红底，字反白，从右往左竖排
  sealTex(s, size, col) {
    const key = s + size + col; this._sc = this._sc || {};
    if (this._sc[key]) return this._sc[key];
    // 印文含拉丁字母就横排一行，纯汉字从右往左竖排
    const ch = [...s], n = ch.length, latin = /[A-Za-z0-9]/.test(s), rows = latin ? 1 : n <= 2 ? n : Math.ceil(n / 2), cols = latin ? n : n <= 2 ? 1 : 2, cs = size * (latin ? .62 : .78);
    const w = cols * cs + size * .34, h = rows * cs + size * .34, c = cnv(w + 20, h + 20), g = c.getContext('2d');
    g.translate(10, 10); g.fillStyle = col; g.beginPath(); g.roundRect(0, 0, w, h, size * .06); g.fill();
    g.fillStyle = C.white; g.font = font(cs * .9, F.shout); g.textAlign = 'center'; g.textBaseline = 'middle';
    ch.forEach((c2, i) => { const cc = latin ? i : cols - 1 - Math.floor(i / rows), rr_ = latin ? 0 : i % rows; g.fillText(c2, size * .17 + cc * cs + cs / 2, size * .17 + rr_ * cs + cs / 2 + cs * .04); });
    g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'destination-out'; g.globalAlpha = .7;
    g.drawImage(wornMask(), (hash(size + n) * 600) | 0, 0, Math.min(c.width, 900), Math.min(c.height, 800), 0, 0, c.width, c.height);
    return (this._sc[key] = c);
  },
  seal(ctx, s, x, y, k, o = {}) {
    if (k <= 0) return;
    const size = Math.min(o.size || 200, 220 * U), c = this.sealTex(s, size, o.color && o.color !== C.a3 ? o.color : C.a1), sc = lerp(1.6, 1, eIn(clamp(k)));
    ctx.save(); ctx.translate(x, y); ctx.rotate((o.rot ?? -.05) * .4); ctx.scale(sc, sc); ctx.globalAlpha *= lerp(.2, .95, clamp(k));
    ctx.globalCompositeOperation = o.mul === false ? 'source-over' : 'multiply';
    ctx.drawImage(c, -c.width / 2, -c.height / 2); ctx.restore();
    if (QA.on) QA.boxes.push({ s, x0: x - c.width / 2, y0: y - c.height / 2, x1: x + c.width / 2, y1: y + c.height / 2, px: size, a: 1, g: 'seal' });
  },
  // 强调：一笔刷过去的黄土色
  marker(ctx, x, y, w, h, k) {
    if (k <= 0) return;
    ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.strokeStyle = C.a3; ctx.lineCap = 'round';
    for (let i = 0; i < 5; i++) { ctx.globalAlpha = .28; ctx.lineWidth = h * (.45 + .12 * hash(i)); const yy = y + h * (.35 + .08 * (i - 2)); ctx.beginPath(); ctx.moveTo(x + 6, yy + (hash(i + 3) - .5) * 8); ctx.lineTo(x + (w - 6) * k, yy + (hash(i + 7) - .5) * 10); ctx.stroke(); }
    ctx.restore();
  },
  caption(ctx, u, t0, t1, segs, o = {}) {
    if (u < t0 || u > t1) return;
    const size = o.size || 50 * U, role = o.font || F.head, pad = 44 * U;
    const w = segs.reduce((a, [s]) => a + tw(ctx, s, size, role), 0) + pad * 2, h = size + 44 * U, x = W / 2 - w / 2, y = (o.y ?? L.capY) - h / 2;
    const kin = eOut(P(u, t0, t0 + .18)), kout = eIn(P(u, t1 - .12, t1));
    ctx.save(); ctx.beginPath(); ctx.rect(x - 20 + (w + 40) * kout, y - 20, (w + 40) * (kin - kout), h + 40); ctx.clip();
    ctx.fillStyle = C.a2; ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = C.bg; ctx.lineWidth = 2 * U; ctx.strokeRect(x + 7 * U, y + 7 * U, w - 14 * U, h - 14 * U);
    rich(ctx, segs.map(([s, c]) => [s, c === C.a3 ? C.a3 : c || C.onA2]), x + pad, y + h / 2 + 2, size, { font: role });
    ctx.restore();
  },
  wordCard(ctx, u, i, word, o = {}) {
    const tn = o.tone || ['base', 'a2', 'a1', 'base'][i % 4];
    field(ctx, tone(tn));
    this.bokashi(ctx, tn === 'base' ? C.a2 : '#000000', tn === 'base' ? '99' : '55');
    if (tn === 'base') { circ(ctx, W * (i % 2 ? .3 : .7), H * .42, Math.min(W, H) * .26 * eOut(P(u, 0, .3)), C.a1); }
    ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = .12; ctx.fillStyle = this.grain(ctx); ctx.fillRect(0, 0, W, H); ctx.restore();
    const latin = /^[\x00-\x7f]+$/.test(word), role = latin ? F.latin : F.shout;
    const size = fitText(ctx, word, W * .8, (latin ? 440 : 420) * U, role), sc = slamS(u, 0, 1.3, .1) * (1 + u * .04);
    ctx.save(); ctx.translate(W / 2, H / 2 + 20 * U); ctx.scale(sc, sc);
    text(ctx, word, 0, 0, { size, font: role, color: tn === 'base' ? C.fg : onTone(tn), shadow: tn === 'base' ? C.bg : C.line, sdx: size * .025, sdy: size * .02, g: 'wc' });
    ctx.restore();
  },
  chapter(ctx, u, d, t, o) {
    const tn = o.tone || ['a2', 'base', 'dark', 'a1'][(o.n - 1) % 4], fg = onTone(tn);
    this.bg(ctx, u, d, t, { tone: tn, deco: o.n });
    const KN = ['〇', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'], num = o.n <= 10 ? KN[o.n] : pad2(o.n);
    const G = chapterGeom(.97), ns = G.ns, sc = slamS(u, 0, 1.25, .12);
    ctx.save(); ctx.translate(G.cx, G.cy); ctx.scale(sc, sc);
    ctx.font = font(ns, F.shout); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = tn === 'base' ? C.a1 : C.a3; ctx.fillText(num, 0, 0);
    ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = .35; ctx.fillStyle = this.grain(ctx); ctx.fillText(num, 0, 0);
    ctx.restore();
    const k = eOut(P(u, 0, .16)), x0 = G.x0, y0 = G.y0;
    text(ctx, `第${KN[Math.min(10, o.n)] || o.n}`, lerp(-200, x0, k), y0, { size: 170 * U, font: F.head, align: 'left', color: fg });
    const ts = fitText(ctx, o.title, G.tw, 100 * U, F.head);
    stagger(ctx, o.title, x0, y0 + 210 * U, u, .1, { size: ts, color: fg, step: .03 });
    ctx.fillStyle = C.a1; ctx.fillRect(x0, y0 + 320 * U, 420 * U * eOut(P(u, .1, .4)), 8 * U);
    text(ctx, `${o.tag} · ${pad2(o.n)} / ${pad2(o.total)}`, x0, y0 + 375 * U, { size: 28 * U, font: F.mono, align: 'left', color: fg, alpha: P(u, .15, .3), meta: true });
  },
  bar(ctx, x, y, w, h, col) {
    ctx.fillStyle = col; ctx.fillRect(x, y, w, h);
    ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip(); this.seigaiha(ctx, x, y, w, h, C.white, .35); ctx.restore();
    ctx.lineWidth = LW(5); ctx.strokeStyle = C.line; ctx.strokeRect(x, y, w, h);
  },
  // 青海波：一排排同心半圆
  seigaiha(ctx, x, y, w, h, col, a = .5, r = 34 * U, off = 0) {
    ctx.save(); ctx.strokeStyle = col; ctx.globalAlpha = a; ctx.lineWidth = 2 * U;
    for (let row = 0; row * r * .5 < h + r; row++) for (let i = -1; i * r * 2 < w + r * 2; i++) {
      const cx = x + i * r * 2 + (row % 2) * r + off % (r * 2), cy = y + row * r * .5;
      for (let j = 1; j <= 3; j++) { ctx.beginPath(); ctx.arc(cx, cy, r * j / 3, Math.PI, 0); ctx.stroke(); }
    }
    ctx.restore();
  },
  link(ctx, x0, y0, x1, y1, k, o = {}) { arrow(ctx, x0, y0, x1, y1, k, { lw: 6, color: C.a1, head: o.head }); },
  // 主视觉：日轮 + 富士 或 浪（青海波填充 + 浪花）
  ornament(ctx, x, y, w, h, u, t, o = {}) {
    const seed = o.seed || 0, k = i => o.quiet ? 1 : eOut(P(u, i * BT * .5, i * BT * .5 + .4));
    const S = Math.min(w, h), base = y + h * .92;
    ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
    circ(ctx, x + w * .66, lerp(y + h * .55, y + h * .3, k(0)), S * .19, C.a1);
    this.kasumi(ctx, x + w * .1, y + h * .34, w * .6, 40 * U, C.a3, .6 * k(1));
    if (seed % 2 === 1) {
      const mw = w * .8, mh = h * .5 * k(1), mx = x + w * .5;
      poly(ctx, [[mx - mw / 2, base], [mx - mw * .08, base - mh], [mx + mw * .08, base - mh], [mx + mw / 2, base]], C.a2, C.line, 4);
      poly(ctx, [[mx - mw * .08, base - mh], [mx + mw * .08, base - mh], [mx + mw * .16, base - mh * .72], [mx + mw * .07, base - mh * .78], [mx, base - mh * .68], [mx - mw * .07, base - mh * .78], [mx - mw * .16, base - mh * .72]], C.white, C.line, 3);
    }
    // 三层浪
    for (let layer = 0; layer < 3; layer++) {
      const ly = base - h * (.34 - layer * .1) * k(1 + layer * .5), amp = h * (.07 - layer * .012), ph = t * (.8 + layer * .3) + layer * 2 + seed;
      const col = [C.a2 + '99', C.a2, C.fg][layer];
      ctx.beginPath(); ctx.moveTo(x - 10, y + h + 10);
      for (let px = x - 10; px <= x + w + 10; px += 12 * U) ctx.lineTo(px, ly + Math.sin(px * .012 / U + ph) * amp + Math.sin(px * .031 / U + ph * 1.3) * amp * .35);
      ctx.lineTo(x + w + 10, y + h + 10); ctx.closePath();
      ctx.fillStyle = col; ctx.fill(); ctx.lineWidth = LW(3); ctx.strokeStyle = C.line; ctx.stroke();
      if (layer === 2) { ctx.save(); ctx.clip(); this.seigaiha(ctx, x, ly - amp, w, h, C.white, .4, 28 * U, t * 20); ctx.restore(); }
      // 浪花：浪尖上的白爪
      ctx.fillStyle = C.white;
      for (let px = x + 20 * U; px < x + w; px += 90 * U) { const cy = ly + Math.sin(px * .012 / U + ph) * amp + Math.sin(px * .031 / U + ph * 1.3) * amp * .35; if (Math.sin(px * .012 / U + ph) < -.6) for (let j = 0; j < 3; j++) circ(ctx, px + j * 12 * U, cy - 6 * U - j * 3 * U, (7 - j * 1.5) * U, C.white, C.line, 1.5); }
    }
    ctx.restore();
  },
});
