// Words from the Gods：今天还在用的希腊神话词
// 96 BPM（里拉琴），一小节 2.5 秒，18 小节 = 45 秒。英日中三语并排。
// 画面：博物馆开放馆藏（CC0）与公有领域名画，统一调成大理石白 + 赭红。
// 文案为自拟，内容取自赫西俄德《神谱》、荷马《奥德赛》、奥维德《变形记》、斯塔提乌斯《阿喀琉斯纪》、《荷马颂歌·致潘》。

const CREDIT = {
  vase: 'Panathenaic prize amphora, ca. 510 BCE · The Met · CC0',
  nike: 'Winged Victory of Samothrace, ca. 190 BCE · Louvre · photo: Wilfredor, CC0',
  echo: 'J. W. Waterhouse, Echo and Narcissus, 1903 · Walker Art Gallery · public domain',
  pan: 'Marble statue of Pan, 1st century CE · The Met · CC0',
  achilles: 'P. P. Rubens, Thetis Dipping Achilles into the Styx, 1630–35 · Museum Boijmans Van Beuningen · public domain',
  atlas: 'Farnese Atlas, 2nd century CE · National Archaeological Museum, Naples · photo: Carlo Raso, public domain',
  muses: 'Sarcophagus with the Muses and the Sirens, 3rd century CE · The Met · CC0',
  narcissus: 'Caravaggio, Narcissus, ca. 1600 · Galleria Nazionale d’Arte Antica · public domain',
  tantalus: 'G. Assereto, Tantalus, 1630s–40s · Schloss Eggenberg, Graz · public domain',
  odysseus: 'J. W. Waterhouse, Ulysses and the Sirens, 1891 · National Gallery of Victoria · public domain',
};

