/* 幻燈 GENTO · scenes/library.js
   场景模板。每个模板只调风格零件（STYLE.xxx）和 kit，换风格、换画幅不用改。
   每个模板自带音效（cues）和镜头冲击（imp），所以「每一下都有声」由模板保证。
   时间一律按拍：动作落在 BT 的整数倍或半拍上。 */

const T = {};
const pad2 = n => String(n).padStart(2, '0');
const nfmt = (v, dec = 0) => Number(v).toLocaleString(LANG === 'en' ? 'en-US' : 'ja-JP', { minimumFractionDigits: dec, maximumFractionDigits: dec });
const chars = s => [...String(s || '')].length;
// 版面分区：横屏左字右图，竖屏和方图上字下图
function areas(split = .58) {
  if (WIDE) { const w0 = L.cw * split; return { text: { x: L.left, y: L.top, w: w0, h: L.ch }, art: { x: L.left + L.cw * (split + .04), y: L.top - 10, w: L.cw * (1 - split - .04), h: L.ch + 20 } }; }
  const th = L.ch * (TALL ? .5 : .56);
  return { text: { x: L.left, y: L.top, w: L.cw, h: th }, art: { x: L.left, y: L.top + th + 24, w: L.cw, h: L.ch - th - 24 } };
}
// 字比栏窄时，把图往字这边扩（只在横屏）
function hugArt(A, textW) {
  if (!WIDE) return A;
  const x = Math.min(A.art.x, A.text.x + textW + 110 * U);
  return Object.assign({}, A, { art: { x, y: A.art.y, w: L.right - x + 20 * U, h: A.art.h } });
}
const stackH = items => items.reduce((a, it, i) => a + it.h + (i ? (it.gap ?? 20 * U) : 0), 0);
// 竖排堆叠：items = [{h, gap}]，在区域里垂直居中，返回每项中心 y
function stackY(r, items, align = 'center') {
  const total = items.reduce((a, it, i) => a + it.h + (i ? (it.gap ?? 20 * U) : 0), 0);
  let y = align === 'top' ? r.y : r.y + Math.max(0, (r.h - total) / 2);
  return items.map((it, i) => { if (i) y += it.gap ?? 20 * U; const c = y + it.h / 2; y += it.h; return c; });
}
// 右侧/下方的图：默认风格主视觉，也可以是图标、人物或自定义函数
function drawArt(ctx, art, r, u, t, seed = 0) {
  if (art === false || r.w < 180 * U || r.h < 180 * U) return;
  if (typeof art === 'function') return art(ctx, r.x, r.y, r.w, r.h, u, t);
  if (art && art.icon) {
    const s = Math.min(r.w, r.h) * .62, k = eBack(P(u, 0, .35));
    STYLE.ornament(ctx, r.x, r.y, r.w, r.h, u, t, { seed, kind: art.kind, quiet: true });
    if (k > 0) icon(ctx, art.icon, r.x + r.w / 2, r.y + r.h / 2, s * k, { fill: art.fill || C.a3 });
    return;
  }
  if (art && art.figure) {
    const s = Math.min(r.h / 1000, r.w / 520), k = eBack(P(u, 0, .35));
    person(ctx, r.x + r.w / 2, lerp(r.y + r.h + 500 * s, r.y + r.h - 10 * U, k), s, { ...art.figure, head: { t, ...(art.figure.head || {}) } });
    return;
  }
  STYLE.ornament(ctx, r.x, r.y, r.w, r.h, u, t, Object.assign({ seed }, art || {}));
}
// 在一组换好行的字里找短语，返回 [行号, x 偏移, 宽]
function findIn(ctx, lines, phrase, size, role) {
  if (!phrase) return null;
  for (let i = 0; i < lines.length; i++) { const j = lines[i].indexOf(phrase); if (j >= 0) return [i, tw(ctx, lines[i].slice(0, j), size, role), tw(ctx, phrase, size, role)]; }
  return null;
}
// 多行逐字落下，返回结束时刻
function staggerLines(ctx, blk, x, ys, u, t0, o = {}) {
  let t = t0;
  blk.lines.forEach((ln, i) => { stagger(ctx, ln, x, ys[i], u, t, { size: blk.size, font: o.font || F.head, color: o.color, align: o.align, glow: o.glow }); t += chars(ln) * PACE.step; });
  return t;
}
const typeCues = (k, t0, s, step = PACE.step, g = .7) => { const n = Math.min(chars(s), 28); for (let i = 0; i < n; i++) k.type(t0 + .02 + i * step * chars(s) / n, g); };

/* ---------- 冷开场：一拍一张字卡 ---------- */
T.open = (o) => ({
  kind: 'open', hud: false, bg: { tone: 'a1' },
  fn(ctx, u, d, t) {
    const n = o.words.length, per = o.per ? o.per * BT : BT, i = Math.min(n - 1, Math.floor(u / per));
    STYLE.wordCard(ctx, u - i * per, i, o.words[i], { tone: o.tones && o.tones[i] });
    if (o.label !== false) text(ctx, `${o.label || STYLE.takeLabel || 'TAKE'} ${i + 1}/${n}`, L.m * .6, H - 60 * U, { size: 24 * U, font: F.mono, align: 'left', color: onTone((o.tones && o.tones[i]) || ['base', 'a1', 'a2', 'a3'][i % 4]), alpha: .85, meta: true });
  },
  imp: d => o.words.map((_, i) => [i * (o.per || 1) * BT, 1.1]),
});

/* ---------- 海报：标题三行拼起来，第二拍盖章 ---------- */
T.poster = (o) => {
  let lay;
  const layout = ctx => {
    const withArt = WIDE && o.art != null && o.art !== false;
    const c = { x: L.left + (WIDE ? 30 * U : 0), w: (L.cw - (WIDE ? 30 * U : 0)) * (withArt ? .6 : 1) };
    let kick = o.kicker ? fitText(ctx, o.kicker, c.w * .7, (TALL ? 110 : 130) * U, F.head) : 0;
    let big = fitText(ctx, o.title, c.w * (WIDE && !withArt ? .62 : 1), (TALL ? 260 : 340) * U, /^[\x00-\x7f]+$/.test(o.title) ? F.latin : F.head);
    let tail = o.tail ? fitText(ctx, o.tail, c.w * .5, (TALL ? 110 : 130) * U, F.head) : 0;
    let sub = o.sub ? fitText(ctx, o.sub, c.w * (WIDE ? .6 : 1), 44 * U, F.body) : 0;
    // 几行加起来比版心高，就整体缩
    let seal = o.seal ? Math.min((WIDE ? 240 : 230) * U, (WIDE ? W * .42 : W * .8) / Math.max(2, chars(o.seal) + .9)) : 0;
    const sealBelow = !WIDE || withArt, sealRow = sealBelow && o.seal ? seal * 1.7 + 50 * U : 0;
    const need = kick + big * 1.05 + tail + sub + (o.note ? 30 * U : 0) + sealRow + 184 * U;
    if (need > L.ch) { const f = (L.ch - 184 * U) / (need - 184 * U); kick *= f; big *= f; tail *= f; seal *= f; sub = Math.max(28 * U, sub * f); }
    const ys = stackY({ y: L.top, h: L.ch }, [{ h: kick }, { h: big * 1.05, gap: 56 * U }, { h: tail, gap: 44 * U }, { h: sub, gap: 60 * U }, { h: o.note ? 30 * U : 0, gap: 24 * U }, { h: sealBelow && o.seal ? seal * 1.7 : 0, gap: 50 * U }]);
    return { c, withArt, sealBelow, kick, big, tail, sub, seal, ys, bigRole: /^[\x00-\x7f]+$/.test(o.title) ? F.latin : F.head };
  };
  return {
    kind: 'poster', hud: false, bg: { tone: 'base', deco: 1, poster: true },
    fn(ctx, u, d, t) {
      lay = lay || layout(ctx);
      const { c, ys } = lay;
      STYLE.bg(ctx, u, d, t, this.bg);
      if (lay.withArt) drawArt(ctx, o.art, { x: L.left + L.cw * .64, y: L.top - 20 * U, w: L.cw * .36, h: L.ch + 40 * U }, u, t, 7);
      const sl = i => eOut(P(u, i * .05, i * .05 + .22 * PACE.enter));
      if (o.kicker) text(ctx, o.kicker, lerp(-300, c.x, sl(0)), ys[0], { size: lay.kick, font: F.head, align: 'left', color: C.fg });
      ctx.save(); ctx.translate(lerp(W, 0, sl(1)), 0);
      STYLE.title(ctx, o.title, c.x, ys[1], { size: lay.big, font: lay.bigRole });
      ctx.restore();
      if (o.tail) text(ctx, o.tail, lerp(-300, c.x, sl(2)), ys[2], { size: lay.tail, font: F.head, align: 'left', color: C.fg });
      if (o.seal) {
        const sz = lay.seal, sw = sz * (chars(o.seal) + .9);
        const sx = !lay.sealBelow ? W - L.m - sw / 2 - 30 * U : c.x + sw / 2 + 20 * U;
        STYLE.seal(ctx, o.seal, sx, !lay.sealBelow ? ys[2] : ys[5], P(u, BT, BT + .11), { size: sz, rot: -.1 });
      }
      if (o.sub) typewriter(ctx, o.sub, c.x, ys[3], u, BT * 2.1, BT * 2.1 + chars(o.sub) * .04, { size: lay.sub, font: F.body });
      if (o.note && u > BT * 3.2) text(ctx, o.note, c.x, ys[4], { size: 26 * U, font: F.body, weight: 500, align: 'left', color: C.muted, alpha: P(u, BT * 3.2, BT * 3.5), meta: true });
    },
    cues(k, t0) { k.hit(t0 + .2, .6); if (o.art) k.pop(t0 + .35, .5); if (o.seal) k.seal(t0 + BT, 1); if (o.sub) for (let i = 0; i < Math.min(chars(o.sub), 24); i++) k.type(t0 + BT * 2.1 + i * .04 * chars(o.sub) / Math.min(chars(o.sub), 24)); },
    imp: d => o.seal ? [[.2, .6], [BT, 1.6]] : [[.2, .6]],
  };
};

