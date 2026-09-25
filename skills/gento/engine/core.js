/* 幻燈 GENTO · engine/core.js
   时间、画布、版面、时间线、镜头、总渲染。CFG 由 scripts/build.js 注入。
   手法改编自 dario-shabi (c) 2026 Darren Ter, MIT License */

/* ---------- 画幅与节拍 ---------- */
const W = CFG.W, H = CFG.H, FPS = CFG.fps, BPM = CFG.bpm, LANG = CFG.lang;
const SR = 44100, BT = 60 / BPM, BAR = BT * 4;
const TALL = H > W * 1.05, WIDE = W > H * 1.2, STACK = !WIDE; // STACK：方图和竖屏都按上下排
const U = Math.min(W, H) / 1080;
// 版面：上沿留给 HUD，下沿留给字幕条
const L = (() => {
  const m = TALL ? 72 : WIDE ? 120 : 90, top = TALL ? 270 : 195, bot = TALL ? H - 330 : H - 175;
  return { m, top, bot, left: m, right: W - m, cw: W - 2 * m, ch: bot - top, cx: W / 2, cy: (top + bot) / 2, capY: TALL ? H - 250 : H - 100 };
})();

/* ---------- 数学 ---------- */
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, t) => a + (b - a) * t;
const P = (t, a, b) => b === a ? (t >= a ? 1 : 0) : clamp((t - a) / (b - a));
const eOut = x => 1 - Math.pow(1 - x, 3);
const eIn = x => x * x * x;
const eIO = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
const eSine = x => .5 - Math.cos(Math.PI * clamp(x)) / 2;
const eBack = x => { if (x <= 0) return 0; const c1 = 1.7, c3 = c1 + 1; return Math.max(0, 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2)); };
const hash = n => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const rng = seed => { let s = seed | 0 || 7; return () => (s = (s * 16807) % 2147483647) / 2147483647; };
const cnv = (w, h) => { const c = document.createElement('canvas'); c.width = Math.max(1, Math.ceil(w)); c.height = Math.max(1, Math.ceil(h)); return c; };
// 砸入：从 from 缩到 1，不回弹
const slamS = (u, t0, from = 1.5, len = .1) => u < t0 ? 0 : lerp(from, 1, eOut(P(u, t0, t0 + len)));

/* ---------- 画布 ---------- */
const cv = document.getElementById('c'); cv.width = W; cv.height = H;
const ctx = cv.getContext('2d');
// 兜底：动画起点的浮点误差会让半径变成 -1e-14，arc/ellipse 遇到负数会直接报错中断导出
{ const cp = CanvasRenderingContext2D.prototype, arc0 = cp.arc, ell0 = cp.ellipse, rr0 = cp.roundRect;
  cp.arc = function (x, y, r, ...a) { return arc0.call(this, x, y, r > 0 ? r : 0, ...a); };
  cp.ellipse = function (x, y, rx, ry, ...a) { return ell0.call(this, x, y, rx > 0 ? rx : 0, ry > 0 ? ry : 0, ...a); };
  cp.roundRect = function (x, y, w, h, r) { return rr0.call(this, x, y, w, h, typeof r === 'number' ? Math.max(0, r) : Array.isArray(r) ? r.map(v => Math.max(0, v)) : r); }; }
// 质检开关：kit.text 在 QA.on 时记录每段字的包围盒
const QA = { on: false, boxes: [], gid: 0 };

/* ---------- 时间线 ---------- */
// FILM({ scenes: [[名字, 小节数, 场景, 额外标记?], ...], hud, score })
// 额外标记：{ hot, darkMusic, calm, quiet, date, hud, flash, glitch, rumble, fx, trans: { type: 'ink'|'shatter'|'sand'|'zoom', len, x, y } }
// 场景 = { fn(ctx,u,d,t), kind, cues(k,t0,d), imp(d) → [[秒, 强度]], bg, flash, dark, quiet, hot, date, hud }
let SC = [], ST = {}, DUR = 0, HUDCFG = {}, EXTRA_SCORE = null;
function FILM(o) {
  let t = 0, chap = null;
  SC = o.scenes.map(([n, bars, s, extra], i) => {
    const sc = typeof s === 'function' ? { fn: s, kind: 'custom' } : s;
    const r = Object.assign({ kind: 'content' }, sc, extra || {}, { n, i, t0: t, t1: t + bars * BAR });
    if (r.kind === 'chapter') chap = r.chap;
    else if (r.kind === 'verdict' || r.kind === 'outro' || r.kind === 'open') chap = null;
    r.chapNow = r.kind === 'chapter' ? null : chap;
    t = r.t1; return r;
  });
  ST = Object.fromEntries(SC.map(s => [s.n, s.t0])); DUR = t;
  HUDCFG = o.hud || {}; EXTRA_SCORE = o.score || null;
  for (const s of SC) {
    const d = s.t1 - s.t0;
    if (s.imp) for (const [dt, a] of s.imp(d)) imp(s.t0 + dt, a);
    if (s.flash) flash(s.t0, s.kind);
    if (s.glitch) for (const g of [].concat(s.glitch)) glitch(s.t0 + g, .25);
    if (s.rumble) rumble(s.t0, s.t1, s.rumble);
  }
  if (o.camera) o.camera({ imp, rumble, flash, glitch, ST, BT, BAR });
}
const sceneAt = t => SC.find(s => t >= s.t0 && t < s.t1) || SC[SC.length - 1];

