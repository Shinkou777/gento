/* 幻燈 GENTO · engine/fx.js
   粒子与光效：浮尘、体积光、星空、漩涡、闪电、火星、水光。
   全部只看 t 和种子，不存状态；颜色默认取风格的 a3（金）和 onDark。 */

const FX = {
  // 浮尘：前后三层，远的小而慢，近的大而虚
  dust(ctx, t, o = {}) {
    const n = o.n || 90, col = o.color || C.a3, seed = o.seed || 0, dx = o.dx || 0;
    ctx.save(); ctx.globalCompositeOperation = o.op || 'lighter';
    for (let i = 0; i < n; i++) {
      const z = .3 + hash(i * 3.1 + seed) * 1.2, sp = (6 + 14 * z) * U;
      const x = ((hash(i + seed) * (W + 200) + t * sp * (hash(i * 7) - .3) + dx * z) % (W + 200) + W + 200) % (W + 200) - 100;
      const y = ((hash(i * 5 + seed) * (H + 200) - t * sp * .6) % (H + 200) + H + 200) % (H + 200) - 100;
      const r = (1 + z * 2.2) * U * (o.size || 1), a = (o.alpha ?? .55) * (.35 + .65 * Math.pow(Math.sin(t * (.6 + hash(i) * 1.4) + i) * .5 + .5, 2));
      const g = ctx.createRadialGradient(x, y, 0, x, y, r * 3); g.addColorStop(0, tint(col, 1.3, a)); g.addColorStop(1, tint(col, 1, 0));
      ctx.fillStyle = g; ctx.fillRect(x - r * 3, y - r * 3, r * 6, r * 6);
    }
    ctx.restore();
  },
  // 体积光：从 (x,y) 斜射下来的几道光束，缓慢摆动
  rays(ctx, t, o = {}) {
    const x = o.x ?? W * .8, y = o.y ?? -H * .1, n = o.n || 7, len = o.len || Math.hypot(W, H) * 1.1, col = o.color || C.a3, a0 = o.angle ?? Math.PI * .68;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < n; i++) {
      const a = a0 + (i - n / 2) * (o.spread ?? .07) + Math.sin(t * .3 + i * 1.7) * .02, w = (.02 + .03 * hash(i + 11)) * (o.width || 1);
      const g = ctx.createLinearGradient(x, y, x + Math.cos(a) * len, y + Math.sin(a) * len);
      const al = (o.alpha ?? .16) * (.5 + .5 * Math.sin(t * .7 + i * 2.3));
      g.addColorStop(0, tint(col, 1.4, al)); g.addColorStop(.6, tint(col, 1.2, al * .35)); g.addColorStop(1, tint(col, 1, 0));
      ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a - w) * len, y + Math.sin(a - w) * len); ctx.lineTo(x + Math.cos(a + w) * len, y + Math.sin(a + w) * len); ctx.closePath(); ctx.fill();
    }
    ctx.restore();
  },
  // 星空：闪烁 + 慢转；k 控制亮起
  stars(ctx, t, o = {}) {
    const n = o.n || 260, k = o.k ?? 1, cx = o.cx ?? W / 2, cy = o.cy ?? H * 1.2, rot = t * (o.spin ?? .01);
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < n; i++) {
      const a = hash(i) * Math.PI * 2 + rot, r = Math.sqrt(hash(i + 3)) * Math.hypot(W, H), x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r;
      if (x < -10 || x > W + 10 || y < -10 || y > H + 10) continue;
      const tw = .4 + .6 * Math.pow(Math.sin(t * (1 + hash(i + 5) * 3) + i) * .5 + .5, 3), s = (hash(i + 7) < .06 ? 2.6 : .8 + hash(i + 9)) * U;
      ctx.globalAlpha = k * tw * (hash(i + 13) < .2 ? 1 : .6); ctx.fillStyle = hash(i + 17) < .15 ? C.a3 : '#FFFFFF';
      ctx.beginPath(); ctx.arc(x, y, s, 0, 7); ctx.fill();
      if (s > 2 * U) { ctx.globalAlpha *= .5; ctx.fillRect(x - s * 4, y - .5, s * 8, 1); ctx.fillRect(x - .5, y - s * 4, 1, s * 8); }
    }
    ctx.restore();
  },
  // 混沌漩涡：粒子绕中心盘旋、慢慢吸进去
  vortex(ctx, t, o = {}) {
    const cx = o.x ?? W / 2, cy = o.y ?? H / 2, n = o.n || 700, R = o.r || Math.max(W, H) * .6, col = o.color || C.a3, k = o.k ?? 1;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < n; i++) {
      const life = (hash(i) + t * (.05 + hash(i + 1) * .08)) % 1, r = R * Math.pow(1 - life, 1.6) + 8 * U, a = hash(i + 2) * 6.283 + life * (5 + hash(i + 3) * 4) + t * .2;
      const fl = o.flat ?? .55, x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r * fl, a2 = a - (.12 + .25 * (1 - life)), x2 = cx + Math.cos(a2) * r * 1.03, y2 = cy + Math.sin(a2) * r * 1.03 * fl;
      ctx.globalAlpha = k * (.2 + .7 * Math.sin(life * Math.PI)) * (o.alpha ?? 1);
      ctx.strokeStyle = hash(i + 4) < .3 ? col : hash(i + 4) < .45 ? '#FFFFFF' : tint(col, .75);
      ctx.lineWidth = (.8 + hash(i + 5) * 2.2) * U; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x, y); ctx.stroke();
    }
    ctx.restore();
  },
  // 闪电：折线主干 + 分叉，外发光；k 0→1 打下来，之后闪两下
  lightning(ctx, x0, y0, x1, y1, k, seed = 0, o = {}) {
    if (k <= 0) return;
    const seg = 14, pts = [[x0, y0]], len = Math.hypot(x1 - x0, y1 - y0), nx = -(y1 - y0) / len, ny = (x1 - x0) / len;
    for (let i = 1; i < seg; i++) { const f = i / seg, j = (hash(seed * 31 + i) - .5) * len * .16; pts.push([lerp(x0, x1, f) + nx * j, lerp(y0, y1, f) + ny * j]); }
    pts.push([x1, y1]);
    const m = Math.max(2, Math.ceil(pts.length * clamp(k * 2.2))), fl = k > .45 ? (hash(Math.floor(k * 30) + seed) > .35 ? 1 : .35) : 1;
    const bolt = (p, w, col, blur) => { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.shadowColor = col; ctx.shadowBlur = blur; ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineJoin = 'round'; ctx.beginPath(); p.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke(); ctx.restore(); };
    ctx.save(); ctx.globalAlpha = fl * (1 - P(k, .75, 1));
    bolt(pts.slice(0, m), 10 * U, o.glow || '#9FD4FF', 40 * U); bolt(pts.slice(0, m), 3.5 * U, '#FFFFFF', 12 * U);
    for (let b = 0; b < 3; b++) { const s = 3 + Math.floor(hash(seed + b * 5) * (seg - 6)); if (s >= m) continue; const [bx, by] = pts[s], bp = [[bx, by]]; for (let i = 1; i < 6; i++) bp.push([bx + (hash(seed + b * 13 + i) - .3) * 70 * U * i * .5, by + i * len / seg * .7]); bolt(bp, 2 * U, '#DDEEFF', 10 * U); }
    ctx.restore();
    if (k < .3) { ctx.save(); ctx.globalAlpha = .55 * (1 - k / .3); ctx.fillStyle = '#EAF4FF'; ctx.fillRect(0, 0, W, H); ctx.restore(); }
  },
  // 火星：从下往上飘的余烬；fall: true 时从上往下落，配金色就是金雨
  embers(ctx, t, o = {}) {
    const n = o.n || 120, col = o.color || '#FF9A3C', y0 = o.y ?? H + 20;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < n; i++) {
      // fall：从上往下落（金雨）；默认从下往上飘（火星）
      const life = (hash(i) + t * (.12 + hash(i + 1) * .2) * (o.speed || 1)) % 1, x = (o.x ?? W / 2) + (hash(i + 2) - .5) * (o.w || W) + Math.sin(t * 2 + i) * 30 * U * life * (o.fall ? .3 : 1), y = o.fall ? (o.y ?? -20) + life * (o.h || H) * 1.1 : y0 - life * (o.h || H) * 1.1;
      const s = (1.2 + hash(i + 3) * 2.8) * U * (1 - life * .6);
      ctx.globalAlpha = (o.alpha ?? .9) * Math.sin(life * Math.PI);
      const g = ctx.createRadialGradient(x, y, 0, x, y, s * 3); g.addColorStop(0, '#FFF3C4'); g.addColorStop(.35, col); g.addColorStop(1, tint(col, .6, 0));
      ctx.fillStyle = g; ctx.fillRect(x - s * 3, y - s * 3, s * 6, s * 6);
    }
    ctx.restore();
  },
  // 水光：两组正弦干涉出的亮纹，叠在画面下部
  shimmer(ctx, t, o = {}) {
    const y0 = o.y ?? H * .55, h = o.h ?? H * .45, col = o.color || '#BFE6FF';
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = col; ctx.lineCap = 'round';
    for (let j = 0; j < 26; j++) {
      const y = y0 + j / 26 * h, a = (o.alpha ?? .14) * (j / 26 + .2);
      ctx.globalAlpha = a; ctx.lineWidth = (1 + j / 26 * 3) * U; ctx.beginPath();
      for (let x = -20; x <= W + 20; x += 24 * U) { const yy = y + Math.sin(x * .012 / U + t * 1.6 + j) * 6 * U + Math.sin(x * .031 / U - t * 2.2 + j * 2) * 3 * U; if (Math.sin(x * .02 / U + j * 1.3 + t) > .45) { x === -20 ? ctx.moveTo(x, yy) : ctx.lineTo(x, yy); } else ctx.moveTo(x, yy); }
      ctx.stroke();
    }
    ctx.restore();
  },
  // 扫光：一道斜向亮带从左扫到右，k 0→1
  sweep(ctx, k, o = {}) {
    if (k <= 0 || k >= 1) return;
    const w = (o.w || .22) * W, x = lerp(-w * 1.5, W + w * 1.5, eIO(k)), g = ctx.createLinearGradient(x - w, 0, x + w, 0), col = o.color || '#FFF4DC';
    g.addColorStop(0, tint(col, 1, 0)); g.addColorStop(.5, tint(col, 1, o.alpha ?? .28)); g.addColorStop(1, tint(col, 1, 0));
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.translate(W / 2, H / 2); ctx.transform(1, 0, -.35, 1, 0, 0); ctx.translate(-W / 2, -H / 2);
    ctx.fillStyle = g; ctx.fillRect(-W, 0, W * 3, H); ctx.restore();
  },
  // 光圈脉冲：节点出现时的一圈扩散
  ring(ctx, x, y, r0, k, col) {
    if (k <= 0 || k >= 1) return;
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 1 - k; ctx.strokeStyle = col || C.a3; ctx.lineWidth = 4 * U * (1 - k);
    ctx.beginPath(); ctx.arc(x, y, r0 + k * r0 * 1.6, 0, 7); ctx.stroke(); ctx.restore();
  },
  // 一次性迸散的金粉
  burst(ctx, x, y, k, seed = 0, o = {}) {
    if (k <= 0 || k >= 1) return;
    const n = o.n || 26, col = o.color || C.a3;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < n; i++) { const a = hash(seed + i) * 6.283, v = (60 + hash(seed + i + 50) * 140) * U * (o.r || 1), d = eOut(k) * v; ctx.globalAlpha = (1 - k); ctx.fillStyle = col; const s = (1.5 + hash(i) * 2) * U; ctx.fillRect(x + Math.cos(a) * d, y + Math.sin(a) * d + k * k * 40 * U, s, s); }
    ctx.restore();
  },
};