/* ---------- 章节卡 ---------- */
T.chapter = (o) => ({
  kind: 'chapter', hud: false, flash: true, chap: { tag: `${o.tag} ${pad2(o.n)}`, title: o.title }, bg: { tone: o.tone || 'a1' },
  fn(ctx, u, d, t) { STYLE.chapter(ctx, u, d, t, o); },
  cues(k, t0) { typeCues(k, t0 + .1, o.title, .025, .5); },
  imp: d => [[0, 1.2]],
});

/* ---------- 引语：一句铺垫 + 一个重击词 + 一句收尾，右边主视觉 ---------- */
T.quote = (o) => {
  let lay;
  const layout = ctx => {
    const A = areas(o.split || .58), c = A.text;
    const hitRole = /^[\x00-\x7f]+$/.test(o.hit || '') ? F.latin : F.head;
    let lead, hitSize, rest, items;
    for (let f = 1; ; f *= .9) {
      lead = o.lead ? fitBlock(ctx, o.lead, c.w, c.h * .3, (TALL ? 80 : 84) * U * f, F.head, { maxLines: 3 }) : null;
      hitSize = o.hit ? fitText(ctx, o.hit, c.w * .98, (o.hitSize || (WIDE ? 290 : 240)) * U * f, hitRole) : 0;
      rest = o.rest ? fitBlock(ctx, o.rest, c.w, c.h * .3, (TALL ? 66 : 68) * U * f, F.head, { maxLines: 3 }) : null;
      items = [{ h: o.meta ? 34 * U : 0 }];
      if (lead) lead.lines.forEach((_, i) => items.push({ h: lead.lh, gap: i ? 0 : 30 * U * f }));
      items.push({ h: hitSize * 1.1, gap: 26 * U * f });
      if (rest) rest.lines.forEach((_, i) => items.push({ h: rest.lh, gap: i ? 0 : 26 * U * f }));
      items.push({ h: o.source ? 30 * U : 0, gap: 36 * U * f });
      if (stackH(items) <= c.h || f < .5) break;
    }
    const ys = stackY(c, items);
    let j = 1; const leadY = lead ? lead.lines.map(() => ys[j++]) : []; const hitY = ys[j++]; const restY = rest ? rest.lines.map(() => ys[j++]) : []; const srcY = ys[j];
    const textW = Math.max(lead ? lead.w : 0, o.hit ? tw(ctx, o.hit, hitSize, hitRole) : 0, rest ? rest.w : 0, o.source ? tw(ctx, o.source, 26 * U, F.mono) : 0);
    const mid = !WIDE && textW < c.w * .66;
    return { A: hugArt(A, textW), c, mid, lead, hitSize, hitRole, rest, metaY: ys[0], leadY, hitY, restY, srcY, mark: rest && findIn(ctx, rest.lines, o.mark, rest.size, F.head) };
  };
  const tMark = d => Math.min(3 * BT, d - .7);
  return {
    kind: 'content', bg: { tone: o.tone || 'base', deco: o.deco ?? 0 }, date: o.date,
    fn(ctx, u, d, t) {
      lay = lay || layout(ctx);
      const { c } = lay, fg = onTone(this.bg.tone);
      STYLE.bg(ctx, u, d, t, this.bg);
      drawArt(ctx, o.art, lay.A.art, u, t, o.deco ?? 0);
      const al = lay.mid ? 'center' : 'left', tx = lay.mid ? c.x + c.w / 2 : c.x;
      if (o.meta) text(ctx, o.meta, tx, lay.metaY, { size: 30 * U, font: F.mono, align: al, color: C.a2 === tone(this.bg.tone) ? fg : C.a2, alpha: P(u, 0, .12), meta: true });
      if (lay.lead) staggerLines(ctx, lay.lead, tx, lay.leadY, u, 0, { color: fg, align: al });
      if (o.hit) STYLE.hit(ctx, o.hit, lay.mid ? tx : c.x - 6 * U, lay.hitY, u, BT, { size: lay.hitSize, font: lay.hitRole, align: al, color: accentOn(this.bg.tone, o.hitColor || C.a1) });
      if (lay.rest) {
        if (lay.mark) { const [li, mx, mw] = lay.mark, lx = lay.mid ? tx - tw(ctx, lay.rest.lines[li], lay.rest.size, F.head) / 2 : c.x; STYLE.marker(ctx, lx + mx - 8 * U, lay.restY[li] - lay.rest.size * .52, mw + 16 * U, lay.rest.size * 1.04, eOut(P(u, tMark(d), tMark(d) + .25))); }
        staggerLines(ctx, lay.rest, tx, lay.restY, u, 1.5 * BT, { color: fg, align: al });
      }
      if (o.source && u > tMark(d)) text(ctx, o.source, tx, lay.srcY, { size: 26 * U, font: F.mono, align: al, color: C.muted, alpha: P(u, tMark(d), tMark(d) + .2), meta: true });
      if (o.caption) STYLE.caption(ctx, u, o.captionAt ?? Math.max(BT * 2, d - BAR), d, o.caption);
    },
    cues(k, t0, d) {
      typeCues(k, t0, o.lead); if (o.hit) k.hit(t0 + BT, 1); typeCues(k, t0 + 1.5 * BT, o.rest);
      if (o.mark) { k.swish(t0 + tMark(d), .25, .5); k.ding(t0 + tMark(d) + .08); }
      if (o.art !== false) for (let i = 0; i < 3; i++) k.pop(t0 + i * BT * .5, .6);
    },
    imp: d => [[BT, 1.1], [0, .3], [BT * .5, .3]],
  };
};

