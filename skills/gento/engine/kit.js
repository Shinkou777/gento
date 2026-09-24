/* 幻燈 GENTO · engine/kit.js
   和风格无关的画图零件：字、排版、形状、网点、人物、道具、图标。
   颜色一律取调色 token C，字体一律取字体角色 F（风格包定义）。 */

const PACE = ({ fast: { step: .016, enter: .75 }, standard: { step: .022, enter: 1 }, slow: { step: .05, enter: 1.9 } })[CFG.pace] || { step: .022, enter: 1 };

/* ---------- 字 ---------- */
// 字体角色：{ f: 'family 串', w: 默认字重, ls: 字距（em）, up: 是否转大写 }
function font(size, role, w) { role = role || F.body; return `${role.st ? role.st + ' ' : ''}${w ?? role.w} ${Math.max(1, size)}px ${role.f}`; }
function lsPx(o, role, size) { return o.ls != null ? o.ls : (role.ls || 0) * size; }
function qaBox(ctx, m, o, s, size) {
  const tr = ctx.getTransform(), xs = [-m.actualBoundingBoxLeft, m.actualBoundingBoxRight], ys = [-m.actualBoundingBoxAscent, m.actualBoundingBoxDescent];
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  for (const x of xs) for (const y of ys) { const X = tr.a * x + tr.c * y + tr.e, Y = tr.b * x + tr.d * y + tr.f; x0 = Math.min(x0, X); x1 = Math.max(x1, X); y0 = Math.min(y0, Y); y1 = Math.max(y1, Y); }
  QA.boxes.push({ s, x0, y0, x1, y1, px: size * Math.hypot(tr.a, tr.b), a: ctx.globalAlpha, g: o.g ?? null, bleed: !!o.bleed, over: !!o.over, meta: !!o.meta });
}
function text(ctx, s, x, y, o = {}) {
  s = String(s ?? ''); if (!s) return 0;
  const size = o.size || 60, role = o.font || F.body;
  if (role.up) s = s.toUpperCase();
  ctx.save(); ctx.translate(x, y);
  if (o.rot) ctx.rotate(o.rot);
  if (o.scale != null) { if (o.scale <= 0) { ctx.restore(); return 0; } ctx.scale(o.scale, o.scale); }
  if (o.sx2 != null) ctx.scale(o.sx2, 1);
  ctx.globalAlpha *= (o.alpha ?? 1);
  if (ctx.globalAlpha <= .001) { ctx.restore(); return 0; }
  if (o.op) ctx.globalCompositeOperation = o.op; else if (o.mul) ctx.globalCompositeOperation = 'multiply';
  ctx.font = font(size, role, o.weight);
  ctx.letterSpacing = lsPx(o, role, size) + 'px';
  ctx.textAlign = o.align || 'center'; ctx.textBaseline = o.base || 'middle';
  if (QA.on && !o.deco) qaBox(ctx, ctx.measureText(s), o, s, size);
  if (o.glow) { ctx.shadowColor = o.glow; ctx.shadowBlur = o.glowR ?? size * .25; }
  if (o.shadow) { ctx.fillStyle = o.shadow; ctx.fillText(s, o.sdx ?? size * .05, o.sdy ?? size * .05); }
  if (o.split) { // RGB 错位
    const [c1, c2, dx] = o.split; ctx.save(); ctx.globalCompositeOperation = o.splitOp || 'screen';
    ctx.fillStyle = c1; ctx.fillText(s, -dx, 0); ctx.fillStyle = c2; ctx.fillText(s, dx, 0); ctx.restore();
  }
  if (o.stroke) { ctx.lineWidth = o.strokeW || size * .12; ctx.strokeStyle = o.stroke; ctx.lineJoin = 'round'; ctx.strokeText(s, 0, 0); }
  if (o.outline) { ctx.lineWidth = o.outlineW || Math.max(2, size * .03); ctx.strokeStyle = o.outline; ctx.lineJoin = 'round'; ctx.strokeText(s, 0, 0); }
  else { ctx.fillStyle = o.fill || o.color || C.fg; ctx.fillText(s, 0, 0); }
  ctx.restore();
  return 1;
}
// 质检：后画的实心块盖住了先前的字，那些字不再参与重叠判断
function qaCover(x0, y0, x1, y1) { if (QA.on) QA.boxes = QA.boxes.filter(b => b.x1 < x0 || b.x0 > x1 || b.y1 < y0 || b.y0 > y1); }
function tw(ctx, s, size, role, w, ls) {
  role = role || F.body; s = String(s); if (role.up) s = s.toUpperCase();
  ctx.save(); ctx.font = font(size, role, w); ctx.letterSpacing = (ls != null ? ls : (role.ls || 0) * size) + 'px';
  const r = ctx.measureText(s).width; ctx.restore(); return r;
}
// 多色一行：[[字, 颜色], ...] → 每段 [x, 宽]
function rich(ctx, segs, x, y, size, o = {}) {
  const role = o.font || F.body, g = ++QA.gid;
  const total = segs.reduce((a, [s]) => a + tw(ctx, s, size, role, o.weight), 0);
  let cx = o.align === 'center' ? x - total / 2 : o.align === 'right' ? x - total : x;
  const out = [];
  for (const [s, c] of segs) { const w = tw(ctx, s, size, role, o.weight); out.push([cx, w]); text(ctx, s, cx, y, { size, font: role, weight: o.weight, color: c || o.color || C.fg, align: 'left', alpha: o.alpha, g, shadow: o.shadow, sdx: o.sdx, sdy: o.sdy }); cx += w; }
  return out;
}
// 逐字落下；返回总宽
function stagger(ctx, s, x, y, u, t0, o = {}) {
  const size = o.size || 80, role = o.font || F.head, step = o.step ?? PACE.step, cols = o.cols || [], g = ++QA.gid, dur = .16 * PACE.enter;
  s = role.up ? String(s).toUpperCase() : String(s);
  const total = tw(ctx, s, size, role, o.weight);
  let cx = o.align === 'center' ? x - total / 2 : o.align === 'right' ? x - total : x;
  const x0 = cx;
  [...s].forEach((ch, i) => {
    const w = tw(ctx, ch, size, role, o.weight);
    const k = eOut(P(u, t0 + i * step, t0 + i * step + dur));
    if (k > 0) text(ctx, ch, cx, y + (1 - k) * size * (o.rise ?? .45), { size, font: role, weight: o.weight, color: cols[i] || o.color || C.fg, align: 'left', alpha: k, g, glow: o.glow, shadow: o.shadow, sdx: o.sdx, sdy: o.sdy });
    cx += w;
  });
  return cx - x0;
}
function typewriter(ctx, s, x, y, u, t0, t1, o = {}) {
  const n = Math.floor(P(u, t0, t1) * [...s].length + 1e-6);
  if (n <= 0) return;
  const cut = [...s].slice(0, n).join(''), size = o.size || 40, role = o.font || F.body;
  text(ctx, cut, x, y, { align: 'left', ...o, g: o.g ?? 'tw' + s.length });
  if (n < [...s].length && (u * 4 % 1) < .6) { const w = tw(ctx, cut, size, role, o.weight); ctx.fillStyle = o.color || C.fg; ctx.fillRect(x + w + 6, y - size * .45, size * .08, size * .9); }
}
// 竖排：一字一格，从上往下
function vtext(ctx, s, x, y, o = {}) {
  const size = o.size || 60, gap = size * (o.lh || 1.06), g = ++QA.gid;
  [...String(s)].forEach((ch, i) => {
    const k = o.u != null ? eOut(P(o.u, (o.t0 || 0) + i * (o.step ?? PACE.step * 1.5), (o.t0 || 0) + i * (o.step ?? PACE.step * 1.5) + .2)) : 1;
    if (k <= 0) return;
    const punct = '，。、'.includes(ch);
    text(ctx, ch, x + (punct ? size * .32 : 0), y + i * gap + (punct ? -size * .3 : 0) - (1 - k) * size * .4, { ...o, size, alpha: (o.alpha ?? 1) * k, g, align: 'center' });
  });
  return [...String(s)].length * gap;
}

