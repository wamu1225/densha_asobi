import React, { useState } from 'react'
import { GameLayout } from '../components/GameLayout'

const GRAD = 'linear-gradient(135deg, #bef264, #84cc16)'

interface DotPattern { name: string; emoji: string; dots: { x: number; y: number }[]; close?: boolean }

const PATTERNS: DotPattern[] = [
  { name: 'さんかく', emoji: '🔺', close: true, dots: [{ x:150,y:30 },{ x:260,y:240 },{ x:40,y:240 }] },
  { name: 'おうち', emoji: '🏠', close: false, dots: [{ x:150,y:30 },{ x:255,y:120 },{ x:225,y:120 },{ x:225,y:240 },{ x:75,y:240 },{ x:75,y:120 },{ x:45,y:120 },{ x:150,y:30 }] },
  { name: 'ほし', emoji: '⭐', close: true, dots: [{ x:150,y:25 },{ x:190,y:115 },{ x:285,y:115 },{ x:210,y:175 },{ x:240,y:265 },{ x:150,y:210 },{ x:60,y:265 },{ x:90,y:175 },{ x:15,y:115 },{ x:110,y:115 }] },
  { name: 'さかな', emoji: '🐟', close: false, dots: [{ x:250,y:80 },{ x:290,y:40 },{ x:290,y:130 },{ x:250,y:110 },{ x:160,y:100 },{ x:80,y:150 },{ x:160,y:200 },{ x:250,y:190 },{ x:290,y:130 }] },
  { name: 'ハート', emoji: '❤️', close: true, dots: [{ x:150,y:260 },{ x:55,y:130 },{ x:55,y:80 },{ x:100,y:45 },{ x:150,y:85 },{ x:200,y:45 },{ x:245,y:80 },{ x:245,y:130 }] },
  { name: 'ロケット', emoji: '🚀', close: false, dots: [{ x:150,y:20 },{ x:200,y:90 },{ x:200,y:190 },{ x:240,y:250 },{ x:200,y:230 },{ x:150,y:260 },{ x:100,y:230 },{ x:60,y:250 },{ x:100,y:190 },{ x:100,y:90 },{ x:150,y:20 }] },
  { name: 'かみなり', emoji: '⚡', close: false, dots: [{ x:200,y:20 },{ x:120,y:130 },{ x:170,y:130 },{ x:90,y:270 },{ x:175,y:155 },{ x:130,y:155 },{ x:200,y:20 }] },
  { name: 'きのこ', emoji: '🍄', close: false, dots: [{ x:150,y:270 },{ x:110,y:270 },{ x:110,y:190 },{ x:60,y:150 },{ x:50,y:100 },{ x:80,y:50 },{ x:150,y:30 },{ x:220,y:50 },{ x:250,y:100 },{ x:240,y:150 },{ x:190,y:190 },{ x:190,y:270 },{ x:150,y:270 }] },
  { name: 'ちょうちょ', emoji: '🦋', close: false, dots: [{ x:150,y:150 },{ x:80,y:80 },{ x:30,y:60 },{ x:40,y:130 },{ x:100,y:170 },{ x:150,y:150 },{ x:200,y:170 },{ x:260,y:130 },{ x:270,y:60 },{ x:220,y:80 },{ x:150,y:150 },{ x:120,y:220 },{ x:100,y:260 },{ x:150,y:250 },{ x:200,y:260 },{ x:180,y:220 },{ x:150,y:150 }] },
  { name: 'とり', emoji: '🐦', close: false, dots: [{ x:100,y:200 },{ x:100,y:120 },{ x:80,y:80 },{ x:120,y:60 },{ x:160,y:80 },{ x:160,y:60 },{ x:200,y:50 },{ x:240,y:80 },{ x:220,y:120 },{ x:200,y:160 },{ x:160,y:180 },{ x:100,y:200 },{ x:80,y:250 },{ x:130,y:270 }] },
]

