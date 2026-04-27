import { useState } from 'react'
import { GameLayout } from '../components/GameLayout'

interface DotPattern {
  name: string
  emoji: string
  dots: { x: number; y: number }[]
}

const PATTERNS: DotPattern[] = [
  {
    name: 'おうち',
    emoji: '🏠',
    dots: [
      { x: 150, y: 40 },
      { x: 260, y: 130 },
      { x: 230, y: 130 },
      { x: 230, y: 240 },
      { x: 70,  y: 240 },
      { x: 70,  y: 130 },
      { x: 40,  y: 130 },
    ],
  },
  {
    name: 'ほし',
    emoji: '⭐',
    dots: [
      { x: 150, y: 30  },
      { x: 190, y: 120 },
      { x: 280, y: 120 },
      { x: 210, y: 180 },
      { x: 240, y: 270 },
      { x: 150, y: 215 },
      { x: 60,  y: 270 },
      { x: 90,  y: 180 },
      { x: 20,  y: 120 },
      { x: 110, y: 120 },
    ],
  },
  {
    name: 'さかな',
    emoji: '🐟',
    dots: [
      { x: 250, y: 80  },
      { x: 290, y: 40  },
      { x: 290, y: 130 },
      { x: 200, y: 110 },
      { x: 120, y: 100 },
      { x: 60,  y: 150 },
      { x: 120, y: 200 },
      { x: 200, y: 190 },
      { x: 250, y: 220 },
    ],
  },
  {
    name: 'ロケット',
    emoji: '🚀',
    dots: [
      { x: 150, y: 30  },
      { x: 200, y: 100 },
      { x: 200, y: 200 },
      { x: 230, y: 250 },
      { x: 200, y: 240 },
      { x: 150, y: 270 },
      { x: 100, y: 240 },
      { x: 70,  y: 250 },
      { x: 100, y: 200 },
      { x: 100, y: 100 },
    ],
  },
  {
    name: 'ハート',
    emoji: '❤️',
    dots: [
      { x: 150, y: 250 },
      { x: 60,  y: 130 },
      { x: 60,  y: 80  },
      { x: 100, y: 50  },
      { x: 150, y: 90  },
      { x: 200, y: 50  },
      { x: 240, y: 80  },
      { x: 240, y: 130 },
    ],
  },
]

export function DotConnect() {
  const [patternIdx, setPatternIdx] = useState(0)
  const [connected, setConnected] = useState(0)
  const [done, setDone] = useState(false)

  const pattern = PATTERNS[patternIdx]
  const n = pattern.dots.length

  function tap(i: number) {
    if (i !== connected) return
    const next = connected + 1
    setConnected(next)
    if (next >= n) setDone(true)
  }

  function nextPattern() {
    setPatternIdx(i => (i + 1) % PATTERNS.length)
    setConnected(0)
    setDone(false)
  }

  function reset() { setConnected(0); setDone(false) }

  const lines: { x1: number; y1: number; x2: number; y2: number }[] = []
  for (let i = 0; i < connected - 1; i++) {
    lines.push({ x1: pattern.dots[i].x, y1: pattern.dots[i].y, x2: pattern.dots[i + 1].x, y2: pattern.dots[i + 1].y })
  }
  if (done) {
    lines.push({ x1: pattern.dots[n - 1].x, y1: pattern.dots[n - 1].y, x2: pattern.dots[0].x, y2: pattern.dots[0].y })
  }

  return (
    <GameLayout title="ドットつなぎ" color="bg-lime-500">
      <div className="flex flex-col items-center gap-4">
        <div className="flex justify-between w-full items-center">
          <span className="text-lg font-bold text-gray-700">なにができるかな？</span>
          <span className="text-sm text-gray-500">{connected}/{n}</span>
        </div>

        {done && (
          <div className="bg-yellow-100 border-2 border-yellow-400 rounded-2xl px-6 py-3 text-center bounce-in">
            <p className="text-2xl font-bold text-yellow-600">✨ {pattern.emoji} {pattern.name}！</p>
          </div>
        )}

        <div className="w-full bg-white rounded-2xl border-2 border-lime-200 shadow overflow-hidden">
          <svg viewBox="0 0 300 300" className="w-full">
            {lines.map((l, i) => (
              <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke="#84cc16" strokeWidth="4" strokeLinecap="round" />
            ))}
            {pattern.dots.map((d, i) => {
              const tapped = i < connected
              const isNext = i === connected
              return (
                <g key={i} onClick={() => tap(i)} style={{ cursor: isNext ? 'pointer' : 'default' }}>
                  <circle cx={d.x} cy={d.y} r={isNext ? 18 : 14} fill={tapped ? '#84cc16' : isNext ? '#bef264' : '#e7f5d0'} stroke={isNext ? '#65a30d' : '#a3e635'} strokeWidth="2" />
                  <text x={d.x} y={d.y} textAnchor="middle" dominantBaseline="central" fontSize="13" fontWeight="bold" fill={tapped ? 'white' : '#4d7c0f'}>
                    {i + 1}
                  </text>
                </g>
              )
            })}
          </svg>
        </div>

        <p className="text-sm text-gray-500">
          {done ? '✨ できた！' : `${connected + 1}をタップしよう！`}
        </p>

        <div className="flex gap-3 w-full">
          <button onClick={reset} className="flex-1 py-4 text-base font-bold bg-gray-200 text-gray-600 rounded-2xl active:scale-95">
            やりなおし
          </button>
          <button onClick={nextPattern} className="flex-1 py-4 text-base font-bold bg-lime-400 text-white rounded-2xl shadow active:scale-95">
            ちがうえ 🔄
          </button>
        </div>
      </div>
    </GameLayout>
  )
}
