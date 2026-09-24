/* 幻燈 GENTO · engine/boot.js — 启动、字体、质检接口、播放器 */
if (!SC.length) throw new Error('film.js 里没有调用 FILM()');
document.title = CFG.title;
document.getElementById('note').textContent = CFG.note || '';
// 脚本里出现过的所有非 ASCII 字符喂给字体加载，让 Google Fonts 把用到的 CJK 分片都拉下来
const ALL_TEXT = [...new Set((document.currentScript ? document.currentScript.textContent : '').replace(/[\x00-\x7f]/g, ''))].join('') + 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789$%.,:;!?*/()+-–—≈→↓↑★“”';
const FONT_LOADS = [...new Set(Object.values(F).filter(r => r && r.f).flatMap(r => [`${r.st ? r.st + ' ' : ''}${r.w} 60px ${r.f}`, ...(r.also || []).map(w => `${w} 60px ${r.f}`)]))];
const KEYS = SC.flatMap(s => [s.t0 + (s.t1 - s.t0) * .35, s.t0 + (s.t1 - s.t0) * .9]);
const ready = (async () => {
  STYLE.textures();
  try {
    await Promise.race([Promise.all(FONT_LOADS.map(f => document.fonts.load(f, ALL_TEXT))), new Promise(r => setTimeout(r, 15000))]);
    await document.fonts.ready;
  } catch (e) {}
  renderAt(0.001);
})();

// 质检接口：scripts/check.js 调用
const qa = {
  voidTol: () => STYLE.voidTol ?? .25,
  scenes: () => SC.map(s => ({ n: s.n, kind: s.kind, t0: s.t0, t1: s.t1, airy: !!s.airy })),
  boxes(t) { QA.on = true; QA.boxes = []; QA.gid = 0; try { renderAt(t); } finally { QA.on = false; } return QA.boxes.map(b => ({ ...b, x0: +b.x0.toFixed(1), y0: +b.y0.toFixed(1), x1: +b.x1.toFixed(1), y1: +b.y1.toFixed(1) })); },
  // 画完整帧和只画底的帧，逐格比，返回空白格与最大空白矩形占比
  voids(t, cols = 24) {
    const rows = Math.round(cols * L.ch / L.cw), cw = L.cw / cols, ch = L.ch / rows, ox = L.left, oy = L.top;
    renderAt(t); const a = ctx.getImageData(0, 0, W, H).data;
    renderAt(t, 'bg'); const b = ctx.getImageData(0, 0, W, H).data;
    const occ = [];
    for (let r = 0; r < rows; r++) { const row = []; for (let c = 0; c < cols; c++) {
      let s = 0, n = 0;
      for (let y = Math.floor(oy + r * ch); y < Math.floor(oy + (r + 1) * ch); y += 3) for (let x = Math.floor(ox + c * cw); x < Math.floor(ox + (c + 1) * cw); x += 3) {
        const i = (y * W + x) * 4; s += Math.abs(a[i] - b[i]) + Math.abs(a[i + 1] - b[i + 1]) + Math.abs(a[i + 2] - b[i + 2]); n++;
      }
      row.push(s / n / 3 > 5 ? 1 : 0);
    } occ.push(row); }
    // 最大全空矩形（直方图法）
    let best = 0, bestR = null; const hgt = new Array(cols).fill(0);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) hgt[c] = occ[r][c] ? 0 : hgt[c] + 1;
      for (let c = 0; c < cols; c++) { let mn = 1e9; for (let c2 = c; c2 < cols; c2++) { mn = Math.min(mn, hgt[c2]); if (!mn) break; const area = mn * (c2 - c + 1); if (area > best) { best = area; bestR = [c, r - mn + 1, c2 - c + 1, mn]; } } }
    }
    renderAt(t);
    return { frac: best / (cols * rows), rect: bestR && [ox + bestR[0] * cw, oy + bestR[1] * ch, bestR[2] * cw, bestR[3] * ch], occ: occ.map(r => r.join('')).join('\n') };
  },
  fonts() { return Object.entries(F).filter(([, r]) => r && r.f).map(([k, r]) => ({ role: k, font: `${r.w} 40px ${r.f}`, ok: document.fonts.check(`${r.st ? r.st + ' ' : ''}${r.w} 40px ${r.f.split(',')[0]}`, LANG === 'en' ? 'Abc' : LANG === 'ja' ? 'あ漢' : '汉字') })); },
  audio() {
    const [l, r] = synth(), n = l.length, win = Math.round(SR * .05);
    let pk = 0, sum = 0; for (let i = 0; i < n; i++) { const v = Math.max(Math.abs(l[i]), Math.abs(r[i])); pk = Math.max(pk, v); sum += l[i] * l[i] + r[i] * r[i]; }
    const quiet = [], thr = Math.pow(10, -45 / 20); let run = 0, start = 0;
    for (let w = 0; w * win < n; w++) { let m = 0; for (let i = w * win; i < Math.min(n, (w + 1) * win); i++) m = Math.max(m, Math.abs(l[i]), Math.abs(r[i])); if (m < thr) { if (!run) start = w * win / SR; run++; } else { if (run * win / SR > 1.0) quiet.push([+start.toFixed(2), +(start + run * win / SR).toFixed(2)]); run = 0; } }
    if (run * win / SR > 1.0) quiet.push([+start.toFixed(2), +(start + run * win / SR).toFixed(2)]);
    return { peakDb: +(20 * Math.log10(pk)).toFixed(2), rmsDb: +(10 * Math.log10(sum / (2 * n))).toFixed(2), quiet, hits: HITS.slice(), imps: IMP.map(([t, a]) => [t, a]) };
  },
};
window.__film = { renderAt, synth, wavBase64, ready, DUR, KEYS, W, H, FPS, BPM, CFG, sceneAt: t => sceneAt(t).n, qa };

