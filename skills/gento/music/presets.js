/* 幻燈 GENTO · music/presets.js
   音乐预设。每个预设决定：铺底律动、冷开场、章节刺、结论停顿、尾声、语义音效的音色。
   bed(k) 按场景类型自动分段，场景和片子不用自己铺鼓。
   新加预设：照下面任一个写，BPM 和简介同步登记到 music/catalog.json。 */

// [根音, [三和弦]]
const CH = {
  Am: [110, [220, 261.63, 329.63]], F: [87.31, [174.61, 220, 261.63]], C: [130.81, [196, 261.63, 329.63]], G: [98, [196, 246.94, 293.66]],
  Dm: [73.42, [146.83, 174.61, 220]], E: [82.41, [164.81, 207.65, 246.94]], Em: [82.41, [164.81, 196, 246.94]], Bb: [116.54, [174.61, 233.08, 293.66]],
  Fmaj7: [87.31, [174.61, 220, 261.63, 329.63]], Em7: [82.41, [164.81, 196, 246.94, 293.66]], Dm7: [73.42, [146.83, 174.61, 220, 261.63]], Cmaj7: [130.81, [196, 246.94, 261.63, 329.63]],
  Am7: [110, [196, 220, 261.63, 329.63]], G6: [98, [196, 246.94, 293.66, 329.63]],
};
const P_ = (...names) => names.map(n => CH[n]);
const inRange = (t, rs) => rs && rs.some(([a, b]) => t >= a - 1e-6 && t < b - 1e-6);

// 通用底：按场景切段
const MUSIC_BASE = {
  scale: [523.25, 587.33, 659.25, 783.99, 880],
  prog: P_('Am', 'F', 'C', 'G'), darkProg: P_('Am', 'F', 'Dm', 'E'),
  room: .83, drive: .55,
  bed(k) {
    let run = null; const runs = [];
    const flush = () => { if (run) runs.push(run); run = null; };
    for (const s of SC) {
      const d = s.t1 - s.t0;
      if (s.kind === 'open') { flush(); this.intro(k, s.t0, d, s); continue; }
      if (s.kind === 'poster') { flush(); this.poster(k, s.t0, d, s); continue; }
      if (s.kind === 'verdict' || s.quiet) { flush(); this.stop(k, s.t0, d, s); continue; }
      if (s.kind === 'outro') { flush(); this.outro(k, s.t0, d, s); continue; }
      if (s.kind === 'chapter') { k.rise(s.t0 - 2 * BT, 2 * BT); this.chapter(k, s.t0, s); }
      if (!run) run = { from: s.t0, to: s.t1, hot: [], dark: [], calm: [] };
      run.to = s.t1; if (s.hot) run.hot.push([s.t0, s.t1]); if (s.darkMusic) run.dark.push([s.t0, s.t1]); if (s.calm) run.calm.push([s.t0, s.t1]);
    }
    flush();
    for (const r of runs) this.groove(k, r.from, r.to, r);
  },
  intro(k, t0, d, s) {
    const n = Math.max(1, Math.round(d / BT));
    for (let i = 0; i < n; i++) { const [r, tones] = this.prog[i % 4]; const t = t0 + i * BT; k.kick(t, 1.15); k.sub(t, r / 2, BT * .9, 1.1); k.stab(t, tones.map(f => f * 2), .32, 1.5); k.noiseHit(t, .2, 2500, .5); }
    k.crash(t0, 1.1);
  },
  poster(k, t0, d) { for (let t = t0; t < t0 + d - 1e-6; t += BT) { k.kick(t, .75); k.hat(t + BT / 2, .8); } },
  chapter(k, t0) { k.crash(t0, 1); k.stab(t0, [440, 523.25, 659.25], .5, 1.4); k.slam(t0, .6); },
  stop(k, t0, d) { k.sub(t0, 41.2, 1.6, 1.4); k.bell(t0, 110, 1, 1.5); },
  outro(k, t0, d) {
    const n = Math.round(d / BT);
    for (let i = 0; i < n; i++) { k.kick(t0 + i * BT, .45); if (i % 2) k.hat(t0 + i * BT + BT / 2, .6); }
    k.pad(t0, [174.61, 220, 261.63], Math.min(BAR, d), .8); if (d > BAR) k.pad(t0 + BAR, [196, 246.94, 293.66], d - BAR, .8);
    [523.25, 659.25, 783.99, 659.25, 587.33, 523.25, 493.88, 523.25].forEach((f, i) => { if (.2 + i * BT / 2 < d - .3) k.pluck(t0 + .2 + i * BT / 2, f, 1.5, .3, .2); });
  },
  groove(k, from, to, o) {
    for (let bt = Math.round(from / BT); bt < Math.round(to / BT); bt++) {
      const t0 = bt * BT, bar = Math.floor(bt / 4), ib = bt % 4, hot = inRange(t0, o.hot), dark = inRange(t0, o.dark);
      const [root, tones] = (dark ? this.darkProg : this.prog)[bar % 4];
      k.kick(t0, dark ? 1.1 : .95);
      if (ib === 1 || ib === 3) k.clap(t0, 1);
      k.hat(t0 + BT / 2, 1, ib === 3 && bar % 2 === 1);
      k.shaker(t0 + BT / 4, .8); k.shaker(t0 + 3 * BT / 4, .8);
      if (hot) { k.hat(t0 + BT / 4, .6); k.hat(t0 + 3 * BT / 4, .6); }
      k.sub(t0, root / 2, BT * .92, .9);
      k.bass(t0 + BT / 2, root, BT * .45, 1);
      if (hot || dark) k.bass(t0 + BT * .75, root * 2, BT * .2, .7);
      if (ib === 0) k.pad(t0, tones, Math.min(BAR, to - t0), dark ? 1.3 : 1);
      if (ib === 1 || ib === 3 || hot) k.stab(t0 + BT / 2, tones.map(f => f * 2), .16, hot ? 1 : .8);
    }
  },
};
const preset = o => Object.assign({}, MUSIC_BASE, o);

