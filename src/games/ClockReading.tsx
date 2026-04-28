import { useState } from 'react'
import { GameLayout } from '../components/GameLayout'
import { ResultScreen } from '../components/ResultScreen'

type Difficulty = 'easy' | 'normal' | 'hard'
type Phase = 'select' | 'play' | 'over'

const GRAD = 'linear-gradient(135deg, #c084fc, #a855f7)'
const BEST_KEY = 'densha_clock_best'
function getBest(): Record<string, number> { try { return JSON.parse(localStorage.getItem(BEST_KEY) || '{}') } catch { return {} } }
function saveBest(key: string, val: number) { const b = getBest(); if (!b[key] || val > b[key]) { b[key] = val; localStorage.setItem(BEST_KEY, JSON.stringify(b)) } }

const DIFF_LABEL: Record<Difficulty, string> = { easy: 'ちょうど（〜じ）', normal: '15分きざみ', hard: '5分きざみ' }
const DIFF_MINUTES: Record<Difficulty, number[]> = {
  easy: [0], normal: [0, 15, 30, 45],
  hard: [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55],
}
const TOTAL = 12

function randomTime(diff: Difficulty) {
  const mins = DIFF_MINUTES[diff]
  return { h: Math.floor(Math.random() * 12) + 1, m: mins[Math.floor(Math.random() * mins.length)] }
}
function fmt(h: number, m: number) { return m === 0 ? `${h}じ` : `${h}じ ${m}ふん` }

function makeChoices(h: number, m: number, diff: Difficulty) {
  const used = new Set([fmt(h, m)]); const result = [{ h, m }]
  const allMins = DIFF_MINUTES[diff]
  while (result.length < 4) {
    const nh = Math.floor(Math.random() * 12) + 1; const nm = allMins[Math.floor(Math.random() * allMins.length)]
    const s = fmt(nh, nm); if (!used.has(s)) { used.add(s); result.push({ h: nh, m: nm }) }
  }
  return result.sort(() => Math.random() - 0.5)
}

function ClockSvg({ h, m }: { h: number; m: number }) {
  const cx = 120, cy = 120, r = 100
  const mAng = (m / 60) * 360 - 90; const hAng = ((h % 12) / 12) * 360 + (m / 60) * 30 - 90
  const toXY = (a: number, l: number) => ({ x: cx + l * Math.cos((a * Math.PI) / 180), y: cy + l * Math.sin((a * Math.PI) / 180) })
  const mP = toXY(mAng, 78); const hP = toXY(hAng, 55)
  return (
    <svg viewBox="0 0 240 240" className="w-52 h-52 drop-shadow-xl">
      <defs>
        <radialGradient id="clockBg" cx="40%" cy="35%"><stop offset="0%" stopColor="#f5f3ff" /><stop offset="100%" stopColor="#ede9fe" /></radialGradient>
      </defs>
      <circle cx={cx} cy={cy} r={r + 10} fill="#ddd6fe" opacity="0.5" />
      <circle cx={cx} cy={cy} r={r} fill="url(#clockBg)" stroke="#a855f7" strokeWidth="4" />
      {[...Array(60)].map((_, i) => {
        const a = (i / 60) * 360 - 90; const isHour = i % 5 === 0
        const p1 = toXY(a, isHour ? 80 : 90); const p2 = toXY(a, 97)
        return <line key={i} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke={isHour ? '#9333ea' : '#ddd6fe'} strokeWidth={isHour ? 3 : 1.5} />
      })}
      {[1,2,3,4,5,6,7,8,9,10,11,12].map(n => {
        const a = ((n / 12) * 360 - 90) * Math.PI / 180
        return <text key={n} x={cx + 70 * Math.cos(a)} y={cy + 70 * Math.sin(a)} textAnchor="middle" dominantBaseline="central" fontSize="15" fontWeight="800" fill="#6b21a8">{n}</text>
      })}
      <line x1={cx} y1={cy} x2={mP.x} y2={mP.y} stroke="#1e293b" strokeWidth="3.5" strokeLinecap="round" />
      <line x1={cx} y1={cy} x2={hP.x} y2={hP.y} stroke="#1e293b" strokeWidth="6" strokeLinecap="round" />
      {m !== 0 && <line x1={cx} y1={cy} x2={toXY(mAng, 85).x} y2={toXY(mAng, 85).y} stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />}
      <circle cx={cx} cy={cy} r="6" fill="#e11d48" />
    </svg>
  )
}