if (location.search.includes('export')) { document.body.classList.add('export'); }
else {
  const playBtn = document.getElementById('play'), pp = document.getElementById('pp'), bar = document.getElementById('bar'), timeEl = document.getElementById('time');
  bar.max = DUR;
  let actx = null, buffer = null, src = null, startAt = 0, offset = 0, playing = false;
  const fmt = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  const now = () => playing ? actx.currentTime - startAt : offset;
  function start(from) {
    if (playing) return;
    if (!actx) { actx = new (window.AudioContext || window.webkitAudioContext)(); const [l, r] = synth(); buffer = actx.createBuffer(2, l.length, SR); buffer.copyToChannel(l, 0); buffer.copyToChannel(r, 1); }
    actx.resume();
    if (from >= DUR - .05) from = 0;
    src = actx.createBufferSource(); src.buffer = buffer; src.connect(actx.destination); src.start(0, from);
    startAt = actx.currentTime - from; playing = true; playBtn.hidden = true; pp.textContent = '暂停';
    src.onended = () => { if (playing && now() >= DUR - .1) { playing = false; offset = DUR; pp.textContent = '重播'; } };
  }
  function stop() { if (!playing) return; offset = now(); playing = false; try { src.onended = null; src.stop(); } catch (e) {} pp.textContent = '播放'; }
  playBtn.addEventListener('click', () => start(offset));
  pp.addEventListener('click', () => playing ? stop() : start(offset >= DUR - .05 ? 0 : offset));
  bar.addEventListener('input', () => { const was = playing; stop(); offset = +bar.value; renderAt(offset); if (was) start(offset); });
  document.addEventListener('keydown', e => { if (e.code === 'Space' && e.target === document.body) { e.preventDefault(); pp.click(); } });
  const loop = () => { const t = Math.min(DUR, now()); if (playing) renderAt(t); bar.value = t; timeEl.textContent = `${fmt(t)} / ${fmt(DUR)}`; requestAnimationFrame(loop); };
  ready.then(() => { renderAt(Math.min(DUR * .2, BAR * 1.6)); requestAnimationFrame(loop); });
}
