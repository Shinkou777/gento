// 午高峰外卖大战：日式夸张动画风的外卖赛车
// 168 BPM（高速电摇），一拍 0.357 秒，一小节 1.43 秒，42 小节 = 60 秒。
// 24 fps；角色自身的动作一拍二（每秒 12 张姿势），镜头、位移、速度线逐帧走。
// 五支队伍取参考图里五位骑手的颜色：蓝、品红、红、橙、绿。人物、队名均为虚构。

const on2 = u => Math.floor(u * 12) / 12;
const TEAMS = {
  shark: { name: '蓝鲨', col: '#2E8BFF', ph: 0 },
  peach: { name: '桃红', col: '#E23BA0', ph: 1.3 },
  oni: { name: '赤鬼', col: '#FF3131', ph: 2.1 },
  cat: { name: '橘猫', col: '#FF8C1A', ph: 3.4 },
  frog: { name: '绿蛙', col: '#2BC456', ph: 4.2 },
};
const ROW = ['shark', 'peach', 'oni', 'cat', 'frog'];
const BODY = '#F4EEF9', PANTS = '#2B2140', SOUP = '#D9772B', NOODLE = '#FFE08A';

/* ---------- 画笔：本地坐标里画，描边宽度按本地单位 ---------- */
function ink(ctx, fill, lw = 7) {
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (lw) { ctx.lineWidth = lw; ctx.strokeStyle = C.line; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.stroke(); }
}
function pth(ctx, pts, close = true) { ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); if (close) ctx.closePath(); }
function box(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, Math.max(0, r)); }
function disk(ctx, x, y, r) { ctx.beginPath(); ctx.arc(x, y, Math.max(0, r), 0, Math.PI * 2); }
function oval(ctx, x, y, rx, ry, rot = 0) { ctx.beginPath(); ctx.ellipse(x, y, Math.max(0, rx), Math.max(0, ry), rot, 0, Math.PI * 2); }
// 带描边的粗线（四肢）
function limb(ctx, pts, w, col) {
  ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  pth(ctx, pts, false); ctx.strokeStyle = C.line; ctx.lineWidth = w + 14; ctx.stroke();
  ctx.strokeStyle = col; ctx.lineWidth = w; ctx.stroke(); ctx.restore();
}
// 队标：白圆里一个黑色小图形
function mark(ctx, key, cx, cy, r) {
  ctx.save(); ctx.translate(cx, cy);
  disk(ctx, 0, 0, r); ink(ctx, '#FFF6EA', 5);
  ctx.fillStyle = C.line;
  if (key === 'shark') { pth(ctx, [[-r * .55, r * .35], [r * .2, -r * .6], [r * .5, r * .35]]); ctx.fill(); }
  if (key === 'peach') { disk(ctx, 0, r * .12, r * .42); ctx.fill(); pth(ctx, [[0, -r * .25], [r * .45, -r * .62], [r * .2, -r * .15]]); ctx.fill(); }
  if (key === 'oni') { pth(ctx, [[-r * .6, r * .25], [-r * .38, -r * .62], [-r * .12, r * .25]]); ctx.fill(); pth(ctx, [[r * .12, r * .25], [r * .38, -r * .62], [r * .6, r * .25]]); ctx.fill(); }
  if (key === 'cat') { pth(ctx, [[-r * .55, r * .42], [-r * .5, -r * .55], [-r * .12, -r * .12], [r * .12, -r * .12], [r * .5, -r * .55], [r * .55, r * .42]]); ctx.fill(); }
  if (key === 'frog') { disk(ctx, -r * .3, 0, r * .26); ctx.fill(); disk(ctx, r * .3, 0, r * .26); ctx.fill(); ctx.fillStyle = '#FFF6EA'; disk(ctx, -r * .24, -r * .06, r * .09); ctx.fill(); disk(ctx, r * .36, -r * .06, r * .09); ctx.fill(); }
  ctx.restore();
}
// 尾焰（本地坐标，朝左喷）
function flame(ctx, x, y, len, p) {
  const L = len * (1 + .22 * Math.sin(p * 70));
  pth(ctx, [[x, y - 16], [x - L * .5, y - 26], [x - L * .38, y - 8], [x - L, y], [x - L * .38, y + 8], [x - L * .5, y + 26], [x, y + 16]]); ink(ctx, '#FF4F2E', 6);
  pth(ctx, [[x, y - 9], [x - L * .55, y - 5], [x - L * .4, y], [x - L * .55, y + 5], [x, y + 9]]); ink(ctx, '#FFE14D', 0);
}

/* ---------- 骑手：侧面（朝右），原点在两轮中间的地面 ---------- */
// o: { p 姿势时间, stretch, lean, wheelie, flame, wheel 轮子转角, face: calm|grin|shock|happy, skid, arm: 'up', still }
function riderSide(ctx, x, y, s, key, o = {}) {
  const tm = TEAMS[key], p = o.p ?? 0, bob = o.still ? 0 : Math.sin(p * 26 + tm.ph) * 3;
  ctx.save(); ctx.translate(x, y); ctx.scale(s * U, s * U);
  ctx.save(); ctx.globalAlpha = .3; ctx.fillStyle = C.line; oval(ctx, 0, 2, 135, 12); ctx.fill(); ctx.restore();
  if (o.skid) { ctx.save(); ctx.globalAlpha = .55; ctx.fillStyle = C.line; ctx.fillRect(-78 - o.skid, -4, o.skid, 8); ctx.fillRect(84 - o.skid * .7, -4, o.skid * .7, 8); ctx.restore(); }
  const st = o.stretch || 1; ctx.scale(st, 1 / st);
  if (o.wheelie) { ctx.translate(-78, 0); ctx.rotate(-o.wheelie); ctx.translate(78, 0); }
  if (o.lean) ctx.rotate(o.lean);
  if (o.flame) flame(ctx, -118, -52, o.flame, p);
  // 车轮
  for (const wx of [-78, 84]) {
    disk(ctx, wx, -30, 30); ink(ctx, C.line, 0); disk(ctx, wx, -30, 13); ink(ctx, '#D9D2E6', 5);
    const a = o.wheel || 0; ctx.save(); ctx.strokeStyle = '#D9D2E6'; ctx.lineWidth = 5; for (const k of [0, 1.05, 2.1]) { ctx.beginPath(); ctx.moveTo(wx + Math.cos(a + k) * 16, -30 + Math.sin(a + k) * 16); ctx.lineTo(wx + Math.cos(a + k) * 26, -30 + Math.sin(a + k) * 26); ctx.stroke(); } ctx.restore();
  }
  // 箱子（骑手身后）
  ctx.save(); ctx.translate(0, bob * .6); ctx.rotate(o.boxTilt || 0);
  box(ctx, -160, -222, 98, 106, 14); ink(ctx, tm.col);
  ctx.beginPath(); ctx.moveTo(-160, -196); ctx.lineTo(-62, -196); ctx.lineWidth = 6; ctx.strokeStyle = C.line; ctx.stroke();
  mark(ctx, key, -111, -154, 24);
  ctx.restore();
  // 车身
  pth(ctx, [[-120, -42], [-112, -92], [-40, -104], [-6, -74], [50, -70], [76, -46], [40, -36], [-70, -36]]); ink(ctx, BODY);
  pth(ctx, [[46, -66], [66, -66], [96, -150], [80, -160]]); ink(ctx, tm.col);
  box(ctx, -102, -118, 80, 18, 8); ink(ctx, C.line, 0);
  disk(ctx, 92, -136, 9); ink(ctx, '#FFE14D', 5);
  ctx.save(); ctx.lineCap = 'round'; ctx.strokeStyle = C.line; ctx.lineWidth = 12; ctx.beginPath(); ctx.moveTo(78, -164); ctx.lineTo(104, -172); ctx.stroke(); ctx.restore();
  // 骑手
  ctx.translate(0, bob);
  const tuck = o.tuck ?? (key === 'oni' ? 1 : .5);
  limb(ctx, [[-44, -116], [16, -108], [34, -60]], 26, PANTS);
  oval(ctx, 42, -58, 20, 11); ink(ctx, '#FFF6EA', 6);
  const sh = [18 + tuck * 10, -184 + tuck * 10];
  pth(ctx, [[-64, -112], [-22, -112], [sh[0] + 6, sh[1] + 10], [sh[0] - 36, sh[1] - 2]]); ink(ctx, tm.col);
  if (o.arm === 'up') limb(ctx, [[sh[0] - 12, sh[1]], [sh[0] + 4, sh[1] - 50], [sh[0] + 14, sh[1] - 100]], 22, tm.col);
  else limb(ctx, [[sh[0] - 12, sh[1]], [sh[0] + 30, sh[1] + 18], [86, -170]], 22, tm.col);
  const hx = sh[0] + 6, hy = sh[1] - 38;
  if (key === 'oni') { pth(ctx, [[hx - 22, hy - 24], [hx - 30, hy - 60], [hx - 6, hy - 32]]); ink(ctx, '#FFE14D', 6); pth(ctx, [[hx + 6, hy - 32], [hx + 18, hy - 64], [hx + 24, hy - 22]]); ink(ctx, '#FFE14D', 6); }
  if (key === 'cat') { pth(ctx, [[hx - 26, hy - 18], [hx - 24, hy - 50], [hx - 4, hy - 32]]); ink(ctx, tm.col, 6); pth(ctx, [[hx + 4, hy - 32], [hx + 20, hy - 50], [hx + 26, hy - 18]]); ink(ctx, tm.col, 6); }
  if (key === 'frog') { disk(ctx, hx - 14, hy - 32, 12); ink(ctx, '#FFF6EA', 6); disk(ctx, hx + 12, hy - 32, 12); ink(ctx, '#FFF6EA', 6); disk(ctx, hx - 12, hy - 32, 5); ink(ctx, C.line, 0); disk(ctx, hx + 14, hy - 32, 5); ink(ctx, C.line, 0); }
  if (key === 'shark') { pth(ctx, [[hx - 18, hy - 30], [hx - 2, hy - 64], [hx + 10, hy - 30]]); ink(ctx, tm.col, 6); }
  disk(ctx, hx, hy, 36); ink(ctx, tm.col);
  ctx.save(); ctx.globalAlpha = .45; ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(hx, hy, 24, 3.6, 4.6); ctx.stroke(); ctx.restore();
  oval(ctx, hx + 18, hy + 2, 22, 14); ink(ctx, C.line, 0);
  face(ctx, hx + 18, hy + 2, o.face || (key === 'oni' ? 'grin' : 'calm'), p);
  ctx.restore();
}
// 面罩里的表情
function face(ctx, x, y, kind, p) {
  ctx.save(); ctx.fillStyle = '#FFF6EA'; ctx.strokeStyle = '#FFF6EA'; ctx.lineCap = 'round';
  if (kind === 'grin') {
    ctx.fillStyle = '#FFE14D'; pth(ctx, [[x - 14, y - 7], [x - 2, y - 2], [x - 14, y + 1]]); ctx.fill(); pth(ctx, [[x + 3, y - 2], [x + 16, y - 8], [x + 15, y + 1]]); ctx.fill();
    ctx.fillStyle = '#FFF6EA'; pth(ctx, [[x - 8, y + 18], [x + 22, y + 14], [x + 20, y + 24], [x - 4, y + 26]]); ctx.fill(); ctx.strokeStyle = C.line; ctx.lineWidth = 3; ctx.stroke();
    ctx.beginPath(); for (let i = 0; i < 4; i++) { ctx.moveTo(x - 2 + i * 6, y + 16); ctx.lineTo(x - 2 + i * 6, y + 25); } ctx.stroke();
  } else if (kind === 'shock') { disk(ctx, x - 8, y, 6); ctx.fill(); disk(ctx, x + 9, y, 6); ctx.fill(); }
  else if (kind === 'happy') { ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(x - 8, y + 3, 5, 3.4, 6.0); ctx.moveTo(x + 14, y + 3); ctx.arc(x + 9, y + 3, 5, 3.4, 6.0); ctx.stroke(); }
  else { ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x - 13, y); ctx.lineTo(x - 3, y - 1); ctx.moveTo(x + 4, y - 1); ctx.lineTo(x + 14, y); ctx.stroke(); }
  ctx.restore();
}

