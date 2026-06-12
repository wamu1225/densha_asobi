import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AdBanner } from './AdBanner'

interface GameLayoutProps {
  title: string
  gradient?: string
  isPlaying?: boolean   // true のときに「もどる」で確認ダイアログを出す
  hideAd?: boolean      // 常時タップ操作する画面で広告を出さない（誤タップ防止）
  children: React.ReactNode
}

function extractColor(gradient?: string): string {
  const match = gradient?.match(/#([0-9a-fA-F]{6})/)
  return match ? `#${match[1]}` : '#1C2B40'
}

function darken(hex: string, amount = 30): string {
  const n = parseInt(hex.slice(1), 16)
  const r = Math.max(0, (n >> 16) - amount)
  const g = Math.max(0, ((n >> 8) & 0xff) - amount)
  const b = Math.max(0, (n & 0xff) - amount)
  return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`
}

export function GameLayout({ title, gradient, isPlaying = false, hideAd = false, children }: GameLayoutProps) {
  const navigate = useNavigate()
  const [showConfirm, setShowConfirm] = useState(false)

  useEffect(() => {
    const prev = document.title
    document.title = `${title} | でんしゃあそび`
    return () => { document.title = prev }
  }, [title])

  useEffect(() => {
    if (!isPlaying) return
    interface WakeLockSentinelLike { release: () => Promise<void> }
    interface WakeLockNavigator { wakeLock?: { request: (type: 'screen') => Promise<WakeLockSentinelLike> } }
    const wakeLock = (navigator as Navigator & WakeLockNavigator).wakeLock
    if (!wakeLock) return
    let wl: WakeLockSentinelLike | null = null
    wakeLock.request('screen').then(lock => { wl = lock }).catch(() => {})
    return () => { wl?.release().catch(() => {}) }
  }, [isPlaying])

  function handleBack() {
    if (isPlaying) { setShowConfirm(true) } else { navigate('/') }
  }

  const baseColor = extractColor(gradient)
  const headerBg  = darken(baseColor, 40)

  return (
    <div className="min-h-svh flex flex-col page-enter" style={{ background: 'var(--cream)' }}>
      {/* 確認ボトムシート */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center"
          style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(3px)' }}>
          <div className="bg-white rounded-t-3xl w-full max-w-lg px-6 pt-6 pb-10 shadow-2xl">
            <p className="text-2xl font-black text-center mb-6" style={{ color: 'var(--ink)' }}>
              ゲームをやめる？
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-5 text-xl font-black rounded-2xl active:scale-95"
                style={{ background: '#f3f4f6', color: 'var(--ink)' }}
              >
                つづける
              </button>
              <button
                onClick={() => navigate('/')}
                className="flex-1 py-5 text-xl font-black text-white rounded-2xl active:scale-95"
                style={{ background: '#C8352A' }}
              >
                やめる
              </button>
            </div>
          </div>
        </div>
      )}

      <header
        className="text-white px-4 flex items-center gap-3 shrink-0"
        style={{ background: headerBg, height: 52 }}
      >
        <button
          onClick={handleBack}
          className="w-11 h-11 flex items-center justify-center rounded-xl text-lg font-bold shrink-0 active:opacity-70"
          style={{ background: 'rgba(255,255,255,0.15)' }}
          aria-label="もどる"
        >
          ←
        </button>
        <h1 className="text-lg font-black tracking-tight truncate">{title}</h1>
      </header>

      {/* レールライン */}
      <div style={{ height: 3, background: baseColor }} />
      <div style={{ height: 2, background: `repeating-linear-gradient(90deg, ${baseColor}55 0, ${baseColor}55 16px, transparent 16px, transparent 22px)` }} />

      <main className="flex-1 p-4 max-w-lg mx-auto w-full">
        {children}
        {/* プレイ中はタップ動線に広告を出さない。選択・結果画面のみ・ボタン群から40px離す */}
        {!isPlaying && !hideAd && <AdBanner slot="5432198760" className="mt-10" />}
      </main>
    </div>
  )
}
