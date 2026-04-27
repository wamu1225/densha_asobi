import { useState } from 'react'
import { GameLayout } from '../components/GameLayout'

const THEMES = {
  まち: ['🚗 あかいくるま','🚌 バス','🚲 じてんしゃ','🌸 はな','📮 ポスト','🏪 コンビニ','🏗️ こうじ','🚦 しんごう','🏢 たかいビル','⛽ ガソリンスタンド','👮 おまわりさん','🌳 き','🚑 きゅうきゅうしゃ','🏫 がっこう','🐕 いぬ','🅿️ ちゅうしゃじょう','🎉 かんばん','⛪ じんじゃてら','🌂 かさのひと','🚜 こうじしゃ'],
  しぜん: ['⛰️ やま','🌊 かわ','🌉 はし','☁️ くも','🌾 たんぼ','🌲 もり','🐦 とり','🌼 のはな','🌈 にじ','❄️ ゆき','🌞 たいよう','🦋 ちょうちょ','🌿 くさ','🍂 おちば','🌙 つき','🌧️ あめ','🌫️ きり','🦅 たか','🐛 いも','🐸 かえる'],
  のりもの: ['🚃 でんしゃ','🚑 きゅうきゅうしゃ','🚒 しょうぼうしゃ','✈️ ひこうき','🚢 ふね','🏍️ バイク','🚛 トラック','🚁 ヘリコプター','🛵 スクーター','🚜 トラクター','🚧 こうじしゃ','🚂 きかんしゃ','🚤 モーターボート','🚐 マイクロバス','🚗 タクシー','🏎️ レーシングカー','🛺 さんりんしゃ','🛻 ピックアップ','🚞 やまのてでんしゃ','🚡 ロープウェイ'],
  たべもの: ['🍎 りんご','🍊 みかん','🍋 レモン','🍇 ぶどう','🍓 いちご','🥕 にんじん','🍙 おにぎり','🍜 ラーメン','🍦 アイスクリーム','🍰 ケーキ','🍕 ピザ','🌽 とうもろこし','🍩 ドーナツ','🧁 カップケーキ','🍫 チョコ','🍭 キャンディ','🥪 サンドイッチ','🍔 バーガー','🍟 フライドポテト','🧇 ワッフル'],
} as const

type ThemeKey = keyof typeof THEMES
type GridSize = 9 | 16

function shuffle<T>(arr: readonly T[]): T[] { return [...arr].sort(() => Math.random() - 0.5) }

function checkBingo(marked: Set<number>, size: number): number[][] {
  const n = Math.sqrt(size)
  const lines: number[][] = []
  for (let r = 0; r < n; r++) lines.push(Array.from({ length: n }, (_, c) => r * n + c))
  for (let c = 0; c < n; c++) lines.push(Array.from({ length: n }, (_, r) => r * n + c))
  lines.push(Array.from({ length: n }, (_, i) => i * n + i))
  lines.push(Array.from({ length: n }, (_, i) => i * n + (n - 1 - i)))
  return lines.filter(line => line.every(i => marked.has(i)))
}

function Firework() {
  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
      {['🎊','🎉','⭐','🌟','✨'].map((e, i) => (
        <span key={i} className="absolute text-4xl bounce-in" style={{ top: `${20 + Math.random() * 60}%`, left: `${10 + Math.random() * 80}%`, animationDelay: `${i * 0.1}s` }}>{e}</span>
      ))}
    </div>
  )
}