/* ---------- 换行与缩字：内容长短不定也不出画 ---------- */
const NOHEAD = '，。、！？；：）」』】》〉”’・ー…—％,.!?;:)]}%';
const NOTAIL = '（「『【《〈“‘([{';
function tokens(s) {
  const out = []; let w = '';
  for (const ch of s) {
    if (/[A-Za-z0-9$€¥£%@#&+\-.'’/×:_]/.test(ch)) { w += ch; continue; }
    if (w) { out.push(w); w = ''; }
    if (ch === ' ') { if (out.length) out[out.length - 1] += ' '; continue; }
    out.push(ch);
  }
  if (w) out.push(w);
  return out;
}
function wrap(ctx, s, maxW, size, role, w) {
  const lines = [];
  for (const para of String(s).split('\n')) {
    let line = '';
    for (const tk of tokens(para)) {
      const cand = line + tk;
      if (line && tw(ctx, cand.trimEnd(), size, role, w) > maxW && !NOHEAD.includes(tk[0])) {
        let carry = '';
        while (line && NOTAIL.includes(line[line.length - 1])) { carry = line[line.length - 1] + carry; line = line.slice(0, -1); }
        lines.push(line.trimEnd()); line = carry + tk.trimStart();
      } else line = cand;
    }
    lines.push(line.trimEnd());
  }
  return lines;
}
function fitText(ctx, s, maxW, size, role, w, min = 20) { while (size > min && tw(ctx, s, size, role, w) > maxW) size *= .95; return size; }
// 在 maxW × maxH 里排一段字：先按原字号换行，放不下就缩；末行只剩一两个字时收窄重排
function fitBlock(ctx, s, maxW, maxH, size, role, o = {}) {
  const lhk = o.lh || 1.28, maxLines = o.maxLines || 6, min = o.min || 24;
  for (;;) {
    let lines = wrap(ctx, s, maxW, size, role, o.w);
    if (lines.length > 1 && [...lines[lines.length - 1]].length <= 2) {
      for (let k = .95; k > .68; k -= .05) { const alt = wrap(ctx, s, maxW * k, size, role, o.w); if (alt.length === lines.length && [...alt[alt.length - 1]].length > 2) { lines = alt; break; } }
    }
    if ((lines.length * size * lhk <= maxH && lines.length <= maxLines) || size <= min) return { size, lines, lh: size * lhk, w: Math.max(...lines.map(l => tw(ctx, l, size, role, o.w))) };
    size *= .93;
  }
}

/* ---------- 颜色 ---------- */
// tint(色, f)：f<1 往黑里调，f>1 往白里调；alpha 可选
function tint(hex, f, alpha = 1) {
  const h = String(hex).replace('#', ''); if (h.length < 6) return hex;
  let [r, g, b] = [0, 2, 4].map(i => parseInt(h.substr(i, 2), 16));
  if (f <= 1) { r *= f; g *= f; b *= f; } else { const k = Math.min(1, f - 1); r += (255 - r) * k; g += (255 - g) * k; b += (255 - b) * k; }
  return `rgba(${r | 0},${g | 0},${b | 0},${alpha})`;
}
// 金属柱面：横向渐变，暗—亮—高光—亮—暗；shift 让高光带随转动移动
function metal(ctx, x0, x1, base, shift = 0) {
  const g = ctx.createLinearGradient(x0, 0, x1, 0), s = clamp(.5 + shift * .35, .15, .85);
  g.addColorStop(0, tint(base, .45)); g.addColorStop(Math.max(.02, s - .3), tint(base, .9)); g.addColorStop(s, tint(base, 1.55)); g.addColorStop(Math.min(.98, s + .12), tint(base, 1.05)); g.addColorStop(1, tint(base, .5));
  return g;
}

/* ---------- 形 ---------- */
const LW = n => n * (STYLE.lw ?? 1) * U;
function rr(ctx, x, y, w, h, r, fill, stroke, lw = 6) {
  ctx.beginPath(); ctx.roundRect(x, y, w, h, r);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.lineWidth = LW(lw); ctx.strokeStyle = stroke; ctx.stroke(); }
}
function circ(ctx, x, y, r, fill, stroke, lw = 6) {
  ctx.beginPath(); ctx.arc(x, y, Math.max(0, r), 0, Math.PI * 2);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.lineWidth = LW(lw); ctx.strokeStyle = stroke; ctx.stroke(); }
}
function ell(ctx, x, y, rx, ry, fill, stroke, lw = 6, rot = 0) {
  ctx.beginPath(); ctx.ellipse(x, y, Math.max(0, rx), Math.max(0, ry), rot, 0, Math.PI * 2);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.lineWidth = LW(lw); ctx.strokeStyle = stroke; ctx.stroke(); }
}
function poly(ctx, pts, fill, stroke, lw = 6, close = true) {
  ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); if (close) ctx.closePath();
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.lineWidth = LW(lw); ctx.strokeStyle = stroke; ctx.lineJoin = 'round'; ctx.stroke(); }
}
function field(ctx, col) { ctx.fillStyle = col; ctx.fillRect(-100, -100, W + 200, H + 200); }
// 画到进度 k 的线段，末端可带箭头
function arrow(ctx, x0, y0, x1, y1, k, o = {}) {
  if (k <= 0) return;
  const x = lerp(x0, x1, k), y = lerp(y0, y1, k), lw = LW(o.lw || 6), col = o.color || C.line;
  ctx.save(); ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = lw; ctx.lineCap = 'round';
  if (o.dash) ctx.setLineDash(o.dash);
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x, y); ctx.stroke(); ctx.setLineDash([]);
  if (o.head !== false && k > .6) { const a = Math.atan2(y1 - y0, x1 - x0), s = (o.hs || 22) * U; ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * s * .3, y + Math.sin(a) * s * .3); ctx.lineTo(x - Math.cos(a - .5) * s, y - Math.sin(a - .5) * s); ctx.lineTo(x - Math.cos(a + .5) * s, y - Math.sin(a + .5) * s); ctx.closePath(); ctx.fill(); }
  ctx.restore();
}

