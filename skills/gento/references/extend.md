# 扩展

加东西不改已有的风格和模板。场景模板只调风格零件，所以新风格一加进来，全部模板都能用。

---

## 加一个风格

1. 复制最接近的 `styles/<id>/style.js` 到 `styles/<新id>/style.js`
2. 在 `styles/catalog.json` 登记：`name` `desc` `palettes`（色调 id → 中文名）`music`（默认音乐预设）`pace` `fonts`（Google Fonts 的 family 串，分 common / zh / ja / en）
3. 写 `defineStyle({...})`。必须有：

| 字段 | 说明 |
|---|---|
| `palettes` | 至少三套。每套 token：bg bg2 fg muted a1 a2 a3 dark onDark line white shadow skin，建议也写 panelFg onA1 onA2 onA3 flash scrim；a2 是浅色时写 `lightA2: true` |
| `fonts` | zh / ja / en 各一组角色：head body shout latin mono，每个 `{ f, w, ls?, up?, st?, also? }` |
| `motion` | hitFrom hitLen shake jitter push cutLen soft |

4. 按需覆盖零件（没写的用 `engine/components.js` 的默认）：

| 零件 | 作用 |
|---|---|
| `textures()` | 启动时建一次纹理，固定种子 |
| `bg(ctx,u,d,t,o)` | 场景底：o.tone、o.deco、o.poster |
| `post(ctx,t)` | 盖在整帧上的质感：纸、颗粒、扫描线、暗角 |
| `jitter(t)` / `cut(ctx,k)` | 整帧抖动 / 切场效果 |
| `title` `hit` `seal` `marker` | 标题、重击词、章、强调 |
| `panel` `panelShadow` `caption` `popup` | 卡片、字幕条、弹窗 |
| `wordCard` `chapter` `hud` | 字卡、章节卡（尺寸用 `chapterGeom()`）、顶部信息 |
| `ornament(ctx,x,y,w,h,u,t,o)` | 主视觉，填满给定区域，o.seed / o.kind 切变体 |
| `shade` `cheek` `bar` `link` | 人物阴影、脸颊、柱子、连线 |

5. 在 `samples/<新id>/film.json` 建样片（`"script": "../_tour/film.js"`），`samples/_tour/film.js` 的 NAMES 表里加三语名字
6. 跑 `node scripts/test.js <新id>` 和 `node scripts/test.js --matrix`，看联系表
7. `references/styles.md` 加一节，README 的风格表加一行

写零件时守三条：
- 画什么都从 token 取颜色，不写死色值（阴影透明度除外）
- 字一律走 `text()`，质检才看得见；装饰字加 `deco: true`
- 横版、竖版、方版都要能看：位置用 `L` `W` `H` `U` 算，按 `WIDE` / `TALL` / `STACK` 分支

---

## 加一个音乐预设

1. `music/presets.js` 里 `MUSIC.<id> = preset({...})`，可覆盖：`scale` `prog` `darkProg` `room` `drive` `sfx(k)` `intro` `poster` `chapter` `stop` `outro` `groove(k, from, to, o)`
2. `sfx(k)` 拿到的是原始乐器，返回要覆盖的语义音效（hit seal pop tick type swish ding note）
3. `music/catalog.json` 登记 `name` `bpm` `desc`
4. `references/music.md` 表里加一行，跑回归

---

## 加一个场景模板

1. `scenes/library.js` 里 `T.<名字> = (o) => ({ kind, bg, fn, cues, imp })`
2. 版面用 `areas()` `stackY()` `fitBlock()`，横版和上下排两套
3. 每个动作在 `cues` 里配一声，在 `imp` 里登记震动
4. `references/templates.md` 表里加一行；样片脚本里用一次，跑回归