/* ---------- 大数字：从起点数上去，最后砸下 ---------- */
T.number = (o) => {
  let lay;
  const tLand = 2 * BT;
  const layout = ctx => {
    const A = areas(o.split || .6), c = A.text;
    const fin = (o.prefix || '') + nfmt(o.value, o.decimals || 0) + (o.suffix || '');
    let size, label, items;
    for (let f = 1; ; f *= .9) {
      size = fitText(ctx, fin, c.w, (o.size || (WIDE ? 300 : 260)) * U * f, F.latin);
      label = o.label ? fitBlock(ctx, o.label, c.w, c.h * .3, 72 * U * f, F.head, { maxLines: 2 }) : null;
      items = [{ h: o.meta ? 34 * U : 0 }, { h: size * 1.05, gap: 56 * U * f }];
      if (label) label.lines.forEach((_, i) => items.push({ h: label.lh, gap: i ? 0 : 20 * U }));
      items.push({ h: o.note ? 30 * U : 0, gap: 30 * U });
      if (stackH(items) <= c.h || f < .5) break;
    }
    const ys = stackY(c, items); let j = 2;
    const textW = Math.max(tw(ctx, fin, size, F.latin), label ? label.w : 0, o.note ? tw(ctx, o.note, 26 * U, F.mono) : 0);
    const mid = !WIDE && textW < c.w * .66;
    return { A: hugArt(A, textW), c, mid, size, fin, label, metaY: ys[0], numY: ys[1], labelY: label ? label.lines.map(() => ys[j++]) : [], noteY: ys[j] };
  };
  return {
    kind: 'content', bg: { tone: o.tone || 'base', deco: o.deco ?? 1 }, date: o.date,
    fn(ctx, u, d, t) {
      lay = lay || layout(ctx);
      const { c } = lay, fg = onTone(this.bg.tone);
      STYLE.bg(ctx, u, d, t, this.bg);
      drawArt(ctx, o.art, lay.A.art, u, t, o.deco ?? 1);
      const al = lay.mid ? 'center' : 'left', tx = lay.mid ? c.x + c.w / 2 : c.x;
      if (o.meta) text(ctx, o.meta, tx, lay.metaY, { size: 30 * U, font: F.mono, align: al, color: C.a2, alpha: P(u, 0, .12), meta: true });
      const k = eOut(P(u, 0, tLand)), v = lerp(o.from || 0, o.value, k);
      const s = (o.prefix || '') + nfmt(u < tLand ? v : o.value, o.decimals || 0) + (o.suffix || '');
      if (u < tLand) text(ctx, s, tx, lay.numY, { size: lay.size, font: F.latin, align: al, color: fg, alpha: .35 + .65 * k, g: 'num' });
      else STYLE.hit(ctx, s, tx, lay.numY, u, tLand, { size: lay.size, font: F.latin, align: al, color: accentOn(this.bg.tone, o.color || C.a1), g: 'num' });
      if (lay.label) staggerLines(ctx, lay.label, tx, lay.labelY, u, BT * .5, { color: fg, align: al });
      if (o.note && u > tLand) text(ctx, o.note, tx, lay.noteY, { size: 26 * U, font: F.mono, align: al, color: C.muted, alpha: P(u, tLand, tLand + .2), meta: true });
      if (o.caption) STYLE.caption(ctx, u, o.captionAt ?? Math.max(BT * 3, d - BAR), d, o.caption);
    },
    cues(k, t0) { for (let i = 0; i < 8; i++) k.tick(t0 + i * tLand / 8, .5 + i * .06); k.hit(t0 + tLand, 1.1); k.ding(t0 + tLand + .06, 1318.5, .8); typeCues(k, t0 + BT * .5, o.label, PACE.step, .5); },
    imp: d => [[tLand, 1.4]],
  };
};

/* ---------- 柱状图：一拍长一根，最后一根砸下 ---------- */
T.bars = (o) => {
  let lay;
  const n = o.items.length;
  const layout = ctx => {
    const tsz = o.title ? fitText(ctx, o.title, L.cw * (WIDE ? .6 : 1), (TALL ? 80 : 84) * U, F.head) : 0;
    const top = L.top + (o.title ? tsz * 1.2 + (o.sub ? 50 * U : 0) + 30 * U : 0);
    const bigLab = o.items[n - 1][2] || String(o.items[n - 1][1]);
    const bigSize = fitText(ctx, bigLab, WIDE ? L.cw * .4 : L.cw * .8, (WIDE ? 120 : 110) * U, F.latin);
    const chart = { x: L.left + 20 * U, y: top + (WIDE ? 20 : bigSize * 1.3) * U, w: L.cw - 40 * U, h: L.bot - top - (WIDE ? 90 : bigSize * 1.3 + 90) * U };
    const max = Math.max(...o.items.map(i => i[1]));
    return { tsz, top, chart, max, bigLab, bigSize };
  };
  return {
    kind: 'content', bg: { tone: o.tone || 'base', deco: o.deco ?? 2 }, date: o.date,
    fn(ctx, u, d, t) {
      lay = lay || layout(ctx);
      const { chart: r, max } = lay, fg = onTone(this.bg.tone);
      STYLE.bg(ctx, u, d, t, this.bg);
      if (o.title) text(ctx, o.title, L.left, L.top + lay.tsz * .6, { size: lay.tsz, font: F.head, align: 'left', color: fg, alpha: P(u, 0, .12) });
      if (o.sub) text(ctx, o.sub, L.left, L.top + lay.tsz * 1.2 + 24 * U, { size: 34 * U, font: F.body, align: 'left', color: C.a1, alpha: P(u, .05, .2) });
      const base = r.y + r.h, gap = r.w / n, bw = Math.min(gap * .62, 220 * U);
      ctx.lineWidth = LW(7); ctx.strokeStyle = C.line; ctx.beginPath(); ctx.moveTo(r.x - 20 * U, base); ctx.lineTo(r.x + r.w, base); ctx.stroke();
      o.items.forEach(([lab, v, disp], i) => {
        const g = eBack(P(u, i * BT, i * BT + .22)); if (g <= 0) return;
        const h = v / max * (r.h - 70 * U) * g, x = r.x + i * gap + (gap - bw) / 2, last = i === n - 1;
        STYLE.bar(ctx, x, base - h, bw, h, last ? C.a1 : C.a2, i);
        text(ctx, lab, x + bw / 2, base + 36 * U, { size: 26 * U, font: F.mono, color: C.muted, meta: true });
        if (!last) text(ctx, disp || nfmt(v), x + bw / 2, base - h - 36 * U, { size: 44 * U, font: F.latin, color: fg, scale: Math.min(1, g) });
      });
      if (u > (n - 1) * BT) {
        const bx = L.right, by = WIDE ? lay.top + lay.bigSize * .2 : lay.top + lay.bigSize * .55;
        STYLE.hit(ctx, lay.bigLab, bx, by, u, (n - 1) * BT, { size: lay.bigSize, font: F.latin, align: 'right', color: C.a1 });
      }
      if (o.note) text(ctx, o.note, L.left, L.bot + 60 * U, { size: 24 * U, font: F.mono, align: 'left', color: C.muted, alpha: P(u, (n - 1) * BT, (n - 1) * BT + .2), meta: true });
    },
    cues(k, t0) { o.items.forEach((_, i) => { if (i < n - 1) k.note(t0 + i * BT, i + 2); }); k.hit(t0 + (n - 1) * BT, 1.1); k.ding(t0 + (n - 1) * BT + .05, 1318.5, 1); },
    imp: d => o.items.map((_, i) => [i * BT, i === n - 1 ? 1.5 : .35]),
  };
};

