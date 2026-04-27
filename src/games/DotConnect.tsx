import React, { useState } from 'react'
import { GameLayout } from '../components/GameLayout'

interface DotPattern { name: string; emoji: string; dots: { x: number; y: number }[]; close?: boolean }

const PATTERNS: DotPattern[] = [
  {
    name: 'さんかく',
    emoji: '🔺',
    close: true,
    dots: [{ x:150,y:30 },{ x:260,y:240 },{ x:40,y:240 }],
  },
  {
    name: 'おうち',
    emoji: '🏠',
    close: true,
    dots: [{ x:150,y:30 },{ x:255,y:120 },{ x:225,y:120 },{ x:225,y:240 },{ x:75,y:240 },{ x:75,y:120 },{ x:45,y:120 }],
  },
  {
    name: 'ほし',
    emoji: '⭐',
    close: true,
    dots: [
      { x:150,y:25 },{ x:190,y:115 },{ x:285,y:115 },{ x:210,y:175 },{ x:240,y:265 },
      { x:150,y:210 },{ x:60,y:265 },{ x:90,y:175 },{ x:15,y:115 },{ x:110,y:115 },
    ],
  },
  {
    name: 'さかな',
    emoji: '🐟',
    close: false,
    dots: [{ x:250,y:80 },{ x:290,y:40 },{ x:290,y:130 },{ x:250,y:110 },{ x:160,y:100 },{ x:80,y:150 },{ x:160,y:200 },{ x:250,y:190 },{ x:290,y:130 }],
  },
  {
    name: 'ハート',
    emoji: '❤️',
    close: true,
    dots: [{ x:150,y:260 },{ x:55,y:130 },{ x:55,y:80 },{ x:100,y:45 },{ x:150,y:85 },{ x:200,y:45 },{ x:245,y:80 },{ x:245,y:130 }],
  },
  {
    name: 'ロケット',
    emoji: '🚀',
    close: false,
    dots: [{ x:150,y:20 },{ x:200,y:90 },{ x:200,y:190 },{ x:240,y:250 },{ x:200,y:230 },{ x:150,y:260 },{ x:100,y:230 },{ x:60,y:250 },{ x:100,y:190 },{ x:100,y:90 },{ x:150,y:20 }],
  },
  {
    name: 'かみなり',
    emoji: '⚡',
    close: false,
    dots: [{ x:200,y:20 },{ x:120,y:130 },{ x:170,y:130 },{ x:90,y:270 },{ x:175,y:155 },{ x:130,y:155 },{ x:200,y:20 }],
  },
  {
    name: 'おさかな（2）',
    emoji: '🐠',
    close: true,
    dots: [{ x:60,y:150 },{ x:100,y:90 },{ x:190,y:70 },{ x:260,y:110 },{ x:260,y:190 },{ x:190,y:230 },{ x:100,y:210 },{ x:60,y:150 },{ x:20,y:80 },{ x:20,y:220 },{ x:60,y:150 }],
  },
  {
    name: 'むし',
    emoji: '🐛',
    close: false,
    dots: [
      { x:50,y:150 },{ x:100,y:100 },{ x:150,y:90 },{ x:200,y:100 },{ x:250,y:150 },
      { x:200,y:200 },{ x:150,y:210 },{ x:100,y:200 },{ x:50,y:150 },
      { x:150,y:90 },{ x:150,y:50 },
    ],
  },
  {
    name: 'とり',
    emoji: '🐦',
    close: false,
    dots: [
      { x:100,y:200 },{ x:100,y:120 },{ x:80,y:80 },{ x:120,y:60 },{ x:160,y:80 },
      { x:160,y:60 },{ x:200,y:50 },{ x:240,y:80 },{ x:220,y:120 },
      { x:200,y:160 },{ x:160,y:180 },{ x:100,y:200 },{ x:80,y:250 },{ x:130,y:270 },
    ],
  },
]

