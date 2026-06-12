import { useState, useEffect } from 'react'
import { GameLayout } from '../components/GameLayout'
import { GameIcon } from '../components/GameIcons'
import { ResultScreen } from '../components/ResultScreen'

const GRAD = 'linear-gradient(135deg, #2dd4bf, #14b8a6)'

const CATEGORIES: Record<string, string[]> = {
  どうぶつ: ['🐶','🐱','🐭','🐰','🐻','🐼','🦊','🐸','🐯','🦁','🐮','🐷'],
  たべもの: ['🍎','🍊','🍋','🍇','🍓','🍑','🍕','🍜','🍦','🍩','🍫','🍭'],
  のりもの: ['🚗','🚌','🚃','🚁','✈️','🚢','🏍️','🚒','🚑','🚂','🚜','🛵'],
  かず:     ['1','2','3','4','5','6','7','8','9','10','11','12'],  // キーキャップ絵文字は機種差が大きいためプレーン数字に
}
type Cat = keyof typeof CATEGORIES
interface Size { pairs: number; cols: number; label: string }
const SIZES: Size[] = [
  { pairs: 3, cols: 3, label: '2×3（すごくかんたん）' },
  { pairs: 6, cols: 4, label: '3×4（かんたん）' },
  { pairs: 8, cols: 4, label: '4×4（ふつう）' },
  { pairs: 10, cols: 4, label: '4×5（むずかしい）' },
]

const BEST_KEY = 'densha_memory_best'
function getBest(): Record<string, number> { try { return JSON.parse(localStorage.getItem(BEST_KEY) || '{}') } catch { return {} } }
function saveBest(key: string, val: number) { const b = getBest(); if (!b[key] || val < b[key]) { b[key] = val; localStorage.setItem(BEST_KEY, JSON.stringify(b)) } }

type Card = { idx: number; emoji: string; flipped: boolean; matched: boolean }

