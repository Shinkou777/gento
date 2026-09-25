/* 幻燈 GENTO · 风格包：卡通波普（toon）
   美式卡通和日式夸张动画的路数：粗黑描边、平涂不渐变、夕阳色带、放射线底、爆炸框、硬投影、弹跳挤压。 */
const STYLE = defineStyle({
  id: 'toon',
  palettes: {
    sunset: { bg: '#FF7A3D', bg2: '#FFB23D', fg: '#14081F', muted: '#5A2A6E', a1: '#FF2E7E', a2: '#7A2EFF', a3: '#FFE14D', dark: '#14081F', onDark: '#FFF1E0', line: '#14081F', white: '#FFF6EA', shadow: '#14081F', skin: '#FFC7A0', coat: '#7A2EFF', hair: '#14081F', panelFg: '#14081F', onA1: '#FFF6EA', onA2: '#FFF6EA', onA3: '#14081F', flash: '#FFF6EA', scrim: 'rgba(20,8,31,.55)', road: '#4A3466', bands: ['#FFD23F', '#FFA53D', '#FF7A3D', '#FF4F6B', '#C73BD9', '#7A2EFF'] },
    neon: { bg: '#1B0F2E', bg2: '#2A1748', fg: '#FFF0FA', muted: '#9C84C4', a1: '#FF3DA5', a2: '#3DF2FF', a3: '#FFE14D', dark: '#0A0710', onDark: '#FFF0FA', line: '#0A0710', white: '#FFFFFF', shadow: '#0A0710', skin: '#FFC7A0', coat: '#FF3DA5', hair: '#0A0710', panelFg: '#0A0710', onA1: '#0A0710', onA2: '#0A0710', onA3: '#0A0710', lightA2: true, flash: '#FFFFFF', scrim: 'rgba(10,7,16,.6)', road: '#2A2240', bands: ['#1B0F2E', '#241440', '#2E1A52', '#3B1F66', '#2E1A52', '#1B0F2E'] },
    noon: { bg: '#FFE45C', bg2: '#FFF3A8', fg: '#111111', muted: '#6E6A5E', a1: '#FF3B3B', a2: '#2F6BFF', a3: '#FFFFFF', dark: '#111111', onDark: '#FFE45C', line: '#111111', white: '#FFFFFF', shadow: '#111111', skin: '#FFC7A0', coat: '#2F6BFF', hair: '#111111', panelFg: '#111111', onA1: '#FFFFFF', onA2: '#FFFFFF', onA3: '#111111', lightA2: true, flash: '#FFFFFF', scrim: 'rgba(17,17,17,.5)', road: '#8E8C9A', bands: ['#FFF3A8', '#FFEA7A', '#FFE45C', '#FFD84A', '#FFE45C', '#FFF3A8'] },
  },
  fonts: {
    zh: { head: { f: '"ZCOOL QingKe HuangYou","Noto Sans SC",sans-serif', w: 400 }, body: { f: '"Noto Sans SC","PingFang SC",sans-serif', w: 900, also: [500] }, shout: { f: '"ZCOOL QingKe HuangYou","Noto Sans SC",sans-serif', w: 400 }, latin: { f: '"Bangers","Noto Sans SC",sans-serif', w: 400, ls: .03 }, mono: { f: '"IBM Plex Mono","Noto Sans SC",monospace', w: 700, also: [500] } },
    ja: { head: { f: '"Dela Gothic One","Noto Sans JP",sans-serif', w: 400 }, body: { f: '"Noto Sans JP","Hiragino Sans",sans-serif', w: 900, also: [500] }, shout: { f: '"Dela Gothic One","Noto Sans JP",sans-serif', w: 400 }, latin: { f: '"Bangers","Noto Sans JP",sans-serif', w: 400, ls: .03 }, mono: { f: '"IBM Plex Mono","Noto Sans JP",monospace', w: 700, also: [500] } },
    en: { head: { f: '"Bangers",sans-serif', w: 400, ls: .03 }, body: { f: '"Inter",system-ui,sans-serif', w: 800, also: [500] }, shout: { f: '"Bangers",sans-serif', w: 400, ls: .03 }, latin: { f: '"Bangers",sans-serif', w: 400, ls: .03 }, mono: { f: '"IBM Plex Mono",monospace', w: 700, also: [500] } },
  },
  lw: 1.3, plates: false, voidTol: .28, takeLabel: 'CUT',
  motion: { hitFrom: 1.7, hitLen: .1, shake: 1.5, jitter: 0, push: .045, cutLen: .07 },

  // 放射线：从 (cx, cy) 往外的扇形，交替上色
  burst(ctx, cx, cy, rot, col, n = 16) {
    const R = Math.hypot(W, H) * 1.2;
    ctx.save(); ctx.fillStyle = col; ctx.beginPath();
    for (let i = 0; i < n; i++) { const a0 = rot + i / n * Math.PI * 2, a1 = a0 + Math.PI / n; ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a0) * R, cy + Math.sin(a0) * R); ctx.lineTo(cx + Math.cos(a1) * R, cy + Math.sin(a1) * R); ctx.closePath(); }
    ctx.fill(); ctx.restore();
  },
  // 斜条纹，慢慢往一边走
  stripes(ctx, col, t, w = 60) {
    const s = w * U * 2, off = (t * 40 * U) % s;
    ctx.save(); ctx.fillStyle = col; ctx.beginPath();
    for (let x = -H - s + off; x < W + s; x += s) { ctx.moveTo(x, H); ctx.lineTo(x + w * U, H); ctx.lineTo(x + w * U + H, 0); ctx.lineTo(x + H, 0); ctx.closePath(); }
    ctx.fill(); ctx.restore();
  },
  // 夕阳色带：几道平涂横带，不渐变
  bands(ctx) { const b = C.bands || [C.bg], h = H / b.length; b.forEach((c, i) => { ctx.fillStyle = c; ctx.fillRect(-100, i * h - 1, W + 200, h + 2); }); },
  bg(ctx, u, d, t, o = {}) {
    const tn = o.tone || 'base';
    if (tn === 'base' && !o.plain) this.bands(ctx); else field(ctx, tone(tn));
    if (o.plain) return;
    const i = o.deco ?? 0, col = tn === 'dark' ? tint(C.a2, 1, .28) : tint(C.line, 1, .07);
    // 花纹放在图的一侧，不压正文
    if (o.poster || i % 3 === 0) this.burst(ctx, WIDE ? W * .8 : W * .5, WIDE ? H * .55 : H * .8, t * .12, col, 18);
    else if (i % 3 === 1) this.stripes(ctx, col, t);
    else { ctx.save(); ctx.fillStyle = dots(ctx, col, 26 * U, .32); ctx.beginPath(); ctx.arc(WIDE ? W : W / 2, H, Math.max(W, H) * .5, 0, 7); ctx.fill(); ctx.restore(); }
  },
  post() {},
  // 切场：一帧黑一帧白的冲击帧
  cut(ctx, k) { ctx.globalAlpha = .9 * k; ctx.fillStyle = k > .55 ? C.line : C.flash; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; },
  shade(ctx, x, y, w, h) { ctx.save(); ctx.globalAlpha = .22; ctx.fillStyle = C.line; ctx.fillRect(x, y, w, h); ctx.restore(); },
  cheek(ctx, x, y, w, h) { ctx.save(); ctx.globalAlpha = .45; ell(ctx, x + w / 2, y + h / 2, w * .22, h * .12, C.a1); ctx.restore(); },
  panelShadow(ctx, x, y, w, h, r = 0) { ctx.fillStyle = C.shadow; ctx.beginPath(); ctx.roundRect(x + 14 * U, y + 16 * U, w, h, r || 26 * U); ctx.fill(); },
  panel(ctx, x, y, w, h, o = {}) {
    const r = o.r ?? 26 * U;
    this.panelShadow(ctx, x, y, w, h, r);
    rr(ctx, x, y, w, h, r, o.fill || C.white, C.line, 6);
    if (o.head) {
      ctx.save(); ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.clip(); ctx.fillStyle = C.a1; ctx.fillRect(x, y, w, 62 * U); ctx.restore();
      ctx.lineWidth = LW(6); ctx.strokeStyle = C.line; ctx.beginPath(); ctx.moveTo(x, y + 62 * U); ctx.lineTo(x + w, y + 62 * U); ctx.stroke();
      text(ctx, o.head, x + 36 * U, y + 32 * U, { size: 30 * U, font: F.shout, align: 'left', color: C.onA1, meta: true });
    }
    return { x: x + 36 * U, y: y + (o.head ? 92 : 36) * U, w: w - 72 * U, h: h - (o.head ? 128 : 72) * U };
  },
  // 大标题：粗黑描边 + 硬投影
  title(ctx, s, x, y, o = {}) {
    const size = o.size || 120;
    text(ctx, s, x, y, { size, font: o.font || F.head, align: o.align || 'left', color: o.color || C.fg, stroke: o.color && o.color !== C.line ? C.line : null, strokeW: size * .11, shadow: C.line, sdx: size * .05, sdy: size * .06, scale: o.scale, alpha: o.alpha, g: o.g });
  },
  // 重击：砸进来、歪一下、描边带投影，落地后抖两下
  hit(ctx, s, x, y, u, t0, o = {}) {
    if (u < t0) return;
    const size = o.size || 220, dt = u - t0, sc = slamS(u, t0, this.motion.hitFrom, this.motion.hitLen) * (o.scale ?? 1), wob = Math.sin(dt * 38) * Math.exp(-dt * 8) * .07;
    const col = o.color || C.a1;
    text(ctx, s, x, y, { size, font: o.font || F.head, align: o.align || 'left', color: col, scale: sc, rot: (o.rot ?? -.04) + wob, stroke: col === C.line ? C.white : C.line, strokeW: size * .13, shadow: C.line, sdx: size * .06, sdy: size * .07, g: o.g });
  },
  // 章：爆炸框
  seal(ctx, s, x, y, k, o = {}) {
    if (k <= 0) return;
    const size = Math.min(o.size || 200, 250 * U), r = size * .82, sc = eBack(clamp(k)), rot = o.rot ?? -.1, fill = o.color || C.a3;
    const role = /^[\x00-\x7f]+$/.test(s) ? F.latin : F.shout, fs = fitText(ctx, s, r * 1.25, size * .46, role);
    const pts = []; for (let i = 0; i < 28; i++) { const a = i / 28 * Math.PI * 2, rr_ = i % 2 ? r * .7 : r * (1 + .1 * Math.sin(i * 2.7)); pts.push([Math.cos(a) * rr_, Math.sin(a) * rr_]); }
    ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc); ctx.rotate(rot);
    poly(ctx, pts.map(([px, py]) => [px + 12 * U, py + 14 * U]), C.line);
    poly(ctx, pts, fill, C.line, 7);
    ctx.restore();
    const on = fill === C.a1 ? C.onA1 : fill === C.a2 ? C.onA2 : fill === C.a3 ? C.onA3 : C.fg;
    text(ctx, s, x, y, { size: fs * sc, font: role, color: on, rot, g: 'seal' });
  },
  // 强调：粗锯齿下划线
  marker(ctx, x, y, w, h, k, o = {}) {
    if (k <= 0) return;
    const yy = y + h - 4 * U, n = Math.max(3, Math.round(w / (26 * U))), pts = [];
    for (let i = 0; i <= n * k; i++) pts.push([x + i * w / n, yy + (i % 2 ? 9 : -3) * U]);
    if (pts.length < 2) return;
    ctx.save(); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    ctx.strokeStyle = C.line; ctx.lineWidth = LW(14); ctx.beginPath(); pts.forEach(([px, py], i) => i ? ctx.lineTo(px, py) : ctx.moveTo(px, py)); ctx.stroke();
    ctx.strokeStyle = o.color || C.a3; ctx.lineWidth = LW(8); ctx.stroke(); ctx.restore();
  },
  wordCard(ctx, u, i, word, o = {}) {
    const tones = ['base', 'a2', 'a1', 'dark'], tn = o.tone || tones[i % 4];
    if (tn === 'base') this.bands(ctx); else field(ctx, tone(tn));
    this.burst(ctx, W / 2, H / 2, u * .5 + i, tn === 'dark' ? tint(C.a2, 1, .3) : tint(C.line, 1, .12), 20);
    const latin = /^[\x00-\x7f]+$/.test(word), role = latin ? F.latin : F.head, size = fitText(ctx, word, W * .8, (latin ? 520 : 400) * U, role);
    const col = tn === 'base' ? C.a3 : tn === 'a1' ? C.a3 : tn === 'a2' ? C.a3 : C.a1;
    this.hit(ctx, word, W / 2, H / 2, u, 0, { size, font: role, align: 'center', color: col, g: 'wc' });
  },
  chapter(ctx, u, d, t, o) {
    const G = chapterGeom(.9), tn = o.tone || ['a2', 'dark', 'a1'][(o.n - 1) % 3];
    field(ctx, tone(tn));
    this.burst(ctx, G.cx, G.cy, t * .2, tn === 'dark' ? tint(C.a2, 1, .3) : tint(C.line, 1, .14), 18);
    const n = String(o.n), ns = Math.min(G.ns, (WIDE ? W * .3 : W * .5) / Math.max(1, tw(ctx, n, 1, F.latin)));
    this.hit(ctx, n, G.cx, G.cy, u, 0, { size: ns, font: F.latin, align: 'center', color: C.a3, g: 'num' });
    text(ctx, o.tag, G.x0, G.y0, { size: 110 * U, font: F.head, align: 'left', color: onTone(tn), stroke: C.line, strokeW: 12 * U, alpha: eOut(P(u, 0, .2)) });
    const ts = fitText(ctx, o.title, G.tw, 96 * U, F.head);
    this.hit(ctx, o.title, G.x0, G.y0 + 170 * U, u, .12, { size: ts, color: C.a3 });
    text(ctx, `${o.en || 'EPISODE'} ${n} / ${o.total}`, G.x0, G.y0 + 290 * U, { size: 28 * U, font: F.latin, align: 'left', color: onTone(tn), alpha: .85 * P(u, .15, .3), meta: true });
  },
  bar(ctx, x, y, w, h, col) {
    rr(ctx, x + 10 * U, y + 12 * U, w, h, 10 * U, C.line);
    rr(ctx, x, y, w, h, 10 * U, col, C.line, 6);
    if (h > 40 * U) { ctx.save(); ctx.globalAlpha = .35; ctx.fillStyle = C.white; ctx.fillRect(x + w * .14, y + 12 * U, w * .12, h - 24 * U); ctx.restore(); }
  },
  link(ctx, x0, y0, x1, y1, k, o = {}) { arrow(ctx, x0, y0, x1, y1, k, { lw: 9, color: C.line, head: o.head, hs: 24 }); },
  // 主视觉：贴纸堆（星、闪电、圆），一拍弹出一个，一直轻轻晃
  ornament(ctx, x, y, w, h, u, t, o = {}) {
    const cx = x + w / 2, cy = y + h / 2, R = Math.min(w, h) * .42, seed = o.seed || 0;
    const k = i => o.quiet ? 1 : eBack(P(u, i * BT * .5, i * BT * .5 + .35));
    const cols = [C.a1, C.a2, C.a3];
    const star = (sx, sy, r, rot, col, kk) => { if (kk <= 0) return; const pts = []; for (let i = 0; i < 10; i++) { const a = rot + i / 10 * Math.PI * 2 - Math.PI / 2, rr_ = (i % 2 ? r * .45 : r) * kk; pts.push([sx + Math.cos(a) * rr_, sy + Math.sin(a) * rr_]); } poly(ctx, pts.map(([px, py]) => [px + 10 * U, py + 12 * U]), C.line); poly(ctx, pts, col, C.line, 7); };
    const bolt = (bx, by, s, col, kk) => { if (kk <= 0) return; const pts = [[0, -1], [.45, -1], [.1, -.1], [.55, -.1], [-.2, 1.1], [.05, .15], [-.35, .15]].map(([px, py]) => [bx + px * s * kk, by + py * s * kk]); poly(ctx, pts.map(([px, py]) => [px + 10 * U, py + 12 * U]), C.line); poly(ctx, pts, col, C.line, 7); };
    const bob = i => Math.sin(t * 3 + i * 1.7) * 8 * U;
    circ(ctx, cx - R * .2 + 12 * U, cy + R * .1 + 14 * U, R * .62 * k(0), C.line); circ(ctx, cx - R * .2, cy + R * .1, R * .62 * k(0), cols[seed % 3], C.line, 7);
    star(cx + R * .45, cy - R * .45 + bob(1), R * .42, t * .4, cols[(seed + 2) % 3], k(1));
    bolt(cx - R * .55, cy - R * .35 + bob(2), R * .5, cols[(seed + 1) % 3], k(2));
    star(cx + R * .55, cy + R * .6 + bob(3), R * .22, -t * .6, C.white, k(3));
  },
});