/* ---------- 网点 ---------- */
const patCache = {};
function dots(ctx, col, cell = 12, rf = .3, ang = 15) {
  const key = col + cell + rf;
  if (!patCache[key]) { const c = cnv(cell, cell), g = c.getContext('2d'); g.fillStyle = col; g.beginPath(); g.arc(cell / 2, cell / 2, cell * rf, 0, 7); g.fill(); patCache[key] = ctx.createPattern(c, 'repeat'); }
  const p = patCache[key]; p.setTransform(new DOMMatrix().rotateSelf(ang)); return p;
}
// 斜线阴影
function hatch(ctx, col, gap = 10, lw = 2, ang = 45) {
  const key = 'h' + col + gap + lw;
  if (!patCache[key]) { const c = cnv(gap, gap), g = c.getContext('2d'); g.strokeStyle = col; g.lineWidth = lw; g.beginPath(); g.moveTo(0, gap / 2); g.lineTo(gap, gap / 2); g.stroke(); patCache[key] = ctx.createPattern(c, 'repeat'); }
  const p = patCache[key]; p.setTransform(new DOMMatrix().rotateSelf(ang)); return p;
}
// 网点渐变：点的大小跟随 f(x,y)∈[0,1]
function dotGrad(ctx, col, cell, f, mul = true) {
  ctx.save(); if (mul) ctx.globalCompositeOperation = 'multiply';
  ctx.beginPath();
  const ca = Math.cos(.26), sa = Math.sin(.26), pad = Math.ceil(Math.max(W, H) * .3 / cell) + 2;
  for (let j = -pad; j < H / cell + pad; j++) for (let i = -pad; i < W / cell + pad; i++) {
    const gx = i * cell, gy = j * cell, x = gx * ca - gy * sa, y = gx * sa + gy * ca;
    if (x < -cell || x > W + cell || y < -cell || y > H + cell) continue;
    const v = f(x, y); if (v <= .03) continue;
    const r = cell * .66 * Math.sqrt(Math.min(1, v)); ctx.moveTo(x + r, y); ctx.arc(x, y, r, 0, 6.2832);
  }
  ctx.fillStyle = col; ctx.fill(); ctx.restore();
}
const radial = (cx, cy, R, p = 1) => (x, y) => Math.pow(clamp(1 - Math.hypot(x - cx, y - cy) / R), p);
const linear = (x0, y0, x1, y1, p = 1) => { const dx = x1 - x0, dy = y1 - y0, L2 = dx * dx + dy * dy; return (x, y) => Math.pow(clamp(((x - x0) * dx + (y - y0) * dy) / L2), p); };
// 四个角轮流：场景序号 → 光晕角
const corner = i => [[W + 20, -20], [-20, H + 20], [W + 20, H + 20], [-20, -20]][((i % 4) + 4) % 4];

