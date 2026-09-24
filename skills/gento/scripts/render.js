#!/usr/bin/env node
// 幻燈 GENTO · 导出
//   node render.js <片子目录>                → 先构建，再出 <out>/<name>.mp4（带配乐）
//   node render.js <片子目录> --sheet        → <out>/<name>-sheet.jpg 联系表（每场两帧）
//   node render.js <片子目录> --stills --t 3.2,8.4 → <out>/stills/*.jpg
//   选项：--out DIR（默认片子目录） --name NAME（默认 film.json 的 title）
// 环境：CHROME_PATH / FFMPEG_PATH 可指定程序位置
const puppeteer = require('puppeteer-core');
const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { build } = require('./build');

const CHROME = {
  darwin: ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/Applications/Chromium.app/Contents/MacOS/Chromium'],
  linux: ['/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium', '/usr/bin/chromium-browser'],
  win32: ['C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'],
};
const chromePath = () => process.env.CHROME_PATH || (CHROME[process.platform] || []).find(p => fs.existsSync(p));
const which = c => { try { return execSync(`command -v ${c}`).toString().trim() || null; } catch { return null; } };

// 打开片子页面，返回 { page, browser, F }
async function openFilm(target) {
  let html = target;
  if (fs.statSync(target).isDirectory()) html = build(target).file;
  const exe = chromePath(); if (!exe) throw new Error('找不到 Chrome，设 CHROME_PATH');
  const browser = await puppeteer.launch({ executablePath: exe, headless: 'new', args: ['--allow-file-access-from-files', '--disable-web-security'] });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', e => { errors.push(e.message); console.error('页面报错', e.message); });
  await page.goto('file://' + path.resolve(html) + '?export=1', { waitUntil: 'networkidle0', timeout: 90000 });
  await page.evaluate(() => window.__film.ready);
  const F = await page.evaluate(() => ({ DUR: window.__film.DUR, KEYS: window.__film.KEYS, W: window.__film.W, H: window.__film.H, FPS: window.__film.FPS, CFG: window.__film.CFG }));
  await page.setViewport({ width: Math.min(F.W, 1920), height: Math.min(F.H, 1920) });
  return { page, browser, F, html, errors };
}
const grab = (page, t, q = .93) => page.evaluate((t, q) => { window.__film.renderAt(t); return document.getElementById('c').toDataURL('image/jpeg', q).split(',')[1]; }, t, q);

async function sheet(page, times, file, cols = 4) {
  const b64 = await page.evaluate((times, cols) => {
    const f = window.__film, src = document.getElementById('c');
    const cw = f.W >= f.H ? 480 : 270, ch = Math.round(cw * f.H / f.W), lh = 30, rows = Math.ceil(times.length / cols);
    const c = document.createElement('canvas'); c.width = cols * cw + (cols + 1) * 8; c.height = rows * (ch + lh) + (rows + 1) * 8;
    const g = c.getContext('2d'); g.fillStyle = '#111'; g.fillRect(0, 0, c.width, c.height);
    times.forEach((t, i) => {
      f.renderAt(t);
      const x = 8 + (i % cols) * (cw + 8), y = 8 + Math.floor(i / cols) * (ch + lh + 8);
      g.drawImage(src, x, y, cw, ch);
      g.fillStyle = '#ddd'; g.font = '600 16px "IBM Plex Mono", monospace'; g.textBaseline = 'middle';
      g.fillText(`${t.toFixed(2)}s  ${f.sceneAt(t)}`, x + 4, y + ch + lh / 2);
    });
    return c.toDataURL('image/jpeg', 0.9).split(',')[1];
  }, times, cols);
  fs.writeFileSync(file, Buffer.from(b64, 'base64'));
  return file;
}

async function mp4(page, F, file) {
  const ff = process.env.FFMPEG_PATH || which('ffmpeg') || (() => { try { return require('ffmpeg-static'); } catch { return null; } })();
  if (!ff) throw new Error('找不到 ffmpeg（brew install ffmpeg 或设 FFMPEG_PATH）');
  const wavPath = path.join(os.tmpdir(), `gento-${process.pid}.wav`);
  fs.writeFileSync(wavPath, Buffer.from(await page.evaluate(() => window.__film.wavBase64(window.__film.synth())), 'base64'));
  const p = spawn(ff, ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(F.FPS), '-c:v', 'mjpeg', '-i', '-',
    '-i', wavPath, '-c:v', 'libx264', '-preset', 'slow', '-crf', '20', '-maxrate', '16M', '-bufsize', '32M', '-pix_fmt', 'yuv420p', '-r', String(F.FPS),
    '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', file], { stdio: ['pipe', 'ignore', 'inherit'] });
  const total = Math.round(F.DUR * F.FPS);
  try {
    for (let f = 0; f < total; f++) {
      const buf = Buffer.from(await grab(page, f / F.FPS), 'base64');
      if (!p.stdin.write(buf)) await new Promise(r => p.stdin.once('drain', r));
      if (f % 300 === 0) console.log(`帧 ${f}/${total}`);
    }
  } catch (e) {
    p.stdin.destroy(); p.kill('SIGKILL'); fs.rmSync(file, { force: true }); fs.rmSync(wavPath, { force: true });
    throw new Error(`导出中途出错，已删掉半截文件：${e.message}`);
  }
  p.stdin.end();
  const code = await new Promise(r => p.on('close', r));
  fs.rmSync(wavPath, { force: true });
  if (code !== 0) throw new Error('ffmpeg 退出码 ' + code);
  return file;
}

module.exports = { openFilm, sheet, mp4, grab };

if (require.main === module) {
  (async () => {
    const args = process.argv.slice(2);
    const has = f => args.includes(f), opt = (f, d) => { const i = args.indexOf(f); return i >= 0 && args[i + 1] ? args[i + 1] : d; };
    const target = args.find(a => !a.startsWith('--') && fs.existsSync(a));
    if (!target) { console.error('用法：node render.js <片子目录|film.html> [--sheet | --stills --t 1,2] [--out DIR] [--name NAME]'); process.exit(1); }
    const { page, browser, F } = await openFilm(target);
    const outDir = path.resolve(opt('--out', fs.statSync(target).isDirectory() ? target : path.dirname(target)));
    fs.mkdirSync(outDir, { recursive: true });
    const name = opt('--name', (F.CFG.title || 'film').replace(/[\/\\:*?"<>|]/g, '-'));
    const times = opt('--t') ? opt('--t').split(',').map(Number) : F.KEYS;
    try {
      if (has('--sheet')) console.log('联系表：' + await sheet(page, times, path.join(outDir, `${name}-sheet.jpg`), +opt('--cols', F.W >= F.H ? 4 : 6)));
      else if (has('--stills')) {
        const SD = path.join(outDir, 'stills'); fs.mkdirSync(SD, { recursive: true });
        for (const t of times) fs.writeFileSync(path.join(SD, `${t.toFixed(2).padStart(5, '0')}.jpg`), Buffer.from(await grab(page, t), 'base64'));
        console.log('静帧：' + SD);
      } else {
        const file = await mp4(page, F, path.join(outDir, `${name}.mp4`));
        console.log(`完成：${file}（${F.W}×${F.H} · ${F.FPS} fps · ${F.DUR.toFixed(2)} 秒）`);
      }
    } finally { await browser.close(); }
  })().catch(e => { console.error(e.message); process.exit(1); });
}
