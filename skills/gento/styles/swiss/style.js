/* 幻燈 GENTO · 风格包：瑞士网格（swiss）
   国际主义平面：十二栏网格、无衬线大字、一个强调色、没有投影。
   动作是遮罩上移和整块滑入，干净利落，不抖。 */
const STYLE = defineStyle({
  id: 'swiss',
  palettes: {
    white: { bg: '#F4F4F0', bg2: '#E6E6E1', fg: '#111111', muted: '#85857F', a1: '#E3000F', a2: '#111111', a3: '#D8D8D2', dark: '#111111', onDark: '#F4F4F0', line: '#111111', white: '#FFFFFF', shadow: 'transparent', skin: '#EFCBAA', coat: '#111111', onA1: '#FFFFFF', onA2: '#FFFFFF', onA3: '#111111', flash: '#E3000F' },
    black: { bg: '#121212', bg2: '#1C1C1C', fg: '#F2F2EE', muted: '#8C8C86', a1: '#FFD400', a2: '#F2F2EE', a3: '#3A3A3A', dark: '#000000', onDark: '#F2F2EE', line: '#F2F2EE', white: '#1C1C1C', panelFg: '#F2F2EE', shadow: 'transparent', skin: '#E8C9A8', coat: '#3A3A3A', hair: '#F2F2EE', onA1: '#121212', onA2: '#121212', onA3: '#F2F2EE', lightA2: true, flash: '#FFD400', scrim: 'rgba(0,0,0,.6)' },
    cream: { bg: '#EFE9DC', bg2: '#E2DBCA', fg: '#1B1B1B', muted: '#8B8577', a1: '#1F4AB8', a2: '#1B1B1B', a3: '#E4572E', dark: '#1B1B1B', onDark: '#EFE9DC', line: '#1B1B1B', white: '#FAF7F0', shadow: 'transparent', skin: '#EFCBAA', coat: '#1F4AB8', onA1: '#FAF7F0', onA2: '#FAF7F0', onA3: '#FAF7F0', flash: '#1F4AB8' },
  },
  fonts: {
    zh: { head: { f: '"Noto Sans SC","PingFang SC",sans-serif', w: 900, ls: -.02 }, body: { f: '"Noto Sans SC","PingFang SC",sans-serif', w: 700, also: [500] }, shout: { f: '"Noto Sans SC",sans-serif', w: 900, ls: -.03 }, latin: { f: '"Inter Tight","Noto Sans SC",sans-serif', w: 800, ls: -.035 }, mono: { f: '"JetBrains Mono","Noto Sans SC",monospace', w: 500, also: [700] } },
    ja: { head: { f: '"Noto Sans JP","Hiragino Sans",sans-serif', w: 900, ls: -.02 }, body: { f: '"Noto Sans JP",sans-serif', w: 700, also: [500] }, shout: { f: '"Noto Sans JP",sans-serif', w: 900 }, latin: { f: '"Inter Tight","Noto Sans JP",sans-serif', w: 800, ls: -.035 }, mono: { f: '"JetBrains Mono","Noto Sans JP",monospace', w: 500, also: [700] } },
    en: { head: { f: '"Inter Tight",sans-serif', w: 800, ls: -.035 }, body: { f: '"Inter Tight",sans-serif', w: 500, also: [800] }, shout: { f: '"Inter Tight",sans-serif', w: 800, ls: -.04 }, latin: { f: '"Inter Tight",sans-serif', w: 800, ls: -.035 }, mono: { f: '"JetBrains Mono",monospace', w: 500, also: [700] } },
  },
  lw: .7, plates: false, voidTol: .3,
  motion: { shake: .35, jitter: 0, push: .015, cutLen: .22 },

  bg(ctx, u, d, t, o = {}) {
    const tn = o.tone || 'base';
    field(ctx, tone(tn));
    // 十二栏网格 + 基线网格，淡到只在留白处看得见
    ctx.save(); ctx.strokeStyle = onTone(tn); ctx.globalAlpha = .07; ctx.lineWidth = 1;
    const cols = TALL ? 6 : 12, gw = (W - 2 * L.m) / cols;
    for (let i = 0; i <= cols; i++) { const x = L.m + i * gw; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = L.top; y < H; y += 48 * U) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    ctx.globalAlpha = .35; ctx.lineWidth = 1.5;
    for (const [x, y] of [[L.m * .5, L.m * .5], [W - L.m * .5, L.m * .5], [L.m * .5, H - L.m * .5], [W - L.m * .5, H - L.m * .5]]) { ctx.beginPath(); ctx.moveTo(x - 14, y); ctx.lineTo(x + 14, y); ctx.moveTo(x, y - 14); ctx.lineTo(x, y + 14); ctx.stroke(); }
    ctx.restore();
    if (o.poster) { ctx.fillStyle = C.a1; const r = Math.min(W, H) * .42, k = eOut(P(u, 0, .4)); ctx.beginPath(); ctx.arc(W - L.m - r * .6, H * .5, r * k, 0, 7); ctx.fill(); }
  },
  // 切场：强调色整块从左往右扫过
  cut(ctx, k) { ctx.fillStyle = C.flash || C.a1; const x = (1 - k) * W * 1.1; ctx.fillRect(x - W * .12, 0, W * .12 * (k > .05 ? 1 : 0), H); },
  shade(ctx, x, y, w, h) { ctx.fillStyle = 'rgba(0,0,0,.14)'; ctx.fillRect(x, y, w, h); },
  cheek() {},
  panelShadow() {},
  panel(ctx, x, y, w, h, o = {}) {
    ctx.fillStyle = o.fill || C.white; ctx.fillRect(x, y, w, h);
    ctx.lineWidth = 2.5 * U; ctx.strokeStyle = C.line; ctx.strokeRect(x, y, w, h);
    if (o.head) { ctx.fillStyle = C.line; ctx.fillRect(x, y, w, 56 * U); ctx.fillStyle = C.a1; ctx.fillRect(x, y, 18 * U, 56 * U); text(ctx, o.head, x + 40 * U, y + 29 * U, { size: 24 * U, font: F.mono, weight: 700, align: 'left', color: C.bg, meta: true }); }
    return { x: x + 36 * U, y: y + (o.head ? 84 : 32) * U, w: w - 72 * U, h: h - (o.head ? 116 : 64) * U };
  },
  title(ctx, s, x, y, o = {}) { text(ctx, s, x, y, { size: o.size || 120, font: o.font || F.head, align: o.align || 'left', color: o.color || C.fg, scale: o.scale, alpha: o.alpha, g: o.g }); },
  // 重击：遮罩从下往上揭开，整块上移
  hit(ctx, s, x, y, u, t0, o = {}) {
    if (u < t0) return;
    const size = o.size || 220, k = eOut(P(u, t0, t0 + .2 * PACE.enter)), role = o.font || F.head, al = o.align || 'left';
    const w = tw(ctx, s, size, role), x0 = al === 'left' ? x : al === 'right' ? x - w : x - w / 2;
    ctx.save(); ctx.beginPath(); ctx.rect(x0 - 40, y - size * .62, w + 80, size * 1.3); ctx.clip();
    text(ctx, s, x, y + (1 - k) * size * 1.1, { size, font: role, align: al, color: o.color || C.a1, g: o.g });
    ctx.restore();
    ctx.fillStyle = o.color || C.a1; ctx.fillRect(x0, y + size * .5, w * eOut(P(u, t0 + .1, t0 + .35)), 8 * U);
  },
  // 章：实心圆标签
  seal(ctx, s, x, y, k, o = {}) {
    if (k <= 0) return;
    const size = o.size || 200, role = /^[\x00-\x7f]+$/.test(s) ? F.latin : F.head, r = size * .72, fs = fitText(ctx, s, r * 1.55, size * .5, role);
    const sc = eOut(clamp(k));
    ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc);
    circ(ctx, 0, 0, r, o.color && o.color !== C.a3 ? o.color : C.a1);
    text(ctx, s, 0, size * .02, { size: fs, font: role, color: C.onA1 || C.white, g: 'seal' });
    ctx.restore();
    // 实心圆会盖住底下的字，参与重叠检查
    if (QA.on) QA.boxes.push({ s, x0: x - r * .8, y0: y - r * .8, x1: x + r * .8, y1: y + r * .8, px: size, a: 1, g: 'seal' });
  },
  // 强调：短语下面一条实心粗线
  marker(ctx, x, y, w, h, k) { if (k <= 0) return; ctx.fillStyle = C.a1; ctx.fillRect(x + 8 * U, y + h - 10 * U, (w - 16 * U) * k, 10 * U); },
  caption(ctx, u, t0, t1, segs, o = {}) {
    if (u < t0 || u > t1) return;
    const size = o.size || 46 * U, role = o.font || F.body, pad = 34 * U;
    const w = segs.reduce((a, [s]) => a + tw(ctx, s, size, role), 0) + pad * 2, h = size + 36 * U, x = L.left, y = (o.y ?? L.capY) - h / 2;
    const kin = eOut(P(u, t0, t0 + .18)), kout = eIn(P(u, t1 - .12, t1));
    ctx.save(); ctx.beginPath(); ctx.rect(x, y + h * kout, Math.min(w, L.cw), h * (kin - kout)); ctx.clip();
    ctx.fillStyle = C.line; ctx.fillRect(x, y, Math.min(w, L.cw), h);
    rich(ctx, segs.map(([s, c]) => [s, c === C.a3 || c === C.a1 ? C.a1 : c || C.bg]), x + pad, y + h / 2 + 2, size, { font: role });
    ctx.restore();
  },
  // 字卡：整屏色块，字从下沿揭开，压在左下
  wordCard(ctx, u, i, word, o = {}) {
    const tn = o.tone || ['base', 'a1', 'dark', 'base'][i % 4];
    this.bg(ctx, u, 0, 0, { tone: tn });
    const latin = /^[\x00-\x7f]+$/.test(word), role = latin ? F.latin : F.head;
    const size = fitText(ctx, word, W - 2 * L.m, (latin ? 520 : 400) * U, role), k = eOut(P(u, 0, .18));
    const y = H - L.m - size * .42;
    ctx.save(); ctx.beginPath(); ctx.rect(0, y - size * .62, W, size * 1.24); ctx.clip();
    text(ctx, word, L.m - size * .04, y + (1 - k) * size, { size, font: role, align: 'left', color: tn === 'base' ? C.fg : onTone(tn), g: 'wc' });
    ctx.restore();
    text(ctx, `${pad2(i + 1)}`, W - L.m, L.m, { size: 40 * U, font: F.mono, weight: 700, align: 'right', color: tn === 'a1' ? onTone(tn) : C.a1 });
  },
  chapter(ctx, u, d, t, o) {
    const tn = o.tone || ['base', 'a1', 'dark', 'base'][(o.n - 1) % 4], fg = tn === 'a1' ? onTone(tn) : tn === 'dark' ? C.onDark : C.fg;
    this.bg(ctx, u, d, t, { tone: tn });
    const G = chapterGeom(), x0 = L.m, ts = fitText(ctx, o.title, WIDE ? W * .5 : L.cw, 150 * U, F.head);
    const room = !WIDE ? W : W - x0 - Math.max(tw(ctx, o.title, ts, F.head), tw(ctx, o.tag, 64 * U, F.head)) - 60 * U;
    const ns = Math.min(!WIDE ? G.ns * 1.15 : H * 1.02, room * 1.1 / Math.max(.1, tw(ctx, pad2(o.n), 1, F.latin))), k = eOut(P(u, 0, .22));
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.clip();
    text(ctx, pad2(o.n), !WIDE ? W + ns * .08 : W + ns * .06, (!WIDE ? G.cy : H * .56) + (1 - k) * ns * .5, { size: ns, font: F.latin, align: 'right', color: tn === 'a1' ? onTone(tn) : C.a1, alpha: tn === 'a1' ? .18 : 1, bleed: true, g: 'num' });
    ctx.restore();
    const y0 = !WIDE ? G.y0 : H * .36;
    ctx.fillStyle = fg; ctx.fillRect(x0, y0 - 110 * U, 260 * U * eOut(P(u, .05, .3)), 12 * U);
    text(ctx, o.tag, x0, y0, { size: 64 * U, font: F.head, align: 'left', color: fg, alpha: k });
    this.hit(ctx, o.title, x0, y0 + ts * .95, u, .08, { size: ts, color: fg });
    text(ctx, `${o.en || 'NO.'} ${pad2(o.n)} / ${pad2(o.total)}`, x0, y0 + ts * 1.85, { size: 26 * U, font: F.mono, weight: 700, align: 'left', color: fg, alpha: P(u, .15, .3), meta: true });
  },
  bar(ctx, x, y, w, h, col) { ctx.fillStyle = col; ctx.fillRect(x, y, w, h); },
  link(ctx, x0, y0, x1, y1, k, o = {}) { arrow(ctx, x0, y0, x1, y1, k, { lw: 5, color: C.line, head: o.head, hs: 18 }); },
  // 主视觉：被画框裁掉一半的大圆 + 黑色条块 + 旋转刻度环
  ornament(ctx, x, y, w, h, u, t, o = {}) {
    const R = Math.min(w, h) * .46, cx = x + w * .56, cy = y + h * .5, seed = o.seed || 0;
    const k = i => o.quiet ? 1 : eOut(P(u, i * BT * .5, i * BT * .5 + .3));
    ctx.save(); ctx.beginPath(); ctx.rect(x - 20, y, w + L.m + 40, h); ctx.clip();
    circ(ctx, cx + R * .15, cy, R * k(0), seed % 2 ? C.line : C.a1);
    const bars = 5, bw = w * .08;
    for (let i = 0; i < bars; i++) { const kk = k(1 + i * .3), bh = h * (.25 + .55 * hash(i + seed * 7)); ctx.fillStyle = i === 2 ? C.a1 : C.line; ctx.fillRect(x + i * bw * 1.35, y + h - bh * kk, bw, bh * kk); }
    ctx.restore();
    ctx.save(); ctx.translate(cx + R * .15, cy); ctx.rotate(t * .25 + seed);
    ctx.strokeStyle = C.line; ctx.lineWidth = 2 * U;
    for (let i = 0; i < 60; i++) { const a = i / 60 * Math.PI * 2, r1 = R * 1.08, r2 = r1 + (i % 5 ? 10 : 24) * U; if (i / 60 > k(2)) break; ctx.beginPath(); ctx.moveTo(Math.cos(a) * r1, Math.sin(a) * r1); ctx.lineTo(Math.cos(a) * r2, Math.sin(a) * r2); ctx.stroke(); }
    ctx.restore();
    text(ctx, `N°${pad2(seed + 1)}`, x + w - 10 * U, y + 30 * U, { size: 26 * U, font: F.mono, weight: 700, align: 'right', color: C.fg, alpha: k(2), meta: true });
  },
});
