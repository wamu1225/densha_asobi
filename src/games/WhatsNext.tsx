import { useState } from 'react'
import { GameLayout } from '../components/GameLayout'
import { GameFeedback } from '../components/GameFeedback'
import { ResultScreen } from '../components/ResultScreen'

const GRAD = 'linear-gradient(135deg, #818cf8, #6366f1)'
type Difficulty = 'easy' | 'hard'

const COLORS  = ['🔴','🔵','🟡','🟢','🟠','🟣','🩷','🩵']
const SHAPES  = ['⭐','🌙','❤️','💎','🔶','🔷','🌀','⚡']
const ANIMALS = ['🐶','🐱','🐰','🐻','🐸','🐯','🦊','🐼']

type Pattern = { seq: string[]; answer: string; choices: string[]; explanation: string }

function pick<T>(arr: T[], n: number): T[] { return [...arr].sort(() => Math.random() - 0.5).slice(0, n) }

function makeSimplePattern(pool: string[]): Pattern {
  const cycle = pick(pool, 2)
  const full = [...cycle, ...cycle, ...cycle].slice(0, 5)
  const answer = cycle[full.length % cycle.length]
  const choices = [answer, ...pick(pool.filter(x => x !== answer), 3)].sort(() => Math.random() - 0.5)
  return { seq: full, answer, choices, explanation: `${cycle.join('→')} のくりかえし！` }
}

function makeHardPattern(pool: string[]): Pattern {
  const n = Math.random() > 0.5 ? 3 : 4
  const cycle = pick(pool, n)
  const full = [...cycle, ...cycle].slice(0, 6)
  const answer = cycle[full.length % cycle.length]
  const choices = [answer, ...pick(pool.filter(x => x !== answer), 3)].sort(() => Math.random() - 0.5)
  return { seq: full, answer, choices, explanation: `${cycle.join('→')} のくりかえし！` }
}

// フィボナッチ系列（ランダム開始）
const FIB_BASE = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89]

function makeNumberPattern(): Pattern {
  // 掛け算（2^5=32 など）は子どもに難しすぎるので除外し、加算とフィボナッチのみ
  const type = Math.random() < 0.6 ? 'add' : 'fib'
  let seq: number[], answer: number

  if (type === 'add') {
    const start = Math.floor(Math.random() * 5) + 1
    const step = Math.floor(Math.random() * 4) + 1
    seq = Array.from({ length: 5 }, (_, i) => start + i * step)
    answer = start + 5 * step
  } else {
    const start = Math.floor(Math.random() * 5)
    seq = FIB_BASE.slice(start, start + 5)
    answer = FIB_BASE[start + 5]
  }

  const ansStr = String(answer)
  const seqArr = seq
  const seqNums = new Set(seqArr)
  const candidates = [answer + 1, answer - 1, answer + seqArr[seqArr.length - 1], answer + 2, answer + 3, answer - 2]
  const wrong = candidates.filter(n => n > 0 && n !== answer && !seqNums.has(n)).slice(0, 3).map(String)
  const choices = [ansStr, ...wrong].sort(() => Math.random() - 0.5)

  const explanation =
    type === 'add' ? `+${seqArr[1] - seqArr[0]} ずつふえる！` :
    `まえの2つをたすと つぎのかず！（${seqArr[seqArr.length - 2]}+${seqArr[seqArr.length - 1]}=${answer}）`

  return { seq: seqArr.map(String), answer: ansStr, choices, explanation }
}

function makePattern(diff: Difficulty): Pattern {
  const pools = [COLORS, SHAPES, ANIMALS]
  const pool = pools[Math.floor(Math.random() * pools.length)]
  // easy: 数列20%・絵柄80% / hard: 数列50%・絵柄50%
  const numChance = diff === 'easy' ? 0.2 : 0.5
  if (Math.random() < numChance) return makeNumberPattern()
  return diff === 'easy' ? makeSimplePattern(pool) : makeHardPattern(pool)
}

const TOTAL = 15

