import { useState, useEffect } from 'react'
import { GameLayout } from '../components/GameLayout'

const EMOJI_POOL = ['🐶','🐱','🐭','🐹','🐰','🐻','🐼','🦊','🐸','🐯','🦁','🐮','🐷','🐙','🐧','🐦']

function makeCards(n: number) {
  const emojis = EMOJI_POOL.slice(0, n)
  return [...emojis, ...emojis]
    .map((e, id) => ({ id, emoji: e, flipped: false, matched: false }))
    .sort(() => Math.random() - 0.5)
    .map((c, i) => ({ ...c, index: i }))
}

type Card = { id: number; emoji: string; flipped: boolean; matched: boolean; index: number }

export function MemoryCards() {
  const [size, setSize] = useState(0)
  const [cards, setCards] = useState<Card[]>([])
  const [selected, setSelected] = useState<number[]>([])
  const [moves, setMoves] = useState(0)
  const [done, setDone] = useState(false)
  const [locked, setLocked] = useState(false)

  function start(pairs: number) {
    setSize(pairs)
    setCards(makeCards(pairs))
    setSelected([])
    setMoves(0)
    setDone(false)
    setLocked(false)
  }

  useEffect(() => {
    if (selected.length !== 2) return
    setLocked(true)
    const [i, j] = selected
    const a = cards[i], b = cards[j]
    if (a.emoji === b.emoji) {
      setCards(prev => prev.map(c => c.index === i || c.index === j ? { ...c, matched: true } : c))
      setSelected([])
      setLocked(false)
    } else {
      setTimeout(() => {
        setCards(prev => prev.map(c => c.index === i || c.index === j ? { ...c, flipped: false } : c))
        setSelected([])
        setLocked(false)
      }, 900)
    }
    setMoves(m => m + 1)
  }, [selected])

  useEffect(() => {
    if (cards.length > 0 && cards.every(c => c.matched)) setDone(true)
  }, [cards])

  function flip(i: number) {
    if (locked) return
    const card = cards[i]
    if (card.flipped || card.matched) return
    if (selected.length >= 2) return
    setCards(prev => prev.map(c => c.index === i ? { ...c, flipped: true } : c))
    setSelected(prev => [...prev, i])
  }

  const cols = size === 6 ? 'grid-cols-4' : size === 8 ? 'grid-cols-4' : 'grid-cols-4'

  if (size === 0) return (
    <GameLayout title="しんけいすいじゃく" color="bg-teal-400">
      <div className="flex flex-col items-center gap-5 pt-8">
        <p className="text-xl font-bold text-gray-700">むずかしさをえらんでね</p>
        {[{ pairs: 6, label: '🌟 かんたん (6ペア)', cols: '3×4' }, { pairs: 8, label: '🔥 ふつう (8ペア)', cols: '4×4' }].map(o => (
          <button key={o.pairs} onClick={() => start(o.pairs)} className="w-full py-6 text-xl font-bold bg-teal-400 text-white rounded-2xl shadow-lg active:scale-95">
            {o.label} <span className="text-sm font-normal">({o.cols})</span>
          </button>
        ))}
      </div>
    </GameLayout>
  )

  if (done) return (
    <GameLayout title="しんけいすいじゃく" color="bg-teal-400">
      <div className="flex flex-col items-center gap-6 pt-10 bounce-in">
        <p className="text-4xl">🎉</p>
        <p className="text-3xl font-bold text-gray-700">クリア！</p>
        <div className="bg-teal-100 rounded-3xl p-6 text-center">
          <p className="text-lg text-gray-600">かかった てつかず</p>
          <p className="text-6xl font-bold text-teal-500 mt-2">{moves}<span className="text-2xl">かい</span></p>
        </div>
        <div className="flex gap-3 w-full">
          <button onClick={() => start(size)} className="flex-1 py-4 text-lg font-bold bg-teal-400 text-white rounded-2xl shadow active:scale-95">もういちど</button>
          <button onClick={() => setSize(0)} className="flex-1 py-4 text-lg font-bold bg-gray-200 text-gray-700 rounded-2xl active:scale-95">もどる</button>
        </div>
      </div>
    </GameLayout>
  )

  return (
    <GameLayout title="しんけいすいじゃく" color="bg-teal-400">
      <div className="flex flex-col items-center gap-4">
        <div className="flex justify-between w-full">
          <span className="text-lg font-bold text-gray-700">🃏 {moves}てめ</span>
          <span className="text-lg font-bold text-gray-700">{cards.filter(c => c.matched).length / 2}/{size} ペア</span>
        </div>
        <div className={`grid ${cols} gap-2 w-full`}>
          {cards.map((card) => (
            <div key={card.index} onClick={() => flip(card.index)} className="flip-card aspect-square">
              <div className={`flip-card-inner w-full h-full ${card.flipped || card.matched ? 'flipped' : ''}`}>
                <div className="flip-card-front bg-teal-400 rounded-xl flex items-center justify-center cursor-pointer">
                  <span className="text-2xl">❓</span>
                </div>
                <div className={`flip-card-back rounded-xl flex items-center justify-center ${card.matched ? 'bg-green-100 border-2 border-green-400' : 'bg-white border-2 border-teal-300'}`}>
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
