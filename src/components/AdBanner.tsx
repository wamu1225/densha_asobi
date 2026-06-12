import { useEffect, useRef } from 'react'

declare global {
  interface Window {
    adsbygoogle: unknown[]
  }
}

interface AdBannerProps {
  slot: string
  height?: number   // 枠の高さを予約しCSS固定サイズで配信（巨大広告とCLSを防ぐ）
  className?: string
}

export function AdBanner({ slot, height = 100, className = '' }: AdBannerProps) {
  const pushed = useRef(false)

  useEffect(() => {
    if (pushed.current) return
    pushed.current = true
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch {
      // AdSense not loaded (dev or blocked)
    }
  }, [])

  return (
    <div className={className}>
      <p style={{ fontSize: 10, color: '#6b7280', textAlign: 'center', marginBottom: 2, letterSpacing: '0.15em' }}>こうこく</p>
      <div className="overflow-hidden" style={{ height }}>
        <ins
          className="adsbygoogle"
          style={{ display: 'block', width: '100%', height }}
          data-ad-client="ca-pub-9102538151148380"
          data-ad-slot={slot}
        />
      </div>
    </div>
  )
}
