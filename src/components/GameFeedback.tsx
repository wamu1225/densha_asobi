// 全ゲーム共通の正解・不正解フィードバックバナー
// 不正解は「おしい！」＋（あれば）正解の表示。やわらかい言い方は保ちつつ、
// やり直せると誤解させない（2026-08-02 ユーザー指摘＝「もういちど」と言いながら
// 自動で次へ進んでいた。この部品を使う4ゲーム〔ClockReading/MathSprint/WhatsNext/
// WhichBigger〕は全て不正解でも次へ進み、正解や解説を見せる設計。表示の方が誤りだった）

interface GameFeedbackProps {
  flash: 'ok' | 'ng' | null
  wrongHint?: string   // 不正解時に正解を表示する場合（ClockReadingなど）
}

export function GameFeedback({ flash, wrongHint }: GameFeedbackProps) {
  if (!flash) return null

  if (flash === 'ok') {
    return (
      <div className="w-full rounded-2xl py-3 bounce-in flex items-center justify-center gap-2"
        style={{
          background: 'linear-gradient(135deg, #4ade80, #16a34a)',
          boxShadow: '0 4px 18px rgba(34,197,94,0.5), 3px 4px 0 rgba(0,0,0,0.1)',
        }}>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9.5" />
          <path d="M7.8 12.5l2.8 2.8 5.6-5.9" />
        </svg>
        <span className="text-2xl font-black text-white">せいかい！</span>
      </div>
    )
  }

  return (
    <div className="w-full bg-amber-50 border border-amber-200 rounded-xl py-1.5 text-center">
      <span className="text-sm font-bold text-amber-600">
        おしい！
        {wrongHint && <span className="block text-xs mt-0.5 text-amber-500">{wrongHint}</span>}
      </span>
    </div>
  )
}