export function DotConnect() {
  const [pIdx, setPIdx] = useState(0)
  const [connected, setConnected] = useState(0)
  const [done, setDone] = useState(false)
  const [wrong, setWrong] = useState<number | null>(null)

  const pattern = PATTERNS[pIdx]
  const n = pattern.dots.length

  function tap(i: number) {
    if (i === connected) {
      const next = connected + 1
      setConnected(next)
      if (next >= n) setDone(true)
    } else {
      setWrong(i)
      setTimeout(() => setWrong(null), 400)
    }
  }

  function changePattern(delta: number) {
    setPIdx(i => (i + delta + PATTERNS.length) % PATTERNS.length)
    setConnected(0); setDone(false)
  }

  function reset() { setConnected(0); setDone(false) }

  const lines: React.ReactElement[] = []
  for (let i = 0; i < connected - 1; i++) {
    lines.push(
      <line key={`l${i}`} x1={pattern.dots[i].x} y1={pattern.dots[i].y} x2={pattern.dots[i+1].x} y2={pattern.dots[i+1].y}
        stroke="#a3e635" strokeWidth="4" strokeLinecap="round"
        style={{ filter: 'drop-shadow(0 0 3px #84cc16)' }} />
    )
  }
  if (done && pattern.close) {
    const last = pattern.dots[n - 1]
    const first = pattern.dots[0]
    lines.push(<line key="close" x1={last.x} y1={last.y} x2={first.x} y2={first.y} stroke="#a3e635" strokeWidth="4" strokeLinecap="round" style={{ filter: 'drop-shadow(0 0 3px #84cc16)' }} />)
  }

  return (
    <GameLayout title="ドットつなぎ" color="bg-lime-500">
      <div className="flex flex-col items-center gap-3">
        <div className="flex justify-between w-full items-center">
          <span className="text-base font-bold text-gray-700">{pIdx + 1} / {PATTERNS.length}</span>
          <span className="text-sm text-gray-500">{connected}/{n}</span>
        </div>

        {done ? (
          <div className="bg-yellow-100 border-2 border-yellow-400 rounded-2xl px-6 py-3 text-center bounce-in w-full">
            <p className="text-3xl font-bold text-yellow-600">✨ {pattern.emoji} {pattern.name}！</p>
            <p className="text-sm text-gray-500 mt-1">できた！</p>
          </div>
        ) : (
          <div className="bg-lime-50 border border-lime-200 rounded-xl px-4 py-2 w-full text-center">
            <p className="text-base font-bold text-lime-700">
              {connected === 0 ? `🔢「1」から タップしよう！` : `「${connected + 1}」を タップ！`}
            </p>
          </div>
        )}

        <div className="w-full bg-white rounded-2xl border-2 border-lime-200 shadow overflow-hidden">
          <svg viewBox="0 0 300 300" className="w-full">
            {done && (
              <rect x="0" y="0" width="300" height="300" fill="url(#star)" opacity="0.05" />
            )}
            {lines}
            {pattern.dots.map((d, i) => {
              const tapped = i < connected
              const isNext = i === connected
              const isWrong = wrong === i
              return (
                <g key={i} onClick={() => !tapped && tap(i)} style={{ cursor: !tapped ? 'pointer' : 'default' }}>
                  <circle cx={d.x} cy={d.y} r={isNext ? 19 : 14}
                    fill={isWrong ? '#fee2e2' : tapped ? '#84cc16' : isNext ? '#d9f99d' : '#f0fdf4'}
                    stroke={isWrong ? '#ef4444' : isNext ? '#65a30d' : tapped ? '#65a30d' : '#a3e635'}
                    strokeWidth={isNext ? 3 : 2} />
                  {!tapped && (
                    <text x={d.x} y={d.y} textAnchor="middle" dominantBaseline="central"
                      fontSize={isNext ? "14" : "12"} fontWeight="bold"
                      fill={isNext ? '#3f6212' : '#4d7c0f'}>
                      {i + 1}
                    </text>
                  )}
                  {tapped && (
                    <text x={d.x} y={d.y} textAnchor="middle" dominantBaseline="central" fontSize="12" fill="white">✓</text>
                  )}
                </g>
              )
            })}
          </svg>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-lime-400 h-2 rounded-full transition-all" style={{ width: `${(connected / n) * 100}%` }} />
        </div>

        <div className="flex gap-2 w-full">
          <button onClick={() => changePattern(-1)} className="py-3 px-4 text-base font-bold bg-gray-200 text-gray-600 rounded-xl active:scale-95">←</button>
          <button onClick={reset} className="flex-1 py-3 text-base font-bold bg-gray-200 text-gray-600 rounded-xl active:scale-95">やりなおし</button>
          <button onClick={() => changePattern(1)} className="py-3 px-4 text-base font-bold bg-lime-400 text-white rounded-xl active:scale-95">→</button>
        </div>
      </div>
    </GameLayout>
  )
}
