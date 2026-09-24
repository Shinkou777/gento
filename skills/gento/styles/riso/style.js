/* 幻燈 GENTO · 风格包：孔版（riso）
   纸 + 四种油墨、网点光晕、错版阴影、纸纤维与脱墨、整帧 8Hz 错位抖动。
   手法来自 dario-shabi (c) 2026 Darren Ter, MIT License */
const STYLE = defineStyle({
  id: 'riso',
  palettes: {
    standard:   { bg: '#F3EEE2', bg2: '#E6DFD0', fg: '#1C1B22', muted: '#8B857A', a1: '#EC3B2B', a2: '#2446C9', a3: '#FFD21A', dark: '#141217', onDark: '#F3EEE2', line: '#1C1B22', white: '#FFFDF6', shadow: '#1C1B22', onA1: '#F3EEE2', onA2: '#F3EEE2', onA3: '#1C1B22', flash: '#FFFDF6' },
    pinkgreen:  { bg: '#F4F0E6', bg2: '#E8E2D4', fg: '#1E1D24', muted: '#8C8679', a1: '#FF48B0', a2: '#00A95C', a3: '#FFE800', dark: '#17151C', onDark: '#F4F0E6', line: '#1E1D24', white: '#FFFDF7', shadow: '#1E1D24', onA1: '#1E1D24', onA2: '#F4F0E6', onA3: '#1E1D24', flash: '#FFFDF7' },
    orangenavy: { bg: '#F2ECDF', bg2: '#E4DCCB', fg: '#1F2233', muted: '#8A8474', a1: '#FF6C2F', a2: '#3D5588', a3: '#F6C544', dark: '#161A2A', onDark: '#F2ECDF', line: '#1F2233', white: '#FFFBF3', shadow: '#1F2233', onA1: '#1F2233', onA2: '#F2ECDF', onA3: '#1F2233', flash: '#FFFBF3' },
  },
  fonts: {
    zh: { head: { f: '"Noto Serif SC","Songti SC",serif', w: 900 }, body: { f: '"Noto Sans SC","PingFang SC",sans-serif', w: 900, also: [500] }, shout: { f: '"ZCOOL QingKe HuangYou","Noto Sans SC",sans-serif', w: 400 }, latin: { f: '"Anton","Noto Sans SC",sans-serif', w: 400 }, mono: { f: '"IBM Plex Mono","Noto Sans SC",monospace', w: 700, also: [500] } },
    ja: { head: { f: '"Noto Serif JP","Hiragino Mincho ProN",serif', w: 900 }, body: { f: '"Noto Sans JP","Hiragino Sans",sans-serif', w: 900, also: [500] }, shout: { f: '"Dela Gothic One","Noto Sans JP",sans-serif', w: 400 }, latin: { f: '"Anton","Noto Sans JP",sans-serif', w: 400 }, mono: { f: '"IBM Plex Mono","Noto Sans JP",monospace', w: 700, also: [500] } },
    en: { head: { f: '"DM Serif Display",Georgia,serif', w: 400 }, body: { f: '"Inter",system-ui,sans-serif', w: 800, also: [500] }, shout: { f: '"Anton",sans-serif', w: 400 }, latin: { f: '"Anton",sans-serif', w: 400 }, mono: { f: '"IBM Plex Mono",monospace', w: 700, also: [500] } },
  },
  motion: { hitFrom: 1.35, hitLen: .09, shake: 1, jitter: 1.4, push: .03, cutLen: .09 },

  textures() {
    const R = rng(7), A = W * H / 2073600;
    this.fiber = cnv(W, H); let g = this.fiber.getContext('2d');
    g.fillStyle = '#fff'; g.fillRect(0, 0, W, H);
    for (let i = 0; i < 70 * A; i++) {
      const x = R() * W, y = R() * H, r = 120 + R() * 460, a = .03 + R() * .05;
      const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, `rgba(150,125,85,${a})`); gr.addColorStop(1, 'rgba(150,125,85,0)');
      g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r);
    }
    g.lineCap = 'round';
    for (let i = 0; i < 3200 * A; i++) {
      const x = R() * W, y = R() * H, l = 4 + R() * 18, a = R() * Math.PI;
      g.strokeStyle = `rgba(110,95,70,${.05 + R() * .08})`; g.lineWidth = .6 + R() * .9;
      g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(a + .5) * l * .5, y + Math.sin(a + .5) * l * .5, x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke();
    }
    for (const [x0, y0, x1, y1] of [[W * .5, 0, W * .5 + 6, H], [0, H * .5, W, H * .5 - 4]]) {
      g.strokeStyle = 'rgba(120,105,80,.16)'; g.lineWidth = 3; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
      g.strokeStyle = 'rgba(255,255,255,.5)'; g.lineWidth = 2; g.beginPath(); g.moveTo(x0 + 3, y0 + 3); g.lineTo(x1 + 3, y1 + 3); g.stroke();
    }
    const id = g.getImageData(0, 0, W, H), d = id.data;
    for (let i = 0; i < d.length; i += 4) { const n = (R() - .5) * 16; d[i] += n; d[i + 1] += n; d[i + 2] += n; }
    g.putImageData(id, 0, 0);
    this.specks = []; this.grains = [];
    for (let k = 0; k < 3; k++) {
      const c = cnv(W, H), q = c.getContext('2d'); q.fillStyle = 'rgba(243,238,226,.55)';
      for (let i = 0; i < 9000 * A; i++) { const r = R() < .9 ? .6 + R() * 1.2 : 1.5 + R() * 2.5; q.beginPath(); q.arc(R() * W, R() * H, r, 0, 7); q.fill(); }
      this.specks.push(c);
    }
    for (let k = 0; k < 4; k++) {
      const c = cnv(W / 2, H / 2), q = c.getContext('2d'), im = q.createImageData(c.width, c.height), dd = im.data;
      for (let i = 0; i < dd.length; i += 4) { const v = 128 + (R() - .5) * 150; dd[i] = dd[i + 1] = dd[i + 2] = v; dd[i + 3] = 255; }
      q.putImageData(im, 0, 0); this.grains.push(c);
    }
  },
  // 底：纯色 + 一角网点光晕（角和颜色随场景轮换）
  bg(ctx, u, d, t, o = {}) {
    const tn = o.tone || 'base';
    field(ctx, tone(tn));
    if (o.plain) return;
    if (o.poster) { dotGrad(ctx, C.a3, 20 * U, radial(W, H + 20, Math.max(W, H) * .68, 1.2)); dotGrad(ctx, C.a2, 20 * U, radial(0, 0, Math.max(W, H) * .36, 1.6)); return; }
    // 光晕放在图的一侧：横屏在右，竖屏和方图在下，不压正文
    const i = o.deco ?? 0, cs = o.corners || (WIDE ? [[W + 20, -20], [W + 20, H + 20]] : [[W + 20, H + 20], [-20, H + 20]]);
    const [cx, cy] = cs[i % cs.length], R = Math.max(W, H) * (tn === 'dark' ? .45 : .5);
    const col = tn === 'base' || tn === 'alt' ? [C.a2, C.a3, C.a1, C.a2][i % 4] : tn === 'dark' ? C.a1 : C.line;
    dotGrad(ctx, col, 20 * U, radial(cx, cy, R, 1.3), tn !== 'dark');
  },
  // 纸：纤维折痕盖在最上面，脱墨白点，颗粒呼吸，暖暗角
  post(ctx, t) {
    ctx.globalCompositeOperation = 'multiply'; ctx.drawImage(this.fiber, 0, 0);
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = .7; ctx.drawImage(this.specks[Math.floor(t * 12) % 3], 0, 0); ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'soft-light'; ctx.globalAlpha = .35; ctx.drawImage(this.grains[Math.floor(t * 12) % 4], 0, 0, W, H);
    ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
    const g = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * .5, W / 2, H / 2, Math.max(W, H) * .62);
    g.addColorStop(0, 'rgba(40,25,10,0)'); g.addColorStop(1, 'rgba(40,25,10,.3)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  },
  wordCard(ctx, u, i, word, o = {}) {
    const tones = ['base', 'a1', 'a2', 'a3'], tn = o.tone || tones[i % 4], sh = [C.a1, C.line, C.line, C.a1][tones.indexOf(tn) % 4] || C.line;
    field(ctx, tone(tn));
    dotGrad(ctx, sh, 22 * U, radial(i % 2 ? W - 220 * U : 220 * U, i < 2 ? H - 130 * U : 130 * U, Math.max(W, H) * .57, 1.4));
    const latin = /^[\x00-\x7f]+$/.test(word), role = latin ? F.latin : F.head;
    const size = fitText(ctx, word, W * .86, (latin ? 580 : 440) * U, role);
    const sc = slamS(u, 0, 1.4, .09) * (1 + u * .06);
    ctx.save(); ctx.translate(W / 2, H / 2 + 20 * U); ctx.scale(sc, sc);
    text(ctx, word, 14 * U, 14 * U, { size, font: role, color: sh, mul: true, g: 'wc' });
    text(ctx, word, 0, 0, { size, font: role, color: onTone(tn), g: 'wc' });
    ctx.restore();
  },
  // 主视觉：叠印的圆、三角、网点圈，一拍长一个
  ornament(ctx, x, y, w, h, u, t, o = {}) {
    const cx = x + w / 2, cy = y + h / 2, R = Math.min(w, h) * .42, seed = o.seed || 0;
    const k = i => o.quiet ? 1 : eBack(P(u, i * BT * .5, i * BT * .5 + .3));
    const rot = Math.sin(t * .6 + seed) * .06;
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot); ctx.translate(-cx, -cy);
    dotGrad(ctx, C.line, 14 * U, (px, py) => Math.hypot(px - (cx + R * .3), py - (cy - R * .25)) < R * .95 * k(0) ? .55 * (1 - Math.hypot(px - (cx + R * .3), py - (cy - R * .25)) / R) + .1 : 0);
    ctx.save(); ctx.globalCompositeOperation = 'multiply';
    circ(ctx, cx - R * .22, cy - R * .12, R * .74 * k(0), [C.a2, C.a1, C.a3][seed % 3]);
    const tri = [[cx + R * .12, cy - R * .92], [cx + R * .98, cy + R * .72], [cx - R * .72, cy + R * .72]].map(([px, py]) => [cx + (px - cx) * k(1), cy + (py - cy) * k(1)]);
    poly(ctx, tri.map(([px, py]) => [px + 9 * U, py + 7 * U]), [C.a1, C.a2, C.a1][seed % 3]);
    circ(ctx, cx + R * .48, cy + R * .38, R * .4 * k(2), C.a3);
    ctx.restore();
    circ(ctx, cx - R * .22, cy - R * .12, R * .74 * k(0), null, C.line, 6);
    poly(ctx, tri, null, C.line, 6);
    for (let i = 0; i < 5; i++) { const a = i / 5 * 6.283 + t * .3 + seed, r2 = R * 1.05; if (k(2) > .5) text(ctx, '★', cx + Math.cos(a) * r2, cy + Math.sin(a) * r2, { size: 34 * U, color: C.line, alpha: clamp(k(2)) }); }
    ctx.restore();
  },
});
