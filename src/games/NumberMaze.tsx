import { useState, useEffect, useRef } from 'react'
import { GameLayout } from '../components/GameLayout'

function makeGrid() {
  const nums = Array.from({ length: 16 }, (_, i) => i + 1)
  return nums.sort(() => Math.random() - 0.5)
}

export function NumberMaze() {
  const [grid, setGrid] = useState(makeGrid())
  const [next, setNext] = useState(1)
  const [shake, setShake] = useState<number | null>(null)
  const [done, setDone] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [running, setRunning] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (running && !done) {
      timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [running, done])

  function tap(n: number, i: number) {
    if (!running) setRunning(true)
    if (n === next) {
      const nextVal = next + 1
      setNext(nextVal)
      if (nextVal > 16) { setDone(true); setRunning(false) }
    } else {
      setShake(i)
      setTimeout(() => setShake(null), 300)
    }
  }

  function reset() {
    setGrid(makeGrid()); setNext(1); setDone(false); setElapsed(0); setRunning(false)
  }

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

  if (done) return (
    <GameLayout title="すうじめいろ" color="bg-red-400">
      <div className="flex flex-col items-center gap-6 pt-10 bounce-in">
        <p className="text-4xl">🎉</p>
        <p className="text-3xl font-bold text-gray-700">クリア！</p>
        <div className="bg-red-100 rounded-3xl p-6 text-center">
          <p className="text-lg text-gray-600">タイム</p>
          <p className="text-5xl font-bold text-red-500 mt-2">{fmt(elapsed)}</p>
        </div>
        <button onClick={reset} className="px-8 py-4 text-xl font-bold bg-red-400 text-white rounded-2xl shadow active:scale-95">もういちど</button>
      </div>
    </GameLayout>
  )

  return (
    <GameLayout title="すうじめいろ" color="bg-red-400">
      <div className="flex flex-col items-center gap-4">
        <div className="flex justify-between w-full">
          <span className="text-xl font-bold text-gray-700">つぎ: <span className="text-red-500">{next}</span></span>
          <span className="text-xl font-bold text-gray-700">⏱ {fmt(elapsed)}</span>
        </div>
        <p className="text-sm text-gray-500">1から じゅんに タップしよう！</p>
        <div className="grid grid-cols-4 gap-2 w-full">
          {grid.map((n, i) => {
            const tapped = n < next
            return (
              <button
                key={i}
                onClick={() => !tapped && tap(n, i)}
                className={`aspect-square rounded-2xl text-3xl font-bold transition-all ${shake === i ? 'shake' : ''} ${
                  tapped
                    ? 'bg-red-400 text-white shadow-inner'
                    : 'bg-white border-2 border-red-200 shadow active:scale-95'
                }`}
              >
                {tapped ? '✓' : n}
              </button>
            )
          })}
        </div>
      </div>
    </GameLayout>
  )
}
