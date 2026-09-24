#!/usr/bin/env node
// 幻燈 GENTO · 质检
//   node check.js <片子目录> [--json]
// 查：字体是否加载、字出画、字互相压、字太小、画面大块空白、音量、静音段、重击有没有配声、片长。
// 有 FAIL 退出码为 1。出片前必须跑到没有 FAIL；WARN 要逐条看一眼再决定。
const fs = require('fs');
const path = require('path');
const { openFilm } = require('./render');

const inter = (a, b) => Math.max(0, Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0)) * Math.max(0, Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0));
const area = a => Math.max(1, (a.x1 - a.x0) * (a.y1 - a.y0));

async function check(dir) {
  const { page, browser, F, errors } = await openFilm(dir);
  const R = { film: F.CFG.title, style: `${F.CFG.style}/${F.CFG.palette}`, size: `${F.W}×${F.H}`, fps: F.FPS, dur: +F.DUR.toFixed(2), fails: [], warns: [], notes: [] };
  const fail = (m) => R.fails.push(m), warn = (m) => R.warns.push(m);
  try {
    for (const e of errors) fail(`页面报错：${e}`);
    // 扫帧：每场开头、结尾，加每秒 10 帧；哪一帧抛错都算不通过
    const sweep = await page.evaluate(() => {
      const f = window.__film, ts = new Set();
      for (const s of f.qa.scenes()) [s.t0, s.t0 + 1 / f.FPS, s.t0 + 2 / f.FPS, s.t1 - 1 / f.FPS].forEach(t => ts.add(+t.toFixed(4)));
      for (let t = 0; t < f.DUR; t += .1) ts.add(+t.toFixed(4));
      const bad = [];
      for (const t of ts) { try { f.renderAt(t); } catch (e) { if (bad.length < 5) bad.push(`${t.toFixed(3)}s ${f.sceneAt(t)}：${e.message}`); } }
      return { n: ts.size, bad };
    });
    for (const b of sweep.bad) fail(`渲染报错 ${b}`);
    R.notes.unshift(`扫帧 ${sweep.n} 帧`);
    const fonts = await page.evaluate(() => window.__film.qa.fonts());
    for (const f of fonts) if (!f.ok) fail(`字体没加载：${f.role}（${f.font}）`);
    const scenes = await page.evaluate(() => window.__film.qa.scenes());
    const voidTol = await page.evaluate(() => window.__film.qa.voidTol());
    for (const s of scenes) {
      const d = s.t1 - s.t0;
      for (const [frac, settled] of [[.62, false], [.96, true]]) {
        const t = s.t0 + d * frac;
        const boxes = (await page.evaluate(t => window.__film.qa.boxes(t), t)).filter(b => b.a > .5);
        const tag = `${s.n}@${t.toFixed(2)}s`;
        for (const b of boxes) {
          if (!b.bleed && (b.x0 < -4 || b.y0 < -4 || b.x1 > F.W + 4 || b.y1 > F.H + 4)) (settled ? fail : warn)(`字出画 ${tag}：「${b.s.slice(0, 16)}」 [${b.x0},${b.y0},${b.x1},${b.y1}]`);
          if (settled && b.px < 19 * Math.min(F.W, F.H) / 1080) warn(`字太小 ${tag}：「${b.s.slice(0, 16)}」 ${b.px.toFixed(1)}px`);
        }
        if (settled) {
          for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
            const a = boxes[i], b = boxes[j];
            if (a.over || b.over || (a.g != null && a.g === b.g)) continue;
            const ov = inter(a, b); if (ov <= 0) continue;
            const r = ov / Math.min(area(a), area(b));
            if (r > .12) fail(`字互相压 ${tag}：「${a.s.slice(0, 12)}」×「${b.s.slice(0, 12)}」 重叠 ${(r * 100).toFixed(0)}%`);
          }
        }
      }
      // 空白：只看内容场景的定格帧，只算版心
      if (s.kind === 'content' && !s.airy) {
        const v = await page.evaluate(t => window.__film.qa.voids(t), s.t0 + d * .96);
        if (v.frac > voidTol) warn(`空白偏大 ${s.n}：最大空白矩形占版心 ${(v.frac * 100).toFixed(0)}%，位置 [${v.rect.map(n => Math.round(n)).join(', ')}]`);
        R.notes.push(`${s.n} 空白 ${(v.frac * 100).toFixed(0)}%`);
      }
    }
    // 声音
    const A = await page.evaluate(() => window.__film.qa.audio());
    R.audio = { peakDb: A.peakDb, rmsDb: A.rmsDb, quiet: A.quiet };
    if (A.peakDb > -.3) fail(`峰值过高 ${A.peakDb} dB`); else if (A.peakDb < -6) warn(`峰值偏低 ${A.peakDb} dB`);
    if (A.rmsDb < -32) warn(`整体偏轻 RMS ${A.rmsDb} dB`);
    const quietOK = scenes.filter(s => s.kind === 'verdict' || s.kind === 'outro').map(s => [s.t0, s.t1]);
    for (const [a, b] of A.quiet) if (!quietOK.some(([x, y]) => a >= x - .2 && b <= y + .5) && b < F.DUR - .5) warn(`静音段 ${a}–${b}s`);
    // 声画同步：每个重击（强度 ≥ .5）前后 50ms 内要有一声
    const miss = A.imps.filter(([t, g]) => g >= .5 && !A.hits.some(h => Math.abs(h - t) < .05));
    for (const [t] of miss) {
      const sc = scenes.find(s => t >= s.t0 - 1e-6 && t < s.t1);
      if (sc && (sc.kind === 'open' || sc.kind === 'chapter')) continue; // 字卡和章节卡的声音在音乐底里
      fail(`重击没配声 ${t.toFixed(2)}s（${sc ? sc.n : '?'}）`);
    }
    const tgt = JSON.parse(fs.readFileSync(path.join(dir, 'film.json'), 'utf8')).target;
    if (tgt && Math.abs(F.DUR - tgt) > Math.max(tgt * .12, 60 / F.CFG.bpm * 4)) warn(`片长 ${F.DUR.toFixed(1)}s，目标 ${tgt}s`);
  } finally { await browser.close(); }
  return R;
}

module.exports = { check };

if (require.main === module) {
  (async () => {
    const dir = process.argv[2];
    if (!dir || !fs.existsSync(dir)) { console.error('用法：node check.js <片子目录> [--json]'); process.exit(1); }
    const R = await check(dir);
    if (process.argv.includes('--json')) console.log(JSON.stringify(R, null, 2));
    else {
      console.log(`质检：${R.film}（${R.style} · ${R.size} · ${R.fps} fps · ${R.dur}s）`);
      console.log(`声音：峰值 ${R.audio.peakDb} dB · RMS ${R.audio.rmsDb} dB`);
      console.log('空白：' + R.notes.join(' · '));
      for (const m of R.fails) console.log('FAIL  ' + m);
      for (const m of R.warns) console.log('WARN  ' + m);
      console.log(R.fails.length ? `结果：${R.fails.length} 项不通过，${R.warns.length} 项提醒` : `结果：通过（${R.warns.length} 项提醒）`);
    }
    process.exit(R.fails.length ? 1 : 0);
  })().catch(e => { console.error(e.stack || e.message); process.exit(2); });
}