/* ---------- 人物（颜色全走 token） ---------- */
// o: { t, hair:'curls'|'short'|'bob'|'none', glasses, look, brow, mouth:'smirk'|'o'|'grin'|'flat'|'frown'|'smile', smug, windy, flip, rot, plate }
function head(ctx, x, y, s, o = {}) {
  const t = o.t || 0, hair = o.hair || 'short', plate = o.plate || C.a2, ink = C.line;
  ctx.save(); ctx.translate(x, y); ctx.scale(s * (o.flip ? -1 : 1), s); if (o.rot) ctx.rotate(o.rot);
  ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  const lw = n => n * (STYLE.lw ?? 1);
  const E = (x, y, rx, ry, f, st, w) => { ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, 7); if (f) { ctx.fillStyle = f; ctx.fill(); } if (st) { ctx.lineWidth = lw(w); ctx.strokeStyle = st; ctx.stroke(); } };
  E(-120, 14, 24, 34, C.skin, ink, 7); E(120, 14, 24, 34, C.skin, ink, 7);
  E(0, 0, 118, 140, C.skin, ink, 8);
  ctx.save(); ctx.beginPath(); ctx.ellipse(0, 0, 114, 136, 0, 0, 7); ctx.clip(); STYLE.cheek(ctx, 30, -20, 120, 180); ctx.restore();
  const hairPath = () => {
    ctx.beginPath();
    if (hair === 'curls') {
      const cs = [];
      for (let i = 0; i < 17; i++) { const a = Math.PI * (1.0 + i / 16), wob = o.windy ? Math.sin(t * 24 + i) * 7 - 8 : 0; cs.push([Math.cos(a) * 118 + wob, Math.sin(a) * 128 - 34, 40 + (i % 3) * 6]); }
      for (let i = 0; i < 9; i++) cs.push([-88 + i * 22, -142 + (i % 2) * 14, 38]);
      for (let i = 0; i < 5; i++) cs.push([-60 + i * 30, -104 + (i % 2) * 8, 30]);
      for (const [cx, cy, r] of cs) { ctx.moveTo(cx + r, cy); ctx.arc(cx, cy, r, 0, 7); }
    } else if (hair === 'short') {
      const wob = o.windy ? Math.sin(t * 24) * 8 : 0;
      ctx.moveTo(-124, -6); ctx.bezierCurveTo(-138, -215, 138 + wob, -215, 124, -6);
      ctx.bezierCurveTo(104, -78, 44, -100, -8, -94); ctx.bezierCurveTo(-60, -88, -106, -62, -124, -6); ctx.closePath();
    } else if (hair === 'bob') {
      const wob = o.windy ? Math.sin(t * 24) * 10 : 0;
      ctx.moveTo(-136 - wob, 74); ctx.bezierCurveTo(-152, -232, 152, -232, 136 + wob, 74); ctx.lineTo(98, 74);
      ctx.bezierCurveTo(108, -58, 60, -98, 0, -98); ctx.bezierCurveTo(-60, -98, -108, -58, -98, 74); ctx.closePath();
    }
  };
  if (hair !== 'none') {
    if (STYLE.plates !== false) { ctx.save(); ctx.globalCompositeOperation = STYLE.plateOp || 'multiply'; ctx.translate(7, 6); ctx.fillStyle = plate; hairPath(); ctx.fill(); ctx.restore(); }
    ctx.fillStyle = C.hair || ink; hairPath(); ctx.fill();
    if (STYLE.lineArt) { ctx.lineWidth = lw(6); ctx.strokeStyle = ink; hairPath(); ctx.stroke(); }
    ctx.strokeStyle = C.bg; ctx.lineWidth = 4; ctx.globalAlpha = .45;
    if (hair === 'curls') { ctx.lineWidth = 3; for (const [cx, cy] of [[-80, -110], [-20, -140], [50, -130], [100, -80]]) { ctx.beginPath(); ctx.arc(cx, cy, 16, 3.6, 5.2); ctx.stroke(); } }
    else { ctx.beginPath(); ctx.arc(-40, -60, 90, 3.9, 4.6); ctx.stroke(); ctx.beginPath(); ctx.arc(-30, -60, 70, 4.0, 4.5); ctx.stroke(); }
    ctx.globalAlpha = 1;
  }
  const b = o.brow || 0; ctx.strokeStyle = ink; ctx.lineWidth = lw(11);
  ctx.beginPath(); ctx.moveTo(-100, -58 - b * 8); ctx.lineTo(-30, -52 + b * 6); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(100, -58 - b * 8); ctx.lineTo(30, -52 + b * 6); ctx.stroke();
  const lk = (o.look || 0) * 12;
  const blink = (hash(Math.floor(t * 2.5) + 3) > .85 && (t * 2.5 % 1) < .2);
  if (blink || o.smug) { ctx.lineWidth = lw(7); for (const ex of [-62, 62]) { ctx.beginPath(); ctx.moveTo(ex - 18 + lk, -8); ctx.quadraticCurveTo(ex + lk, o.smug ? -2 : -8, ex + 18 + lk, -8); ctx.stroke(); } }
  else { E(-62 + lk, -6, 10, 10, ink); E(62 + lk, -6, 10, 10, ink); }
  if (o.glasses) {
    ctx.lineWidth = lw(8); ctx.strokeStyle = ink;
    for (const ex of [-62, 62]) { ctx.beginPath(); ctx.roundRect(ex - 46, -44, 92, 76, 30); ctx.stroke(); }
    ctx.beginPath(); ctx.moveTo(-16, -12); ctx.quadraticCurveTo(0, -22, 16, -12); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-108, -10); ctx.lineTo(-120, -2); ctx.moveTo(108, -10); ctx.lineTo(120, -2); ctx.stroke();
  }
  ctx.strokeStyle = ink; ctx.lineWidth = lw(7);
  ctx.beginPath(); ctx.moveTo(4, 8); ctx.quadraticCurveTo(-16, 44, 8, 48); ctx.stroke();
  const m = o.mouth || 'smirk'; ctx.lineWidth = lw(8);
  if (m === 'smirk') { ctx.beginPath(); ctx.moveTo(-36, 84); ctx.quadraticCurveTo(10, 100, 44, 70); ctx.stroke(); }
  else if (m === 'smile') { ctx.beginPath(); ctx.moveTo(-34, 78); ctx.quadraticCurveTo(0, 104, 34, 78); ctx.stroke(); }
  else if (m === 'o') { E(0, 88, 20, 26, ink); }
  else if (m === 'grin') { ctx.beginPath(); ctx.moveTo(-46, 74); ctx.quadraticCurveTo(0, 124, 46, 74); ctx.closePath(); ctx.fillStyle = C.white; ctx.fill(); ctx.stroke(); }
  else if (m === 'frown') { ctx.beginPath(); ctx.moveTo(-34, 96); ctx.quadraticCurveTo(0, 70, 34, 96); ctx.stroke(); }
  else { ctx.beginPath(); ctx.moveTo(-30, 84); ctx.lineTo(30, 84); ctx.stroke(); }
  ctx.restore();
}
function bust(ctx, x, y, s, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(-380, 60); ctx.bezierCurveTo(-370, -150, -300, -230, -120, -250); ctx.lineTo(120, -250); ctx.bezierCurveTo(300, -230, 370, -150, 380, 60); ctx.closePath();
  ctx.fillStyle = o.coat || C.coat || C.a2; ctx.fill();
  ctx.save(); ctx.clip(); STYLE.shade(ctx, 80, -260, 320, 330); ctx.restore();
  ctx.lineWidth = 8 * (STYLE.lw ?? 1); ctx.strokeStyle = C.line; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-120, -250); ctx.lineTo(0, -60); ctx.lineTo(120, -250); ctx.closePath(); ctx.fillStyle = C.white; ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-60, -250); ctx.lineTo(0, -150); ctx.lineTo(60, -250); ctx.closePath(); ctx.fillStyle = C.skin; ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.roundRect(-52, -330, 104, 100, 20); ctx.fillStyle = C.skin; ctx.fill(); ctx.stroke();
  ctx.restore();
  head(ctx, x, y - 460 * s, s, o);
}
// 全身小人：o.walk=走路相位，o.sign=举牌字，o.head=头部参数，o.wave=挥手
function person(ctx, x, y, s, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s * (o.flip ? -1 : 1), s);
  ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  const lw = n => n * (STYLE.lw ?? 1), coat = o.coat || C.coat || C.a2, ink = C.line;
  const sw = o.walk != null ? Math.sin(o.walk) * .5 : 0, bob = o.walk != null ? -Math.abs(Math.cos(o.walk)) * 10 : 0;
  ctx.translate(0, bob);
  for (const [hx, a] of [[-26, sw], [26, -sw]]) {
    const fx = hx + Math.sin(a) * 170, fy = -170 + Math.cos(a) * 170;
    ctx.strokeStyle = ink; ctx.lineWidth = 28; ctx.beginPath(); ctx.moveTo(hx, -170); ctx.lineTo(fx, fy); ctx.stroke();
    if (STYLE.lineArt) { ctx.strokeStyle = C.skin; ctx.lineWidth = 16; ctx.stroke(); }
    ctx.beginPath(); ctx.ellipse(fx + 14, fy - 4, 30, 14, 0, 0, 7); ctx.fillStyle = ink; ctx.fill();
  }
  const arm = (sx, ang) => {
    const hx = sx + Math.sin(ang) * 140, hy = -330 + Math.cos(ang) * 140;
    ctx.strokeStyle = ink; ctx.lineWidth = 30; ctx.beginPath(); ctx.moveTo(sx, -330); ctx.lineTo(hx, hy); ctx.stroke();
    ctx.strokeStyle = coat; ctx.lineWidth = 18; ctx.stroke();
    ctx.beginPath(); ctx.arc(hx, hy, 18, 0, 7); ctx.fillStyle = C.skin; ctx.fill(); ctx.lineWidth = lw(6); ctx.strokeStyle = ink; ctx.stroke(); return [hx, hy];
  };
  arm(-66, o.sign ? -sw * .6 : -sw * .8);
  ctx.beginPath(); ctx.roundRect(-80, -360, 160, 210, [44, 44, 18, 18]); ctx.fillStyle = coat; ctx.fill(); ctx.lineWidth = lw(8); ctx.strokeStyle = ink; ctx.stroke();
  ctx.save(); ctx.beginPath(); ctx.roundRect(-80, -360, 160, 210, [44, 44, 18, 18]); ctx.clip(); STYLE.shade(ctx, 25, -360, 60, 210); ctx.restore();
  ctx.beginPath(); ctx.moveTo(-34, -360); ctx.lineTo(0, -290); ctx.lineTo(34, -360); ctx.closePath(); ctx.fillStyle = C.white; ctx.fill(); ctx.lineWidth = lw(6); ctx.strokeStyle = ink; ctx.stroke();
  const tt = o.t || (o.head && o.head.t) || 0;
  if (o.sign) {
    const [hx, hy] = arm(66, 2.75);
    ctx.fillStyle = C.wood; ctx.fillRect(hx - 7, hy - 240, 14, 250); ctx.lineWidth = lw(4); ctx.strokeRect(hx - 7, hy - 240, 14, 250);
    ctx.save(); ctx.translate(hx, hy - 290); ctx.rotate(Math.sin((o.walk || tt) * .5) * .05);
    ctx.fillStyle = C.shadow; ctx.fillRect(-162, -52, 340, 120); ctx.fillStyle = C.white; ctx.fillRect(-170, -60, 340, 120); ctx.lineWidth = lw(6); ctx.strokeStyle = ink; ctx.strokeRect(-170, -60, 340, 120);
    if (o.flip) ctx.scale(-1, 1);
    const sz = Math.min(58, 300 / Math.max(1, [...o.sign].length));
    text(ctx, o.sign, 0, 2, { size: sz, color: C.a1, font: F.head });
    ctx.restore();
  } else if (o.wave) arm(66, 2.6 + Math.sin(tt * 9) * .35);
  else arm(66, sw * .8);
  head(ctx, 0, -470, .62, o.head || {});
  ctx.restore();
}
function worker(ctx, x, y, s, col, t, i) {
  ctx.save(); ctx.translate(x, y + Math.sin(t * 7 + i) * 3); ctx.scale(s, s); ctx.lineJoin = 'round';
  const ink = C.line, lw = n => n * (STYLE.lw ?? 1);
  ctx.beginPath(); ctx.roundRect(-52, -40, 104, 120, [30, 30, 8, 8]); ctx.fillStyle = col; ctx.fill(); ctx.lineWidth = lw(6); ctx.strokeStyle = ink; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0, -38); ctx.lineTo(-12, 10); ctx.lineTo(0, 36); ctx.lineTo(12, 10); ctx.closePath(); ctx.fillStyle = ink; ctx.fill();
  ctx.beginPath(); ctx.arc(0, -88, 44, 0, 7); ctx.fillStyle = C.skin; ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.arc(0, -96, 44, Math.PI * 1.05, Math.PI * 1.95); ctx.fillStyle = C.hair || ink; ctx.fill();
  ctx.fillStyle = ink; ctx.beginPath(); ctx.arc(-15, -84, 5, 0, 7); ctx.arc(15, -84, 5, 0, 7); ctx.fill();
  ctx.beginPath(); ctx.arc(0, -72, 12, .3, Math.PI - .3); ctx.lineWidth = lw(4); ctx.stroke();
  ctx.restore();
}

