import { useState } from 'react'
import { GameLayout } from '../components/GameLayout'
import { GameFeedback } from '../components/GameFeedback'
import { ResultScreen } from '../components/ResultScreen'

const GRAD = 'linear-gradient(135deg, #818cf8, #6366f1)'
type Difficulty = 'easy' | 'hard'

// 2026-06-11 P5e: 駒を絵文字→SVGチップ（文字列ID）に変更。判定は文字列比較のまま
const COLORS = ['c:red','c:blue','c:yellow','c:green','c:purple','c:orange']
const SHAPES = ['s:star','s:heart','s:diamond','s:triangle','s:square','s:moon']
const SIZES  = ['z:big','z:small','z:mid']   // おおきさ交互パターン用

const CHIP_COLOR: Record<string, string> = {
  'c:red': '#ef4444', 'c:blue': '#3b82f6', 'c:yellow': '#facc15',
  'c:green': '#22c55e', 'c:purple': '#a855f7', 'c:orange': '#f97316',
}
const SHAPE_PATH: Record<string, string> = {
  's:star': 'M12 2.8l2.6 5.6 6 .8-4.4 4.2 1.1 6-5.3-2.9-5.3 2.9 1.1-6L3.4 9.2l6-.8z',
  's:heart': 'M12 21C5 16 2 12.2 2 8.8 2 6 4.2 4 6.8 4c2 0 3.9 1.2 5.2 3.1C13.3 5.2 15.2 4 17.2 4 19.8 4 22 6 22 8.8c0 3.4-3 7.2-10 12.2z',
  's:diamond': 'M12 2l9 10-9 10L3 12z',
  's:triangle': 'M12 3.5L21.5 20h-19z',
  's:square': 'M5.5 4.5h13a1.5 1.5 0 0 1 1.5 1.5v12a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18V6a1.5 1.5 0 0 1 1.5-1.5z',
  's:moon': 'M14.5 2.5A9.5 9.5 0 1 0 21.5 14 7.5 7.5 0 0 1 14.5 2.5z',
}
const SIZE_R: Record<string, number> = { 'z:big': 10, 'z:mid': 6.5, 'z:small': 3.5 }

// 駒の描画。数字はそのままテキスト
export function Chip({ id, size = 36 }: { id: string; size?: number }) {
  if (id.startsWith('c:')) return (
    <svg width={size} height={size} viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill={CHIP_COLOR[id]} /></svg>
  )
  if (id.startsWith('s:')) return (
    <svg width={size} height={size} viewBox="0 0 24 24"><path d={SHAPE_PATH[id]} fill="#6366f1" /></svg>
  )
  if (id.startsWith('z:')) return (
    <svg width={size} height={size} viewBox="0 0 24 24"><circle cx="12" cy="12" r={SIZE_R[id]} fill="#6366f1" /></svg>
  )
  return <span style={{ fontSize: size * 0.72, fontWeight: 800, lineHeight: 1 }}>{id}</span>
}

type Pattern = { seq: string[]; answer: string; choices: string[]; explanation: string }

function pick<T>(arr: T[], n: number): T[] { return [...arr].sort(() => Math.random() - 0.5).slice(0, n) }
function randPool(): string[] { const pools = [COLORS, SHAPES, SIZES]; return pools[Math.floor(Math.random() * pools.length)] }

// ABAB…のくりかえし
function makeSimplePattern(pool: string[]): Pattern {
  const cycle = pick(pool, 2)
  const full = [...cycle, ...cycle, ...cycle].slice(0, 5)
  const answer = cycle[full.length % cycle.length]
  const choices = [answer, ...pick(pool.filter(x => x !== answer), 3)].sort(() => Math.random() - 0.5)
  return { seq: full, answer, choices, explanation: 'おなじ ならびの くりかえしだよ！' }
}

