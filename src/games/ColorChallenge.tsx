import { useState, useEffect } from 'react'
import { GameLayout } from '../components/GameLayout'

type GameMode = 'select' | 'color' | 'shape' | 'result'

const COLORS = [
  { name: 'あか',     bg: 'bg-red-500',    border: 'border-red-400',    label: '赤いもの' },
  { name: 'あお',     bg: 'bg-blue-500',   border: 'border-blue-400',   label: '青いもの' },
  { name: 'きいろ',   bg: 'bg-yellow-400', border: 'border-yellow-400', label: '黄色いもの' },
  { name: 'みどり',   bg: 'bg-green-500',  border: 'border-green-400',  label: '緑のもの' },
  { name: 'しろ',     bg: 'bg-gray-100',   border: 'border-gray-300',   label: '白いもの' },
  { name: 'くろ',     bg: 'bg-gray-800',   border: 'border-gray-700',   label: '黒いもの' },
  { name: 'オレンジ', bg: 'bg-orange-400', border: 'border-orange-400', label: 'オレンジのもの' },
  { name: 'むらさき', bg: 'bg-purple-500', border: 'border-purple-400', label: '紫のもの' },
  { name: 'ピンク',   bg: 'bg-pink-400',   border: 'border-pink-400',   label: 'ピンクのもの' },
  { name: 'みずいろ', bg: 'bg-sky-400',    border: 'border-sky-400',    label: '水色のもの' },
]

const SHAPES = [
  { name: 'まる',       emoji: '⭕', label: '丸いもの' },
  { name: 'さんかく',   emoji: '🔺', label: '三角のもの' },
  { name: 'しかく',     emoji: '🟥', label: '四角いもの' },
  { name: 'ながいもの', emoji: '📏', label: '長いもの' },
  { name: 'ちいさいもの', emoji: '🔬', label: '小さいもの' },
  { name: 'おおきいもの', emoji: '🔭', label: '大きいもの' },
]

const BEST_KEY = 'densha_color_best'
function getBest(): Record<string, number> {
  try { return JSON.parse(localStorage.getItem(BEST_KEY) || '{}') } catch { return {} }
}
function saveBest(key: string, val: number) {
  const b = getBest(); if (!b[key] || val > b[key]) { b[key] = val; localStorage.setItem(BEST_KEY, JSON.stringify(b)) }
}