/* ---------- 骑手：俯视（朝右），开头和结尾的路口 ---------- */
function riderTop(ctx, x, y, s, key, o = {}) {
  const tm = TEAMS[key], p = o.p ?? 0, j = Math.sin(p * 22 + tm.ph) * 2;
  ctx.save(); ctx.translate(x + j, y); ctx.rotate(o.rot || 0); ctx.scale(s, s);
  ctx.save(); ctx.globalAlpha = .3; ctx.fillStyle = C.line; box(ctx, -110, -22, 214, 72, 26); ctx.fill(); ctx.restore();
  box(ctx, -96, -26, 196, 52, 24); ink(ctx, BODY);
  ctx.save(); ctx.lineCap = 'round'; ctx.strokeStyle = C.line; ctx.lineWidth = 12; ctx.beginPath(); ctx.moveTo(72, -46); ctx.lineTo(72, 46); ctx.stroke(); ctx.restore();
  box(ctx, -130, -46, 88, 92, 12); ink(ctx, tm.col);
  mark(ctx, key, -86, 0, 26);
  if (o.soup) { ctx.save(); ctx.fillStyle = SOUP; ctx.globalAlpha = .9; for (let i = 0; i < 5; i++) { oval(ctx, -120 + i * 20, 42 + (i % 2) * 8, 10, 6 + (i % 3) * 3); ctx.fill(); } ctx.restore(); }
  limb(ctx, [[4, -24], [40, -40], [70, -42]], 16, tm.col); limb(ctx, [[4, 24], [40, 40], [70, 42]], 16, tm.col);
  oval(ctx, 0, 0, 30, 42); ink(ctx, tm.col);
  if (key === 'oni') { pth(ctx, [[10, -18], [-8, -40], [22, -26]]); ink(ctx, '#FFE14D', 5); pth(ctx, [[10, 18], [-8, 40], [22, 26]]); ink(ctx, '#FFE14D', 5); }
  disk(ctx, 14, 0, 27); ink(ctx, tm.col);
  ctx.save(); ctx.globalAlpha = .5; ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(14, 0, 17, 3.6, 4.7); ctx.stroke(); ctx.restore();
  if (o.noodle) { ctx.save(); ctx.strokeStyle = C.line; ctx.lineWidth = 11; ctx.lineCap = 'round'; ctx.beginPath(); for (let i = 0; i <= 12; i++) { const xx = -8 + i * 4, yy = -30 + i * 5 + Math.sin(i * 1.3) * 6; i ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy); } ctx.stroke(); ctx.strokeStyle = NOODLE; ctx.lineWidth = 6; ctx.stroke(); ctx.restore(); }
  ctx.restore();
}

/* ---------- 骑手：背面（追拍） ---------- */
function riderBack(ctx, x, y, s, key, o = {}) {
  const tm = TEAMS[key], p = o.p ?? 0;
  ctx.save(); ctx.translate(x, y); ctx.scale(s * U, s * U); ctx.rotate(o.tilt || 0);
  ctx.save(); ctx.globalAlpha = .3; ctx.fillStyle = C.line; oval(ctx, 0, 2, 70, 12); ctx.fill(); ctx.restore();
  box(ctx, -16, -64, 32, 66, 12); ink(ctx, C.line, 0);
  if (o.flame) { ctx.save(); ctx.translate(-40, -52); ctx.rotate(Math.PI / 2); flame(ctx, 0, 0, o.flame * .6, p); ctx.restore(); }
  pth(ctx, [[-58, -40], [-50, -84], [50, -84], [58, -40]]); ink(ctx, BODY);
  box(ctx, -26, -66, 52, 12, 5); ink(ctx, '#FF4F2E', 5);
  oval(ctx, 0, -176, 84, 34); ink(ctx, tm.col);
  const bj = o.boxJolt || 0;
  ctx.save(); ctx.translate(0, -150); ctx.rotate(bj); ctx.translate(0, bj * 60);
  box(ctx, -66, -74, 132, 120, 16); ink(ctx, tm.col);
  ctx.beginPath(); ctx.moveTo(-66, -48); ctx.lineTo(66, -48); ctx.lineWidth = 6; ctx.strokeStyle = C.line; ctx.stroke();
  mark(ctx, key, 0, -2, 34);
  ctx.restore();
  pth(ctx, [[-28, -258], [-40, -300], [-10, -270]]); ink(ctx, '#FFE14D', 6); pth(ctx, [[10, -270], [40, -300], [28, -258]]); ink(ctx, '#FFE14D', 6);
  disk(ctx, 0, -250, 36); ink(ctx, tm.col);
  ctx.restore();
}