// 3〜4要素のくりかえし
function makeHardPattern(pool: string[]): Pattern {
  const n = Math.random() > 0.5 ? 3 : 4
  const cycle = pick(pool, n)
  const full = [...cycle, ...cycle].slice(0, 6)
  const answer = cycle[full.length % cycle.length]
  const choices = [answer, ...pick(pool.filter(x => x !== answer), 3)].sort(() => Math.random() - 0.5)
  return { seq: full, answer, choices, explanation: 'おなじ ならびの くりかえしだよ！' }
}

// AABB…2こずつ交代
function makeDoublePattern(pool: string[]): Pattern {
  const [a, b] = pick(pool, 2)
  const cycle = [a, a, b, b]
  const full = [...cycle, ...cycle].slice(0, 6)
  const answer = cycle[full.length % cycle.length]
  const choices = [answer, ...pick(pool.filter(x => x !== answer), 3)].sort(() => Math.random() - 0.5)
  return { seq: full, answer, choices, explanation: '2こずつ かわりばんこ だよ！' }
}

// かがみ（A B C B A）
function makeMirrorPattern(pool: string[]): Pattern {
  const [a, b, c] = pick(pool, 3)
  const seq = [a, b, c, b]
  const answer = a
  const choices = [answer, ...pick(pool.filter(x => x !== answer), 3)].sort(() => Math.random() - 0.5)
  return { seq, answer, choices, explanation: 'かがみみたいに おりかえす ならびだよ！' }
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
  const r = Math.random()
  if (diff === 'easy') {
    // かんたん: くりかえし60% / 2こずつ25% / 数列15%
    if (r < 0.15) return makeNumberPattern()
    if (r < 0.40) return makeDoublePattern(randPool())
    return makeSimplePattern(randPool())
  }
  // むずかしい: 数列35% / かがみ20% / 2こずつ15% / 3〜4くりかえし30%
  if (r < 0.35) return makeNumberPattern()
  if (r < 0.55) return makeMirrorPattern(randPool())
  if (r < 0.70) return makeDoublePattern(randPool())
  return makeHardPattern(randPool())
}

const TOTAL = 15
const BEST_KEY = 'densha_next_best'
function getBest(): Record<string, number> { try { return JSON.parse(localStorage.getItem(BEST_KEY) || '{}') } catch { return {} } }
function saveBest(key: string, val: number) { const b = getBest(); if (!b[key] || val > b[key]) { b[key] = val; localStorage.setItem(BEST_KEY, JSON.stringify(b)) } }

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
            <p className="font-bold text-gray-700 text-lg">{d === 'easy' ? '★☆ かんたん' : '★★ むずかしい'}</p>
            <p className="text-sm text-gray-500 mt-1">
              {d === 'easy' ? 'くりかえし・2こずつ（いろ・かたち・おおきさ・かず）' : '3〜4のくりかえし・かがみ・すうれつ'}
            </p>
          </button>
        ))}
      </div>
    </GameLayout>
  )

  if (phase === 'over') {
    const isNewBest = getBest()[diff] == null || score > getBest()[diff]; saveBest(diff, score)
    return (
      <GameLayout title="つぎはどれ？" gradient={GRAD}>
        <ResultScreen score={score} total={TOTAL}
          bestStr={getBest()[diff] != null ? `${getBest()[diff]}/${TOTAL}` : undefined}
          bestLabel={`ベスト（${diff === 'easy' ? 'かんたん' : 'むずかしい'}）`}
          isNewBest={isNewBest}
          onRetry={() => start(diff)} onChangeMode={() => setPhase('select')} accentColor="text-indigo-500" />
      </GameLayout>
    )
  }

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
            {pattern.seq.map((s, i) => (
              <span key={i} className="flex items-center justify-center px-0.5"><Chip id={s} size={38} /></span>
            ))}
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
              className="rounded-2xl border-2 active:scale-95 transition-transform font-bold text-gray-800 disabled:opacity-60 flex items-center justify-center"
              style={{ height: 80, background: '#eef2ff', borderColor: '#a5b4fc', boxShadow: '3px 4px 0 rgba(0,0,0,0.07)' }}
            >
              <Chip id={c} size={44} />
            </button>
          ))}
        </div>
      </div>
    </GameLayout>
  )
}
