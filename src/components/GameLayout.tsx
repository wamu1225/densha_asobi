import { useNavigate } from 'react-router-dom'
import { AdBanner } from './AdBanner'

interface GameLayoutProps {
  title: string
  // gradient は後方互換のため残すが、内部では solid color に読み替える
  gradient?: string
  children: React.ReactNode
}

// gradient 文字列から先頭の16進カラーを取り出してソリッドカラーとして使う
function extractColor(gradient?: string): string {
  const match = gradient?.match(/#([0-9a-fA-F]{6})/)
  return match ? `#${match[1]}` : '#1C2B40'
}

// 少し暗くして落ち着かせる
function darken(hex: string, amount = 30): string {
  const n = parseInt(hex.slice(1), 16)
  const r = Math.max(0, (n >> 16) - amount)
  const g = Math.max(0, ((n >> 8) & 0xff) - amount)
  const b = Math.max(0, (n & 0xff) - amount)
  return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`
}

export function GameLayout({ title, gradient, children }: GameLayoutProps) {
  const navigate = useNavigate()
  const baseColor = extractColor(gradient)
  const headerBg = darken(baseColor, 40)

  return (
    <div className="min-h-svh flex flex-col" style={{ background: 'var(--cream)' }}>
      <header
        className="text-white px-4 flex items-center gap-3 shrink-0"
        style={{
          background: headerBg,
          height: 52,
          // ヘッダー下端に細い色ライン（アクセント）
          borderBottom: `3px solid ${baseColor}`,
        }}
      >
        <button
          onClick={() => navigate('/')}
          className="w-9 h-9 flex items-center justify-center rounded-lg text-lg font-bold shrink-0 active:opacity-70"
          style={{ background: 'rgba(255,255,255,0.15)' }}
          aria-label="もどる"
        >
          ←
        </button>
        <h1 className="text-lg font-black tracking-tight truncate">{title}</h1>
      </header>

      <main className="flex-1 p-4 max-w-lg mx-auto w-full">
        {children}
        <AdBanner slot="5432198760" format="horizontal" className="mt-6" />
      </main>
    </div>
  )
}
