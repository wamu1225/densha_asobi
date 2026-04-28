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
      <p className="text-3xl font-black" style={{ color: 'var(--ink)' }}>{message}</p>

      {/* スコアカード — ふせん風 */}
      <div className="w-full rounded-2xl p-5"
        style={{
          background: 'white',
          borderLeft: '5px solid #1C2B40',
          boxShadow: '4px 5px 0 rgba(0,0,0,0.08)',
        }}
      >
        {score != null && (
          <div className="text-center mb-3">
            {total != null ? (
              <>
                <p className="text-sm font-bold mb-1" style={{ color: 'var(--ink-sub)' }}>せいかい</p>
                <p className={`text-6xl font-black ${accentColor}`}>
                  {score}<span className="text-2xl" style={{ color: 'var(--ink-sub)' }}> / {total}</span>
                </p>
              </>
            ) : (
              <>
                <p className="text-sm font-bold mb-1" style={{ color: 'var(--ink-sub)' }}>みつけた かず</p>
                <p className={`text-6xl font-black ${accentColor}`}>{score}<span className="text-2xl" style={{ color: 'var(--ink-sub)' }}>こ</span></p>
              </>
            )}
          </div>
        )}
        {timeStr && (
          <div className="text-center mb-3">
            <p className="text-sm font-bold mb-1" style={{ color: 'var(--ink-sub)' }}>タイム</p>
            <p className={`text-5xl font-black ${accentColor}`}>{timeStr}</p>
          </div>
        )}
        {extra.map((s, i) => (
          <div key={i} className="text-center mb-2">
            <p className="text-xs font-bold" style={{ color: 'var(--ink-sub)' }}>{s.label}</p>
            <p className="text-xl font-bold" style={{ color: 'var(--ink)' }}>{s.value}</p>
          </div>
        ))}
        {(best != null || bestStr) && (
          <div className="mt-3 pt-3 border-t border-gray-100 text-center">
            <p className="text-sm font-bold" style={{ color: 'var(--ink-sub)' }}>🏆 {bestLabel}：{bestStr ?? best}</p>
          </div>
        )}
      </div>

      <div className="flex gap-3 w-full">
        <button
          onClick={onRetry}
          className="flex-1 py-4 text-lg font-black text-white rounded-xl active:scale-95 transition-transform"
          style={{
            background: '#1C2B40',
            boxShadow: '3px 4px 0 rgba(0,0,0,0.2)',
          }}
        >
          もういちど 🔄
        </button>
        <button
          onClick={() => navigate('/')}
          className="flex-1 py-4 text-lg font-black rounded-xl active:scale-95 border-2"
          style={{
            background: 'white',
            color: 'var(--ink)',
            borderColor: '#ddd',
            boxShadow: '3px 4px 0 rgba(0,0,0,0.06)',
          }}
        >
          もどる 🏠
        </button>
      </div>
    </div>
  )
}
