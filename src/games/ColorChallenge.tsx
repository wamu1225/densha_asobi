import { useState, useEffect } from 'react'
import { GameLayout } from '../components/GameLayout'
import { ResultScreen } from '../components/ResultScreen'

const GRAD = 'linear-gradient(135deg, #f472b6, #ec4899)'
type GameMode = 'select' | 'play' | 'result'

const COLORS = [
  { name: 'あか', bg: '#ef4444', label: '赤いもの' },
  { name: 'あお', bg: '#3b82f6', label: '青いもの' },
  { name: 'きいろ', bg: '#eab308', label: '黄色いもの' },
  { name: 'みどり', bg: '#22c55e', label: '緑のもの' },
  { name: 'しろ', bg: '#f1f5f9', label: '白いもの', border: '#cbd5e1' },
  { name: 'くろ', bg: '#1e293b', label: '黒いもの' },
  { name: 'オレンジ', bg: '#f97316', label: 'オレンジのもの' },
  { name: 'むらさき', bg: '#a855f7', label: '紫のもの' },
  { name: 'ピンク', bg: '#ec4899', label: 'ピンクのもの' },
  { name: 'みずいろ', bg: '#0ea5e9', label: '水色のもの' },
]
const SHAPES = [
  { name: 'まるいもの', emoji: '⭕', label: '丸い形' },
  { name: 'しかくいもの', emoji: '🟥', label: '四角い形' },
  { name: 'さんかくのもの', emoji: '🔺', label: '三角の形' },
  { name: 'ながいもの', emoji: '📏', label: '細長いもの' },
  { name: 'ちいさいもの', emoji: '🔬', label: '小さいもの' },
  { name: 'おおきいもの', emoji: '🏟️', label: '大きいもの' },
]

const BEST_KEY = 'densha_color_best'
function getBest(): Record<string, number> { try { return JSON.parse(localStorage.getItem(BEST_KEY) || '{}') } catch { return {} } }
function saveBest(key: string, val: number) { const b = getBest(); if (!b[key] || val > b[key]) { b[key] = val; localStorage.setItem(BEST_KEY, JSON.stringify(b)) } }

