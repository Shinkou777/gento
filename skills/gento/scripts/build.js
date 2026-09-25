#!/usr/bin/env node
// 幻燈 GENTO · 构建：film.json + film.js + 引擎 + 选中的风格包 → 单个自带一切的 film.html
//   node build.js <片子目录>            → <片子目录>/film.html
//   node build.js <片子目录> --out x.html
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const FORMATS = { '16:9': [1920, 1080], '9:16': [1080, 1920], '1:1': [1080, 1080], '4:5': [1080, 1350] };
const readJSON = p => JSON.parse(fs.readFileSync(p, 'utf8'));

function resolveConfig(dir) {
  const film = readJSON(path.join(dir, 'film.json'));
  const styles = readJSON(path.join(ROOT, 'styles/catalog.json'));
  const music = readJSON(path.join(ROOT, 'music/catalog.json'));
  const style = film.style || 'riso';
  if (!styles[style]) throw new Error(`没有这个风格：${style}（可选：${Object.keys(styles).join(' / ')}）`);
  const S = styles[style];
  const mus = film.music || S.music;
  if (!music[mus]) throw new Error(`没有这个音乐预设：${mus}（可选：${Object.keys(music).join(' / ')}）`);
  const fmt = film.format || '16:9';
  if (!FORMATS[fmt]) throw new Error(`画幅只支持 ${Object.keys(FORMATS).join(' / ')}`);
  const [W, H] = FORMATS[fmt];
  const lang = film.lang || 'zh', subs = (film.subs || []).filter(l => l !== lang);
  const palette = film.palette || Object.keys(S.palettes)[0];
  if (!S.palettes[palette]) throw new Error(`${style} 没有色调 ${palette}（可选：${Object.keys(S.palettes).join(' / ')}）`);
  return {
    title: film.title || path.basename(dir), note: film.note || '', format: fmt, W, H,
    fps: film.fps || 30, lang, subs, style, palette, music: mus, bpm: film.bpm || music[mus].bpm, pace: film.pace || S.pace || 'standard', seed: film.seed || 4242,
    fontsHref: 'https://fonts.googleapis.com/css2?' + [...new Set([...(S.fonts[lang] || S.fonts.zh), ...subs.flatMap(l => S.fonts[l] || []), ...(S.fonts.common || [])])].map(f => 'family=' + f).join('&') + '&display=swap',
  };
}

function build(dir, out) {
  dir = path.resolve(dir);
  const cfg = resolveConfig(dir);
  const src = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
  const fj = JSON.parse(fs.readFileSync(path.join(dir, 'film.json'), 'utf8'));
  const filmJs = fs.readFileSync(fj.script ? path.resolve(dir, fj.script) : path.join(dir, 'film.js'), 'utf8');
  // 图片素材：film.json 的 assets 表，内联进单文件 HTML
  const MIME = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp' };
  const assets = Object.fromEntries(Object.entries(fj.assets || {}).map(([k, f]) => {
    const p = path.resolve(dir, f), ext = path.extname(p).slice(1).toLowerCase();
    if (!MIME[ext]) throw new Error(`素材格式不支持：${f}（只收 jpg / png / webp）`);
    return [k, `data:${MIME[ext]};base64,${fs.readFileSync(p).toString('base64')}`];
  }));
  const script = [
    '(() => {',
    `const CFG = ${JSON.stringify(cfg)};`,
    `const ASSETS = ${JSON.stringify(assets)};`,
    src('engine/core.js'), src('engine/kit.js'), src('engine/components.js'),
    src(`styles/${cfg.style}/style.js`),
    src('engine/resolve.js'), src('engine/synth.js'), src('music/presets.js'), src('scenes/library.js'),
    '/* ===== film.js ===== */', filmJs,
    src('engine/boot.js'),
    '})();',
  ].join('\n');
  const html = src('engine/shell.html')
    .replace('{{LANG}}', cfg.lang === 'zh' ? 'zh-CN' : cfg.lang)
    .replace('{{TITLE}}', cfg.title.replace(/</g, '&lt;'))
    .replace('{{FONTS}}', cfg.fontsHref)
    .replace('{{AR}}', `${cfg.W} / ${cfg.H}`).replace('{{ARN}}', String(cfg.W / cfg.H))
    .replace('{{SCRIPT}}', () => script);
  const file = out ? path.resolve(out) : path.join(dir, 'film.html');
  fs.writeFileSync(file, html);
  return { file, cfg };
}

module.exports = { build, resolveConfig, FORMATS, ROOT };

if (require.main === module) {
  const args = process.argv.slice(2), dir = args.find(a => !a.startsWith('--'));
  if (!dir) { console.error('用法：node build.js <片子目录> [--out film.html]'); process.exit(1); }
  const i = args.indexOf('--out');
  const { file, cfg } = build(dir, i >= 0 ? args[i + 1] : null);
  console.log(`构建：${file}（${cfg.style}/${cfg.palette} · ${cfg.music} ${cfg.bpm} BPM · ${cfg.W}×${cfg.H} · ${cfg.fps} fps · ${cfg.lang}）`);
}
