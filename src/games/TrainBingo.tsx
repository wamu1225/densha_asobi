import { useState } from 'react'
import { GameLayout } from '../components/GameLayout'

const THEMES = {
  まち: ['🚗 あかいくるま', '🚌 バス', '🚲 じてんしゃ', '🌸 はな', '📮 ポスト', '🏪 コンビニ', '🏗️ こうじ', '🚦 しんごう', '🏢 たかいビル', '⛽ ガソリンスタンド', '👮 おまわりさん', '🌳 き'],
  しぜん: ['⛰️ やま', '🌊 かわ', '🌉 はし', '☁️ くも', '🌾 たんぼ', '🌲 もり', '🐦 とり', '🌼 のはな', '🌙 つき', '🌈 にじ', '⚡ かみなり', '❄️ ゆき'],
  のりもの: ['🚃 でんしゃ', '🚑 きゅうきゅうしゃ', '🚒 しょうぼうしゃ', '✈️ ひこうき', '🚢 ふね', '🏍️ バイク', '🚛 トラック', '🚁 ヘリコプター', '🛵 スクーター', '🚜 トラクター', '🚧 こうじしゃ', '🚂 きかんしゃ'],
}

type ThemeKey = keyof typeof THEMES

function shuffle<T>(arr: T[]) {
  return [...arr].sort(() => Math.random() - 0.5)
}

function checkBingo(marked: Set<number>) {
  const lines = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6],
  ]
  return lines.some(line => line.every(i => marked.has(i)))
}

export function TrainBingo() {
  const [theme, setTheme] = useState<ThemeKey | null>(null)
  const [card, setCard] = useState<string[]>([])
  const [marked, setMarked] = useState(new Set<number>())
  const [bingo, setBingo] = useState(false)

  function start(t: ThemeKey) {
    setTheme(t)
    setCard(shuffle(THEMES[t]).slice(0, 9))
    setMarked(new Set())
    setBingo(false)
  }

  function tap(i: number) {
    if (bingo) return
    const next = new Set(marked)
    if (next.has(i)) { next.delete(i) } else { next.add(i) }
    setMarked(next)
    if (checkBingo(next)) setBingo(true)
  }

  if (!theme) return (
    <GameLayout title="でんしゃビンゴ" color="bg-green-400">
      <div className="flex flex-col items-center gap-5 pt-8">
        <p className="text-xl font-bold text-gray-700">テーマをえらんでね</p>
        <p className="text-sm text-gray-500 text-center">まどの そとで みつけたら タップ！</p>
        {(Object.keys(THEMES) as ThemeKey[]).map(t => (
          <button key={t} onClick={() => start(t)} className="w-full py-6 text-2xl font-bold bg-green-400 text-white rounded-2xl shadow-lg active:scale-95">
            {t === 'まち' ? '🏙️' : t === 'しぜん' ? '🌿' : '🚗'} {t}
          </button>
        ))}
      </div>
    </GameLayout>
  )

  return (
    <GameLayout title="でんしゃビンゴ" color="bg-green-400">
      <div className="flex flex-col items-center gap-4">
        {bingo && (
          <div className="bg-yellow-100 border-2 border-yellow-400 rounded-2xl px-6 py-3 text-center bounce-in">
            <p className="text-3xl font-bold text-yellow-600">🎊 ビンゴ！🎊</p>
          </div>
        )}
        <div className="flex justify-between w-full items-center">
          <span className="text-sm text-gray-500">{theme}テーマ</span>
          <span className="text-sm font-bold text-gray-700">{marked.size}/9 みつけた！</span>
        </div>
        <div className="grid grid-cols-3 gap-2 w-full">
          {card.map((item, i) => (
            <button
              key={i}
              onClick={() => tap(i)}
              className={`aspect-square rounded-2xl flex flex-col items-center justify-center p-2 text-center transition-all active:scale-95 border-2 ${
                marked.has(i)
                  ? 'bg-green-400 border-green-500 text-white shadow-md'
                  : 'bg-white border-green-200 text-gray-700 shadow'
              }`}
            >
              <span className="text-2xl">{item.split(' ')[0]}</span>
              <span className="text-xs font-bold mt-1 leading-tight">{item.split(' ')[1]}</span>
            </button>
          ))}
        </div>
        <div className="flex gap-3 w-full">
          <button onClick={() => start(theme)} className="flex-1 py-3 text-base font-bold bg-green-100 text-green-700 rounded-2xl active:scale-95">
            カードをかえる
          </button>
          <button onClick={() => setTheme(null)} className="flex-1 py-3 text-base font-bold bg-gray-200 text-gray-600 rounded-2xl active:scale-95">
            テーマをかえる
          </button>
        </div>
      </div>
    </GameLayout>
  )
}