/* ---------- 道具 ---------- */
function poof(ctx, x, y, k) {
  if (k <= 0 || k >= 1) return;
  for (let i = 0; i < 9; i++) { const a = i / 9 * 6.283, d = eOut(k) * 90 * U; circ(ctx, x + Math.cos(a) * d, y + Math.sin(a) * d, 30 * U * (1 - k), C.bg, C.line, 4); }
}
function flame(ctx, x, y, s, t, seed = 0) {
  const f = 1 + .16 * Math.sin(t * 31 + seed * 5) + .08 * Math.sin(t * 53 + seed);
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s * f); ctx.rotate(Math.sin(t * 17 + seed) * .06);
  const tear = (w, h) => { ctx.beginPath(); ctx.moveTo(0, 0); ctx.bezierCurveTo(-w, -h * .1, -w * .9, -h * .55, 0, -h); ctx.bezierCurveTo(w * .9, -h * .55, w, -h * .1, 0, 0); };
  tear(40, 110 + 10 * Math.sin(t * 23 + seed)); ctx.fillStyle = C.a1; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = C.line; ctx.stroke();
  tear(24, 70); ctx.fillStyle = C.a3; ctx.fill();
  tear(10, 30); ctx.fillStyle = C.white; ctx.fill();
  ctx.restore();
}
function confetti(ctx, v, n = 46, seed = 0) {
  const cols = [C.a1, C.a3, C.a2, C.line];
  for (let i = 0; i < n; i++) {
    const x = hash(i + 1 + seed) * W, y = -60 + v * (500 + hash(i + seed) * 500) * (H / 1080);
    ctx.save(); ctx.translate(x, y); ctx.rotate(v * 5 + i); ctx.fillStyle = cols[i % 4]; ctx.fillRect(-12 * U, -6 * U, 24 * U, 12 * U); ctx.restore();
  }
}
// 对话气泡：(x,y) 中心，尾巴尖在相对坐标 (tx,ty)
function bubble(ctx, x, y, w, h, tx, ty, o = {}) {
  const fill = o.fill || C.white;
  ctx.save(); ctx.translate(x, y); ctx.lineJoin = 'round';
  STYLE.panelShadow && STYLE.panelShadow(ctx, -w / 2, -h / 2, w, h, 36 * U);
  rr(ctx, -w / 2, -h / 2, w, h, 36 * U, fill, C.line, 7);
  const bw = 90 * U, side = Math.abs(ty) < h / 2 - 20 * U && Math.abs(tx) > w / 2 ? (tx < 0 ? 'l' : 'r') : (ty > 0 ? 'b' : 't');
  let p1, p2;
  if (side === 'b' || side === 't') { const bx = clamp(tx, -w / 2 + 60 * U, w / 2 - 160 * U), by = side === 'b' ? h / 2 - 8 * U : -h / 2 + 8 * U; p1 = [bx, by]; p2 = [bx + bw, by]; }
  else { const by = clamp(ty - bw / 2, -h / 2 + 40 * U, h / 2 - 40 * U - bw), bx = side === 'l' ? -w / 2 + 8 * U : w / 2 - 8 * U; p1 = [bx, by]; p2 = [bx, by + bw]; }
  ctx.beginPath(); ctx.moveTo(...p1); ctx.lineTo(tx, ty); ctx.lineTo(...p2); ctx.closePath(); ctx.fillStyle = fill; ctx.fill();
  ctx.beginPath(); ctx.moveTo(...p1); ctx.lineTo(tx, ty); ctx.lineTo(...p2); ctx.lineWidth = LW(7); ctx.strokeStyle = C.line; ctx.stroke();
  ctx.restore();
}