export function ColorChallenge() {
  const [mode, setMode] = useState<GameMode>('select')
  const [isShape, setIsShape] = useState(false)
  const [timeLimit, setTimeLimit] = useState(60)
  const [itemIdx, setItemIdx] = useState(0)
  const [count, setCount] = useState(0)
  const [streak, setStreak] = useState(0)
  const [maxStreak, setMaxStreak] = useState(0)
  const [timeLeft, setTimeLeft] = useState(60)
  const [flash, setFlash] = useState(false)
  const [modeKey, setModeKey] = useState('color_60')
  // ⑫修正: 連打防止 (300ms cooldown)
  const [findCooldown, setFindCooldown] = useState(false)

  useEffect(() => {
    if (mode !== 'play') return
    const t = setInterval(() => setTimeLeft(v => { if (v <= 1) { setMode('result'); return 0 } return v - 1 }), 1000)
    return () => clearInterval(t)
  }, [mode])

  function startMode(shape: boolean, sec: number) {
    const key = `${shape ? 'shape' : 'color'}_${sec}`
    setIsShape(shape); setTimeLimit(sec); setTimeLeft(sec); setModeKey(key)
    setItemIdx(Math.floor(Math.random() * (shape ? SHAPES : COLORS).length))
    setCount(0); setStreak(0); setMaxStreak(0); setMode('play')
  }

  function found() {
    if (findCooldown) return  // ⑫連打防止
    setFindCooldown(true)
    setTimeout(() => setFindCooldown(false), 300)
    setFlash(true)
    const ns = streak + 1; setStreak(ns); setMaxStreak(m => Math.max(m, ns)); setCount(c => c + 1)
    setTimeout(() => setFlash(false), 200)
    if (Math.random() > 0.35) setItemIdx(Math.floor(Math.random() * (isShape ? SHAPES : COLORS).length))
  }

  // ストリークはリセットしない（変更はペナルティではない）
  function changeItem() { setItemIdx(Math.floor(Math.random() * (isShape ? SHAPES : COLORS).length)) }

  const best = getBest()

  if (mode === 'result') {
    saveBest(modeKey, count)
    return (
      <GameLayout title="いろさがしチャレンジ" gradient={GRAD}>
        <ResultScreen score={count} extra={[{ label: 'さいこうれんぞく', value: `${maxStreak}かい 🔥` }]} best={getBest()[modeKey]} onRetry={() => startMode(isShape, timeLimit)} accentColor="text-pink-500" />
      </GameLayout>
    )
  }

  if (mode === 'select') return (
    <GameLayout title="いろさがしチャレンジ" gradient={GRAD}>
      <div className="flex flex-col gap-4 pt-4">
        <p className="text-center text-xl font-bold text-gray-700">モードをえらんでね</p>
        {[{ shape: false, label: '🎨 いろさがし', desc: 'そのいろのものをまどのそとでさがそう' },
          { shape: true,  label: '🔺 かたちさがし', desc: 'そのかたちのものをそとでさがそう' }
        ].map(o => (
          <div key={String(o.shape)} className="bg-white rounded-2xl border border-pink-100 p-4 shadow-md">
            <p className="font-bold text-gray-700 mb-1">{o.label}</p>
            <p className="text-sm text-gray-500 mb-3">{o.desc}</p>
            <div className="flex gap-2">
              {[60, 90].map(s => (
                <button key={s} onClick={() => startMode(o.shape, s)} className="flex-1 py-3 text-base font-bold text-white rounded-xl shadow active:scale-95" style={{ background: GRAD }}>
                  ⏱{s}びょう{best[`${o.shape ? 'shape' : 'color'}_${s}`] != null ? ` 🏆${best[`${o.shape ? 'shape' : 'color'}_${s}`]}` : ''}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </GameLayout>
  )

  const colorItem = !isShape ? COLORS[itemIdx] : null
  const shapeItem = isShape ? SHAPES[itemIdx] : null

  return (
    <GameLayout title="いろさがしチャレンジ" gradient={GRAD}>
      <div className="flex flex-col items-center gap-4">
        <div className="flex justify-between w-full">
          <span className="text-xl font-bold text-gray-700">🎨 {count}こ</span>
          <span className={`text-xl font-bold ${timeLeft <= 15 ? 'text-red-500 animate-pulse' : 'text-gray-700'}`}>⏱ {timeLeft}s</span>
        </div>
        {streak >= 5 && <div className="bg-orange-100 border-2 border-orange-300 rounded-full px-5 py-1 bounce-in"><span className="font-bold text-orange-600">🔥 {streak}れんぞく！すごい！</span></div>}

        <div className="text-center mt-2">
          <p className="text-lg text-gray-600 mb-3">まどのそとでさがそう！</p>
          {colorItem && (
            <>
              <div className="w-36 h-36 rounded-full mx-auto shadow-xl transition-all" style={{ background: colorItem.bg, border: colorItem.border ? `3px solid ${colorItem.border}` : undefined, opacity: flash ? 0.5 : 1, transform: flash ? 'scale(0.93)' : 'scale(1)' }} />
              <p className="text-4xl font-black text-gray-800 mt-4">{colorItem.name}</p>
              <p className="text-base text-gray-500">{colorItem.label}</p>
            </>
          )}
          {shapeItem && (
            <>
              <div className="text-8xl mx-auto transition-all" style={{ opacity: flash ? 0.5 : 1, transform: flash ? 'scale(0.93)' : 'scale(1)' }}>{shapeItem.emoji}</div>
              <p className="text-4xl font-black text-gray-800 mt-2">{shapeItem.name}</p>
              <p className="text-base text-gray-500">{shapeItem.label}</p>
            </>
          )}
        </div>

        <button onClick={found} className="w-full text-3xl font-black text-white rounded-3xl shadow-xl active:scale-95 transition-all mt-2" style={{ background: flash ? '#22c55e' : 'linear-gradient(135deg,#f472b6,#ec4899)', height: 80 }}>
          {flash ? '✅ みつけた！' : '👆 みつけた！'}
        </button>
        <button onClick={changeItem} className="w-full py-3 text-base font-bold bg-white text-gray-600 rounded-2xl shadow active:scale-95 border border-gray-200">
          ほかのものにする 🔄
        </button>
      </div>
    </GameLayout>
  )
}
