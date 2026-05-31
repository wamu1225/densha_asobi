import { useState, useEffect } from 'react'
import { GameLayout } from '../components/GameLayout'
import { GameFeedback } from '../components/GameFeedback'
import { ResultScreen } from '../components/ResultScreen'

type Phase = 'select' | 'play' | 'over'
type Level = 1 | 2 | 3

const GRAD = 'linear-gradient(135deg, #60a5fa, #3b82f6)'
const BEST_KEY = 'densha_bigger_best'
const PREF = 'densha_pref_bigger'
function getBest(): Record<string, number> { try { return JSON.parse(localStorage.getItem(BEST_KEY) || '{}') } catch { return {} } }
function saveBest(key: string, val: number) { const b = getBest(); if (!b[key] || val > b[key]) { b[key] = val; localStorage.setItem(BEST_KEY, JSON.stringify(b)) } }

function makePair(level: Level) {
  const [lo, hi] = level === 1 ? [10, 99] : level === 2 ? [100, 999] : [1000, 9999]
  let a = Math.floor(Math.random() * (hi - lo + 1)) + lo
  let b = Math.floor(Math.random() * (hi - lo + 1)) + lo
  while (a === b) b = Math.floor(Math.random() * (hi - lo + 1)) + lo
  return { a, b }
}

const LEVEL_LABEL: Record<Level, string> = { 1: '★☆☆ 2けた', 2: '★★☆ 3けた', 3: '★★★ 4けた' }
const TOTAL = 15

