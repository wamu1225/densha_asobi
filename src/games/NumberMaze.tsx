import { useState, useEffect, useRef } from 'react'
import { GameLayout } from '../components/GameLayout'

type Mode = 'select' | 'play' | 'over'
type Size = 4 | 5
type Variant = 'normal' | 'hidden'

const BEST_KEY = 'densha_maze_best'
function getBest(): Record<string, number> {
  try { return JSON.parse(localStorage.getItem(BEST_KEY) || '{}') } catch { return {} }
}
function saveBest(key: string, val: number) {
  const b = getBest()
  if (!b[key] || val < b[key]) { b[key] = val; localStorage.setItem(BEST_KEY, JSON.stringify(b)) }
}

function makeGrid(size: Size) {
  const n = size * size
  return Array.from({ length: n }, (_, i) => i + 1).sort(() => Math.random() - 0.5)
}

export function NumberMaze() {
  const [mode, setMode] = useState<Mode>('select')
  const [size, setSize] = useState<Size>(4)
  const [variant, setVariant] = useState<Variant>('normal')
  const [grid, setGrid] = useState<number[]>([])
  const [next, setNext] = useState(1)
  const [hidden, setHidden] = useState(new Set<number>())
  const [shake, setShake] = useState<number | null>(null)
  const [elapsed, setElapsed] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const best = getBest()

  useEffect(() => {
    if (mode !== 'play') return
    timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [mode])

  function start(s: Size, v: Variant) {
    setSize(s); setVariant(v)
    setGrid(makeGrid(s)); setNext(1); setHidden(new Set()); setElapsed(0); setMode('play')
  }

  function tap(n: number, i: number) {
    if (n === next) {
      const nextVal = next + 1
      if (variant === 'hidden') setHidden(h => new Set([...h, i]))
      setNext(nextVal)
      if (nextVal > size * size) {
        if (timerRef.current) clearInterval(timerRef.current)
        setMode('over')
      }
    } else {
      setShake(i)
      setTimeout(() => setShake(null), 300)
    }
  }

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
  const colClass = size === 4 ? 'grid-cols-4' : 'grid-cols-5'
  const textSize = size === 4 ? 'text-2xl' : 'text-xl'

  if (mode === 'select') return (
    <GameLayout title="すうじめいろ" color="bg-red-400">
      <div className="flex flex-col gap-4 pt-4">
        <p className="text-center text-xl font-bold text-gray-700">モードをえらんでね</p>
        {([4, 5] as Size[]).map(s => (
          <div key={s} className="bg-white rounded-2xl border-2 border-red-200 p-4 shadow">
            <p className="font-bold text-gray-700 mb-1">{s === 4 ? '🌟' : '🔥'} {s}×{s}グリッド（1〜{s*s}）</p>
            <div className="flex gap-2 mt-2">
              {(['normal', 'hidden'] as Variant[]).map(v => {
                const bk = `${s}_${v}`
                return (
                  <button key={v} onClick={() => start(s, v)} className="flex-1 py-3 text-sm font-bold bg-red-400 text-white rounded-xl active:scale-95">
                    {v === 'normal' ? '👀 みえる' : '🙈 きえる'}
                    {best[bk] != null && <span className="block text-xs mt-1">🏆 {fmt(best[bk])}</span>}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
        <div className="bg-red-50 rounded-xl p-3 border border-red-200">
          <p className="text-sm text-gray-600">🙈 きえるモード：タップしたかずが きえていくよ！</p>
        </div>
      </div>
    </GameLayout>
  )

  if (mode === 'over') {
    const bk = `${size}_${variant}`
    saveBest(bk, elapsed)
    const b = getBest()[bk]
    return (
      <GameLayout title="すうじめいろ" color="bg-red-400">
        <div className="flex flex-col items-center gap-5 pt-8 bounce-in">
          <p className="text-4xl">🎉</p>
          <p className="text-3xl font-bold text-gray-700">クリア！</p>
          <div className="bg-red-50 border-2 border-red-200 rounded-3xl p-6 text-center w-full">
            <p className="text-lg text-gray-500">タイム</p>
            <p className="text-5xl font-bold text-red-500 mt-1">{fmt(elapsed)}</p>
            {b != null && <p className="text-sm text-gray-400 mt-2">🏆 ベスト {fmt(b)}</p>}
          </div>
          <div className="flex gap-3 w-full">
            <button onClick={() => start(size, variant)} className="flex-1 py-4 text-lg font-bold bg-red-400 text-white rounded-2xl shadow active:scale-95">もういちど</button>
            <button onClick={() => setMode('select')} className="flex-1 py-4 text-lg font-bold bg-gray-200 text-gray-700 rounded-2xl active:scale-95">もどる</button>
          </div>
        </div>
      </GameLayout>
    )
  }

  return (
    <GameLayout title="すうじめいろ" color="bg-red-400">
      <div className="flex flex-col items-center gap-3">
        <div className="flex justify-between w-full">
          <span className="text-xl font-bold text-gray-700">つぎ：<span className="text-red-500 text-2xl">{next}</span></span>
          <span className="text-xl font-bold text-gray-700">⏱ {fmt(elapsed)}</span>
        </div>
        <p className="text-sm text-gray-500">
          {variant === 'hidden' ? '🙈 タップしたら きえるよ！' : '1から じゅんに タップ！'}
        </p>
        <div className={`grid ${colClass} gap-2 w-full`}>
          {grid.map((n, i) => {
            const tapped = n < next
            const isHid = hidden.has(i)
            return (
              <button key={i} onClick={() => !tapped && tap(n, i)}
                className={`aspect-square rounded-xl ${textSize} font-bold transition-all border-2 ${shake === i ? 'shake border-red-500 bg-red-100' : ''} ${
                  tapped && !isHid ? 'bg-red-400 text-white border-red-400 shadow-inner' :
                  isHid ? 'bg-gray-100 border-gray-100 text-gray-100' :
                  n === next ? 'bg-red-100 border-red-400 shadow active:scale-95' :
                  'bg-white border-red-200 shadow active:scale-95'
                }`}>
                {isHid ? '' : tapped ? '✓' : n}
              </button>
            )
          })}
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-red-400 h-2 rounded-full transition-all" style={{ width: `${((next - 1) / (size * size)) * 100}%` }} />
        </div>
      </div>
    </GameLayout>
  )
}
