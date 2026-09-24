# 场景模板

写在 `film.js` 里：

```js
FILM({
  hud: { label: '说明书 No.001' },          // 可选；off: true 关掉 HUD
  scenes: [
    ['open', 1, T.open({ words: ['一', '句', '话', 'GENTO'] })],
    ['q1', 1.5, T.quote({ lead: '……', hit: '……', rest: '……' })],
  ],
  score(k) { /* 可选：额外音效 */ },
  camera({ imp, rumble, flash, glitch, ST, BT, BAR }) { /* 可选：额外镜头 */ },
});
```

每个模板都自带音效、镜头震动和版面自适应（横版左右分栏，方版竖版上下排；字长了会换行、缩字）。内容模板都能加 `tone`（底色：base / alt / dark / a1 / a2 / a3）和 `date`（右上日期框）。

场景条目的第四项是额外标记：`['peak', 2, T.quote({...}), { hot: true }]`。可用：`hot`（律动加密）、`darkMusic`（和声转暗）、`quiet`（音乐停）、`rumble`（持续震动强度）、`glitch`（在第几秒切片故障）、`flash`（切入白闪）、`hud: false`。

---

## 模板一览

| 模板 | 用途 | 主要参数 |
|---|---|---|
| `T.open` | 冷开场字卡，一拍一张 | `words: [4 个词]`，`per`（每张几拍），`label` |
| `T.poster` | 片名海报 | `kicker` `title` `tail` `seal`（章上的字）`sub`（打字机副标题）`note` `art`（横版时右边放主视觉，章挪到字下） |
| `T.chapter` | 章节卡 | `n` `total` `tag` `title` `en` |
| `T.quote` | 一句话三段：铺垫、重击词、收尾 | `meta` `lead` `hit` `rest` `mark`（rest 里要划重点的短语）`source` `art` `caption` `split` |
| `T.number` | 大数字，数上去再砸下 | `value` `prefix` `suffix` `decimals` `from` `label` `note` `meta` `art` |
| `T.bars` | 柱状图，一拍长一根，最后一根强调 | `title` `sub` `items: [[标签, 数值, 显示文字]]` `note` |
| `T.list` | 编号清单卡 | `title` `meta` `items` `icons` `per` |
| `T.compare` | 左右（竖版上下）对比 | `left/right: { label, value, note, tone }` `mid`（中间的章，false 关掉） |
| `T.steps` | 流程，方块一拍一个，箭头连起来 | `title` `meta` `steps: [{ label, icon }]` `lastHi` |
| `T.timeline` | 时间线 | `title` `events: [[日期, 文字]]` |
| `T.talk` | 人物 + 对话气泡 | `lines: [两三句]` `accent`（第几句上强调色）`hair` `glasses` `sign` |
| `T.verdict` | 结论：深色底、音乐停、盖章 | `lead` `seal` `tail` `tailSub` |
| `T.outro` | 尾声 | `lines: [主句, 副句]` `items` `itemsHead` `source` `popup: { title, lines, button }` `figure`（false 时横版左边放主视觉 `art`） |
| `T.custom` | 自己画 | `T.custom((ctx,u,d,t) => {...}, { cues(k,t0,d){}, imp: d => [[秒, 强度]], bg })` |

`art` 可选：不写＝风格主视觉；`{ kind: 'tea' }` 指定主视觉变体；`{ icon: 'bulb' }` 大图标；`{ figure: { hair: 'bob' } }` 人物；函数 `(ctx,x,y,w,h,u,t) => {}` 自己画；`false` 不要图。

图标名：bulb gear check cross clock chart user globe bolt heart leaf star money doc chat lock play flag。

---

## 三语同屏

film.json 写 `"lang": "en", "subs": ["ja", "zh"]`：屏幕上的大字用 lang，底部一块淡底放副标，每种语言一行。每个场景在第四项给副标：

```js
const sub = (ja, zh) => ({ sub: { ja, zh } });
['nike', 2, T.quote({...}), sub('勝利の女神ニケ……', '胜利女神尼刻……')],
```

副标占了底部字幕带，这种片子不要再用模板的 `caption`，尾声也别写 `source`（出处放进 `items`）。副标字体用风格包里各语言的 `sub` 角色，没有就用 `body`。

---

## 画风 → 模板

| 画风 | 主要用 | 写法 |
|---|---|---|
| 纯字排版 | open、poster、quote、number、list、verdict | quote 和 number 加 `split: 1, art: false`，字占满版心 |
| 字配图形 | quote、number、steps、bars、timeline | 默认写法，右侧/下方是风格主视觉 |
| 角色叙事 | talk、quote（`art: { figure }`）、outro | 同一个人物反复出场，发型衣服保持一致 |
| 数据图表 | number、bars、compare、timeline | 数字写出处 |

---

## 节奏 → 场景长度

| 节奏 | 内容场景 | 章节卡 | 字卡 |
|---|---|---|---|
| 快切 | 1 小节 | 0.5 | 每张 1 拍，可 `per: .5` |
| 标准 | 1.5 小节 | 0.5 | 每张 1 拍 |
| 舒缓 | 2〜3 小节 | 1 | 每张 2 拍（`per: 2`） |

模板里的动作都卡在前几拍（第 1 拍重击、第 3 拍划重点），场景给长了只是停留更久，不会出错。

---

## 自定义场景

需要模板做不到的画面时用 `T.custom`。可用的零件：

- 版面：`L`（m、top、bot、left、right、cw、ch、cx、cy、capY）、`W` `H` `U`（尺寸单位）、`WIDE` `TALL` `STACK`
- 风格零件：`STYLE.bg / title / hit / seal / marker / panel / caption / ornament / bar / link / popup`
- 画图：`text` `rich` `stagger` `typewriter` `vtext` `fitText` `fitBlock` `rr` `circ` `ell` `poly` `arrow` `icon` `person` `head` `bust` `worker` `bubble` `flame` `poof` `confetti`
- 颜色：`C.bg C.fg C.a1 C.a2 C.a3 C.dark C.line C.white C.muted`，`tone(名)` `onTone(名)` `accentOn(底色名)`
- 字体角色：`F.head F.body F.shout F.latin F.mono`
- 缓动：`eOut eIn eIO eBack eSine slamS P lerp clamp hash`

音效（`cues(k, t0, d)` 里）：`k.hit` `k.seal` `k.pop` `k.tick` `k.type` `k.swish` `k.ding` `k.note(t, 音阶序号)` `k.rise(t0, 长度)` `k.error`，音色跟音乐预设走。原始乐器在 `k.raw`。

镜头：`imp: d => [[秒, 强度]]`，强度参考：小动作 .35、普通重击 1、大结论 2。
