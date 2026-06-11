import { useState, useEffect } from 'react'
import { GameLayout } from '../components/GameLayout'
import { ResultScreen } from '../components/ResultScreen'

const GRAD = 'linear-gradient(135deg, #7c3aed, #5b21b6)'
const BEST_KEY = 'densha_simon_best'
function getBest(): number { try { return parseInt(localStorage.getItem(BEST_KEY) ?? '0') } catch { return 0 } }
function saveBest(v: number) { if (v > getBest()) localStorage.setItem(BEST_KEY, String(v)) }

// ── 4色パネルの定義 ──────────────────────────────────────
// dark: 消灯時の暗い色  bright: 点灯時の明るい色  glow: 光のにじみ色
const PANELS = [
  { id: 0, label: 'あか',   emoji: '🍎', dark: '#7F1D1D', bright: '#FF3B30', glow: '#FF3B30' },
  { id: 1, label: 'あお',   emoji: '💎', dark: '#1E3A8A', bright: '#007AFF', glow: '#60A5FA' },
  { id: 2, label: 'きいろ', emoji: '⭐', dark: '#78350F', bright: '#FFD60A', glow: '#FDE68A' },
  { id: 3, label: 'みどり', emoji: '🌿', dark: '#14532D', bright: '#30D158', glow: '#86EFAC' },
]

// ラウンドが上がるほど自動的にスピードアップ
function getTiming(round: number): { flash: number; gap: number; label: string } {
  if (round <= 3)  return { flash: 800, gap: 280, label: '🐢 ゆっくり' }
  if (round <= 6)  return { flash: 620, gap: 230, label: '🐇 ふつう' }
  if (round <= 10) return { flash: 470, gap: 180, label: 'はやい' }
  if (round <= 15) return { flash: 360, gap: 150, label: 'とてもはやい' }
  return                  { flash: 280, gap: 120, label: '💥 むずかしい！！' }
}

function delay(ms: number) { return new Promise<void>(r => setTimeout(r, ms)) }

// 直前と同じ色が連続しないようランダムに1色選ぶ
function pick(last: number): number {
  let n: number
  do { n = Math.floor(Math.random() * 4) } while (n === last)
  return n
}

type Phase = 'select' | 'showing' | 'input' | 'correct' | 'wrong' | 'over'