export function WhichBigger() {
  const [phase, setPhase] = useState<Phase>('select')
  const [level, setLevel] = useState<Level>(() => (parseInt(localStorage.getItem(`${PREF}_level`) || '1') as Level) ?? 1)
  const [timeMode, setTimeMode] = useState(() => localStorage.getItem(`${PREF}_time`) === 'true')
  const [pair, setPair] = useState({ a: 0, b: 0 })
  const [score, setScore] = useState(0)
  // ⑤修正: タイムモードではqCountを別管理せず、スコアのみ使う
  const [qCount, setQCount] = useState(0)
  const [timeLeft, setTimeLeft] = useState(30)
  const [streak, setStreak] = useState(0)
  const [maxStreak, setMaxStreak] = useState(0)
  const [flash, setFlash] = useState<'ok' | 'ng' | null>(null)
  const [locked, setLocked] = useState(false)
  // 不正解時にどちらが正解だったかを示すインデックス (0=左, 1=右)
  const [correctIdx, setCorrectIdx] = useState<number | null>(null)

  // タイムモードのタイマー（qCountを含めない — 含めると答えるたびにリセットされる）
  useEffect(() => {
    if (phase !== 'play' || !timeMode) return
    const t = setInterval(() => setTimeLeft(v => { if (v <= 1) { setPhase('over'); return 0 } return v - 1 }), 1000)
    return () => clearInterval(t)
  }, [phase, timeMode])

  // ノーマルモードの終了判定
  useEffect(() => {
    if (phase !== 'play' || timeMode) return
    if (qCount >= TOTAL) setPhase('over')
  }, [phase, qCount, timeMode])

  function start(lv: Level, tm: boolean) {
    localStorage.setItem(`${PREF}_level`, String(lv))
    localStorage.setItem(`${PREF}_time`, String(tm))
    setLevel(lv); setTimeMode(tm); setScore(0); setQCount(0); setStreak(0); setMaxStreak(0)
    setLocked(false); setCorrectIdx(null); setTimeLeft(30); setPair(makePair(lv)); setPhase('play')
  }

  function tap(chosen: number) {
    if (locked) return
    setLocked(true)
    const correctNum = Math.max(pair.a, pair.b)
    if (chosen === correctNum) {
      const ns = streak + 1; setStreak(ns); setMaxStreak(m => Math.max(m, ns))
      setScore(s => s + 1); setFlash('ok'); setCorrectIdx(null)
    } else {
      setStreak(0); setFlash('ng')
      // どちらが正解かをハイライト
      setCorrectIdx(pair.a > pair.b ? 0 : 1)
    }
    setQCount(c => c + 1)
    setTimeout(() => { setFlash(null); setCorrectIdx(null); setLocked(false); setPair(makePair(level)) }, 700)
  }

  const best = getBest()

  if (phase === 'select') return (
    <GameLayout title="どっちがおおきい？" gradient={GRAD}>
      <div className="flex flex-col gap-4 pt-4">
        <p className="text-center text-xl font-bold text-gray-700">モードをえらんでね</p>
        {([1, 2, 3] as Level[]).map(lv => (
          <div key={lv} className="bg-white rounded-2xl border-2 border-blue-200 p-4" style={{ boxShadow: '3px 4px 0 rgba(0,0,0,0.07)' }}>
            <p className="font-bold text-gray-700 mb-1">レベル{lv}：{LEVEL_LABEL[lv]}</p>
            {/* ④修正: タイムモードのbestも表示 */}
            <div className="flex gap-3 text-xs text-gray-400 mb-2">
              {best[`${lv}_q`] != null && <span>🏆 {best[`${lv}_q`]}/{TOTAL}せいかい</span>}
              {best[`${lv}_t`] != null && <span>⏱ {best[`${lv}_t`]}もん（30s）</span>}
            </div>
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
    const key = `${level}_${timeMode ? 't' : 'q'}`; const isNewBest = getBest()[key] == null || score > getBest()[key]; saveBest(key, score)
    return (
      <GameLayout title="どっちがおおきい？" gradient={GRAD}>
        <ResultScreen
          score={score}
          total={timeMode ? undefined : TOTAL}
          scoreLabel={timeMode ? 'せいかい' : undefined}
          scoreSuffix={timeMode ? 'もん' : undefined}
          extra={[{ label: 'さいこうれんぞく', value: `${maxStreak}かい 🔥` }]}
          bestStr={getBest()[key] != null ? (timeMode ? `${getBest()[key]}もん` : `${getBest()[key]}/${TOTAL}`) : undefined}
          onRetry={() => start(level, timeMode)}
          onChangeMode={() => setPhase('select')}
          isNewBest={isNewBest}
          accentColor="text-blue-500"
        />
      </GameLayout>
    )
  }

  return (
    <GameLayout title="どっちがおおきい？" gradient={GRAD} isPlaying={phase === 'play'}>
      <div className="flex flex-col items-center gap-4">
        <GameFeedback flash={flash} />
        <div className="flex justify-between w-full items-center">
          <span className="text-xl font-bold text-gray-700">⭐ {score}</span>
          {timeMode
            ? <span className={`text-xl font-bold ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-gray-700'}`}>⏱ {timeLeft}s</span>
            : <span className="text-xl font-bold text-gray-700">{qCount}/{TOTAL}</span>
          }
        </div>
        {streak >= 3 && <div className="bg-orange-100 rounded-full px-4 py-1 bounce-in"><span className="text-base font-bold text-orange-600">🔥 {streak}れんぞく！</span></div>}
        <p className="text-lg text-gray-600 mt-2">おおきいほうを タップ！</p>
        <div className="flex gap-4 w-full">
          {[pair.a, pair.b].map((n, i) => (
            <button
              key={i}
              onClick={() => tap(n)}
              disabled={locked}
              className="flex-1 rounded-2xl border-2 shadow-md active:scale-95 transition-all font-black"
              style={{
                height: 100,
                fontSize: 40,
                // 不正解時: 正解ボタンを緑にして正解を示す
                background: correctIdx === i ? '#dcfce7' : '#eff6ff',
                borderColor: correctIdx === i ? '#22c55e' : '#93c5fd',
                boxShadow: '3px 4px 0 rgba(0,0,0,0.07)',
                color: correctIdx === i ? '#15803d' : '#1f2937',
                transform: correctIdx === i ? 'scale(1.04)' : undefined,
              }}
            >
              {n.toLocaleString()}
              {correctIdx === i && <span className="block text-sm font-bold text-green-600">✓ こっちが おおきい！</span>}
            </button>
          ))}
        </div>
      </div>
    </GameLayout>
  )
}
