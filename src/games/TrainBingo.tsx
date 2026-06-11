import { useState } from 'react'
import { GameLayout } from '../components/GameLayout'

const GRAD = 'linear-gradient(135deg, #4ade80, #22c55e)'

const THEMES = {
  まち:     ['🚗 あかいくるま','🚌 バス','🚲 じてんしゃ','🌸 はな','📮 ポスト','🏪 コンビニ','🏗️ こうじ','🚦 しんごう','🏢 たかいビル','⛽ ガソリンスタンド','👮 おまわりさん','🌳 き','🚑 きゅうきゅうしゃ','🏫 がっこう','🐕 いぬ','🅿️ ちゅうしゃじょう','🎉 かんばん','⛪ じんじゃてら','🌂 かさのひと','🚜 こうじしゃ'],
  しぜん:   ['⛰️ やま','🌊 かわ','🌉 はし','☁️ くも','🌾 たんぼ','🌲 もり','🐦 とり','🌼 のはな','🌈 にじ','❄️ ゆき','🌞 たいよう','🦋 ちょうちょ','🌿 くさ','🍂 おちば','🌙 つき','🌧️ あめ','🌫️ きり','🦅 たか','🐛 いも','🐸 かえる'],
  のりもの: ['🚃 でんしゃ','🚑 きゅうきゅうしゃ','🚒 しょうぼうしゃ','✈️ ひこうき','🚢 ふね','🏍️ バイク','🚛 トラック','🚁 ヘリコプター','🛵 スクーター','🚜 トラクター','🚧 こうじしゃ','🚂 きかんしゃ','🚤 モーターボート','🚐 マイクロバス','🚗 タクシー','🏎️ レーシングカー','🛺 さんりんしゃ','🛻 ピックアップ','🚞 やまでんしゃ','🚡 ロープウェイ'],
  たべもの: ['🍎 りんご','🍊 みかん','🍋 レモン','🍇 ぶどう','🍓 いちご','🥕 にんじん','🍙 おにぎり','🍜 ラーメン','🍦 アイス','🍰 ケーキ','🍕 ピザ','🌽 とうもろこし','🍩 ドーナツ','🧁 カップケーキ','🍫 チョコ','🍭 キャンディ','🥪 サンドイッチ','🍔 バーガー','🍟 フライドポテト','🧇 ワッフル'],
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

function Celebration({ count }: { count: number }) {
  if (count === 0) return null
  // ⑩修正: key={count} で count が変わったときだけ bounce-in が再発火する
  return (
    <div key={count} className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl px-5 py-3 text-center bounce-in w-full shadow-lg">
      <p className="text-2xl font-black text-white">
        {count === 1 ? '🎊 ビンゴ！' : count === 2 ? '🎊🎊 ダブルビンゴ！！' : `🎊 ${count}ビンゴ！！！`}
      </p>
    </div>
  )
}

const COMPLETE_KEY = 'densha_bingo_complete'
function getCompleteCount(): number { try { return parseInt(localStorage.getItem(COMPLETE_KEY) || '0') || 0 } catch { return 0 } }

export function TrainBingo() {
  const [theme, setTheme] = useState<ThemeKey | null>(null)
  const [gridSize, setGridSize] = useState<GridSize>(9)
  const [card, setCard] = useState<string[]>([])
  const [marked, setMarked] = useState(new Set<number>())
  const [bingoLines, setBingoLines] = useState<number[][]>([])
  const [completeCount, setCompleteCount] = useState(getCompleteCount)

  function start(t: ThemeKey, gs: GridSize) {
    setTheme(t); setGridSize(gs); setCard(shuffle(THEMES[t]).slice(0, gs)); setMarked(new Set()); setBingoLines([])
  }

  function tap(i: number) {
    const next = new Set(marked)
    // ⑪修正: ビンゴ成立済みのセルはunmarkできないようにロック
    const isBingoCell = new Set(bingoLines.flat()).has(i)
    if (next.has(i) && isBingoCell) return
    if (next.has(i)) { next.delete(i) } else { next.add(i) }
    setMarked(next); setBingoLines(checkBingo(next, gridSize))
    // 全マスコンプリート（全セルがビンゴラインに含まれてロックされるため二重カウントなし）
    if (next.size === gridSize) {
      const c = getCompleteCount() + 1
      localStorage.setItem(COMPLETE_KEY, String(c))
      setCompleteCount(c)
    }
  }

  const isComplete = theme != null && marked.size === gridSize

  const bingoSet = new Set(bingoLines.flat())

  // あと1個でビンゴになるセルを検出（ビンゴ未成立ラインで未マークが1つ — ダブルビンゴ後も継続）
  const almostSet = new Set<number>()
  {
    const n = Math.sqrt(gridSize)
    const allLines: number[][] = []
    for (let r = 0; r < n; r++) allLines.push(Array.from({ length: n }, (_, c) => r * n + c))
    for (let c = 0; c < n; c++) allLines.push(Array.from({ length: n }, (_, r) => r * n + c))
    allLines.push(Array.from({ length: n }, (_, i) => i * n + i))
    allLines.push(Array.from({ length: n }, (_, i) => i * n + (n - 1 - i)))
    allLines.forEach(line => {
      const unmarked = line.filter(i => !marked.has(i))
      if (unmarked.length === 1) almostSet.add(unmarked[0])
    })
  }
  const cols = gridSize === 9 ? 3 : 4
  const textSize = gridSize === 9 ? 13 : 11

  if (!theme) return (
    <GameLayout title="でんしゃビンゴ" gradient={GRAD}>
      <div className="flex flex-col items-center gap-4 pt-4">
        <p className="text-xl font-bold text-gray-700">テーマとサイズをえらんでね</p>
        <p className="text-sm text-gray-500 text-center">まどのそとでみつけたらタップ！</p>
        {completeCount > 0 && (
          <p className="text-xs font-black px-4 py-1.5 rounded-full bg-amber-100 text-amber-700">
            コンプリートした カード：{completeCount}まい
          </p>
        )}
        {(Object.keys(THEMES) as ThemeKey[]).map(t => (
          <div key={t} className="bg-white rounded-2xl border-2 border-green-200 p-4 w-full" style={{ boxShadow: '3px 4px 0 rgba(0,0,0,0.07)' }}>
            <p className="font-bold text-gray-700 mb-2">
              {t === 'まち' ? '🏙️' : t === 'しぜん' ? '🌿' : t === 'のりもの' ? '🚗' : '🍎'} {t}
            </p>
            <div className="flex gap-2">
              <button onClick={() => start(t, 9)} className="flex-1 py-3 text-sm font-bold text-white rounded-xl shadow active:scale-95" style={{ background: GRAD }}>3×3（かんたん）</button>
              <button onClick={() => start(t, 16)} className="flex-1 py-3 text-sm font-bold bg-emerald-600 text-white rounded-xl shadow active:scale-95">4×4（むずかしい）</button>
            </div>
          </div>
        ))}
      </div>
    </GameLayout>
  )

  return (
    <GameLayout title="でんしゃビンゴ" gradient={GRAD} isPlaying={marked.size > 0} hideAd>
      <div className="flex flex-col items-center gap-3">
        {/* 全マス達成: ビンゴ演出より優先して次の1枚へ誘導（dead-end解消） */}
        {isComplete ? (
          <div className="w-full rounded-2xl px-5 py-4 text-center bounce-in shadow-lg"
            style={{ background: 'linear-gradient(135deg,#fbbf24,#f43f5e)' }}>
            <p className="text-2xl font-black text-white">カード コンプリート！</p>
            <p className="text-xs font-bold text-white/90 mt-1">ぜんぶ みつけたね！（つうさん {completeCount}まいめ）</p>
            <button onClick={() => start(theme, gridSize)}
              className="mt-3 w-full py-3.5 text-base font-black rounded-xl bg-white active:scale-95"
              style={{ color: '#b45309' }}>
              あたらしいカードで もういちど！
            </button>
          </div>
        ) : (
          <Celebration count={bingoLines.length} />
        )}
        <div className="flex justify-between w-full">
          <span className="text-sm font-bold text-gray-600">{theme}・{gridSize === 9 ? '3×3' : '4×4'}</span>
          <span className="text-sm font-bold text-gray-700">{marked.size}/{gridSize} みつけた！</span>
        </div>
        <div className="grid gap-2 w-full" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
          {card.map((item, i) => {
            const isBingo = bingoSet.has(i) && marked.has(i)
            return (
              <button key={i} onClick={() => tap(i)}
                className={`aspect-square rounded-2xl flex flex-col items-center justify-center p-1.5 text-center transition-all active:scale-95 border-2 shadow ${
                  isBingo ? 'border-yellow-400' :
                  marked.has(i) ? 'border-transparent' :
                  almostSet.has(i) ? 'bg-yellow-50 border-yellow-400 cell-pulse' :
                  'bg-white border-green-200'
                }`}
                style={isBingo ? { background: 'linear-gradient(135deg,#fbbf24,#f59e0b)' } :
                  marked.has(i) ? { background: GRAD } : {}}>
                <span style={{ fontSize: 22 }}>{item.split(' ')[0]}</span>
                <span className={`font-bold leading-tight text-center ${marked.has(i) ? 'text-white' : 'text-gray-700'}`} style={{ fontSize: textSize }}>
                  {item.split(' ')[1]}
                </span>
              </button>
            )
          })}
        </div>
        <div className="flex gap-2 w-full">
          <button onClick={() => start(theme, gridSize)} className="flex-1 py-3 text-sm font-bold bg-white text-green-700 rounded-xl shadow border border-green-200 active:scale-95">カードをかえる</button>
          <button onClick={() => setTheme(null)} className="flex-1 py-3 text-sm font-bold bg-white text-gray-600 rounded-xl shadow border border-gray-200 active:scale-95">テーマをかえる</button>
        </div>
      </div>
    </GameLayout>
  )
}
