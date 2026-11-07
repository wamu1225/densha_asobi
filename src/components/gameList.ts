// 全ゲームの一覧（結果画面の「つぎは」と、ゲーム画面の下の「ほかの あそび」で使う）。色はトップの区分の色
export const ALL_GAMES = [
  { path: '/math',     icon: 'math',     name: 'けいさんスプリント',  color: '#C8352A' },
  { path: '/bigger',   icon: 'bigger',   name: 'どっちがおおきい？',  color: '#C8352A' },
  { path: '/clock',    icon: 'clock',    name: 'とけいをよもう',      color: '#C8352A' },
  { path: '/bingo',    icon: 'bingo',    name: 'でんしゃビンゴ',      color: '#217A4B' },
  { path: '/color',    icon: 'color',    name: 'いろさがし',          color: '#217A4B' },
  { path: '/memory',   icon: 'memory',   name: 'しんけいすいじゃく',  color: '#6B3FC0' },
  { path: '/next',     icon: 'next',     name: 'つぎはどれ？',        color: '#6B3FC0' },
  { path: '/simon',    icon: 'simon',    name: 'いろきおく',          color: '#6B3FC0' },
  { path: '/maze',     icon: 'maze',     name: 'すうじめいろ',        color: '#C8352A' },
  { path: '/scramble', icon: 'scramble', name: 'もじならべ',          color: '#2558C4' },
  { path: '/search',   icon: 'search',   name: 'ひらがなさがし',      color: '#2558C4' },
  { path: '/riddles',  icon: 'riddles',  name: 'なぞなぞ',            color: '#2558C4' },
  { path: '/dots',     icon: 'dots',     name: 'ドットつなぎ',        color: '#6B3FC0' },
  { path: '/numberguess', icon: 'numberguess', name: 'かずあて',      color: '#C8352A' },
  { path: '/trap',     icon: 'trap',     name: 'トロッコ とおせんぼ', color: '#6B3FC0' },
  { path: '/rail',     icon: 'rail',     name: 'せんろ つなぎ',       color: '#6B3FC0' },
  { path: '/wanwan',   icon: 'wanwan',   name: 'わんわん つかまえっこ', color: '#6B3FC0' },
  { path: '/shunt',    icon: 'shunt',    name: 'れっしゃ いれかえ',   color: '#6B3FC0' },
]

// 本番は /memory/ のように末尾に / が つくので、そろえてから くらべる
export function samePath(a: string, b: string) {
  return a.replace(/\/+$/, '') === b.replace(/\/+$/, '')
}

// いまの ゲームの つぎから じゅんに n本（新しいゲームにも 下の ページから リンクが とどくように）
export function nextGames(path: string, n: number) {
  path = path.replace(/\/+$/, '')
  const i = ALL_GAMES.findIndex(g => g.path === path)
  return Array.from({ length: n }, (_, k) => ALL_GAMES[(i + 1 + k + ALL_GAMES.length) % ALL_GAMES.length]).filter(g => g.path !== path)
}