/* ---------- 清单：编号行一拍一条，装在卡片里 ---------- */
T.list = (o) => {
  let lay;
  const n = o.items.length, per = o.per || (n > 4 ? .5 : 1);
  const layout = ctx => {
    const A = areas(o.split || .62), c = WIDE ? A.text : { x: L.left, y: L.top, w: L.cw, h: L.ch * (TALL ? .72 : .78) };
    const tsz = o.title ? fitText(ctx, o.title, c.w, (TALL ? 84 : 80) * U, F.head) : 0;
    const panelY = c.y + (o.title ? tsz * 1.4 : 0), panelH = Math.min(c.h - (panelY - c.y), (110 + n * 112) * U);
    const rowH = (panelH - (o.meta ? 90 : 40) * U) / n;
    const rs = Math.min(56 * U, rowH * .5);
    const rows = o.items.map(s => fitText(ctx, s, c.w - (o.icons ? 250 : 170) * U, rs, F.head));
    const artR = WIDE ? A.art : { x: L.left, y: panelY + panelH + 30 * U, w: L.cw, h: L.bot - (panelY + panelH + 30 * U) };
    return { c, tsz, panelY, panelH, rowH, rows, artR };
  };
  return {
    kind: 'content', bg: { tone: o.tone || 'base', deco: o.deco ?? 3 }, date: o.date,
    fn(ctx, u, d, t) {
      lay = lay || layout(ctx);
      const { c } = lay, fg = onTone(this.bg.tone);
      STYLE.bg(ctx, u, d, t, this.bg);
      if (lay.artR.h > 160 * U) drawArt(ctx, o.art, lay.artR, u, t, o.deco ?? 3);
      if (o.title) stagger(ctx, o.title, c.x, c.y + lay.tsz * .55, u, 0, { size: lay.tsz, color: fg });
      const k = eBack(P(u, BT * .25, BT * .25 + .25)); if (k <= 0) return;
      ctx.save(); ctx.translate(lerp(W * .6, 0, clamp(k)), 0);
      const inner = STYLE.panel(ctx, c.x, lay.panelY, c.w, lay.panelH, { head: o.meta });
      o.items.forEach((s, i) => {
        const t0 = BT * (.75 + i * per), r = eOut(P(u, t0, t0 + .16)); if (r <= 0) return;
        const y = inner.y + lay.rowH * (i + .5);
        text(ctx, pad2(i + 1), inner.x, y, { size: Math.min(58 * U, lay.rowH * .55), font: F.latin, align: 'left', color: C.a1, alpha: r });
        let tx = inner.x + 90 * U;
        if (o.icons) { icon(ctx, o.icons[i], tx + 36 * U, y, Math.min(64 * U, lay.rowH * .7) * r, {}); tx += 90 * U; }
        text(ctx, s, tx + (1 - r) * 40 * U, y, { size: lay.rows[i], font: F.head, align: 'left', color: C.panelFg || C.fg, alpha: r });
      });
      ctx.restore();
    },
    cues(k, t0) { k.swish(t0 + BT * .25 - .05, .25, .5); o.items.forEach((s, i) => { const tt = t0 + BT * (.75 + i * per); k.tick(tt, 1); k.note(tt, i); }); },
    imp: d => o.items.map((_, i) => [BT * (.75 + i * per), .3]),
  };
};

/* ---------- 对比：两半屏，左边先出，右边砸下 ---------- */
T.compare = (o) => {
  let lay;
  const layout = ctx => {
    const halfW = WIDE ? W / 2 : W, halfH = WIDE ? H : H / 2;
    // 每半边可用的竖向带：横屏是版心高度；上下排时上半让开 HUD，下半让开底边
    const bands = WIDE ? [[L.top, L.bot], [L.top, L.bot]] : [[L.top, H / 2 - 40 * U], [H / 2 + 40 * U, L.bot + 60 * U]];
    const side = (s, [b0, b1]) => {
      const lab = fitText(ctx, s.label, halfW - 2 * L.m, 64 * U, F.head), role = /^[\x00-\x7f]+$/.test(s.value) ? F.latin : F.head;
      const note = s.note ? fitBlock(ctx, s.note, halfW - 2 * L.m, 120 * U, 36 * U, F.body, { maxLines: 2 }) : null, noteH = note ? note.lines.length * note.lh : 0;
      const val = Math.min(fitText(ctx, s.value, halfW - 2 * L.m - (WIDE && o.mid !== false ? 120 * U : 0), (WIDE ? 230 : 200) * U, role), (b1 - b0 - lab - noteH - 50 * U) / 1.1);
      const span = lab + 18 * U + val * 1.1 + (note ? 18 * U + noteH : 0), top = b0 + (b1 - b0 - span) / 2;
      return { lab, val, role, note, labY: top + lab / 2, valY: top + lab + 18 * U + val * .55, noteY: top + lab + 36 * U + val * 1.1 + (note ? note.lh / 2 : 0) };
    };
    return { halfW, halfH, a: side(o.left, bands[0]), b: side(o.right, bands[1]) };
  };
  const drawSide = (ctx, s, S, x0, y0, u, t0, tn, isHit) => {
    const fg = onTone(tn), cx = x0 + L.m;
    const al = eOut(P(u, t0, t0 + .2));
    text(ctx, s.label, cx, S.labY, { size: S.lab, font: F.head, align: 'left', color: fg, alpha: al });
    if (isHit) STYLE.hit(ctx, s.value, cx, S.valY, u, t0, { size: S.val, font: S.role, color: accentOn(tn) });
    else text(ctx, s.value, cx, S.valY, { size: S.val, font: S.role, align: 'left', color: fg, alpha: al, scale: lerp(1.2, 1, al) });
    if (S.note) S.note.lines.forEach((ln, i) => text(ctx, ln, cx, S.noteY + i * S.note.lh, { size: S.note.size, font: F.body, align: 'left', color: fg, alpha: P(u, t0 + .2, t0 + .4) * .85 }));
  };
  return {
    kind: 'content', bg: { tone: o.left.tone || 'alt' }, date: o.date,
    fn(ctx, u, d, t) {
      lay = lay || layout(ctx);
      const ta = o.left.tone || 'alt', tb = o.right.tone || 'a2';
      STYLE.bg(ctx, u, d, t, { tone: ta, deco: 0 });
      const kb = eOut(P(u, BT - .12, BT));
      ctx.save(); ctx.beginPath(); if (WIDE) ctx.rect(W - lay.halfW * kb, -100, lay.halfW + 100, H + 200); else ctx.rect(-100, H - lay.halfH * kb, W + 200, lay.halfH + 100); ctx.clip();
      STYLE.bg(ctx, u, d, t, { tone: tb, deco: 2 }); ctx.restore();
      drawSide(ctx, o.left, lay.a, 0, 0, u, 0, ta, false);
      if (u > BT - .12) drawSide(ctx, o.right, lay.b, WIDE ? lay.halfW : 0, WIDE ? 0 : lay.halfH, u, BT, tb, true);
      if (o.mid !== false && u > 2 * BT) {
        const s = (TALL ? 110 : 120) * U;
        STYLE.seal(ctx, o.mid || 'VS', W / 2, WIDE ? H / 2 : H / 2, P(u, 2 * BT, 2 * BT + .11), { size: s, round: true, rot: -.12, mul: false, color: C.a3 === tone(tb) ? C.a1 : C.a3 });
      }
      if (o.caption) STYLE.caption(ctx, u, o.captionAt ?? Math.max(BT * 3, d - BAR), d, o.caption);
    },
    cues(k, t0) { k.pop(t0, .8); k.swish(t0 + BT - .15, .2, .6); k.hit(t0 + BT, 1.1); if (o.mid !== false) k.seal(t0 + 2 * BT, .7); },
    imp: d => [[BT, 1.2], [2 * BT, .8]],
  };
};

