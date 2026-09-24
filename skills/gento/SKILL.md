---
name: gento
description: 幻燈 GENTO：把一段素材做成代码动画短片，直接出带配乐的 MP4 到桌面。九种风格（孔版、瑞士网格、故障霓虹、木版浮世绘、蓝图工程、工业渲染、岁月静好、讲故事/讲原理、希腊陶瓶），十一种音乐预设，横版竖版方版都行，中日英三语，也能三语同屏。开工前用几轮选择题问清风格、画风、色调、节奏、音乐、语言、内容、片长、帧数、画幅，问完直接出片，出片前自动质检。触发：/gento、幻燈、「做个动画」「做成短片」「出个视频」。
argument-hint: "<素材或主题>，<可选：风格 / 画幅 / 片长 / 语言……>"
---

# 幻燈 GENTO

用户敲 `/gento 素材，要求`。素材在 `$ARGUMENTS` 里。

下文的 `${CLAUDE_SKILL_DIR}` 是本 skill 的目录；取不到时本机是 `~/.claude/skills/gento`，插件安装时在插件缓存里。第一次用先确认依赖：

```bash
test -d "${CLAUDE_SKILL_DIR}/node_modules/puppeteer-core" || npm install --prefix "${CLAUDE_SKILL_DIR}" --no-fund --no-audit
command -v ffmpeg >/dev/null || echo "缺 ffmpeg：brew install ffmpeg"
```

## 一、问清十件事

先从 `$ARGUMENTS` 里读出已经说了的项，说了的不再问。其余用 AskUserQuestion 分三轮问完，每轮最多四题。

选项里的推荐项放第一个，标「（推荐）」。推荐依据写在选项说明里。

**第一轮**

| 题 | 选项 |
|---|---|
| 风格 | 按素材挑四个最合适的风格做选项，每个带 preview（色调、字、动作、默认音乐）。题干里列出全部风格名，写明「想要别的就在 Other 里写名字」。现有风格都不贴题时，可以把「新做一个风格」放进选项，选了就先照 extend.md 加风格包、过回归再出片 |
| 画风 | 纯字排版 ／ 字配图形 ／ 角色叙事 ／ 数据图表 |
| 画幅 | 16:9 横版 ／ 9:16 竖版 ／ 1:1 方版 ／ 4:5 |
| 语言 | 中文 ／ 日文 ／ 英文。选了多种时再问：分几部各一种语言，还是一部片三语同屏（见 templates.md「三语同屏」） |

**第二轮**（依赖第一轮的风格）

| 题 | 选项 |
|---|---|
| 色调 | 该风格的三个色调，preview 写主色色值和适合什么 |
| 节奏 | 快切 ／ 标准 ／ 舒缓 |
| 音乐 | 风格默认预设（推荐）+ 两三个搭得上的 + 无配乐；题干列出全部预设名 |
| 片长 | 15 秒 ／ 30 秒 ／ 45 秒 ／ 60 秒 |

**第三轮**

| 题 | 选项 |
|---|---|
| 帧数 | 30 fps（推荐）／ 24 fps ／ 60 fps |
| 内容 | 照素材原文 ／ 提炼成分镜 ／ 可以扩写（自拟的地方片尾标出） |

风格、色调、音乐的名字和简介从 `${CLAUDE_SKILL_DIR}/styles/catalog.json`、`${CLAUDE_SKILL_DIR}/music/catalog.json` 读，不凭记忆写。每个风格的适用场景见 `${CLAUDE_SKILL_DIR}/references/styles.md`。

问完就开工，中途不再确认，直接出成品。

## 二、出片

```
片名 slug：日期-主题，例如 0925-quarterly-report
片源：~/Movies/幻燈/<slug>/      （film.json + film.js）
成品：~/Desktop/幻燈/<slug>/     （MP4 + 可播放的 HTML + 联系表）
```

1. **写 film.json**：`title` `style` `palette` `music` `format` `fps` `lang` `pace` `target`（目标秒数）。BPM 不写，跟音乐预设走。
2. **写分镜 film.js**：用 `FILM({ scenes: [...] })`，场景按小节排。先读 `${CLAUDE_SKILL_DIR}/references/grammar.md` 和 `${CLAUDE_SKILL_DIR}/references/templates.md`。
   - 一小节的秒数＝240 ÷ BPM。片长 × BPM ÷ 240 ＝总小节数，照这个分配场景
   - 画风决定用哪些模板，节奏决定每场几小节，对照表在 templates.md
   - 屏幕上的字照 `~/.claude/CLAUDE.md` 的写作规则写；素材里没有的事实、数字、引语不写
3. **质检**：`node ${CLAUDE_SKILL_DIR}/scripts/check.js <片源目录>`。有 FAIL 就改到没有；WARN 逐条看，能改就改。
4. **看联系表**：`node ${CLAUDE_SKILL_DIR}/scripts/render.js <片源目录> --sheet --out <成品目录>`，用 Read 看图。自动质检看不出的：字色和底色对比、字的意思对不对、同一片里风格是否一致。查法见 `${CLAUDE_SKILL_DIR}/references/qa.md`。
5. **导出**：`node ${CLAUDE_SKILL_DIR}/scripts/render.js <片源目录> --out <成品目录> --name <片名>`，把 `film.html` 复制到成品目录改名 `<片名>.html`。
6. **交付**：`open` 成品目录。回复里写清：成品路径、片长和规格、用了哪些选择、自拟了哪些文案、质检结果、有没有没做到的。

## 三、改片

用户说「换成××风格」「改成竖版」「节奏快一点」：只改 film.json 对应字段，重跑第 3〜5 步。场景用的是模板，换风格、换画幅不用重写分镜。

改文案、改场景：改 film.js。

## 四、扩展

加风格、加音乐预设、加场景模板，照 `${CLAUDE_SKILL_DIR}/references/extend.md` 做。改完跑 `node ${CLAUDE_SKILL_DIR}/scripts/test.js --matrix`，全部通过才算完成，然后提交推送仓库（GitHub `Shinkou777/gento`，本机 `~/DevGitRepo/gento`）。

## 文件

| 路径 | 内容 |
|---|---|
| `engine/` | 引擎：时间线、镜头、画图零件、风格默认零件、合成器、播放器、质检接口 |
| `styles/<id>/style.js` | 风格包，`styles/catalog.json` 登记名字、色调、默认音乐和字体 |
| `music/presets.js` | 音乐预设，`music/catalog.json` 登记 BPM 和简介 |
| `scenes/library.js` | 场景模板 T.open / poster / chapter / quote / number / bars / list / compare / steps / timeline / talk / verdict / outro / custom |
| `scripts/` | build（拼成单文件 HTML）、render（MP4 / 联系表 / 静帧）、check（质检）、test（回归） |
| `samples/` | 每个风格的样片配置，共用 `samples/_tour/film.js` |
| `references/` | grammar 片子语法、templates 模板用法、styles 风格说明、music 音乐、qa 质检、extend 扩展 |