function makeCards(cat: Cat, pairs: number): Card[] {
  const emojis = CATEGORIES[cat].slice(0, pairs)
  return [...emojis, ...emojis].map((emoji, idx) => ({ idx, emoji, flipped: false, matched: false })).sort(() => Math.random() - 0.5)
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

  useEffect(() => { if (phase !== 'play') return; const t = setInterval(() => setElapsed(e => e + 1), 1000); return () => clearInterval(t) }, [phase])

  // ⑯修正: sel のみを依存配列にして cards の変更による誤発火を防ぐ
  // cards は setCards の関数型更新で常に最新値を参照できる
  useEffect(() => {
    if (sel.length !== 2) return
    setLocked(true)
    const [i, j] = sel
    // 最新の cards を参照するために setCards のコールバック内で比較
    setCards(prev => {
      if (prev[i].emoji === prev[j].emoji) {
        // マッチ: matched フラグを立てる
        setTimeout(() => { setSel([]); setLocked(false) }, 0)
        return prev.map((c, k) => k === i || k === j ? { ...c, matched: true } : c)
      } else {
        // 不一致: 900ms後にフリップを戻す
        setTimeout(() => {
          setCards(p => p.map((c, k) => k === i || k === j ? { ...c, flipped: false } : c))
          setSel([]); setLocked(false)
        }, 900)
        return prev
      }
    })
    setMoves(m => m + 1)
  }, [sel])

  useEffect(() => { if (phase === 'play' && cards.length > 0 && cards.every(c => c.matched)) setPhase('over') }, [cards, phase])

  function flip(i: number) {
    if (locked || cards[i].flipped || cards[i].matched || sel.length >= 2) return
    setCards(prev => prev.map((c, k) => k === i ? { ...c, flipped: true } : c))
    setSel(prev => [...prev, i])
  }

  function start() {
    const size = SIZES[sizeIdx]
    setCards(makeCards(cat, size.pairs)); setSel([]); setMoves(0); setElapsed(0); setLocked(false); setPhase('play')
  }

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
  const size = SIZES[sizeIdx]; const bestKey = `${cat}_${sizeIdx}`

  if (phase === 'select') return (
    <GameLayout title="しんけいすいじゃく" gradient={GRAD}>
      <div className="flex flex-col gap-4 pt-4">
        <div className="bg-teal-50 border-2 border-teal-200 rounded-2xl p-3 flex items-center gap-3">
          {/* カードの裏表ミニプレビュー */}
          <div className="flex gap-1 shrink-0" aria-hidden="true">
            <span className="w-9 h-9 rounded-lg flex items-center justify-center text-white shadow" style={{ background: GRAD }}>
              <GameIcon id="bingo" size={16} />
            </span>
            <span className="w-9 h-9 rounded-lg flex items-center justify-center text-lg bg-white border-2 border-teal-200 shadow">🐶</span>
          </div>
          <div className="text-left flex-1">
            <p className="text-sm font-black text-teal-700">カードをめくって おなじえを 2まい みつけよう！</p>
            <p className="text-xs text-teal-600 mt-0.5">すくない てかずで クリアしよう</p>
          </div>
        </div>
        <p className="text-center text-xl font-bold text-gray-700">カテゴリをえらんでね</p>
        <div className="grid grid-cols-2 gap-2">
          {(Object.keys(CATEGORIES) as Cat[]).map(c => (
            <button key={c} onClick={() => setCat(c)} className={`py-4 text-lg font-bold rounded-2xl border-2 active:scale-95 transition-all ${cat === c ? 'text-white border-transparent' : 'bg-white text-gray-700 border-gray-200'}`} style={cat === c ? { background: GRAD } : {}}>
              {CATEGORIES[c][0]} {c}
            </button>
          ))}
        </div>
        <p className="text-center text-lg font-bold text-gray-700">サイズをえらんでね</p>
        {SIZES.map((s, i) => (
          <button key={i} onClick={() => setSizeIdx(i)} className={`py-3 text-base font-bold rounded-2xl border-2 active:scale-95 transition-all ${sizeIdx === i ? 'text-white border-transparent' : 'bg-white text-gray-700 border-gray-200'}`} style={sizeIdx === i ? { background: GRAD } : {}}>
            {s.label}{best[`${cat}_${i}`] != null ? ` ベスト${best[`${cat}_${i}`]}て` : ''}
          </button>
        ))}
        <button onClick={start} className="py-5 text-xl font-black text-white rounded-2xl shadow-lg active:scale-95 mt-2" style={{ background: GRAD }}>はじめる！</button>
      </div>
    </GameLayout>
  )

  if (phase === 'over') {
    const isNewBest = getBest()[bestKey] == null || moves < getBest()[bestKey]; saveBest(bestKey, moves)
    return (
      <GameLayout title="しんけいすいじゃく" gradient={GRAD}>
        <ResultScreen timeStr={fmt(elapsed)} extra={[{ label: 'てかず', value: `${moves}て` }]} bestStr={getBest()[bestKey] != null ? `${getBest()[bestKey]}て` : undefined} bestLabel="ベストてかず" onRetry={start} onChangeMode={() => setPhase('select')} isNewBest={isNewBest} accentColor="text-teal-500" />
      </GameLayout>
    )
  }

  return (
    <GameLayout title="しんけいすいじゃく" gradient={GRAD} isPlaying={phase === 'play'}>
      <div className="flex flex-col items-center gap-3">
        <div className="flex justify-between w-full">
          <span className="text-lg font-bold text-gray-700">{moves}て</span>
          <span className="text-lg font-bold text-gray-700">タイム {fmt(elapsed)}</span>
          <span className="text-lg font-bold text-gray-700">{cards.filter(c => c.matched).length / 2}/{size.pairs}ペア</span>
        </div>
        <div className={`grid gap-2 w-full`} style={{ gridTemplateColumns: `repeat(${size.cols}, 1fr)` }}>
          {cards.map((card, i) => (
            <div key={i} onClick={() => flip(i)} className="flip-card aspect-square cursor-pointer">
              <div className={`flip-card-inner w-full h-full ${card.flipped || card.matched ? 'flipped' : ''}`}>
                <div className="flip-card-front rounded-xl flex items-center justify-center shadow" style={{ background: GRAD }}>
                  <span className="text-white"><GameIcon id="bingo" size={26} /></span>
                </div>
                <div className={`flip-card-back rounded-xl flex items-center justify-center shadow ${card.matched ? 'border-2 border-teal-400' : 'border-2 border-teal-200'}`} style={{ background: card.matched ? '#ccfbf1' : 'white' }}>
                  <span className="text-3xl font-black text-teal-700">{card.emoji}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </GameLayout>
  )
}