/* ---------- 流程：方块一拍一个，箭头连起来 ---------- */
T.steps = (o) => {
  let lay;
  const n = o.steps.length;
  const layout = ctx => {
    const tsz = o.title ? fitText(ctx, o.title, L.cw, (TALL ? 80 : 84) * U, F.head) : 0;
    const top = L.top + (o.title ? tsz * 1.5 : 0) + (o.meta ? 40 * U : 0), area = { x: L.left, y: top, w: L.cw, h: L.bot - top };
    const boxes = [];
    if (WIDE || (!TALL && n <= 3)) {
      const gap = 60 * U, bw = Math.min((area.w - gap * (n - 1)) / n, 380 * U), bh = Math.min(area.h * .8, bw * 1.15), x0 = area.x + (area.w - (bw * n + gap * (n - 1))) / 2, y0 = area.y + (area.h - bh) / 2;
      for (let i = 0; i < n; i++) boxes.push({ x: x0 + i * (bw + gap), y: y0, w: bw, h: bh });
    } else {
      const gap = 50 * U, bh = Math.min((area.h - gap * (n - 1)) / n, 240 * U), bw = area.w, y0 = area.y + (area.h - (bh * n + gap * (n - 1))) / 2;
      for (let i = 0; i < n; i++) boxes.push({ x: area.x, y: y0 + i * (bh + gap), w: bw, h: bh });
    }
    const horiz = WIDE || (!TALL && n <= 3);
    const labs = o.steps.map(s => fitBlock(ctx, s.label, (horiz ? boxes[0].w : boxes[0].w - 240 * U) - 50 * U, (horiz ? boxes[0].h * .38 : boxes[0].h * .6), 50 * U, F.head, { maxLines: 2 }));
    return { tsz, top, boxes, horiz, labs };
  };
  return {
    kind: 'content', bg: { tone: o.tone || 'base', deco: o.deco ?? 0 }, date: o.date,
    fn(ctx, u, d, t) {
      lay = lay || layout(ctx);
      const fg = onTone(this.bg.tone);
      STYLE.bg(ctx, u, d, t, this.bg);
      if (o.meta) text(ctx, o.meta, L.left, L.top + 10 * U, { size: 30 * U, font: F.mono, align: 'left', color: C.a2, meta: true });
      if (o.title) stagger(ctx, o.title, L.left, L.top + (o.meta ? 40 * U : 0) + lay.tsz * .6, u, 0, { size: lay.tsz, color: fg });
      lay.boxes.forEach((b, i) => {
        const t0 = BT * (.5 + i), k = eBack(P(u, t0, t0 + .25));
        if (i > 0) {
          const a = lay.boxes[i - 1], ka = P(u, t0 - BT * .45, t0 - .02);
          if (lay.horiz) STYLE.link(ctx, a.x + a.w + 8 * U, a.y + a.h / 2, b.x - 8 * U, b.y + b.h / 2, ka);
          else STYLE.link(ctx, a.x + 110 * U, a.y + a.h + 6 * U, b.x + 110 * U, b.y - 6 * U, ka);
        }
        if (k <= 0) return;
        ctx.save(); ctx.translate(b.x + b.w / 2, b.y + b.h / 2); ctx.scale(k, k); ctx.translate(-(b.x + b.w / 2), -(b.y + b.h / 2));
        const hi = i === lay.boxes.length - 1 && o.lastHi !== false, pfg = hi ? (C.onA3 || C.fg) : (C.panelFg || C.fg);
        const inner = STYLE.panel(ctx, b.x, b.y, b.w, b.h, { r: 18 * U, fill: hi ? C.a3 : C.white, step: i });
        const s = o.steps[i], lab = lay.labs[i];
        if (lay.horiz) {
          text(ctx, pad2(i + 1), b.x + 30 * U, b.y + 44 * U, { size: 40 * U, font: F.latin, align: 'left', color: C.a1 });
          if (s.icon) icon(ctx, s.icon, b.x + b.w / 2, b.y + b.h * .38, Math.min(b.w, b.h) * .34, hi ? { fill: C.white } : {});
          lab.lines.forEach((ln, j) => text(ctx, ln, b.x + b.w / 2, b.y + b.h * .72 + (j - (lab.lines.length - 1) / 2) * lab.lh, { size: lab.size, font: F.head, color: pfg }));
        } else {
          text(ctx, pad2(i + 1), b.x + 36 * U, b.y + b.h / 2, { size: 56 * U, font: F.latin, align: 'left', color: C.a1 });
          if (s.icon) icon(ctx, s.icon, b.x + 170 * U, b.y + b.h / 2, Math.min(110 * U, b.h * .6), {});
          lab.lines.forEach((ln, j) => text(ctx, ln, b.x + 240 * U, b.y + b.h / 2 + (j - (lab.lines.length - 1) / 2) * lab.lh, { size: lab.size, font: F.head, align: 'left', color: pfg }));
        }
        ctx.restore();
      });
      if (o.caption) STYLE.caption(ctx, u, o.captionAt ?? BT * (n + .5), d, o.caption);
    },
    cues(k, t0) { o.steps.forEach((_, i) => { const tt = t0 + BT * (.5 + i); if (i) k.swish(tt - BT * .45, BT * .4, .45); k.pop(tt, 1); k.note(tt, i * 2); }); k.ding(t0 + BT * (n - .5) + .1, 1318.5, .8); },
    imp: d => o.steps.map((_, i) => [BT * (.5 + i), i === n - 1 ? .8 : .35]),
  };
};

/* ---------- 时间线：线画过去，一拍点亮一个节点 ---------- */
T.timeline = (o) => {
  let lay;
  const n = o.events.length;
  const layout = ctx => {
    const tsz = o.title ? fitText(ctx, o.title, L.cw, (TALL ? 80 : 84) * U, F.head) : 0;
    const top = L.top + (o.title ? tsz * 1.5 : 0);
    const horiz = WIDE;
    const tw_ = horiz ? L.cw / n * .94 : L.cw - 180 * U, inset = horiz ? tw_ / 2 : 0;
    const pts = o.events.map((_, i) => horiz ? [L.left + inset + i * (L.cw - 2 * inset) / Math.max(1, n - 1), top + (L.bot - top) * .5] : [L.left + 60 * U, top + 60 * U + i * (L.bot - top - 120 * U) / Math.max(1, n - 1)]);
    const txt = o.events.map(e => fitBlock(ctx, e[1], tw_, horiz ? 200 * U : 150 * U, (horiz ? 58 : 72) * U, F.head, { maxLines: 3 }));
    return { tsz, top, horiz, pts, txt };
  };
  return {
    kind: 'content', bg: { tone: o.tone || 'base', deco: o.deco ?? 1 }, date: o.date,
    fn(ctx, u, d, t) {
      lay = lay || layout(ctx);
      const fg = onTone(this.bg.tone);
      STYLE.bg(ctx, u, d, t, this.bg);
      if (o.title) stagger(ctx, o.title, L.left, L.top + lay.tsz * .6, u, 0, { size: lay.tsz, color: fg });
      const p0 = lay.pts[0], p1 = lay.pts[n - 1], kl = eIO(P(u, BT * .25, BT * (n - .5)));
      STYLE.link(ctx, p0[0], p0[1], p1[0], p1[1], kl, { head: false });
      o.events.forEach(([dt, s], i) => {
        const k = eBack(P(u, BT * (.5 + i), BT * (.5 + i) + .25));
        if (k <= 0) return;
        const [x, y] = lay.pts[i], up = lay.horiz && i % 2 === 0;
        circ(ctx, x, y, 22 * U * k, i === n - 1 ? C.a1 : C.a2, C.line, 6);
        const tb = lay.txt[i], al = clamp(k);
        if (lay.horiz) {
          const ty = up ? y - 80 * U : y + 80 * U;
          text(ctx, dt, x, ty, { size: 36 * U, font: F.mono, color: C.a2 === tone(this.bg.tone) ? fg : C.a2, alpha: al, meta: true });
          tb.lines.forEach((ln, j) => text(ctx, ln, x, up ? ty - 70 * U - (tb.lines.length - 1 - j) * tb.lh : ty + 70 * U + j * tb.lh, { size: tb.size, font: F.head, color: fg, alpha: al }));
        } else {
          text(ctx, dt, x + 60 * U, y - 28 * U, { size: 28 * U, font: F.mono, align: 'left', color: C.a2, alpha: al, meta: true });
          tb.lines.forEach((ln, j) => text(ctx, ln, x + 60 * U, y + 22 * U + j * tb.lh, { size: tb.size, font: F.head, align: 'left', color: fg, alpha: al }));
        }
      });
      if (o.caption) STYLE.caption(ctx, u, o.captionAt ?? BT * (n + .5), d, o.caption);
    },
    cues(k, t0) { k.swish(t0 + BT * .25, BT * (n - .75), .35); o.events.forEach((_, i) => { k.pop(t0 + BT * (.5 + i), .8); k.note(t0 + BT * (.5 + i), i); }); },
    imp: d => o.events.map((_, i) => [BT * (.5 + i), .35]),
  };
};

