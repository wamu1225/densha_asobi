// 全ゲーム共通の正解・不正解フィードバックバナー
// 「❌ちがう！」の代わりに「おしい！もういちど！」で発達的に健全な表現に統一

interface GameFeedbackProps {
  flash: 'ok' | 'ng' | null
  wrongHint?: string   // 不正解時に正解を表示する場合（ClockReadingなど）
}

export function GameFeedback({ flash, wrongHint }: GameFeedbackProps) {
  if (!flash) return null

  if (flash === 'ok') {
    return (
      <div className="w-full rounded-2xl py-3 text-center bounce-in"
        style={{
          background: 'linear-gradient(135deg, #4ade80, #16a34a)',
          boxShadow: '0 4px 18px rgba(34,197,94,0.5), 3px 4px 0 rgba(0,0,0,0.1)',
        }}>
        <span className="text-2xl font-black text-white">⭕ せいかい！ 🎉</span>
      </div>
    )
  }

  return (
    <div className="w-full bg-amber-50 border border-amber-200 rounded-xl py-1.5 text-center">
      <span className="text-sm font-bold text-amber-600">
        💪 おしい！もういちど！
        {wrongHint && <span className="block text-xs mt-0.5 text-amber-500">こたえ：{wrongHint}</span>}
      </span>
    </div>
  )
}
