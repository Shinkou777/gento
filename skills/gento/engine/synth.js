/* 幻燈 GENTO · engine/synth.js
   离线逐采样合成，固定种子，立体声。
   乐器包 k 交给音乐预设（music/presets.js）铺底，交给场景模板写音效。
   语义音效 k.hit / k.seal / k.pop / k.tick / k.type / k.swish / k.ding / k.note / k.rise / k.error
   由当前音乐预设决定音色，场景只管「这里要一声重击」。 */

const HITS = [];   // 质检用：每个重击音效的时刻
function synth() {
  HITS.length = 0;
  const N = Math.ceil(SR * DUR);
  const Lb = new Float32Array(N), Rb = new Float32Array(N), DL = new Float32Array(N), DR = new Float32Array(N), RV = new Float32Array(N), DK = new Float32Array(N).fill(1);
  let seed = (CFG.seed || 4242) >>> 0; const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296 * 2 - 1; };
  function add(t0, len, fn, o = {}) {
    const pan = o.pan || 0, g = o.g ?? 1, rv = o.rv || 0, a = (pan + 1) * Math.PI / 4, gl = Math.cos(a) * 1.4142 * g, gr = Math.sin(a) * 1.4142 * g;
    const TL = o.duck ? DL : Lb, TR = o.duck ? DR : Rb, s0 = Math.round(t0 * SR), n = Math.round(len * SR);
    for (let i = 0; i < n; i++) { const s = s0 + i; if (s >= N) break; if (s < 0) { fn(i / SR, i); continue; } const v = fn(i / SR, i); TL[s] += v * gl; TR[s] += v * gr; if (rv) RV[s] += v * rv * g; }
  }
  function SVF() { this.lp = 0; this.bp = 0; this.hp = 0; }
  SVF.prototype.run = function (x, fc, q) { const f = 2 * Math.sin(Math.PI * Math.min(fc, 5000) / SR); this.hp = x - this.lp - q * this.bp; this.bp += f * this.hp; this.lp += f * this.bp; return this; };
  const duck = (t0, depth = .7) => { const s0 = Math.round(t0 * SR); for (let i = 0; i < SR * .35; i++) { const s = s0 + i; if (s < 0 || s >= N) continue; const v = 1 - depth * Math.exp(-i / SR * 10); if (v < DK[s]) DK[s] = v; } };
  const mark = t => HITS.push(t);
  const env = (x, len, a = .005, r = .03) => Math.min(1, x / a) * Math.min(1, Math.max(0, (len - x) / r));

  /* ---- 鼓 ---- */
  const kick = (t0, g = 1, o = {}) => { let ph = 0; const f0 = o.f0 || 46, sw = o.sweep || 120, dec = o.dec || 6.5; add(t0, .45, x => { ph += 2 * Math.PI * (f0 + sw * Math.exp(-x * 30)) / SR; return Math.sin(ph) * Math.exp(-x * dec) + (x < .004 ? rnd() * .6 * (1 - x / .004) : 0); }, { g: g * .95 }); if (o.duck !== false) duck(t0, o.depth); };
  const clap = (t0, g = 1) => { const f = new SVF(); add(t0, .4, x => { const e = x < .03 ? Math.exp(-(x % .01) * 280) : Math.exp(-(x - .03) * 13); return f.run(rnd(), 1400, .8).bp * e * 1.2; }, { g, rv: .35 }); };
  const snare = (t0, g = 1, o = {}) => { const f = new SVF(); let ph = 0; add(t0, .3, x => { ph += 2 * Math.PI * (o.f || 190) / SR; return (f.run(rnd(), o.fc || 2500, .6).bp * 1.1 * Math.exp(-x * (o.dec || 16)) + Math.sin(ph) * .5 * Math.exp(-x * 30)); }, { g, rv: o.rv ?? .25 }); };
  const hat = (t0, g = 1, open = false) => { let p = 0; add(t0, open ? .32 : .06, x => { const n = rnd(), h = n - p; p = n; return h * Math.exp(-x * (open ? 11 : 75)) * .2; }, { g, pan: .3 }); };
  const shaker = (t0, g = 1) => { let p = 0; add(t0, .05, x => { const n = rnd(), h = n - p; p = n; return h * Math.sin(Math.PI * x / .05) * .1; }, { g, pan: -.35 }); };
  const rim = (t0, g = 1) => add(t0, .04, x => (Math.sin(2 * Math.PI * 1700 * x) * .6 + rnd() * .4) * Math.exp(-x * 120) * .5, { g, pan: -.15 });
  const tom = (t0, f = 90, g = 1, dec = 7) => { let ph = 0; add(t0, .6, x => { ph += 2 * Math.PI * f * (1 + .6 * Math.exp(-x * 18)) / SR; return Math.sin(ph) * Math.exp(-x * dec) * .8 + (x < .01 ? rnd() * .3 : 0); }, { g, rv: .2 }); };
  const taiko = (t0, g = 1) => { tom(t0, 62, g * 1.2, 5); const f = new SVF(); add(t0, .12, x => f.run(rnd(), 500, .8).lp * Math.exp(-x * 30) * 1.4, { g }); duck(t0, .5); };
  const woodclap = (t0, g = 1) => { for (const dt of [0, .012]) { const f = new SVF(); add(t0 + dt, .08, x => f.run(rnd(), 2200, .3).bp * Math.exp(-x * 90) * 2.2, { g, rv: .45 }); } };
  /* ---- 低音与和声 ---- */
  const sub = (t0, f, len, g = 1) => { let ph = 0; add(t0, len, x => { ph += 2 * Math.PI * f / SR; return Math.sin(ph) * Math.min(1, x * 200) * Math.min(1, (len - x) * 30) * .5; }, { g, duck: true }); };
  const bass = (t0, f, len, g = 1, o = {}) => { let ph = 0, y = 0; add(t0, len, x => { ph = (ph + f / SR) % 1; y += ((o.cut ?? .04) + .22 * Math.exp(-x * 16)) * (2 * ph - 1 - y); return y * Math.min(1, x * 300) * Math.min(1, (len - x) * 40) * .42; }, { g, duck: true }); };
  const b808 = (t0, f, len, g = 1, glide = 0) => { let ph = 0; add(t0, len, x => { const ff = f * (1 + glide * Math.exp(-x * 8)); ph += 2 * Math.PI * ff / SR; return Math.tanh(Math.sin(ph) * 2.2) * Math.exp(-x * 1.6) * Math.min(1, (len - x) * 20) * .42; }, { g, duck: true }); };
  const stab = (t0, fs, len = .2, g = 1) => { for (const f of fs) for (const [det, pan] of [[-.007, -.7], [.007, .7], [0, 0]]) { let ph = rnd() * .5 + .5, y = 0; add(t0, len + .06, x => { ph = (ph + f * (1 + det) / SR) % 1; y += (.05 + .4 * Math.exp(-x * 20)) * (2 * ph - 1 - y); return y * Math.exp(-x * 5) * Math.min(1, (len + .06 - x) * 40) * .06; }, { g, pan, rv: .3, duck: true }); } };
  const pad = (t0, fs, len, g = 1, o = {}) => { for (const f of fs) for (const [det, pan] of [[-.005, -.85], [.005, .85]]) { let ph = rnd() * .5 + .5, y = 0; add(t0, len, x => { ph = (ph + f * (1 + det) / SR) % 1; y += (o.cut || .025) * (2 * ph - 1 - y); return y * Math.min(1, x * (o.att || 4)) * Math.min(1, (len - x) * 5) * .07; }, { g, pan, rv: .4, duck: o.duck !== false }); } };
  const pluck = (t0, f, g = 1, len = .3, pan = 0) => { let ph = 0, y = 0; add(t0, len, x => { ph = (ph + f / SR) % 1; y += .3 * ((ph < .5 ? 1 : -1) - y); return y * Math.exp(-x * 9) * .11; }, { g, rv: .3, pan }); };
  const bell = (t0, f, g = 1, len = 1.2) => add(t0, len, x => Math.sin(2 * Math.PI * f * x + 2.2 * Math.exp(-x * 5) * Math.sin(2 * Math.PI * f * 3.5 * x)) * Math.exp(-x * 3.2) * .16, { g, rv: .5 });
  // 电钢：FM，软
  const epiano = (t0, fs, len = .9, g = 1) => { for (const f of fs) add(t0, len, x => Math.sin(2 * Math.PI * f * x + 1.2 * Math.exp(-x * 4) * Math.sin(2 * Math.PI * f * x)) * Math.exp(-x * 2.2) * env(x, len, .004, .15) * .08, { g, rv: .35, pan: (rnd()) * .3, duck: true }); };
  // 钢琴：几个泛音 + 快起慢落
  const piano = (t0, f, g = 1, len = 2.2) => add(t0, len, x => { let v = 0; for (let h = 1; h <= 5; h++) v += Math.sin(2 * Math.PI * f * h * x * (1 + .0004 * h * h)) * Math.exp(-x * (1.2 + h * .9)) / (h * h * .7 + .3); return v * env(x, len, .003, .3) * .11; }, { g, rv: .5, pan: clamp((Math.log2(f / 262)) * .25, -.5, .5) });
  // 马林巴：正弦 + 4 倍泛音，短
  const marimba = (t0, f, g = 1, len = .5) => add(t0, len, x => (Math.sin(2 * Math.PI * f * x) + .35 * Math.sin(2 * Math.PI * f * 3.9 * x) * Math.exp(-x * 30)) * Math.exp(-x * 8) * env(x, len, .002, .05) * .2, { g, rv: .25, pan: (rnd()) * .4 });
  // 琴（古筝味）：亮起音的拨弦，带一点滑音
  const koto = (t0, f, g = 1, len = 1.2) => { let ph = 0, y = 0; add(t0, len, x => { const ff = f * (1 + .012 * Math.exp(-x * 20)); ph = (ph + ff / SR) % 1; const saw = 2 * ph - 1; y += (.08 + .6 * Math.exp(-x * 14)) * (saw - y); return y * Math.exp(-x * 3.4) * env(x, len, .002, .1) * .16; }, { g, rv: .45, pan: (rnd()) * .5 }); };
  // 竹笛味：带气声的正弦
  const flute = (t0, f, len, g = 1) => { const fl = new SVF(); add(t0, len, x => (Math.sin(2 * Math.PI * f * x + .06 * Math.sin(2 * Math.PI * 5.2 * x)) * .8 + fl.run(rnd(), f * 2, .9).bp * .25) * env(x, len, .08, .2) * .09, { g, rv: .55 }); };
  // 拨弦：Karplus-Strong，一段噪声在延迟线里衰减，里拉琴、竖琴、吉他味
  const ks = (t0, f, g = 1, len = 1.6, o = {}) => {
    const n = Math.max(2, Math.round(SR / f)), buf = new Float32Array(n), br = o.bright ?? .8, damp = o.damp ?? .996;
    for (let i = 0; i < n; i++) buf[i] = rnd() * br + (i < n / 2 ? .3 : -.3) * (1 - br);
    let p = 0;
    add(t0, len, x => { const a = buf[p], b = buf[(p + 1) % n]; buf[p] = (a + b) * .5 * damp; p = (p + 1) % n; return a * env(x, len, .001, .25) * .42; }, { g, rv: o.rv ?? .4, pan: o.pan ?? 0 });
  };
  // 扫弦：几根弦依次拨响
  const strum = (t0, fs, g = 1, gap = .028, len = 1.6) => fs.forEach((f, i) => ks(t0 + i * gap, f, g * (1 - i * .08), len, { pan: (i / Math.max(1, fs.length - 1) - .5) * .6 }));
  // 框鼓：低沉的 dum 与清脆的 tek
  const dum = (t0, g = 1) => { tom(t0, 68, g * 1.1, 6.5); noiseHit(t0, .08, 400, g * .6, .15); duck(t0, .45); };
  const tek = (t0, g = 1) => { rim(t0, g * .7); noiseHit(t0, .05, 3200, g * .35, .2); };
  // 锯齿琶音（赛博）
  const arp = (t0, f, len = .12, g = 1, pan = 0) => { let ph = 0, y = 0; add(t0, len, x => { ph = (ph + f / SR) % 1; y += .35 * (2 * ph - 1 - y); return y * Math.exp(-x * 14) * env(x, len, .002, .02) * .09; }, { g, rv: .3, pan, duck: true }); };
  // 金属敲击：非谐 FM
  const metal = (t0, f = 420, g = 1, len = 1.4) => add(t0, len, x => Math.sin(2 * Math.PI * f * x + 3 * Math.exp(-x * 3) * Math.sin(2 * Math.PI * f * 2.76 * x)) * Math.exp(-x * 3.5) * .14, { g, rv: .5, pan: .2 });
  const boom = (t0, g = 1) => { let ph = 0; add(t0, 2, x => { ph += 2 * Math.PI * (38 + 30 * Math.exp(-x * 6)) / SR; return Math.sin(ph) * Math.exp(-x * 2.2) * .7; }, { g }); const f = new SVF(); add(t0, .6, x => f.run(rnd(), 300, .9).lp * Math.exp(-x * 6) * 1.5, { g, rv: .5 }); duck(t0, .8); };
  const vinyl = (t0, len, g = 1) => add(t0, len, x => (rnd() > .9985 ? rnd() * .5 : 0) + rnd() * .006, { g, pan: .1 });
  /* ---- 音效 ---- */
  const riser = (t0, len, g = 1) => { const f = new SVF(); let ph = 0; add(t0, len, x => { const k = x / len; ph += 2 * Math.PI * (200 + 900 * k * k) / SR; return (f.run(rnd(), 300 + 4500 * k * k, .5).bp * .8 + Math.sin(ph) * .15) * k * k * .45; }, { g, rv: .3 }); };
  const crash = (t0, g = 1) => { for (const pan of [-.5, .5]) { let p = 0; add(t0, 2, x => { const n = rnd(), h = n - p; p = n; return h * Math.exp(-x * 2.6) * .16; }, { g, pan, rv: .25 }); } };
  const noiseHit = (t0, len, fc, g = 1, rv = .2) => { const f = new SVF(); add(t0, len, x => f.run(rnd(), fc, .9).lp * Math.exp(-x * 14 / len) * 1.2, { g, rv }); };
  const slam = (t0, g = 1) => { kick(t0, 1.3 * g); let ph = 0; add(t0, 1.2, x => { ph += 2 * Math.PI * 42 / SR; return Math.sin(ph) * Math.exp(-x * 3) * .55; }, { g }); noiseHit(t0, .35, 900, g, .4); };
  const stampHit = (t0, g = 1) => { let ph = 0; add(t0, .16, x => { ph += 2 * Math.PI * (60 + 90 * Math.exp(-x * 40)) / SR; return Math.sin(ph) * Math.exp(-x * 20) * .8; }, { g }); const f = new SVF(); add(t0, .1, x => f.run(rnd(), 900, .7).bp * Math.exp(-x * 40) * 1.6, { g, rv: .2 }); };
  const shutter = t0 => { for (const dt of [0, .07]) { let p = 0; add(t0 + dt, .03, x => { const n = rnd(), h = n - p; p = n; return h * Math.exp(-x * 150) * .8; }); } };
  const type = (t0, g = 1) => add(t0, .03, x => rnd() * Math.exp(-x * 220) * .3, { g, pan: -.2 });
  const tick = (t0, g = 1) => add(t0, .02, x => Math.sin(2 * Math.PI * 1900 * x) * Math.exp(-x * 300) * .3, { g });
  const pop = (t0, g = 1) => { let ph = 0; add(t0, .12, x => { ph += 2 * Math.PI * (400 + 9000 * x) / SR; return Math.sin(ph) * Math.exp(-x * 30) * .35; }, { g, pan: rnd() * .6 }); };
  const ping = (t0, g = 1) => add(t0, .5, x => (Math.sin(2 * Math.PI * 2350 * x) + .6 * Math.sin(2 * Math.PI * 3720 * x)) * Math.exp(-x * 9) * .1, { g, rv: .4, pan: -.3 });
  const boing = (t0, g = 1) => { let ph = 0; add(t0, .35, x => { ph += 2 * Math.PI * (160 + 260 * Math.exp(-x * 8) * (1 + .3 * Math.sin(x * 60))) / SR; return Math.sin(ph) * Math.exp(-x * 7) * .4; }, { g, pan: .4 }); };
  const whoosh = (t0, len = .45, g = 1) => { const f = new SVF(); add(t0, len, x => { const k = x / len; return f.run(rnd(), 300 + 4000 * Math.sin(Math.PI * k), .6).bp * Math.sin(Math.PI * k) * .5; }, { g, rv: .2 }); };
  const bitcrush = (t0, len = .3, g = 1) => { let hold = 0; add(t0, len, (x, i) => { if (i % 18 === 0) hold = Math.round(rnd() * 3) / 3; return hold * Math.exp(-x * 9) * .35; }, { g, pan: rnd() * .5 }); };
  const crackle = (t0, len, g = 1) => add(t0, len, x => (rnd() > .996 ? rnd() * .7 : 0), { g, rv: .2, pan: rnd() * .5 });
  const fire = (t0, len, g = 1) => { const f = new SVF(); add(t0, len, x => f.run(rnd(), 500, .9).lp * Math.min(1, x * 3) * Math.min(1, (len - x) * 2) * .5, { g, rv: .2 }); };
  const errBeep = t0 => { for (const [dt, f] of [[0, 880], [.14, 660]]) { let ph = 0; add(t0 + dt, .13, x => { ph = (ph + f / SR) % 1; return (ph < .5 ? 1 : -1) * .1 * Math.min(1, (0.13 - x) * 60); }); } };

  const k = { add, rnd, mark, duck, SVF, kick, clap, snare, hat, shaker, rim, tom, taiko, woodclap, sub, bass, b808, stab, pad, pluck, bell, epiano, piano, marimba, koto, flute, arp, metal, boom, vinyl, ks, strum, dum, tek, riser, crash, noiseHit, slam, stampHit, shutter, type, tick, pop, ping, boing, whoosh, bitcrush, crackle, fire, errBeep };
  // 语义音效：先用默认，再让音乐预设覆盖
  const SEM = {
    hit: (t, g = 1) => { slam(t, g); stampHit(t, g * 1.1); },
    seal: (t, g = 1) => { slam(t, g * 1.1); stampHit(t, g * 1.4); crash(t, g * .8); },
    pop: (t, g = 1) => pop(t, g),
    tick: (t, g = 1) => tick(t, g),
    type: (t, g = 1) => type(t, g * .8),
    swish: (t, len = .3, g = .6) => whoosh(t, len, g),
    ding: (t, f = 1046.5, g = 1) => bell(t, f, g, .9),
    note: (t, i = 0, g = 1) => pluck(t, M.scale[((i % M.scale.length) + M.scale.length) % M.scale.length] * (i >= M.scale.length ? 2 : 1), g * 1.5, .3),
    rise: (t0, len, g = .7) => riser(t0, len, g),
    error: t => errBeep(t),
    shutter: t => shutter(t),
  };
  // 预设的音色覆盖拿到的是原始乐器（RAW），避免 tick 调到被改写后的自己
  const RAW = Object.assign({}, k); k.raw = RAW;
  Object.assign(k, SEM, M.sfx ? M.sfx(RAW) : {});
  // 标记重击时刻（质检核对声画同步）
  for (const name of ['hit', 'seal', 'pop', 'tick', 'ding']) { const f = k[name]; k[name] = (t, ...a) => { mark(t); return f(t, ...a); }; }

  // 1) 音乐底：按场景类型分段铺
  M.bed(k);
  // 2) 场景自带音效
  for (const s of SC) { if (s.cues) s.cues(k, s.t0, s.t1 - s.t0); }
  // 3) 转场：内容场景切入前一声风
  for (const s of SC.slice(1)) if (s.kind !== 'chapter' && !s.noSwish) k.swish(s.t0 - .12);
  // 4) 片子额外的配乐
  if (EXTRA_SCORE) EXTRA_SCORE(k);

  // 混音：侧链 + 手写混响 + 软削波 + 归一 + 尾部淡出
  function comb(inp, lens, aps) {
    const out = new Float32Array(N), cs = lens.map(l => ({ b: new Float32Array(l), i: 0, f: 0 })), as = aps.map(l => ({ b: new Float32Array(l), i: 0 }));
    const fb = M.room ?? .83;
    for (let s = 0; s < N; s++) {
      const x = inp[s] * .22; let y = 0;
      for (const c of cs) { const o = c.b[c.i]; c.f = o * .72 + c.f * .28; c.b[c.i] = x + c.f * fb; c.i = (c.i + 1) % c.b.length; y += o; }
      for (const a of as) { const o = a.b[a.i], v = -y * .5 + o; a.b[a.i] = y + o * .5; a.i = (a.i + 1) % a.b.length; y = v; }
      out[s] = y;
    }
    return out;
  }
  const rvL = comb(RV, [1557, 1617, 1491, 1422], [225, 556]), rvR = comb(RV, [1580, 1640, 1514, 1445], [248, 579]);
  let pk = 1e-9;
  const drive = M.drive ?? .55;
  for (let s = 0; s < N; s++) {
    Lb[s] = Math.tanh((Lb[s] + DL[s] * DK[s] + rvL[s]) * drive); Rb[s] = Math.tanh((Rb[s] + DR[s] * DK[s] + rvR[s]) * drive);
    pk = Math.max(pk, Math.abs(Lb[s]), Math.abs(Rb[s]));
  }
  for (let s = 0; s < N; s++) { const tt = s / SR, f = .89 / pk * (tt > DUR - .45 ? Math.max(0, (DUR - tt) / .45) : 1); Lb[s] *= f; Rb[s] *= f; }
  return [Lb, Rb];
}
function wavBase64([Lc, Rc]) {
  const n = Lc.length, buf = new ArrayBuffer(44 + n * 4), v = new DataView(buf);
  const ws = (o, s) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
  ws(0, 'RIFF'); v.setUint32(4, 36 + n * 4, true); ws(8, 'WAVE'); ws(12, 'fmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 2, true);
  v.setUint32(24, SR, true); v.setUint32(28, SR * 4, true); v.setUint16(32, 4, true); v.setUint16(34, 16, true); ws(36, 'data'); v.setUint32(40, n * 4, true);
  for (let i = 0; i < n; i++) { v.setInt16(44 + i * 4, clamp(Lc[i], -1, 1) * 32767, true); v.setInt16(46 + i * 4, clamp(Rc[i], -1, 1) * 32767, true); }
  let s = ''; const u = new Uint8Array(buf); for (let i = 0; i < u.length; i += 32768) s += String.fromCharCode.apply(null, u.subarray(i, i + 32768));
  return btoa(s);
}
