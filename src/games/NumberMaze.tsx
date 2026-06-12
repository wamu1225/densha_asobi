import { useState, useEffect, useRef } from 'react'
import { GameLayout } from '../components/GameLayout'
import { ResultScreen } from '../components/ResultScreen'

const GRAD = 'linear-gradient(135deg, #f87171, #ef4444)'
const BEST_KEY = 'densha_maze_best'
function getBest(): Record<string, number> { try { return JSON.parse(localStorage.getItem(BEST_KEY) || '{}') } catch { return {} } }
function saveBest(key: string, val: number) { const b = getBest(); if (!b[key] || val < b[key]) { b[key] = val; localStorage.setItem(BEST_KEY, JSON.stringify(b)) } }

type Size = 4 | 5
type Variant = 'speed' | 'memory' | 'reverse'
type Phase = 'select' | 'preview' | 'play' | 'over'

const VARIANTS: Record<Variant, { emoji: string; label: string; desc: string; color: string }> = {
  speed:   { emoji: '⚡', label: 'スピード',    desc: '1からじゅんばんにタップ！\nはやさをきそおう',   color: '#ef4444' },
  memory:  { emoji: '🧠', label: 'きおく',      desc: '3びょうでばしょをおぼえて！\nきえたら こころのめで さがせ', color: '#8b5cf6' },
  reverse: { emoji: '🔄', label: 'ぎゃくじゅん', desc: 'おおきいかずからさがして\nN→1の じゅんでタップ！', color: '#f59e0b' },
}

function makeGrid(size: Size): number[] {
  return Array.from({ length: size * size }, (_, i) => i + 1).sort(() => Math.random() - 0.5)
}

// 選択画面用ミニグリッド（モードごとの見え方を予告）
function MiniGrid({ variant }: { variant: Variant }) {
  const order = [3, 7, 1, 5, 9, 2, 8, 4, 6]  // バラバラ感を出す固定配置
  return (
    <svg width={58} height={58} viewBox="0 0 60 60" aria-hidden="true" className="shrink-0">
      {order.map((n, i) => {
        const x = (i % 3) * 20 + 1, y = Math.floor(i / 3) * 20 + 1
        const hidden = variant === 'memory' && i % 2 === 1
        const label = variant === 'reverse' ? String(10 - n) : String(n)
        return (
          <g key={i}>
            <rect x={x} y={y} width={18} height={18} rx={3}
              fill={hidden ? '#f3e8ff' : 'white'} stroke="#fca5a5" strokeWidth="1" />
            <text x={x + 9} y={y + 13} textAnchor="middle" fontSize="9" fontWeight="800"
              fill={hidden ? '#c4b5fd' : '#374151'}>{hidden ? '?' : label}</text>
          </g>
        )
      })}
    </svg>
  )
}

