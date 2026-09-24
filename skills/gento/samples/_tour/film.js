// 风格样片：八种风格、三种语言共用这一份脚本，把每种场景模板都走一遍。
// 时长按小节写，音乐 BPM 不同，片长跟着变。
const NAMES = {
  zh: { riso: '孔版', swiss: '瑞士网格', glitch: '故障霓虹', woodblock: '木版浮世绘', blueprint: '蓝图工程', industrial: '工业渲染', serene: '岁月静好', explainer: '讲故事' },
  ja: { riso: '孔版', swiss: 'スイス・グリッド', glitch: 'グリッチ・ネオン', woodblock: '木版浮世絵', blueprint: '青図', industrial: '工業レンダー', serene: '穏やかな日々', explainer: '解説アニメ' },
  en: { riso: 'Riso', swiss: 'Swiss Grid', glitch: 'Glitch Neon', woodblock: 'Woodblock', blueprint: 'Blueprint', industrial: 'Industrial Render', serene: 'Serene', explainer: 'Explainer' },
};
const NAME = NAMES[LANG][CFG.style];
const S = {
  zh: {
    words: ['素材', '问答', '成片', 'GENTO'],
    poster: { kicker: '一段素材', title: 'GENTO', tail: '做成短片', seal: '幻燈', sub: '—— 画面、配乐、导出都在一个文件里', note: `* 风格样片 · ${NAME}` },
    step: '步骤', c1: '先问清楚', c2: '换一种风格', c3: '质检再出片',
    ask: { title: '开拍前问十件事', items: ['风格、画风、色调', '节奏、音乐、语言', '内容、片长', '帧数、横版竖版'] },
    rule: { meta: 'RULE · 规矩', lead: '每个画面只打', hit: '一下', rest: '每一下都配一声。', mark: '配一声', source: '声音和画面写在同一张节拍表上' },
    swap: { left: { label: '场景', value: '同一套', note: '模板只调风格零件' }, right: { label: '风格', value: '八种', note: '换一个词，整片换装' } },
    music: { suffix: ' 种', label: '音乐预设，音效跟着风格走', note: 'house · lofi · 和风 · 钢琴 · 电影感 ……' },
    formats: { title: '四种画幅', sub: '画面高度（像素）', note: '宽度都是 1080 或 1920' },
    flow: { title: '出片流水线', steps: ['问答', '分镜', '质检', '导出'] },
    once: { title: '一次出片', events: [['01', '敲 /gento 加素材'], ['02', '回答几轮问题'], ['03', '写分镜、跑质检'], ['04', '成片放到桌面']] },
    talk: ['想换风格？', '改一个词，重新导出。'],
    verdict: { lead: '样片结论：', seal: '可以开拍', tail: '完。', tailSub: 'FIN.' },
    outro: { lines: ['暗号：/gento', '后面跟上素材就行'], items: ['说暗号，给素材', '回答几轮问题', '成片放到桌面'], source: `GENTO 风格样片 · ${NAME} · 画面与配乐全部由代码实时生成`, pop: ['导出完成', '附配乐'], ok: '好的' },
  },
  ja: {
    words: ['素材', '質問', '完成', 'GENTO'],
    poster: { kicker: '素材ひとつで', title: 'GENTO', tail: 'ショート動画に', seal: '幻燈', sub: '―― 映像も音楽も書き出しも、ひとつのファイルで', note: `* スタイル見本 · ${NAME}` },
    step: 'ステップ', c1: '先に聞いておく', c2: 'スタイルを替える', c3: '検品してから書き出す',
    ask: { title: '撮る前に聞く10のこと', items: ['スタイル・画風・色調', 'テンポ・音楽・言語', '内容・尺', 'フレームレート・縦横'] },
    rule: { meta: 'RULE · 決まり', lead: '1カットに', hit: '一撃', rest: 'どの一撃にも音をつける。', mark: '音をつける', source: '音と映像は同じビート表に書く' },
    swap: { left: { label: 'シーン', value: '共通', note: 'テンプレートはスタイル部品だけを呼ぶ' }, right: { label: 'スタイル', value: '8種', note: '一語替えれば全編が着替える' } },
    music: { suffix: ' 種', label: '音楽プリセット、効果音もスタイルに合わせる', note: 'house · lofi · 和風 · ピアノ · シネマ ……' },
    formats: { title: '4つの画面比', sub: '画面の高さ（px）', note: '幅は 1080 か 1920' },
    flow: { title: '制作ライン', steps: ['ヒアリング', '絵コンテ', '検品', '書き出し'] },
    once: { title: '1本できるまで', events: [['01', '/gento と素材を入力'], ['02', 'いくつか質問に答える'], ['03', '絵コンテと検品'], ['04', '完成品をデスクトップへ']] },
    talk: ['スタイルを変えたい？', '一語替えて、書き出し直す。'],
    verdict: { lead: '見本の結論：', seal: '撮影OK', tail: '完。', tailSub: 'FIN.' },
    outro: { lines: ['合言葉：/gento', 'あとに素材を続けるだけ'], items: ['合言葉と素材を渡す', 'いくつか質問に答える', '完成品はデスクトップに'], source: `GENTO スタイル見本 · ${NAME} · 映像と音楽はすべてコードで生成`, pop: ['書き出し完了', '音楽つき'], ok: 'OK' },
  },
  en: {
    words: ['BRIEF', 'ASK', 'RENDER', 'GENTO'],
    poster: { kicker: 'One brief,', title: 'GENTO', tail: 'one short film', seal: 'READY', sub: '— picture, score and export in one file', note: `* style sample · ${NAME}` },
    step: 'Step', c1: 'Ask first', c2: 'Swap the style', c3: 'Check, then export',
    ask: { title: 'Ten questions before we shoot', items: ['Style, look, palette', 'Pace, music, language', 'Content, length', 'Frame rate, orientation'] },
    rule: { meta: 'RULE', lead: 'Every shot lands', hit: 'ONE HIT', rest: 'and every hit gets a sound.', mark: 'a sound', source: 'Picture and sound share one beat sheet' },
    swap: { left: { label: 'Scenes', value: 'SAME', note: 'templates only call style parts' }, right: { label: 'Styles', value: 'EIGHT', note: 'change one word, restyle the film' } },
    music: { suffix: '', label: 'music presets; the effects follow the style', note: 'house · lofi · wafu · piano · cinematic …' },
    formats: { title: 'Four formats', sub: 'frame height (px)', note: 'width is 1080 or 1920' },
    flow: { title: 'The pipeline', steps: ['Ask', 'Storyboard', 'Check', 'Export'] },
    once: { title: 'One film', events: [['01', 'type /gento + brief'], ['02', 'answer a few questions'], ['03', 'storyboard and QA'], ['04', 'film lands on the desktop']] },
    talk: ['Want another style?', 'Change one word, export again.'],
    verdict: { lead: 'Verdict:', seal: 'READY', tail: 'Fin.', tailSub: 'END' },
    outro: { lines: ['Keyword: /gento', 'then paste your brief'], items: ['say the keyword and the brief', 'answer a few questions', 'the film lands on the desktop'], source: `GENTO style sample · ${NAME} · picture and sound generated in code`, pop: ['Export done', 'with soundtrack'], ok: 'OK' },
  },
}[LANG];

