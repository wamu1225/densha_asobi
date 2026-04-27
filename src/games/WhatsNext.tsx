import { useState } from 'react'
import { GameLayout } from '../components/GameLayout'

type Pattern = { seq: string[]; answer: string; choices: string[] }

const SHAPE_COLORS = ['🔴','🔵','🟡','🟢','🟠','🟣']
const SHAPES = ['⭐','🌙','❤️','💎','🔶','🔷']
const ANIMALS = ['🐶','🐱','🐰','🐻','🐸','🐯']

function makeColorPattern(): Pattern {
  const n = Math.floor(Math.random() * 3) + 2
  const cycle = SHAPE_COLORS.slice(0, n)
  const seq = [...cycle, ...cycle].slice(0, 5)
  const answer = cycle[seq.length % cycle.length]
  const wrong = SHAPE_COLORS.filter(c => c !== answer).slice(0, 3)
  const choices = [answer, ...wrong].sort(() => Math.random() - 0.5)
  return { seq, answer, choices }
}

function makeShapePattern(): Pattern {
  const n = Math.floor(Math.random() * 3) + 2
  const cycle = SHAPES.slice(0, n)
  const seq = [...cycle, ...cycle].slice(0, 5)
  const answer = cycle[seq.length % cycle.length]
  const wrong = SHAPES.filter(s => s !== answer).slice(0, 3)
  const choices = [answer, ...wrong].sort(() => Math.random() - 0.5)
  return { seq, answer, choices }
}

function makeAnimalPattern(): Pattern {
  const n = Math.floor(Math.random() * 3) + 2
  const cycle = ANIMALS.slice(0, n)
  const seq = [...cycle, ...cycle].slice(0, 5)
  const answer = cycle[seq.length % cycle.length]
  const wrong = ANIMALS.filter(a => a !== answer).slice(0, 3)
  const choices = [answer, ...wrong].sort(() => Math.random() - 0.5)
  return { seq, answer, choices }
}

function makeNumberPattern(): Pattern {
  const start = Math.floor(Math.random() * 5) + 1
  const step = Math.floor(Math.random() * 3) + 1
  const nums = Array.from({ length: 5 }, (_, i) => start + i * step)
  const answer = String(start + 5 * step)
  const seq = nums.map(String)
  const wrong = [String(Number(answer) + 1), String(Number(answer) - 1), String(Number(answer) + step + 1)]
  const choices = [answer, ...wrong].sort(() => Math.random() - 0.5)
  return { seq, answer, choices }
}

const generators = [makeColorPattern, makeShapePattern, makeAnimalPattern, makeNumberPattern]

function makePattern(): Pattern {
  return generators[Math.floor(Math.random() * generators.length)]()
}

type Phase = 'play' | 'over'

export function WhatsNext() {
  const [phase, setPhase] = useState<Phase>('play')
  const [pattern, setPattern] = useState(makePattern)
  const [score, setScore] = useState(0)
  const [qNum, setQNum] = useState(1)
  const [flash, setFlash] = useState<'ok' | 'ng' | null>(null)
  const total = 10

  function tap(c: string) {
    if (c === pattern.answer) {
      setFlash('ok'); setScore(s => s + 1)
    } else {
      setFlash('ng')
    }
    setTimeout(() => {
      setFlash(null)
      if (qNum >= total) { setPhase('over') } else { setQNum(n => n + 1); setPattern(makePattern()) }
    }, 400)
  }

  function reset() { setPhase('play'); setScore(0); setQNum(1); setPattern(makePattern()) }

  if (phase === 'over') return (
    <GameLayout title="つぎはどれ？" color="bg-indigo-400">
      <div className="flex flex-col items-center gap-6 pt-10 bounce-in">
        <p className="text-4xl">🎉</p>
        <p className="text-3xl font-bold text-gray-700">おわり！</p>
        <div className="bg-indigo-100 rounded-3xl p-6 text-center">
          <p className="text-lg text-gray-600">せいかい</p>
          <p className="text-6xl font-bold text-indigo-500 mt-2">{score}<span className="text-2xl"> / {total}</span></p>
        </div>
        <button onClick={reset} className="px-8 py-4 text-xl font-bold bg-indigo-400 text-white rounded-2xl shadow active:scale-95">もういちど</button>
      </div>
    </GameLayout>
  )

  return (
    <GameLayout title="つぎはどれ？" color="bg-indigo-400">
      <div className={`flex flex-col items-center gap-6 rounded-2xl p-2 transition-colors ${flash === 'ok' ? 'bg-green-50' : flash === 'ng' ? 'bg-red-50' : ''}`}>
        <div className="flex justify-between w-full">
          <span className="text-xl font-bold text-gray-700">⭐ {score}</span>
          <span className="text-xl font-bold text-gray-700">{qNum} / {total}</span>
        </div>
        <p className="text-lg text-gray-600">つぎは なに？</p>
        <div className="flex items-center gap-2 bg-indigo-50 rounded-2xl p-4 w-full justify-center flex-wrap">
          {pattern.seq.map((s, i) => (
            <span key={i} className="text-4xl">{s}</span>
          ))}
          <span className="text-4xl font-bold text-indigo-500">→ ？</span>
        </div>
        <div className="grid grid-cols-2 gap-4 w-full">
          {pattern.choices.map((c, i) => (
            <button key={i} onClick={() => tap(c)} className="py-6 text-4xl bg-white rounded-2xl border-2 border-indigo-300 shadow active:scale-95">
              {c}
            </button>
          ))}
        </div>
      </div>
    </GameLayout>
  )
}
