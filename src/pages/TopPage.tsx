import { useNavigate } from 'react-router-dom'

const GAMES = [
  { path: '/math',     emoji: '🔢', title: 'けいさん\nスプリント', grad: 'linear-gradient(145deg,#ff9a5c,#f97316)' },
  { path: '/bigger',   emoji: '⚖️', title: 'どっちが\nおおきい？', grad: 'linear-gradient(145deg,#60a5fa,#3b82f6)' },
  { path: '/clock',    emoji: '🕐', title: 'とけいを\nよもう',      grad: 'linear-gradient(145deg,#c084fc,#a855f7)' },
  { path: '/riddles',  emoji: '🤔', title: 'なぞなぞ',             grad: 'linear-gradient(145deg,#fbbf24,#f59e0b)' },
  { path: '/bingo',    emoji: '🚃', title: 'でんしゃ\nビンゴ',     grad: 'linear-gradient(145deg,#4ade80,#22c55e)' },
  { path: '/color',    emoji: '🎨', title: 'いろさがし\nチャレンジ', grad: 'linear-gradient(145deg,#f472b6,#ec4899)' },
  { path: '/memory',   emoji: '🃏', title: 'しんけい\nすいじゃく',  grad: 'linear-gradient(145deg,#2dd4bf,#14b8a6)' },
  { path: '/next',     emoji: '🔮', title: 'つぎは\nどれ？',        grad: 'linear-gradient(145deg,#818cf8,#6366f1)' },
  { path: '/maze',     emoji: '🗺️', title: 'すうじ\nめいろ',        grad: 'linear-gradient(145deg,#f87171,#ef4444)' },
  { path: '/scramble', emoji: '📝', title: 'もじ\nならべ',          grad: 'linear-gradient(145deg,#fcd34d,#f59e0b)' },
  { path: '/search',   emoji: '🔍', title: 'ひらがな\nさがし',      grad: 'linear-gradient(145deg,#67e8f9,#06b6d4)' },
  { path: '/dots',     emoji: '✏️', title: 'ドット\nつなぎ',        grad: 'linear-gradient(145deg,#bef264,#84cc16)' },
]

function TrainSvg() {
  return (
    <div className="overflow-hidden h-10 relative">
      <div className="train-ride absolute whitespace-nowrap">
        <span className="text-3xl">🚃🚃🚃</span>
      </div>
    </div>
  )
}

function Cloud({ top, left, size }: { top: number; left: number; size: number }) {
  return (
    <div
      className="absolute rounded-full opacity-60"
      style={{
        top, left,
        width: size * 2.5, height: size,
        background: 'rgba(255,255,255,0.85)',
        filter: 'blur(2px)',
      }}
    />
  )
}

export function TopPage() {
  const navigate = useNavigate()
  return (
    <div className="min-h-svh" style={{ background: 'linear-gradient(180deg, #bae6fd 0%, #e0f2fe 35%, #f0f9ff 100%)' }}>
      {/* ヘッダー */}
      <header
        className="relative overflow-hidden pt-8 pb-4 px-4 text-center"
        style={{ background: 'linear-gradient(180deg, #0ea5e9 0%, #38bdf8 100%)' }}
      >
        {/* 雲 */}
        <Cloud top={8} left={10} size={18} />
        <Cloud top={20} left={55} size={14} />
        <Cloud top={4} left={80} size={20} />

        <div className="relative z-10">
          <p className="text-white/80 text-sm font-bold tracking-widest mb-1">🚃 DENSHA ASOBI</p>
          <h1 className="text-white font-black text-4xl tracking-tight" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
            でんしゃあそび
          </h1>
          <p className="text-white/90 text-base font-bold mt-1">でんしゃのなかで あそぼう！</p>
        </div>

        {/* 走る電車 */}
        <div className="mt-3">
          <TrainSvg />
        </div>

        {/* 波型の下端 */}
        <svg viewBox="0 0 400 20" preserveAspectRatio="none" className="absolute bottom-0 left-0 w-full" height="20">
          <path d="M0,10 C100,0 300,20 400,10 L400,20 L0,20 Z" fill="#f0f9ff" />
        </svg>
      </header>

      {/* ゲームグリッド */}
      <main className="px-4 pt-5 pb-8 max-w-lg mx-auto">
        <p className="text-center text-gray-500 text-sm font-bold mb-4">ゲームをえらんでね 👇</p>
        <div className="grid grid-cols-3 gap-3">
          {GAMES.map(game => (
            <button
              key={game.path}
              onClick={() => navigate(game.path)}
              className="rounded-3xl flex flex-col items-center justify-center gap-1.5 active:scale-90 transition-transform duration-100"
              style={{
                background: game.grad,
                aspectRatio: '1',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.25)',
                padding: '10px 6px 12px',
              }}
            >
              <span style={{ fontSize: 32, lineHeight: 1 }}>{game.emoji}</span>
              <span
                className="text-white font-bold text-center leading-tight"
                style={{
                  fontSize: 11,
                  whiteSpace: 'pre-line',
                  textShadow: '0 1px 3px rgba(0,0,0,0.25)',
                  letterSpacing: '-0.01em',
                }}
              >
                {game.title}
              </span>
            </button>
          ))}
        </div>

        <p className="text-center text-gray-400 text-xs mt-8 font-bold">
          🚃 でんしゃのたびを たのしもう！
        </p>
      </main>
    </div>
  )
}