/* ---------- 布景 ---------- */
// 侧面街景：天空色带、半个太阳、两层城市剪影、路面、车道线、近处护栏
function sideStage(ctx, t, scroll, o = {}) {
  const hz = H * .46;
  const b = C.bands, hh = hz / b.length; b.forEach((c, i) => { ctx.fillStyle = c; ctx.fillRect(0, i * hh - 1, W, hh + 2); });
  ctx.save(); ctx.lineWidth = 7 * U; disk(ctx, W * .7, hz, 200 * U); ctx.fillStyle = '#FFE14D'; ctx.fill(); ctx.strokeStyle = C.line; ctx.stroke();
  for (let i = 0; i < 5; i++) { ctx.fillStyle = b[3 + (i % 2)] || C.a1; ctx.fillRect(W * .7 - 210 * U, hz - (30 + i * 34) * U, 420 * U, (6 + i * 2) * U); }
  ctx.restore();
  city(ctx, hz, scroll * .12, 11, '#6B2E86', 90);
  city(ctx, hz, scroll * .3, 23, '#3E1757', 150);
  ctx.fillStyle = C.road; ctx.fillRect(0, hz, W, H - hz);
  ctx.fillStyle = C.line; ctx.fillRect(0, hz - 4 * U, W, 12 * U);
  // 车道虚线
  ctx.fillStyle = '#FFF1E0';
  for (const f of [.66, .82]) { const y = hz + (H - hz) * f, seg = 300 * U, off = -(scroll % seg); for (let x = off; x < W; x += seg) ctx.fillRect(x, y, seg * .5, (6 + f * 8) * U); }
  if (o.rail !== false) { const seg = 420 * U, off = -((scroll * 1.6) % seg); ctx.fillStyle = C.line; for (let x = off; x < W + seg; x += seg) { ctx.fillRect(x, H - 150 * U, 22 * U, 150 * U); } ctx.fillRect(0, H - 150 * U, W, 20 * U); ctx.fillStyle = '#FFF1E0'; ctx.fillRect(0, H - 146 * U, W, 8 * U); }
}
function city(ctx, hz, scroll, seed, col, hmax) {
  const tile = 1400 * U, off = -(scroll % tile);
  ctx.save(); ctx.fillStyle = col; ctx.strokeStyle = C.line; ctx.lineWidth = 5 * U;
  for (let k = -1; k < 3; k++) {
    let x = off + k * tile;
    for (let i = 0; i < 14; i++) {
      const w = (60 + hash(seed + i) * 70) * U, h = (40 + hash(seed + i * 3.7) * hmax) * U;
      ctx.beginPath(); ctx.rect(x, hz - h, w, h + 4 * U); ctx.fill(); ctx.stroke();
      ctx.save(); ctx.fillStyle = '#FFE14D'; ctx.globalAlpha = .75; for (let r = 0; r < 3; r++) for (let c = 0; c < 2; c++) if (hash(seed + i * 11 + r * 3 + c) > .55 && h > (20 + r * 22) * U) ctx.fillRect(x + (12 + c * 26) * U, hz - h + (12 + r * 22) * U, 12 * U, 10 * U); ctx.restore();
      x += w + 6 * U; if (x > off + (k + 1) * tile) break;
    }
  }
  ctx.restore();
}
// 侧面红绿灯：竖箱三盏灯
function lightSide(ctx, x, yg, s, state) {
  ctx.save(); ctx.translate(x, yg); ctx.scale(s * U, s * U);
  box(ctx, -9, -520, 18, 520, 6); ink(ctx, '#2A2240', 6);
  box(ctx, -46, -690, 92, 230, 20); ink(ctx, '#2A2240');
  const cols = { red: '#FF3131', yellow: '#FFD23F', green: '#3DFF7A' };
  ['red', 'yellow', 'green'].forEach((c, i) => {
    const on = state === c, cy = -652 + i * 76;
    if (on) { ctx.save(); ctx.globalAlpha = .35; disk(ctx, 0, cy, 70); ctx.fillStyle = cols[c]; ctx.fill(); ctx.restore(); }
    disk(ctx, 0, cy, 28); ink(ctx, on ? cols[c] : '#4A3F5E', 5);
  });
  ctx.restore();
}
// 俯视路口：斑马线、隔离桩、红绿灯、弯路灯
function crossing(ctx, state, o = {}) {
  ctx.fillStyle = C.road; ctx.fillRect(-3000, -3000, 6000, 6000);
  ctx.save(); ctx.globalAlpha = .12; ctx.fillStyle = '#FFFFFF'; for (let i = 0; i < 90; i++) { disk(ctx, (hash(i) - .5) * 2400, (hash(i + 9) - .5) * 1800, 3 + hash(i + 5) * 5); ctx.fill(); } ctx.restore();
  for (let yb = -1100; yb < 1100; yb += 92) { box(ctx, 130, yb, 360, 50, 8); ink(ctx, '#FFF1E0', 5); }
  ctx.fillStyle = '#FFF1E0'; ctx.fillRect(84, -1100, 14, 2200);
  pth(ctx, [[620, 470], [1600, 470], [1600, 1400], [620, 1400]]); ink(ctx, C.bg2, 8);
  for (const y of [-225, -75, 75, 225]) { ctx.save(); ctx.globalAlpha = .3; disk(ctx, 104, y + 10, 14); ctx.fillStyle = C.line; ctx.fill(); ctx.restore(); disk(ctx, 96, y, 14); ink(ctx, '#FFF6EA', 5); disk(ctx, 96, y, 7); ink(ctx, '#FF3131', 0); }
  // 弯路灯
  ctx.save(); ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-60, 1100); ctx.quadraticCurveTo(-20, 200, 240, -40);
  ctx.strokeStyle = C.line; ctx.lineWidth = 26; ctx.stroke(); ctx.strokeStyle = '#FFF6EA'; ctx.lineWidth = 14; ctx.stroke();
  ctx.restore();
  ctx.save(); ctx.translate(250, -50); ctx.rotate(-.7); oval(ctx, 0, 0, 58, 26); ink(ctx, '#FFF6EA'); ctx.restore();
  // 红绿灯杆（带影子）
  ctx.save(); ctx.globalAlpha = .3; ctx.fillStyle = C.line; box(ctx, 640, 250, 70, 230, 20); ctx.fill(); ctx.restore();
  box(ctx, 600, 200, 76, 230, 20); ink(ctx, '#2A2240');
  const cols = { red: '#FF3131', green: '#3DFF7A' };
  [['red', 250], ['yellow', 315], ['green', 380]].forEach(([c, y]) => { const on = state === c; if (on) { ctx.save(); ctx.globalAlpha = .35; disk(ctx, 638, y, 62); ctx.fillStyle = cols[c]; ctx.fill(); ctx.restore(); } disk(ctx, 638, y, 24); ink(ctx, on ? cols[c] : '#4A3F5E', 5); });
}
// 放射速度线（冲刺隧道）
function tunnel(ctx, cx, cy, t, col) {
  ctx.save(); ctx.strokeStyle = col; ctx.lineCap = 'round';
  for (let i = 0; i < 90; i++) {
    const a = hash(i) * Math.PI * 2, life = (hash(i + 3) + t * (1.2 + hash(i + 7))) % 1, r0 = (60 + life * life * 1400) * U, len = (80 + life * 500) * U;
    ctx.globalAlpha = .25 + .6 * life; ctx.lineWidth = (2 + life * 10) * U;
    ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0); ctx.lineTo(cx + Math.cos(a) * (r0 + len), cy + Math.sin(a) * (r0 + len)); ctx.stroke();
  }
  ctx.restore();
}
// 横向速度线
function speedLines(ctx, t, o = {}) {
  const n = o.n || 36, sp = (o.speed || 2600) * U, span = W + 900 * U;
  ctx.save(); ctx.strokeStyle = o.color || '#FFF6EA'; ctx.lineCap = 'round';
  for (let i = 0; i < n; i++) {
    const y = (o.y0 ?? 0) + hash(i * 3.3) * (o.h ?? H), len = (140 + hash(i * 7.1) * 420) * U;
    const x = W + 450 * U - ((hash(i) * span + t * sp * (.6 + hash(i * 2) * .8)) % span);
    ctx.globalAlpha = (o.alpha ?? .6) * (.35 + .65 * hash(i * 5)); ctx.lineWidth = (2 + hash(i * 9) * 5) * U;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + len, y); ctx.stroke();
  }
  ctx.restore();
}
// 烟团（屏幕坐标）
function puff(ctx, x, y, r, k, seed = 0) {
  if (k <= 0 || k >= 1) return;
  const rr_ = r * (.45 + k * .8);
  ctx.save(); ctx.globalAlpha = 1 - k * k;
  for (let i = 0; i < 4; i++) { const a = seed + i * 1.7; disk(ctx, x + Math.cos(a) * rr_ * .7, y + Math.sin(a) * rr_ * .3 - k * r * .6, rr_ * (.55 + .2 * (i % 2))); ink(ctx, '#FFF6EA', 5 * U); }
  ctx.restore();
}
// 拟声大字：歪着砸进来
function sfx(ctx, s, x, y, u, t0, o = {}) { STYLE.hit(ctx, s, x, y, u, t0, { size: (o.size || 200) * U, align: o.align || 'center', color: o.color || C.a3, rot: o.rot ?? -.12, g: o.g || 'sfx' }); }
// 对白气泡
function say(ctx, s, x, y, u, t0, t1, o = {}) {
  if (u < t0 || u > t1) return;
  const k = eBack(P(u, t0, t0 + .22)), size = (o.size || 46) * U, w = tw(ctx, s, size, F.head) + 70 * U, h = size + 50 * U;
  ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
  bubble(ctx, 0, 0, w, h, o.tx ?? -w * .3, o.ty ?? h, {});
  text(ctx, s, 0, 2 * U, { size, font: F.head, color: C.fg, g: 'say' + s });
  ctx.restore();
}
// 名牌
function tag(ctx, key, x, y, k) {
  if (k <= 0) return;
  const tm = TEAMS[key], size = 44 * U, w = tw(ctx, tm.name, size, F.head) + 56 * U, h = 70 * U;
  ctx.save(); ctx.translate(x, y); ctx.scale(eBack(k), eBack(k));
  box(ctx, -w / 2 + 8 * U, -h / 2 + 10 * U, w, h, 18 * U); ctx.fillStyle = C.line; ctx.fill();
  pth(ctx, [[-14 * U, h / 2 - 2 * U], [14 * U, h / 2 - 2 * U], [0, h / 2 + 22 * U]]); ink(ctx, tm.col, 6 * U);
  box(ctx, -w / 2, -h / 2, w, h, 18 * U); ink(ctx, tm.col, 6 * U);
  text(ctx, tm.name, 0, 2 * U, { size, font: F.head, color: '#FFF6EA', stroke: C.line, strokeW: 9 * U, g: 'tag' + key });
  ctx.restore();
}
// 世界坐标换屏幕坐标
const toScreen = (ctx, x, y) => { const p = ctx.getTransform().transformPoint(new DOMPoint(x, y)); return [p.x, p.y]; };

/* ---------- 音效 ---------- */
const SND = {
  rev(k, t, len = .5, f0 = 55, f1 = 150, g = .6) { let ph = 0; const fl = new k.SVF(); k.add(t, len, x => { const f = f0 + (f1 - f0) * (x / len); ph = (ph + f / SR) % 1; return fl.run(Math.tanh((2 * ph - 1) * 4), 1000, .5).lp * Math.min(1, x * 40) * Math.min(1, (len - x) * 8) * .35; }, { g, pan: -.2 }); },
  honk(k, t, g = .7) { for (const f of [415.3, 523.25]) { let ph = 0; k.add(t, .5, x => { ph = (ph + f / SR) % 1; return (ph < .5 ? 1 : -1) * .07 * Math.min(1, x * 80) * Math.min(1, (.5 - x) * 30); }, { g, pan: .5 }); } },
  skid(k, t, len = .5, g = .5) { const fl = new k.SVF(); k.add(t, len, x => fl.run(k.rnd(), 2400 + 900 * Math.sin(x * 45), .25).bp * Math.min(1, x * 30) * Math.min(1, (len - x) * 6) * .55, { g, pan: .15 }); },
  whistle(k, t, len = .9, f0 = 1500, f1 = 280, g = .6) { let ph = 0; k.add(t, len, x => { const f = f0 * Math.pow(f1 / f0, x / len); ph += 2 * Math.PI * f * (1 + .012 * Math.sin(x * 38)) / SR; return Math.sin(ph) * .22 * Math.min(1, x * 30) * Math.min(1, (len - x) * 8); }, { g, rv: .2 }); },
  splash(k, t, g = 1) { k.noiseHit(t, 1.3, 1500, g * 1.3, .5); k.whoosh(t - .05, .7, g); k.boom(t, g * .45); },
  slosh(k, t, g = .6) { const fl = new k.SVF(); k.add(t, .32, x => fl.run(k.rnd(), 450 + 350 * Math.sin(x * 22), .7).bp * Math.sin(Math.PI * x / .32) * .7, { g }); },
  beep(k, t, f = 1760, g = .7) { k.bell(t, f, g, .3); },
};

/* ---------- 场景 ---------- */
const LANE_Y = [.6, .69, .78, .88, .99], LANE_S = [.8, .95, 1.1, 1.28, 1.48];
// 镜头：绕画面中心歪斜、推拉（放大到盖住转角）
function cam(ctx, tilt, z, fn) { ctx.save(); ctx.translate(W / 2, H / 2); ctx.rotate(tilt); ctx.scale(z, z); ctx.translate(-W / 2, -H / 2); fn(); ctx.restore(); }
const laneY = l => lerp(LANE_Y[Math.floor(clamp(l, 0, 3.999))], LANE_Y[Math.ceil(clamp(l, 0, 4))], l % 1) * H;
const laneS = l => lerp(LANE_S[Math.floor(clamp(l, 0, 3.999))], LANE_S[Math.ceil(clamp(l, 0, 4))], l % 1);
// 侧面五人：后排先画
function pack(ctx, list) { list.slice().sort((a, b) => a.lane - b.lane).forEach(r => riderSide(ctx, r.x, laneY(r.lane) + (r.dy || 0), laneS(r.lane) * (r.s || 1), r.key, r.o || {})); }
const SIDE_LANE = { frog: 0, cat: 1, oni: 2, shark: 3, peach: 4 };

