import { useState } from 'react'

const CONFETTI_COLORS = ['#f97316', '#3b82f6', '#22c55e', '#a855f7', '#eab308', '#ec4899', '#14b8a6', '#ef4444']

/** 達成・クリア演出で使う紙吹雪。ResultScreen専用だった実装を切り出し、
 *  スコア/割合を持たない「見つける」系ゲーム（でんしゃビンゴ等）でも
 *  完了時に同じ祝福演出を出せるようにする（2026-08-06）。 */
export function Confetti({ active }: { active: boolean }) {
  const [pieces] = useState(() =>
    Array.from({ length: 28 }, (_, i) => ({
      id: i,
      // 0〜100%だと要素自体の幅ぶん画面右端をはみ出し横スクロールを起こすため、
      // 右端に余白を残す（2026-08-06発見・overflow-x:hiddenはscrollWidthの値自体は減らないため併用）
      left: Math.random() * 94,
      delay: Math.random() * 0.8,
      duration: 1.2 + Math.random() * 0.8,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      size: Math.random() * 7 + 5,
      rotate: Math.random() * 360,
      tall: Math.random() > 0.5,
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
            height: p.size * (p.tall ? 2.5 : 1),
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
