import { useState, useEffect, useCallback } from 'react'
import { GameLayout } from '../components/GameLayout'
import { ResultScreen } from '../components/ResultScreen'

type Mode = 'select' | 'play' | 'over'
type Level = 1 | 2 | 3
type GameMode = 'normal' | 'survival'

const GRAD = 'linear-gradient(135deg, #ff9a5c, #f97316)'
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

// choices・問題を同時に生成してinitial空ボタン問題を解消
function makeQAndChoices(level: Level) {
  const q = makeQuestion(level)
  return { q, choices: makeChoices(q.answer) }
}

const LEVEL_LABELS: Record<Level, string> = { 1: '1けた +−', 2: '2けた +−', 3: 'かけざん 2〜6の段' }
const LEVEL_TIME: Record<Level, number> = { 1: 30, 2: 30, 3: 45 }

export function MathSprint() {
  const [mode, setMode] = useState<Mode>('select')
  const [level, setLevel] = useState<Level>(1)
  const [gameMode, setGameMode] = useState<GameMode>('normal')
  // ①修正: choices と q を同時初期化して空ボタンを防ぐ
  const [{ q, choices }, setQC] = useState(() => makeQAndChoices(1))
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [combo, setCombo] = useState(0)
  const [timeLeft, setTimeLeft] = useState(30)
  const [flash, setFlash] = useState<'ok' | 'ng' | null>(null)
  const [comboFlash, setComboFlash] = useState(false)
  // ③修正: ダブルタップ防止ロック
  const [locked, setLocked] = useState(false)

  const next = useCallback((lv: Level) => {
    setQC(makeQAndChoices(lv))
  }, [])

  useEffect(() => { if (mode === 'play') next(level) }, [mode, level, next])

  useEffect(() => {
    if (mode !== 'play' || gameMode === 'survival') return
    const t = setInterval(() => setTimeLeft(v => { if (v <= 1) { setMode('over'); return 0 } return v - 1 }), 1000)
    return () => clearInterval(t)
  }, [mode, gameMode])

  function tap(c: number) {
    if (locked) return  // ③ダブルタップ防止
    setLocked(true)
    if (c === q.answer) {
      const nc = combo + 1; setCombo(nc)
      setScore(s => s + (nc >= 5 ? 2 : 1)); setFlash('ok')
      if (nc > 0 && nc % 3 === 0) setComboFlash(true)
    } else {
      setCombo(0); setFlash('ng')
      if (gameMode === 'survival') {
        const nl = lives - 1; setLives(nl)
        if (nl <= 0) { setMode('over'); return }
      }
    }
    setTimeout(() => { setFlash(null); setComboFlash(false); setLocked(false); next(level) }, 350)
  }

  function start(lv: Level, gm: GameMode) {
    setLevel(lv); setGameMode(gm); setScore(0); setCombo(0); setLives(3); setLocked(false)
    setTimeLeft(gm === 'normal' ? LEVEL_TIME[lv] : 999); setMode('play')
  }

  const best = getBest()

  if (mode === 'select') return (
    <GameLayout title="けいさんスプリント" gradient={GRAD}>
      <div className="flex flex-col gap-4 pt-4">
        <p className="text-center text-xl font-bold text-gray-700">レベルをえらんでね</p>
        {([1, 2, 3] as Level[]).map(lv => (
          <div key={lv} className="bg-white rounded-2xl border border-orange-100 p-4 shadow-md">
            <p className="font-bold text-gray-700 mb-2">レベル{lv}：{LEVEL_LABELS[lv]}</p>
            <div className="flex gap-2 text-xs text-gray-400 mb-2">
              {/* ②修正: normalとsurvival両方のbestを表示 */}
              {best[`${lv}_normal`] != null && <span>🏆 ふつう {best[`${lv}_normal`]}もん</span>}
              {best[`${lv}_survival`] != null && <span>❤️ サバイバル {best[`${lv}_survival`]}もん</span>}
            </div>
            <div className="flex gap-2">
              <button onClick={() => start(lv, 'normal')} className="flex-1 py-3 text-base font-bold text-white rounded-xl shadow active:scale-95" style={{ background: GRAD }}>
                ふつう ⏱{LEVEL_TIME[lv]}s
              </button>
              <button onClick={() => start(lv, 'survival')} className="flex-1 py-3 text-base font-bold bg-red-500 text-white rounded-xl shadow active:scale-95">
                サバイバル ❤️
              </button>
            </div>
          </div>
        ))}
      </div>
    </GameLayout>
  )

  if (mode === 'over') {
    const key = `${level}_${gameMode}`; saveBest(key, score)
    return (
      <GameLayout title="けいさんスプリント" gradient={GRAD}>
        <ResultScreen score={score} best={getBest()[key]} bestLabel={`ベスト（レベル${level} ${gameMode === 'survival' ? 'サバイバル' : 'ふつう'}）`} onRetry={() => start(level, gameMode)} accentColor="text-orange-500" />
      </GameLayout>
    )
  }

  return (
    <GameLayout title="けいさんスプリント" gradient={GRAD}>
      <div className="flex flex-col items-center gap-4">
        <div className="flex justify-between w-full items-center">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-gray-700">⭐ {score}</span>
            {combo >= 3 && <span className="text-sm font-bold text-orange-500 bg-orange-100 px-2 py-0.5 rounded-full">🔥 {combo}連続！</span>}
          </div>
          {gameMode === 'survival'
            ? <span className="text-xl">{[...Array(lives)].map((_, i) => <span key={i}>❤️</span>)}</span>
            : <span className={`text-xl font-bold ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-gray-700'}`}>⏱ {timeLeft}s</span>
          }
        </div>
        {flash === 'ok' && <div className="w-full bg-green-100 border-2 border-green-400 rounded-2xl py-2 text-center bounce-in"><span className="text-xl font-black text-green-600">⭕ せいかい！</span></div>}
        {flash === 'ng' && <div className="w-full bg-red-100 border-2 border-red-400 rounded-2xl py-2 text-center bounce-in"><span className="text-xl font-black text-red-600">❌ ちがう！</span></div>}
        {comboFlash && <div className="bg-yellow-100 border-2 border-yellow-300 rounded-2xl px-5 py-2 bounce-in"><span className="text-xl font-bold text-yellow-700">🔥 {combo}れんぞく！ボーナス！</span></div>}
        <div className="text-5xl font-black text-gray-800 py-6 tracking-wide">
          {q.a} {q.op} {q.b} = ?
        </div>
        <div className="grid grid-cols-2 gap-3 w-full">
          {choices.map((c, i) => (
            <button
              key={i}
              onClick={() => tap(c)}
              disabled={locked}
              className="bg-white rounded-2xl border-2 border-orange-200 shadow-md active:scale-95 transition-transform disabled:opacity-60"
              style={{ height: 80, fontSize: 36, fontWeight: 800 }}
            >
              {c}
            </button>
          ))}
        </div>
      </div>
    </GameLayout>
  )
}
