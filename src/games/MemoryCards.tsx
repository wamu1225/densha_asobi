import { useState, useEffect } from 'react'
import { GameLayout } from '../components/GameLayout'

const CATEGORIES = {
  どうぶつ: ['🐶','🐱','🐭','🐰','🐻','🐼','🦊','🐸','🐯','🦁','🐮','🐷'],
  たべもの: ['🍎','🍊','🍋','🍇','🍓','🍑','🍕','🍜','🍦','🍩','🍫','🍭'],
  のりもの: ['🚗','🚌','🚃','🚁','✈️','🚢','🏍️','🚒','🚑','🚂','🚜','🛵'],
  かず:     ['1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣','🔟','🅰️','🅱️'],
} as const

type Cat = keyof typeof CATEGORIES
type Size = { pairs: number; cols: number; label: string }

const SIZES: Size[] = [
  { pairs: 6, cols: 4, label: '3×4（かんたん）' },
  { pairs: 8, cols: 4, label: '4×4（ふつう）' },
  { pairs: 10, cols: 4, label: '4×5（むずかしい）' },
]

const BEST_KEY = 'densha_memory_best'
function getBest(): Record<string, number> {
  try { return JSON.parse(localStorage.getItem(BEST_KEY) || '{}') } catch { return {} }
}
function saveBest(key: string, val: number) {
  const b = getBest()
  if (!b[key] || val < b[key]) { b[key] = val; localStorage.setItem(BEST_KEY, JSON.stringify(b)) }
}

type Card = { id: number; emoji: string; flipped: boolean; matched: boolean }

function makeCards(cat: Cat, pairs: number): Card[] {
  const emojis = [...CATEGORIES[cat]].slice(0, pairs)
  return [...emojis, ...emojis]
    .map((emoji, id) => ({ id, emoji, flipped: false, matched: false }))
    .sort(() => Math.random() - 0.5)
}

