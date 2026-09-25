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

场景条目的第四项是额外标记：`['peak', 2, T.quote({...}), { hot: true }]`。可用：`hot`（律动加密）、`darkMusic`（和声转暗）、`calm`（只留长音和稀疏拨弦）、`quiet`（音乐停）、`rumble`（持续震动强度）、`glitch`（在第几秒切片故障）、`flash`（切入白闪）、`hud: false`，以及下面的 `trans` 和 `fx`。

**转场** `trans: { type, len, x, y, dir }`：上一场最后一帧定格，按类型揭开这一场，自带配声。

| type | 效果 | 适合 |
|---|---|---|
| `ink` | 一团带毛边的墨从 (x, y) 化开 | 默认，叙事段落之间 |
| `shatter` | 上一场碎成三角块飞散 | 冲突、战争、转折 |
| `sand` | 上一场碎成小方块被风吹走，`dir: -1` 往左 | 时间流逝、换地点 |
| `zoom` | 上一场放大变白淡出 | 进入章节卡、片名 |

**光效** `fx: [{ type, ... }]` 画在这一场上面：`dust`（浮尘）、`rays`（体积光，`x` `y` `angle` `spread`）、`stars`（星空）、`vortex`（漩涡拖尾，`grow` 几拍长满）、`embers`（火星往上飘；`fall: true` 往下落，配金色就是金雨）、`shimmer`（水光，`y` `h`）、`lightning`（闪电，`at` 第几拍、`x0 y0 x1 y1` 起止点）。坐标都写 0〜1。光效要垫在字下面时，写进模板的 `back` 参数（`T.void` `T.tree` `T.plate` `T.statue` `T.montage` `T.pantheon` 都有）。

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
| `T.statue` | 抠好的雕像 / 器物立在一个大词前面，三语文字在另一侧；大词和雕像反向慢移出纵深 | `img` `crop` `big`（雕像后的大词）`title` `body`（三语对象）`credit` `side` `scale` `titleSize` `backdrop`（糊化铺底的名画）`backCam` `back` `depth` |
| `T.plate` | 名画整屏铺满，镜头沿路径推移，入场扫光，文字压在一侧暗角上 | `img` `cam: [[进度, x, y, z], ...]` `side` `head` `body`（三语对象）`credit` `fg`（同尺寸抠图做前景层，底图会慢慢虚化）`pop` `sweep` `back` |
| `T.montage` | 一拍一张图快切，大字压在画面上 | `items: [{ img, cam, cut, crop, scale, head, kicker, credit, back }]` `per` `center` `kind` `back` |
| `T.void` | 深空大字：暗底加粒子，一个大词带发光落下，下面三语一句。冷开场、片名、章节卡 | `big`（三语对象或字符串）`kicker` `body` `back`（默认星空加浮尘）`at`（大词落下的秒数）`img`（糊化底图）`kind` |
| `T.tree` | 族谱树：节点按顺序长出来，金线从父母连到孩子，镜头自动取景 | `nodes: { id: { name, at: [x, y], parents, img, face, r, lab } }` `show` `grow`（按顺序，数组里的同时长）`caption` `focus` `step` `cam` `back` |
| `T.trio` | 三件作品在拱形窗里一字排开，各带名字和一句说明 | `caption` `items: [{ img, cut, crop, cam, name, role, fx }]` `per` |
| `T.pantheon` | 众神墙：圆形像章一格一位，依次点亮后整面停住 | `title` `items: [{ img, face, name }]` `note` `cols` |
| `T.credits` | 作品缩略图一排 + 出处清单 | `title` `items: [{ img, cut, credit }]` `note`（都可三语） |
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

## 图片素材（雕像、名画、照片）

