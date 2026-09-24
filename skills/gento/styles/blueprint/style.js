/* 幻燈 GENTO · 风格包：蓝图工程（blueprint）
   蓝底白线、坐标网格、图框编号、尺寸标注、剖面斜线；字先描边再上色，零件图一笔笔画出来。 */
const STYLE = defineStyle({
  id: 'blueprint',
  palettes: {
    classic: { bg: '#1C4E8A', bg2: '#184579', fg: '#EAF2FF', muted: '#9DB7DA', a1: '#FFD34D', a2: '#EAF2FF', a3: '#7FD1FF', dark: '#0F2D52', onDark: '#EAF2FF', line: '#EAF2FF', white: '#1F5596', panelFg: '#EAF2FF', shadow: 'transparent', skin: '#1C4E8A', coat: '#1C4E8A', hair: '#1C4E8A', onA1: '#0F2D52', onA2: '#1C4E8A', onA3: '#0F2D52', lightA2: true, flash: '#EAF2FF', scrim: 'rgba(8,24,46,.6)' },
    scope:   { bg: '#0B120D', bg2: '#0F1A12', fg: '#9CFFB0', muted: '#4F8A5C', a1: '#FFB84D', a2: '#9CFFB0', a3: '#4DE3FF', dark: '#050906', onDark: '#9CFFB0', line: '#9CFFB0', white: '#0F1A12', panelFg: '#9CFFB0', shadow: 'transparent', skin: '#0B120D', coat: '#0B120D', hair: '#0B120D', onA1: '#0B120D', onA2: '#0B120D', onA3: '#0B120D', lightA2: true, flash: '#9CFFB0', scrim: 'rgba(0,0,0,.6)' },
    draft:   { bg: '#F4F6F8', bg2: '#E8EDF2', fg: '#1B3B6F', muted: '#7F95B3', a1: '#E0452B', a2: '#1B3B6F', a3: '#8FB3E0', dark: '#12294D', onDark: '#F4F6F8', line: '#1B3B6F', white: '#FFFFFF', panelFg: '#1B3B6F', shadow: 'transparent', skin: '#F4F6F8', coat: '#F4F6F8', hair: '#F4F6F8', onA1: '#FFFFFF', onA2: '#F4F6F8', onA3: '#12294D', flash: '#1B3B6F' },
  },
  fonts: {
    zh: { head: { f: '"Noto Sans SC",sans-serif', w: 700 }, body: { f: '"Noto Sans SC",sans-serif', w: 500, also: [700] }, shout: { f: '"Barlow Condensed","Noto Sans SC",sans-serif', w: 700, up: true }, latin: { f: '"Barlow Condensed","Noto Sans SC",sans-serif', w: 700, up: true, ls: .02 }, mono: { f: '"JetBrains Mono","Noto Sans SC",monospace', w: 500, also: [700] } },
    ja: { head: { f: '"Noto Sans JP",sans-serif', w: 700 }, body: { f: '"Noto Sans JP",sans-serif', w: 500, also: [700] }, shout: { f: '"Barlow Condensed","Noto Sans JP",sans-serif', w: 700, up: true }, latin: { f: '"Barlow Condensed","Noto Sans JP",sans-serif', w: 700, up: true, ls: .02 }, mono: { f: '"JetBrains Mono","Noto Sans JP",monospace', w: 500, also: [700] } },
    en: { head: { f: '"Barlow Condensed",sans-serif', w: 700 }, body: { f: '"Barlow Condensed",sans-serif', w: 500, also: [700] }, shout: { f: '"Barlow Condensed",sans-serif', w: 700, up: true }, latin: { f: '"Barlow Condensed",sans-serif', w: 700, up: true, ls: .02 }, mono: { f: '"JetBrains Mono",monospace', w: 500, also: [700] } },
  },
  lw: .55, plates: false, lineArt: true, voidTol: .28, takeLabel: 'SHEET',
  motion: { hitFrom: 1.15, hitLen: .12, shake: .45, jitter: 0, push: .02, cutLen: .12 },

  textures() {
    const R = rng(5);
    this.noise = cnv(W / 2, H / 2); const g = this.noise.getContext('2d'), im = g.createImageData(this.noise.width, this.noise.height), dd = im.data;
    for (let i = 0; i < dd.length; i += 4) { const v = 128 + (R() - .5) * 70; dd[i] = dd[i + 1] = dd[i + 2] = v; dd[i + 3] = 255; }
    g.putImageData(im, 0, 0);
  },
  bg(ctx, u, d, t, o = {}) {
    const tn = o.tone || 'base';
    field(ctx, tone(tn));
    const lc = tn === 'a1' || tn === 'a3' ? C.dark : tn === 'a2' ? C.bg : C.line;
    ctx.save(); ctx.strokeStyle = lc; ctx.lineWidth = 1;
    const s = 24 * U;
    ctx.globalAlpha = .08; ctx.beginPath(); for (let x = 0; x < W; x += s) { ctx.moveTo(x + .5, 0); ctx.lineTo(x + .5, H); } for (let y = 0; y < H; y += s) { ctx.moveTo(0, y + .5); ctx.lineTo(W, y + .5); } ctx.stroke();
    ctx.globalAlpha = .18; ctx.beginPath(); for (let x = 0; x < W; x += s * 5) { ctx.moveTo(x + .5, 0); ctx.lineTo(x + .5, H); } for (let y = 0; y < H; y += s * 5) { ctx.moveTo(0, y + .5); ctx.lineTo(W, y + .5); } ctx.stroke();
    // 图框 + 边上的分区编号
    const m = 22 * U; ctx.globalAlpha = .55; ctx.lineWidth = 2 * U; ctx.strokeRect(m, m, W - 2 * m, H - 2 * m);
    ctx.restore();
    const cols = TALL ? 4 : 8, rows = TALL ? 8 : 4;
    for (let i = 0; i < cols; i++) text(ctx, String(i + 1), m + (i + .5) * (W - 2 * m) / cols, m * .5 + 2, { size: 15 * U, font: F.mono, color: lc, alpha: .6, deco: true });
    for (let j = 0; j < rows; j++) text(ctx, 'ABCDEFGH'[j], m * .5, m + (j + .5) * (H - 2 * m) / rows, { size: 15 * U, font: F.mono, color: lc, alpha: .6, deco: true });
    if (o.poster) this.gear(ctx, W - L.m - H * .28, H * .52, H * .26, 18, t * .15, 1, C.line, .7);
  },
  post(ctx) {
    ctx.globalCompositeOperation = 'soft-light'; ctx.globalAlpha = .18; ctx.drawImage(this.noise, 0, 0, W, H);
    ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
    const g = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * .5, W / 2, H / 2, Math.max(W, H) * .7);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,10,30,.3)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  },
  cut(ctx, k) { ctx.save(); ctx.strokeStyle = C.flash; ctx.globalAlpha = k; ctx.lineWidth = 3 * U; const y = (1 - k) * H; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); ctx.globalAlpha = k * .25; ctx.fillStyle = C.flash; ctx.fillRect(0, y, W, H - y); ctx.restore(); },
  shade(ctx, x, y, w, h) { ctx.save(); ctx.globalAlpha = .7; ctx.fillStyle = hatch(ctx, C.line, 10, 1.5, 45); ctx.fillRect(x, y, w, h); ctx.restore(); },
  cheek() {},
  panelShadow() {},
  panel(ctx, x, y, w, h, o = {}) {
    ctx.save(); ctx.globalAlpha = .75; ctx.fillStyle = o.fill && o.fill !== C.white ? o.fill : C.white; ctx.fillRect(x, y, w, h); ctx.restore();
    ctx.lineWidth = 2.5 * U; ctx.strokeStyle = C.line; ctx.strokeRect(x, y, w, h);
    ctx.lineWidth = 1 * U; ctx.strokeRect(x + 8 * U, y + 8 * U, w - 16 * U, h - 16 * U);
    if (o.head) { ctx.beginPath(); ctx.moveTo(x, y + 52 * U); ctx.lineTo(x + w, y + 52 * U); ctx.lineWidth = 2 * U; ctx.stroke(); text(ctx, o.head, x + 24 * U, y + 28 * U, { size: 24 * U, font: F.mono, weight: 700, align: 'left', color: C.a1, meta: true }); text(ctx, `REV.${pad2((o.step || 0) + 1)}`, x + w - 24 * U, y + 28 * U, { size: 20 * U, font: F.mono, align: 'right', color: C.muted, meta: true }); }
    return { x: x + 36 * U, y: y + (o.head ? 80 : 32) * U, w: w - 72 * U, h: h - (o.head ? 112 : 64) * U };
  },
  title(ctx, s, x, y, o = {}) { text(ctx, s, x, y, { size: o.size || 120, font: o.font || F.head, align: o.align || 'left', color: o.color || C.fg, scale: o.scale, alpha: o.alpha, g: o.g }); },
  // 重击：先描出字的轮廓，再填色，底下拉一条尺寸线
  hit(ctx, s, x, y, u, t0, o = {}) {
    if (u < t0) return;
    const size = o.size || 220, role = o.font || F.head, al = o.align || 'left', k = P(u, t0, t0 + .35 * PACE.enter), col = o.color || C.a1;
    const w = tw(ctx, s, size, role), x0 = al === 'left' ? x : al === 'right' ? x - w : x - w / 2;
    ctx.save(); ctx.font = font(size, role); ctx.textAlign = al; ctx.textBaseline = 'middle'; ctx.letterSpacing = lsPx({}, role, size) + 'px';
    const Lp = size * 6; ctx.setLineDash([Lp, Lp]); ctx.lineDashOffset = Lp * (1 - eOut(k)); ctx.lineWidth = Math.max(2, size * .02); ctx.strokeStyle = col;
    ctx.strokeText(role.up ? s.toUpperCase() : s, x, y); ctx.restore();
    text(ctx, s, x, y, { size, font: role, align: al, color: col, alpha: eOut(P(u, t0 + .12, t0 + .4)), g: o.g });
    const kd = eOut(P(u, t0 + .15, t0 + .45));
    if (kd > 0 && !o.noDim) { this.dim(ctx, x0, y + size * .62, x0 + w * kd, y + size * .62, col); if (kd > .9) text(ctx, `${Math.round(w)} px`, x0 + w / 2, y + size * .62 + 22 * U, { size: 20 * U, font: F.mono, color: col, meta: true, over: true }); }
  },
  // 尺寸线：两端小斜杠 + 延长线
  dim(ctx, x0, y0, x1, y1, col = C.line) {
    ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 1.5 * U; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1);
    for (const [px, py] of [[x0, y0], [x1, y1]]) { ctx.moveTo(px - 7 * U, py + 7 * U); ctx.lineTo(px + 7 * U, py - 7 * U); ctx.moveTo(px, py - 14 * U); ctx.lineTo(px, py + 10 * U); }
    ctx.stroke(); ctx.restore();
  },
  seal(ctx, s, x, y, k, o = {}) { STYLE_DEFAULTS.seal.call(this, ctx, s, x, y, k, Object.assign({}, o, { color: o.color && o.color !== C.a3 ? o.color : C.a1, mul: false, font: F.shout })); },
  marker(ctx, x, y, w, h, k) {
    if (k <= 0) return;
    ctx.save(); ctx.strokeStyle = C.a1; ctx.lineWidth = 2 * U; ctx.setLineDash([8 * U, 6 * U]); ctx.strokeRect(x - 4 * U, y - 2 * U, (w + 8 * U) * k, h + 4 * U); ctx.restore();
    this.dim(ctx, x, y + h + 14 * U, x + w * k, y + h + 14 * U, C.a1);
  },
  caption(ctx, u, t0, t1, segs, o = {}) {
    if (u < t0 || u > t1) return;
    const size = o.size || 46 * U, role = o.font || F.body, pad = 36 * U;
    const w = segs.reduce((a, [s]) => a + tw(ctx, s, size, role), 0) + pad * 2 + 14 * U, h = size + 36 * U, x = W / 2 - w / 2, y = (o.y ?? L.capY) - h / 2;
    const kin = eOut(P(u, t0, t0 + .14)), kout = eIn(P(u, t1 - .1, t1));
    ctx.save(); ctx.beginPath(); ctx.rect(x - 20 + (w + 40) * kout, y - 20, (w + 40) * (kin - kout), h + 40); ctx.clip();
    ctx.fillStyle = C.dark; ctx.globalAlpha = .85; ctx.fillRect(x, y, w, h); ctx.globalAlpha = 1;
    ctx.strokeStyle = C.line; ctx.lineWidth = 2 * U; ctx.strokeRect(x, y, w, h); ctx.fillStyle = C.a1; ctx.fillRect(x, y, 10 * U, h);
    rich(ctx, segs.map(([s, c]) => [s, c === C.a3 ? C.a1 : c || C.onDark]), x + 14 * U + pad, y + h / 2 + 2, size, { font: role });
    ctx.restore();
  },
  wordCard(ctx, u, i, word, o = {}) {
    const tn = o.tone || ['base', 'dark', 'base', 'dark'][i % 4];
    this.bg(ctx, u, 0, u, { tone: tn });
    const latin = /^[\x00-\x7f]+$/.test(word), role = latin ? F.latin : F.head;
    const size = fitText(ctx, word, W * .78, (latin ? 480 : 380) * U, role);
    this.hit(ctx, word, W / 2, H / 2, u, 0, { size, font: role, align: 'center', color: C.fg, g: 'wc' });
    const cx = W / 2, cy = H / 2, r = size * .7;
    ctx.save(); ctx.strokeStyle = C.a1; ctx.globalAlpha = .7; ctx.lineWidth = 1.2 * U; ctx.setLineDash([24 * U, 6 * U, 4 * U, 6 * U]);
    ctx.beginPath(); ctx.moveTo(cx - W * .45, cy); ctx.lineTo(cx + W * .45, cy); ctx.moveTo(cx, cy - r); ctx.lineTo(cx, cy + r); ctx.stroke(); ctx.restore();
  },
  chapter(ctx, u, d, t, o) {
    const tn = o.tone || ['dark', 'base', 'dark', 'base'][(o.n - 1) % 4];
    this.bg(ctx, u, d, t, { tone: tn });
    const G = chapterGeom(.92), ns = G.ns, cx = G.cx, cy = G.cy;
    this.hit(ctx, pad2(o.n), cx, cy, u, 0, { size: ns, font: F.latin, align: 'center', color: C.a1, g: 'num', noDim: true });
    const x0 = G.x0, y0 = G.y0, k = eOut(P(u, 0, .16));
    text(ctx, `SHEET ${pad2(o.n)} / ${pad2(o.total)}`, x0, y0 - 110 * U, { size: 30 * U, font: F.mono, weight: 700, align: 'left', color: C.a1, alpha: k, meta: true });
    text(ctx, o.tag, x0, y0, { size: 150 * U, font: F.head, align: 'left', color: C.fg, alpha: k });
    const ts = fitText(ctx, o.title, G.tw, 96 * U, F.head);
    stagger(ctx, o.title, x0, y0 + 190 * U, u, .1, { size: ts, color: C.fg, step: .025 });
    this.dim(ctx, x0, y0 + 290 * U, x0 + tw(ctx, o.title, ts, F.head) * eOut(P(u, .2, .5)), y0 + 290 * U, C.a1);
  },
  bar(ctx, x, y, w, h, col) {
    ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip(); ctx.globalAlpha = .9; ctx.fillStyle = hatch(ctx, col, 12, 2, 45); ctx.fillRect(x, y, w, h); ctx.restore();
    ctx.lineWidth = 2.5 * U; ctx.strokeStyle = col; ctx.strokeRect(x, y, w, h);
  },
  link(ctx, x0, y0, x1, y1, k, o = {}) { arrow(ctx, x0, y0, x1, y1, k, { lw: 3, color: C.a1, head: o.head, hs: 18 }); },
  // 齿轮：外齿 + 轮毂 + 螺栓孔 + 中心线
  gear(ctx, cx, cy, R, teeth, rot, k = 1, col = C.line, lw = 1) {
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot); ctx.strokeStyle = col; ctx.lineWidth = 4 * U * lw;
    const Lp = R * 12; ctx.setLineDash([Lp, Lp]); ctx.lineDashOffset = Lp * (1 - k);
    ctx.beginPath();
    for (let i = 0; i <= teeth * 4; i++) { const a = i / (teeth * 4) * Math.PI * 2, r = [R, R, R * .86, R * .86][i % 4]; i ? ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r) : ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r); }
    ctx.closePath(); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 0, R * .28, 0, 7); ctx.stroke(); ctx.beginPath(); ctx.arc(0, 0, R * .62, 0, 7); ctx.stroke();
    for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; ctx.beginPath(); ctx.arc(Math.cos(a) * R * .45, Math.sin(a) * R * .45, R * .06, 0, 7); ctx.stroke(); }
    ctx.restore();
    ctx.save(); ctx.strokeStyle = C.a1; ctx.globalAlpha = .8 * k; ctx.lineWidth = 1.2 * U; ctx.setLineDash([20 * U, 5 * U, 4 * U, 5 * U]);
    ctx.beginPath(); ctx.moveTo(cx - R * 1.15, cy); ctx.lineTo(cx + R * 1.15, cy); ctx.moveTo(cx, cy - R * 1.15); ctx.lineTo(cx, cy + R * 1.15); ctx.stroke(); ctx.restore();
  },
  // 主视觉：一大一小两个齿轮咬合，外径标注，一笔笔画出来
  ornament(ctx, x, y, w, h, u, t, o = {}) {
    const S = Math.min(w, h), seed = o.seed || 0, k = i => o.quiet ? 1 : eOut(P(u, i * BT * .5, i * BT * .5 + BT * 1.2));
    const R1 = S * .37, R2 = S * .22, c1 = [x + w * .42, y + h * .46], c2 = [c1[0] + (R1 + R2) * .88 * Math.cos(-.6), c1[1] + (R1 + R2) * .88 * Math.sin(-.6)];
    this.gear(ctx, c1[0], c1[1], R1, 18, t * .3 + seed, k(0));
    this.gear(ctx, c2[0], c2[1], R2, 11, -t * .3 * 18 / 11 + .15, k(1), C.line, .9);
    const kd = k(2);
    if (kd > 0) {
      this.dim(ctx, c1[0] - R1, c1[1] + R1 + 36 * U, c1[0] - R1 + 2 * R1 * kd, c1[1] + R1 + 36 * U, C.a1);
      if (kd > .9) text(ctx, `Ø ${Math.round(R1 * 2)}`, c1[0], c1[1] + R1 + 60 * U, { size: 22 * U, font: F.mono, weight: 700, color: C.a1, meta: true });
      text(ctx, `T=18 · M=${(R1 / 9 / U).toFixed(1)}`, x + w - 8 * U, y + h - 16 * U, { size: 20 * U, font: F.mono, align: 'right', color: C.muted, alpha: kd, meta: true });
    }
  },
});
