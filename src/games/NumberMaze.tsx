import { useState, useEffect, useRef } from 'react'
import { GameLayout } from '../components/GameLayout'
import { ResultScreen } from '../components/ResultScreen'

const GRAD = 'linear-gradient(135deg, #f87171, #ef4444)'
type Mode = 'select' | 'play' | 'over'
type Size = 4 | 5
type Variant = 'normal' | 'hidden'

const BEST_KEY = 'densha_maze_best'
function getBest(): Record<string, number> { try { return JSON.parse(localStorage.getItem(BEST_KEY) || '{}') } catch { return {} } }
function saveBest(key: string, val: number) { const b = getBest(); if (!b[key] || val < b[key]) { b[key] = val; localStorage.setItem(BEST_KEY, JSON.stringify(b)) } }

function makeGrid(size: Size) {
  return Array.from({ length: size * size }, (_, i) => i + 1).sort(() => Math.random() - 0.5)
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

  // ⑰修正: elapsed=0リセットと timer 起動の競合を避けるため、
  // mode が 'play' になった直後に elapsed を 0 にセットしてからタイマーを開始する
  useEffect(() => {
    if (mode !== 'play') return
    setElapsed(0)
    const t = setInterval(() => setElapsed(e => e + 1), 1000)
    timerRef.current = t
    return () => { clearInterval(t); timerRef.current = null }
  }, [mode])

  function start(s: Size, v: Variant) {
    setSize(s); setVariant(v); setGrid(makeGrid(s)); setNext(1); setHidden(new Set()); setMode('play')
    // elapsed は useEffect 内でリセットするので start() では触らない
  }

  function tap(n: number, i: number) {
    if (n === next) {
      const nv = next + 1
      if (variant === 'hidden') setHidden(h => new Set([...h, i]))
      setNext(nv)
      if (nv > size * size) { if (timerRef.current) clearInterval(timerRef.current); setMode('over') }
    } else { setShake(i); setTimeout(() => setShake(null), 300) }
  }

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
  const progress = (next - 1) / (size * size)

  if (mode === 'select') return (
    <GameLayout title="すうじめいろ" gradient={GRAD}>
      <div className="flex flex-col gap-4 pt-4">
        <p className="text-center text-xl font-bold text-gray-700">モードをえらんでね</p>
        {([4, 5] as Size[]).map(s => (
          <div key={s} className="bg-white rounded-2xl border border-red-100 p-4 shadow-md">
            <p className="font-bold text-gray-700 mb-2">{s === 4 ? '🌟' : '🔥'} {s}×{s}グリッド（1〜{s * s}）</p>
            <div className="flex gap-2">
              {(['normal', 'hidden'] as Variant[]).map(v => {
                const bk = `${s}_${v}`
                return (
                  <button key={v} onClick={() => start(s, v)} className="flex-1 py-3 text-sm font-bold text-white rounded-xl shadow active:scale-95" style={{ background: GRAD }}>
                    {v === 'normal' ? '👀 みえる' : '🙈 きえる'}
                    {best[bk] != null && <span className="block text-xs mt-0.5">🏆 {fmt(best[bk])}</span>}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
        <div className="bg-red-50 rounded-xl p-3 border border-red-100 text-sm text-gray-600">
          🙈 きえるモード：タップしたかずがきえていくよ！
        </div>
      </div>
    </GameLayout>
  )

  if (mode === 'over') {
    const bk = `${size}_${variant}`; saveBest(bk, elapsed)
    const bSecs = getBest()[bk]
    return (
      <GameLayout title="すうじめいろ" gradient={GRAD}>
        <ResultScreen
          timeStr={fmt(elapsed)}
          bestStr={bSecs != null ? fmt(bSecs) : undefined}
          bestLabel={`ベスト（${size}×${size} ${variant === 'hidden' ? 'きえる' : 'みえる'}）`}
          onRetry={() => start(size, variant)}
          accentColor="text-red-500"
        />
      </GameLayout>
    )
  }

  const colClass = size === 4 ? 4 : 5
  const textSz = size === 4 ? 26 : 20

  return (
    <GameLayout title="すうじめいろ" gradient={GRAD}>
      <div className="flex flex-col items-center gap-3">
        <div className="flex justify-between w-full items-center">
          <span className="text-xl font-bold text-gray-700">つぎ：<span className="text-red-500 text-2xl font-black">{next}</span></span>
          <span className="text-xl font-bold text-gray-700">⏱ {fmt(elapsed)}</span>
        </div>
        <p className="text-sm text-gray-500">{variant === 'hidden' ? '🙈 タップしたらきえるよ！' : '1からじゅんにタップ！'}</p>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div className="h-3 rounded-full transition-all" style={{ width: `${progress * 100}%`, background: GRAD }} />
        </div>
        <div className="grid gap-2 w-full" style={{ gridTemplateColumns: `repeat(${colClass}, 1fr)` }}>
          {grid.map((n, i) => {
            const tapped = n < next; const isHid = hidden.has(i)
            return (
              <button key={i} onClick={() => !tapped && tap(n, i)}
                className={`aspect-square rounded-xl font-black transition-all border-2 ${shake === i ? 'shake border-red-400 bg-red-100' : ''} ${
                  isHid ? 'bg-gray-100 border-gray-100' :
                  tapped ? 'border-transparent text-white shadow-inner' :
                  'bg-white border-red-100 shadow active:scale-95'
                }`}
                style={{ fontSize: textSz, background: tapped && !isHid ? 'linear-gradient(135deg,#f87171,#ef4444)' : undefined }}>
                {isHid ? '' : tapped ? '✓' : n}
              </button>
            )
          })}
        </div>
      </div>
    </GameLayout>
  )
}