/* ---------- 图标（100×100 设计，s 为像素边长） ---------- */
function icon(ctx, name, x, y, s, o = {}) {
  const ink = o.line || C.line, fill = o.fill || C.a3, fill2 = o.fill2 || C.white;
  ctx.save(); ctx.translate(x, y); ctx.scale(s / 100, s / 100); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  ctx.lineWidth = 7 * (STYLE.lw ?? 1); ctx.strokeStyle = ink;
  const F_ = c => { ctx.fillStyle = c; ctx.fill(); }, S_ = () => ctx.stroke(), B = () => ctx.beginPath();
  switch (name) {
    case 'bulb': B(); ctx.arc(0, -12, 30, Math.PI * .8, Math.PI * 2.2); ctx.lineTo(14, 22); ctx.lineTo(-14, 22); ctx.closePath(); F_(fill); S_(); B(); ctx.moveTo(-12, 32); ctx.lineTo(12, 32); ctx.moveTo(-8, 42); ctx.lineTo(8, 42); S_(); break;
    case 'gear': B(); for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2, r = i % 2 ? 30 : 40; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); } ctx.closePath(); F_(fill); S_(); B(); ctx.arc(0, 0, 12, 0, 7); F_(fill2); S_(); break;
    case 'check': B(); ctx.arc(0, 0, 40, 0, 7); F_(fill); S_(); B(); ctx.moveTo(-18, 2); ctx.lineTo(-4, 16); ctx.lineTo(20, -14); ctx.lineWidth = 10; S_(); break;
    case 'cross': B(); ctx.arc(0, 0, 40, 0, 7); F_(fill); S_(); B(); ctx.moveTo(-15, -15); ctx.lineTo(15, 15); ctx.moveTo(15, -15); ctx.lineTo(-15, 15); ctx.lineWidth = 10; S_(); break;
    case 'clock': B(); ctx.arc(0, 0, 40, 0, 7); F_(fill2); S_(); B(); ctx.moveTo(0, 0); ctx.lineTo(0, -24); ctx.moveTo(0, 0); ctx.lineTo(18, 10); S_(); break;
    case 'chart': B(); ctx.moveTo(-40, 40); ctx.lineTo(40, 40); S_(); [[-30, 20], [-6, 44], [18, 70]].forEach(([bx, h]) => { B(); ctx.rect(bx, 40 - h, 18, h); F_(fill); S_(); }); break;
    case 'user': B(); ctx.arc(0, -16, 18, 0, 7); F_(fill2); S_(); B(); ctx.moveTo(-34, 40); ctx.quadraticCurveTo(-34, 6, 0, 6); ctx.quadraticCurveTo(34, 6, 34, 40); ctx.closePath(); F_(fill); S_(); break;
    case 'globe': B(); ctx.arc(0, 0, 40, 0, 7); F_(fill); S_(); B(); ctx.ellipse(0, 0, 16, 40, 0, 0, 7); ctx.moveTo(-40, 0); ctx.lineTo(40, 0); S_(); break;
    case 'bolt': B(); ctx.moveTo(8, -44); ctx.lineTo(-22, 6); ctx.lineTo(0, 6); ctx.lineTo(-8, 44); ctx.lineTo(24, -8); ctx.lineTo(2, -8); ctx.closePath(); F_(fill); S_(); break;
    case 'heart': B(); ctx.moveTo(0, 36); ctx.bezierCurveTo(-50, 0, -34, -44, 0, -18); ctx.bezierCurveTo(34, -44, 50, 0, 0, 36); F_(fill); S_(); break;
    case 'leaf': B(); ctx.moveTo(-34, 34); ctx.bezierCurveTo(-40, -30, 10, -44, 38, -38); ctx.bezierCurveTo(40, 10, 0, 40, -34, 34); F_(fill); S_(); B(); ctx.moveTo(-34, 34); ctx.lineTo(20, -20); S_(); break;
    case 'star': B(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 18 : 42; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); } ctx.closePath(); F_(fill); S_(); break;
    case 'money': B(); ctx.roundRect(-44, -26, 88, 52, 8); F_(fill); S_(); B(); ctx.arc(0, 0, 12, 0, 7); S_(); break;
    case 'doc': B(); ctx.moveTo(-30, -42); ctx.lineTo(14, -42); ctx.lineTo(30, -26); ctx.lineTo(30, 42); ctx.lineTo(-30, 42); ctx.closePath(); F_(fill2); S_(); B(); for (let i = 0; i < 4; i++) { ctx.moveTo(-18, -18 + i * 16); ctx.lineTo(18, -18 + i * 16); } S_(); break;
    case 'chat': B(); ctx.roundRect(-42, -34, 84, 58, 14); F_(fill); S_(); B(); ctx.moveTo(-18, 24); ctx.lineTo(-26, 42); ctx.lineTo(0, 24); F_(fill); S_(); break;
    case 'lock': B(); ctx.roundRect(-32, -6, 64, 48, 8); F_(fill); S_(); B(); ctx.moveTo(-20, -6); ctx.lineTo(-20, -22); ctx.arc(0, -22, 20, Math.PI, 0); ctx.lineTo(20, -6); S_(); break;
    case 'play': B(); ctx.arc(0, 0, 40, 0, 7); F_(fill); S_(); B(); ctx.moveTo(-12, -20); ctx.lineTo(22, 0); ctx.lineTo(-12, 20); ctx.closePath(); F_(fill2); S_(); break;
    case 'flag': B(); ctx.moveTo(-26, 44); ctx.lineTo(-26, -42); S_(); B(); ctx.moveTo(-26, -40); ctx.lineTo(34, -26); ctx.lineTo(-26, -8); ctx.closePath(); F_(fill); S_(); break;
    default: B(); ctx.arc(0, 0, 36, 0, 7); F_(fill); S_();
  }
  ctx.restore();
}
