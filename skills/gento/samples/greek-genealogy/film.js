// 新模板样片：T.void、T.tree、T.statue（糊化底图）、T.trio、T.pantheon、T.montage（小标题、金雨），四种转场与闪电。
// 谱系依据赫西俄德《神谱》：阿特拉斯是伊阿珀托斯与克吕墨涅之子，尼刻是帕拉斯与斯堤克斯之女；阿喀琉斯是珀琉斯与忒提斯之子。
const N = (en, ja, zh) => ({ en, ja, zh });
const TREE = {
  iapetus: { name: N('Iapetus', 'イアペトス', '伊阿珀托斯'), at: [-2.6, 0] },
  clymene: { name: N('Clymene', 'クリュメネ', '克吕墨涅'), at: [-1.4, 0] },
  pallas: { name: N('Pallas', 'パラス', '帕拉斯'), at: [-.6, 0] },
  styx: { name: N('Styx', 'ステュクス', '斯堤克斯'), at: [.6, 0] },
  peleus: { name: N('Peleus', 'ペレウス', '珀琉斯'), at: [1.4, 0] },
  thetis: { name: N('Thetis', 'テティス', '忒提斯'), at: [2.6, 0] },
  atlas: { name: N('Atlas', 'アトラス', '阿特拉斯'), at: [-2, 1.4], parents: ['iapetus', 'clymene'], img: 'atlas', face: [.5, .2, 2.4], r: .3 },
  nike: { name: N('Nike', 'ニケ', '尼刻'), at: [0, 1.4], parents: ['pallas', 'styx'], img: 'nike', face: [.5, .3, 1.6], r: .3 },
  achilles: { name: N('Achilles', 'アキレウス', '阿喀琉斯'), at: [2, 1.4], parents: ['peleus', 'thetis'], img: 'achilles', face: [.62, .45, 2.2], r: .3 },
};
FILM({
  hud: { off: true },
  scenes: [
    ['void', 2, T.void({ kind: 'open', kicker: 'SAMPLE', big: N('MYTHOS', 'ミュトス', '神话'), body: N('Three families from Hesiod’s Theogony', 'ヘシオドス『神統記』の三つの家系', '赫西俄德《神谱》里的三个家族'), back: [{ type: 'vortex', grow: 4 }, { type: 'stars', alpha: .6 }] })],
    ['tree', 3, T.tree({ nodes: TREE, show: ['iapetus', 'clymene', 'pallas', 'styx', 'peleus', 'thetis'], grow: ['atlas', 'nike', 'achilles'], focus: 'nike',
      caption: N('Each child hangs from the line between its parents', '子は両親を結ぶ線から下がる', '孩子挂在父母之间的连线下') }), { trans: { type: 'ink', len: .8 } }],
    ['statue', 3, T.statue({ img: 'atlas', backdrop: 'achilles', big: 'ATLAS', side: 'right', title: N('Atlas', 'アトラス', '阿特拉斯'), body: N('Son of Iapetus, made to hold up the sky', 'イアペトスの子、天を支える罰を受けた', '伊阿珀托斯之子，被罚擎天'), credit: 'Farnese Atlas · National Archaeological Museum, Naples · photo: Carlo Raso, public domain', back: [{ type: 'dust', n: 60 }] }),
      { trans: { type: 'shatter', len: .8 }, hot: true, fx: [{ type: 'lightning', at: 2, x0: .8, y0: -.05, x1: .62, y1: .6, seed: 3 }] }],
    ['trio', 3, T.trio({ caption: N('Three children, three fates', '三人の子、三つの運命', '三个孩子，三种命运'), items: [
      { img: 'atlas', cut: true, crop: [0, 0, 1, .7], fx: 'rays', name: N('Atlas', 'アトラス', '阿特拉斯'), role: N('the sky', '天空', '天空') },
      { img: 'nike', cut: true, crop: [0, 0, 1, .7], fx: 'stars', name: N('Nike', 'ニケ', '尼刻'), role: N('victory', '勝利', '胜利') },
      { img: 'pan', cut: true, crop: [0, 0, 1, .7], fx: 'embers', name: N('Pan', 'パン', '潘'), role: N('the wild', '野山', '荒野') },
    ] }), { trans: { type: 'sand', len: .9 } }],
    ['wall', 3, T.pantheon({ title: N('Names we still use', 'いまも使う名前', '今天还在用的名字'), note: N('Faces cropped from the sample artworks', '顔は同梱の作品から切り出し', '像章取自样片自带的作品'), items: [
      { img: 'nike', face: [.5, .3, 1.6], name: N('Nike', 'ニケ', '尼刻') }, { img: 'pan', face: [.5, .15, 2.4], name: N('Pan', 'パン', '潘') },
      { img: 'atlas', face: [.5, .2, 2.4], name: N('Atlas', 'アトラス', '阿特拉斯') }, { img: 'echo', face: [.18, .4, 2.2], name: N('Echo', 'エコー', '厄科') },
      { img: 'achilles', face: [.62, .45, 2.2], name: N('Achilles', 'アキレウス', '阿喀琉斯') }, { img: 'narcissus', face: [.5, .3, 2], name: N('Narcissus', 'ナルキッソス', '纳西索斯') },
    ] }), { trans: { type: 'zoom', len: .5 }, calm: true }],
    ['montage', 2, T.montage({ per: 4, back: [{ type: 'embers', fall: true, color: '#F3C45A', n: 90 }], items: [
      { img: 'odysseus', kicker: 'ODYSSEY', cam: [[0, .35, .5, 1.25], [1, .6, .5, 1.35]], head: N('THE SIRENS', 'セイレーン', '塞壬') },
      { img: 'tantalus', kicker: 'UNDERWORLD', cam: [[0, .5, .25, 1.1], [1, .45, .3, 1.28]], head: N('TANTALUS', 'タンタロス', '坦塔罗斯') },
    ] }), { trans: { type: 'ink', len: .6 } }],
  ],
});
