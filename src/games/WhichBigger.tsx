import { useState, useEffect } from 'react'
import { GameLayout } from '../components/GameLayout'
import { ResultScreen } from '../components/ResultScreen'

type Phase = 'select' | 'play' | 'over'
type Level = 1 | 2 | 3

const GRAD = 'linear-gradient(135deg, #60a5fa, #3b82f6)'
const BEST_KEY = 'densha_bigger_best'
function getBest(): Record<string, number> { try { return JSON.parse(localStorage.getItem(BEST_KEY) || '{}') } catch { return {} } }
function saveBest(key: string, val: number) { const b = getBest(); if (!b[key] || val > b[key]) { b[key] = val; localStorage.setItem(BEST_KEY, JSON.stringify(b)) } }

function makePair(level: Level) {
  const [lo, hi] = level === 1 ? [10, 99] : level === 2 ? [100, 999] : [1000, 9999]
  let a = Math.floor(Math.random() * (hi - lo + 1)) + lo
  let b = Math.floor(Math.random() * (hi - lo + 1)) + lo
  while (a === b) b = Math.floor(Math.random() * (hi - lo + 1)) + lo
  return { a, b }
}

const LEVEL_LABEL: Record<Level, string> = { 1: '2けた (10〜99)', 2: '3けた (100〜999)', 3: '4けた (1000〜9999)' }
const TOTAL = 15

export function WhichBigger() {
  const [phase, setPhase] = useState<Phase>('select')
  const [level, setLevel] = useState<Level>(1)
  const [timeMode, setTimeMode] = useState(false)
  const [pair, setPair] = useState({ a: 0, b: 0 })
  const [score, setScore] = useState(0)
  const [total, setTotal] = useState(0)
  const [timeLeft, setTimeLeft] = useState(30)
  const [streak, setStreak] = useState(0)
  const [maxStreak, setMaxStreak] = useState(0)
  const [flash, setFlash] = useState<'ok' | 'ng' | null>(null)

  useEffect(() => {
    if (phase !== 'play') return
    if (!timeMode) { if (total >= TOTAL) setPhase('over'); return }
    const t = setInterval(() => setTimeLeft(v => { if (v <= 1) { setPhase('over'); return 0 } return v - 1 }), 1000)
    return () => clearInterval(t)
  }, [phase, total, timeMode])

  function start(lv: Level, tm: boolean) {
    setLevel(lv); setTimeMode(tm); setScore(0); setTotal(0); setStreak(0); setMaxStreak(0)
    setTimeLeft(30); setPair(makePair(lv)); setPhase('play')
  }

  function tap(chosen: number) {
    const correct = Math.max(pair.a, pair.b)
    if (chosen === correct) { const ns = streak + 1; setStreak(ns); setMaxStreak(m => Math.max(m, ns)); setScore(s => s + (ns >= 5 ? 2 : 1)); setFlash('ok') }
    else { setStreak(0); setFlash('ng') }
    setTotal(t => t + 1)
    setTimeout(() => { setFlash(null); setPair(makePair(level)) }, 300)
  }

  const best = getBest()

  if (phase === 'select') return (
    <GameLayout title="どっちがおおきい？" gradient={GRAD}>
      <div className="flex flex-col gap-4 pt-4">
        <p className="text-center text-xl font-bold text-gray-700">モードをえらんでね</p>
        {([1, 2, 3] as Level[]).map(lv => (
          <div key={lv} className="bg-white rounded-2xl border border-blue-100 p-4 shadow-md">
            <p className="font-bold text-gray-700 mb-1">レベル{lv}：{LEVEL_LABEL[lv]}</p>
            {best[`${lv}_q`] != null && <p className="text-xs text-gray-400 mb-2">🏆 {TOTAL}問 ベスト {best[`${lv}_q`]}問正解</p>}
            <div className="flex gap-2">
              <button onClick={() => start(lv, false)} className="flex-1 py-3 text-base font-bold text-white rounded-xl shadow active:scale-95" style={{ background: GRAD }}>{TOTAL}もん</button>
              <button onClick={() => start(lv, true)} className="flex-1 py-3 text-base font-bold bg-indigo-500 text-white rounded-xl shadow active:scale-95">⏱30びょう</button>
            </div>
          </div>
        ))}
      </div>
    </GameLayout>
  )

  if (phase === 'over') {
    const key = `${level}_${timeMode ? 't' : 'q'}`; saveBest(key, score)
    return (
      <GameLayout title="どっちがおおきい？" gradient={GRAD}>
        <ResultScreen score={score} total={timeMode ? undefined : TOTAL} extra={[{ label: 'さいこうれんぞく', value: `${maxStreak}かい 🔥` }]} best={getBest()[key]} onRetry={() => start(level, timeMode)} accentColor="text-blue-500" />
      </GameLayout>
    )
  }

  return (
    <GameLayout title="どっちがおおきい？" gradient={GRAD}>
      <div className={`flex flex-col items-center gap-4 rounded-3xl p-3 transition-colors ${flash === 'ok' ? 'bg-green-50' : flash === 'ng' ? 'bg-red-50' : ''}`}>
        <div className="flex justify-between w-full items-center">
          <span className="text-xl font-bold text-gray-700">⭐ {score}</span>
          {timeMode ? <span className={`text-xl font-bold ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-gray-700'}`}>⏱ {timeLeft}s</span>
            : <span className="text-xl font-bold text-gray-700">{total}/{TOTAL}</span>}
        </div>
        {streak >= 3 && <div className="bg-orange-100 rounded-full px-4 py-1 bounce-in"><span className="text-base font-bold text-orange-600">🔥 {streak}れんぞく！</span></div>}
        <p className="text-lg text-gray-600 mt-2">おおきいほうを タップ！</p>
        <div className="flex gap-4 w-full">
          {[pair.a, pair.b].map((n, i) => (
            <button key={i} onClick={() => tap(n)} className="flex-1 bg-white rounded-2xl border-2 border-blue-200 shadow-md active:scale-95 transition-transform font-black text-gray-800" style={{ height: 100, fontSize: 40 }}>
              {n.toLocaleString()}
            </button>
          ))}
        </div>
      </div>
    </GameLayout>
  )
}
