import { useState } from 'react'
import { GameLayout } from '../components/GameLayout'

type Difficulty = 'easy' | 'hard'

const COLORS = ['🔴','🔵','🟡','🟢','🟠','🟣','🩷','🩵']
const SHAPES = ['⭐','🌙','❤️','💎','🔶','🔷','🌀','⚡']
const ANIMALS = ['🐶','🐱','🐰','🐻','🐸','🐯','🦊','🐼']

type Pattern = { seq: string[]; answer: string; choices: string[]; explanation: string }

function pick<T>(arr: T[], n: number): T[] {
  return [...arr].sort(() => Math.random() - 0.5).slice(0, n)
}

function makeSimplePattern(pool: string[]): Pattern {
  const n = 2
  const cycle = pick(pool, n)
  const full = [...cycle, ...cycle, ...cycle].slice(0, 5)
  const answer = cycle[full.length % cycle.length]
  const wrong = pool.filter(x => x !== answer)
  const choices = [answer, ...pick(wrong, 3)].sort(() => Math.random() - 0.5)
  return { seq: full, answer, choices, explanation: `${cycle.join('→')} のくりかえし！` }
}

function makeHardPattern(pool: string[]): Pattern {
  const n = Math.random() > 0.5 ? 3 : 4
  const cycle = pick(pool, n)
  const full = [...cycle, ...cycle].slice(0, 6)
  const answer = cycle[full.length % cycle.length]
  const wrong = pool.filter(x => x !== answer)
  const choices = [answer, ...pick(wrong, 3)].sort(() => Math.random() - 0.5)
  return { seq: full, answer, choices, explanation: `${cycle.join('→')} のくりかえし！` }
}

function makeNumberPattern(): Pattern {
  const types = ['add', 'mul', 'fib']
  const type = types[Math.floor(Math.random() * types.length)]
  let seq: number[], answer: number

  if (type === 'add') {
    const start = Math.floor(Math.random() * 5) + 1
    const step = Math.floor(Math.random() * 4) + 1
    seq = Array.from({ length: 5 }, (_, i) => start + i * step)
    answer = start + 5 * step
  } else if (type === 'mul') {
    const start = 1
    const factor = Math.floor(Math.random() * 2) + 2
    seq = Array.from({ length: 5 }, (_, i) => start * Math.pow(factor, i))
    answer = start * Math.pow(factor, 5)
  } else {
    seq = [1, 1, 2, 3, 5]
    answer = 8
  }

  const seqStr = seq.map(String)
  const ansStr = String(answer)
  const wrong = [answer + 1, answer - 1, answer + seq[seq.length - 1]].map(String)
  const choices = [ansStr, ...wrong].sort(() => Math.random() - 0.5)
  const explanation = type === 'add' ? `+${(seq[1] - seq[0])} ずつふえる！` : type === 'mul' ? `×${Math.round(seq[1] / seq[0])} ずつ！` : `まえの2つを たすフィボナッチ数列！`
  return { seq: seqStr, answer: ansStr, choices, explanation }
}

function makePattern(diff: Difficulty): Pattern {
  const pools = [COLORS, SHAPES, ANIMALS]
  const pool = pools[Math.floor(Math.random() * pools.length)]
  const useNum = Math.random() > 0.6
  if (useNum) return makeNumberPattern()
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

  function start(d: Difficulty) {
    setDiff(d); setScore(0); setQNum(1); setPattern(makePattern(d)); setPhase('play')
  }

  function tap(c: string) {
    if (!pattern) return
    if (c === pattern.answer) {
      setFlash('ok'); setScore(s => s + 1); setShowExp(false)
    } else {
      setFlash('ng'); setLastExp(pattern.explanation); setShowExp(true)
    }
    setTimeout(() => {
      setFlash(null)
      if (qNum >= TOTAL) { setPhase('over') } else { setQNum(n => n + 1); setPattern(makePattern(diff)) }
    }, showExp && flash === 'ng' ? 1200 : 400)
  }

  if (phase === 'select') return (
    <GameLayout title="つぎはどれ？" color="bg-indigo-400">
      <div className="flex flex-col gap-4 pt-6">
        <p className="text-center text-xl font-bold text-gray-700">むずかしさをえらんでね</p>
        {(['easy', 'hard'] as Difficulty[]).map(d => (
          <button key={d} onClick={() => start(d)} className="bg-white border-2 border-indigo-200 rounded-2xl p-5 text-left shadow active:scale-95">
            <p className="font-bold text-gray-700 text-lg">{d === 'easy' ? '🌟 かんたん' : '🔥 むずかしい'}</p>
            <p className="text-sm text-gray-500 mt-1">{d === 'easy' ? '2つの くりかえし（いろ・かたち・かず）' : '3〜4つの くりかえし + すうれつ'}</p>
          </button>
        ))}
      </div>
    </GameLayout>
  )

  if (phase === 'over') return (
    <GameLayout title="つぎはどれ？" color="bg-indigo-400">
      <div className="flex flex-col items-center gap-5 pt-8 bounce-in">
        <p className="text-4xl">{score >= 12 ? '🎉' : '😊'}</p>
        <p className="text-3xl font-bold text-gray-700">おわり！</p>
        <div className="bg-indigo-50 border-2 border-indigo-200 rounded-3xl p-6 text-center w-full">
          <p className="text-lg text-gray-500">せいかい</p>
          <p className="text-6xl font-bold text-indigo-500 mt-1">{score}<span className="text-2xl"> / {TOTAL}</span></p>
        </div>
        <div className="flex gap-3 w-full">
          <button onClick={() => start(diff)} className="flex-1 py-4 text-lg font-bold bg-indigo-400 text-white rounded-2xl shadow active:scale-95">もういちど</button>
          <button onClick={() => setPhase('select')} className="flex-1 py-4 text-lg font-bold bg-gray-200 text-gray-700 rounded-2xl active:scale-95">もどる</button>
        </div>
      </div>
    </GameLayout>
  )

  if (!pattern) return null

  return (
    <GameLayout title="つぎはどれ？" color="bg-indigo-400">
      <div className={`flex flex-col items-center gap-5 rounded-2xl p-2 transition-colors ${flash === 'ok' ? 'bg-green-50' : flash === 'ng' ? 'bg-red-50' : ''}`}>
        <div className="flex justify-between w-full">
          <span className="text-xl font-bold text-gray-700">⭐ {score}</span>
          <span className="text-xl font-bold text-gray-700">{qNum} / {TOTAL}</span>
        </div>
        <p className="text-lg text-gray-600">つぎは なに？</p>
        <div className="bg-indigo-50 rounded-2xl p-4 w-full">
          <div className="flex items-center gap-2 flex-wrap justify-center">
            {pattern.seq.map((s, i) => (
              <span key={i} className="text-3xl px-1">{s}</span>
            ))}
            <span className="text-3xl font-bold text-indigo-400 px-1">→</span>
            <span className="text-3xl font-bold text-indigo-300 bg-indigo-100 rounded-xl px-3 py-1">？</span>
          </div>
        </div>
        {showExp && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-2 w-full bounce-in">
            <p className="text-sm text-blue-600 text-center">💡 {lastExp}</p>
          </div>
        )}
        <div className="grid grid-cols-2 gap-4 w-full">
          {pattern.choices.map((c, i) => (
            <button key={i} onClick={() => tap(c)} className="py-6 text-3xl bg-white rounded-2xl border-2 border-indigo-200 shadow active:scale-95">
              {c}
            </button>
          ))}
        </div>
      </div>
    </GameLayout>
  )
}