FILM({
  hud: { off: true },
  scenes: [
    ['open', 1, T.montage({ kind: 'open', center: true, items: [
      { img: 'nike', cut: true, crop: [0, 0, 1, .55], scale: .95, head: { en: 'NIKE', ja: 'ナイキ', zh: '耐克' } },
      { img: 'echo', cam: [[0, .16, .42, 1.9], [1, .18, .42, 2.05]], head: { en: 'ECHO', ja: 'エコー', zh: '回声' } },
      { img: 'pan', cut: true, crop: [0, 0, 1, .5], scale: .95, head: { en: 'PANIC', ja: 'パニック', zh: '恐慌' } },
      { img: 'atlas', cut: true, crop: [0, 0, 1, .55], scale: .95, head: { en: 'ATLAS', ja: 'アトラス', zh: '阿特拉斯' } },
    ] })],

    ['title', 1.5, T.statue({ img: 'vase', side: 'right', scale: .86, titleSize: 130,
      title: { en: 'Words from the Gods', ja: '神々から来た言葉', zh: '来自众神的词' },
      body: { en: 'Greek myths still hiding in everyday words', ja: 'いまも毎日の言葉に残るギリシャ神話', zh: '藏在日常词语里的希腊神话' },
      credit: CREDIT.vase })],

    ['nike', 2, T.statue({ img: 'nike', crop: [0, 0, 1, .62], big: 'NIKE', side: 'right', scale: .94,
      title: { en: 'Nike, goddess of victory', ja: '勝利の女神ニケ', zh: '胜利女神尼刻' },
      body: { en: 'Her name went to a sports brand.', ja: 'その名はスポーツブランドになった。', zh: '她的名字给了运动品牌耐克。' },
      credit: CREDIT.nike })],

    ['echo', 2, T.plate({ img: 'echo', side: 'right', cam: [[0, .14, .42, 1.75], [.35, .16, .44, 1.6], [1, .52, .55, 1.3]],
      head: { en: 'ECHO', ja: 'エーコー', zh: '厄科' },
      body: { en: 'A nymph who could only repeat the last words of others, until only her voice remained.', ja: '人の言葉の終わりしか繰り返せず、やがて声だけが残ったニンフ。', zh: '只能重复别人话尾的仙女，最后只剩下声音。' },
      credit: CREDIT.echo })],

    ['panic', 2, T.statue({ img: 'pan', big: 'PANIC', side: 'left', scale: .94,
      title: { en: 'Pan, god of the wild', ja: '牧神パン', zh: '牧神潘' },
      body: { en: 'Sudden fear in lonely places was blamed on him: panic.', ja: '野山で急に襲う恐怖は彼のしわざとされた。それがパニック。', zh: '荒野里突如其来的恐惧被算在他头上，这就是 panic（恐慌）。' },
      credit: CREDIT.pan })],

    ['achilles', 2, T.plate({ img: 'achilles', side: 'right', cam: [[0, .64, .42, 1.12], [.3, .64, .5, 1.18], [1, .68, .74, 1.6]],
      head: { en: 'ACHILLES', ja: 'アキレウス', zh: '阿喀琉斯' },
      body: { en: 'Dipped in the Styx, safe everywhere but the heel his mother held. The tendon still carries his name.', ja: '冥界の川に浸され、母がつかんだかかとだけが弱点に。アキレス腱の名はここから。', zh: '被浸入冥河，只有母亲捏住的脚跟是弱点，跟腱因此以他命名。' },
      credit: CREDIT.achilles })],

    ['atlas', 2, T.statue({ img: 'atlas', big: 'ATLAS', side: 'right', scale: .94,
      title: { en: 'Atlas, who holds up the sky', ja: '天を支える巨人アトラス', zh: '擎天的泰坦阿特拉斯' },
      body: { en: 'The first bone of your neck, which holds up your head, is called the atlas.', ja: '頭を支える第一頸椎も「アトラス（環椎）」と呼ばれる。', zh: '托住脑袋的第一颈椎也叫 atlas（寰椎）。' },
      credit: CREDIT.atlas })],

    ['more', 2, T.montage({ per: 2, items: [
      { img: 'muses', cut: true, scale: .36, head: { en: 'MUSES → MUSEUM, MUSIC', ja: 'ミューズ → ミュージアム、ミュージック', zh: '缪斯 → 博物馆、音乐' }, credit: CREDIT.muses },
      { img: 'narcissus', cam: [[0, .5, .3, 1.1], [1, .5, .38, 1.25]], head: { en: 'NARCISSUS → NARCISSISM', ja: 'ナルキッソス → ナルシシズム', zh: '纳西索斯 → 自恋' }, credit: CREDIT.narcissus },
      { img: 'tantalus', cam: [[0, .5, .25, 1.1], [1, .45, .3, 1.28]], head: { en: 'TANTALUS → TANTALIZE', ja: 'タンタロス → じらす（tantalize）', zh: '坦塔罗斯 → 可望不可即（tantalize）' }, credit: CREDIT.tantalus },
      { img: 'odysseus', cam: [[0, .35, .5, 1.25], [1, .6, .5, 1.35]], head: { en: 'ODYSSEUS → ODYSSEY', ja: 'オデュッセウス → 長い旅（odyssey）', zh: '奥德修斯 → 漫长旅程（odyssey）' }, credit: CREDIT.odysseus },
    ] })],

    ['verdict', 1.5, T.verdict({ lead: { en: 'Old gods, new words', ja: '古い神々、新しい言葉', zh: '古老的神，今天的词' }, seal: 'ΜΥΘΟΣ', tail: 'FIN.', tailSub: 'MYTHOS = STORY' })],

    ['credits', 2, T.credits({
      title: { en: 'Artworks and sources', ja: '作品と出典', zh: '作品与出处' },
      items: ['vase', 'nike', 'echo', 'pan', 'achilles', 'atlas', 'muses', 'narcissus', 'tantalus', 'odysseus'].map(k => ({ img: k, cut: ['vase', 'nike', 'pan', 'atlas', 'muses'].includes(k), credit: CREDIT[k] })),
      note: { en: 'Text written for this film from Hesiod, Homer, Ovid, Statius and the Homeric Hymn to Pan', ja: '文はヘシオドス、ホメロス、オウィディウス、スタティウス、『ホメーロス風讃歌』をもとに書き下ろし', zh: '文字依据赫西俄德、荷马、奥维德、斯塔提乌斯与《荷马颂歌·致潘》撰写' },
    })],
  ],
});