/* ---------- 镜头 ---------- */
const IMP = [], RUMBLE = [], FLASH = [], GLITCH = [];
const imp = (t, a = 1) => IMP.push([t, a]);
const rumble = (t0, t1, a = 2.5) => RUMBLE.push([t0, t1, a]);
const flash = (t, kind) => FLASH.push([t, kind]);
const glitch = (t, len = .25) => GLITCH.push([t, len]);
function shake(t) {
  const g0 = STYLE.motion.shake ?? 1;
  let a = 0; for (const [ti, g] of IMP) if (t >= ti && t < ti + .5) a += 16 * g * Math.exp(-(t - ti) * 13);
  for (const [a0, a1, g] of RUMBLE) if (t >= a0 && t < a1) a += g;
  a *= g0 * U;
  const f = Math.floor(t * 60);
  return [(hash(f) - .5) * a, (hash(f + 50) - .5) * a];
}

/* ---------- 总渲染：只看 t ---------- */
function resetCtx() {
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
  ctx.filter = 'none'; ctx.shadowBlur = 0; ctx.shadowColor = 'transparent'; ctx.setLineDash([]);
}
// 场景光效：场景条目第四项写 fx: [{ type: 'dust' | 'rays' | 'stars' | 'vortex' | 'embers' | 'shimmer' | 'lightning', ... }]
// 模板里也能用：runFx(ctx, [{ type: 'stars' }], u, d, t)，画在文字之前就不会压字
function runFx(c, list, u, d, t) {
  for (const f of list || []) {
    if (f.from != null && u < f.from * BT) continue;
    if (f.until != null && u > f.until * BT) continue;
    const k = f.fade ? eOut(P(u, (f.from || 0) * BT, (f.from || 0) * BT + f.fade)) : 1;
    c.save(); c.globalAlpha = k;
    if (f.type === 'lightning') { const at = (f.at || 0) * BT, len = f.len || .7; if (u >= at && u < at + len) FX.lightning(c, f.x0 * W, f.y0 * H, f.x1 * W, f.y1 * H, (u - at) / len, f.seed || 1, f); }
    else if (FX[f.type]) FX[f.type](c, t, Object.assign({}, f, { x: f.x != null ? f.x * W : undefined, y: f.y != null ? f.y * H : undefined, k: f.k != null ? f.k * k : (f.grow ? eOut(P(u, 0, f.grow * BT)) : undefined) }));
    c.restore();
  }
}
const sceneFx = (c, sc, u, d, t) => runFx(c, sc.fx, u, d, t);
const cvB = cnv(W, H), ctxB = cvB.getContext('2d'); let cacheB = null;
function resetC(c) { c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1; c.filter = 'none'; c.shadowBlur = 0; c.shadowColor = 'transparent'; c.setLineDash([]); }
// 只画一场的内容（带镜头震动与推近），不含 HUD 和纸面质感
function drawScene(c, sc, t, mode) {
  const u = t - sc.t0, d = sc.t1 - sc.t0;
  resetC(c);
  const [sx, sy] = shake(t), [jx, jy] = STYLE.jitter(t);
  c.save(); c.translate(sx + jx, sy + jy);
  const z = 1 + (STYLE.motion.push ?? .03) * (u / d); c.translate(W / 2, H / 2); c.scale(z, z); c.translate(-W / 2, -H / 2);
  if (mode === 'bg') STYLE.bg(c, u, d, t, sc.bg || {}); else { sc.fn(c, u, d, t); sceneFx(c, sc, u, d, t); }
  c.restore(); resetC(c);
}
// mode = 'bg' 时只画底（质检比对空白用）
function renderAt(t, mode) {
  t = clamp(t, 0, DUR - 1e-4);
  resetCtx();
  const sc = sceneAt(t), u = t - sc.t0, d = sc.t1 - sc.t0;
  drawScene(ctx, sc, t, mode);
  // 转场：上一场最后一帧画在离屏画布上，按转场类型揭开新场
  const tr = sc.trans, prev = SC[sc.i - 1];
  if (tr && prev && mode !== 'bg' && u < (tr.len || .6)) {
    if (cacheB !== prev.n) { const q = QA.on; QA.on = false; drawScene(ctxB, prev, prev.t1 - 1e-3); QA.on = q; cacheB = prev.n; }
    resetCtx(); (TRANS[tr.type] || TRANS.ink)(ctx, cvB, clamp(u / (tr.len || .6)), tr); resetCtx();
  }
  if (mode !== 'bg' && CFG.subs && CFG.subs.length && sc.sub) { STYLE.subs(ctx, u, d, t, sc); resetCtx(); }
  if (mode !== 'bg') STYLE.hud(ctx, t, sc, u, d);
  resetCtx();
  STYLE.post(ctx, t, sc);
  resetCtx();
  const cl = STYLE.motion.cutLen ?? .09;
  for (const [f, kind] of FLASH) { const k = 1 - P(t, f, f + cl); if (t >= f && k > 0) STYLE.cut(ctx, k, kind); }
  for (const [g0, len] of GLITCH) if (t > g0 && t < g0 + len && mode !== 'bg') {
    const img = ctx.getImageData(0, 0, W, H), f = Math.floor(t * 30);
    for (let i = 0; i < 9; i++) { const y = Math.floor(hash(f * 13 + i) * H), h = 20 + Math.floor(hash(f * 7 + i) * 90), dx = Math.floor((hash(f + i * 3) - .5) * 220 * U); ctx.putImageData(img, dx, 0, 0, y, W, h); }
  }
  resetCtx();
  const fade = P(t, DUR - .4, DUR); if (fade > 0) { ctx.globalAlpha = fade; ctx.fillStyle = (typeof STYLE.fadeTo === 'function' ? STYLE.fadeTo() : STYLE.fadeTo) || '#000'; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
}
