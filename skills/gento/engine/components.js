/* 幻燈 GENTO · engine/components.js
   风格包的默认零件。风格包用 defineStyle({...}) 只覆盖自己不同的部分。
   每个零件的签名在这里定死，场景模板只调这些名字，换风格不用改场景。 */

// 底色名 → 颜色；底色上用什么字色
const tone = n => ({ base: C.bg, alt: C.bg2, dark: C.dark, a1: C.a1, a2: C.a2, a3: C.a3 })[n || 'base'] || n || C.bg;
const onTone = n => ({ base: C.fg, alt: C.fg, dark: C.onDark, a1: C.onA1 || C.white, a2: C.onA2 || C.white, a3: C.onA3 || C.fg })[n || 'base'] || C.fg;
// 对比度：强调色落在底色上看不清时，换成底色对应的字色
const hexLum = h => { h = String(h).replace('#', ''); if (h.length < 6) return .5; const c = [0, 2, 4].map(i => parseInt(h.substr(i, 2), 16) / 255).map(v => v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4)); return .2126 * c[0] + .7152 * c[1] + .0722 * c[2]; };
const contrast = (a, b) => { const x = hexLum(a), y = hexLum(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };
const accentOn = (tn, want = C.a1) => contrast(want, tone(tn)) >= 2.2 ? want : onTone(tn);
const isDarkTone = n => n === 'dark' || (n === 'a2' && !C.lightA2);

// 橡皮图章纹理（懒建）
const _stamp = { worn: null, cache: {} };
function wornMask() {
  if (_stamp.worn) return _stamp.worn;
  const R = rng(11), c = cnv(1600, 800), g = c.getContext('2d');
  for (let i = 0; i < 5200; i++) { g.fillStyle = `rgba(0,0,0,${.3 + R() * .7})`; g.beginPath(); g.arc(R() * 1600, R() * 800, .8 + R() * (R() < .95 ? 2.4 : 9), 0, 7); g.fill(); }
  for (let i = 0; i < 40; i++) { g.strokeStyle = 'rgba(0,0,0,.6)'; g.lineWidth = 1 + R() * 3; const y = R() * 800; g.beginPath(); g.moveTo(R() * 1600, y); g.lineTo(R() * 1600, y + (R() - .5) * 40); g.stroke(); }
  return (_stamp.worn = c);
}
function stampTex(s, size, col, role, o = {}) {
  const key = [s, size, col, role.f, o.round, o.worn].join('|');
  if (_stamp.cache[key]) return _stamp.cache[key];
  const probe = cnv(10, 10).getContext('2d'); probe.font = font(size, role); probe.letterSpacing = '0px';
  const round = o.round, tw0 = probe.measureText(s).width;
  const w = round ? Math.max(tw0 + size * .9, size * 2.4) : tw0 + size * .9, h = round ? w : size * 1.45;
  const c = cnv(w + 40, h + 40), g = c.getContext('2d');
  g.translate(20, 20); g.strokeStyle = col; g.fillStyle = col;
  if (round) { g.lineWidth = size * .075; g.beginPath(); g.arc(w / 2, h / 2, w / 2 - size * .05, 0, 7); g.stroke(); g.lineWidth = size * .025; g.beginPath(); g.arc(w / 2, h / 2, w / 2 - size * .2, 0, 7); g.stroke(); }
  else { g.lineWidth = size * .075; g.beginPath(); g.roundRect(0, 0, w, h, size * .08); g.stroke(); g.lineWidth = size * .025; g.beginPath(); g.roundRect(size * .12, size * .12, w - size * .24, h - size * .24, size * .04); g.stroke(); }
  g.font = font(size, role); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(s, w / 2, h / 2 + size * .04);
  if (o.worn !== false) { g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'destination-out'; g.drawImage(wornMask(), (hash(size) * 400) | 0, 0, Math.min(c.width, 1200), Math.min(c.height, 800), 0, 0, c.width, c.height); }
  return (_stamp.cache[key] = c);
}

// 章节卡几何：横屏左字右号；方图和竖屏上号下字，号的大小受字块上沿限制
function chapterGeom(k = 1) {
  if (WIDE) return { ns: H * .8 * k, cx: W * .73, cy: H * .54, x0: 130 * U, y0: 380 * U, tw: W * .48 };
  const y0 = Math.min(H * .6, H - 480 * U), room = y0 - 180 * U;
  return { ns: Math.min(W * .85, room / .8) * k, cx: W * .6, cy: 30 * U + room / 2, x0: L.m, y0, tw: L.cw };
}
const STYLE_DEFAULTS = {
  lw: 1, plates: true, plateOp: 'multiply', lineArt: false, voidTol: .25, fadeTo: '#000',
  motion: { hitFrom: 1.35, hitLen: .09, shake: 1, jitter: 0, push: .03, cutLen: .09, soft: false },
  textures() {},
  jitter(t) { const j = this.motion.jitter; if (!j) return [0, 0]; const rb = Math.floor(t * 8); return [(hash(rb) - .5) * j, (hash(rb + 9) - .5) * j]; },
  bg(ctx, u, d, t, o = {}) { field(ctx, tone(o.tone)); },
  post(ctx, t, sc) {},
  cut(ctx, k, kind) { ctx.globalAlpha = .8 * k; ctx.fillStyle = C.flash || C.white; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; },
  shade(ctx, x, y, w, h) { ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = dots(ctx, C.line, 12, .3); ctx.fillRect(x, y, w, h); ctx.restore(); },
  cheek(ctx, x, y, w, h) { ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = dots(ctx, C.a1, 11, .28); ctx.fillRect(x, y, w, h); ctx.restore(); },
  panelShadow(ctx, x, y, w, h, r = 0) { ctx.fillStyle = C.shadow; ctx.beginPath(); ctx.roundRect(x + 14 * U, y + 14 * U, w, h, r); ctx.fill(); },
  // 容器卡片。o: { fill, head(标题栏文字), r }
  panel(ctx, x, y, w, h, o = {}) {
    const r = o.r ?? 0;
    this.panelShadow(ctx, x, y, w, h, r);
    rr(ctx, x, y, w, h, r, o.fill || C.white, C.line, 6);
    if (o.head) { ctx.save(); ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.clip(); ctx.fillStyle = C.line; ctx.fillRect(x, y, w, 60 * U); ctx.restore(); text(ctx, o.head, x + 36 * U, y + 31 * U, { size: 26 * U, font: F.mono, align: 'left', color: C.white, meta: true }); }
    return { x: x + 36 * U, y: y + (o.head ? 90 : 36) * U, w: w - 72 * U, h: h - (o.head ? 126 : 72) * U };
  },
  // 大标题（静态出现，签名效果：另一种墨的错位阴影）
  title(ctx, s, x, y, o = {}) {
    text(ctx, s, x, y, { size: o.size || 120, font: o.font || F.head, align: o.align || 'left', color: o.color || C.fg, shadow: o.shadowCol ?? C.a1, sdx: (o.size || 120) * .045, sdy: (o.size || 120) * .037, scale: o.scale, alpha: o.alpha, g: o.g });
  },
  // 重击词：t0 时砸进来
  hit(ctx, s, x, y, u, t0, o = {}) {
    if (u < t0) return;
    const m = this.motion, size = o.size || 220;
    const sc = m.soft ? 1 : slamS(u, t0, m.hitFrom, m.hitLen), al = m.soft ? eOut(P(u, t0, t0 + .5 * PACE.enter)) : 1, dy = m.soft ? (1 - al) * size * .2 : 0;
    text(ctx, s, x, y + dy, { size, font: o.font || F.head, align: o.align || 'left', color: o.color || C.a1, scale: sc * (o.scale ?? 1), alpha: al, shadow: o.shadowCol ?? C.line, sdx: size * .04, sdy: size * .04, g: o.g });
  },
  // 图章 / 落款 / 批注。k: 0→1
  seal(ctx, s, x, y, k, o = {}) {
    if (k <= 0) return;
    const size = o.size || 200, c = stampTex(s, size, o.color || C.a1, o.font || F.shout, o), sc = lerp(2.4, 1, eIn(clamp(k)));
    ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot ?? -.08); ctx.scale(sc, sc);
    ctx.globalAlpha *= lerp(.1, .95, clamp(k)); if (o.mul !== false) ctx.globalCompositeOperation = 'multiply';
    if (QA.on) QA.boxes.push({ s, x0: x - c.width / 2, y0: y - c.height / 2, x1: x + c.width / 2, y1: y + c.height / 2, px: size, a: ctx.globalAlpha, over: true, g: 'seal' });
    ctx.drawImage(c, -c.width / 2, -c.height / 2); ctx.restore();
  },
  // 强调底：荧光笔
  marker(ctx, x, y, w, h, k, o = {}) {
    if (k <= 0) return;
    ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = o.color || C.a3;
    ctx.beginPath(); ctx.moveTo(x, y + 4); ctx.lineTo(x + w * k, y); ctx.lineTo(x + w * k + 6, y + h - 3); ctx.lineTo(x - 4, y + h); ctx.closePath(); ctx.fill(); ctx.restore();
  },
  // 字幕条
  caption(ctx, u, t0, t1, segs, o = {}) {
    if (u < t0 || u > t1) return;
    const size = o.size || 52 * U, pad = 40 * U, role = o.font || F.body;
    const maxW = W - 2 * L.m, total = segs.reduce((a, [s]) => a + tw(ctx, s, size, role), 0);
    const sz = total + pad * 2 + 14 > maxW ? size * (maxW - pad * 2 - 14) / total : size;
    const w = segs.reduce((a, [s]) => a + tw(ctx, s, sz, role), 0) + pad * 2 + 14 * U, h = sz + 40 * U;
    const x = (o.x ?? W / 2) - w / 2, y = (o.y ?? L.capY) - h / 2;
    const kin = eOut(P(u, t0, t0 + .14)), kout = eIn(P(u, t1 - .1, t1));
    ctx.save(); ctx.beginPath(); ctx.rect(x - 20 + (w + 40) * kout, y - 20, (w + 40) * (kin - kout), h + 40); ctx.clip();
    ctx.fillStyle = C.line; ctx.fillRect(x, y, w, h);
    ctx.fillStyle = C.a1; ctx.fillRect(x, y, 14 * U, h);
    rich(ctx, segs.map(([s, c]) => [s, c || C.white]), x + 14 * U + pad, y + h / 2 + 2, sz, { font: role });
    ctx.restore();
  },
  // 冷开场字卡：一拍一张，整屏换色，字砸进来
  wordCard(ctx, u, i, word, o = {}) {
    const tones = ['base', 'a1', 'a2', 'a3'], tn = o.tone || tones[i % 4];
    field(ctx, tone(tn));
    const latin = /^[\x00-\x7f]+$/.test(word), role = latin ? F.latin : F.head;
    let size = (latin ? 560 : 420) * U; size = fitText(ctx, word, W * .86, size, role);
    const sc = this.motion.soft ? 1 : slamS(u, 0, 1.4, .09) * (1 + u * .06), al = this.motion.soft ? eOut(P(u, 0, .4)) : 1;
    ctx.save(); ctx.translate(W / 2, H / 2 + 20 * U); ctx.scale(sc, sc);
    text(ctx, word, 14 * U, 14 * U, { size, font: role, color: tn === 'base' ? C.a1 : C.line, mul: true, alpha: al, g: 'wc' });
    text(ctx, word, 0, 0, { size, font: role, color: onTone(tn), alpha: al, g: 'wc' });
    ctx.restore();
  },
  // 章节卡：大编号 + 标签 + 章名
  chapter(ctx, u, d, t, o) {
    const tn = o.tone || ['a1', 'a3', 'dark', 'a2'][(o.n - 1) % 4], fg = onTone(tn), acc = tn === 'dark' ? C.a1 : tn === 'a3' ? C.a1 : C.line;
    field(ctx, tone(tn));
    const pad2 = n => String(n).padStart(2, '0'), sc = slamS(u, 0, 1.3, .12) * (1 + u * .04);
    const G = chapterGeom(), ns = G.ns;
    ctx.save(); ctx.translate(G.cx, G.cy); ctx.scale(sc, sc);
    ctx.font = font(ns, F.latin); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = dots(ctx, acc, 16, .42, 30); ctx.fillText(pad2(o.n), 0, 0);
    ctx.lineWidth = 7 * U; ctx.strokeStyle = acc; ctx.strokeText(pad2(o.n), 0, 0);
    ctx.restore();
    const k = eOut(P(u, 0, .16)), x0 = G.x0, y0 = G.y0;
    text(ctx, o.tag, lerp(-200, x0, k), y0, { size: 190 * U, font: F.head, align: 'left', color: fg });
    const ts = fitText(ctx, o.title, G.tw, 104 * U, F.head);
    stagger(ctx, o.title, x0, y0 + 230 * U, u, .1, { size: ts, color: fg, step: .025 });
    ctx.fillStyle = fg; ctx.fillRect(x0, y0 + 350 * U, 520 * U * eOut(P(u, .1, .4)), 6 * U);
    text(ctx, `${o.en || 'NO.'} ${pad2(o.n)} / ${pad2(o.total)}`, x0, y0 + 410 * U, { size: 30 * U, font: F.mono, align: 'left', color: fg, alpha: P(u, .15, .3), meta: true });
  },
  // 顶部信息条：卷宗号 + 章节 + 日期
  hud(ctx, t, sc) {
    if (HUDCFG.off || sc.hud === false || !(sc.kind === 'content' || sc.hud === true)) return;
    const dark = isDarkTone(sc.bg && sc.bg.tone), fg = dark ? C.onDark : C.fg, x = L.m * .55, s = U;
    const lab = HUDCFG.label || CFG.title, lw0 = tw(ctx, lab, 22 * s, F.mono);
    ctx.fillStyle = dark ? C.dark : C.bg; ctx.globalAlpha = .85; ctx.fillRect(x - 8 * s, 42 * s, lw0 + 16 * s, 32 * s); ctx.globalAlpha = 1;
    text(ctx, lab, x, 58 * s, { size: 22 * s, font: F.mono, align: 'left', color: fg, meta: true });
    const ch = sc.chapNow;
    if (ch) {
      const w1 = tw(ctx, ch.tag, 26 * s, F.mono), w2 = tw(ctx, ch.title, 26 * s, F.body);
      ctx.fillStyle = fg; ctx.fillRect(x, 80 * s, w1 + w2 + 58 * s, 48 * s);
      text(ctx, ch.tag, x + 18 * s, 105 * s, { size: 26 * s, font: F.mono, align: 'left', color: C.a3, meta: true });
      text(ctx, ch.title, x + 40 * s + w1, 105 * s, { size: 26 * s, font: F.body, align: 'left', color: dark ? C.dark : C.bg, meta: true });
    }
    const dt = sc.date || (HUDCFG.date && HUDCFG.date[sc.n]);
    if (dt) {
      const w = tw(ctx, dt, 28 * s, F.mono) + 76 * s, bx = W - x - w;
      ctx.fillStyle = dark ? C.dark : C.white; ctx.fillRect(bx, 40 * s, w, 52 * s); ctx.lineWidth = 4 * s; ctx.strokeStyle = fg; ctx.strokeRect(bx, 40 * s, w, 52 * s);
      if ((t * 1.6) % 1 < .6) circ(ctx, bx + 26 * s, 66 * s, 9 * s, C.a1);
      text(ctx, dt, bx + 48 * s, 67 * s, { size: 28 * s, font: F.mono, align: 'left', color: fg, meta: true });
    }
  },
  // 柱子（柱状图）
  bar(ctx, x, y, w, h, col, i) {
    ctx.fillStyle = col; ctx.fillRect(x, y, w, h);
    ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip(); this.shade(ctx, x + w * .58, y, w * .42, h); ctx.restore();
    ctx.lineWidth = LW(6); ctx.strokeStyle = C.line; ctx.strokeRect(x, y, w, h);
  },
  // 连线（流程箭头、时间线）。k: 画到的进度
  link(ctx, x0, y0, x1, y1, k, o = {}) { arrow(ctx, x0, y0, x1, y1, k, { lw: 7, color: C.line, head: o.head }); },
  // 结尾弹窗。p: { title, lines: [主, 副], button, icon }
  popup(ctx, x, y, w, h, p) {
    this.panelShadow(ctx, x, y, w, h, 0);
    rr(ctx, x, y, w, h, 0, C.white, C.line, 6);
    ctx.fillStyle = C.bg2; ctx.fillRect(x, y, w, 64 * U); ctx.lineWidth = LW(6); ctx.strokeStyle = C.line; ctx.strokeRect(x, y, w, 64 * U);
    [C.a1, C.a3, C.a2].forEach((c, i) => circ(ctx, x + 45 * U + i * 36 * U, y + 32 * U, 12 * U, c, C.line, 3));
    if (p.title) text(ctx, p.title, x + w / 2, y + 32 * U, { size: 26 * U, font: F.mono, color: C.muted, meta: true });
    icon(ctx, p.icon || 'check', x + 170 * U, y + h / 2 + 30 * U, 150 * U, { fill: C.a2, fill2: C.white });
    const tx = x + 290 * U, mw = w - 330 * U;
    if (p.lines && p.lines[0]) text(ctx, p.lines[0], tx, y + h / 2 - 10 * U, { size: fitText(ctx, p.lines[0], mw, 60 * U, F.body), font: F.body, align: 'left', color: C.panelFg || C.fg });
    if (p.lines && p.lines[1]) text(ctx, p.lines[1], tx, y + h / 2 + 56 * U, { size: fitText(ctx, p.lines[1], mw, 30 * U, F.mono), font: F.mono, align: 'left', color: C.muted, meta: true });
    if (p.button) { rr(ctx, x + w - 250 * U, y + h - 100 * U, 210 * U, 72 * U, 14 * U, C.a2, C.line, 5); text(ctx, p.button, x + w - 145 * U, y + h - 64 * U, { size: 36 * U, font: F.body, color: C.onA2 || C.white }); }
  },
  // 主视觉装饰：填满一块区域的图形。o: { kind, seed }，u 为场景内秒数
  ornament(ctx, x, y, w, h, u, t, o = {}) {
    const cx = x + w / 2, cy = y + h / 2, R = Math.min(w, h) * .42;
    const k = i => eBack(P(u, i * BT * .5, i * BT * .5 + .3));
    ctx.save(); ctx.globalCompositeOperation = 'multiply';
    circ(ctx, cx - R * .25, cy - R * .1, R * .78 * k(0), C.a2);
    poly(ctx, [[cx + R * .1, cy - R * .9], [cx + R * .95, cy + R * .7], [cx - R * .7, cy + R * .7]].map(([px, py]) => [cx + (px - cx) * k(1), cy + (py - cy) * k(1)]), C.a1);
    circ(ctx, cx + R * .45, cy + R * .35, R * .42 * k(2), C.a3);
    ctx.restore();
    circ(ctx, cx - R * .25, cy - R * .1, R * .78 * k(0), null, C.line, 6);
  },
};
function defineStyle(s) {
  const out = Object.assign({}, STYLE_DEFAULTS, s);
  out.motion = Object.assign({}, STYLE_DEFAULTS.motion, s.motion || {});
  out.base = STYLE_DEFAULTS;
  return out;
}