// 1 路口集结：俯视，片名砸下，名牌一拍一个，最后推到赤鬼
const sGrid = T.custom((ctx, u, d, t) => {
  const p = on2(u), cam = u < 12 * BT ? { rot: lerp(-.5, -.44, u / d), z: lerp(1.15, 1.36, eIO(clamp(u / (12 * BT)))), x: 110, y: 0 } : { rot: -.44, z: lerp(1.36, 2.2, eIO(P(u, 12 * BT, 13.2 * BT))), x: lerp(110, 30, eIO(P(u, 12 * BT, 13.2 * BT))), y: 0 };
  ctx.save(); ctx.translate(W / 2, H / 2); ctx.rotate(cam.rot); ctx.scale(cam.z * U, cam.z * U); ctx.translate(-cam.x, -cam.y);
  crossing(ctx, 'red');
  const pos = ROW.map((k, i) => [[-20, 10, 0, 15, -10][i], -300 + i * 150]);
  ROW.forEach((k, i) => riderTop(ctx, pos[i][0], pos[i][1], 1, k, { p }));
  const scr = pos.map(([x, y]) => toScreen(ctx, x, y));
  ctx.restore();
  // 片名：第一拍砸下，第七拍往上飞走
  const out = eIn(P(u, 6 * BT, 7 * BT));
  if (u < 7 * BT) { ctx.save(); ctx.translate(0, -out * H * .5); sfx(ctx, '午高峰外卖大战', W / 2, H * .2, u, 0, { size: 150, rot: -.06, g: 'title' }); ctx.restore(); }
  ROW.forEach((k, i) => { if (u < 12 * BT || k === 'oni') tag(ctx, k, scr[i][0], scr[i][1] - (k === 'oni' && u > 12 * BT ? 170 : 105) * U * cam.z, P(u, (7 + i) * BT, (7 + i) * BT + .25)); });
  if (u > 13 * BT) { const [x, y] = scr[2]; say(ctx, '冠军归我！', x + 330 * U, y - 60 * U, u, 13 * BT, d, { size: 64, tx: -200 * U, ty: 60 * U }); }
}, {
  kind: 'open', hud: false, bg: { tone: 'base' },
  cues(k, t0) { k.hit(t0, 1.2); ROW.forEach((_, i) => k.pop(t0 + (7 + i) * BT, .8)); k.raw.boing(t0 + 12 * BT, .7); k.pop(t0 + 13 * BT, .7); },
  imp: d => [[0, .9]],
});

// 2 倒数：五格斜切特写，一拍滑进一个，三、二、一、冲
const sCount = T.custom((ctx, u, d, t) => {
  const p = on2(u), go = u >= 6 * BT;
  STYLE.bands(ctx); STYLE.burst(ctx, W / 2, H / 2, t * .3, tint(C.line, 1, .08), 20);
  const pw = W / 5, sk = 130 * U;
  ROW.forEach((key, i) => {
    const t0 = i * .8 * BT, k = eOut(P(u, t0, t0 + .22)); if (k <= 0) return;
    const x0 = i * pw, dy = (1 - k) * -H * 1.1 * (i % 2 ? -1 : 1);
    const poly_ = [[x0 + sk, dy], [x0 + pw + sk, dy], [x0 + pw - sk, H + dy], [x0 - sk, H + dy]];
    ctx.save(); pth(ctx, poly_); ctx.clip();
    ctx.fillStyle = tint(TEAMS[key].col, 1.5, 1); ctx.fillRect(x0 - sk, dy, pw + 2 * sk, H);
    STYLE.burst(ctx, x0 + pw / 2, H * .45 + dy, t * .6 + i, tint(TEAMS[key].col, .7, .5), 12);
    const sc = 2.7, cx = x0 + pw / 2 - 30 * U, cy = H * .42 + dy;
    riderSide(ctx, cx - 44 * sc * U, cy + 214 * sc * U, sc, key, { p, tuck: 1, lean: -.05 + .02 * Math.sin(p * 30), face: key === 'oni' ? 'grin' : 'calm' });
    ctx.restore();
    pth(ctx, poly_); ink(ctx, null, 10 * U);
    text(ctx, TEAMS[key].name, x0 + pw / 2 - sk * .45, H * .86 + dy, { size: 64 * U, font: F.head, color: '#FFF6EA', stroke: C.line, strokeW: 12 * U, rot: -.05, g: 'cn' + key });
  });
  // 顶上一排红绿灯
  ctx.save(); ctx.translate(W / 2, 78 * U); box(ctx, -150 * U, -50 * U, 300 * U, 100 * U, 50 * U); ink(ctx, '#2A2240', 8 * U);
  [['#FF3131', !go], ['#FFD23F', false], ['#3DFF7A', go]].forEach(([c, on], i) => { const x = (i - 1) * 92 * U; if (on) { ctx.save(); ctx.globalAlpha = .4; disk(ctx, x, 0, 64 * U); ctx.fillStyle = c; ctx.fill(); ctx.restore(); } disk(ctx, x, 0, 34 * U); ink(ctx, on ? c : '#4A3F5E', 6 * U); });
  ctx.restore();
  ['3', '2', '1'].forEach((n, i) => { if (u >= i * 2 * BT && u < (i + 1) * 2 * BT) sfx(ctx, n, W / 2, H * .5, u, i * 2 * BT, { size: 420, rot: -.08, g: 'n' + n }); });
  if (go) { const f = 1 - P(u, 6 * BT, 6 * BT + .25); if (f > 0) { ctx.save(); ctx.globalAlpha = f * .85; ctx.fillStyle = C.flash; ctx.fillRect(0, 0, W, H); ctx.restore(); } sfx(ctx, '冲！', W / 2, H * .5, u, 6 * BT, { size: 460, color: C.a1, rot: -.1, g: 'go' }); }
}, {
  kind: 'poster', hud: false, bg: { tone: 'base' },
  cues(k, t0) { ROW.forEach((_, i) => k.raw.whoosh(t0 + i * .8 * BT - .05, .25, .6)); [0, 2, 4].forEach(b => { SND.beep(k, t0 + b * BT, 1318.5); k.tick(t0 + b * BT, 1); SND.rev(k, t0 + b * BT, .45, 50, 110, .5); }); k.hit(t0 + 6 * BT, 1.4); SND.beep(k, t0 + 6 * BT, 2637, .9); },
  imp: d => [[0, .4], [2 * BT, .45], [4 * BT, .5], [6 * BT, 1.6]],
});

// 3 起跑：全员冲出去，烟团炸开，赤鬼抬头
const sLaunch = T.custom((ctx, u, d, t) => {
  const p = on2(u), scroll = 1200 * U * u * u + 1800 * U * u;
  const base = { frog: .64, cat: .4, oni: .56, shark: .36, peach: .16 }, lead = { oni: .22, shark: .08, peach: .12, cat: .05, frog: .1 };
  cam(ctx, lerp(-.09, -.02, eOut(P(u, 0, d))), lerp(1.28, 1.1, eOut(P(u, 0, d))), () => {
    sideStage(ctx, t, scroll);
    speedLines(ctx, t, { alpha: clamp(u * 1.5) * .6, y0: H * .1, h: H * .8 });
    pack(ctx, ROW.map(key => { const l = SIDE_LANE[key], k = eOut(P(u, 0, d)); return { key, lane: l, x: W * (base[key] + lead[key] * k) - (1 - k) * 80 * U, o: { p, stretch: 1 + .32 * Math.exp(-u * 4), wheel: t * 40, wheelie: key === 'oni' ? .3 * Math.sin(Math.PI * P(u, 0, 1.2)) : 0, flame: key === 'oni' ? 110 : 0, tuck: 1 } }; }));
    ROW.forEach(key => { const l = SIDE_LANE[key], s = laneS(l); for (let b = 0; b < 3; b++) puff(ctx, W * base[key] - (150 + b * 90) * U * s, laneY(l) - 30 * U * s, 80 * U * s, P(u, b * .06, .7 + b * .1), l * 3 + b); });
  });
  sfx(ctx, '轰——！', W * .28, H * .2, u, 0, { size: 240, rot: -.14, g: 'boom' });
}, {
  hud: false, bg: { tone: 'base' }, hot: true, flash: true,
  cues(k, t0) { k.hit(t0, 1.4); SND.rev(k, t0, 1.6, 70, 240, .8); k.whoosh(t0 + .1, .8, .9); k.crash(t0, .9); },
  imp: d => [[0, 1.4]],
});