export function DotConnect() {
  const [pIdx, setPIdx] = useState(0)
  const [connected, setConnected] = useState(0)
  const [done, setDone] = useState(false)
  const [wrong, setWrong] = useState<number | null>(null)

  const pattern = PATTERNS[pIdx]
  const n = pattern.dots.length

  function tap(i: number) {
    if (i === connected) { const nx = connected + 1; setConnected(nx); if (nx >= n) setDone(true) }
    else { setWrong(i); setTimeout(() => setWrong(null), 400) }
  }

  function changePattern(delta: number) { setPIdx(i => (i + delta + PATTERNS.length) % PATTERNS.length); setConnected(0); setDone(false) }
  function reset() { setConnected(0); setDone(false) }

  const lines: React.ReactElement[] = []
  for (let i = 0; i < connected - 1; i++) {
    lines.push(<line key={`l${i}`} x1={pattern.dots[i].x} y1={pattern.dots[i].y} x2={pattern.dots[i + 1].x} y2={pattern.dots[i + 1].y} stroke="#a3e635" strokeWidth="5" strokeLinecap="round" style={{ filter: 'drop-shadow(0 0 4px #84cc16)' }} />)
  }
  if (done && pattern.close) {
    const last = pattern.dots[n - 1], first = pattern.dots[0]
    lines.push(<line key="close" x1={last.x} y1={last.y} x2={first.x} y2={first.y} stroke="#a3e635" strokeWidth="5" strokeLinecap="round" style={{ filter: 'drop-shadow(0 0 4px #84cc16)' }} />)
  }

  return (
    <GameLayout title="ドットつなぎ" gradient={GRAD}>
      <div className="flex flex-col items-center gap-3">
        <div className="flex justify-between w-full">
          <span className="text-base font-bold text-gray-700">{pIdx + 1} / {PATTERNS.length}</span>
          <span className="text-sm text-gray-500">{connected}/{n}</span>
        </div>

        {done ? (
          <div className="w-full rounded-2xl px-6 py-3 text-center bounce-in shadow-lg" style={{ background: 'linear-gradient(135deg,#fbbf24,#f59e0b)' }}>
            <p className="text-3xl font-black text-white">✨ {pattern.emoji} {pattern.name}！</p>
          </div>
        ) : (
          <div className="bg-lime-50 border-2 border-lime-200 rounded-xl px-4 py-2 w-full text-center">
            <p className="text-base font-black text-lime-700">
              {connected === 0 ? `🔢「1」からタップしよう！` : `「${connected + 1}」をタップ！`}
            </p>
          </div>
        )}

        <div className="w-full bg-white rounded-2xl border-2 border-lime-200 shadow-md overflow-hidden">
          {done && (
            <div className="bg-lime-50 text-center py-1 text-sm font-bold text-lime-700 border-b border-lime-200">
              🎉 かんせい！なんのえかわかった？
            </div>
          )}
          <svg viewBox="0 0 300 300" className="w-full">
            <defs>
              <radialGradient id="dotGrad" cx="40%" cy="35%">
                <stop offset="0%" stopColor="#f0fdf4" /><stop offset="100%" stopColor="#dcfce7" />
              </radialGradient>
            </defs>
            <rect width="300" height="300" fill="url(#dotGrad)" />
            {lines}
            {pattern.dots.map((d, i) => {
              const tapped = i < connected; const isNext = i === connected; const isWrong = wrong === i
              return (
                <g key={i} onClick={() => !tapped && tap(i)} style={{ cursor: !tapped ? 'pointer' : 'default' }}>
                  <circle cx={d.x} cy={d.y} r={isNext ? 20 : 14}
                    fill={isWrong ? '#fee2e2' : tapped ? '#84cc16' : isNext ? '#d9f99d' : 'white'}
                    stroke={isWrong ? '#ef4444' : isNext ? '#65a30d' : tapped ? '#65a30d' : '#a3e635'}
                    strokeWidth={isNext ? 3 : 2}
                    style={isNext ? { filter: 'drop-shadow(0 0 6px #84cc16)' } : {}} />
                  {!tapped && <text x={d.x} y={d.y} textAnchor="middle" dominantBaseline="central" fontSize={isNext ? "14" : "11"} fontWeight="800" fill={isNext ? '#3f6212' : '#6b7280'}>{i + 1}</text>}
                  {tapped && <text x={d.x} y={d.y} textAnchor="middle" dominantBaseline="central" fontSize="12" fill="white">✓</text>}
                </g>
              )
            })}
          </svg>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
          <div className="h-2.5 rounded-full transition-all" style={{ width: `${(connected / n) * 100}%`, background: GRAD }} />
        </div>

        <div className="flex gap-2 w-full">
          <button onClick={() => changePattern(-1)} className="py-3 px-4 font-bold bg-white text-gray-600 rounded-xl shadow border border-gray-200 active:scale-95">←</button>
          <button onClick={reset} className="flex-1 py-3 text-base font-bold bg-white text-gray-600 rounded-xl shadow border border-gray-200 active:scale-95">やりなおし</button>
          <button onClick={() => changePattern(1)} className="py-3 px-4 font-bold text-white rounded-xl shadow active:scale-95" style={{ background: GRAD }}>→</button>
        </div>
      </div>
    </GameLayout>
  )
}