FILM({
  hud: { label: `GENTO · ${NAME} · SAMPLE` },
  scenes: [
    ['open', 1, T.open({ words: S.words })],
    ['poster', 1, T.poster(S.poster)],

    ['c1', .5, T.chapter({ n: 1, total: 3, tag: S.step, title: S.c1, en: 'STEP' })],
    ['ask', 1.5, T.list({ meta: 'QUESTIONS', title: S.ask.title, items: S.ask.items, icons: ['star', 'play', 'doc', 'clock'] })],
    ['rule', 1.5, T.quote(S.rule)],

    ['c2', .5, T.chapter({ n: 2, total: 3, tag: S.step, title: S.c2, en: 'STEP' })],
    ['swap', 1.5, T.compare({ left: S.swap.left, right: S.swap.right, mid: '×' })],
    ['music', 1.5, T.number({ meta: 'MUSIC', value: 10, suffix: S.music.suffix, label: S.music.label, note: S.music.note })],
    ['formats', 1.5, T.bars({ title: S.formats.title, sub: S.formats.sub, items: [['16:9', 1080, '1080'], ['1:1', 1080, '1080'], ['4:5', 1350, '1350'], ['9:16', 1920, '1920']], note: S.formats.note })],

    ['c3', .5, T.chapter({ n: 3, total: 3, tag: S.step, title: S.c3, en: 'STEP' })],
    ['flow', 1.5, T.steps({ title: S.flow.title, steps: S.flow.steps.map((label, i) => ({ label, icon: ['chat', 'doc', 'check', 'play'][i] })) })],
    ['once', 1.5, T.timeline({ title: S.once.title, events: S.once.events })],
    ['talk', 1.5, T.talk({ lines: S.talk, accent: 1, hair: 'bob' })],

    ['verdict', 1.5, T.verdict(S.verdict)],
    ['outro', 2, T.outro({
      lines: S.outro.lines, items: S.outro.items, itemsHead: 'HOW TO', source: S.outro.source,
      popup: { title: 'gento · render', lines: [S.outro.pop[0], `${W}×${H} · ${FPS} fps · ${S.outro.pop[1]}`], button: S.outro.ok },
    })],
  ],
});