// 4 抢道：侧面长镜头，赤鬼切进蓝鲨的道
const sRace1 = T.custom((ctx, u, d, t) => {
  const p = on2(u), scroll = 2600 * U * u + 3000 * U;
  ctx.save(); ctx.translate(W / 2, H / 2); ctx.rotate(.035 * Math.sin(u * 2.2)); ctx.scale(1.1, 1.1); ctx.translate(-W / 2, -H / 2);
  sideStage(ctx, t, scroll);
  speedLines(ctx, t, { y0: H * .08, h: H * .85, alpha: .55 });
  const cut = eIO(P(u, 4 * BT, 5.2 * BT)), wob = u > 4.6 * BT && u < 7 * BT ? Math.sin(p * 60) * .12 * (1 - P(u, 4.6 * BT, 7 * BT)) : 0;
  const hop = Math.sin(Math.PI * P(u, 10 * BT, 11.5 * BT)) * 90 * U;
  const list = [
    { key: 'frog', lane: 0, x: W * (.7 + .05 * Math.sin(u * 1.3)), dy: -hop, o: { p, wheel: t * 40 } },
    { key: 'cat', lane: 1, x: W * (.3 + .04 * Math.sin(u * 1.7 + 1)), o: { p, wheel: t * 40 } },
    { key: 'oni', lane: lerp(2, 3, cut), x: W * (.6 + .08 * cut), o: { p, wheel: t * 40, flame: 70, lean: -.14 * Math.sin(Math.PI * cut) } },
    { key: 'shark', lane: 3, x: W * (.5 - .16 * eOut(P(u, 4.6 * BT, 6 * BT)) + .05 * eIO(P(u, 9 * BT, 14 * BT))), o: { p, wheel: t * 40, lean: wob, face: u > 4.6 * BT && u < 9 * BT ? 'shock' : 'calm' } },
    { key: 'peach', lane: 4, x: W * (.14 + .03 * Math.sin(u * 1.1 + 2)), o: { p, wheel: t * 40 } },
  ];
  pack(ctx, list);
  ctx.restore();
  if (u > 4 * BT) sfx(ctx, '嗖——', W * .86, H * .42, u, 4 * BT, { size: 150, rot: -.1, color: C.a1, g: 'swoosh' });
  say(ctx, '让开让开！', W * .66, H * .16, u, 4.5 * BT, 9 * BT, { size: 58, tx: 60 * U, ty: 90 * U });
  say(ctx, '喂！', W * .22, H * .3, u, 6 * BT, 10 * BT, { size: 64, tx: 80 * U, ty: 90 * U });
}, {
  hud: false, bg: { tone: 'base' },
  cues(k, t0) { k.swish(t0 + 4 * BT - .1, .5, .9); k.hit(t0 + 4 * BT, .9); k.pop(t0 + 4.5 * BT, .7); k.pop(t0 + 6 * BT, .7); SND.skid(k, t0 + 4.6 * BT, .4, .4); k.raw.boing(t0 + 10 * BT, .7); },
  imp: d => [[4 * BT, .9]],
});

// 5 闯红灯：四家刹住，赤鬼冲过去
const sRed = T.custom((ctx, u, d, t) => {
  const p = on2(u), state = u < .5 * BT ? 'yellow' : 'red';
  sideStage(ctx, t, 0, { rail: false });
  ctx.fillStyle = '#FFF1E0'; pth(ctx, [[W * .6, H * .5], [W * .62, H * .5], [W * .7, H], [W * .66, H]]); ctx.fill();
  lightSide(ctx, W * .78, H * .7, .95, state);
  const stopK = eOut(P(u, 0, 3 * BT));
  const stopOff = { frog: 0, cat: 330, shark: 80, peach: 560 };
  const list = ['frog', 'cat', 'shark', 'peach'].map((key, i) => { const l = SIDE_LANE[key], s = laneS(l), xStop = W * .58 - (110 * s + stopOff[key]) * U; return { key, lane: l, x: lerp(-W * .15 + i * 60 * U, xStop, stopK), o: { p, wheel: (1 - stopK) * t * 40, skid: u > .8 * BT && u < 3.5 * BT ? 120 : 0, stretch: u > 2.6 * BT && u < 3.4 * BT ? .88 : 1, face: u > 5 * BT ? 'shock' : 'calm', tuck: 0 } }; });
  list.push({ key: 'oni', lane: 2, x: lerp(-W * .1, W * 1.35, eIn(P(u, 0, 7 * BT))), o: { p, wheel: t * 50, flame: 110, tuck: 1 } });
  pack(ctx, list);
  if (u > 5 * BT) list.filter(r => r.key === 'frog' || r.key === 'shark').forEach(r => { const s = laneS(r.lane); text(ctx, '！？', r.x + 30 * U * s, laneY(r.lane) - 340 * U * s, { size: 96 * U * s, font: F.head, color: C.a3, stroke: C.line, strokeW: 10 * U, scale: eBack(P(u, 5 * BT, 5.3 * BT)), g: 'q' + r.key }); });
  if (u > 4.5 * BT) STYLE.seal(ctx, '闯红灯！', W * .76, H * .26, P(u, 4.5 * BT, 4.8 * BT), { size: 250 * U, color: C.a1, rot: -.12 });
  if (u > 7 * BT) sfx(ctx, '叭——！', W * .9, H * .55, u, 7 * BT, { size: 120, rot: .1, align: 'right', color: '#FFF6EA', g: 'honk' });
}, {
  hud: false, bg: { tone: 'base' }, hot: true,
  cues(k, t0) { SND.skid(k, t0 + .8 * BT, 2.4 * BT, .6); k.hit(t0 + 4.5 * BT, 1.2); k.pop(t0 + 5 * BT, .6); SND.honk(k, t0 + 7 * BT, .8); k.tick(t0 + 7 * BT, .6); },
  imp: d => [[4.5 * BT, 1.1], [7 * BT, .5]],
});

// 6 逆行超速：背后追拍，对面来车一辆辆擦过去
const sRace2 = T.custom((ctx, u, d, t) => {
  const p = on2(u), hz = H * .4;
  const b = C.bands, hh = hz / b.length; b.forEach((c, i) => { ctx.fillStyle = c; ctx.fillRect(0, i * hh - 1, W, hh + 2); });
  city(ctx, hz, t * 40 * U, 5, '#6B2E86', 70);
  ctx.fillStyle = C.bg2; ctx.fillRect(0, hz, W, H - hz);
  pth(ctx, [[W * .47, hz], [W * .53, hz], [W * 1.25, H], [-W * .25, H]]); ink(ctx, C.road, 6 * U);
  const depth = q => Math.pow(q, 2.4);
  // 中线与路灯往镜头冲
  for (let i = 0; i < 9; i++) { const q = (i / 9 + t * .9) % 1, e = depth(q), y = hz + (H - hz) * e, w = (4 + e * 40) * U, len = (10 + e * 160) * U; ctx.fillStyle = '#FFF1E0'; ctx.fillRect(W / 2 - w / 2, y, w, len); }
  for (let i = 0; i < 6; i++) { const q = (i / 6 + t * .7) % 1, e = depth(q); for (const side of [-1, 1]) { const x = W / 2 + side * (W * .06 + e * W * .85), y = hz + (H - hz) * e; ctx.fillStyle = C.line; ctx.fillRect(x - (3 + e * 14) * U, y - (40 + e * 520) * U, (6 + e * 28) * U, (40 + e * 520) * U); } }
  // 来车：在左车道正对着赤鬼开过来
  const sway = Math.sin(u * 5.2) * .5 + (u > 6 * BT ? Math.sin(u * 9) * .25 : 0), carT = [0, 3.5, 7, 10.5, 13.5].map(b => b * BT);
  carT.forEach((c0, i) => { const q = P(u, c0, c0 + 2.6 * BT); if (q <= 0 || q >= 1) return; const e = depth(q), x = W / 2 - W * .1 * (1 - e) + (sway > 0 ? -1 : 1) * e * W * .42, y = hz + (H - hz) * e, s = .12 + e * 1.5; car(ctx, x, y, s, ['#3DB8FF', '#FFE14D', '#FFF6EA', C.a2, '#3DFF7A'][i]); });
  const vx = W / 2 + sway * W * .16;
  riderBack(ctx, vx, H * 1.02, 1.75, 'oni', { p, tilt: sway * .2 + Math.sin(p * 40) * .02, flame: 120, boxJolt: Math.sin(p * 55) * .08 });
  speedLines(ctx, t, { alpha: .35, n: 20, y0: H * .45, h: H * .5 });
  if (u > 2 * BT) STYLE.seal(ctx, '逆行！', W * .2, H * .24, P(u, 2 * BT, 2.3 * BT), { size: 230 * U, color: C.a1, rot: -.14 });
  if (u > 9 * BT) STYLE.seal(ctx, '超速！', W * .8, H * .26, P(u, 9 * BT, 9.3 * BT), { size: 230 * U, color: C.a3, rot: .1 });
  if (u > 8 * BT) { const gx = W * .86, gy = H * .74, r = 110 * U, k = eOut(P(u, 8 * BT, 8.4 * BT)); ctx.save(); ctx.translate(gx, gy); ctx.scale(k, k); disk(ctx, 0, 0, r); ink(ctx, '#FFF6EA', 7 * U); ctx.lineWidth = 16 * U; ctx.strokeStyle = C.a1; ctx.beginPath(); ctx.arc(0, 0, r * .72, -.4, .4); ctx.stroke(); const a = lerp(-2.4, .3, eOut(P(u, 8.2 * BT, 9 * BT))) + Math.sin(p * 80) * .05; ctx.lineWidth = 9 * U; ctx.strokeStyle = C.line; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * r * .8, Math.sin(a) * r * .8); ctx.stroke(); disk(ctx, 0, 0, 12 * U); ink(ctx, C.line, 0); ctx.restore(); }
}, {
  hud: false, bg: { tone: 'base' }, hot: true,
  cues(k, t0) { k.hit(t0 + 2 * BT, 1); [0, 3.5, 7, 10.5, 13.5].forEach(b => { k.raw.whoosh(t0 + (b + 2.2) * BT, .4, .8); SND.honk(k, t0 + (b + 1.6) * BT, .35); }); k.pop(t0 + 8 * BT, .6); k.hit(t0 + 9 * BT, 1); },
  imp: d => [[2 * BT, .8], [9 * BT, .8]],
});
function car(ctx, x, y, s, col) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s * U, s * U);
  ctx.save(); ctx.globalAlpha = .3; ctx.fillStyle = C.line; oval(ctx, 0, 4, 190, 20); ctx.fill(); ctx.restore();
  box(ctx, -170, -150, 340, 130, 40); ink(ctx, col, 9);
  box(ctx, -120, -250, 240, 120, 36); ink(ctx, col, 9);
  box(ctx, -96, -232, 192, 80, 20); ink(ctx, '#BFE6FF', 7);
  disk(ctx, -110, -95, 26); ink(ctx, '#FFF6A8', 7); disk(ctx, 110, -95, 26); ink(ctx, '#FFF6A8', 7);
  box(ctx, -150, -30, 60, 34, 10); ink(ctx, C.line, 0); box(ctx, 90, -30, 60, 34, 10); ink(ctx, C.line, 0);
  ctx.restore();
}