/* ---------- 对话：人物 + 气泡，一拍一句 ---------- */
T.talk = (o) => {
  let lay;
  const layout = ctx => {
    const bw = WIDE ? L.cw * .6 : L.cw;
    const lines = o.lines.map((s, i) => fitText(ctx, s, bw - 120 * U, (i === 0 ? 120 : 80) * U, F.head));
    const bh = lines.reduce((a, s) => a + s * 1.4, 0) + 110 * U;
    const bx = WIDE ? L.right - bw / 2 : W / 2, by = WIDE ? L.cy : L.top + bh / 2 + 20 * U;
    const fig = WIDE ? { x: L.left + L.cw * .15, y: L.bot + 60 * U, s: (L.ch + 60 * U) / 580 } : { x: W / 2 - 40 * U, y: L.bot + 60 * U, s: Math.min(1.6, (L.bot + 60 * U - (by + bh / 2) - 60 * U) / 580) };
    return { bw, bx, by, bh, lines, fig };
  };
  return {
    kind: 'content', bg: { tone: o.tone || 'base', deco: o.deco ?? 1 }, date: o.date,
    fn(ctx, u, d, t) {
      lay = lay || layout(ctx);
      STYLE.bg(ctx, u, d, t, this.bg);
      const ci = eBack(P(u, 0, .35)), f = lay.fig;
      person(ctx, f.x, lerp(H + 600 * f.s, f.y, ci), f.s, { sign: o.sign, wave: !o.sign, t, coat: o.coat, head: { t, hair: o.hair || 'bob', glasses: o.glasses, mouth: (u % (BT * 2)) < BT ? (o.mouth || 'smile') : 'grin', ...(o.head || {}) } });
      const b = eBack(P(u, .15, .4)); if (b <= 0) return;
      ctx.save(); ctx.translate(lay.bx, lay.by); ctx.scale(b, b);
      const mouthY = f.y - 470 * f.s + 60 * f.s * .62, tipX = WIDE ? f.x + 130 * f.s - lay.bx : f.x + 40 * U - lay.bx, tipY = WIDE ? mouthY - lay.by : lay.bh / 2 + 90 * U;
      bubble(ctx, 0, 0, lay.bw, lay.bh, tipX, tipY);
      let y = -lay.bh / 2 + 55 * U;
      o.lines.forEach((s, i) => { const sz = lay.lines[i]; y += sz * .7; const t0 = i === 0 ? .3 : BT * i; if (u > t0) text(ctx, s, 0, y, { size: sz, font: F.head, color: i === 0 ? C.panelFg || C.fg : (o.accent === i ? C.a1 : C.panelFg || C.fg), alpha: P(u, t0, t0 + .15) }); y += sz * .7; });
      ctx.restore();
      if (o.caption) STYLE.caption(ctx, u, o.captionAt ?? Math.max(BT * 3, d - BAR), d, o.caption);
    },
    cues(k, t0) { k.pop(t0 + .15, 1); o.lines.forEach((s, i) => typeCues(k, t0 + (i === 0 ? .3 : BT * i), s, .03, .5)); },
    imp: d => [[.15, .4]],
  };
};

/* ---------- 结论：深色底，音乐骤停，盖章 ---------- */
T.verdict = (o) => ({
  kind: 'verdict', hud: false, flash: true, bg: { tone: 'dark' },
  fn(ctx, u, d, t) {
    STYLE.bg(ctx, u, d, t, this.bg);
    if (o.lead && typeof o.lead === 'object') tri(ctx, o.lead, W / 2, L.top - 20 * U, u, 0, { size: 96 * U, maxW: L.cw, role: F.head, cjk: .62, align: 'center', color: C.onDark, gap: 12 * U });
    else if (o.lead) { const s = fitText(ctx, o.lead, L.cw, 130 * U, F.head); text(ctx, o.lead, W / 2, L.top + (TALL ? 120 : 100) * U, { size: s, font: F.head, color: C.onDark, alpha: P(u, 0, .12) }); }
    const sz = Math.min(320 * U, (L.cw * .92) / (chars(o.seal) + .9));
    STYLE.seal(ctx, o.seal, W / 2, H / 2 + (TALL ? 0 : 70 * U), P(u, 2 * BT, 2 * BT + .11), { size: sz, rot: -.07, mul: false, dark: true });
    if (o.tail && u > 4 * BT) {
      text(ctx, o.tail, L.right, L.bot + (TALL ? 60 : 20) * U, { size: 84 * U, font: F.head, align: 'right', color: C.onDark, scale: slamS(u, 4 * BT, 1.3, .08) });
      if (o.tailSub) text(ctx, o.tailSub, L.right, L.bot + (TALL ? 130 : 90) * U, { size: 26 * U, font: F.mono, align: 'right', color: C.muted, meta: true });
    }
  },
  cues(k, t0) { k.seal(t0 + 2 * BT, 1.5); if (o.tail) k.ding(t0 + 4 * BT, 880, .9); },
  imp: d => [[2 * BT, 2.2], [4 * BT, .6]],
});

/* ---------- 尾声：一句话 + 清单卡 + 出处，可选结尾弹窗 ---------- */
T.outro = (o) => {
  let lay;
  const tPop = o.popAt ?? 5 * BT;
  const layout = ctx => {
    const a = fitText(ctx, o.lines[0], (WIDE ? L.cw * .6 : L.cw) - 80 * U, 72 * U, F.head);
    const b = o.lines[1] ? fitText(ctx, o.lines[1], (WIDE ? L.cw * .6 : L.cw) - 80 * U, 52 * U, F.head) : 0;
    return { a, b };
  };
  return {
    kind: 'outro', hud: false, bg: { tone: o.tone || 'base', deco: o.deco ?? 1 }, glitch: o.popup && o.glitch !== false ? [tPop] : null,
    fn(ctx, u, d, t) {
      lay = lay || layout(ctx);
      STYLE.bg(ctx, u, d, t, this.bg);
      const figW = WIDE ? L.cw * .3 : L.cw * .4;
      // 人物
      const ci = eBack(P(u, 0, .35)), fs = WIDE ? (L.ch + 60 * U) / 600 : Math.min(1.1, L.ch * .5 / 600);
      if (o.figure === false && WIDE) drawArt(ctx, o.art, { x: L.left, y: L.top, w: figW - 30 * U, h: L.ch }, u, t, 5);
      if (o.figure !== false && (WIDE || !o.items)) person(ctx, L.left + figW * .45, lerp(H + 600, WIDE ? L.bot + 80 * U : L.bot + 60 * U, ci), fs, { sign: o.sign, wave: !o.sign, t, head: { t, hair: 'bob', mouth: u > 2 * BT ? 'grin' : 'smile', ...(o.head || {}) } });
      // 气泡
      const bw = WIDE ? L.cw * .66 : L.cw, bh = lay.a * 1.4 + (lay.b ? lay.b * 1.5 : 0) + 70 * U, bx = WIDE ? L.right - bw / 2 : W / 2, by = WIDE ? L.top + bh / 2 + 20 * U : L.top + bh / 2;
      const b = eBack(P(u, .15, .4));
      if (b > 0) {
        ctx.save(); ctx.translate(bx, by); ctx.scale(b, b);
        bubble(ctx, 0, 0, bw, bh, WIDE ? -bw / 2 - 40 * U : -bw / 2 + 120 * U, bh / 2 + (WIDE ? 120 : 90) * U);
        text(ctx, o.lines[0], 0, lay.b ? -lay.b * .7 : 0, { size: lay.a, font: F.head, color: C.panelFg || C.fg });
        if (lay.b && u > BT) text(ctx, o.lines[1], 0, lay.a * .72, { size: lay.b, font: F.head, color: C.a1, alpha: P(u, BT, BT + .15) });
        ctx.restore();
      }
      // 清单卡
      if (o.items && u > 2 * BT) {
        const k = eBack(P(u, 2 * BT, 2 * BT + .22));
        const cw = WIDE ? L.cw * .58 : L.cw, cx = WIDE ? L.right - cw : L.left, cy = by + bh / 2 + (WIDE && o.figure !== false ? 150 : 60) * U, ch = Math.min(L.bot - cy + (CFG.subs && CFG.subs.length ? 0 : 40 * U), (110 + o.items.length * 80) * U);
        ctx.save(); ctx.translate(lerp(W + 100, 0, clamp(k)), 0);
        const inner = STYLE.panel(ctx, cx, cy, cw, ch, { head: o.itemsHead || 'NOTE' });
        const rh = inner.h / o.items.length;
        o.items.forEach((s, i) => {
          const r = eOut(P(u, 2.5 * BT + i * BT / 2, 2.5 * BT + i * BT / 2 + .16)); if (r <= 0) return;
          const y = inner.y + rh * (i + .5), sz = fitText(ctx, s, inner.w - 100 * U, Math.min(46 * U, rh * .6), F.head);
          text(ctx, pad2(i + 1), inner.x, y, { size: Math.min(50 * U, rh * .62), font: F.latin, align: 'left', color: C.a1, alpha: r });
          text(ctx, s, inner.x + 90 * U + (1 - r) * 40 * U, y, { size: sz, font: F.head, align: 'left', color: C.panelFg || C.fg, alpha: r });
        });
        ctx.restore();
      }
      // 结尾弹窗
      if (o.popup && u > tPop) {
        ctx.fillStyle = C.scrim || 'rgba(20,18,23,.5)'; ctx.globalAlpha = P(u, tPop, tPop + .1); ctx.fillRect(-80, -80, W + 160, H + 160); ctx.globalAlpha = 1;
        const s = eBack(P(u, tPop, tPop + .22)), pw = Math.min(1000 * U, L.cw), ph = 360 * U;
        if (s > .9) qaCover(W / 2 - pw / 2, H / 2 - ph / 2, W / 2 + pw / 2, H / 2 + ph / 2);
        ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(s, s);
        STYLE.popup(ctx, -pw / 2, -ph / 2, pw, ph, o.popup);
        ctx.restore();
      }
      if (o.source && u > 1.2) text(ctx, o.source, W - L.m * .55, H - 40 * U, { size: 22 * U, weight: 500, font: F.body, align: 'right', color: o.popup && u > tPop ? C.onDark : C.muted, alpha: P(u, 1.2, 1.4), meta: true });
    },
    cues(k, t0) { k.pop(t0 + .15, 1); if (o.items) { k.swish(t0 + 2 * BT - .1, .3, .7); o.items.forEach((_, i) => { k.tick(t0 + 2.5 * BT + i * BT / 2, 1); k.type(t0 + 2.5 * BT + i * BT / 2 + .03, .8); }); } if (o.popup) { k.ding(t0 + tPop, 1318.5, .9); k.pop(t0 + tPop, .8); } },
    imp: d => o.popup ? [[tPop, 1]] : [],
  };
};