export function TrainBingo() {
  const [theme, setTheme] = useState<ThemeKey | null>(null)
  const [gridSize, setGridSize] = useState<GridSize>(9)
  const [card, setCard] = useState<string[]>([])
  const [marked, setMarked] = useState(new Set<number>())
  const [bingoLines, setBingoLines] = useState<number[][]>([])
  const [showFirework, setShowFirework] = useState(false)

  function start(t: ThemeKey, gs: GridSize) {
    setTheme(t); setGridSize(gs)
    setCard(shuffle(THEMES[t]).slice(0, gs))
    setMarked(new Set()); setBingoLines([]); setShowFirework(false)
  }

  function tap(i: number) {
    const next = new Set(marked)
    if (next.has(i)) { next.delete(i) } else { next.add(i) }
    setMarked(next)
    const lines = checkBingo(next, gridSize)
    const newBingo = lines.length > bingoLines.length
    setBingoLines(lines)
    if (newBingo) { setShowFirework(true); setTimeout(() => setShowFirework(false), 2000) }
  }

  const bingoCount = bingoLines.length
  const bingoSet = new Set(bingoLines.flat())
  const cols = gridSize === 9 ? 'grid-cols-3' : 'grid-cols-4'
  const textSize = gridSize === 9 ? 'text-sm' : 'text-xs'

  if (!theme) return (
    <GameLayout title="でんしゃビンゴ" color="bg-green-400">
      <div className="flex flex-col items-center gap-4 pt-4">
        <p className="text-xl font-bold text-gray-700">テーマとサイズをえらんでね</p>
        <p className="text-sm text-gray-500 text-center">まどの そとで みつけたら タップ！</p>
        {(Object.keys(THEMES) as ThemeKey[]).map(t => (
          <div key={t} className="bg-white rounded-2xl border-2 border-green-200 p-3 w-full shadow">
            <p className="font-bold text-gray-700 mb-2">{t === 'まち' ? '🏙️' : t === 'しぜん' ? '🌿' : t === 'のりもの' ? '🚗' : '🍎'} {t}</p>
            <div className="flex gap-2">
              <button onClick={() => start(t, 9)} className="flex-1 py-3 text-base font-bold bg-green-400 text-white rounded-xl active:scale-95">3×3（かんたん）</button>
              <button onClick={() => start(t, 16)} className="flex-1 py-3 text-base font-bold bg-emerald-600 text-white rounded-xl active:scale-95">4×4（むずかしい）</button>
            </div>
          </div>
        ))}
      </div>
    </GameLayout>
  )

  return (
    <GameLayout title="でんしゃビンゴ" color="bg-green-400">
      {showFirework && <Firework />}
      <div className="flex flex-col items-center gap-3">
        {bingoCount > 0 && (
          <div className="bg-yellow-100 border-2 border-yellow-400 rounded-2xl px-6 py-2 text-center bounce-in w-full">
            <p className="text-2xl font-bold text-yellow-600">
              {bingoCount === 1 ? '🎊 ビンゴ！' : bingoCount === 2 ? '🎊 ダブルビンゴ！！' : `🎊 ${bingoCount}ビンゴ！！！`}
            </p>
          </div>
        )}
        <div className="flex justify-between w-full items-center">
          <span className="text-sm font-bold text-gray-600">{theme}・{gridSize === 9 ? '3×3' : '4×4'}</span>
          <span className="text-sm font-bold text-gray-700">{marked.size}/{gridSize} みつけた！</span>
        </div>
        <div className={`grid ${cols} gap-2 w-full`}>
          {card.map((item, i) => {
            const isBingoCell = bingoSet.has(i)
            return (
              <button key={i} onClick={() => tap(i)}
                className={`aspect-square rounded-xl flex flex-col items-center justify-center p-1 text-center transition-all active:scale-95 border-2 ${
                  isBingoCell && marked.has(i) ? 'bg-yellow-400 border-yellow-500 text-white shadow-md' :
                  marked.has(i) ? 'bg-green-400 border-green-500 text-white shadow' :
                  'bg-white border-green-200 text-gray-700'
                }`}>
                <span className="text-xl">{item.split(' ')[0]}</span>
                <span className={`${textSize} font-bold mt-0.5 leading-tight`}>{item.split(' ')[1]}</span>
              </button>
            )
          })}
        </div>
        <div className="flex gap-2 w-full">
          <button onClick={() => start(theme, gridSize)} className="flex-1 py-3 text-sm font-bold bg-green-100 text-green-700 rounded-xl active:scale-95">カードをかえる</button>
          <button onClick={() => setTheme(null)} className="flex-1 py-3 text-sm font-bold bg-gray-200 text-gray-600 rounded-xl active:scale-95">テーマをかえる</button>
        </div>
      </div>
    </GameLayout>
  )
}
