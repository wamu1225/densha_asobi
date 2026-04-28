// ゲームごとに最適化されたHTMLを生成する
// ビルド後に実行: node scripts/generate-game-pages.js
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const distDir = join(__dirname, '../dist')

const GAMES = [
  {
    path: 'math',
    title: 'けいさんスプリント | でんしゃあそび',
    desc: 'たしざん・ひきざんを30秒で何問解けるかチャレンジ！1けた・2けた・かけざんの3レベル。5れんぞくでボーナス！幼稚園・小学生向け電車ゲーム。',
    keywords: '足し算ゲーム 引き算 かけ算 小学生 幼稚園 算数 電車 暇つぶし',
  },
  {
    path: 'bigger',
    title: 'どっちがおおきい？ | でんしゃあそび',
    desc: '2けた〜4けたの数の大小をすばやく判断！連続正解でコンボボーナス。タイムアタックモードも。電車で遊べる数字ゲーム。',
    keywords: '数の大小 比較 2桁 3桁 数学 電車 子供 ゲーム',
  },
  {
    path: 'clock',
    title: 'とけいをよもう | でんしゃあそび',
    desc: 'アナログ時計を読む練習ゲーム！かんたん〜むずかしいの3段階。後半から難易度アップ。小学1〜2年生の時計の勉強に。',
    keywords: '時計 読み方 アナログ時計 小学生 算数 練習 電車 学習',
  },
  {
    path: 'bingo',
    title: 'でんしゃビンゴ | でんしゃあそび',
    desc: '電車の窓から見えるものでビンゴ！まち・しぜん・のりもの・たべもの の4テーマ。3×3と4×4が選べる。電車旅行の暇つぶしに最適！',
    keywords: 'でんしゃ ビンゴ 電車 窓 観察 ゲーム 子供 暇つぶし 旅行',
  },
  {
    path: 'color',
    title: 'いろさがしチャレンジ | でんしゃあそび',
    desc: '窓の外で指定の色や形を見つけてタップ！60秒・90秒チャレンジ。ストリークボーナスで盛り上がる。電車で遊べる観察ゲーム。',
    keywords: '色探し 形探し 観察 電車 子供 ゲーム 暇つぶし 幼稚園',
  },
  {
    path: 'memory',
    title: 'しんけいすいじゃく | でんしゃあそび',
    desc: 'どうぶつ・たべもの・のりものの絵あわせ神経衰弱。2×3の超かんたんから4×5の難しいまで4段階。何手でクリアできる？',
    keywords: '神経衰弱 記憶 絵合わせ カード 幼稚園 小学生 電車 ゲーム',
  },
  {
    path: 'next',
    title: 'つぎはどれ？ | でんしゃあそび',
    desc: '色・形・動物・数字のパターンを見て次を当てよう！2〜4要素のくりかえしや数列問題。かんたん〜むずかしいの2段階。',
    keywords: 'パターン 数列 規則 推理 幼稚園 小学生 頭の体操 電車 ゲーム',
  },
  {
    path: 'maze',
    title: 'すうじめいろ | でんしゃあそび',
    desc: '1から順番にタップするだけ！4×4と5×5、数字が消えるモードも。タイムを縮めよう。集中力・注意力を鍛える電車ゲーム。',
    keywords: '数字 迷路 順番 集中力 小学生 電車 ゲーム 数 記憶',
  },
  {
    path: 'scramble',
    title: 'もじならべ | でんしゃあそび',
    desc: 'バラバラのひらがなを並び替えて言葉を作ろう。どうぶつ・たべもの・のりもの・むずかしいの4カテゴリ。タイムアタックで何問解ける？',
    keywords: 'ひらがな 並び替え 言葉 アナグラム 小学生 国語 電車 ゲーム',
  },
  {
    path: 'search',
    title: 'ひらがなさがし | でんしゃあそび',
    desc: '6×6のひらがなグリッドから隠れた言葉を探そう！どうぶつ・くだもの・のりもの の6パズル。ワードサーチゲーム。',
    keywords: 'ひらがな 言葉探し ワードサーチ 国語 小学生 幼稚園 電車 ゲーム',
  },
  {
    path: 'dots',
    title: 'ドットつなぎ | でんしゃあそび',
    desc: '番号順に点をつないで絵を完成させよう！3点のさんかくから14点のとりまで難易度順に10パターン。',
    keywords: '点つなぎ ドット 絵 完成 幼稚園 小学生 電車 ゲーム パズル',
  },
  {
    path: 'simon',
    title: 'いろきおく | でんしゃあそび',
    desc: '光るパネルの順番を覚えてタップ！ラウンドが進むほどスピードアップ。赤・青・黄・緑の4色。ベストラウンドを目指せ！',
    keywords: 'シモン 色記憶 記憶ゲーム 光 パネル 幼稚園 小学生 電車 ゲーム',
  },
]

const BASE_URL = 'https://wamu1225.github.io/densha_asobi'

let template
try {
  template = readFileSync(join(distDir, 'index.html'), 'utf8')
} catch {
  console.error('dist/index.html が見つかりません。先に npm run build を実行してください。')
  process.exit(1)
}

let count = 0
for (const game of GAMES) {
  const dir = join(distDir, game.path)
  mkdirSync(dir, { recursive: true })

  let html = template
    // title
    .replace(/<title>[^<]*<\/title>/, `<title>${game.title}</title>`)
    // description
    .replace(/(<meta name="description" content=")[^"]*"/, `$1${game.desc}"`)
    // keywords
    .replace(/(<meta name="keywords" content=")[^"]*"/, `$1${game.keywords}"`)
    // og:title
    .replace(/(<meta property="og:title" content=")[^"]*"/, `$1${game.title}"`)
    // og:description
    .replace(/(<meta property="og:description" content=")[^"]*"/, `$1${game.desc}"`)
    // og:url
    .replace(/(<meta property="og:url" content=")[^"]*"/, `$1${BASE_URL}/${game.path}/"`)
    // twitter:title
    .replace(/(<meta name="twitter:title" content=")[^"]*"/, `$1${game.title}"`)
    // twitter:description
    .replace(/(<meta name="twitter:description" content=")[^"]*"/, `$1${game.desc}"`)
    // canonical
    .replace(/(<link rel="canonical" href=")[^"]*"/, `$1${BASE_URL}/${game.path}/"`)

  writeFileSync(join(dir, 'index.html'), html)
  count++
}

console.log(`✓ ${count}個のゲームページを生成しました`)
