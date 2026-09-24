/* 幻燈 GENTO · 风格包：工业渲染（industrial）
   棚拍布光、金属与磨砂、转台上的产品、字面扫过一道高光、对焦框、爆炸图与标注线。 */
const STYLE = defineStyle({
  id: 'industrial',
  palettes: {
    graphite:  { bg: '#1E2124', bg2: '#26292D', fg: '#F1F2F3', muted: '#8A9098', a1: '#FF6A13', a2: '#C9CED4', a3: '#FFB000', dark: '#111315', onDark: '#F1F2F3', line: '#E8EAED', white: '#2B2F34', panelFg: '#F1F2F3', shadow: 'rgba(0,0,0,.55)', skin: '#C9A98C', coat: '#3A3F45', hair: '#15171A', onA1: '#111315', onA2: '#111315', onA3: '#111315', lightA2: true, metal: '#8C939B', flash: '#FFFFFF', scrim: 'rgba(0,0,0,.6)', light: 'rgba(255,255,255,.10)' },
    studio:    { bg: '#E9EBEE', bg2: '#DDE0E4', fg: '#16181B', muted: '#7D848C', a1: '#1464F4', a2: '#9AA3AD', a3: '#FFB000', dark: '#15171A', onDark: '#E9EBEE', line: '#16181B', white: '#FFFFFF', panelFg: '#16181B', shadow: 'rgba(20,24,30,.18)', skin: '#E8C4A4', coat: '#9AA3AD', hair: '#16181B', onA1: '#FFFFFF', onA2: '#16181B', onA3: '#16181B', lightA2: true, metal: '#B7BDC4', flash: '#FFFFFF', light: 'rgba(255,255,255,.7)' },
    blackgold: { bg: '#0C0C0D', bg2: '#161618', fg: '#F3EFE6', muted: '#8A857B', a1: '#D4A94F', a2: '#6E6A63', a3: '#E8D5A3', dark: '#050505', onDark: '#F3EFE6', line: '#E8E1D1', white: '#1B1B1D', panelFg: '#F3EFE6', shadow: 'rgba(0,0,0,.6)', skin: '#C9A98C', coat: '#2A2826', hair: '#0C0C0D', onA1: '#0C0C0D', onA2: '#F3EFE6', onA3: '#0C0C0D', metal: '#A08450', flash: '#FFF6E0', scrim: 'rgba(0,0,0,.65)', light: 'rgba(255,240,210,.09)' },
  },
  fonts: {
    zh: { head: { f: '"Noto Sans SC",sans-serif', w: 900, ls: .02 }, body: { f: '"Noto Sans SC",sans-serif', w: 500, also: [300, 900] }, shout: { f: '"Noto Sans SC",sans-serif', w: 900 }, latin: { f: '"Barlow","Noto Sans SC",sans-serif', w: 800, up: true, ls: .04 }, mono: { f: '"JetBrains Mono","Noto Sans SC",monospace', w: 500 } },
    ja: { head: { f: '"Noto Sans JP",sans-serif', w: 900, ls: .02 }, body: { f: '"Noto Sans JP",sans-serif', w: 500, also: [300, 900] }, shout: { f: '"Noto Sans JP",sans-serif', w: 900 }, latin: { f: '"Barlow","Noto Sans JP",sans-serif', w: 800, up: true, ls: .04 }, mono: { f: '"JetBrains Mono","Noto Sans JP",monospace', w: 500 } },
    en: { head: { f: '"Barlow",sans-serif', w: 800, ls: .01 }, body: { f: '"Barlow",sans-serif', w: 600 }, shout: { f: '"Barlow",sans-serif', w: 800, up: true }, latin: { f: '"Barlow",sans-serif', w: 800, up: true, ls: .04 }, mono: { f: '"JetBrains Mono",monospace', w: 500 } },
  },
  lw: .6, plates: false, voidTol: .28, takeLabel: 'CAM',
  motion: { hitFrom: 1.08, hitLen: .22, shake: .35, jitter: 0, push: .05, cutLen: .18 },

  textures() {
    const R = rng(9); this.grain = [];
    for (let k = 0; k < 4; k++) { const c = cnv(W / 2, H / 2), q = c.getContext('2d'), im = q.createImageData(c.width, c.height), dd = im.data; for (let i = 0; i < dd.length; i += 4) { const v = 128 + (R() - .5) * 90; dd[i] = dd[i + 1] = dd[i + 2] = v; dd[i + 3] = 255; } q.putImageData(im, 0, 0); this.grain.push(c); }
  },
  bg(ctx, u, d, t, o = {}) {
    const tn = o.tone || 'base', base = tone(tn);
    const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, tint(base, .92)); g.addColorStop(.42, tint(base, 1.06)); g.addColorStop(1, tint(base, .72));
    ctx.fillStyle = g; ctx.fillRect(-100, -100, W + 200, H + 200);
    if (tn === 'base' || tn === 'alt' || tn === 'dark') {
      const i = o.deco ?? 0, cx = WIDE ? W * (.72 - (i % 2) * .04) : W * .5, cy = WIDE ? H * .35 : H * .7, R = Math.max(W, H) * .5;
      const sp = ctx.createRadialGradient(cx, cy, 0, cx, cy, R); sp.addColorStop(0, C.light); sp.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = sp; ctx.fillRect(0, 0, W, H);
      ctx.save(); ctx.fillStyle = C.fg; ctx.globalAlpha = .05; const s = 40 * U; for (let y = s; y < H; y += s) for (let x = s; x < W; x += s) ctx.fillRect(x - 1, y - 1, 2, 2); ctx.restore();
    }
  },
  post(ctx, t) {
    ctx.globalCompositeOperation = 'soft-light'; ctx.globalAlpha = .15; ctx.drawImage(this.grain[Math.floor(t * 24) % 4], 0, 0, W, H);
    ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
    const dark = hexLum(C.bg) < .3, g = ctx.createRadialGradient(W / 2, H * .45, Math.min(W, H) * .45, W / 2, H / 2, Math.max(W, H) * .72);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, dark ? 'rgba(0,0,0,.5)' : 'rgba(20,24,30,.16)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  },
  cut(ctx, k) {
    ctx.globalAlpha = .45 * k; ctx.fillStyle = C.flash; ctx.fillRect(0, 0, W, H);
    const y = H * .5, g = ctx.createLinearGradient(0, y - 60 * U, 0, y + 60 * U); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(.5, 'rgba(255,255,255,.9)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.globalAlpha = k; ctx.fillStyle = g; ctx.fillRect(0, y - 60 * U, W, 120 * U); ctx.globalAlpha = 1;
  },
  shade(ctx, x, y, w, h) { const g = ctx.createLinearGradient(x, 0, x + w, 0); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.35)'); ctx.fillStyle = g; ctx.fillRect(x, y, w, h); },
  cheek() {},
  panelShadow(ctx, x, y, w, h, r = 18 * U) { ctx.save(); ctx.shadowColor = C.shadow; ctx.shadowBlur = 44 * U; ctx.shadowOffsetY = 18 * U; ctx.fillStyle = C.white; ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.fill(); ctx.restore(); },
  panel(ctx, x, y, w, h, o = {}) {
    const r = 18 * U; this.panelShadow(ctx, x, y, w, h, r);
    ctx.save(); ctx.globalAlpha = .92; rr(ctx, x, y, w, h, r, o.fill || C.white); ctx.restore();
    ctx.save(); ctx.globalAlpha = .28; ctx.strokeStyle = C.fg; ctx.lineWidth = 1.5 * U; ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.stroke(); ctx.restore();
    if (o.head) { circ(ctx, x + 32 * U, y + 32 * U, 7 * U, C.a1); text(ctx, o.head, x + 50 * U, y + 33 * U, { size: 22 * U, font: F.mono, align: 'left', color: C.muted, meta: true }); ctx.save(); ctx.globalAlpha = .2; ctx.fillStyle = C.fg; ctx.fillRect(x + 24 * U, y + 60 * U, w - 48 * U, 1.5 * U); ctx.restore(); }
    return { x: x + 36 * U, y: y + (o.head ? 84 : 32) * U, w: w - 72 * U, h: h - (o.head ? 116 : 64) * U };
  },
  // 金属字：竖向渐变，中腰暗一道
  metalText(ctx, s, x, y, size, role, al, base, alpha = 1, scale = 1, g) {
    const gr = ctx.createLinearGradient(0, y - size * .5 * scale, 0, y + size * .5 * scale);
    gr.addColorStop(0, tint(base, 1.25)); gr.addColorStop(.48, tint(base, 1.02)); gr.addColorStop(.52, tint(base, .72)); gr.addColorStop(1, tint(base, 1.1));
    text(ctx, s, x, y, { size, font: role, align: al, fill: gr, alpha, scale, g });
  },
  // 高光扫过：只落在字形上的一道白带
  sweep(ctx, s, x, y, size, role, al, p) {
    if (p <= 0 || p >= 1) return;
    const w = tw(ctx, s, size, role), x0 = al === 'left' ? x : al === 'right' ? x - w : x - w / 2, bx = x0 - w * .3 + w * 1.6 * p;
    const g = ctx.createLinearGradient(bx - size * .5, 0, bx + size * .5, 0); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(.5, 'rgba(255,255,255,.75)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    text(ctx, s, x, y, { size, font: role, align: al, fill: g, g: 'sweep', deco: true });
  },
  title(ctx, s, x, y, o = {}) {
    const size = o.size || 120, base = hexLum(C.fg) > .5 ? C.fg : C.metal;
    this.metalText(ctx, s, x, y, size, o.font || F.head, o.align || 'left', hexLum(C.bg) < .3 ? C.fg : C.fg, o.alpha ?? 1, o.scale ?? 1, o.g);
  },
  hit(ctx, s, x, y, u, t0, o = {}) {
    if (u < t0) return;
    const size = o.size || 220, role = o.font || F.head, al = o.align || 'left', k = eOut(P(u, t0, t0 + .25 * PACE.enter));
    const sc = lerp(this.motion.hitFrom, 1, k);
    text(ctx, s, x, y + (1 - k) * size * .15, { size, font: role, align: al, color: o.color || C.a1, alpha: k, scale: sc, g: o.g });
    this.sweep(ctx, s, x, y, size, role, al, P(u, t0 + .25, t0 + 1.1));
  },
  seal(ctx, s, x, y, k, o = {}) {
    if (k <= 0) return;
    const size = Math.min(o.size || 200, 200 * U), role = /^[\x00-\x7f]+$/.test(s) ? F.latin : F.head, fs = size * .6, w = tw(ctx, s, fs, role) + size * 1.1, h = size * 1.05, sc = lerp(1.12, 1, eOut(clamp(k)));
    ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc); ctx.globalAlpha *= eOut(clamp(k));
    ctx.shadowColor = C.shadow; ctx.shadowBlur = 30 * U; ctx.shadowOffsetY = 12 * U;
    rr(ctx, -w / 2, -h / 2, w, h, h / 2, C.a1); ctx.shadowColor = 'transparent';
    const hl = ctx.createLinearGradient(0, -h / 2, 0, h / 2); hl.addColorStop(0, 'rgba(255,255,255,.35)'); hl.addColorStop(.5, 'rgba(255,255,255,0)'); ctx.fillStyle = hl; ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, h / 2); ctx.fill();
    for (const sx of [-1, 1]) { circ(ctx, sx * (w / 2 - h * .32), 0, h * .09, tint(C.a1, .6)); }
    ctx.restore();
    text(ctx, s, x, y + size * .02, { size: fs * sc, font: role, color: C.onA1, alpha: eOut(clamp(k)), g: 'seal' });
    if (QA.on) QA.boxes.push({ s, x0: x - w / 2, y0: y - h / 2, x1: x + w / 2, y1: y + h / 2, px: size, a: 1, g: 'seal' });
  },
  // 强调：对焦框四角
  marker(ctx, x, y, w, h, k) {
    if (k <= 0) return;
    const c = 22 * U, e = lerp(30 * U, 0, eOut(k)), x0 = x - 8 * U - e, y0 = y - 6 * U - e, x1 = x + w + 8 * U + e, y1 = y + h + 6 * U + e;
    ctx.save(); ctx.strokeStyle = C.a1; ctx.lineWidth = 3 * U; ctx.globalAlpha = eOut(k);
    for (const [px, py, sx, sy] of [[x0, y0, 1, 1], [x1, y0, -1, 1], [x0, y1, 1, -1], [x1, y1, -1, -1]]) { ctx.beginPath(); ctx.moveTo(px, py + sy * c); ctx.lineTo(px, py); ctx.lineTo(px + sx * c, py); ctx.stroke(); }
    ctx.restore();
  },
  caption(ctx, u, t0, t1, segs, o = {}) {
    if (u < t0 || u > t1) return;
    const size = o.size || 44 * U, role = o.font || F.body, pad = 36 * U;
    const w = segs.reduce((a, [s]) => a + tw(ctx, s, size, role), 0) + pad * 2 + 20 * U, h = size + 40 * U, x = W / 2 - w / 2, y = (o.y ?? L.capY) - h / 2;
    const k = eOut(P(u, t0, t0 + .2)) * (1 - eIn(P(u, t1 - .15, t1)));
    ctx.save(); ctx.globalAlpha = k; ctx.translate(0, (1 - k) * 20 * U);
    this.panelShadow(ctx, x, y, w, h, h / 2); ctx.globalAlpha = k * .9; rr(ctx, x, y, w, h, h / 2, C.white); ctx.globalAlpha = k;
    circ(ctx, x + 26 * U, y + h / 2, 7 * U, C.a1);
    rich(ctx, segs.map(([s, c]) => [s, c === C.a3 ? C.a1 : c || C.panelFg]), x + 20 * U + pad, y + h / 2 + 2, size, { font: role });
    ctx.restore();
  },
  wordCard(ctx, u, i, word, o = {}) {
    const tn = o.tone || ['dark', 'base', 'dark', 'a1'][i % 4];
    this.bg(ctx, u, 0, u, { tone: tn, deco: i });
    const latin = /^[\x00-\x7f]+$/.test(word), role = latin ? F.latin : F.head;
    const size = fitText(ctx, word, W * .8, (latin ? 420 : 360) * U, role), k = eOut(P(u, 0, .3)), y = H * .46;
    const base = tn === 'a1' ? C.onA1 : C.fg;
    this.metalText(ctx, word, W / 2, y, size, role, 'center', base, k, lerp(1.06, 1, k), 'wc');
    this.sweep(ctx, word, W / 2, y, size, role, 'center', P(u, .1, BT * .95));
    // 地面倒影
    ctx.save(); ctx.translate(0, y + size * .98); ctx.scale(1, -1); ctx.translate(0, -y);
    ctx.globalAlpha = .12 * k; text(ctx, word, W / 2, y, { size, font: role, color: base, deco: true }); ctx.restore();
    const fl = ctx.createLinearGradient(0, y + size * .5, 0, H); fl.addColorStop(0, 'rgba(0,0,0,0)'); fl.addColorStop(1, tint(tone(tn), .8)); ctx.fillStyle = fl; ctx.fillRect(0, y + size * .5, W, H);
  },
  chapter(ctx, u, d, t, o) {
    const tn = o.tone || ['dark', 'base', 'dark', 'base'][(o.n - 1) % 4], fg = onTone(tn);
    this.bg(ctx, u, d, t, { tone: tn, deco: o.n });
    const G = chapterGeom(.98), ns = G.ns, cx = G.cx, cy = G.cy, k = eOut(P(u, 0, .35));
    ctx.save(); ctx.globalAlpha = .14 * k; this.metalText(ctx, pad2(o.n), cx, cy, ns, F.latin, 'center', C.fg, 1, 1, 'num'); ctx.restore();
    ctx.save(); ctx.font = font(ns, F.latin); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.letterSpacing = lsPx({}, F.latin, ns) + 'px';
    const Lp = ns * 8; ctx.setLineDash([Lp, Lp]); ctx.lineDashOffset = Lp * (1 - k); ctx.lineWidth = 2 * U; ctx.strokeStyle = C.a1; ctx.strokeText(pad2(o.n), cx, cy); ctx.restore();
    const x0 = G.x0, y0 = G.y0;
    ctx.fillStyle = C.a1; ctx.fillRect(x0, y0 - 120 * U, 60 * U * k, 6 * U);
    text(ctx, `${o.en || 'CHAPTER'} ${pad2(o.n)} — ${pad2(o.total)}`, x0 + 80 * U, y0 - 117 * U, { size: 24 * U, font: F.mono, align: 'left', color: C.muted, alpha: k, meta: true });
    text(ctx, o.tag, x0, y0, { size: 140 * U, font: F.head, align: 'left', color: fg, alpha: k });
    const ts = fitText(ctx, o.title, G.tw, 96 * U, F.head);
    this.hit(ctx, o.title, x0, y0 + 180 * U, u, .12, { size: ts, color: C.a1 });
  },
  bar(ctx, x, y, w, h, col) {
    ctx.fillStyle = metal(ctx, x, x + w, col, -.3); ctx.fillRect(x, y, w, h);
    ell(ctx, x + w / 2, y, w / 2, w * .12, tint(col, 1.3));
    ctx.save(); ctx.globalAlpha = .35; ctx.fillStyle = '#000'; ctx.fillRect(x, y + h - 4 * U, w, 4 * U); ctx.restore();
  },
  link(ctx, x0, y0, x1, y1, k, o = {}) { arrow(ctx, x0, y0, x1, y1, k, { lw: 3, color: C.a1, head: o.head, hs: 16 }); if (k > 0) circ(ctx, x0, y0, 6 * U, C.a1); },
  // 标注线：从点拉一条折线到文字
  callout(ctx, px, py, tx, ty, label, k) {
    if (k <= 0) return;
    // 文字朝版心排：右侧的标注右对齐在 tx，线停在字前面
    const right = tx > px, lw0 = tw(ctx, label, 22 * U, F.mono), ex = right ? tx - lw0 - 14 * U : tx + lw0 + 14 * U;
    ctx.save(); ctx.strokeStyle = C.fg; ctx.globalAlpha = .7; ctx.lineWidth = 1.5 * U;
    const mx = lerp(px, ex, .45); ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(lerp(px, mx, eOut(k)), lerp(py, ty, eOut(k))); if (k > .5) ctx.lineTo(lerp(mx, ex, eOut(P(k, .5, 1))), ty); ctx.stroke(); ctx.restore();
    circ(ctx, px, py, 6 * U, C.a1);
    if (k > .9) text(ctx, label, tx, ty, { size: 22 * U, font: F.mono, align: right ? 'right' : 'left', color: C.fg, alpha: .85, meta: true });
  },
  // 主视觉：转台上的圆柱产品；seed 为奇数时是爆炸图
  ornament(ctx, x, y, w, h, u, t, o = {}) {
    const S = Math.min(w, h), cx = x + w * .5, seed = o.seed || 0, k = i => o.quiet ? 1 : eOut(P(u, i * BT * .5, i * BT * .5 + .6)), rot = Math.sin(t * .5 + seed) * .8;
    const floor = y + h * .82, pr = S * .44;
    // 转台
    const sh = ctx.createRadialGradient(cx, floor, 0, cx, floor, pr * 1.2); sh.addColorStop(0, 'rgba(0,0,0,.45)'); sh.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = sh; ctx.beginPath(); ctx.ellipse(cx, floor + 10 * U, pr * 1.2, pr * .3, 0, 0, 7); ctx.fill();
    ctx.save(); ctx.fillStyle = metal(ctx, cx - pr, cx + pr, C.metal, rot * .3); ctx.beginPath(); ctx.ellipse(cx, floor, pr, pr * .22, 0, 0, Math.PI); ctx.lineTo(cx - pr, floor - 14 * U); ctx.ellipse(cx, floor - 14 * U, pr, pr * .22, 0, Math.PI, 0, true); ctx.closePath(); ctx.fill(); ctx.restore();
    ell(ctx, cx, floor - 14 * U, pr, pr * .22, tint(C.metal, 1.2));
    ctx.save(); ctx.strokeStyle = tint(C.metal, .6); ctx.lineWidth = 1.5 * U; for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2 + t * .5; const px = cx + Math.cos(a) * pr * .92, py = floor - 14 * U + Math.sin(a) * pr * .2; if (Math.sin(a) > 0) { ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px, py - 5 * U); ctx.stroke(); } } ctx.restore();
    const R = S * .22, top = floor - 14 * U - S * .52 * k(0), bodyH = S * .52 * k(0);
    const cyl = (cy0, hh, col, sh2, ring) => {
      if (hh <= 0) return;
      ctx.fillStyle = metal(ctx, cx - R, cx + R, col, rot + sh2);
      ctx.beginPath(); ctx.ellipse(cx, cy0 + hh, R, R * .22, 0, 0, Math.PI); ctx.lineTo(cx - R, cy0); ctx.ellipse(cx, cy0, R, R * .22, 0, Math.PI, 0, true); ctx.closePath(); ctx.fill();
      const tg = ctx.createRadialGradient(cx - R * .3, cy0 - R * .05, 0, cx, cy0, R); tg.addColorStop(0, tint(col, 1.45)); tg.addColorStop(1, tint(col, .85));
      ctx.fillStyle = tg; ctx.beginPath(); ctx.ellipse(cx, cy0, R, R * .22, 0, 0, 7); ctx.fill();
      if (ring) { ctx.strokeStyle = C.a1; ctx.lineWidth = 5 * U; ctx.beginPath(); ctx.ellipse(cx, cy0 + hh * .18, R, R * .22, 0, 0, Math.PI); ctx.stroke(); }
    };
    if (seed % 2 === 1) {
      // 爆炸图：三层沿中轴拉开
      const sep = S * .12 * k(1), parts = [[C.metal, .05, true], [C.a2, .2, false], [C.metal, .35, false]];
      ctx.save(); ctx.setLineDash([10 * U, 8 * U]); ctx.strokeStyle = C.fg; ctx.globalAlpha = .4; ctx.lineWidth = 1.5 * U; ctx.beginPath(); ctx.moveTo(cx, top - sep * 2.4 - 30 * U); ctx.lineTo(cx, floor); ctx.stroke(); ctx.restore();
      parts.slice().reverse().forEach(([col, s2, ring], j) => { const i = 2 - j, hh = bodyH / 3, cy0 = top + i * hh - (2 - i) * sep; cyl(cy0, hh * .92, col, s2, ring); });
      this.callout(ctx, cx + R, top - sep * 2 + bodyH * .1, x + w - 40 * U, top - sep * 2 - 30 * U, 'A-01 / CAP', k(2));
      this.callout(ctx, cx - R, top + bodyH * .5 - sep, x + 10 * U, top + bodyH * .4, 'A-02 / CORE', k(2.5));
    } else {
      cyl(top, bodyH, C.metal, 0, true);
      // 格栅孔
      if (k(1) > 0) { ctx.save(); ctx.globalAlpha = .55 * k(1); ctx.fillStyle = tint(C.metal, .35); for (let r = 0; r < 7; r++) for (let c = -6; c <= 6; c++) { const a = c / 6 * 1.2 + rot * .2; if (Math.abs(a) > 1.35) continue; circ(ctx, cx + Math.sin(a) * R * .9, top + bodyH * (.35 + r * .08), 3.2 * U * Math.cos(a), tint(C.metal, .35)); } ctx.restore(); }
      this.callout(ctx, cx + R * .7, top + bodyH * .2, x + w - 40 * U, top + bodyH * .05, 'Ø ' + Math.round(R * 2 / U), k(2));
      this.callout(ctx, cx - R * .8, top + bodyH * .6, x + 10 * U, top + bodyH * .72, 'R ' + Math.round(R * .22 / U), k(2.5));
    }
  },
});
