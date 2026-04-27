import { useState, useEffect } from 'react'
import { GameLayout } from '../components/GameLayout'

type Phase = 'play' | 'over'

function makePair() {
  let a = Math.floor(Math.random() * 90) + 10
  let b = Math.floor(Math.random() * 90) + 10
  while (a === b) b = Math.floor(Math.random() * 90) + 10
  return { a, b }
}

export function WhichBigger() {
  const [phase, setPhase] = useState<Phase>('play')
  const [pair, setPair] = useState(makePair())
  const [score, setScore] = useState(0)
  const [total, setTotal] = useState(0)
  const [flash, setFlash] = useState<'ok' | 'ng' | null>(null)
  const [streak, setStreak] = useState(0)

  useEffect(() => {
    if (total >= 15) setPhase('over')
  }, [total])

  function tap(chosen: number) {
    const correct = Math.max(pair.a, pair.b)
    if (chosen === correct) {
      setFlash('ok')
      setScore(s => s + 1)
      setStreak(s => s + 1)
    } else {
      setFlash('ng')
      setStreak(0)
    }
    setTotal(t => t + 1)
    setTimeout(() => { setFlash(null); setPair(makePair()) }, 350)
  }

  function reset() {
    setPhase('play')
    setScore(0)
    setTotal(0)
    setStreak(0)
    setPair(makePair())
  }

  if (phase === 'over') return (
    <GameLayout title="どっちがおおきい？" color="bg-blue-400">
      <div className="flex flex-col items-center gap-6 pt-10 bounce-in">
        <p className="text-4xl">🎉</p>
        <p className="text-3xl font-bold text-gray-700">おわり！</p>
        <div className="bg-blue-100 rounded-3xl p-6 text-center">
          <p className="text-lg text-gray-600">せいかい</p>
          <p className="text-6xl font-bold text-blue-500 mt-2">{score}<span className="text-2xl"> / 15</span></p>
        </div>
        <button onClick={reset} className="px-8 py-4 text-xl font-bold bg-blue-400 text-white rounded-2xl shadow active:scale-95">
          もういちど
        </button>
      </div>
    </GameLayout>
  )

  return (
    <GameLayout title="どっちがおおきい？" color="bg-blue-400">
      <div className={`flex flex-col items-center gap-4 transition-colors duration-150 rounded-2xl p-2 ${flash === 'ok' ? 'bg-green-50' : flash === 'ng' ? 'bg-red-50' : ''}`}>
        <div className="flex justify-between w-full">
          <span className="text-xl font-bold text-gray-700">⭐ {score}/{total}</span>
          {streak >= 3 && <span className="text-lg font-bold text-orange-500">🔥 {streak}れんぞく！</span>}
        </div>
        <p className="text-lg text-gray-600 mt-2">おおきいほうを タップ！</p>
        <div className="flex gap-4 w-full mt-2">
          <button
            onClick={() => tap(pair.a)}
            className="flex-1 py-10 text-5xl font-bold bg-white rounded-2xl border-3 border-blue-300 shadow active:scale-95 active:bg-blue-50"
          >
            {pair.a}
          </button>
          <button
            onClick={() => tap(pair.b)}
            className="flex-1 py-10 text-5xl font-bold bg-white rounded-2xl border-3 border-blue-300 shadow active:scale-95 active:bg-blue-50"
          >
            {pair.b}
          </button>
        </div>
        <p className="text-gray-400 text-sm mt-2">のこり {15 - total} もん</p>
      </div>
    </GameLayout>
  )
}
