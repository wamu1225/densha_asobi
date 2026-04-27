import { useState } from 'react'
import { GameLayout } from '../components/GameLayout'

type Phase = 'play' | 'over'

interface ClockTime { h: number; m: number }

function randomTime(): ClockTime {
  return {
    h: Math.floor(Math.random() * 12) + 1,
    m: Math.floor(Math.random() * 12) * 5,
  }
}

function fmt(t: ClockTime) {
  return t.m === 0 ? `${t.h}じ` : `${t.h}じ ${t.m}ふん`
}

function makeChoices(correct: ClockTime): ClockTime[] {
  const used = new Set([fmt(correct)])
  const choices: ClockTime[] = [correct]
  while (choices.length < 4) {
    const c = randomTime()
    if (!used.has(fmt(c))) { used.add(fmt(c)); choices.push(c) }
  }
  return choices.sort(() => Math.random() - 0.5)
}

function ClockSvg({ h, m }: ClockTime) {
  const cx = 120, cy = 120, r = 100
  const mAngle = (m / 60) * 360 - 90
  const hAngle = ((h % 12) / 12) * 360 + (m / 60) * 30 - 90
  const toXY = (angle: number, len: number) => ({
    x: cx + len * Math.cos((angle * Math.PI) / 180),
    y: cy + len * Math.sin((angle * Math.PI) / 180),
  })
  const mP = toXY(mAngle, 80)
  const hP = toXY(hAngle, 55)

  return (
    <svg viewBox="0 0 240 240" className="w-48 h-48">
      <circle cx={cx} cy={cy} r={r} fill="white" stroke="#6366f1" strokeWidth="4" />
      {[...Array(12)].map((_, i) => {
        const a = (i / 12) * 360 - 90
        const p1 = toXY(a, 85); const p2 = toXY(a, 95)
        return <line key={i} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="#6366f1" strokeWidth={i % 3 === 0 ? 3 : 1.5} />
      })}
      {[12, 3, 6, 9].map((n, i) => {
        const a = (i / 4) * 360 - 90
        const p = toXY(a, 72)
        return <text key={n} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="central" fontSize="16" fontWeight="bold" fill="#4f46e5">{n}</text>
      })}
      <line x1={cx} y1={cy} x2={mP.x} y2={mP.y} stroke="#1e293b" strokeWidth="3" strokeLinecap="round" />
      <line x1={cx} y1={cy} x2={hP.x} y2={hP.y} stroke="#1e293b" strokeWidth="5" strokeLinecap="round" />
      <circle cx={cx} cy={cy} r="5" fill="#e11d48" />
    </svg>
  )
}

export function ClockReading() {
  const [phase, setPhase] = useState<Phase>('play')
  const [time, setTime] = useState(randomTime())
  const [choices, setChoices] = useState(() => makeChoices(randomTime()))
  const [score, setScore] = useState(0)
  const [qNum, setQNum] = useState(1)
  const [flash, setFlash] = useState<'ok' | 'ng' | null>(null)
  const total = 10

  function next() {
    const t = randomTime()
    setTime(t)
    setChoices(makeChoices(t))
  }

  useState(() => { next() })

  function tap(c: ClockTime) {
    if (fmt(c) === fmt(time)) {
      setFlash('ok')
      setScore(s => s + 1)
    } else {
      setFlash('ng')
    }
    setTimeout(() => {
      setFlash(null)
      if (qNum >= total) { setPhase('over') } else { setQNum(n => n + 1); next() }
    }, 400)
  }

  function reset() {
    setPhase('play'); setScore(0); setQNum(1); next()
  }

  if (phase === 'over') return (
    <GameLayout title="とけいをよもう" color="bg-purple-400">
      <div className="flex flex-col items-center gap-6 pt-10 bounce-in">
        <p className="text-4xl">🎉</p>
        <p className="text-3xl font-bold text-gray-700">おわり！</p>
        <div className="bg-purple-100 rounded-3xl p-6 text-center">
          <p className="text-lg text-gray-600">せいかい</p>
          <p className="text-6xl font-bold text-purple-500 mt-2">{score}<span className="text-2xl"> / {total}</span></p>
        </div>
        <button onClick={reset} className="px-8 py-4 text-xl font-bold bg-purple-400 text-white rounded-2xl shadow active:scale-95">
          もういちど
        </button>
      </div>
    </GameLayout>
  )

  return (
    <GameLayout title="とけいをよもう" color="bg-purple-400">
      <div className={`flex flex-col items-center gap-4 transition-colors rounded-2xl p-2 ${flash === 'ok' ? 'bg-green-50' : flash === 'ng' ? 'bg-red-50' : ''}`}>
        <div className="flex justify-between w-full">
          <span className="text-xl font-bold text-gray-700">⭐ {score}</span>
          <span className="text-xl font-bold text-gray-700">{qNum} / {total}</span>
        </div>
        <p className="text-lg text-gray-600">なんじ なんぷん？</p>
        <ClockSvg h={time.h} m={time.m} />
        <div className="grid grid-cols-2 gap-3 w-full mt-2">
          {choices.map((c, i) => (
            <button
              key={i}
              onClick={() => tap(c)}
              className="py-5 text-xl font-bold bg-white rounded-2xl border-2 border-purple-300 shadow active:scale-95"
            >
              {fmt(c)}
            </button>
          ))}
        </div>
      </div>
    </GameLayout>
  )
}
