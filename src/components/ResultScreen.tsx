import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { GameIcon } from './GameIcons'

const NEXT_GAMES = [
  { path: '/math',     icon: 'math',     name: 'けいさんスプリント',  color: '#C8352A' },
  { path: '/bigger',   icon: 'bigger',   name: 'どっちがおおきい？',  color: '#C8352A' },
  { path: '/clock',    icon: 'clock',    name: 'とけいをよもう',      color: '#C8352A' },
  { path: '/bingo',    icon: 'bingo',    name: 'でんしゃビンゴ',      color: '#217A4B' },
  { path: '/color',    icon: 'color',    name: 'いろさがし',          color: '#217A4B' },
  { path: '/memory',   icon: 'memory',   name: 'しんけいすいじゃく',  color: '#6B3FC0' },
  { path: '/next',     icon: 'next',     name: 'つぎはどれ？',        color: '#6B3FC0' },
  { path: '/simon',    icon: 'simon',    name: 'いろきおく',          color: '#6B3FC0' },
  { path: '/maze',     icon: 'maze',     name: 'すうじめいろ',        color: '#C8352A' },
  { path: '/scramble', icon: 'scramble', name: 'もじならべ',          color: '#2558C4' },
  { path: '/search',   icon: 'search',   name: 'ひらがなさがし',      color: '#2558C4' },
  { path: '/riddles',  icon: 'riddles',  name: 'なぞなぞ',            color: '#2558C4' },
  { path: '/dots',     icon: 'dots',     name: 'ドットつなぎ',        color: '#6B3FC0' },
]

interface Stat { label: string; value: string | number }

interface ResultScreenProps {
  score?: number
  total?: number
  scoreLabel?: string     // スコア行の見出し（デフォルト: "みつけた かず"）
  scoreSuffix?: string    // スコアの後ろにつく単位（デフォルト: "こ"）
  timeStr?: string
  extra?: Stat[]
  best?: number | null
  bestStr?: string
  bestLabel?: string
  onRetry: () => void
  onChangeMode?: () => void
  isNewBest?: boolean         // ベスト更新時 true
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

function Star({ filled, size = 38, delay = 0 }: { filled: boolean; size?: number; delay?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className="bounce-in"
      style={{ animationDelay: `${delay}ms` }}
      fill={filled ? '#fbbf24' : 'none'} stroke={filled ? '#f59e0b' : '#d6d3d1'}
      strokeWidth="1.6" strokeLinejoin="round">
      <path d="M12 3.2l2.6 5.4 5.9.8-4.3 4.1 1 5.9-5.2-2.8-5.2 2.8 1-5.9-4.3-4.1 5.9-.8z" />
    </svg>
  )
}

export function ResultScreen({ score, total, scoreLabel, scoreSuffix, timeStr, extra = [], best, bestStr, bestLabel = 'ベスト', onRetry, onChangeMode, isNewBest = false, accentColor = 'text-sky-500' }: ResultScreenProps) {
  const navigate = useNavigate()
  const location = useLocation()

  // 現在のゲームを除外してランダムに2個選ぶ
  const suggestions = NEXT_GAMES
    .filter(g => g.path !== location.pathname)
    .sort(() => Math.random() - 0.5)
    .slice(0, 2)
  const [showConfetti, setShowConfetti] = useState(false)
  const pct = total != null && score != null ? score / total : null
  const isPerfect = pct === 1.0
  const isGreat   = pct != null ? pct >= 0.8 : true

  useEffect(() => {
    if (isGreat || isNewBest) { setShowConfetti(true); setTimeout(() => setShowConfetti(false), 2500) }
  }, [isGreat, isNewBest])

  // 星3段階（割合が出ないクリア型ゲームは星なしでメッセージのみ）
  const stars = pct == null ? null : pct >= 0.8 ? 3 : pct >= 0.6 ? 2 : pct >= 0.4 ? 1 : 0

  const message =
    pct == null  ? 'クリア！' :
    isPerfect    ? 'かんぺき！！' :
    pct >= 0.8   ? 'すごい！' :
    pct >= 0.6   ? 'よくできました！' :
    pct >= 0.4   ? 'もうすこし！' : 'もういちど やってみよう！'

  return (
    <div className="flex flex-col items-center gap-5 pt-8 bounce-in">
      <Confetti active={showConfetti} />

      {isNewBest && (
        <div className="w-full rounded-2xl px-5 py-3 text-center bounce-in"
          style={{ background: 'linear-gradient(135deg,#fbbf24,#f59e0b)', boxShadow: '0 4px 16px rgba(245,158,11,0.5)' }}>
          <p className="text-2xl font-black text-white">★ ベスト更新！！</p>
        </div>
      )}

      {stars != null && (
        <div className="flex gap-1.5 mt-1">
          {[0, 1, 2].map(i => <Star key={i} filled={i < stars} delay={i * 140} />)}
        </div>
      )}
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
                <p className="text-sm font-bold mb-1" style={{ color: 'var(--ink-sub)' }}>{scoreLabel ?? 'みつけた かず'}</p>
                <p className={`text-6xl font-black ${accentColor}`}>
                  {score}
                  <span className="text-2xl" style={{ color: 'var(--ink-sub)' }}>
                    {scoreSuffix ?? (scoreLabel ? '' : 'こ')}
                  </span>
                </p>
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
            <p className="text-sm font-bold" style={{ color: 'var(--ink-sub)' }}>{bestLabel}：{bestStr ?? best}</p>
          </div>
        )}
      </div>

      {/* もういちど — 常に最大幅・最目立ちの主ボタン */}
      <button
        onClick={onRetry}
        className="w-full py-5 text-xl font-black text-white rounded-2xl active:scale-95 transition-transform"
        style={{ background: '#1C2B40', boxShadow: '4px 5px 0 rgba(0,0,0,0.22)' }}
      >
        もういちど
      </button>

      {/* 副ボタン行 */}
      <div className="flex gap-3 w-full">
        {onChangeMode && (
          <button
            onClick={onChangeMode}
            className="flex-1 py-3 text-sm font-bold rounded-xl active:scale-95 border-2"
            style={{ background: 'white', color: 'var(--ink)', borderColor: '#ddd', boxShadow: '2px 3px 0 rgba(0,0,0,0.06)' }}
          >
            せっていをかえる
          </button>
        )}
        <button
          onClick={() => navigate('/')}
          className="flex-1 py-3 text-sm font-bold rounded-xl active:scale-95 border-2"
          style={{ background: 'white', color: 'var(--ink-sub)', borderColor: '#e5e7eb', boxShadow: '2px 3px 0 rgba(0,0,0,0.06)' }}
        >
          ホームへ
        </button>
      </div>

      {/* 次のゲーム提案 */}
      <div className="w-full">
        <p className="text-xs font-bold text-center mb-2" style={{ color: 'var(--ink-sub)' }}>
          つぎは このゲームも どう？
        </p>
        <div className="flex gap-2">
          {suggestions.map(g => (
            <button
              key={g.path}
              onClick={() => navigate(g.path)}
              className="flex-1 py-3 bg-white rounded-xl border-2 border-gray-200 active:scale-95 text-center"
              style={{ boxShadow: '2px 3px 0 rgba(0,0,0,0.06)' }}
            >
              <span className="mx-auto flex items-center justify-center rounded-xl"
                style={{ width: 38, height: 38, background: g.color, color: 'white' }}>
                <GameIcon id={g.icon} size={24} />
              </span>
              <span className="text-xs font-bold leading-tight block mt-1.5" style={{ color: 'var(--ink)' }}>
                {g.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
