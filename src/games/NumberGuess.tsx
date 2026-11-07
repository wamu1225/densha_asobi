import { useState } from 'react'
import { GameLayout } from '../components/GameLayout'
import { Confetti } from '../components/Confetti'

const GRAD = 'linear-gradient(135deg, #38bdf8, #0284c7)'
const BEST_KEY = 'densha_numberguess_best'
function getBest(): number { try { return parseInt(localStorage.getItem(BEST_KEY) || '0') || 0 } catch { return 0 } }
function saveBest(v: number) { if (getBest() === 0 || v < getBest()) localStorage.setItem(BEST_KEY, String(v)) }

type Phase = 'intro' | 'play' | 'over' | 'kid'

// ぎゃくに、こどもが あてる（アプリが かずを かくす）。あてはまらない かずは うすくなり、はんぶんずつ へっていくのが 見える
const KID_RANGES = [30, 100] as const
const kidKey = (max: number) => `densha_numberguess_kid_best_${max}`
function getKidBest(max: number): number { try { return parseInt(localStorage.getItem(kidKey(max)) || '0') || 0 } catch { return 0 } }

function KidGuess({ max, onBack }: { max: number; onBack: () => void }) {
  const [secret, setSecret] = useState(() => 1 + Math.floor(Math.random() * max))
  const [lo, setLo] = useState(1)
  const [hi, setHi] = useState(max)
  const [tries, setTries] = useState(0)
  const [hint, setHint] = useState('')
  const [done, setDone] = useState(false)
  const [best, setBest] = useState(() => getKidBest(max))
  const [newBest, setNewBest] = useState(false)
  const halving = max === 30 ? 5 : 7

  function restart() {
    setSecret(1 + Math.floor(Math.random() * max)); setLo(1); setHi(max); setTries(0); setHint(''); setDone(false); setNewBest(false)
  }
  function tap(n: number) {
    if (done || n < lo || n > hi) return
    const t = tries + 1
    setTries(t)
    if (n === secret) {
      setDone(true); setLo(n); setHi(n); setHint('')
      if (best === 0 || t < best) { try { localStorage.setItem(kidKey(max), String(t)) } catch { /* 保存できなくても遊べる */ } setBest(t); setNewBest(best !== 0) }
      return
    }
    if (n < secret) { setLo(n + 1); setHint(`${n}より おおきいよ`) } else { setHi(n - 1); setHint(`${n}より ちいさいよ`) }
  }

  const cols = max === 30 ? 6 : 10
  return (
    <GameLayout title="かずあて" gradient={GRAD} isPlaying={!done}>
      <Confetti active={done} />
      <div className="flex flex-col items-center gap-3 pt-2">
        <div className="flex items-center gap-2 w-full">
          <span className="px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-sm font-black">1〜{max}</span>
          <span className="text-sm font-bold text-gray-600">{tries}かい</span>
          {best > 0 && <span className="ml-auto text-sm font-bold text-gray-500">さいこう {best}かい</span>}
        </div>
        <p className="text-lg font-black text-center text-sky-800 min-h-[1.75rem]" aria-live="polite">
          {done ? `あたり！ ${secret}だよ` : hint || 'アプリが かくした かずは どれ？'}
        </p>
        <div className="grid gap-1 w-full" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
          {Array.from({ length: max }, (_, k) => k + 1).map((n) => {
            const out = n < lo || n > hi
            const hit = done && n === secret
            return (
              <button key={n} onClick={() => tap(n)} disabled={out || done} aria-label={`${n}`}
                className={`aspect-square rounded-lg font-black ${max === 30 ? 'text-lg' : 'text-[13px]'} ${
                  hit ? 'bg-amber-400 text-white scale-110' : out ? 'bg-gray-100 text-gray-300' : 'bg-white border-2 border-sky-300 text-sky-800 active:scale-90'}`}>
                {n}
              </button>
            )
          })}
        </div>
        {done && (
          <>
            <p className="text-sm font-bold text-gray-600 text-center">
              {tries}かいで あてたよ{newBest ? '（じぶんの さいこう！）' : ''}。まんなかを えらぶと {halving}かい いないで あたるよ
            </p>
            <div className="flex gap-2 w-full">
              <button onClick={onBack} className="flex-1 py-4 text-lg font-black rounded-2xl border-2 border-sky-400 text-sky-700 bg-white active:scale-95">もどる</button>
              <button onClick={restart} className="flex-1 py-4 text-lg font-black text-white rounded-2xl shadow-lg active:scale-95" style={{ background: GRAD }}>もういちど</button>
            </div>
          </>
        )}
      </div>
    </GameLayout>
  )
}

