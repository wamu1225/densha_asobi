import { useState } from 'react'
import { GameLayout } from '../components/GameLayout'
import { Confetti } from '../components/Confetti'

const GRAD = 'linear-gradient(135deg, #38bdf8, #0284c7)'
const BEST_KEY = 'densha_numberguess_best'
function getBest(): number { try { return parseInt(localStorage.getItem(BEST_KEY) || '0') || 0 } catch { return 0 } }
function saveBest(v: number) { if (getBest() === 0 || v < getBest()) localStorage.setItem(BEST_KEY, String(v)) }

type Phase = 'intro' | 'play' | 'over'

export function NumberGuess() {
  const [phase, setPhase] = useState<Phase>('intro')
  const [low, setLow] = useState(1)
  const [high, setHigh] = useState(100)
  const [tries, setTries] = useState(0)
  const [best, setBest] = useState(getBest)
  const [showConfetti, setShowConfetti] = useState(false)

  const guess = Math.round((low + high) / 2)

  function start() {
    setLow(1); setHigh(100); setTries(0); setPhase('play')
  }

  function answer(kind: 'bigger' | 'smaller' | 'correct') {
    if (kind === 'correct') {
      const usedTries = tries + 1
      setTries(usedTries)
      const isNewBest = best === 0 || usedTries < best
      if (isNewBest) { saveBest(usedTries); setBest(usedTries) }
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 2500)
      setPhase('over')
      return
    }
    setTries((t) => t + 1)
    if (kind === 'bigger') setLow(guess + 1)
    else setHigh(guess - 1)
  }

  if (phase === 'intro') return (
    <GameLayout title="かずあて" gradient={GRAD}>
      <div className="flex flex-col items-center gap-4 pt-4">
        <div className="text-6xl">🔮</div>
        <p className="text-xl font-bold text-center text-gray-700">あたまの なかで、1から100までの かずを 1つ きめてね</p>
        <div className="bg-sky-50 border-2 border-sky-200 rounded-2xl p-4 w-full">
          <p className="text-sm font-bold text-sky-700 text-center leading-relaxed">
            くちに ださなくて いいよ。きめたら「はじめる」を おしてね。<br />
            でてくる かずが、きめた かずより おおきいか ちいさいかを こたえていくと、
            <span className="font-black">7かい いないで</span> かならず あてるよ！
          </p>
        </div>
        <button onClick={start}
          className="w-full py-5 text-xl font-black text-white rounded-2xl shadow-lg active:scale-95"
          style={{ background: GRAD }}>
          はじめる
        </button>
        {best > 0 && (
          <p className="text-sm font-bold px-4 py-1 rounded-full bg-sky-100 text-sky-700">
            じぶんの さいこう：{best}かい で あてた
          </p>
        )}
      </div>
    </GameLayout>
  )

  if (phase === 'over') return (
    <GameLayout title="かずあて" gradient={GRAD}>
      <div className="flex flex-col items-center gap-4 pt-4">
        <Confetti active={showConfetti} />
        <div className="w-full rounded-2xl px-5 py-4 text-center bounce-in shadow-lg"
          style={{ background: 'linear-gradient(135deg,#38bdf8,#0284c7)' }}>
          <p className="text-2xl font-black text-white">
            {tries <= 3 ? 'かんぺき！！' : tries <= 5 ? 'やったね！' : 'あてたよ！'}
          </p>
          <p className="text-sm font-bold text-white/90 mt-1">{tries}かいで あてたよ</p>
        </div>
        {best > 0 && (
          <p className="text-sm font-bold px-4 py-1 rounded-full bg-sky-100 text-sky-700">
            じぶんの さいこう：{best}かい
          </p>
        )}
        <button onClick={start}
          className="w-full py-5 text-xl font-black text-white rounded-2xl shadow-lg active:scale-95"
          style={{ background: GRAD }}>
          もういちど
        </button>
      </div>
    </GameLayout>
  )

  return (
    <GameLayout title="かずあて" gradient={GRAD} isPlaying>
      <div className="flex flex-col items-center gap-5 pt-4">
        <p className="text-sm font-bold text-gray-500">{tries + 1}かいめ</p>
        <div className="text-8xl font-black text-sky-600">{guess}</div>
        <p className="text-lg font-bold text-center text-gray-700">
          きめた かずと くらべて、この かずは？
        </p>
        <div className="flex flex-col gap-2 w-full">
          <button onClick={() => answer('bigger')}
            className="w-full py-4 text-lg font-black text-white rounded-2xl shadow-lg active:scale-95"
            style={{ background: '#0284c7' }}>
            きめた かずの ほうが おおきい
          </button>
          <button onClick={() => answer('smaller')}
            className="w-full py-4 text-lg font-black text-white rounded-2xl shadow-lg active:scale-95"
            style={{ background: '#0369a1' }}>
            きめた かずの ほうが ちいさい
          </button>
          <button onClick={() => answer('correct')}
            className="w-full py-4 text-lg font-black text-white rounded-2xl shadow-lg active:scale-95"
            style={{ background: '#f59e0b' }}>
            あたり！
          </button>
        </div>
      </div>
    </GameLayout>
  )
}