// 7 汤在晃：透视箱子里面
const sSoup = T.custom((ctx, u, d, t) => {
  const p = on2(u);
  field(ctx, C.a2); ctx.save(); ctx.fillStyle = dots(ctx, tint(C.line, 1, .25), 30 * U, .3); ctx.fillRect(0, 0, W, H); ctx.restore();
  const jolt = Math.sin(p * 17) * (.05 + .1 * u / d), amp = (8 + 50 * u / d) * U;
  ctx.save(); ctx.translate(W * .5, H * .54); ctx.rotate(jolt); ctx.scale(1.25, 1.25);
  box(ctx, -330 * U, -300 * U, 660 * U, 560 * U, 40 * U); ctx.save(); ctx.setLineDash([26 * U, 18 * U]); ink(ctx, tint(C.line, 1, .35), 9 * U); ctx.restore();
  // 碗
  const bw = 250 * U, by = 90 * U;
  ctx.save(); ctx.beginPath(); ctx.moveTo(-bw, -by * .4); ctx.quadraticCurveTo(-bw, by * 2.2, 0, by * 2.2); ctx.quadraticCurveTo(bw, by * 2.2, bw, -by * .4); ctx.closePath(); ctx.clip();
  ctx.fillStyle = '#FFF6EA'; ctx.fillRect(-bw, -by * 2, bw * 2, by * 5);
  ctx.beginPath(); ctx.moveTo(-bw, by * 3); for (let i = 0; i <= 30; i++) { const x = -bw + i / 30 * bw * 2; ctx.lineTo(x, -by * .1 + Math.sin(i / 30 * 5 + p * 14) * amp + (x / bw) * Math.sin(p * 9) * amp * 1.4); } ctx.lineTo(bw, by * 3); ctx.closePath(); ctx.fillStyle = SOUP; ctx.fill();
  ctx.strokeStyle = NOODLE; ctx.lineWidth = 9 * U; for (let n = 0; n < 5; n++) { ctx.beginPath(); for (let i = 0; i <= 14; i++) { const x = -bw * .7 + i / 14 * bw * 1.4, y = by * (.6 + n * .28) + Math.sin(i * 1.1 + n + p * 8) * 14 * U; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke(); }
  ctx.restore();
  ctx.beginPath(); ctx.moveTo(-bw, -by * .4); ctx.quadraticCurveTo(-bw, by * 2.2, 0, by * 2.2); ctx.quadraticCurveTo(bw, by * 2.2, bw, -by * .4); ink(ctx, null, 9 * U);
  oval(ctx, 0, -by * .4, bw, 30 * U); ink(ctx, null, 9 * U);
  // 盖子被顶起来
  const lift = Math.max(0, Math.sin(p * 14)) * amp * .9;
  ctx.save(); ctx.translate(0, -by * .4 - 20 * U - lift); ctx.rotate(Math.sin(p * 9) * .1 * u / d); oval(ctx, 0, 0, bw * 1.04, 34 * U); ink(ctx, '#FF3131', 9 * U); box(ctx, -30 * U, -52 * U, 60 * U, 26 * U, 10 * U); ink(ctx, '#FF3131', 7 * U); ctx.restore();
  // 溅出来的汤点
  for (let i = 0; i < 10; i++) { const q = (hash(i) + u * 2.2) % 1; if (u < 3 * BT) break; const x = (hash(i + 4) - .5) * bw * 2.2, y = -by * .6 - q * 260 * U + q * q * 300 * U; ctx.save(); ctx.globalAlpha = 1 - q; disk(ctx, x, y, (8 + hash(i) * 10) * U); ink(ctx, SOUP, 5 * U); ctx.restore(); }
  ctx.restore();
  sfx(ctx, '晃……', W * .16, H * .2, u, 0, { size: 150, rot: -.1, color: '#FFF6EA', g: 'w1' });
  if (u > 4 * BT) sfx(ctx, '晃晃晃……！', W * .8, H * .84, u, 4 * BT, { size: 130, rot: .08, color: C.a3, g: 'w2' });
  text(ctx, '赤鬼的外卖箱', W * .8, H * .16, { size: 40 * U, font: F.head, color: '#FFF6EA', stroke: C.line, strokeW: 8 * U, rot: .05 });
}, {
  hud: false, bg: { tone: 'a2' }, calm: true,
  cues(k, t0) { for (let b = 0; b < 8; b++) SND.slosh(k, t0 + b * BT, .4 + b * .07); k.raw.boing(t0, .6); k.pop(t0 + 4 * BT, .8); k.raw.boing(t0 + 4 * BT + .05, .8); },
  imp: d => [[4 * BT, .5]],
});

// 8 最后冲刺：放射速度线，尾焰拉满，眼睛特写
const sDash = T.custom((ctx, u, d, t) => {
  const p = on2(u);
  field(ctx, C.dark); STYLE.burst(ctx, W * .62, H * .45, t * .5, tint(C.a2, 1, .35), 22);
  tunnel(ctx, W * .62, H * .45, t, '#FFF6EA');
  riderSide(ctx, W * .45 + Math.sin(p * 50) * 6 * U, H * .9, 1.9, 'oni', { p, stretch: 1.18 + .05 * Math.sin(p * 40), flame: 230 + 40 * Math.sin(p * 30), wheel: t * 60, tuck: 1.2 });
  speedLines(ctx, t, { n: 30, alpha: .5, speed: 4200 });
  sfx(ctx, '最后冲刺！', W * .08, H * .15, u, 0, { size: 150, align: 'left', rot: -.08, g: 'dash' });
  // 眼睛特写：一条横带从左边滑进来
  const kin = eOut(P(u, 4 * BT, 4.4 * BT)), kout = eIn(P(u, 8 * BT, 8.3 * BT));
  if (u > 4 * BT && u < 8.3 * BT) {
    const y0 = H * .3, h = H * .34, x0 = -W * (1 - kin) + W * kout;
    ctx.save(); ctx.beginPath(); ctx.rect(x0, y0, W, h); ctx.clip();
    ctx.fillStyle = C.line; ctx.fillRect(x0, y0, W, h);
    ctx.fillStyle = '#FF3131'; ctx.fillRect(x0, y0 + h * .2, W, h * .6);
    ctx.fillStyle = C.line; ctx.fillRect(x0, y0 + h * .32, W, h * .36);
    for (const [ex, dir] of [[W * .36, 1], [W * .64, -1]]) { pth(ctx, [[x0 + ex - 160 * U * dir, y0 + h * .4], [x0 + ex + 150 * U * dir, y0 + h * .5], [x0 + ex - 140 * U * dir, y0 + h * .62]]); ink(ctx, '#FFE14D', 0); }
    const g = P(u, 5 * BT, 6 * BT); if (g > 0 && g < 1) { const sx = x0 + W * .36 + 60 * U, sy = y0 + h * .42, r = 60 * U * Math.sin(Math.PI * g); ctx.fillStyle = '#FFFFFF'; pth(ctx, [[sx, sy - r], [sx + r * .18, sy - r * .18], [sx + r, sy], [sx + r * .18, sy + r * .18], [sx, sy + r], [sx - r * .18, sy + r * .18], [sx - r, sy], [sx - r * .18, sy - r * .18]]); ctx.fill(); }
    ctx.restore();
    ctx.strokeStyle = C.line; ctx.lineWidth = 10 * U; ctx.strokeRect(x0, y0, W, h);
  }
  if (u > 8 * BT) sfx(ctx, '咻——！！', W * .72, H * .78, u, 8 * BT, { size: 200, rot: -.1, color: C.a1, g: 'whoosh' });
}, {
  hud: false, bg: { tone: 'dark' }, hot: true,
  cues(k, t0, d) { k.hit(t0, 1.1); k.raw.fire(t0, d, .5); k.raw.riser(t0 + 4 * BT, 4 * BT, .7); SND.beep(k, t0 + 5 * BT, 2637, .6); k.tick(t0 + 5 * BT, .5); k.hit(t0 + 8 * BT, 1.3); k.whoosh(t0 + 8 * BT, .8, 1); },
  imp: d => [[0, 1], [8 * BT, 1.4]],
});

// 9 冲线：楼门口漂移急停，第一名
const sFinish = T.custom((ctx, u, d, t) => {
  const p = on2(u);
  const b = C.bands; field(ctx, b[1]);
  ctx.fillStyle = '#9B3FD1'; ctx.fillRect(0, 0, W, H * .66); ctx.strokeStyle = C.line; ctx.lineWidth = 8 * U; ctx.strokeRect(-10, -10, W + 20, H * .66 + 10);
  ctx.save(); ctx.globalAlpha = .18; ctx.fillStyle = C.line; for (let r = 0; r < 9; r++) for (let c = 0; c < 16; c++) ctx.fillRect(c * 130 * U + (r % 2) * 65 * U, r * 80 * U, 124 * U, 6 * U); ctx.restore();
  box(ctx, W * .64, H * .16, W * .16, H * .5, 10 * U); ink(ctx, '#3E1757', 8 * U);
  box(ctx, W * .66, H * .09, W * .12, 70 * U, 10 * U); ink(ctx, '#FFF6EA', 7 * U);
  text(ctx, '3 栋', W * .72, H * .09 + 35 * U, { size: 44 * U, font: F.head, color: C.fg });
  ctx.fillStyle = C.road; ctx.fillRect(0, H * .66, W, H * .34); ctx.fillStyle = C.line; ctx.fillRect(0, H * .66 - 4 * U, W, 10 * U);
  // 终点格子带
  for (let r = 0; r < 6; r++) for (let c = 0; c < 2; c++) { ctx.fillStyle = (r + c) % 2 ? C.line : '#FFF6EA'; const y = H * .67 + r * H * .055, x = W * .56 + r * 10 * U + c * 44 * U; ctx.fillRect(x, y, 44 * U, H * .055); }
  // 后面三家慢慢骑进来（第 8 拍以后）
  if (u > 7 * BT) ['frog', 'cat', 'peach', 'shark'].forEach((key, i) => { const k = eOut(P(u, (7 + i * .6) * BT, (10 + i * .6) * BT)); riderSide(ctx, lerp(-W * .2, W * (.12 + i * .11), k), H * (.74 + i * .02), .55, key, { p, wheel: (1 - k) * t * 20, tuck: 0, face: 'happy' }); });
  const k = eOut(P(u, 0, 2 * BT)), drift = (1 - k) * .35;
  riderSide(ctx, lerp(-W * .25, W * .46, k), H * .97, 1.6, 'oni', { p, lean: -drift, skid: u < 2.2 * BT ? 260 : 0, wheel: (1 - k) * t * 50, arm: u > 4 * BT ? 'up' : null, tuck: u > 4 * BT ? 0 : 1 });
  for (let i = 0; i < 4; i++) puff(ctx, W * .3 - i * 60 * U, H * .9, 90 * U, P(u, 1.2 * BT + i * .05, 3.5 * BT), i + 5);
  if (u > 4 * BT) { STYLE.seal(ctx, '第一名！', W * .26, H * .28, P(u, 4 * BT, 4.3 * BT), { size: 250 * U, color: C.a3, rot: -.1 }); for (let i = 0; i < 40; i++) { const q = P(u, 4 * BT, 4 * BT + 2.4), x = W * hash(i) , y = -40 * U + q * (H * .8 + hash(i + 2) * H * .4); ctx.save(); ctx.translate(x + Math.sin(q * 9 + i) * 30 * U, y); ctx.rotate(q * 12 + i); ctx.fillStyle = [C.a1, C.a3, '#3DB8FF', '#3DFF7A'][i % 4]; ctx.fillRect(-10 * U, -5 * U, 20 * U, 10 * U); ctx.restore(); } }
}, {
  hud: false, bg: { tone: 'base' },
  cues(k, t0) { SND.skid(k, t0 + .1, 2 * BT, .8); k.seal(t0 + 4 * BT, 1.3); for (let i = 0; i < 6; i++) k.raw.pop(t0 + 4 * BT + .1 + i * .07, .5); },
  imp: d => [[4 * BT, 1.3]],
});

// 10 其他四家：四格漫画，稳稳递到客人手里
const sOthers = T.custom((ctx, u, d, t) => {
  const p = on2(u);
  STYLE.bands(ctx); STYLE.stripes(ctx, tint(C.line, 1, .07), t);
  STYLE.hit(ctx, '其他四家：稳稳送达', W / 2, H * .1, u, 0, { size: 84 * U, align: 'center', color: C.a3, rot: -.03, g: 'others' });
  const keys = ['shark', 'peach', 'cat', 'frog'], pw = W * .43, ph = H * .36;
  keys.forEach((key, i) => {
    const k = eBack(P(u, (1 + i) * BT, (1 + i) * BT + .3)); if (k <= 0) return;
    const x = W * .05 + (i % 2) * (pw + W * .04), y = H * .2 + Math.floor(i / 2) * (ph + H * .04), cx = x + pw / 2, cy = y + ph / 2;
    ctx.save(); ctx.translate(cx, cy); ctx.scale(k, k); ctx.rotate((i % 2 ? .015 : -.015)); ctx.translate(-cx, -cy);
    box(ctx, x + 12 * U, y + 14 * U, pw, ph, 18 * U); ctx.fillStyle = C.line; ctx.fill();
    box(ctx, x, y, pw, ph, 18 * U); ink(ctx, '#FFF6EA', 8 * U);
    ctx.save(); box(ctx, x, y, pw, ph, 18 * U); ctx.clip();
    ctx.fillStyle = tint(TEAMS[key].col, 1.6, .35); ctx.fillRect(x, y, pw, ph);
    box(ctx, x + pw * .72, y + ph * .12, pw * .22, ph * .88, 8 * U); ink(ctx, '#3E1757', 7 * U);
    riderSide(ctx, x + pw * .38, y + ph * .98, .78, key, { p, still: true, tuck: 0, face: 'happy', arm: null });
    // 递出去的袋子和客人的手
    const hx = x + pw * .66, hy = y + ph * .52;
    box(ctx, hx - 34 * U, hy - 20 * U, 68 * U, 60 * U, 10 * U); ink(ctx, TEAMS[key].col, 6 * U);
    limb(ctx, [[x + pw * .74, hy - 6 * U], [hx + 30 * U, hy - 6 * U]], 20 * U, '#FFC7A0');
    const hk = P(u, (1.5 + i) * BT, (1.5 + i) * BT + .6); if (hk > 0) { ctx.save(); ctx.globalAlpha = 1 - hk * hk; ctx.translate(hx, hy - 80 * U - hk * 60 * U); ctx.scale(1 + hk * .4, 1 + hk * .4); ctx.beginPath(); ctx.moveTo(0, 18 * U); ctx.bezierCurveTo(-40 * U, -10 * U, -18 * U, -40 * U, 0, -20 * U); ctx.bezierCurveTo(18 * U, -40 * U, 40 * U, -10 * U, 0, 18 * U); ink(ctx, C.a1, 5 * U); ctx.restore(); }
    ctx.restore();
    tag(ctx, key, x + 110 * U, y + 56 * U, 1);
    ctx.restore();
  });
}, {
  hud: false, bg: { tone: 'base', deco: 1 }, calm: true,
  cues(k, t0) { k.hit(t0, .9); for (let i = 0; i < 4; i++) { k.pop(t0 + (1 + i) * BT, .7); k.ding(t0 + (1.5 + i) * BT, [1318.5, 1568, 1760, 2093][i], .5); } },
  imp: d => [[0, .6]],
});

// 11 开汤：客人一掀盖，汤喷出来
const sOpen = T.custom((ctx, u, d, t) => {
  const p = on2(u), splash = P(u, 4 * BT, 5.2 * BT), after = u > 6 * BT;
  field(ctx, C.bg2);
  if (u > 4 * BT) STYLE.burst(ctx, W / 2, H * .55, t * .4, tint(SOUP, 1, .35), 20);
  const cx = W / 2, cy = H * .42, r = 170 * U;
  // 身体与手
  box(ctx, cx - 250 * U, H * .7, 500 * U, H * .4, 120 * U); ink(ctx, '#3DB8FF', 8 * U);
  // 头发、脸
  oval(ctx, cx, cy - 20 * U, r * 1.12, r * 1.08); ink(ctx, '#3E1757', 8 * U);
  disk(ctx, cx, cy + 10 * U, r); ink(ctx, '#FFC7A0', 8 * U);
  pth(ctx, [[cx - r * 1.05, cy - r * .15], [cx - r * .7, cy - r * .95], [cx + r * .7, cy - r * .95], [cx + r * 1.05, cy - r * .15], [cx + r * .5, cy - r * .55], [cx - r * .2, cy - r * .45]]); ink(ctx, '#3E1757', 8 * U);
  if (!after) {
    for (const s of [-1, 1]) { oval(ctx, cx + s * r * .38, cy + r * .1, r * .2, r * .26); ink(ctx, '#FFFFFF', 6 * U); disk(ctx, cx + s * r * .38, cy + r * .14, r * .11); ink(ctx, C.line, 0); disk(ctx, cx + s * r * .34, cy + r * .06, r * .04); ctx.fillStyle = '#FFFFFF'; ctx.fill(); }
    ctx.beginPath(); if (u < 4 * BT) ctx.arc(cx, cy + r * .5, r * .22, .2, Math.PI - .2); else ctx.ellipse(cx, cy + r * .55, r * .12, r * .16, 0, 0, 7); ink(ctx, u < 4 * BT ? null : C.line, 6 * U);
  } else {
    ctx.lineWidth = 7 * U; ctx.strokeStyle = C.line; ctx.beginPath(); for (const s of [-1, 1]) { ctx.moveTo(cx + s * r * .52, cy + r * .12); ctx.lineTo(cx + s * r * .22, cy + r * .12); } ctx.moveTo(cx - r * .15, cy + r * .55); ctx.lineTo(cx + r * .15, cy + r * .55); ctx.stroke();
    ctx.save(); ctx.globalAlpha = .85; ctx.fillStyle = SOUP; for (let i = 0; i < 9; i++) { oval(ctx, cx + (hash(i) - .5) * r * 1.6, cy + (hash(i + 3) - .5) * r * 1.4, r * (.12 + hash(i + 6) * .16), r * (.1 + hash(i + 8) * .2)); ctx.fill(); } ctx.restore();
    ctx.save(); ctx.lineCap = 'round'; for (let n = 0; n < 5; n++) { ctx.beginPath(); const x0 = cx + (n - 2) * r * .32; for (let i = 0; i <= 10; i++) { const x = x0 + Math.sin(i * .9 + n) * 16 * U, y = cy - r * .9 + i * r * (.12 + n * .02) + Math.sin(p * 6 + n) * 4 * U; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.strokeStyle = C.line; ctx.lineWidth = 16 * U; ctx.stroke(); ctx.strokeStyle = NOODLE; ctx.lineWidth = 9 * U; ctx.stroke(); } ctx.restore();
  }
  // 碗和盖子
  const bx = cx, byy = H * .8;
  limb(ctx, [[cx - 240 * U, H * .92], [bx - 150 * U, byy]], 36 * U, '#3DB8FF'); limb(ctx, [[cx + 240 * U, H * .92], [bx + 150 * U, byy]], 36 * U, '#3DB8FF');
  ctx.beginPath(); ctx.moveTo(bx - 170 * U, byy - 40 * U); ctx.quadraticCurveTo(bx - 170 * U, byy + 110 * U, bx, byy + 110 * U); ctx.quadraticCurveTo(bx + 170 * U, byy + 110 * U, bx + 170 * U, byy - 40 * U); ctx.closePath(); ink(ctx, '#FFF6EA', 8 * U);
  const lidUp = u < 3 * BT ? eOut(P(u, BT, 3 * BT)) * 20 * U : 0, lidFly = eOut(P(u, 4 * BT, 5 * BT));
  ctx.save(); ctx.translate(bx - lidFly * W * .45, byy - 50 * U - lidUp - lidFly * H * .7); ctx.rotate(lidFly * -4); oval(ctx, 0, 0, 175 * U, 30 * U); ink(ctx, '#FF3131', 8 * U); mark(ctx, 'oni', 0, -4 * U, 22 * U); ctx.restore();
  // 喷发
  if (splash > 0) {
    const e = eOut(splash), fade = 1 - P(u, 6 * BT, 8 * BT) * .6;
    ctx.save(); ctx.globalAlpha = fade;
    // 汤柱：从碗口往上喷，边缘起伏，顶上翻成一朵
    const top = byy - 60 * U - e * H * .78 * (1 - P(u, 5 * BT, 6.5 * BT) * .7), wb = 150 * U;
    ctx.beginPath(); ctx.moveTo(bx - wb, byy - 40 * U);
    for (let i = 0; i <= 12; i++) { const f = i / 12, y = lerp(byy - 40 * U, top, f); ctx.lineTo(bx - wb * (1 - f * .45) + Math.sin(f * 9 + p * 20) * 26 * U, y); }
    for (let i = 0; i <= 16; i++) { const a = Math.PI + i / 16 * Math.PI; ctx.lineTo(bx + Math.cos(a) * wb * 1.5 + Math.sin(i * 2.1 + p * 20) * 20 * U, top + Math.sin(a) * wb * .9); }
    for (let i = 12; i >= 0; i--) { const f = i / 12, y = lerp(byy - 40 * U, top, f); ctx.lineTo(bx + wb * (1 - f * .45) + Math.sin(f * 9 + p * 20 + 2) * 26 * U, y); }
    ctx.closePath(); ink(ctx, SOUP, 9 * U);
    ctx.save(); ctx.globalAlpha = .5; ctx.fillStyle = '#FFE0B0'; ctx.beginPath(); ctx.ellipse(bx - wb * .35, (top + byy) / 2, wb * .12, Math.abs(byy - top) * .3, 0, 0, 7); ctx.fill(); ctx.restore();
    for (let i = 0; i < 16; i++) { const a = -Math.PI / 2 + (hash(i) - .5) * 2.6, dist = e * (260 + hash(i + 3) * 560) * U, x = bx + Math.cos(a) * dist, y = top + 80 * U + Math.sin(a) * dist * .6 + splash * splash * 260 * U; disk(ctx, x, y, (16 + hash(i + 5) * 34) * U); ink(ctx, SOUP, 6 * U); }
    ctx.save(); ctx.lineCap = 'round'; for (let n = 0; n < 4; n++) { const a = -Math.PI / 2 + (n - 1.5) * .5, dist = e * 420 * U; ctx.beginPath(); for (let i = 0; i <= 8; i++) { const x = bx + Math.cos(a) * dist + Math.sin(i * 1.2 + n) * 18 * U, y = top + 60 * U + Math.sin(a) * dist * .5 + i * 18 * U; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.strokeStyle = C.line; ctx.lineWidth = 16 * U; ctx.stroke(); ctx.strokeStyle = NOODLE; ctx.lineWidth = 9 * U; ctx.stroke(); } ctx.restore();
    ctx.restore();
  }
  if (u > 4 * BT) sfx(ctx, '哗啦——！！', W * .05, H * .2, u, 4 * BT, { size: 170, align: 'left', rot: -.1, color: '#FFF6EA', g: 'splash' });
  if (u > 9 * BT) say(ctx, '……', W * .78, H * .3, u, 9 * BT, d, { size: 70, tx: -140 * U, ty: 80 * U });
}, {
  hud: false, bg: { tone: 'alt' }, quiet: true,
  cues(k, t0) { k.raw.tick(t0 + BT, .5); k.raw.tick(t0 + 2 * BT, .5); k.raw.tick(t0 + 3 * BT, .6); SND.splash(k, t0 + 4 * BT, 1.1); k.hit(t0 + 4 * BT, 1); SND.whistle(k, t0 + 7 * BT, 1.1, 1400, 260, .7); k.pop(t0 + 9 * BT, .6); },
  imp: d => [[4 * BT, 1.6]],
});

// 12 评价：四家五星，赤鬼一颗星，盖差评章
const sRating = T.custom((ctx, u, d, t) => {
  STYLE.bands(ctx); STYLE.burst(ctx, W / 2, H / 2, t * .15, tint(C.line, 1, .07), 18);
  const x = W * .17, y = H * .07, w = W * .66, h = H * .86;
  const inner = STYLE.panel(ctx, x, y, w, h, { head: '订单评价' });
  const rows = [['shark', 5, '汤一滴没洒', 0], ['peach', 5, '准时又稳当', 2], ['cat', 5, '到手还是热的', 4], ['frog', 5, '包装完好', 6], ['oni', 1, '汤全洒了', 8]];
  const rh = inner.h / 5;
  rows.forEach(([key, n, note, b], i) => {
    const t0 = b * BT; if (u < t0) return;
    const ry = inner.y + i * rh + rh / 2, k = eBack(P(u, t0, t0 + .25));
    ctx.save(); ctx.translate(inner.x, ry); ctx.scale(k, k);
    box(ctx, 0, -34 * U, 68 * U, 68 * U, 12 * U); ink(ctx, TEAMS[key].col, 6 * U); mark(ctx, key, 34 * U, 0, 20 * U);
    text(ctx, TEAMS[key].name, 96 * U, 2 * U, { size: 50 * U, font: F.head, align: 'left', color: C.fg, g: 'rn' + key });
    ctx.restore();
    for (let s = 0; s < 5; s++) {
      const sx = inner.x + 290 * U + s * 64 * U, full = s < n && u > t0 + .1 + s * .06, sk = full ? eBack(P(u, t0 + .1 + s * .06, t0 + .3 + s * .06)) : 1;
      const pts = []; for (let j = 0; j < 10; j++) { const a = j / 10 * Math.PI * 2 - Math.PI / 2, rr_ = (j % 2 ? 12 : 27) * U * sk; pts.push([sx + Math.cos(a) * rr_, ry + Math.sin(a) * rr_]); }
      poly(ctx, pts, full ? C.a3 : tint(C.line, 1, .12), C.line, 4);
    }
    if (u > t0 + .4) text(ctx, note, inner.x + 640 * U, ry + 2 * U, { size: 40 * U, font: F.body, align: 'left', color: key === 'oni' ? C.a1 : C.muted, alpha: eOut(P(u, t0 + .4, t0 + .6)), g: 'nt' + key });
  });
  if (u > 8.3 * BT) { const ry = inner.y + 4 * rh + rh / 2, bx = inner.x + 640 * U + tw(ctx, '汤全洒了', 40 * U, F.body) + 30 * U; box(ctx, bx, ry - 26 * U, 200 * U, 52 * U, 26 * U); ink(ctx, C.a3, 5 * U); text(ctx, '第一个送达', bx + 100 * U, ry + 1 * U, { size: 30 * U, font: F.body, color: C.fg, g: 'first' }); }
  if (u > 10 * BT) STYLE.seal(ctx, '差评', inner.x + inner.w - 120 * U, inner.y + 4 * rh + rh * .4, P(u, 10 * BT, 10.25 * BT), { size: 240 * U, color: C.a1, rot: -.16 });
  if (u > 12 * BT) { const k = eBack(P(u, 12 * BT, 12.3 * BT)); ctx.save(); ctx.translate(W * .86, H * .2); ctx.rotate(.12); ctx.scale(k, k); box(ctx, -150 * U + 10 * U, -44 * U + 12 * U, 300 * U, 88 * U, 20 * U); ctx.fillStyle = C.line; ctx.fill(); box(ctx, -150 * U, -44 * U, 300 * U, 88 * U, 20 * U); ink(ctx, C.a1, 7 * U); text(ctx, '全场唯一差评', 0, 2 * U, { size: 46 * U, font: F.head, color: '#FFF6EA', g: 'only' }); ctx.restore(); }
}, {
  hud: false, bg: { tone: 'base' },
  cues(k, t0) { [0, 2, 4, 6].forEach(b => { k.pop(t0 + b * BT, .6); for (let s = 0; s < 5; s++) k.tick(t0 + b * BT + .1 + s * .06, .5); k.ding(t0 + b * BT + .45, 1760, .5); }); k.pop(t0 + 8 * BT, .6); k.tick(t0 + 8 * BT + .1, .5); k.raw.errBeep(t0 + 8.6 * BT); k.seal(t0 + 10 * BT, 1.4); k.pop(t0 + 12 * BT, .8); },
  imp: d => [[10 * BT, 1.5]],
});

// 13 结尾：回到开头的路口，五家都停在红灯前；欲速不达，安全第一
const sMoral = T.custom((ctx, u, d, t) => {
  const p = on2(u), green = u > 16 * BT, go = eIn(P(u, 16.5 * BT, d)) * 380;
  const z = lerp(1.02, 1.1, u / d);
  ctx.save(); ctx.translate(W / 2, H / 2); ctx.rotate(-.44); ctx.scale(z * U, z * U); ctx.translate(-170, 20);
  crossing(ctx, green ? 'green' : 'red');
  ROW.forEach((k, i) => riderTop(ctx, [-20, 10, 0, 15, -10][i] + go, -300 + i * 150, 1, k, { p, noodle: k === 'oni', soup: k === 'oni' }));
  ctx.restore();
  ctx.save(); ctx.fillStyle = tint(C.dark, 1, .35); ctx.fillRect(0, 0, W, H); ctx.restore();
  STYLE.hit(ctx, '欲速不达', W / 2, H * .22, u, 0, { size: 190 * U, align: 'center', color: C.a3, rot: -.04, g: 'm1' });
  STYLE.hit(ctx, '安全第一', W / 2, H * .76, u, 4 * BT, { size: 220 * U, align: 'center', color: C.a1, rot: .03, g: 'm2' });
  if (u > 17 * BT) text(ctx, '人物与队名均为虚构', W - L.m, H - 44 * U, { size: 26 * U, font: F.body, align: 'right', color: '#FFF6EA', alpha: eOut(P(u, 17 * BT, 18 * BT)), meta: true });
}, {
  kind: 'outro', hud: false, bg: { tone: 'base' },
  cues(k, t0) { k.hit(t0, 1.2); k.hit(t0 + 4 * BT, 1.4); SND.beep(k, t0 + 16 * BT, 1568, .6); k.ding(t0 + 16 * BT, 2093, .6); },
  imp: d => [[0, 1], [4 * BT, 1.2]],
});

FILM({
  hud: { off: true },
  scenes: [
    ['grid', 4, sGrid],
    ['count', 2, sCount],
    ['launch', 2, sLaunch],
    ['race1', 4, sRace1],
    ['redlight', 3, sRed, { flash: true }],
    ['race2', 4, sRace2, { trans: { type: 'zoom', len: .3 } }],
    ['soup', 2, sSoup, { flash: true }],
    ['dash', 3, sDash, { trans: { type: 'shatter', len: .5 } }],
    ['finish', 3, sFinish, { flash: true }],
    ['others', 2, sOthers, { trans: { type: 'sand', len: .5 } }],
    ['open', 3, sOpen, { flash: true }],
    ['rating', 4, sRating, { trans: { type: 'zoom', len: .3 } }],
    ['moral', 6, sMoral, { trans: { type: 'ink', len: .6 } }],
  ],
});