/* ---------- 转场：上一场定格画在 cvB 上，按 k（0→1）揭开新场 ---------- */
const TRANS = {
  // 墨晕：一团带毛边的墨从一点化开，新场在墨里
  ink(c, prev, k, tr) {
    const x = (tr.x ?? .5) * W, y = (tr.y ?? .5) * H, R = Math.hypot(W, H) * eIn(k) * 1.05;
    c.save(); c.beginPath(); c.rect(0, 0, W, H);
    for (let i = 0; i <= 72; i++) { const a = i / 72 * Math.PI * 2, r = R * (1 + .12 * Math.sin(a * 5 + k * 6) + .06 * Math.sin(a * 13 - k * 9)); i ? c.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r) : c.moveTo(x + r, y); }
    c.closePath(); c.clip('evenodd'); c.drawImage(prev, 0, 0); c.restore();
  },
  // 碎裂：上一场碎成三角块，往外飞、翻转、下坠
  shatter(c, prev, k, tr) {
    const cols = 9, rows = 5, cw = W / cols, ch = H / rows, ox = (tr.x ?? .5) * W, oy = (tr.y ?? .45) * H;
    for (let r = 0; r < rows; r++) for (let q = 0; q < cols; q++) for (const half of [0, 1]) {
      const x = q * cw, y = r * ch, id = (r * cols + q) * 2 + half;
      const tri = half ? [[x, y], [x + cw, y], [x + cw, y + ch]] : [[x, y], [x + cw, y + ch], [x, y + ch]];
      const mx = (tri[0][0] + tri[1][0] + tri[2][0]) / 3, my = (tri[0][1] + tri[1][1] + tri[2][1]) / 3;
      const dly = Math.hypot(mx - ox, my - oy) / Math.hypot(W, H) * .35, kk = clamp((k - dly) / (1 - dly));
      if (kk >= 1) continue;
      const ang = Math.atan2(my - oy, mx - ox), v = (300 + hash(id) * 700) * U * eIn(kk), rot = (hash(id + 7) - .5) * 3 * kk;
      c.save(); c.translate(mx + Math.cos(ang) * v, my + Math.sin(ang) * v + kk * kk * 500 * U); c.rotate(rot); c.scale(1 - kk * .4, 1 - kk * .4); c.translate(-mx, -my);
      c.beginPath(); tri.forEach(([px, py], i) => i ? c.lineTo(px, py) : c.moveTo(px, py)); c.closePath(); c.clip();
      c.globalAlpha = 1 - eIn(kk); c.drawImage(prev, 0, 0);
      c.restore();
    }
    if (k < .12) { c.save(); c.globalAlpha = .6 * (1 - k / .12); c.fillStyle = '#FFFFFF'; c.fillRect(0, 0, W, H); c.restore(); }
  },
  // 沙化：上一场碎成小方块，从左到右被风吹散
  sand(c, prev, k, tr) {
    const cols = 64, rows = 36, cw = W / cols, ch = H / rows, dir = tr.dir || 1;
    for (let r = 0; r < rows; r++) for (let q = 0; q < cols; q++) {
      const x = q * cw, y = r * ch, f = dir > 0 ? q / cols : 1 - q / cols, th = f * .65 + hash(r * 97 + q) * .35, kk = clamp((k - th * .7) / .3);
      if (kk >= 1) continue;
      const dx = eIn(kk) * (200 + hash(q + r * 7) * 500) * U * dir, dy = -eIn(kk) * (40 + hash(q * 3 + r) * 160) * U;
      c.globalAlpha = 1 - kk; c.drawImage(prev, x, y, cw + 1, ch + 1, x + dx, y + dy, (cw + 1) * (1 - kk * .6), (ch + 1) * (1 - kk * .6));
    }
    c.globalAlpha = 1;
  },
  // 推镜闪切：上一场放大变白，淡出
  zoom(c, prev, k) {
    const s = 1 + eIn(k) * .6; c.save(); c.globalAlpha = 1 - eIn(k); c.translate(W / 2, H / 2); c.scale(s, s); c.translate(-W / 2, -H / 2); c.drawImage(prev, 0, 0); c.restore();
    c.save(); c.globalAlpha = .5 * Math.sin(k * Math.PI); c.fillStyle = '#FFFFFF'; c.fillRect(0, 0, W, H); c.restore();
  },
};
