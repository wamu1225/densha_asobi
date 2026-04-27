import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

interface Stat { label: string; value: string | number }

interface ResultScreenProps {
  score?: number
  total?: number
  timeStr?: string
  extra?: Stat[]
  best?: number | null
  bestStr?: string        // best をフォーマット済み文字列で渡す場合（時間表示など）
  bestLabel?: string
  onRetry: () => void
  accentColor?: string
}

const CONFETTI_COLORS = ['#f97316','#3b82f6','#22c55e','#a855f7','#eab308','#ec4899','#14b8a6','#ef4444']

function Confetti({ active }: { active: boolean }) {
  const [pieces] = useState(() =>
    Array.from({ length: 28 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.8,
      duration: 1.2 + Math.random() * 0.8,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      size: Math.random() * 7 + 5,
      rotate: Math.random() * 360,
    }))
  )
  if (!active) return null
  return (
    <>
      {pieces.map(p => (
        <div
          key={p.id}
          className="confetti-piece"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size * (Math.random() > 0.5 ? 1 : 2.5),
            background: p.color,
            transform: `rotate(${p.rotate}deg)`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </>
  )
}

export function ResultScreen({ score, total, timeStr, extra = [], best, bestStr, bestLabel = 'ベスト', onRetry, accentColor = 'text-sky-500' }: ResultScreenProps) {
  const navigate = useNavigate()
  const [showConfetti, setShowConfetti] = useState(false)
  const pct = total != null && score != null ? score / total : null
  const isGreat = pct != null ? pct >= 0.8 : true

  useEffect(() => {
    if (isGreat) { setShowConfetti(true); setTimeout(() => setShowConfetti(false), 2500) }
  }, [isGreat])

  const emoji = pct == null ? '🎉' : pct >= 0.9 ? '🏆' : pct >= 0.7 ? '🎉' : pct >= 0.5 ? '😊' : '💪'
  const message = pct == null ? 'クリア！' : pct >= 0.9 ? 'かんぺき！！' : pct >= 0.7 ? 'すごい！' : pct >= 0.5 ? 'よくできました！' : 'もういちど やってみよう！'

  return (
    <div className="flex flex-col items-center gap-5 pt-8 bounce-in">
      <Confetti active={showConfetti} />

      <div className="text-6xl">{emoji}</div>
      <p className="text-3xl font-bold text-gray-800">{message}</p>

      <div className="bg-white rounded-3xl shadow-lg p-6 w-full border border-gray-100">
        {score != null && (
          <div className="text-center mb-3">
            {total != null ? (
              <>
                <p className="text-base text-gray-500 mb-1">せいかい</p>
                <p className={`text-6xl font-black ${accentColor}`}>
                  {score}<span className="text-2xl text-gray-400"> / {total}</span>
                </p>
              </>
            ) : (
              <>
                <p className="text-base text-gray-500 mb-1">みつけた かず</p>
                <p className={`text-6xl font-black ${accentColor}`}>{score}<span className="text-2xl text-gray-400">こ</span></p>
              </>
            )}
          </div>
        )}
        {timeStr && (
          <div className="text-center mb-3">
            <p className="text-base text-gray-500 mb-1">タイム</p>
            <p className={`text-5xl font-black ${accentColor}`}>{timeStr}</p>
          </div>
        )}
        {extra.map((s, i) => (
          <div key={i} className="text-center mb-2">
            <p className="text-sm text-gray-500">{s.label}</p>
            <p className="text-2xl font-bold text-gray-700">{s.value}</p>
          </div>
        ))}
        {(best != null || bestStr) && (
          <div className="mt-3 pt-3 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-400">🏆 {bestLabel}：{bestStr ?? best}</p>
          </div>
        )}
      </div>

      <div className="flex gap-3 w-full">
        <button
          onClick={onRetry}
          className="flex-1 py-4 text-lg font-bold text-white rounded-2xl shadow-lg active:scale-95 transition-transform"
          style={{ background: 'linear-gradient(135deg, #0ea5e9, #0284c7)' }}
        >
          もういちど 🔄
        </button>
        <button
          onClick={() => navigate('/')}
          className="flex-1 py-4 text-lg font-bold bg-white text-gray-600 rounded-2xl shadow active:scale-95 border border-gray-200"
        >
          もどる 🏠
        </button>
      </div>
    </div>
  )
}
