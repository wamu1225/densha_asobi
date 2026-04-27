import { useState, useEffect, useCallback } from 'react'
import { GameLayout } from '../components/GameLayout'

type Phase = 'select' | 'play' | 'over'

function makeQuestion(level: number) {
  const max = level === 1 ? 9 : 19
  const isAdd = Math.random() > 0.5
  let a = Math.floor(Math.random() * max) + 1
  let b = Math.floor(Math.random() * max) + 1
  if (!isAdd && a < b) [a, b] = [b, a]
  const answer = isAdd ? a + b : a - b
  return { a, b, op: isAdd ? '+' : '−', answer }
}

function makeChoices(answer: number): number[] {
  const set = new Set([answer])
  while (set.size < 4) {
    const delta = Math.floor(Math.random() * 5) + 1
    const c = answer + (Math.random() > 0.5 ? delta : -delta)
    if (c >= 0) set.add(c)
  }
  return [...set].sort(() => Math.random() - 0.5)
}

export function MathSprint() {
  const [phase, setPhase] = useState<Phase>('select')
  const [level, setLevel] = useState(1)
  const [q, setQ] = useState(makeQuestion(1))
  const [choices, setChoices] = useState<number[]>([])
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(30)
  const [flash, setFlash] = useState<'ok' | 'ng' | null>(null)

  const next = useCallback((lv: number) => {
    const nq = makeQuestion(lv)
    setQ(nq)
    setChoices(makeChoices(nq.answer))
  }, [])

  useEffect(() => {
    if (phase !== 'play') return
    next(level)
  }, [phase, level, next])

  useEffect(() => {
    if (phase !== 'play') return
    const t = setInterval(() => {
      setTimeLeft(v => {
        if (v <= 1) { setPhase('over'); return 0 }
        return v - 1
      })
    }, 1000)
    return () => clearInterval(t)
  }, [phase])

  function tap(c: number) {
    if (c === q.answer) {
      setFlash('ok')
      setScore(s => s + 1)
    } else {
      setFlash('ng')
    }
    setTimeout(() => { setFlash(null); next(level) }, 350)
  }

  function start(lv: number) {
    setLevel(lv)
    setScore(0)
    setTimeLeft(30)
    setPhase('play')
  }

  if (phase === 'select') return (
    <GameLayout title="けいさんスプリント" color="bg-orange-400">
      <div className="flex flex-col items-center gap-6 pt-10">
        <p className="text-2xl font-bold text-gray-700">レベルをえらんでね</p>
        <div className="flex flex-col gap-4 w-full max-w-xs">
          <button onClick={() => start(1)} className="py-6 text-2xl font-bold bg-orange-400 text-white rounded-2xl shadow-lg active:scale-95">
            🌟 レベル1（1けた）
          </button>
          <button onClick={() => start(2)} className="py-6 text-2xl font-bold bg-red-500 text-white rounded-2xl shadow-lg active:scale-95">
            🔥 レベル2（2けた）
          </button>
        </div>
      </div>
    </GameLayout>
  )

  if (phase === 'over') return (
    <GameLayout title="けいさんスプリント" color="bg-orange-400">
      <div className="flex flex-col items-center gap-6 pt-10 bounce-in">
        <p className="text-4xl">🎉</p>
        <p className="text-3xl font-bold text-gray-700">おわり！</p>
        <div className="bg-orange-100 rounded-3xl p-6 text-center">
          <p className="text-lg text-gray-600">せいかいした もんだい</p>
          <p className="text-6xl font-bold text-orange-500 mt-2">{score}<span className="text-2xl">もん</span></p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => start(level)} className="px-6 py-4 text-lg font-bold bg-orange-400 text-white rounded-2xl shadow active:scale-95">もういちど</button>
          <button onClick={() => setPhase('select')} className="px-6 py-4 text-lg font-bold bg-gray-300 text-gray-700 rounded-2xl shadow active:scale-95">もどる</button>
        </div>
      </div>
    </GameLayout>
  )

  return (
    <GameLayout title="けいさんスプリント" color="bg-orange-400">
      <div className={`flex flex-col items-center gap-5 transition-colors duration-150 rounded-2xl p-2 ${flash === 'ok' ? 'bg-green-50' : flash === 'ng' ? 'bg-red-50' : ''}`}>
        <div className="flex justify-between w-full">
          <span className="text-xl font-bold text-gray-700">⭐ {score}</span>
          <span className={`text-xl font-bold ${timeLeft <= 10 ? 'text-red-500' : 'text-gray-700'}`}>⏱ {timeLeft}びょう</span>
        </div>
        <div className="text-5xl font-bold text-gray-800 py-8 tracking-wide">
          {q.a} {q.op} {q.b} = ?
        </div>
        <div className="grid grid-cols-2 gap-4 w-full">
          {choices.map((c, i) => (
            <button
              key={i}
              onClick={() => tap(c)}
              className="py-6 text-4xl font-bold bg-white rounded-2xl border-3 border-orange-300 shadow active:scale-95 active:bg-orange-50"
            >
              {c}
            </button>
          ))}
        </div>
      </div>
    </GameLayout>
  )
}