export function ColorChallenge() {
  const [mode, setMode] = useState<GameMode>('select')
  const [timeLimit, setTimeLimit] = useState(60)
  const [itemIdx, setItemIdx] = useState(0)
  const [count, setCount] = useState(0)
  const [streak, setStreak] = useState(0)
  const [maxStreak, setMaxStreak] = useState(0)
  const [timeLeft, setTimeLeft] = useState(60)
  const [flash, setFlash] = useState(false)
  const [modeKey, setModeKey] = useState<string>('color')
  const best = getBest()

  useEffect(() => {
    if (mode !== 'color' && mode !== 'shape') return
    const t = setInterval(() => setTimeLeft(v => { if (v <= 1) { setMode('result'); return 0 } return v - 1 }), 1000)
    return () => clearInterval(t)
  }, [mode])

  function startColor(sec: number) {
    const key = `color_${sec}`
    setModeKey(key); setTimeLimit(sec); setTimeLeft(sec)
    setItemIdx(Math.floor(Math.random() * COLORS.length))
    setCount(0); setStreak(0); setMaxStreak(0); setMode('color')
  }

  function startShape(sec: number) {
    const key = `shape_${sec}`
    setModeKey(key); setTimeLimit(sec); setTimeLeft(sec)
    setItemIdx(Math.floor(Math.random() * SHAPES.length))
    setCount(0); setStreak(0); setMaxStreak(0); setMode('shape')
  }

  function found() {
    setFlash(true)
    const ns = streak + 1
    setStreak(ns); setMaxStreak(m => Math.max(m, ns))
    setCount(c => c + 1)
    setTimeout(() => setFlash(false), 200)
    if (Math.random() > 0.35) {
      const pool = mode === 'color' ? COLORS : SHAPES
      setItemIdx(Math.floor(Math.random() * pool.length))
    }
  }

  function changeItem() {
    const pool = mode === 'color' ? COLORS : SHAPES
    setItemIdx(Math.floor(Math.random() * pool.length))
    setStreak(0)
  }

  if (mode === 'result') {
    saveBest(modeKey, count)
    const b = getBest()[modeKey]
    return (
      <GameLayout title="いろさがしチャレンジ" color="bg-pink-400">
        <div className="flex flex-col items-center gap-5 pt-8 bounce-in">
          <p className="text-4xl">{count >= 20 ? '🎉' : count >= 10 ? '😊' : '💪'}</p>
          <p className="text-3xl font-bold text-gray-700">おわり！</p>
          <div className="bg-pink-50 border-2 border-pink-200 rounded-3xl p-6 text-center w-full">
            <p className="text-lg text-gray-500">みつけた かず</p>
            <p className="text-6xl font-bold text-pink-500 mt-1">{count}<span className="text-2xl">こ</span></p>
            <p className="text-sm text-gray-500 mt-2">さいこうれんぞく {maxStreak}かい 🔥</p>
            {b != null && <p className="text-sm text-gray-400 mt-1">🏆 ベスト {b}こ</p>}
          </div>
          <div className="flex gap-3 w-full">
            <button onClick={() => modeKey.startsWith('color') ? startColor(timeLimit) : startShape(timeLimit)} className="flex-1 py-4 text-lg font-bold bg-pink-400 text-white rounded-2xl shadow active:scale-95">もういちど</button>
            <button onClick={() => setMode('select')} className="flex-1 py-4 text-lg font-bold bg-gray-200 text-gray-700 rounded-2xl active:scale-95">もどる</button>
          </div>
        </div>
      </GameLayout>
    )
  }

  if (mode === 'select') return (
    <GameLayout title="いろさがしチャレンジ" color="bg-pink-400">
      <div className="flex flex-col gap-4 pt-4">
        <p className="text-center text-xl font-bold text-gray-700">モードをえらんでね</p>
        <div className="bg-white rounded-2xl border-2 border-pink-200 p-4 shadow">
          <p className="font-bold text-gray-700 mb-1">🎨 いろさがし</p>
          <p className="text-sm text-gray-500 mb-3">まどのそとでその色のものをみつけよう</p>
          <div className="flex gap-2">
            {[60, 90].map(s => (
              <button key={s} onClick={() => startColor(s)} className="flex-1 py-3 text-base font-bold bg-pink-400 text-white rounded-xl active:scale-95">
                ⏱ {s}びょう {best[`color_${s}`] != null ? `🏆${best[`color_${s}`]}` : ''}
              </button>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-2xl border-2 border-pink-200 p-4 shadow">
          <p className="font-bold text-gray-700 mb-1">🔺 かたちさがし</p>
          <p className="text-sm text-gray-500 mb-3">まるいもの・しかくいものをさがそう</p>
          <div className="flex gap-2">
            {[60, 90].map(s => (
              <button key={s} onClick={() => startShape(s)} className="flex-1 py-3 text-base font-bold bg-purple-400 text-white rounded-xl active:scale-95">
                ⏱ {s}びょう {best[`shape_${s}`] != null ? `🏆${best[`shape_${s}`]}` : ''}
              </button>
            ))}
          </div>
        </div>
      </div>
    </GameLayout>
  )

  const colorItem = mode === 'color' ? COLORS[itemIdx] : null
  const shapeItem = mode === 'shape' ? SHAPES[itemIdx] : null

  return (
    <GameLayout title="いろさがしチャレンジ" color="bg-pink-400">
      <div className="flex flex-col items-center gap-4">
        <div className="flex justify-between w-full">
          <span className="text-xl font-bold text-gray-700">🎨 {count}こ</span>
          <span className={`text-xl font-bold ${timeLeft <= 15 ? 'text-red-500 animate-pulse' : 'text-gray-700'}`}>⏱ {timeLeft}s</span>
        </div>

        {streak >= 5 && (
          <div className="bg-orange-100 border-2 border-orange-300 rounded-xl px-4 py-1 bounce-in">
            <span className="text-lg font-bold text-orange-600">🔥 {streak}れんぞく！すごい！</span>
          </div>
        )}

        <div className="text-center mt-2">
          <p className="text-lg text-gray-600 mb-3">まどのそとでさがそう！</p>
          {colorItem && (
            <>
              <div className={`w-36 h-36 rounded-full mx-auto border-4 ${colorItem.border} shadow-xl ${colorItem.bg} transition-opacity ${flash ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}`} style={{ transition: 'all 0.15s' }} />
              <p className="text-4xl font-bold text-gray-800 mt-4">{colorItem.name}</p>
              <p className="text-lg text-gray-500">{colorItem.label}</p>
            </>
          )}
          {shapeItem && (
            <>
              <div className={`text-8xl mx-auto transition-all ${flash ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}`} style={{ transition: 'all 0.15s' }}>{shapeItem.emoji}</div>
              <p className="text-4xl font-bold text-gray-800 mt-2">{shapeItem.name}</p>
              <p className="text-lg text-gray-500">{shapeItem.label}</p>
            </>
          )}
        </div>

        <button onClick={found}
          className={`w-full py-8 text-3xl font-bold rounded-3xl shadow-xl active:scale-95 transition-all mt-2 ${flash ? 'bg-green-400 text-white scale-95' : 'bg-pink-400 text-white'}`}>
          {flash ? '✅ みつけた！' : '👆 みつけた！'}
        </button>

        <button onClick={changeItem} className="w-full py-3 text-base font-bold bg-gray-100 text-gray-600 rounded-2xl active:scale-95">
          ほかのものにする 🔄
        </button>
      </div>
    </GameLayout>
  )
}
