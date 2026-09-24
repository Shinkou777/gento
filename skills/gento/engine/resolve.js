/* 幻燈 GENTO · engine/resolve.js — 风格包载入后，定下调色 C 和字体角色 F */
const C = Object.assign({ white: '#FFFDF6', shadow: '#1C1B22', skin: '#F2C9A8', wood: '#E9C58C', muted: '#8B857A' },
  STYLE.palettes[CFG.palette] || Object.values(STYLE.palettes)[0]);
const F = Object.assign({}, STYLE.fonts.zh, STYLE.fonts[LANG] || {});
// 三语同屏：副标语言各用自己的正文字体
const FSUB = Object.fromEntries((CFG.subs || []).map(l => [l, (STYLE.fonts[l] || STYLE.fonts.zh).sub || (STYLE.fonts[l] || STYLE.fonts.zh).body]));
