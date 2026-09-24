/* 幻燈 GENTO · 风格包：讲故事 / 讲原理（explainer）
   扁平插画说明片：圆润图形弹进来、软投影、色块气泡、圆形开孔转场；灯泡、地球、火箭、齿轮。 */
const STYLE = defineStyle({
  id: 'explainer',
  palettes: {
    daylight: { bg: '#FFF8EC', bg2: '#FCEBD2', fg: '#23304A', muted: '#8A93A6', a1: '#FF6B4A', a2: '#3A7BFF', a3: '#FFC93C', dark: '#1F2A44', onDark: '#FFF8EC', line: '#23304A', white: '#FFFFFF', panelFg: '#23304A', shadow: 'rgba(35,48,74,.16)', skin: '#FFD3B0', coat: '#3A7BFF', hair: '#23304A', onA1: '#FFFFFF', onA2: '#FFFFFF', onA3: '#23304A', extra: '#2EC4B6', flash: '#FFC93C' },
    night:    { bg: '#14213D', bg2: '#1B2A4E', fg: '#F4F1E8', muted: '#8FA0C4', a1: '#FF8C61', a2: '#4CC9F0', a3: '#FFD166', dark: '#0B1428', onDark: '#F4F1E8', line: '#0B1428', white: '#223766', panelFg: '#F4F1E8', shadow: 'rgba(0,0,0,.35)', skin: '#FFD3B0', coat: '#4CC9F0', hair: '#0B1428', onA1: '#0B1428', onA2: '#0B1428', onA3: '#0B1428', lightA2: true, extra: '#06D6A0', flash: '#FFD166', scrim: 'rgba(5,10,25,.55)' },
    textbook: { bg: '#F6F1E1', bg2: '#ECE4CC', fg: '#2B2B2B', muted: '#8C8674', a1: '#E63946', a2: '#1D6FB8', a3: '#F4B942', dark: '#2B2B2B', onDark: '#F6F1E1', line: '#2B2B2B', white: '#FFFDF6', panelFg: '#2B2B2B', shadow: 'rgba(40,35,20,.16)', skin: '#F7D2B2', coat: '#1D6FB8', hair: '#2B2B2B', onA1: '#FFFFFF', onA2: '#FFFFFF', onA3: '#2B2B2B', extra: '#2A9D8F', flash: '#F4B942' },
  },
  fonts: {
    zh: { head: { f: '"Noto Sans SC",sans-serif', w: 900 }, body: { f: '"Noto Sans SC",sans-serif', w: 500, also: [900] }, shout: { f: '"ZCOOL KuaiLe","Noto Sans SC",sans-serif', w: 400 }, latin: { f: '"Fredoka","Noto Sans SC",sans-serif', w: 700 }, mono: { f: '"IBM Plex Mono","Noto Sans SC",monospace', w: 500, also: [700] } },
    ja: { head: { f: '"M PLUS Rounded 1c",sans-serif', w: 800 }, body: { f: '"M PLUS Rounded 1c",sans-serif', w: 500, also: [800] }, shout: { f: '"Kosugi Maru","M PLUS Rounded 1c",sans-serif', w: 400 }, latin: { f: '"Fredoka","M PLUS Rounded 1c",sans-serif', w: 700 }, mono: { f: '"IBM Plex Mono","M PLUS Rounded 1c",monospace', w: 500, also: [700] } },
    en: { head: { f: '"Nunito",sans-serif', w: 900 }, body: { f: '"Nunito",sans-serif', w: 600, also: [900] }, shout: { f: '"Fredoka",sans-serif', w: 700 }, latin: { f: '"Fredoka",sans-serif', w: 700 }, mono: { f: '"IBM Plex Mono",monospace', w: 500, also: [700] } },
  },
  lw: .8, plates: false, voidTol: .28, takeLabel: 'PART',
  motion: { shake: .5, jitter: 0, push: .02, cutLen: .3 },

  blob(ctx, cx, cy, r, col, seed, t) {
    ctx.beginPath();
    for (let i = 0; i <= 48; i++) { const a = i / 48 * Math.PI * 2, rr_ = r * (1 + .09 * Math.sin(a * 3 + seed + t * .5) + .06 * Math.sin(a * 5 - seed * 2 + t * .3)); const px = cx + Math.cos(a) * rr_, py = cy + Math.sin(a) * rr_; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
    ctx.closePath(); ctx.fillStyle = col; ctx.fill();
  },
  sparkle(ctx, x, y, s, col) { ctx.beginPath(); ctx.moveTo(x, y - s); ctx.quadraticCurveTo(x, y, x + s, y); ctx.quadraticCurveTo(x, y, x, y + s); ctx.quadraticCurveTo(x, y, x - s, y); ctx.quadraticCurveTo(x, y, x, y - s); ctx.fillStyle = col; ctx.fill(); },
  bg(ctx, u, d, t, o = {}) {
    const tn = o.tone || 'base';
    field(ctx, tone(tn));
    if (CFG.palette === 'textbook' && (tn === 'base' || tn === 'alt')) {
      ctx.save(); ctx.strokeStyle = C.a2; ctx.globalAlpha = .12; ctx.lineWidth = 1.5; for (let y = L.top; y < H; y += 54 * U) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
      ctx.strokeStyle = C.a1; ctx.globalAlpha = .3; ctx.beginPath(); ctx.moveTo(L.m * .7, 0); ctx.lineTo(L.m * .7, H); ctx.stroke(); ctx.restore();
    }
    const i = o.deco ?? 0, light = tn === 'base' || tn === 'alt', cx = WIDE ? W * .78 : W * .55, cy = WIDE ? H * (.42 + (i % 2) * .12) : H * .75;
    ctx.save(); ctx.globalAlpha = light ? .55 : .18; this.blob(ctx, cx, cy, Math.min(W, H) * .42, light ? C.bg2 : '#FFFFFF', i, t); ctx.restore();
    ctx.save(); ctx.globalAlpha = light ? .35 : .15; this.blob(ctx, cx - W * .12, cy + H * .25, Math.min(W, H) * .16, C.a3, i + 3, t); ctx.restore();
    for (let j = 0; j < 5; j++) { const tw_ = .5 + .5 * Math.sin(t * 2 + j * 1.7); this.sparkle(ctx, W * (.52 + .44 * hash(j + i * 5)), H * (.16 + .7 * hash(j * 3 + i)), (8 + 10 * tw_) * U, light ? C.a3 : C.onDark); }
  },
  // 圆形开孔：新场景从中间一个圆里张开
  cut(ctx, k) {
    const R = Math.hypot(W, H) * .55 * (1 - eIn(k));
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.arc(W / 2, H / 2, Math.max(0, R), 0, Math.PI * 2, true); ctx.fillStyle = C.flash; ctx.fill('evenodd'); ctx.restore();
  },
  shade(ctx, x, y, w, h) { ctx.fillStyle = 'rgba(0,0,0,.12)'; ctx.fillRect(x, y, w, h); },
  cheek(ctx, x, y, w, h) { ctx.save(); ctx.globalAlpha = .35; circ(ctx, x + 40, y + 70, 30, C.a1); ctx.restore(); },
  panelShadow(ctx, x, y, w, h, r = 24 * U) { ctx.fillStyle = C.shadow; ctx.beginPath(); ctx.roundRect(x, y + 12 * U, w, h, r); ctx.fill(); },
  panel(ctx, x, y, w, h, o = {}) {
    const r = o.r ?? 24 * U; this.panelShadow(ctx, x, y, w, h, r);
    rr(ctx, x, y, w, h, r, o.fill || C.white);
    if (o.head) { const hw = tw(ctx, o.head, 24 * U, F.mono, 700) + 40 * U; rr(ctx, x + 28 * U, y + 22 * U, hw, 44 * U, 22 * U, C.a2); text(ctx, o.head, x + 48 * U, y + 45 * U, { size: 24 * U, font: F.mono, weight: 700, align: 'left', color: C.onA2, meta: true }); }
    return { x: x + 40 * U, y: y + (o.head ? 90 : 36) * U, w: w - 80 * U, h: h - (o.head ? 124 : 72) * U };
  },
  title(ctx, s, x, y, o = {}) { text(ctx, s, x, y, { size: o.size || 120, font: o.font || F.head, align: o.align || 'left', color: o.color || C.fg, scale: o.scale, alpha: o.alpha, g: o.g }); },
  // 重击：弹一下
  hit(ctx, s, x, y, u, t0, o = {}) {
    if (u < t0) return;
    const size = o.size || 220, k = eBack(P(u, t0, t0 + .32 * PACE.enter));
    text(ctx, s, x, y, { size, font: o.font || F.head, align: o.align || 'left', color: o.color || C.a1, scale: Math.max(.01, k), shadow: C.shadow, sdx: 0, sdy: size * .06, g: o.g });
  },
  // 章：爆炸星形徽章
  seal(ctx, s, x, y, k, o = {}) {
    if (k <= 0) return;
    const size = Math.min(o.size || 200, 230 * U), role = /^[\x00-\x7f]+$/.test(s) ? F.latin : F.shout, fs = fitText(ctx, s, size * 2.1, size * .62, role), R = Math.max(size * .95, tw(ctx, s, fs, role) * .62 + size * .2), sc = eBack(clamp(k));
    ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc); ctx.rotate((o.rot ?? -.08) + Math.sin(k * 6) * .04);
    ctx.beginPath(); for (let i = 0; i <= 32; i++) { const a = i / 32 * Math.PI * 2, r = i % 2 ? R * .86 : R; i ? ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r * .72) : ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r * .72); }
    ctx.closePath(); ctx.fillStyle = C.shadow; ctx.save(); ctx.translate(0, 12 * U); ctx.fill(); ctx.restore(); ctx.fillStyle = o.color && o.color !== C.a1 ? o.color : C.a3; ctx.fill();
    ctx.restore();
    text(ctx, s, x, y + 4 * U, { size: fs * sc, font: role, color: C.onA3, rot: o.rot ?? -.08, g: 'seal' });
    if (QA.on) QA.boxes.push({ s, x0: x - R * .8, y0: y - R * .55, x1: x + R * .8, y1: y + R * .55, px: size, a: 1, g: 'seal' });
  },
  marker(ctx, x, y, w, h, k) { if (k <= 0) return; ctx.save(); ctx.globalAlpha = .75; ctx.globalCompositeOperation = hexLum(C.bg) > .4 ? 'multiply' : 'source-over'; rr(ctx, x - 8 * U, y + h * .12, (w + 16 * U) * eOut(k), h * .8, h * .4, C.a3); ctx.restore(); },
  caption(ctx, u, t0, t1, segs, o = {}) {
    if (u < t0 || u > t1) return;
    const size = o.size || 46 * U, role = o.font || F.body, pad = 40 * U;
    const w = segs.reduce((a, [s]) => a + tw(ctx, s, size, role, 900), 0) + pad * 2 + 30 * U, h = size + 40 * U, x = W / 2 - w / 2, y = (o.y ?? L.capY) - h / 2;
    const k = eBack(P(u, t0, t0 + .3)) * (1 - eIn(P(u, t1 - .12, t1)));
    ctx.save(); ctx.translate(W / 2, y + h / 2); ctx.scale(Math.max(.01, k), Math.max(.01, k)); ctx.translate(-W / 2, -(y + h / 2));
    rr(ctx, x, y + 8 * U, w, h, h / 2, C.shadow); rr(ctx, x, y, w, h, h / 2, C.dark);
    circ(ctx, x + 32 * U, y + h / 2, 10 * U, C.a3);
    rich(ctx, segs.map(([s, c]) => [s, c === C.a3 ? C.a3 : c || C.onDark]), x + 30 * U + pad, y + h / 2 + 2, size, { font: role, weight: 900 });
    ctx.restore();
  },
  wordCard(ctx, u, i, word, o = {}) {
    const tn = o.tone || ['a2', 'a1', 'a3', 'base'][i % 4];
    this.bg(ctx, u, 0, u, { tone: tn, deco: i });
    const latin = /^[\x00-\x7f]+$/.test(word), role = latin ? F.latin : F.shout;
    const size = fitText(ctx, word, W * .8, (latin ? 440 : 400) * U, role), k = eBack(P(u, 0, .3));
    text(ctx, word, W / 2, H / 2, { size, font: role, color: onTone(tn), scale: Math.max(.01, k), shadow: 'rgba(0,0,0,.15)', sdx: 0, sdy: size * .05, g: 'wc' });
  },
  chapter(ctx, u, d, t, o) {
    const tn = o.tone || ['a2', 'a1', 'dark', 'a2'][(o.n - 1) % 4], fg = onTone(tn);
    this.bg(ctx, u, d, t, { tone: tn, deco: o.n });
    const G = chapterGeom(), R = WIDE ? H * .32 : G.ns * .42, cx = WIDE ? W * .7 : W * .5, cy = WIDE ? H * .5 : G.cy, k = eBack(P(u, 0, .35));
    circ(ctx, cx, cy + 14 * U, R * k, 'rgba(0,0,0,.15)'); circ(ctx, cx, cy, R * k, C.a3);
    text(ctx, String(o.n), cx, cy + R * .04, { size: R * 1.25 * k || 1, font: F.latin, color: C.onA3, g: 'num' });
    for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2 + t * .4, rr_ = R * (1.25 + .08 * Math.sin(t * 3 + i)); circ(ctx, cx + Math.cos(a) * rr_, cy + Math.sin(a) * rr_, 9 * U * k, [C.white, C.a1, C.a3][i % 3]); }
    const x0 = G.x0, y0 = WIDE ? 400 * U : G.y0 + 20 * U;
    const tg = tw(ctx, `${o.tag} ${o.n}`, 40 * U, F.head) + 50 * U; rr(ctx, x0, y0 - 150 * U, tg, 66 * U, 33 * U, tn === 'dark' ? C.a2 : C.white); text(ctx, `${o.tag} ${o.n}`, x0 + 25 * U, y0 - 116 * U, { size: 40 * U, font: F.head, align: 'left', color: tn === 'dark' ? C.onA2 : C.fg });
    const ts = fitText(ctx, o.title, WIDE ? W * .44 : L.cw, 120 * U, F.head);
    this.hit(ctx, o.title, x0, y0 + 20 * U, u, .08, { size: ts, color: fg });
    text(ctx, `${pad2(o.n)} / ${pad2(o.total)}`, x0, y0 + 130 * U, { size: 30 * U, font: F.mono, weight: 700, align: 'left', color: fg, alpha: .7 * P(u, .15, .3), meta: true });
  },
  bar(ctx, x, y, w, h, col) {
    rr(ctx, x, y + 10 * U, w, h, [18 * U, 18 * U, 0, 0], C.shadow); rr(ctx, x, y, w, h, [18 * U, 18 * U, 0, 0], col);
    ctx.save(); ctx.globalAlpha = .25; rr(ctx, x + w * .15, y + 14 * U, w * .18, Math.max(0, h - 28 * U), 8 * U, '#FFFFFF'); ctx.restore();
  },
  link(ctx, x0, y0, x1, y1, k, o = {}) { arrow(ctx, x0, y0, x1, y1, k, { lw: 6, color: C.fg, head: o.head, dash: [16 * U, 12 * U], hs: 22 }); },
  // 主视觉：灯泡 / 地球 / 火箭 / 齿轮，弹进来后轻轻上下浮
  ornament(ctx, x, y, w, h, u, t, o = {}) {
    const S = Math.min(w, h), seed = o.seed || 0, kind = o.kind || ['bulb', 'globe', 'rocket', 'gears'][seed % 4];
    const k = i => o.quiet ? 1 : eBack(P(u, i * BT * .5, i * BT * .5 + .35)), bob = Math.sin(t * 2) * 8 * U;
    const cx = x + w * .5, cy = y + h * .5 + bob, ink = C.line, lw = 6 * U;
    ctx.save(); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    ell(ctx, cx, y + h * .93, S * .28 * clamp(k(0)), S * .04, C.shadow);
    if (kind === 'bulb') {
      const r = S * .27 * k(0);
      for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2 + t * .3, r1 = r * 1.25, r2 = r * (1.45 + .08 * Math.sin(t * 4 + i)); if (k(1) > .2) { ctx.strokeStyle = C.a3; ctx.lineWidth = lw; ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * r1, cy - r * .2 + Math.sin(a) * r1); ctx.lineTo(cx + Math.cos(a) * r2, cy - r * .2 + Math.sin(a) * r2); ctx.stroke(); } }
      circ(ctx, cx, cy - r * .2, r, C.a3, ink, 6);
      circ(ctx, cx - r * .35, cy - r * .55, r * .18, 'rgba(255,255,255,.7)');
      rr(ctx, cx - r * .38, cy + r * .72, r * .76, r * .5, 8 * U, C.muted, ink, 6);
      for (let i = 1; i < 3; i++) { ctx.strokeStyle = ink; ctx.lineWidth = 4 * U; ctx.beginPath(); ctx.moveTo(cx - r * .38, cy + r * .72 + i * r * .16); ctx.lineTo(cx + r * .38, cy + r * .72 + i * r * .16); ctx.stroke(); }
      ctx.strokeStyle = C.a1; ctx.lineWidth = 5 * U; ctx.beginPath(); ctx.moveTo(cx - r * .25, cy + r * .2); ctx.lineTo(cx - r * .12, cy - r * .2); ctx.lineTo(cx, cy + r * .1); ctx.lineTo(cx + r * .12, cy - r * .2); ctx.lineTo(cx + r * .25, cy + r * .2); ctx.stroke();
    } else if (kind === 'globe') {
      const r = S * .3 * k(0);
      circ(ctx, cx, cy, r, C.a2, ink, 6);
      ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.clip();
      for (let i = 0; i < 4; i++) this.blob(ctx, cx - r + ((i * r * .8 + t * 30 * U) % (r * 2.8)) - r * .4, cy + (hash(i) - .5) * r * 1.2, r * (.25 + hash(i + 2) * .2), C.extra, i, 0);
      ctx.restore(); circ(ctx, cx, cy, r, null, ink, 6);
      const a = t * 1.2, ox = cx + Math.cos(a) * r * 1.5, oy = cy + Math.sin(a) * r * .45;
      ctx.save(); ctx.strokeStyle = C.fg; ctx.globalAlpha = .5; ctx.lineWidth = 3 * U; ctx.setLineDash([10 * U, 10 * U]); ctx.beginPath(); ctx.ellipse(cx, cy, r * 1.5, r * .45, 0, 0, 7); ctx.stroke(); ctx.restore();
      if (k(1) > .3) { ctx.save(); ctx.translate(ox, oy); ctx.rotate(a); rr(ctx, -14 * U, -14 * U, 28 * U, 28 * U, 4 * U, C.white, ink, 4); rr(ctx, -46 * U, -9 * U, 28 * U, 18 * U, 3 * U, C.a1, ink, 3); rr(ctx, 18 * U, -9 * U, 28 * U, 18 * U, 3 * U, C.a1, ink, 3); ctx.restore(); }
    } else if (kind === 'rocket') {
      const s = S * .0026 * k(0);
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(.5); ctx.scale(s, s);
      flame(ctx, 0, 150, 1.2 + .15 * Math.sin(t * 20), t, 1);
      poly(ctx, [[-60, 60], [-110, 150], [-50, 120]], C.a1, ink, 7); poly(ctx, [[60, 60], [110, 150], [50, 120]], C.a1, ink, 7);
      ctx.beginPath(); ctx.moveTo(0, -170); ctx.bezierCurveTo(80, -110, 70, 60, 50, 130); ctx.lineTo(-50, 130); ctx.bezierCurveTo(-70, 60, -80, -110, 0, -170); ctx.closePath(); ctx.fillStyle = C.white; ctx.fill(); ctx.lineWidth = 7; ctx.strokeStyle = ink; ctx.stroke();
      ctx.save(); ctx.clip(); ctx.fillStyle = C.a1; ctx.fillRect(-100, -180, 200, 60); ctx.restore(); ctx.stroke();
      circ(ctx, 0, -20, 34, C.a2, ink, 7); circ(ctx, -10, -30, 10, 'rgba(255,255,255,.7)');
      ctx.restore();
      for (let i = 0; i < 4; i++) { const ph = (t * 1.5 + i / 4) % 1; ctx.strokeStyle = C.fg; ctx.globalAlpha = .4 * (1 - ph); ctx.lineWidth = 4 * U; const lx = cx - S * (.25 + ph * .3) + i * 18 * U, ly = cy + S * (.2 + ph * .15) - i * 30 * U; ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(lx - 50 * U, ly + 30 * U); ctx.stroke(); }
      ctx.globalAlpha = 1;
    } else {
      const g = (gx, gy, R, n, rot, col) => { ctx.save(); ctx.translate(gx, gy); ctx.rotate(rot); ctx.beginPath(); for (let i = 0; i <= n * 2; i++) { const a = i / (n * 2) * Math.PI * 2, r = i % 2 ? R * .82 : R; i ? ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r) : ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r); } ctx.closePath(); ctx.fillStyle = col; ctx.fill(); ctx.lineWidth = lw; ctx.strokeStyle = ink; ctx.stroke(); circ(ctx, 0, 0, R * .3, C.white, ink, 6); ctx.restore(); };
      g(cx - S * .1, cy + S * .05, S * .24 * k(0), 10, t * .6, C.a2);
      g(cx + S * .2, cy - S * .17, S * .15 * k(1), 7, -t * .6 * 10 / 7 + .2, C.a3);
    }
    ctx.restore();
  },
});