export function Simon() {
  const [phase, setPhase]     = useState<Phase>('select')
  const [sequence, setSeq]    = useState<number[]>([])
  const [lit, setLit]         = useState<number | null>(null)
  const [inputIdx, setInput]  = useState(0)
  const [round, setRound]     = useState(1)
  const [wrongId, setWrongId] = useState<number | null>(null)
  const [correctHintId, setCorrectHintId] = useState<number | null>(null)
  const [showSeqHint, setShowSeqHint] = useState(false)
  // ユーザーがタップしたときの視覚フィードバック用（showing の lit とは別）
  const [tapLit, setTapLit] = useState<number | null>(null)
  const [showingStep, setShowingStep] = useState(0)

  // ── シーケンス表示 (showing フェーズ) ──────────────────
  useEffect(() => {
    if (phase !== 'showing') return
    let alive = true

    async function run() {
      setShowSeqHint(false)
      setShowingStep(0)
      await delay(500)
      const { flash, gap } = getTiming(round)
      for (let i = 0; i < sequence.length; i++) {
        if (!alive) return
        setShowingStep(i + 1)
        setLit(sequence[i])
        await delay(flash)
        if (!alive) return
        setLit(null)
        await delay(gap)
      }
      if (alive) {
        setInput(0)
        setPhase('input')
        setShowSeqHint(true)
      }
    }
    run()
    return () => { alive = false }
  }, [phase, sequence, round])

  // ── 正解アニメーション ──────────────────────────────────
  useEffect(() => {
    if (phase !== 'correct') return
    const t = setTimeout(() => {
      const last = sequence[sequence.length - 1]
      const newSeq = [...sequence, pick(last)]
      setSeq(newSeq)
      setRound(r => r + 1)
      setPhase('showing')
    }, 700)
    return () => clearTimeout(t)
  }, [phase, sequence])

  // ── ミスアニメーション ──────────────────────────────────
  useEffect(() => {
    if (phase !== 'wrong') return
    const t = setTimeout(() => {
      setWrongId(null)
      setPhase('over')
    }, 900)
    return () => clearTimeout(t)
  }, [phase])

  function startGame() {
    const first = Math.floor(Math.random() * 4)
    setSeq([first]); setRound(1); setInput(0)
    setLit(null); setWrongId(null); setTapLit(null); setPhase('showing')
  }

  function tap(id: number) {
    if (phase !== 'input') return

    // タップ直後にパネルを光らせる（220ms）
    setTapLit(id)
    setTimeout(() => setTapLit(null), 220)

    if (id === sequence[inputIdx]) {
      if (inputIdx + 1 === sequence.length) {
        // 最後の正解 — 少し余裕を持たせてから correct へ
        setTimeout(() => setPhase('correct'), 120)
      } else {
        setInput(i => i + 1)
      }
    } else {
      setWrongId(id)
      setCorrectHintId(sequence[inputIdx])  // 正解のパネルを緑で表示
      saveBest(round - 1)
      setTimeout(() => { setPhase('wrong'); setCorrectHintId(null) }, 900)
    }
  }

  // ── 結果画面 ────────────────────────────────────────────
  if (phase === 'over') {
    const best = getBest()
    return (
      <GameLayout title="いろきおく" gradient={GRAD}>
        <ResultScreen
          score={round - 1}
          scoreLabel="クリアしたラウンド"
          scoreSuffix="ラウンド"
          bestStr={best > 0 ? `${best}ラウンド` : undefined}
          bestLabel="ベスト"
          onRetry={startGame}
          onChangeMode={() => setPhase('select')}
          accentColor="text-purple-600"
        />
      </GameLayout>
    )
  }

  // ── 選択画面 ────────────────────────────────────────────
  if (phase === 'select') {
    const best = getBest()
    return (
      <GameLayout title="いろきおく" gradient={GRAD}>
        <div className="flex flex-col items-center gap-5 pt-6">
          <p className="text-lg font-bold text-center" style={{ color: 'var(--ink)' }}>
            いろが ひかる！<br/>おなじ じゅんばんで タップ！
          </p>
          {best > 0 && (
            <p className="text-sm font-bold px-4 py-1 rounded-full bg-purple-100 text-purple-700">
              ベスト {best} ラウンド
            </p>
          )}

          {/* プレビューパネル */}
          <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
            {PANELS.map(p => (
              <div key={p.id} className="aspect-square rounded-2xl flex flex-col items-center justify-center gap-2"
                style={{ background: p.dark }}>
                <span style={{ fontSize: 40 }}>{p.emoji}</span>
                <span className="text-sm font-black text-white/50">{p.label}</span>
              </div>
            ))}
          </div>

          <button onClick={startGame}
            className="px-12 py-5 text-2xl font-black text-white rounded-2xl active:scale-95 transition-transform"
            style={{ background: GRAD, boxShadow: '4px 5px 0 rgba(0,0,0,0.2)' }}>
            はじめる！
          </button>
          <p className="text-xs" style={{ color: 'var(--ink-sub)' }}>
            ラウンドが進むほどはやくなるよ！
          </p>
        </div>
      </GameLayout>
    )
  }

  // ── ゲーム画面 ──────────────────────────────────────────
  const { label: speedLabel } = getTiming(round)

  return (
    <GameLayout title="いろきおく" gradient={GRAD} isPlaying={['showing','input','correct','wrong'].includes(phase)}>
      <div className="flex flex-col items-center gap-4">

        {/* ステータス */}
        <div className="flex justify-between w-full items-center">
          <span className="text-xl font-black" style={{ color: 'var(--ink)' }}>
            ラウンド <span className="text-purple-600 text-2xl">{round}</span>
          </span>
          <span className="text-xs font-bold px-2 py-1 rounded-full bg-purple-100 text-purple-700">
            {speedLabel}
          </span>
        </div>

        {/* フェーズ表示バー */}
        <div className={`w-full rounded-xl py-3 text-center font-black text-lg transition-all ${
          phase === 'showing' ? 'bg-indigo-100 text-indigo-700' :
          phase === 'correct' ? 'bg-green-100 text-green-700' :
          phase === 'wrong'   ? 'bg-red-100 text-red-700' :
          'bg-amber-100 text-amber-700'
        }`}>
          {phase === 'showing' && `みてね！　${showingStep} / ${sequence.length}こ`}
          {phase === 'input'   && `タップ！　${inputIdx + 1} / ${sequence.length}`}
          {phase === 'correct' && '○ せいかい！つぎのラウンド…'}
          {phase === 'wrong'   && '× ちがう！'}
        </div>

        {/* 4色パネル ── ここが一番重要。光の差を最大化 */}
        <div className="grid grid-cols-2 gap-4 w-full">
          {PANELS.map(p => {
            const isLit        = lit === p.id || tapLit === p.id
            const isWrong      = wrongId === p.id
            const isCorrectHint = correctHintId === p.id  // 正解ヒント（緑で点灯）
            const isTapOnly    = tapLit === p.id && lit !== p.id

            return (
              <button
                key={p.id}
                onClick={() => tap(p.id)}
                disabled={phase !== 'input'}
                className="aspect-square rounded-3xl flex flex-col items-center justify-center gap-2 select-none"
                style={{
                  background: isCorrectHint ? '#30D158'
                    : isLit ? (isTapOnly ? `${p.bright}DD` : p.bright)
                    : isWrong ? '#EF4444' : p.dark,
                  transform: isCorrectHint ? 'scale(1.08)'
                    : isLit ? (isTapOnly ? 'scale(1.05)' : 'scale(1.08)')
                    : isWrong ? 'scale(0.95)' : 'scale(1)',
                  boxShadow: isCorrectHint
                    ? `0 0 40px #30D158, 0 0 80px #30D15888, inset 0 2px 0 rgba(255,255,255,0.25), 4px 5px 0 rgba(0,0,0,0.15)`
                    : isLit
                    ? `0 0 ${isTapOnly ? 25 : 40}px ${p.glow}, 0 0 ${isTapOnly ? 50 : 80}px ${p.glow}88, inset 0 2px 0 rgba(255,255,255,0.25), 4px 5px 0 rgba(0,0,0,0.15)`
                    : isWrong
                    ? `0 0 30px #EF4444, 0 0 60px #EF444488`
                    : '4px 5px 0 rgba(0,0,0,0.18)',
                  // タップ反応は超速く、消灯はゆっくり
                  transition: isLit
                    ? 'transform 40ms, box-shadow 40ms, background 40ms'
                    : 'transform 150ms, box-shadow 150ms, background 150ms',
                }}
              >
                <span style={{
                  fontSize: 54,
                  filter: isLit
                    ? 'brightness(1.4) drop-shadow(0 0 8px white)'
                    : 'brightness(0.45)',
                  transition: isLit ? 'filter 40ms' : 'filter 150ms',
                }}>
                  {p.emoji}
                </span>
                <span className="text-base font-black"
                  style={{
                    color: isLit ? 'white' : 'rgba(255,255,255,0.35)',
                    transition: isLit ? 'color 40ms' : 'color 150ms',
                  }}>
                  {p.label}
                </span>
              </button>
            )
          })}
        </div>

        {/* 入力進捗バー */}
        {(phase === 'input' || phase === 'correct') && (
          <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
            <div className="h-2.5 rounded-full transition-all bg-purple-500"
              style={{ width: `${(inputIdx / sequence.length) * 100}%` }} />
          </div>
        )}

        {/* 今何ラウンド目の何番目か */}
        {showSeqHint && phase === 'input' && (
          <p className="text-xs font-bold" style={{ color: 'var(--ink-sub)' }}>
            ラウンド{round}：{sequence.length}このいろをおぼえて！
          </p>
        )}
      </div>
    </GameLayout>
  )
}