export function MemoryCards() {
  const [phase, setPhase] = useState<'select' | 'play' | 'over'>('select')
  const [cat, setCat] = useState<Cat>('どうぶつ')
  const [sizeIdx, setSizeIdx] = useState(0)
  const [cards, setCards] = useState<Card[]>([])
  const [sel, setSel] = useState<number[]>([])
  const [moves, setMoves] = useState(0)
  const [locked, setLocked] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const best = getBest()

  useEffect(() => {
    if (phase !== 'play') return
    const t = setInterval(() => setElapsed(e => e + 1), 1000)
    return () => clearInterval(t)
  }, [phase])

  useEffect(() => {
    if (sel.length !== 2) return
    setLocked(true)
    const [i, j] = sel
    if (cards[i].emoji === cards[j].emoji) {
      setCards(prev => prev.map((c, k) => k === i || k === j ? { ...c, matched: true } : c))
      setSel([]); setLocked(false)
    } else {
      setTimeout(() => {
        setCards(prev => prev.map((c, k) => k === i || k === j ? { ...c, flipped: false } : c))
        setSel([]); setLocked(false)
      }, 900)
    }
    setMoves(m => m + 1)
  }, [sel, cards])

  useEffect(() => {
    if (phase === 'play' && cards.length > 0 && cards.every(c => c.matched)) setPhase('over')
  }, [cards, phase])

  function flip(i: number) {
    if (locked || cards[i].flipped || cards[i].matched || sel.length >= 2) return
    setCards(prev => prev.map((c, k) => k === i ? { ...c, flipped: true } : c))
    setSel(prev => [...prev, i])
  }

  function start() {
    const size = SIZES[sizeIdx]
    setCards(makeCards(cat, size.pairs))
    setSel([]); setMoves(0); setElapsed(0); setLocked(false); setPhase('play')
  }

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
  const size = SIZES[sizeIdx]
  const bestKey = `${cat}_${sizeIdx}`

  if (phase === 'select') return (
    <GameLayout title="しんけいすいじゃく" color="bg-teal-400">
      <div className="flex flex-col gap-4 pt-4">
        <p className="text-center text-xl font-bold text-gray-700">カテゴリをえらんでね</p>
        <div className="grid grid-cols-2 gap-2">
          {(Object.keys(CATEGORIES) as Cat[]).map(c => (
            <button key={c} onClick={() => setCat(c)}
              className={`py-4 text-lg font-bold rounded-2xl border-2 transition-all active:scale-95 ${cat === c ? 'bg-teal-400 text-white border-teal-400 shadow-md' : 'bg-white text-gray-700 border-gray-200'}`}>
              {CATEGORIES[c][0]} {c}
            </button>
          ))}
        </div>
        <p className="text-center text-lg font-bold text-gray-700 mt-2">サイズをえらんでね</p>
        <div className="flex flex-col gap-2">
          {SIZES.map((s, i) => (
            <button key={i} onClick={() => setSizeIdx(i)}
              className={`py-3 text-base font-bold rounded-2xl border-2 transition-all active:scale-95 ${sizeIdx === i ? 'bg-teal-400 text-white border-teal-400' : 'bg-white text-gray-700 border-gray-200'}`}>
              {s.label}
              {best[`${cat}_${i}`] != null && <span className="text-xs ml-2">🏆 最少{best[`${cat}_${i}`]}て</span>}
            </button>
          ))}
        </div>
        <button onClick={start} className="py-5 text-xl font-bold bg-teal-400 text-white rounded-2xl shadow-lg active:scale-95 mt-2">
          はじめる！
        </button>
      </div>
    </GameLayout>
  )

  if (phase === 'over') {
    saveBest(bestKey, moves)
    const b = getBest()[bestKey]
    return (
      <GameLayout title="しんけいすいじゃく" color="bg-teal-400">
        <div className="flex flex-col items-center gap-5 pt-8 bounce-in">
          <p className="text-4xl">🎉</p>
          <p className="text-3xl font-bold text-gray-700">クリア！</p>
          <div className="bg-teal-50 border-2 border-teal-200 rounded-3xl p-6 text-center w-full">
            <div className="flex justify-around">
              <div><p className="text-sm text-gray-500">てかず</p><p className="text-4xl font-bold text-teal-500">{moves}</p></div>
              <div><p className="text-sm text-gray-500">タイム</p><p className="text-4xl font-bold text-teal-500">{fmt(elapsed)}</p></div>
            </div>
            {b != null && <p className="text-sm text-gray-400 mt-3">🏆 ベスト {b}て</p>}
          </div>
          <div className="flex gap-3 w-full">
            <button onClick={start} className="flex-1 py-4 text-lg font-bold bg-teal-400 text-white rounded-2xl shadow active:scale-95">もういちど</button>
            <button onClick={() => setPhase('select')} className="flex-1 py-4 text-lg font-bold bg-gray-200 text-gray-700 rounded-2xl active:scale-95">もどる</button>
          </div>
        </div>
      </GameLayout>
    )
  }

  const colClass = `grid-cols-${size.cols}`

  return (
    <GameLayout title="しんけいすいじゃく" color="bg-teal-400">
      <div className="flex flex-col items-center gap-3">
        <div className="flex justify-between w-full">
          <span className="text-lg font-bold text-gray-700">🃏 {moves}て</span>
          <span className="text-lg font-bold text-gray-700">⏱ {fmt(elapsed)}</span>
          <span className="text-lg font-bold text-gray-700">{cards.filter(c => c.matched).length / 2}/{size.pairs}ペア</span>
        </div>
        <div className={`grid ${colClass} gap-2 w-full`}>
          {cards.map((card, i) => (
            <div key={i} onClick={() => flip(i)} className="flip-card aspect-square cursor-pointer">
              <div className={`flip-card-inner w-full h-full ${card.flipped || card.matched ? 'flipped' : ''}`}>
                <div className="flip-card-front bg-teal-400 rounded-xl flex items-center justify-center shadow">
                  <span className="text-2xl">🎴</span>
                </div>
                <div className={`flip-card-back rounded-xl flex items-center justify-center shadow ${card.matched ? 'bg-green-100 border-2 border-green-400' : 'bg-white border-2 border-teal-200'}`}>
                  <span className="text-3xl">{card.emoji}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </GameLayout>
  )
}