/* ---------- 雕像：抠好的雕像立在一个大词前面，三语文字在另一侧 ---------- */
// o: { img, crop, big（雕像后面的大词）, title: {en,ja,zh}, body: {en,ja,zh}, credit, side: 'right'|'left', scale }
T.statue = (o) => {
  let lay;
  const side = o.side || 'right';
  const layout = ctx => {
    const colW = WIDE ? W * .42 : L.cw, cx = WIDE ? (side === 'right' ? W * .72 : W * .28) : W / 2;
    const sh = WIDE ? H * (o.scale ?? .9) : H * (o.scale ?? .5), by = WIDE ? H - 26 * U : H - 40 * U;
    const bigSz = o.big ? fitText(ctx, o.big, WIDE ? W * .44 : W * .92, (o.bigSize || 480) * U, F.latin) : 0;
    const bigY = WIDE ? H * .5 : by - sh * .62;
    const region = WIDE ? { y: L.top - 40 * U, h: L.ch + 80 * U } : { y: L.top - 20 * U, h: Math.max(200 * U, by - sh - L.top) };
    let T1, T2, th, bh, items;
    // 整组放不下就一起缩
    for (let f = 1; ; f *= .92) {
      T1 = { size: (o.titleSize || 84) * U * f, maxW: colW, role: F.head, cjk: .74, wrap: true, maxLines: 2 }; T2 = { size: 46 * U * Math.max(f, .8), maxW: colW, role: F.body, cjk: .82, wrap: true, maxLines: 2, gap: 18 * U };
      th = o.title ? triH(ctx, o.title, T1) : 0; bh = o.body ? triH(ctx, o.body, T2) : 0;
      items = [{ h: th }, { h: o.body ? 6 * U : 0, gap: 34 * U }, { h: bh, gap: 34 * U }, { h: o.credit ? 26 * U : 0, gap: 40 * U }];
      if (stackH(items) <= region.h || f < .5) break;
    }
    const ys = stackY(region, items);
    const tx = WIDE ? (side === 'right' ? L.left : W - L.m - colW) : L.left;
    return { colW, cx, sh, by, bigSz, bigY, T1, T2, tx, ys, th, bh };
  };
  return {
    kind: o.kind || 'content', hud: o.hud, bg: { tone: o.tone || 'base', deco: o.deco ?? 0 },
    fn(ctx, u, d, t) {
      lay = lay || layout(ctx);
      const fg = onTone(this.bg.tone);
      STYLE.bg(ctx, u, d, t, this.bg);
      if (o.big) STYLE.hit(ctx, o.big, lay.cx, lay.bigY, u, BT, { size: lay.bigSz, font: F.latin, align: 'center', color: accentOn(this.bg.tone, o.bigColor || C.a1), g: 'big', over: true });
      const k = eOut(P(u, 0, .7 * PACE.enter)), push = 1 + .05 * (u / d);
      ctx.save(); ctx.globalAlpha = k; cutImg(ctx, IMG(o.img), lay.cx, lay.by + (1 - k) * 60 * U, lay.sh * push, { crop: o.crop }); ctx.restore();
      const x = lay.tx;
      if (o.title) tri(ctx, o.title, x, lay.ys[0] - lay.th / 2, u, 1.5 * BT, { ...lay.T1, color: fg });
      if (o.body) { ctx.fillStyle = C.a1; ctx.fillRect(x, lay.ys[1] - 3 * U, 140 * U * eOut(P(u, 2.2 * BT, 2.2 * BT + .4)), 3 * U); tri(ctx, o.body, x, lay.ys[2] - lay.bh / 2, u, 2.5 * BT, { ...lay.T2, color: fg }); }
      if (o.credit && u > 3.2 * BT) text(ctx, o.credit, x, lay.ys[3], { size: 22 * U, font: F.mono, align: 'left', color: C.muted, alpha: P(u, 3.2 * BT, 3.2 * BT + .3), meta: true });
    },
    cues(k, t0) { k.pop(t0 + .1, .6); k.hit(t0 + BT, 1); k.tick(t0 + 1.5 * BT, .8); k.note(t0 + 1.5 * BT, 4); k.tick(t0 + 2.5 * BT, .7); k.note(t0 + 2.5 * BT, 2); },
    imp: d => [[BT, 1], [1.5 * BT, .3]],
  };
};

/* ---------- 名画：整屏铺满，镜头沿路径推移，三语文字压在一侧的暗角上 ---------- */
// o: { img, cam: [[进度, x, y, z], ...], side: 'left'|'right', head: {en,ja,zh}, body: {en,ja,zh}, credit }
T.plate = (o) => {
  let lay;
  const side = o.side || 'left';
  const layout = ctx => {
    const colW = WIDE ? W * .38 : L.cw;
    const H1 = { size: 150 * U, maxW: colW, role: F.latin, cjk: .5 }, H2 = { size: 44 * U, maxW: colW, role: F.body, cjk: .82, wrap: true, maxLines: 3, gap: 18 * U };
    const hh = o.head ? triH(ctx, o.head, H1) : 0, bh = o.body ? triH(ctx, o.body, H2) : 0;
    const items = [{ h: hh }, { h: bh, gap: 44 * U }];
    const region = WIDE ? { y: L.top, h: L.ch } : { y: H * .56, h: L.bot - H * .56 };
    const ys = stackY(region, items);
    const tx = WIDE ? (side === 'left' ? L.left : W - L.m - colW) : L.left;
    return { colW, H1, H2, hh, bh, ys, tx };
  };
  return {
    kind: o.kind || 'content', hud: o.hud, bg: { tone: 'dark' },
    fn(ctx, u, d, t) {
      lay = lay || layout(ctx);
      field(ctx, C.dark);
      cover(ctx, IMG(o.img), { x: -10, y: -10, w: W + 20, h: H + 20 }, camAt(u / d, o.cam || [[0, .5, .5, 1.05], [1, .5, .5, 1.18]]));
      // 暗角：文字那一侧压暗
      const g = WIDE ? ctx.createLinearGradient(side === 'left' ? 0 : W, 0, side === 'left' ? W * .66 : W * .34, 0) : ctx.createLinearGradient(0, H, 0, H * .38);
      g.addColorStop(0, tint(C.dark, 1, .9)); g.addColorStop(.55, tint(C.dark, 1, .55)); g.addColorStop(1, tint(C.dark, 1, 0));
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      const x = lay.tx, fg = C.onDark;
      if (o.head) {
        const ls = triLines(ctx, o.head, lay.H1);
        STYLE.hit(ctx, ls[0].s, x, lay.ys[0] - lay.hh / 2 + ls[0].sz / 2, u, BT, { size: ls[0].sz, font: ls[0].role, color: accentOn('dark', o.headColor || C.a1), g: 'head' });
        const rest = Object.fromEntries(Object.entries(o.head).filter(([l]) => l !== LANG));
        tri(ctx, rest, x, lay.ys[0] - lay.hh / 2 + ls[0].sz + (lay.H1.gap ?? ls[0].sz * .34), u, 1.4 * BT, { ...lay.H1, size: ls[0].sz * (lay.H1.cjk || .5), cjk: 1, color: fg });
      }
      if (o.body) tri(ctx, o.body, x, lay.ys[1] - lay.bh / 2, u, 2.2 * BT, { ...lay.H2, color: fg });
      if (o.credit && u > 3 * BT) {
        const cx = WIDE ? (side === 'left' ? W - L.m * .55 : L.m * .55) : L.left, al = WIDE && side === 'left' ? 'right' : 'left';
        text(ctx, o.credit, cx, H - 44 * U, { size: 22 * U, font: F.mono, align: al, color: C.onDark, alpha: .8 * P(u, 3 * BT, 3 * BT + .3), meta: true, shadow: 'rgba(0,0,0,.6)', sdx: 0, sdy: 2 });
      }
    },
    cues(k, t0, d) { k.swish(t0 + .05, .6, .35); k.hit(t0 + BT, .9); k.tick(t0 + 1.4 * BT, .6); k.note(t0 + 2.2 * BT, 3); },
    imp: d => [[BT, .8]],
  };
};