export function NumberGuess() {
  const [phase, setPhase] = useState<Phase>('intro')
  const [low, setLow] = useState(1)
  const [high, setHigh] = useState(100)
  const [tries, setTries] = useState(0)
  const [best, setBest] = useState(getBest)
  const [showConfetti, setShowConfetti] = useState(false)
  // 自分から「◯◯でしょ！」と言い切って終わったか（子がタップした「あたり！」との区別に使う）
  const [declaredSelf, setDeclaredSelf] = useState(false)
  const [kidMax, setKidMax] = useState(30)

  const guess = Math.round((low + high) / 2)

  function start() {
    setLow(1); setHigh(100); setTries(0); setDeclaredSelf(false); setPhase('play')
  }

  function finish(usedTries: number, declared: boolean) {
    setTries(usedTries)
    setDeclaredSelf(declared)
    const isNewBest = best === 0 || usedTries < best
    if (isNewBest) { saveBest(usedTries); setBest(usedTries) }
    setShowConfetti(true)
    setTimeout(() => setShowConfetti(false), 2500)
    setPhase('over')
  }

  function answer(kind: 'bigger' | 'smaller' | 'correct') {
    if (kind === 'correct') {
      finish(tries + 1, false)
      return
    }
    const usedTries = tries + 1
    // 範囲内にクランプ（矛盾した連打でも範囲が壊れない）＝O-3-35差し戻し対応
    const newLow = kind === 'bigger' ? Math.min(guess + 1, high) : low
    const newHigh = kind === 'bigger' ? high : Math.max(guess - 1, low)
    if (newLow >= newHigh) {
      // 候補が1つに絞れた時点で、こちらから「◯◯でしょ！」と言い切って終わる
      setLow(newLow); setHigh(newLow)
      finish(usedTries, true)
      return
    }
    setTries(usedTries)
    setLow(newLow); setHigh(newHigh)
  }

  if (phase === 'intro') return (
    <GameLayout title="かずあて" gradient={GRAD}>
      <div className="flex flex-col items-center gap-4 pt-4">
        <div className="text-6xl">🔮</div>
        <p className="text-xl font-bold text-center text-gray-700">あたまの なかで、1から100までの かずを 1つ きめてね</p>
        <div className="bg-sky-50 border-2 border-sky-200 rounded-2xl p-4 w-full">
          <p className="text-sm font-bold text-sky-700 text-center leading-relaxed">
            おおきいか ちいさいかを こたえると、<span className="font-black">7かい いないで</span> あてるよ！
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
        <p className="text-base font-black text-gray-700 mt-2 self-start">ぎゃくに、きみが あてる</p>
        <div className="grid grid-cols-2 gap-2 w-full">
          {KID_RANGES.map((m) => (
            <button key={m} onClick={() => { setKidMax(m); setPhase('kid') }}
              className="py-4 rounded-2xl border-2 border-sky-400 bg-white text-sky-700 font-black active:scale-95 flex flex-col items-center">
              <span className="text-lg leading-none">1〜{m}</span>
              <span className="text-xs mt-1 leading-none">{getKidBest(m) > 0 ? `さいこう ${getKidBest(m)}かい` : m === 30 ? 'やさしい' : 'むずかしい'}</span>
            </button>
          ))}
        </div>
      </div>
    </GameLayout>
  )

  if (phase === 'kid') return <KidGuess key={kidMax} max={kidMax} onBack={() => setPhase('intro')} />

  if (phase === 'over') return (
    <GameLayout title="かずあて" gradient={GRAD}>
      <div className="flex flex-col items-center gap-4 pt-4">
        <Confetti active={showConfetti} />
        <div className="w-full rounded-2xl px-5 py-4 text-center bounce-in shadow-lg"
          style={{ background: 'linear-gradient(135deg,#38bdf8,#0284c7)' }}>
          {declaredSelf ? (
            <p className="text-2xl font-black text-white">きめた かずは「{guess}」でしょ！</p>
          ) : (
            <p className="text-2xl font-black text-white">
              {tries <= 3 ? 'かんぺき！！' : tries <= 5 ? 'やったね！' : 'あてたよ！'}
            </p>
          )}
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
