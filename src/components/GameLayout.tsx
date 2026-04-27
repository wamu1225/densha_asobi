import { useNavigate } from 'react-router-dom'
import { AdBanner } from './AdBanner'

interface GameLayoutProps {
  title: string
  gradient?: string
  children: React.ReactNode
}

const DEFAULT_GRAD = 'linear-gradient(135deg, #0ea5e9, #0284c7)'

export function GameLayout({ title, gradient = DEFAULT_GRAD, children }: GameLayoutProps) {
  const navigate = useNavigate()
  return (
    <div className="min-h-svh flex flex-col" style={{ background: '#f0f9ff' }}>
      <header
        className="text-white px-4 flex items-center gap-3 shrink-0"
        style={{ background: gradient, height: 'var(--tap-target, 56px)', boxShadow: '0 2px 12px rgba(0,0,0,0.15)' }}
      >
        <button
          onClick={() => navigate('/')}
          className="w-10 h-10 flex items-center justify-center rounded-full text-xl font-bold shrink-0"
          style={{ background: 'rgba(255,255,255,0.25)', border: '1px solid rgba(255,255,255,0.4)' }}
          aria-label="もどる"
        >
          ←
        </button>
        <h1 className="text-xl font-bold tracking-tight truncate">{title}</h1>
      </header>
      <main className="flex-1 p-4 max-w-lg mx-auto w-full">
        {children}
        <AdBanner slot="5432198760" format="horizontal" className="mt-6" />
      </main>
    </div>
  )
}