export function NumberMaze() {
  const [phase, setPhase]       = useState<Phase>('select')
  const [size, setSize]         = useState<Size>(4)
  const [variant, setVariant]   = useState<Variant>('speed')
  const [grid, setGrid]         = useState<number[]>([])
  const [next, setNext]         = useState(1)
  const [tapped, setTapped]     = useState(new Set<number>())  // tapped cell indices
  const [shake, setShake]       = useState<number | null>(null)
  const [elapsed, setElapsed]   = useState(0)
  const [countdown, setCountdown] = useState(3)
  const [hintUsed, setHintUsed]   = useState(false)
  const [showHint, setShowHint]   = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const best = getBest()

  // ── ゲームタイマー ──────────────────────────────────────
  useEffect(() => {
    if (phase !== 'play') return
    setElapsed(0)
    const t = setInterval(() => setElapsed(e => e + 1), 1000)
    timerRef.current = t
    return () => { clearInterval(t); timerRef.current = null }
  }, [phase])

  // ── きおくモードのプレビューカウントダウン（4×4:4秒 / 5×5:6秒）──
  useEffect(() => {
    if (phase !== 'preview') return
    const total = size === 5 ? 6 : 4
    setCountdown(total)
    let c = total
    const t = setInterval(() => {
      c--
      setCountdown(c)
      if (c <= 0) { clearInterval(t); setPhase('play') }
    }, 1000)
    return () => clearInterval(t)
  }, [phase, size])

  function start(s: Size, v: Variant) {
    const g = makeGrid(s)
    setSize(s); setVariant(v); setGrid(g)
    setTapped(new Set()); setElapsed(0)
    setHintUsed(false); setShowHint(false)
    setNext(v === 'reverse' ? s * s : 1)
    setPhase(v === 'memory' ? 'preview' : 'play')
  }

  function useHint() {
    if (hintUsed) return
    setHintUsed(true); setShowHint(true)
    setTimeout(() => setShowHint(false), 2000)
  }

  function tap(n: number, i: number) {
    if (phase !== 'play') return
    if (n === next) {
      const nextTapped = new Set(tapped)
      nextTapped.add(i)
      setTapped(nextTapped)
      const done = variant === 'reverse' ? next <= 1 : next >= size * size
      if (done) {
        if (timerRef.current) clearInterval(timerRef.current)
        setPhase('over')
      } else {
        setNext(v => variant === 'reverse' ? v - 1 : v + 1)
      }
    } else {
      setShake(i); setTimeout(() => setShake(null), 300)
    }
  }

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
  const progress = variant === 'reverse'
    ? (size * size - next) / (size * size)
    : (next - 1) / (size * size)
  const bk = `${size}_${variant}`
  const colCount = size === 4 ? 4 : 5
  const textSz = size === 4 ? 26 : 20

  // ── 選択画面 ──────────────────────────────────────────
  if (phase === 'select') return (
    <GameLayout title="すうじめいろ" gradient={GRAD}>
      <div className="flex flex-col gap-4 pt-3">
        <p className="text-center text-lg font-bold" style={{ color: 'var(--ink)' }}>
          サイズをえらんでね
        </p>
        <div className="flex gap-3">
          {([4, 5] as Size[]).map(s => (
            <button key={s} onClick={() => setSize(s)}
              className="flex-1 py-3 rounded-xl font-black border-2 transition-all active:scale-95"
              style={{
                background: size === s ? GRAD : 'white',
                color: size === s ? 'white' : 'var(--ink)',
                borderColor: size === s ? 'transparent' : '#fca5a5',
              }}>
              {s === 4 ? '4×4（1〜16）' : '5×5（1〜25）'}
            </button>
          ))}
        </div>

        <p className="text-center text-lg font-bold mt-1" style={{ color: 'var(--ink)' }}>
          モードをえらんでね
        </p>
        {(Object.entries(VARIANTS) as [Variant, typeof VARIANTS[Variant]][]).map(([v, info]) => {
          const bkKey = `${size}_${v}`
          return (
            <button key={v} onClick={() => start(size, v)}
              className="bg-white rounded-2xl border-2 p-4 text-left shadow-md active:scale-95 transition-all"
              style={{ borderColor: info.color + '66' }}>
              <div className="flex items-center gap-3">
                <MiniGrid variant={v} />
                <div className="flex-1">
                  <p className="font-black text-lg" style={{ color: info.color }}>
                    {info.label}
                  </p>
                  <p className="text-sm mt-1 whitespace-pre-line" style={{ color: 'var(--ink-sub)' }}>
                    {info.desc}
                  </p>
                </div>
                {best[bkKey] != null && (
                  <span className="text-xs font-bold bg-gray-100 rounded-lg px-2 py-1 shrink-0" style={{ color: 'var(--ink-sub)' }}>
                    ベスト {fmt(best[bkKey])}
                  </span>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </GameLayout>
  )

  // ── きおくモード: プレビュー画面 ──────────────────────
  if (phase === 'preview') return (
    <GameLayout title="すうじめいろ" gradient={GRAD}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-full bg-purple-100 border-2 border-purple-400 rounded-2xl py-3 text-center">
          <p className="text-xl font-black text-purple-700">
            {countdown > 0 ? `${countdown}びょうで おぼえて！` : 'きえる！'}
          </p>
          <div className="flex justify-center gap-1 mt-1">
            {Array.from({ length: size === 5 ? 6 : 4 }, (_, i) => i + 1).map(n => (
              <div key={n} className="w-5 h-5 rounded-full transition-all"
                style={{ background: countdown >= n ? '#8b5cf6' : '#e9d5ff' }} />
            ))}
          </div>
        </div>
        <div className="grid gap-2 w-full" style={{ gridTemplateColumns: `repeat(${colCount}, 1fr)` }}>
          {grid.map((n, i) => (
            <div key={i}
              className="aspect-square rounded-xl font-black flex items-center justify-center bg-white border-2 border-purple-200"
              style={{ fontSize: textSz, color: '#7c3aed' }}>
              {n}
            </div>
          ))}
        </div>
        <p className="text-sm font-bold text-gray-500">ばしょをしっかりおぼえよう！</p>
      </div>
    </GameLayout>
  )

  // ── 結果画面 ──────────────────────────────────────────
  if (phase === 'over') {
    const isNewBest = best[bk] == null || elapsed < best[bk]; saveBest(bk, elapsed)
    return (
      <GameLayout title="すうじめいろ" gradient={GRAD}>
        <ResultScreen
          timeStr={fmt(elapsed)}
          bestStr={getBest()[bk] != null ? fmt(getBest()[bk]) : undefined}
          bestLabel={`ベスト（${size}×${size} ${VARIANTS[variant].label}）`}
          onRetry={() => start(size, variant)}
          onChangeMode={() => setPhase('select')}
          isNewBest={isNewBest}
          accentColor="text-red-500"
        />
      </GameLayout>
    )
  }

  // ── プレイ画面 ────────────────────────────────────────
  const targetLabel = variant === 'reverse'
    ? `タップ：${next} → 1`
    : `タップ：${next}`

  return (
    <GameLayout title="すうじめいろ" gradient={GRAD} isPlaying={phase === 'play'}>
      <div className="flex flex-col items-center gap-3">
        <div className="flex justify-between w-full items-center">
          <span className="text-xl font-black" style={{ color: variant === 'reverse' ? '#f59e0b' : variant === 'memory' ? '#8b5cf6' : 'var(--ink)' }}>
            {VARIANTS[variant].emoji} {targetLabel}
          </span>
          <span className="text-xl font-bold" style={{ color: 'var(--ink)' }}>タイム {fmt(elapsed)}</span>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
          <div className="h-2.5 rounded-full transition-all" style={{ width: `${progress * 100}%`, background: GRAD }} />
        </div>

        <div className="grid gap-2 w-full" style={{ gridTemplateColumns: `repeat(${colCount}, 1fr)` }}>
          {grid.map((n, i) => {
            const isDone = tapped.has(i)
            // きおくモードは未タップセルを非表示（プレイ中は真っ白）
            const showNum = variant === 'memory' ? (isDone ? '✓' : showHint ? n : '') : (isDone ? '✓' : n)
            const cellBg = isDone
              ? GRAD
              : 'white'
            const cellBorder = isDone ? 'transparent' : '#fca5a5'

            return (
              <button key={i}
                onClick={() => !isDone && tap(n, i)}
                className={`aspect-square rounded-xl font-black transition-all border-2 active:scale-95 ${shake === i ? 'shake' : ''}`}
                style={{
                  fontSize: textSz,
                  background: shake === i ? '#fee2e2' : cellBg,
                  borderColor: shake === i ? '#ef4444' : cellBorder,
                  color: isDone ? 'white' : shake === i ? '#ef4444' : 'var(--ink)',
                  boxShadow: isDone ? 'inset 0 2px 4px rgba(0,0,0,0.1)' : '3px 3px 0 rgba(0,0,0,0.08)',
                }}>
                {showNum}
              </button>
            )
          })}
        </div>

        {variant === 'memory' && (
          <div className="flex items-center justify-between w-full">
            <p className="text-sm font-bold text-purple-600">きおくを たよりに タップ！</p>
            <button
              onClick={useHint}
              disabled={hintUsed}
              className="text-xs font-bold px-3 py-1.5 rounded-lg active:scale-95 disabled:opacity-40"
              style={{ background: hintUsed ? '#e9d5ff' : '#7c3aed', color: 'white' }}>
              {hintUsed ? 'つかった' : 'ちょっとみる'}
            </button>
          </div>
        )}
      </div>
    </GameLayout>
  )
}
