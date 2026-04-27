import { useState, useEffect, useCallback } from 'react'
import { GameLayout } from '../components/GameLayout'

type Mode = 'select' | 'play' | 'over'
type Level = 1 | 2 | 3
type GameMode = 'normal' | 'survival'

const BEST_KEY = 'densha_mathsprint_best'

function getBest(): Record<string, number> {
  try { return JSON.parse(localStorage.getItem(BEST_KEY) || '{}') } catch { return {} }
}
function saveBest(key: string, val: number) {
  const b = getBest()
  if (!b[key] || val > b[key]) { b[key] = val; localStorage.setItem(BEST_KEY, JSON.stringify(b)) }
}

function makeQuestion(level: Level) {
  if (level === 3) {
    const a = Math.floor(Math.random() * 5) + 2
    const b = Math.floor(Math.random() * 9) + 1
    return { a, b, op: '×', answer: a * b }
  }
  const max = level === 1 ? 9 : 19
  const isAdd = Math.random() > 0.5
  let a = Math.floor(Math.random() * max) + 1
  let b = Math.floor(Math.random() * max) + 1
  if (!isAdd && a < b) [a, b] = [b, a]
  return { a, b, op: isAdd ? '+' : '−', answer: isAdd ? a + b : a - b }
}

function makeChoices(answer: number): number[] {
  const set = new Set([answer])
  while (set.size < 4) {
    const d = Math.floor(Math.random() * 6) + 1
    const c = answer + (Math.random() > 0.5 ? d : -d)
    if (c >= 0) set.add(c)
  }
  return [...set].sort(() => Math.random() - 0.5)
}

const LEVEL_LABELS: Record<Level, string> = { 1: '1けた +−', 2: '2けた +−', 3: 'かけざん 2〜6の段' }
const LEVEL_TIME: Record<Level, number> = { 1: 30, 2: 30, 3: 45 }

