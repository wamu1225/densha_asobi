import { useNavigate } from 'react-router-dom'

interface GameLayoutProps {
  title: string
  color?: string
  children: React.ReactNode
}

export function GameLayout({ title, color = 'bg-blue-500', children }: GameLayoutProps) {
  const navigate = useNavigate()
  return (
    <div className="min-h-svh bg-gray-50 flex flex-col">
      <header className={`${color} text-white px-4 py-3 flex items-center gap-3 shadow-md`}>
        <button
          onClick={() => navigate('/')}
          className="text-2xl font-bold w-10 h-10 flex items-center justify-center rounded-full bg-white/20 active:bg-white/40"
          aria-label="もどる"
        >
          ←
        </button>
        <h1 className="text-xl font-bold">{title}</h1>
      </header>
      <main className="flex-1 p-4 max-w-lg mx-auto w-full">
        {children}
      </main>
    </div>
  )
}