const MUSIC = {
  // 流行浩室：四拍底鼓、反拍镲、和弦刺。孔版、瑞士的默认
  house: preset({}),

  // 赛博：锯齿十六分贝斯 + 琶音 + 噪声军鼓，击打带数码碎裂
  cyber: preset({
    prog: P_('Am', 'F', 'G', 'Em'), darkProg: P_('Am', 'F', 'Dm', 'E'), drive: .62,
    sfx: k => ({
      hit: (t, g = 1) => { k.slam(t, g); k.bitcrush(t, .25, g); },
      seal: (t, g = 1) => { k.boom(t, g * .8); k.bitcrush(t, .4, g * 1.2); k.crash(t, g * .7); },
      pop: (t, g = 1) => { k.arp(t, 1760, .08, g * 2); },
      tick: (t, g = 1) => k.rim(t, g),
      ding: (t, f = 1318.5, g = 1) => { k.arp(t, f, .3, g * 2); k.arp(t + .06, f * 1.5, .3, g * 1.4); },
      swish: (t, len = .3, g = .6) => { k.whoosh(t, len, g); k.bitcrush(t + len * .6, .1, g * .5); },
    }),
    chapter(k, t0) { k.boom(t0, .8); k.bitcrush(t0, .35, 1); k.crash(t0, .9); },
    groove(k, from, to, o) {
      for (let bt = Math.round(from / BT); bt < Math.round(to / BT); bt++) {
        const t0 = bt * BT, bar = Math.floor(bt / 4), ib = bt % 4, hot = inRange(t0, o.hot), dark = inRange(t0, o.dark);
        const [root, tones] = (dark ? this.darkProg : this.prog)[bar % 4];
        k.kick(t0, 1);
        if (ib === 1 || ib === 3) k.snare(t0, .9, { fc: 3200 });
        for (let j = 0; j < 4; j++) k.hat(t0 + j * BT / 4, j % 2 ? .45 : .7);
        for (let j = 0; j < 4; j++) if (j) k.bass(t0 + j * BT / 4, root, BT * .2, .9, { cut: .07 });
        const arpN = hot ? 4 : 2;
        for (let j = 0; j < arpN; j++) { const tt = tones.concat(tones.map(f => f * 2)); k.arp(t0 + j * BT / arpN, tt[(bt * arpN + j) % tt.length] * 2, BT / arpN * .9, 1, j % 2 ? .5 : -.5); }
        if (ib === 0) k.pad(t0, tones, Math.min(BAR, to - t0), .9, { cut: .018 });
      }
    },
    outro(k, t0, d) {
      const n = Math.round(d / BT);
      for (let i = 0; i < n; i++) { k.kick(t0 + i * BT, .4); k.hat(t0 + i * BT + BT / 2, .5); k.arp(t0 + i * BT, [440, 523.25, 659.25, 783.99][i % 4] * 2, BT * .8, .8); }
      k.pad(t0, [220, 261.63, 329.63], d, .8, { cut: .015 });
    },
  }),

  // 和风：太鼓、拍子木、琴拨弦，都節音阶
  wafu: preset({
    scale: [293.66, 311.13, 392, 440, 466.16], room: .87, drive: .5,
    sfx: k => ({
      hit: (t, g = 1) => { k.taiko(t, g * 1.2); k.woodclap(t, g * .8); },
      seal: (t, g = 1) => { k.taiko(t, g * 1.4); k.woodclap(t, g); k.bell(t + .02, 146.83, g * .8, 2.2); },
      pop: (t, g = 1) => k.koto(t, 880, g * .9, .5),
      tick: (t, g = 1) => k.woodclap(t, g * .45),
      ding: (t, f = 587.33, g = 1) => k.bell(t, f, g * .8, 1.6),
      swish: (t, len = .3, g = .45) => k.whoosh(t, len * 1.3, g),
      note: (t, i = 0, g = 1) => k.koto(t, [293.66, 311.13, 392, 440, 466.16, 587.33, 622.25, 784][((i % 8) + 8) % 8], g, .9),
    }),
    intro(k, t0, d) {
      const n = Math.max(1, Math.round(d / BT)), sc = [293.66, 392, 440, 587.33];
      for (let i = 0; i < n; i++) { const t = t0 + i * BT; k.taiko(t, 1.1); k.koto(t, sc[i % 4], 1.2, 1); k.koto(t + .03, sc[i % 4] * 1.5, .7, .8); }
      k.woodclap(t0, 1);
    },
    poster(k, t0, d) { for (let t = t0; t < t0 + d - 1e-6; t += BT) { k.taiko(t, .6); k.rim(t + BT / 2, .5); } k.flute(t0, 587.33, d, .8); },
    chapter(k, t0) { k.woodclap(t0 - .12, .8); k.woodclap(t0, 1.2); k.taiko(t0, 1.3); [587.33, 466.16, 440, 392, 311.13, 293.66].forEach((f, i) => k.koto(t0 + i * .035, f, .8, 1)); },
    stop(k, t0) { k.taiko(t0, 1.4); k.bell(t0, 73.42, 1.2, 3); },
    outro(k, t0, d) {
      const n = Math.round(d / BT), mel = [587.33, 466.16, 440, 392, 440, 293.66, 311.13, 293.66];
      for (let i = 0; i < n; i++) { if (i % 2 === 0) k.taiko(t0 + i * BT, .5); k.koto(t0 + i * BT, mel[i % mel.length], .9, 1.2); }
      k.flute(t0, 293.66, d, .6);
    },
    groove(k, from, to, o) {
      const sc = [293.66, 311.13, 392, 440, 466.16, 587.33];
      for (let bt = Math.round(from / BT); bt < Math.round(to / BT); bt++) {
        const t0 = bt * BT, ib = bt % 4, bar = Math.floor(bt / 4), hot = inRange(t0, o.hot), dark = inRange(t0, o.dark);
        if (ib === 0 || (ib === 2 && hot)) k.taiko(t0, dark ? 1.2 : 1);
        if (ib === 2) k.tom(t0 + BT / 2, 110, .6);
        if (ib === 3) k.woodclap(t0, .7);
        k.rim(t0 + BT / 2, .35); if (hot) { k.rim(t0 + BT / 4, .25); k.rim(t0 + 3 * BT / 4, .25); }
        k.sub(t0, dark ? 36.71 : 73.42, BT * .9, .7);
        const idx = [0, 2, 3, 5, 4, 3, 2, 1][(bt + bar) % 8];
        k.koto(t0, sc[idx] * (dark ? .5 : 1), .9, 1.1);
        if (ib % 2 === 1) k.koto(t0 + BT / 2, sc[(idx + 2) % sc.length], .5, .7);
        if (ib === 0) k.pad(t0, [146.83, 220], Math.min(BAR, to - t0), .6, { cut: .012 });
      }
    },
  }),

  // Lo-fi：摇摆镲、闷底鼓、电钢七和弦、黑胶底噪
  lofi: preset({
    prog: P_('Fmaj7', 'Em7', 'Dm7', 'Cmaj7'), darkProg: P_('Am7', 'Fmaj7', 'Dm7', 'E'), room: .86, drive: .48,
    scale: [523.25, 587.33, 659.25, 783.99, 880],
    sfx: k => ({
      hit: (t, g = 1) => { k.kick(t, g * .9, { dec: 8 }); k.snare(t, g * .6, { fc: 1800, dec: 20 }); k.epiano(t, [349.23, 440, 523.25], .8, g * 1.2); },
      seal: (t, g = 1) => { k.boom(t, g * .5); k.epiano(t, [261.63, 329.63, 392, 493.88], 1.4, g * 1.4); k.bell(t, 1046.5, g * .6, 1.2); },
      pop: (t, g = 1) => k.marimba(t, 1046.5, g * .8),
      tick: (t, g = 1) => k.rim(t, g * .6),
      ding: (t, f = 1046.5, g = 1) => k.epiano(t, [f], 1, g * 1.6),
      swish: (t, len = .3, g = .4) => k.whoosh(t, len * 1.4, g),
      note: (t, i = 0, g = 1) => k.epiano(t, [[523.25, 587.33, 659.25, 783.99, 880, 1046.5][((i % 6) + 6) % 6]], .8, g * 1.4),
    }),
    intro(k, t0, d) { const n = Math.max(1, Math.round(d / BT)); for (let i = 0; i < n; i++) { const [r, tones] = this.prog[i % 4]; k.kick(t0 + i * BT, .8, { dec: 8 }); k.epiano(t0 + i * BT, tones.map(f => f * 2), .9, 1.3); k.sub(t0 + i * BT, r / 2, BT * .9, .8); } k.vinyl(t0, d, 1); },
    poster(k, t0, d) { this.groove(k, t0, t0 + d, {}); },
    chapter(k, t0) { k.epiano(t0, [440, 523.25, 659.25, 783.99], 1.2, 1.4); k.snare(t0, .5, { fc: 1600, dec: 12 }); },
    stop(k, t0, d) { k.epiano(t0, [220, 261.63, 329.63], 2, 1.2); k.vinyl(t0, d, 1.4); },
    outro(k, t0, d) { const n = Math.round(d / BT); for (let i = 0; i < n; i++) { const [r, tones] = this.prog[Math.floor(i / 4) % 4]; if (i % 4 === 0) k.epiano(t0 + i * BT, tones.map(f => f * 2), BAR * .9, 1.1); if (i % 2 === 0) k.kick(t0 + i * BT, .5, { dec: 8 }); } k.vinyl(t0, d, 1); },
    groove(k, from, to, o) {
      const sw = BT * .09;
      k.vinyl(from, to - from, 1);
      for (let bt = Math.round(from / BT); bt < Math.round(to / BT); bt++) {
        const t0 = bt * BT, ib = bt % 4, bar = Math.floor(bt / 4), dark = inRange(t0, o.dark), hot = inRange(t0, o.hot);
        const [root, tones] = (dark ? this.darkProg : this.prog)[bar % 4];
        if (ib === 0 || ib === 2) k.kick(t0, .85, { dec: 8, depth: .5 });
        if (ib === 1) k.kick(t0 + BT / 2 + sw, .5, { dec: 8, depth: .4 });
        if (ib === 1 || ib === 3) k.snare(t0, .55, { fc: 1800, dec: 20 });
        k.hat(t0, .5); k.hat(t0 + BT / 2 + sw, .35); if (hot) k.hat(t0 + BT / 4, .2);
        k.sub(t0, root / 2, BT * .95, .8);
        if (ib === 0) k.epiano(t0, tones.map(f => f * 2), BAR * .95, 1);
        if (ib === 2) k.epiano(t0 + BT / 2 + sw, [tones[tones.length - 1] * 2], .6, .8);
      }
    },
  }),

  // 钢琴：分解和弦 + 柔垫，几乎不打鼓。岁月静好的默认
  piano: preset({
    prog: P_('C', 'G', 'Am', 'F'), darkProg: P_('Am', 'F', 'C', 'G'), room: .88, drive: .45,
    scale: [523.25, 587.33, 659.25, 783.99, 880],
    sfx: k => ({
      hit: (t, g = 1) => { k.piano(t, 130.81, g * 1.2, 2.5); k.piano(t, 196, g, 2.5); k.kick(t, g * .35, { dec: 5, duck: false }); },
      seal: (t, g = 1) => { [261.63, 329.63, 392, 523.25].forEach((f, i) => k.piano(t + i * .04, f, g, 3)); k.bell(t + .1, 1046.5, g * .5, 2); },
      pop: (t, g = 1) => k.piano(t, 1046.5, g * .6, 1.2),
      tick: (t, g = 1) => k.piano(t, 1567.98, g * .35, .8),
      type: (t, g = 1) => k.type(t, g * .25),
      ding: (t, f = 1046.5, g = 1) => k.bell(t, f, g * .6, 1.8),
      swish: (t, len = .3, g = .25) => k.whoosh(t, len * 1.8, g),
      note: (t, i = 0, g = 1) => k.piano(t, [523.25, 587.33, 659.25, 783.99, 880, 1046.5][((i % 6) + 6) % 6], g * .9, 1.6),
    }),
    intro(k, t0, d) { const n = Math.max(1, Math.round(d / BT)); for (let i = 0; i < n; i++) { const [r, tones] = this.prog[i % 4]; k.piano(t0 + i * BT, r, 1, 2.4); tones.forEach((f, j) => k.piano(t0 + i * BT + .02 * j, f * 2, .7, 2)); } },
    poster(k, t0, d) { this.groove(k, t0, t0 + d, {}); },
    chapter(k, t0) { k.bell(t0, 783.99, .7, 2); k.piano(t0, 196, .8, 2.5); },
    stop(k, t0, d) { k.piano(t0, 110, 1, 3.5); k.piano(t0, 164.81, .8, 3.5); k.pad(t0, [220, 261.63, 329.63], d, .6, { att: 1.5, duck: false }); },
    outro(k, t0, d) { this.groove(k, t0, t0 + d, {}); },
    groove(k, from, to, o) {
      for (let bt = Math.round(from / BT); bt < Math.round(to / BT); bt++) {
        const t0 = bt * BT, ib = bt % 4, bar = Math.floor(bt / 4), dark = inRange(t0, o.dark), hot = inRange(t0, o.hot);
        const [root, tones] = (dark ? this.darkProg : this.prog)[bar % 4];
        if (ib === 0) { k.piano(t0, root, .9, BAR * 1.2); k.pad(t0, tones, Math.min(BAR, to - t0), .55, { att: 1.2, duck: false }); }
        const arpN = hot ? 4 : 2;
        for (let j = 0; j < arpN; j++) { const tt = [tones[0] * 2, tones[1] * 2, tones[2] * 2, tones[1] * 2]; k.piano(t0 + j * BT / arpN, tt[(ib * arpN + j) % 4], .5, 1.4); }
        if (hot && ib % 2 === 0) k.kick(t0, .3, { dec: 5, duck: false });
      }
    },
  }),

  // 电影感：八分脉冲低音、钢铁敲击、弦垫、大鼓。工业渲染的默认
  cinematic: preset({
    prog: P_('Dm', 'Bb', 'F', 'C'), darkProg: P_('Dm', 'Bb', 'Dm', 'E'), room: .86, drive: .6,
    scale: [587.33, 698.46, 783.99, 880, 1046.5],
    sfx: k => ({
      hit: (t, g = 1) => { k.boom(t, g * .9); k.metal(t, 320, g * .8, 1.2); },
      seal: (t, g = 1) => { k.boom(t, g * 1.1); k.metal(t, 220, g, 2); k.crash(t, g * .7); },
      pop: (t, g = 1) => k.metal(t, 1400, g * .5, .4),
      tick: (t, g = 1) => k.rim(t, g * .8),
      ding: (t, f = 880, g = 1) => k.metal(t, f, g * .7, 1.2),
      swish: (t, len = .3, g = .6) => k.whoosh(t, len * 1.5, g),
    }),
    intro(k, t0, d) { const n = Math.max(1, Math.round(d / BT)); for (let i = 0; i < n; i++) { const [r, tones] = this.prog[i % 4]; k.boom(t0 + i * BT, .8); k.pad(t0 + i * BT, tones, BT, 1.2, { att: 30 }); k.metal(t0 + i * BT, 300 + i * 60, .5, .8); } },
    poster(k, t0, d) { for (let t = t0; t < t0 + d - 1e-6; t += BT / 2) k.bass(t, 73.42, BT * .3, .9, { cut: .06 }); k.pad(t0, [146.83, 220, 293.66], d, 1, { att: 1 }); },
    chapter(k, t0) { k.boom(t0, 1); k.metal(t0, 260, .9, 1.8); k.crash(t0, .6); },
    stop(k, t0, d) { k.boom(t0, 1.3); k.pad(t0, [73.42, 110, 146.83], d, 1, { att: 1, duck: false }); },
    outro(k, t0, d) { k.pad(t0, [146.83, 174.61, 220, 293.66], d, 1, { att: 1, duck: false }); for (let i = 0; i < Math.round(d / BT); i += 2) k.metal(t0 + i * BT, [587.33, 523.25, 440, 392][(i / 2) % 4], .5, 1.4); },
    groove(k, from, to, o) {
      for (let bt = Math.round(from / BT); bt < Math.round(to / BT); bt++) {
        const t0 = bt * BT, ib = bt % 4, bar = Math.floor(bt / 4), hot = inRange(t0, o.hot), dark = inRange(t0, o.dark);
        const [root, tones] = (dark ? this.darkProg : this.prog)[bar % 4];
        if (ib === 0) { k.boom(t0, .55); k.pad(t0, tones, Math.min(BAR, to - t0), 1.1, { att: 1.5 }); }
        else k.kick(t0, .55, { f0: 40, dec: 5 });
        k.bass(t0, root, BT * .3, .9, { cut: .06 }); k.bass(t0 + BT / 2, root, BT * .3, .8, { cut: .06 });
        if (ib === 2 || hot) k.snare(t0, .5, { fc: 1200, dec: 10, rv: .45 });
        if (hot) { k.tom(t0 + BT / 2, 110, .5); k.tom(t0 + 3 * BT / 4, 90, .5); }
        k.hat(t0 + BT / 2, .35);
      }
    },
  }),

  // 明快：马林巴、拍手、轻底鼓。讲故事 / 讲原理的默认
  bright: preset({
    prog: P_('C', 'G', 'Am', 'F'), darkProg: P_('Am', 'F', 'C', 'G'), room: .8, drive: .5,
    scale: [523.25, 587.33, 659.25, 783.99, 880],
    sfx: k => ({
      hit: (t, g = 1) => { k.kick(t, g * .9); k.clap(t, g * .8); [523.25, 659.25, 783.99].forEach(f => k.marimba(t, f, g)); },
      seal: (t, g = 1) => { [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => k.marimba(t + i * .05, f, g * 1.1)); k.bell(t + .2, 1046.5, g * .6, 1); k.clap(t, g); },
      pop: (t, g = 1) => k.boing(t, g * .7),
      tick: (t, g = 1) => k.marimba(t, 1567.98, g * .5, .2),
      ding: (t, f = 1046.5, g = 1) => { k.marimba(t, f, g); k.bell(t, f * 2, g * .4, .8); },
      note: (t, i = 0, g = 1) => k.marimba(t, [523.25, 587.33, 659.25, 783.99, 880, 1046.5][((i % 6) + 6) % 6], g * 1.1),
    }),
    intro(k, t0, d) { const n = Math.max(1, Math.round(d / BT)); for (let i = 0; i < n; i++) { const [r, tones] = this.prog[i % 4]; k.kick(t0 + i * BT, .9); tones.forEach(f => k.marimba(t0 + i * BT, f * 2, 1)); k.sub(t0 + i * BT, r / 2, BT * .9, .8); } },
    chapter(k, t0) { [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => k.marimba(t0 + i * .04, f, 1)); k.clap(t0, .9); k.crash(t0, .5); },
    stop(k, t0) { k.marimba(t0, 130.81, 1.2, 1.2); k.bell(t0, 523.25, .7, 1.5); },
    outro(k, t0, d) { const mel = [783.99, 659.25, 587.33, 523.25, 587.33, 659.25, 523.25, 523.25]; for (let i = 0; i < Math.round(d / BT); i++) { k.marimba(t0 + i * BT, mel[i % 8], .9); if (i % 2 === 0) k.kick(t0 + i * BT, .5); } k.pad(t0, [261.63, 329.63, 392], d, .6, { duck: false }); },
    groove(k, from, to, o) {
      for (let bt = Math.round(from / BT); bt < Math.round(to / BT); bt++) {
        const t0 = bt * BT, ib = bt % 4, bar = Math.floor(bt / 4), hot = inRange(t0, o.hot), dark = inRange(t0, o.dark);
        const [root, tones] = (dark ? this.darkProg : this.prog)[bar % 4];
        if (ib === 0 || ib === 2) k.kick(t0, .8);
        if (ib === 1 || ib === 3) k.clap(t0, .8);
        k.shaker(t0 + BT / 2, .9); if (hot) { k.shaker(t0 + BT / 4, .6); k.shaker(t0 + 3 * BT / 4, .6); }
        k.bass(t0, root, BT * .4, .8, { cut: .05 });
        const tt = [tones[0], tones[1], tones[2], tones[1]].map(f => f * 2);
        k.marimba(t0, tt[ib], .8); k.marimba(t0 + BT / 2, tt[(ib + 2) % 4], .55);
        if (ib === 0) k.pad(t0, tones, Math.min(BAR, to - t0), .5);
      }
    },
  }),

  // 极简：细碎滴答、正弦低音、干净琶音。蓝图的默认
  minimal: preset({
    prog: P_('Am', 'Em', 'F', 'G'), darkProg: P_('Am', 'F', 'Dm', 'E'), room: .8, drive: .5,
    sfx: k => ({
      hit: (t, g = 1) => { k.kick(t, g * 1.1); k.rim(t, g); k.sub(t, 55, .6, g); },
      seal: (t, g = 1) => { k.stampHit(t, g * 1.3); k.kick(t, g); k.bell(t, 1318.5, g * .7, 1.2); },
      pop: (t, g = 1) => k.tick(t, g * 1.4),
      tick: (t, g = 1) => k.tick(t, g),
      ding: (t, f = 1318.5, g = 1) => k.bell(t, f, g * .8, 1),
      note: (t, i = 0, g = 1) => k.marimba(t, [440, 523.25, 659.25, 783.99, 880, 1046.5][((i % 6) + 6) % 6], g * .9, .35),
    }),
    chapter(k, t0) { k.bell(t0, 880, .8, 1.4); k.kick(t0, 1); k.rim(t0, 1); },
    groove(k, from, to, o) {
      for (let bt = Math.round(from / BT); bt < Math.round(to / BT); bt++) {
        const t0 = bt * BT, ib = bt % 4, bar = Math.floor(bt / 4), hot = inRange(t0, o.hot), dark = inRange(t0, o.dark);
        const [root, tones] = (dark ? this.darkProg : this.prog)[bar % 4];
        if (ib === 0 || ib === 2) k.kick(t0, .8, { dec: 8 });
        k.rim(t0 + BT / 2, .5);
        for (let j = 0; j < 4; j++) k.raw.tick(t0 + j * BT / 4, j === 0 ? .35 : .18);
        k.sub(t0, root / 2, BT * .9, .9);
        const tt = [tones[0], tones[2], tones[1] * 2, tones[2]].map(f => f * 2);
        k.marimba(t0, tt[ib], .55, .3); if (hot) k.marimba(t0 + BT / 2, tt[(ib + 1) % 4], .4, .25);
        if (ib === 0) k.pad(t0, tones, Math.min(BAR, to - t0), .45, { cut: .015 });
      }
    },
  }),

  // Trap：808 滑音、三连镲、第三拍军鼓（半速感）
  trap: preset({
    prog: P_('Am', 'F', 'Dm', 'E'), darkProg: P_('Am', 'F', 'Dm', 'E'), drive: .6,
    sfx: k => ({
      hit: (t, g = 1) => { k.b808(t, 55, .8, g, .5); k.clap(t, g); k.snare(t, g * .6); },
      seal: (t, g = 1) => { k.boom(t, g); k.clap(t, g); k.crash(t, g * .6); },
    }),
    groove(k, from, to, o) {
      for (let bt = Math.round(from / BT); bt < Math.round(to / BT); bt++) {
        const t0 = bt * BT, ib = bt % 4, bar = Math.floor(bt / 4), hot = inRange(t0, o.hot);
        const [root, tones] = this.prog[bar % 4];
        if (ib === 0) { k.kick(t0, 1); k.b808(t0, root / 2, BAR * .9, 1, .3); }
        if (ib === 2) { k.clap(t0, 1); k.snare(t0, .7); }
        const roll = hot || (ib === 3 && bar % 2 === 1);
        const n = roll ? 6 : 2; for (let j = 0; j < n; j++) k.hat(t0 + j * BT / n, .5);
        if (ib === 0) k.pad(t0, tones, Math.min(BAR, to - t0), .7, { cut: .015 });
      }
    },
  }),

  // 里拉琴：Karplus-Strong 拨弦、框鼓、簧管低音持续音，D 多利亚调式。希腊陶瓶的默认
  lyre: preset({
    prog: [[73.42, [146.83, 220, 293.66, 349.23]], [65.41, [130.81, 196, 261.63, 329.63]], [58.27, [116.54, 174.61, 233.08, 293.66]], [65.41, [130.81, 196, 261.63, 329.63]]],
    darkProg: [[73.42, [146.83, 220, 293.66, 349.23]], [58.27, [116.54, 174.61, 233.08, 293.66]], [49, [98, 146.83, 196, 233.08]], [55, [110, 164.81, 220, 277.18]]],
    scale: [293.66, 329.63, 349.23, 392, 440, 493.88, 523.25, 587.33], room: .88, drive: .5,
    sfx: k => ({
      hit: (t, g = 1) => { k.dum(t, g * 1.2); k.strum(t, [146.83, 220, 293.66, 440], g * 1.1, .018, 1.4); },
      seal: (t, g = 1) => { k.dum(t, g * 1.4); k.strum(t, [110, 146.83, 220, 293.66, 440, 587.33], g * 1.2, .022, 2.2); k.bell(t + .05, 2349.3, g * .45, 1.2); },
      pop: (t, g = 1) => k.ks(t, 880, g * .9, .9, { bright: .9 }),
      tick: (t, g = 1) => k.bell(t, 2637, g * .25, .4),
      ding: (t, f = 2349.3, g = 1) => k.bell(t, f, g * .5, 1.4),
      swish: (t, len = .3, g = .4) => k.whoosh(t, len * 1.4, g),
      note: (t, i = 0, g = 1) => k.ks(t, [293.66, 329.63, 349.23, 392, 440, 493.88, 523.25, 587.33][((i % 8) + 8) % 8], g, 1.2),
    }),
    intro(k, t0, d) {
      const n = Math.max(1, Math.round(d / BT));
      for (let i = 0; i < n; i++) { const [r, tones] = this.prog[i % 4], t = t0 + i * BT; k.dum(t, 1.1); k.strum(t, tones.map(f => f * 2), 1.1, .02, 1.3); k.sub(t, r, BT * .9, .7); }
      k.pad(t0, [73.42, 110], d, .7, { cut: .012, att: 2, duck: false });
    },
    poster(k, t0, d) { for (let i = 0; i < Math.round(d / BT); i++) { const t = t0 + i * BT; if (i % 2 === 0) k.dum(t, .7); else k.tek(t, .7); k.ks(t + BT / 2, [587.33, 523.25, 440, 392][i % 4], .6, 1); } k.pad(t0, [73.42, 110], d, .7, { cut: .012, att: 2, duck: false }); },
    chapter(k, t0) { k.bell(t0, 2349.3, .5, 1.2); [587.33, 523.25, 440, 392, 349.23, 293.66].forEach((f, i) => k.ks(t0 + i * .04, f, .8, 1.3)); k.dum(t0, 1); },
    stop(k, t0, d) { k.dum(t0, 1.3); k.pad(t0, [73.42, 110, 146.83], d, .9, { cut: .01, att: 1.5, duck: false }); k.ks(t0 + .1, 146.83, .9, 2.5, { damp: .998 }); },
    outro(k, t0, d) {
      const mel = [587.33, 523.25, 440, 392, 440, 349.23, 329.63, 293.66], n = Math.round(d / BT);
      for (let i = 0; i < n; i++) { k.ks(t0 + i * BT, mel[i % mel.length], .9, 1.6); if (i % 2 === 0) k.dum(t0 + i * BT, .55); else k.tek(t0 + i * BT + BT / 2, .5); }
      k.pad(t0, [73.42, 110, 146.83], d, .8, { cut: .01, att: 1.5, duck: false });
    },
    groove(k, from, to, o) {
      const sc = [293.66, 329.63, 349.23, 392, 440, 493.88, 523.25, 587.33];
      k.pad(from, [73.42, 110], to - from, .75, { cut: .011, att: 2, duck: false });
      for (let bt = Math.round(from / BT); bt < Math.round(to / BT); bt++) {
        const t0 = bt * BT, ib = bt % 4, bar = Math.floor(bt / 4), hot = inRange(t0, o.hot), dark = inRange(t0, o.dark), calm = inRange(t0, o.calm);
        const [root, tones] = (dark ? this.darkProg : this.prog)[bar % 4];
        if (calm) { if (ib === 0) { k.strum(t0, tones.map(f => f * 2), .45, .06, BAR); k.sub(t0, root, BAR * .95, .4); } if (ib === 2) k.ks(t0 + BT / 2, sc[(bar * 3) % sc.length] * 2, .35, 1.6); continue; }
        if (hot && ib % 2 === 1) { k.dum(t0 + BT / 2, .6); k.tom(t0 + 3 * BT / 4, 110, .5); }
        if (ib === 0 || ib === 2) k.dum(t0, ib === 0 ? 1 : .75);
        k.tek(t0 + BT / 2, .6); if (ib === 3 || hot) k.tek(t0 + 3 * BT / 4, .45);
        if (ib === 0) { k.strum(t0, tones.map(f => f * 2), .75, .03, BAR * .9); k.sub(t0, root, BAR * .95, .55); }
        const sect = Math.floor(bar / 8) % 3, M1 = [[0, 2, 4, 7, 5, 4, 2, 1], [4, 3, 2, 0, 1, 2, 4, 5], [7, 5, 4, 2, 4, 5, 7, 6]][sect], M2 = [[4, 5, 7, 4, 2, 4, 5, 2], [2, 4, 1, 2, 0, 1, 2, 4], [5, 4, 2, 4, 5, 7, 5, 4]][sect];
        const up = M1[(bt * 2) % 8], up2 = M2[(bt + bar) % 8];
        k.ks(t0 + BT / 2, sc[up] * (dark ? .5 : 1), .55, 1.1, { pan: -.3 });
        if (ib % 2 === 1 || hot) k.ks(t0 + 3 * BT / 4, sc[up2], .4, .9, { pan: .3 });
      }
    },
  }),

  // 无配乐：只留音效
  none: preset({
    bed(k) { for (const s of SC) if (s.kind === 'verdict') k.sub(s.t0, 41.2, 1.2, 1); },
  }),
};
const M = MUSIC[CFG.music] || MUSIC.house;
