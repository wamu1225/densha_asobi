import { useState, useEffect } from 'react'
import { GameLayout } from '../components/GameLayout'

const COLORS = [
  { name: 'あか', bg: 'bg-red-500',    text: '赤いもの' },
  { name: 'あお', bg: 'bg-blue-500',   text: '青いもの' },
  { name: 'きいろ', bg: 'bg-yellow-400', text: '黄色いもの' },
  { name: 'みどり', bg: 'bg-green-500',  text: '緑のもの' },
  { name: 'しろ',   bg: 'bg-gray-100',   text: '白いもの' },
  { name: 'くろ',   bg: 'bg-gray-800',   text: '黒いもの' },
  { name: 'オレンジ', bg: 'bg-orange-400', text: 'オレンジのもの' },
  { name: 'むらさき', bg: 'bg-purple-500', text: '紫のもの' },
]

type Phase = 'play' | 'over'

export function ColorChallenge() {
  const [phase, setPhase] = useState<Phase>('play')
  const [colorIdx, setColorIdx] = useState(0)
  const [count, setCount] = useState(0)
  const [timeLeft, setTimeLeft] = useState(60)
  const [flash, setFlash] = useState(false)

  const color = COLORS[colorIdx]

  useEffect(() => {
    if (phase !== 'play') return
    const t = setInterval(() => {
      setTimeLeft(v => {
        if (v <= 1) { setPhase('over'); return 0 }
        return v - 1
      })
    }, 1000)
    return () => clearInterval(t)
  }, [phase])

  function found() {
    setFlash(true)
    setCount(c => c + 1)
    setTimeout(() => setFlash(false), 200)
    if (Math.random() > 0.4) {
      setColorIdx(Math.floor(Math.random() * COLORS.length))
    }
  }

  function reset() {
    setPhase('play')
    setCount(0)
    setTimeLeft(60)
    setColorIdx(Math.floor(Math.random() * COLORS.length))
  }

  if (phase === 'over') return (
    <GameLayout title="いろさがしチャレンジ" color="bg-pink-400">
      <div className="flex flex-col items-center gap-6 pt-10 bounce-in">
        <p className="text-4xl">🎉</p>
        <p className="text-3xl font-bold text-gray-700">おわり！</p>
        <div className="bg-pink-100 rounded-3xl p-6 text-center">
          <p className="text-lg text-gray-600">みつけた かず</p>
          <p className="text-6xl font-bold text-pink-500 mt-2">{count}<span className="text-2xl">こ</span></p>
        </div>
        <button onClick={reset} className="px-8 py-4 text-xl font-bold bg-pink-400 text-white rounded-2xl shadow active:scale-95">
          もういちど
        </button>
      </div>
    </GameLayout>
  )

  return (
    <GameLayout title="いろさがしチャレンジ" color="bg-pink-400">
      <div className="flex flex-col items-center gap-5">
        <div className="flex justify-between w-full">
          <span className="text-xl font-bold text-gray-700">🎨 {count}こ</span>
          <span className={`text-xl font-bold ${timeLeft <= 15 ? 'text-red-500' : 'text-gray-700'}`}>⏱ {timeLeft}s</span>
        </div>

        <div className="text-center">
          <p className="text-lg text-gray-600 mb-3">まどの そとで さがそう！</p>
          <div className={`w-40 h-40 rounded-full mx-auto border-4 border-gray-300 shadow-xl ${color.bg} ${flash ? 'opacity-60' : 'opacity-100'} transition-opacity`} />
          <p className="text-3xl font-bold text-gray-800 mt-4">{color.name}</p>
          <p className="text-lg text-gray-500">{color.text}</p>
        </div>

        <button
          onClick={found}
          className={`w-full py-8 text-3xl font-bold rounded-3xl shadow-xl active:scale-95 transition-all mt-4 ${flash ? 'bg-green-400 text-white' : 'bg-pink-400 text-white'}`}
        >
          {flash ? '✅ みつけた！' : '👆 みつけた！'}
        </button>

        <button
          onClick={() => setColorIdx(Math.floor(Math.random() * COLORS.length))}
          className="w-full py-3 text-lg font-bold bg-gray-100 text-gray-600 rounded-2xl active:scale-95"
        >
          ほかのいろにする 🔄
        </button>
      </div>
    </GameLayout>
  )
}
