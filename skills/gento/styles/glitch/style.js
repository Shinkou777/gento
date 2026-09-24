/* 幻燈 GENTO · 风格包：故障霓虹（glitch）
   黑底荧光、扫描线、RGB 错位、随机切片、终端字。人物是霓虹线稿。 */
const STYLE = defineStyle({
  id: 'glitch',
  palettes: {
    magenta: { bg: '#0A0A12', bg2: '#12121E', fg: '#EDEBFF', muted: '#7C78A0', a1: '#FF2BD6', a2: '#18E7FF', a3: '#F4FF3B', dark: '#050508', onDark: '#EDEBFF', line: '#18E7FF', white: '#11111C', panelFg: '#EDEBFF', shadow: '#FF2BD6', skin: '#1A1830', coat: '#1A1830', hair: '#1A1830', onA1: '#0A0A12', onA2: '#0A0A12', onA3: '#0A0A12', lightA2: true, flash: '#18E7FF', scrim: 'rgba(0,0,0,.6)' },
    acid:    { bg: '#07090A', bg2: '#0E1214', fg: '#E8FFE0', muted: '#6F8A74', a1: '#B6FF00', a2: '#00E0FF', a3: '#FF3B7F', dark: '#030404', onDark: '#E8FFE0', line: '#B6FF00', white: '#0E1413', panelFg: '#E8FFE0', shadow: '#00E0FF', skin: '#101A14', coat: '#101A14', hair: '#101A14', onA1: '#07090A', onA2: '#07090A', onA3: '#07090A', lightA2: true, flash: '#B6FF00', scrim: 'rgba(0,0,0,.6)' },
    sunset:  { bg: '#0D0716', bg2: '#170D24', fg: '#FFEFE2', muted: '#8C7396', a1: '#FF7A1A', a2: '#9D4DFF', a3: '#FFE14D', dark: '#07030C', onDark: '#FFEFE2', line: '#FF7A1A', white: '#170D24', panelFg: '#FFEFE2', shadow: '#9D4DFF', skin: '#1E1030', coat: '#1E1030', hair: '#1E1030', onA1: '#0D0716', onA2: '#FFEFE2', onA3: '#0D0716', flash: '#FF7A1A', scrim: 'rgba(0,0,0,.6)' },
  },
  fonts: {
    zh: { head: { f: '"Noto Sans SC",sans-serif', w: 900 }, body: { f: '"Noto Sans SC",sans-serif', w: 900, also: [500] }, shout: { f: '"ZCOOL QingKe HuangYou","Noto Sans SC",sans-serif', w: 400 }, latin: { f: '"Chakra Petch","Noto Sans SC",sans-serif', w: 700, up: true }, mono: { f: '"Share Tech Mono","Noto Sans SC",monospace', w: 400 } },
    ja: { head: { f: '"Noto Sans JP",sans-serif', w: 900 }, body: { f: '"Noto Sans JP",sans-serif', w: 900, also: [500] }, shout: { f: '"DotGothic16","Noto Sans JP",sans-serif', w: 400 }, latin: { f: '"Chakra Petch","Noto Sans JP",sans-serif', w: 700, up: true }, mono: { f: '"Share Tech Mono","Noto Sans JP",monospace', w: 400 } },
    en: { head: { f: '"Chakra Petch",sans-serif', w: 700 }, body: { f: '"Chakra Petch",sans-serif', w: 600 }, shout: { f: '"Chakra Petch",sans-serif', w: 700, up: true }, latin: { f: '"Chakra Petch",sans-serif', w: 700, up: true }, mono: { f: '"Share Tech Mono",monospace', w: 400 } },
  },
  lw: .8, plates: false, lineArt: true, voidTol: .28, takeLabel: 'SIGNAL',
  motion: { hitFrom: 1.28, hitLen: .08, shake: 1.1, jitter: 0, push: .035, cutLen: .14 },

  textures() {
    const R = rng(3);
    this.scan = cnv(W, H); const g = this.scan.getContext('2d');
    g.fillStyle = 'rgba(0,0,0,.28)'; for (let y = 0; y < H; y += 3) g.fillRect(0, y, W, 1);
    this.noise = [];
    for (let k = 0; k < 4; k++) {
      const c = cnv(W / 2, H / 2), q = c.getContext('2d'), im = q.createImageData(c.width, c.height), dd = im.data;
      for (let i = 0; i < dd.length; i += 4) { const v = 128 + (R() - .5) * 200; dd[i] = dd[i + 1] = dd[i + 2] = v; dd[i + 3] = 255; }
      q.putImageData(im, 0, 0); this.noise.push(c);
    }
  },
  bg(ctx, u, d, t, o = {}) {
    const tn = o.tone || 'base';
    field(ctx, tone(tn));
    const accent = tn === 'a1' || tn === 'a2' || tn === 'a3';
    // 点阵
    ctx.save(); ctx.fillStyle = accent ? 'rgba(0,0,0,.25)' : C.a2; ctx.globalAlpha = accent ? 1 : .13;
    const step = 32 * U; for (let y = step / 2; y < H; y += step) for (let x = step / 2; x < W; x += step) ctx.fillRect(x - 1.5, y - 1.5, 3, 3);
    ctx.restore();
    if (accent) return;
    // 光晕放在图那一侧
    const i = o.deco ?? 0, cs = WIDE ? [[W * .8, H * .35], [W * .8, H * .7]] : [[W * .5, H * .78], [W * .3, H * .8]];
    const [cx, cy] = cs[i % cs.length], gg = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(W, H) * .5);
    gg.addColorStop(0, C.a1 + '38'); gg.addColorStop(.5, C.a2 + '14'); gg.addColorStop(1, 'transparent');
    ctx.fillStyle = gg; ctx.fillRect(0, 0, W, H);
    if (o.poster) { // 地平线网格
      ctx.save(); ctx.strokeStyle = C.a1; ctx.globalAlpha = .45; ctx.lineWidth = 2; const hy = H * .72;
      for (let j = 0; j < 14; j++) { const y = hy + Math.pow(j / 14, 2) * (H - hy) + ((t * 60) % 20) * (j / 14); ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
      for (let j = -12; j <= 12; j++) { ctx.beginPath(); ctx.moveTo(W / 2 + j * 40 * U, hy); ctx.lineTo(W / 2 + j * 260 * U, H); ctx.stroke(); }
      ctx.restore();
    }
  },
  post(ctx, t) {
    ctx.drawImage(this.scan, 0, 0);
    ctx.globalCompositeOperation = 'soft-light'; ctx.globalAlpha = .18; ctx.drawImage(this.noise[Math.floor(t * 24) % 4], 0, 0, W, H);
    ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
    const g = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * .4, W / 2, H / 2, Math.max(W, H) * .7);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.6)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    // 偶发切片错位
    const f = Math.floor(t * 30);
    if (hash(f * 3.1 + 7) > .93) {
      const img = ctx.getImageData(0, 0, W, H);
      for (let i = 0; i < 3; i++) { const y = Math.floor(hash(f * 13 + i) * H), h = 8 + Math.floor(hash(f * 7 + i) * 50), dx = Math.floor((hash(f + i * 3) - .5) * 90 * U); ctx.putImageData(img, dx, 0, 0, y, W, h); }
    }
  },
  cut(ctx, k) {
    const f = Math.floor(k * 12);
    for (let i = 0; i < 26; i++) { ctx.globalAlpha = k * .9; ctx.fillStyle = [C.a1, C.a2, C.fg, C.bg][i % 4]; ctx.fillRect(hash(i + f * 31) * W, hash(i * 7 + f) * H, (40 + hash(i * 3 + f) * 420) * U, (6 + hash(i * 5) * 50) * U); }
    ctx.globalAlpha = 1;
  },
  shade(ctx, x, y, w, h) { ctx.save(); ctx.globalAlpha = .45; ctx.fillStyle = hatch(ctx, C.a2, 8, 2, 0); ctx.fillRect(x, y, w, h); ctx.restore(); },
  cheek() {},
  panelShadow(ctx, x, y, w, h, r = 0) { ctx.save(); ctx.strokeStyle = C.shadow; ctx.globalAlpha = .7; ctx.lineWidth = 2 * U; ctx.strokeRect(x + 10 * U, y + 10 * U, w, h); ctx.restore(); },
  panel(ctx, x, y, w, h, o = {}) {
    this.panelShadow(ctx, x, y, w, h);
    ctx.fillStyle = o.fill && o.fill !== C.white ? o.fill : C.white; ctx.globalAlpha = .92; ctx.fillRect(x, y, w, h); ctx.globalAlpha = 1;
    ctx.save(); ctx.shadowColor = C.a2; ctx.shadowBlur = 16 * U; ctx.strokeStyle = C.a2; ctx.lineWidth = 2 * U; ctx.strokeRect(x, y, w, h);
    ctx.lineWidth = 6 * U; const c = 26 * U;
    for (const [px, py, sx, sy] of [[x, y, 1, 1], [x + w, y, -1, 1], [x, y + h, 1, -1], [x + w, y + h, -1, -1]]) { ctx.beginPath(); ctx.moveTo(px, py + sy * c); ctx.lineTo(px, py); ctx.lineTo(px + sx * c, py); ctx.stroke(); }
    ctx.restore();
    if (o.head) { ctx.fillStyle = C.a2; ctx.fillRect(x, y, w, 52 * U); text(ctx, '> ' + o.head, x + 24 * U, y + 27 * U, { size: 26 * U, font: F.mono, align: 'left', color: C.bg, meta: true }); }
    return { x: x + 36 * U, y: y + (o.head ? 82 : 32) * U, w: w - 72 * U, h: h - (o.head ? 114 : 64) * U };
  },
  title(ctx, s, x, y, o = {}) {
    const size = o.size || 120;
    text(ctx, s, x, y, { size, font: o.font || F.head, align: o.align || 'left', color: o.color || C.fg, split: [C.a1, C.a2, size * .035], glow: C.a2 + '88', glowR: size * .12, scale: o.scale, alpha: o.alpha, g: o.g });
  },
  hit(ctx, s, x, y, u, t0, o = {}) {
    if (u < t0) return;
    const size = o.size || 220, k = eOut(P(u, t0, t0 + .12)), sc = slamS(u, t0, this.motion.hitFrom, this.motion.hitLen);
    const flick = u - t0 < .25 && hash(Math.floor(u * 50)) > .5 ? 1 : 0, dx = size * (.08 * (1 - k) + .018 + .03 * flick);
    text(ctx, s, x, y, { size, font: o.font || F.head, align: o.align || 'left', color: o.color || C.a1, scale: sc, split: [C.a2, C.a3, dx], glow: (o.color || C.a1) + 'aa', glowR: size * .15, g: o.g });
  },
  seal(ctx, s, x, y, k, o = {}) {
    if (k <= 0) return;
    const size = o.size || 200, role = F.shout, fs = size * .8, w = tw(ctx, s, fs, role) + size * .9, h = size * 1.35;
    const on = k >= 1 || hash(Math.floor(k * 40)) > .35, sc = lerp(1.6, 1, eOut(clamp(k)));
    ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot ?? -.04); ctx.scale(sc, sc); ctx.globalAlpha *= on ? 1 : .25;
    const col = o.color && o.color !== C.a3 ? o.color : C.a1;
    ctx.shadowColor = col; ctx.shadowBlur = 24 * U; ctx.strokeStyle = col; ctx.lineWidth = size * .06; ctx.strokeRect(-w / 2, -h / 2, w, h);
    ctx.lineWidth = size * .02; ctx.strokeRect(-w / 2 + size * .12, -h / 2 + size * .12, w - size * .24, h - size * .24);
    ctx.restore();
    text(ctx, s, x, y + size * .03, { size: fs * sc, font: role, color: col, rot: o.rot ?? -.04, glow: col, glowR: size * .2, split: [C.a2, C.a3, size * .02], alpha: on ? 1 : .25, g: 'seal', over: o.over });
  },
  marker(ctx, x, y, w, h, k) {
    if (k <= 0) return;
    ctx.save(); ctx.globalAlpha = .28; ctx.fillStyle = C.a2; ctx.fillRect(x, y, w * k, h); ctx.globalAlpha = 1;
    ctx.shadowColor = C.a2; ctx.shadowBlur = 14 * U; ctx.fillStyle = C.a2; ctx.fillRect(x, y + h - 5 * U, w * k, 5 * U); ctx.restore();
  },
  caption(ctx, u, t0, t1, segs, o = {}) {
    if (u < t0 || u > t1) return;
    const size = o.size || 48 * U, role = o.font || F.body, pad = 36 * U;
    const w = segs.reduce((a, [s]) => a + tw(ctx, s, size, role), 0) + pad * 2 + 14 * U, h = size + 36 * U, x = W / 2 - w / 2, y = (o.y ?? L.capY) - h / 2;
    const kin = eOut(P(u, t0, t0 + .12)), kout = eIn(P(u, t1 - .08, t1));
    ctx.save(); ctx.beginPath(); ctx.rect(x - 20 + (w + 40) * kout, y - 20, (w + 40) * (kin - kout), h + 40); ctx.clip();
    ctx.fillStyle = 'rgba(0,0,0,.8)'; ctx.fillRect(x, y, w, h); ctx.fillStyle = C.a1; ctx.fillRect(x, y, 10 * U, h);
    ctx.strokeStyle = C.a2; ctx.lineWidth = 1.5 * U; ctx.strokeRect(x, y, w, h);
    rich(ctx, segs.map(([s, c]) => [s, c === C.a3 ? C.a3 : c || C.fg]), x + 14 * U + pad, y + h / 2 + 2, size, { font: role });
    ctx.restore();
  },
  wordCard(ctx, u, i, word, o = {}) {
    const tn = o.tone || ['base', 'a1', 'base', 'a2'][i % 4];
    this.bg(ctx, u, 0, u, { tone: tn, deco: i });
    const latin = /^[\x00-\x7f]+$/.test(word), role = latin ? F.latin : F.head;
    const size = fitText(ctx, word, W * .84, (latin ? 480 : 400) * U, role), sc = slamS(u, 0, 1.3, .08) * (1 + u * .05);
    const fg = tn === 'base' ? C.fg : C.bg, dx = size * (.05 * (1 - eOut(P(u, 0, .2))) + .015);
    ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(sc, sc);
    text(ctx, word, 0, 0, { size, font: role, color: fg, split: tn === 'base' ? [C.a1, C.a2, dx] : [C.bg, C.fg, dx * .5], splitOp: tn === 'base' ? 'screen' : 'source-over', glow: tn === 'base' ? C.a2 + '66' : null, g: 'wc' });
    ctx.restore();
  },
  chapter(ctx, u, d, t, o) {
    const tn = o.tone || ['base', 'dark', 'base', 'dark'][(o.n - 1) % 4];
    this.bg(ctx, u, d, t, { tone: tn, deco: o.n });
    const G = chapterGeom(), ns = G.ns, sc = slamS(u, 0, 1.25, .1);
    ctx.save(); ctx.translate(G.cx, G.cy); ctx.scale(sc, sc);
    ctx.font = font(ns, F.latin); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = hatch(ctx, C.a1, 6, 1.5, 0); ctx.globalAlpha = .5; ctx.fillText(pad2(o.n), 0, 0); ctx.globalAlpha = 1;
    ctx.shadowColor = C.a1; ctx.shadowBlur = 30 * U; ctx.lineWidth = 4 * U; ctx.strokeStyle = C.a1; ctx.strokeText(pad2(o.n), 0, 0);
    ctx.shadowColor = C.a2; ctx.strokeStyle = C.a2; ctx.lineWidth = 2 * U; ctx.strokeText(pad2(o.n), 8 * U, 4 * U);
    ctx.restore();
    const x0 = G.x0, y0 = G.y0;
    typewriter(ctx, `// ${o.en || 'CHAPTER'}_${pad2(o.n)}`, x0, y0 - 110 * U, u, 0, .25, { size: 34 * U, font: F.mono, color: C.a2 });
    text(ctx, o.tag, x0, y0, { size: 150 * U, font: F.head, align: 'left', color: C.fg, split: [C.a1, C.a2, 5 * U], alpha: eOut(P(u, 0, .12)) });
    const ts = fitText(ctx, o.title, G.tw, 100 * U, F.head);
    stagger(ctx, o.title, x0, y0 + 190 * U, u, .1, { size: ts, color: C.a1, step: .02, glow: C.a1 + '88' });
    text(ctx, `[${pad2(o.n)}/${pad2(o.total)}]`, x0, y0 + 300 * U, { size: 30 * U, font: F.mono, align: 'left', color: C.muted, alpha: P(u, .15, .3), meta: true });
  },
  hud(ctx, t, sc, u, d) {
    STYLE_DEFAULTS.hud.call(this, ctx, t, sc);
    if (HUDCFG.off || sc.hud === false || !(sc.kind === 'content' || sc.hud === true) || sc.date) return;
    const fr = Math.floor(t * FPS), tc = [Math.floor(t / 3600), Math.floor(t / 60) % 60, Math.floor(t) % 60, fr % FPS].map(pad2).join(':');
    if ((t * 1.4) % 1 < .6) circ(ctx, W - L.m * .55 - 250 * U, 62 * U, 10 * U, C.a1);
    text(ctx, 'REC ' + tc, W - L.m * .55, 64 * U, { size: 30 * U, font: F.mono, align: 'right', color: C.fg, meta: true });
  },
  bar(ctx, x, y, w, h, col) {
    const g = ctx.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, col); g.addColorStop(1, col + '22');
    ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
    ctx.save(); ctx.shadowColor = col; ctx.shadowBlur = 18 * U; ctx.strokeStyle = col; ctx.lineWidth = 2.5 * U; ctx.strokeRect(x, y, w, h); ctx.restore();
  },
  link(ctx, x0, y0, x1, y1, k, o = {}) { ctx.save(); ctx.shadowColor = C.a2; ctx.shadowBlur = 12 * U; arrow(ctx, x0, y0, x1, y1, k, { lw: 4, color: C.a2, head: o.head, dash: [14 * U, 10 * U] }); ctx.restore(); },
  // 主视觉：旋转的线框立方体套八面体 + 滚动的十六进制
  ornament(ctx, x, y, w, h, u, t, o = {}) {
    const cx = x + w / 2, cy = y + h / 2, R = Math.min(w, h) * .3, k = o.quiet ? 1 : eBack(P(u, 0, .35)), seed = o.seed || 0;
    const a = t * .7 + seed, b = t * .45 + seed * 2, rot = ([px, py, pz]) => { let x1 = px * Math.cos(a) - pz * Math.sin(a), z1 = px * Math.sin(a) + pz * Math.cos(a); let y1 = py * Math.cos(b) - z1 * Math.sin(b), z2 = py * Math.sin(b) + z1 * Math.cos(b); const p = 3 / (3 + z2); return [cx + x1 * R * p * k, cy + y1 * R * p * k]; };
    const V = []; for (const i of [-1, 1]) for (const j of [-1, 1]) for (const l of [-1, 1]) V.push([i, j, l]);
    const E = []; for (let i = 0; i < 8; i++) for (let j = i + 1; j < 8; j++) { const dd = V[i].reduce((s, v, n) => s + Math.abs(v - V[j][n]), 0); if (dd === 2) E.push([i, j]); }
    const O = [[1.5, 0, 0], [-1.5, 0, 0], [0, 1.5, 0], [0, -1.5, 0], [0, 0, 1.5], [0, 0, -1.5]], OE = [[0, 2], [0, 3], [0, 4], [0, 5], [1, 2], [1, 3], [1, 4], [1, 5], [2, 4], [2, 5], [3, 4], [3, 5]];
    ctx.save(); ctx.lineCap = 'round';
    ctx.shadowBlur = 20 * U; ctx.shadowColor = C.a2; ctx.strokeStyle = C.a2; ctx.lineWidth = 3 * U; ctx.beginPath();
    for (const [i, j] of E) { const p = rot(V[i]), q = rot(V[j]); ctx.moveTo(...p); ctx.lineTo(...q); } ctx.stroke();
    ctx.shadowColor = C.a1; ctx.strokeStyle = C.a1; ctx.lineWidth = 2 * U; ctx.beginPath();
    for (const [i, j] of OE) { const p = rot(O[i]), q = rot(O[j]); ctx.moveTo(...p); ctx.lineTo(...q); } ctx.stroke();
    ctx.shadowBlur = 0; ctx.strokeStyle = C.a3; ctx.globalAlpha = .6; ctx.lineWidth = 1.5 * U;
    ctx.beginPath(); ctx.ellipse(cx, cy, R * 2 * k, R * .5 * k, Math.sin(t * .3) * .3, 0, 7); ctx.stroke();
    ctx.restore();
    const cols = WIDE ? 1 : 0;
    for (let i = 0; i < 12; i++) { const s = (Math.floor(hash(i + Math.floor(t * 8 + i)) * 0xffffff)).toString(16).padStart(6, '0').toUpperCase(); text(ctx, `0x${s}`, x + w - 4 * U, y + 30 * U + i * 36 * U, { size: 22 * U, font: F.mono, align: 'right', color: C.a2, alpha: .45 * k, meta: true, over: true }); }
    ctx.save(); ctx.strokeStyle = C.fg; ctx.globalAlpha = .6; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(cx - 20, cy); ctx.lineTo(cx + 20, cy); ctx.moveTo(cx, cy - 20); ctx.lineTo(cx, cy + 20); ctx.stroke(); ctx.restore();
  },
});