export function WhatsNext() {
  const [phase, setPhase] = useState<'select' | 'play' | 'over'>('select')
  const [diff, setDiff] = useState<Difficulty>('easy')
  const [pattern, setPattern] = useState<Pattern | null>(null)
  const [score, setScore] = useState(0)
  const [qNum, setQNum] = useState(1)
  const [flash, setFlash] = useState<'ok' | 'ng' | null>(null)
  const [showExp, setShowExp] = useState(false)
  const [lastExp, setLastExp] = useState('')
  // ⑮修正: ダブルタップ防止
  const [locked, setLocked] = useState(false)

  function start(d: Difficulty) {
    setDiff(d); setScore(0); setQNum(1); setLocked(false)
    setPattern(makePattern(d)); setPhase('play')
  }

  function tap(c: string) {
    if (!pattern || locked) return
    setLocked(true)

    const isCorrect = c === pattern.answer
    if (isCorrect) { setFlash('ok'); setScore(s => s + 1); setShowExp(false) }
    else { setFlash('ng'); setLastExp(pattern.explanation); setShowExp(true) }

    // ⑬修正: stale closure を排除し、正誤で遅延を直接決定
    const delay = isCorrect ? 400 : 1200
    setTimeout(() => {
      setFlash(null); setLocked(false)
      if (qNum >= TOTAL) { setPhase('over') } else { setQNum(n => n + 1); setPattern(makePattern(diff)) }
    }, delay)
  }

  if (phase === 'select') return (
    <GameLayout title="つぎはどれ？" gradient={GRAD}>
      <div className="flex flex-col gap-4 pt-6">
        <p className="text-center text-xl font-bold text-gray-700">むずかしさをえらんでね</p>
        {(['easy', 'hard'] as Difficulty[]).map(d => (
          <button key={d} onClick={() => start(d)} className="bg-white border-2 border-indigo-200 rounded-2xl p-5 text-left active:scale-95" style={{ boxShadow: '3px 4px 0 rgba(0,0,0,0.07)' }}>
            <p className="font-bold text-gray-700 text-lg">{d === 'easy' ? '🌟 かんたん' : '🔥 むずかしい'}</p>
            <p className="text-sm text-gray-500 mt-1">
              {d === 'easy' ? '2つのくりかえし（いろ・かたち・かず）' : '3〜4つのくりかえし ＋ すうれつ'}
            </p>
          </button>
        ))}
      </div>
    </GameLayout>
  )

  if (phase === 'over') return (
    <GameLayout title="つぎはどれ？" gradient={GRAD}>
      <ResultScreen score={score} total={TOTAL} onRetry={() => start(diff)} onChangeMode={() => setPhase('select')} accentColor="text-indigo-500" />
    </GameLayout>
  )

  if (!pattern) return null

  return (
    <GameLayout title="つぎはどれ？" gradient={GRAD} isPlaying={phase === 'play'}>
      <div className="flex flex-col items-center gap-4">
        <div className="flex justify-between w-full">
          <span className="text-xl font-bold text-gray-700">⭐ {score}</span>
          <span className="text-xl font-bold text-gray-700">{qNum} / {TOTAL}</span>
        </div>
        <GameFeedback flash={flash} />

        <p className="text-lg font-bold text-gray-600">つぎは なに？</p>
        <div className="bg-indigo-50 rounded-2xl p-4 w-full border border-indigo-100">
          <div className="flex items-center gap-1.5 flex-wrap justify-center">
            {pattern.seq.map((s, i) => <span key={i} className="text-3xl px-1">{s}</span>)}
            <span className="text-2xl font-bold text-indigo-400 px-1">→</span>
            <span className="text-3xl font-bold text-indigo-300 bg-indigo-100 rounded-xl px-3 py-1">？</span>
          </div>
        </div>
        {showExp && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-2 w-full bounce-in">
            <p className="text-sm text-blue-600 text-center font-bold">💡 {lastExp}</p>
          </div>
        )}
        <div className="grid grid-cols-2 gap-3 w-full">
          {pattern.choices.map((c, i) => (
            <button
              key={i}
              onClick={() => tap(c)}
              disabled={locked}
              className="rounded-2xl border-2 active:scale-95 transition-transform font-bold text-gray-800 disabled:opacity-60"
              style={{ height: 80, fontSize: 32, background: '#eef2ff', borderColor: '#a5b4fc', boxShadow: '3px 4px 0 rgba(0,0,0,0.07)' }}
            >
              {c}
            </button>
          ))}
        </div>
      </div>
    </GameLayout>
  )
}