1. 找图：优先博物馆开放馆藏（大都会、芝加哥美术馆的 CC0）和维基共享资源里标公有领域或 CC0 的文件。CC BY-SA 的不用（成片会被要求同样授权）。用找图工具，它只收 CC0 和公有领域，并把出处记进 `credits.json`：
   ```bash
   python3 scripts/fetch_art.py search commons "Goya Saturn"        # 也可 met / aic
   python3 scripts/fetch_art.py get commons "File:文件名.jpg" <片源>/raw saturn
   python3 scripts/fetch_art.py get met 204758 <片源>/raw perseus
   ```
   一次要很多张时，把文件名写成清单批量下。作品名、作者、年代、馆藏逐条对照 credits.json 和原页面查实，写进出处；拿不准的（比如展出地和收藏地不同）照页面原话写
2. 处理：`python3 scripts/prep_art.py 原图 输出 --cutout --grade marble`。雕像、器物加 `--cutout` 抠图；统一调色用 `--grade`（预设 marble / terracotta / redfigure / sepia / ink，或逗号分隔的色值）；底下带展台就先 `--crop` 裁掉。抠图要 rembg（本机用 `~/.venvs/snscover/bin/python`）
3. 透明图转 WebP、照片存 JPG，整片素材控制在 5MB 左右
4. film.json 登记：`"assets": { "nike": "assets/nike.webp" }`，构建时内联进 HTML；场景里用 `img: 'nike'`
5. 镜头：`cam` 的 x、y 是图上要对准画框中心的点。一侧放字时，把焦点往字的反方向偏（偏移约 0.25 ÷ 放大倍数），主体就落在留白那半边。先给图加坐标网格看准位置再写
6. 圆形像章（`T.tree` 的 `img`、`T.pantheon`）用 `face: [x, y, z]` 对准脸：z 是在铺满圆的基础上再放大几倍，竖长的全身像一般要 3〜5。估不准就先按几组候选值裁出圆形预览看一眼，再定

示例见 `samples/greek-myth/`。

---

## 三语并排

film.json 写 `"lang": "en", "subs": ["ja", "zh"]` 加载三种语言的字体，场景里的文字写成 `{ en, ja, zh }` 对象，用 `T.statue` / `T.plate` / `T.montage` / `T.credits` / `T.verdict`（lead）/ `T.void` / `T.tree` / `T.trio` / `T.pantheon` 排成三行一组。这和「三语同屏副标」是两回事：并排不给场景写 `sub`。

---

## 画风 → 模板

| 画风 | 主要用 | 写法 |
|---|---|---|
| 纯字排版 | open、poster、quote、number、list、verdict | quote 和 number 加 `split: 1, art: false`，字占满版心 |
| 字配图形 | quote、number、steps、bars、timeline | 默认写法，右侧/下方是风格主视觉 |
| 角色叙事 | talk、quote（`art: { figure }`）、outro | 同一个人物反复出场，发型衣服保持一致 |
| 真品图片 | statue、plate、montage、trio、pantheon、credits | 雕像抠图立在大词前，名画整屏加镜头，片尾列作品出处 |
| 谱系、人物关系 | tree、pantheon、void | 一代一场族谱树，每场只长这一代和它的父母；中间穿插名画讲故事 |
| 数据图表 | number、bars、compare、timeline | 数字写出处 |

---

## 节奏 → 场景长度

| 节奏 | 内容场景 | 章节卡 | 字卡 |
|---|---|---|---|
| 快切 | 1 小节 | 0.5 | 每张 1 拍，可 `per: .5` |
| 标准 | 1.5 小节 | 0.5 | 每张 1 拍 |
| 舒缓 | 2〜3 小节 | 1 | 每张 2 拍（`per: 2`） |

模板里的动作都卡在前几拍（第 1 拍重击、第 3 拍划重点），场景给长了只是停留更久，不会出错。

**读得完是底线。** 多语言并排或字多的场景，按字数给时长，前后一致：

- 带一句正文的场景（三语各一句）至少 2 小节，一般 3 小节
- 快切每张至少 1 小节，只放一个词（可加一行小标题）；要带句子就别用快切
- 族谱树按节点数给：每长一代约 1 拍，再留 2 秒读完
- 两分钟以上的长片每 3 小节左右换一次画面，场与场之间用转场，镜头一直在动，别在开头堆慢镜、结尾挤快切

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