export function MathSprint() {
  const [mode, setMode] = useState<Mode>('select')
  const [level, setLevel] = useState<Level>(1)
  const [gameMode, setGameMode] = useState<GameMode>('normal')
  const [q, setQ] = useState(makeQuestion(1))
  const [choices, setChoices] = useState<number[]>([])
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [combo, setCombo] = useState(0)
  const [timeLeft, setTimeLeft] = useState(30)
  const [flash, setFlash] = useState<'ok' | 'ng' | null>(null)
  const [comboFlash, setComboFlash] = useState(false)
  const best = getBest()

  const next = useCallback((lv: Level) => {
    const nq = makeQuestion(lv)
    setQ(nq)
    setChoices(makeChoices(nq.answer))
  }, [])

  useEffect(() => { if (mode === 'play') next(level) }, [mode, level, next])

  useEffect(() => {
    if (mode !== 'play') return
    const t = setInterval(() => setTimeLeft(v => { if (v <= 1) { setMode('over'); return 0 } return v - 1 }), 1000)
    return () => clearInterval(t)
  }, [mode])

  function tap(c: number) {
    if (c === q.answer) {
      const newCombo = combo + 1
      setCombo(newCombo)
      const bonus = newCombo >= 5 ? 2 : 1
      setScore(s => s + bonus)
      setFlash('ok')
      if (newCombo > 0 && newCombo % 3 === 0) setComboFlash(true)
    } else {
      setCombo(0)
      setFlash('ng')
      if (gameMode === 'survival') {
        const nl = lives - 1
        setLives(nl)
        if (nl <= 0) { setMode('over'); return }
      }
    }
    setTimeout(() => { setFlash(null); setComboFlash(false); next(level) }, 300)
  }

  function start(lv: Level, gm: GameMode) {
    setLevel(lv); setGameMode(gm)
    setScore(0); setCombo(0); setLives(3)
    setTimeLeft(gm === 'normal' ? LEVEL_TIME[lv] : 999)
    setMode('play')
  }

  if (mode === 'select') {
    // removed unused var
    return (
      <GameLayout title="けいさんスプリント" color="bg-orange-400">
        <div className="flex flex-col gap-4 pt-4">
          <p className="text-center text-xl font-bold text-gray-700">レベルをえらんでね</p>
          {([1, 2, 3] as Level[]).map(lv => (
            <div key={lv} className="bg-white rounded-2xl border-2 border-orange-200 p-4 shadow">
              <p className="font-bold text-gray-700 mb-2">レベル{lv}：{LEVEL_LABELS[lv]}</p>
              {best[`${lv}_normal`] != null && <p className="text-xs text-gray-400 mb-2">🏆 ベスト {best[`${lv}_normal`]}もん</p>}
              <div className="flex gap-2">
                <button onClick={() => start(lv, 'normal')} className="flex-1 py-3 text-base font-bold bg-orange-400 text-white rounded-xl shadow active:scale-95">
                  ふつう ⏱{LEVEL_TIME[lv]}s
                </button>
                <button onClick={() => start(lv, 'survival')} className="flex-1 py-3 text-base font-bold bg-red-500 text-white rounded-xl shadow active:scale-95">
                  サバイバル ❤️❤️❤️
                </button>
              </div>
            </div>
          ))}
        </div>
      </GameLayout>
    )
  }

  if (mode === 'over') {
    const key = `${level}_${gameMode}`
    saveBest(key, score)
    const b = getBest()[key]
    return (
      <GameLayout title="けいさんスプリント" color="bg-orange-400">
        <div className="flex flex-col items-center gap-5 pt-8 bounce-in">
          <p className="text-4xl">{score >= 10 ? '🎉' : '😊'}</p>
          <p className="text-3xl font-bold text-gray-700">おわり！</p>
          <div className="bg-orange-50 border-2 border-orange-200 rounded-3xl p-6 text-center w-full">
            <p className="text-lg text-gray-500">せいかい</p>
            <p className="text-6xl font-bold text-orange-500 mt-1">{score}<span className="text-2xl">もん</span></p>
            {b != null && <p className="text-sm text-gray-400 mt-2">🏆 ベスト {b}もん</p>}
          </div>
          <div className="flex gap-3 w-full">
            <button onClick={() => start(level, gameMode)} className="flex-1 py-4 text-lg font-bold bg-orange-400 text-white rounded-2xl shadow active:scale-95">もういちど</button>
            <button onClick={() => setMode('select')} className="flex-1 py-4 text-lg font-bold bg-gray-200 text-gray-700 rounded-2xl active:scale-95">もどる</button>
          </div>
        </div>
      </GameLayout>
    )
  }

  return (
    <GameLayout title="けいさんスプリント" color="bg-orange-400">
      <div className={`flex flex-col items-center gap-4 rounded-2xl p-2 transition-colors ${flash === 'ok' ? 'bg-green-50' : flash === 'ng' ? 'bg-red-50' : 'bg-transparent'}`}>
        <div className="flex justify-between w-full items-center">
          <span className="text-xl font-bold text-gray-700">⭐ {score}</span>
          {gameMode === 'survival'
            ? <span className="text-xl">{[...Array(lives)].map((_, i) => <span key={i}>❤️</span>)}</span>
            : <span className={`text-xl font-bold ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-gray-700'}`}>⏱ {timeLeft}s</span>
          }
        </div>

        {comboFlash && combo >= 3 && (
          <div className="bg-yellow-100 border-2 border-yellow-400 rounded-xl px-4 py-1 bounce-in">
            <span className="text-xl font-bold text-yellow-600">🔥 {combo}れんぞく！ボーナス！</span>
          </div>
        )}
        {combo >= 3 && !comboFlash && (
          <div className="text-sm text-orange-500 font-bold">🔥 {combo}れんぞく</div>
        )}

        <div className="text-5xl font-bold text-gray-800 py-6 tracking-wide">
          {q.a} {q.op} {q.b} = ?
        </div>

        <div className="grid grid-cols-2 gap-4 w-full">
          {choices.map((c, i) => (
            <button key={i} onClick={() => tap(c)} className="py-6 text-4xl font-bold bg-white rounded-2xl border-2 border-orange-300 shadow active:scale-95">
              {c}
            </button>
          ))}
        </div>
      </div>
    </GameLayout>
  )
}