/* ---------- 快切：一拍一张图，大字压在画面上 ---------- */
// o: { items: [{ img, cam, cut（抠图就写 true）, head: {en,ja,zh}, credit }], per（每张几拍）, center, kind }
T.montage = (o) => {
  const per = (o.per || 1) * BT, n = o.items.length;
  return {
    kind: o.kind || 'content', hud: false, bg: { tone: 'dark' },
    fn(ctx, u, d, t) {
      const i = Math.min(n - 1, Math.floor(u / per)), it = o.items[i], ui = u - i * per, p = clamp(ui / per);
      field(ctx, C.dark);
      if (it.cut) { STYLE.bg(ctx, u, d, t, { tone: it.tone || 'base', deco: i }); cutImg(ctx, IMG(it.img), W / 2 + (it.dx || 0) * W, H - 30 * U, H * (it.scale || .86) * (1 + p * .04), { crop: it.crop }); }
      else cover(ctx, IMG(it.img), { x: -10, y: -10, w: W + 20, h: H + 20 }, camAt(p, it.cam || [[0, .5, .5, 1.08], [1, .5, .5, 1.2]]));
      if (o.center) { ctx.fillStyle = tint(C.dark, 1, .45); ctx.fillRect(0, 0, W, H); }
      else { const g = ctx.createLinearGradient(0, H, 0, H * .35); g.addColorStop(0, tint(C.dark, 1, .88)); g.addColorStop(1, tint(C.dark, 1, 0)); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); }
      if (it.head) {
        const big = o.center ? 360 * U : 150 * U, opt = { size: big, maxW: o.center ? W * .8 : W * .7, role: F.latin, cjk: o.center ? .26 : .42, align: o.center ? 'center' : 'left', gap: big * .12 };
        const h = triH(ctx, it.head, opt), x = o.center ? W / 2 : L.left, y0 = o.center ? H / 2 - h / 2 : L.bot + 40 * U - h;
        const ls = triLines(ctx, it.head, opt), sc = slamS(ui, 0, 1.12, .12);
        ctx.save(); ctx.translate(x, y0 + ls[0].sz / 2); ctx.scale(sc, sc); text(ctx, ls[0].s, 0, 0, { size: ls[0].sz, font: ls[0].role, align: opt.align, color: C.onDark, g: 'mh' + i }); ctx.restore();
        const rest = Object.fromEntries(Object.entries(it.head).filter(([l]) => l !== LANG));
        tri(ctx, rest, x, y0 + ls[0].sz + opt.gap, ui, .08, { ...opt, size: ls[0].sz * opt.cjk, cjk: 1, color: C.onDark, step: .06 });
      }
      if (it.credit) text(ctx, it.credit, W - L.m * .55, H - 40 * U, { size: 20 * U, font: F.mono, align: 'right', color: C.onDark, alpha: .75, meta: true });
    },
    cues(k, t0) { o.items.forEach((_, i) => { k.pop(t0 + i * per, .7); k.note(t0 + i * per, i * 2); }); },
    imp: d => o.items.map((_, i) => [i * per, .5]),
  };
};

/* ---------- 作品与出处：缩略图一排 + 出处清单 ---------- */
// o: { title: {en,ja,zh}, items: [{ img, credit }], note: {en,ja,zh} }
T.credits = (o) => {
  let lay;
  const n = o.items.length;
  const layout = ctx => {
    const th = triH(ctx, o.title, { size: 64 * U, maxW: L.cw, role: F.head, cjk: .7 });
    const cols = WIDE ? Math.min(n, 10) : Math.min(n, 5), tw_ = (L.cw - (cols - 1) * 16 * U) / cols, thH = Math.min(tw_ * 1.25, (WIDE ? 230 : 260) * U);
    const rows = Math.ceil(n / cols), lines = o.items.map((it, i) => `${pad2(i + 1)}  ${it.credit}`), lh = 30 * U;
    const longest = Math.max(...lines.map(s => tw(ctx, s, 21 * U, F.mono))), listCols = WIDE && longest < (L.cw - 40 * U) / 2 ? 2 : 1;
    return { th, cols, tw_, thH, rows, listCols, lines, lh };
  };
  return {
    kind: 'outro', hud: false, bg: { tone: o.tone || 'base', deco: 1 },
    fn(ctx, u, d, t) {
      lay = lay || layout(ctx);
      STYLE.bg(ctx, u, d, t, this.bg);
      const fg = onTone(this.bg.tone);
      tri(ctx, o.title, W / 2, L.top - 30 * U, u, 0, { size: 64 * U, maxW: L.cw, role: F.head, cjk: .7, align: 'center', color: fg });
      const y0 = L.top - 30 * U + lay.th + 40 * U;
      o.items.forEach((it, i) => {
        const r = Math.floor(i / lay.cols), c = i % lay.cols, x = L.left + c * (lay.tw_ + 16 * U), y = y0 + r * (lay.thH + 16 * U), k = eBack(P(u, .3 + i * BT * .25, .3 + i * BT * .25 + .3));
        if (k <= 0) return;
        ctx.save(); ctx.translate(x + lay.tw_ / 2, y + lay.thH / 2); ctx.scale(k, k); ctx.translate(-(x + lay.tw_ / 2), -(y + lay.thH / 2));
        ctx.fillStyle = C.dark; ctx.fillRect(x, y, lay.tw_, lay.thH);
        ctx.save(); ctx.beginPath(); ctx.rect(x, y, lay.tw_, lay.thH); ctx.clip();
        const im = IMG(it.img); if (im) { if (it.cut) { STYLE.bg(ctx, 0, 1, 0, { tone: 'alt', plain: true }); cutImg(ctx, im, x + lay.tw_ / 2, y + lay.thH - 6 * U, lay.thH * .9, { shadow: false }); } else cover(ctx, im, { x, y, w: lay.tw_, h: lay.thH }, it.cam || {}); }
        ctx.restore(); ctx.lineWidth = 2 * U; ctx.strokeStyle = C.line; ctx.strokeRect(x, y, lay.tw_, lay.thH); ctx.restore();
      });
      const ly = y0 + lay.rows * (lay.thH + 16 * U) + 30 * U, per = Math.ceil(n / lay.listCols), colW = (L.cw - 40 * U) / lay.listCols;
      lay.lines.forEach((s, i) => {
        const c = Math.floor(i / per), r = i % per, a = P(u, BT * 2 + i * .08, BT * 2 + i * .08 + .3); if (a <= 0) return;
        const sz = fitText(ctx, s, colW - 10 * U, 21 * U, F.mono, undefined, 14 * U);
        text(ctx, s, L.left + c * (colW + 40 * U), ly + r * lay.lh, { size: sz, font: F.mono, align: 'left', color: fg, alpha: a, meta: true });
      });
      if (o.note) tri(ctx, o.note, W / 2, Math.min(H - 150 * U, ly + per * lay.lh + 20 * U), u, BT * 3, { size: 26 * U, maxW: L.cw, role: F.body, cjk: .92, align: 'center', color: C.muted, gap: 6 * U });
    },
    cues(k, t0) { o.items.forEach((_, i) => k.pop(t0 + .3 + i * BT * .25, .5)); k.ding(t0 + BT * 2, 2349.3, .6); },
    imp: d => [],
  };
};

/* ---------- 自定义场景：自己画，自己配声 ---------- */
T.custom = (fn, o = {}) => Object.assign({ kind: 'content', fn, bg: o.bg || { tone: 'base' } }, o);