export function ClockReading() {
  const [phase, setPhase] = useState<Phase>('select')
  const [diff, setDiff] = useState<Difficulty>('easy')
  const [time, setTime] = useState({ h: 3, m: 0 })
  const [choices, setChoices] = useState<{ h: number; m: number }[]>([])
  const [score, setScore] = useState(0)
  const [qNum, setQNum] = useState(1)
  const [flash, setFlash] = useState<'ok' | 'ng' | null>(null)
  const [wrongAns, setWrongAns] = useState('')
  // ⑦修正: ダブルタップ防止
  const [locked, setLocked] = useState(false)

  function loadQ(d: Difficulty) {
    // ⑧修正: 問題と選択肢を同時更新（空choicesを防ぐ）
    const t = randomTime(d); setTime(t); setChoices(makeChoices(t.h, t.m, d))
  }
  function start(d: Difficulty) { setDiff(d); setScore(0); setQNum(1); setLocked(false); loadQ(d); setPhase('play') }

  function tap(c: { h: number; m: number }) {
    if (locked) return
    setLocked(true)
    if (fmt(c.h, c.m) === fmt(time.h, time.m)) { setFlash('ok'); setScore(s => s + 1); setWrongAns('') }
    else { setFlash('ng'); setWrongAns(`こたえ：${fmt(time.h, time.m)}`) }
    setTimeout(() => {
      setFlash(null); setWrongAns(''); setLocked(false)
      if (qNum >= TOTAL) { setPhase('over') } else { setQNum(n => n + 1); loadQ(diff) }
    }, 900)
  }

  const best = getBest()

  if (phase === 'select') return (
    <GameLayout title="とけいをよもう" gradient={GRAD}>
      <div className="flex flex-col gap-4 pt-4">
        <p className="text-center text-xl font-bold text-gray-700">むずかしさをえらんでね</p>
        {(['easy', 'normal', 'hard'] as Difficulty[]).map(d => (
          <button key={d} onClick={() => start(d)} className="bg-white border border-purple-100 rounded-2xl p-4 text-left shadow-md active:scale-95">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-bold text-gray-700">{d === 'easy' ? '🌟 かんたん' : d === 'normal' ? '⭐ ふつう' : '🔥 むずかしい'}</p>
                <p className="text-sm text-gray-500 mt-1">{DIFF_LABEL[d]}</p>
              </div>
              {best[d] != null && <p className="text-sm text-gray-400">🏆 {best[d]}/{TOTAL}</p>}
            </div>
          </button>
        ))}
      </div>
    </GameLayout>
  )

  if (phase === 'over') {
    saveBest(diff, score)
    return (
      <GameLayout title="とけいをよもう" gradient={GRAD}>
        <ResultScreen score={score} total={TOTAL} best={getBest()[diff]} bestLabel={`ベスト（${diff}）`} onRetry={() => start(diff)} accentColor="text-purple-500" />
      </GameLayout>
    )
  }

  return (
    <GameLayout title="とけいをよもう" gradient={GRAD}>
      <div className="flex flex-col items-center gap-3">
        {flash === 'ok' && <div className="w-full bg-green-100 border-2 border-green-400 rounded-2xl py-2 text-center bounce-in"><span className="text-xl font-black text-green-600">⭕ せいかい！</span></div>}
        {flash === 'ng' && wrongAns && <div className="w-full bg-red-100 border-2 border-red-400 rounded-2xl py-2 text-center bounce-in"><span className="text-lg font-black text-red-600">❌ {wrongAns}</span></div>}
        <div className="flex justify-between w-full">
          <span className="text-xl font-bold text-gray-700">⭐ {score}</span>
          <span className="text-xl font-bold text-gray-700">{qNum} / {TOTAL}</span>
        </div>
        <p className="text-lg font-bold text-gray-600">なんじ なんぷん？</p>
        <ClockSvg h={time.h} m={time.m} />
        <div className="grid grid-cols-2 gap-3 w-full">
          {choices.map((c, i) => (
            <button key={i} onClick={() => tap(c)} className="bg-white rounded-2xl border-2 border-purple-200 shadow-md active:scale-95 font-bold text-gray-800" style={{ height: 70, fontSize: 20 }}>
              {fmt(c.h, c.m)}
            </button>
          ))}
        </div>
      </div>
    </GameLayout>
  )
}
