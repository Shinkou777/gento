#!/usr/bin/env node
// 幻燈 GENTO · 回归测试：每个风格的样片 + 一组画幅/语言组合，全部跑质检。
//   node test.js            → 八个风格样片（横屏中文）
//   node test.js --matrix   → 再加竖版、方版、4:5 与日文、英文组合
//   node test.js --sheets DIR → 同时把联系表写到 DIR（给 docs/gallery 用）
//   node test.js --only-matrix → 只跑组合
//   node test.js riso swiss → 只测点名的风格
// 改引擎、改风格包、加新风格之后都要跑；有 FAIL 就不许发布。
const fs = require('fs');
const path = require('path');
const os = require('os');
const { check } = require('./check');
const { openFilm, sheet } = require('./render');

const ROOT = path.resolve(__dirname, '..');
const styles = JSON.parse(fs.readFileSync(path.join(ROOT, 'styles/catalog.json'), 'utf8'));
const args = process.argv.slice(2);
const pick = args.filter(a => styles[a]);
const sheetsDir = args.includes('--sheets') ? path.resolve(args[args.indexOf('--sheets') + 1]) : null;

const cases = (pick.length ? pick : Object.keys(styles)).map(s => ({ style: s, format: '16:9', lang: 'zh' }));
if (args.includes('--only-matrix')) { cases.length = 0; args.push('--matrix'); }
if (args.includes('--matrix')) {
  const ids = Object.keys(styles), fm = ['9:16', '1:1', '4:5', '9:16'], lg = ['ja', 'en', 'zh', 'ja', 'en', 'zh', 'ja', 'en'];
  ids.forEach((s, i) => cases.push({ style: s, format: fm[i % fm.length], lang: lg[i % lg.length], palette: Object.keys(styles[s].palettes)[1 + (i % 2)] }));
}

(async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'gento-test-'));
  let failed = 0;
  for (const c of cases) {
    const dir = path.join(tmp, `${c.style}-${c.format.replace(':', 'x')}-${c.lang}`);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'film.json'), JSON.stringify({ title: `test ${c.style}`, style: c.style, palette: c.palette, format: c.format, lang: c.lang, script: path.join(ROOT, 'samples/_tour/film.js') }));
    const t0 = Date.now();
    const R = await check(dir);
    const tag = `${c.style.padEnd(11)} ${c.format.padEnd(5)} ${c.lang} ${(c.palette || '').padEnd(10)}`;
    console.log(`${R.fails.length ? 'FAIL' : 'ok  '}  ${tag} ${R.dur}s  提醒 ${R.warns.length}  (${((Date.now() - t0) / 1000).toFixed(0)}s)`);
    for (const m of R.fails) console.log('      FAIL ' + m);
    for (const m of R.warns) console.log('      WARN ' + m);
    if (R.fails.length) failed++;
    if (sheetsDir) {
      fs.mkdirSync(sheetsDir, { recursive: true });
      const { page, browser, F } = await openFilm(dir);
      await sheet(page, F.KEYS, path.join(sheetsDir, `${c.style}-${c.format.replace(':', 'x')}-${c.lang}.jpg`), F.W >= F.H ? 4 : 6);
      await browser.close();
    }
  }
  fs.rmSync(tmp, { recursive: true, force: true });
  console.log(failed ? `\n${failed} 组不通过` : `\n全部通过（${cases.length} 组）`);
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error(e.stack || e.message); process.exit(2); });
