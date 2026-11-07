import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AdBanner } from './AdBanner'
import { GameIcon, TrainSide } from './GameIcons'
import { nextGames } from './gameList'

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
  const { pathname } = useLocation()
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

  // あそんでいる とちゅうは すぐ もどらず、やめるか きく
  function handleBack(e: React.MouseEvent) {
    if (isPlaying) { e.preventDefault(); setShowConfirm(true) }
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
        <Link
          to="/"
          onClick={handleBack}
          className="w-11 h-11 flex items-center justify-center rounded-xl text-lg font-bold shrink-0 active:opacity-70"
          style={{ background: 'rgba(255,255,255,0.15)' }}
          aria-label="もどる"
        >
          ←
        </Link>
        <h1 className="text-lg font-black tracking-tight truncate">{title}</h1>
        {/* ゲーム個別の電車要素（O-3-6「電車らしさが見出しだけ」への対応の続き・2026-08-07）
            全13ゲーム共通のGameLayoutにさりげなく電車シルエットを常設し、
            トップだけでなくプレイ中も「でんしゃの中にいる」感を持たせる */}
        <span className="ml-auto shrink-0 opacity-40" style={{ color: 'white' }} aria-hidden="true">
          <TrainSide height={18} windowFill={headerBg} />
        </span>
      </header>

      {/* レールライン */}
      <div style={{ height: 3, background: baseColor }} />
      <div style={{ height: 2, background: `repeating-linear-gradient(90deg, ${baseColor}55 0, ${baseColor}55 16px, transparent 16px, transparent 22px)` }} />

      <main className="flex-1 p-4 max-w-lg mx-auto w-full">
        {children}
        {/* プレイ中はタップ動線に広告を出さない。選択・結果画面のみ・ボタン群から40px離す */}
        {!isPlaying && !hideAd && <AdBanner slot="5432198760" className="mt-10" />}
        {!isPlaying && (
          <nav className="mt-10" aria-label="ほかの あそび">
            <p className="text-xs font-bold mb-2" style={{ color: 'var(--ink-sub)' }}>ほかの あそび</p>
            <div className="grid grid-cols-3 gap-2">
              {nextGames(pathname, 6).map(g => (
                <Link key={g.path} to={g.path} className="flex flex-col items-center gap-1 py-2 bg-white rounded-xl border-2 border-gray-200 active:scale-95">
                  <span className="flex items-center justify-center rounded-lg" style={{ width: 30, height: 30, background: g.color, color: 'white' }}>
                    <GameIcon id={g.icon} size={18} />
                  </span>
                  <span className="text-[11px] font-bold leading-tight text-center px-1" style={{ color: 'var(--ink)' }}>{g.name}</span>
                </Link>
              ))}
            </div>
          </nav>
        )}
      </main>
    </div>
  )
}
