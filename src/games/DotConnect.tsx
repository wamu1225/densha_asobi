import React, { useState } from 'react'
import { GameLayout } from '../components/GameLayout'

const GRAD = 'linear-gradient(135deg, #bef264, #84cc16)'

interface DotPattern { name: string; emoji: string; dots: { x: number; y: number }[]; close?: boolean }

// ドット数昇順（難易度順）に並べる
// 2026-06-11 成立性修正: 完成形を描画して「見て分かる絵」になるよう6問を再設計（DoD=完成形シート検証）
const PATTERNS: DotPattern[] = [
  { name: 'さんかく', emoji: '🔺', close: true,   // 3点
    dots: [{ x:150,y:35 },{ x:255,y:240 },{ x:45,y:240 }] },
  { name: 'ほうせき', emoji: '💎', close: true,   // 5点（2026-06-11 追加）
    dots: [{ x:95,y:70 },{ x:205,y:70 },{ x:265,y:130 },{ x:150,y:255 },{ x:35,y:130 }] },
  { name: 'かみなり', emoji: '⚡', close: true,    // 6点 ※線ジグザグ→面のいなずま形に再設計
    dots: [{ x:180,y:25 },{ x:80,y:155 },{ x:135,y:155 },{ x:105,y:275 },{ x:215,y:125 },{ x:160,y:125 }] },
  { name: 'おうち',   emoji: '🏠', close: true,   // 7点
    dots: [{ x:150,y:35 },{ x:262,y:130 },{ x:230,y:130 },{ x:230,y:245 },{ x:70,y:245 },{ x:70,y:130 },{ x:38,y:130 }] },
  { name: 'ふね',     emoji: '⛵', close: true,   // 7点（追加）ほ＋せんたい
    dots: [{ x:40,y:190 },{ x:70,y:240 },{ x:230,y:240 },{ x:260,y:190 },{ x:190,y:190 },{ x:150,y:60 },{ x:110,y:190 }] },
  { name: 'やじるし', emoji: '➡️', close: true,   // 7点（追加）
    dots: [{ x:40,y:130 },{ x:170,y:130 },{ x:170,y:85 },{ x:265,y:150 },{ x:170,y:215 },{ x:170,y:170 },{ x:40,y:170 }] },
  { name: 'ハート',   emoji: '❤️', close: true,   // 8点
    dots: [{ x:150,y:255 },{ x:55,y:130 },{ x:55,y:82 },{ x:98,y:48 },{ x:150,y:88 },{ x:202,y:48 },{ x:245,y:82 },{ x:245,y:130 }] },
  { name: 'つき',     emoji: '🌙', close: true,   // 8点（追加）みかづき
    dots: [{ x:190,y:40 },{ x:105,y:85 },{ x:85,y:160 },{ x:120,y:230 },{ x:200,y:260 },{ x:150,y:210 },{ x:135,y:150 },{ x:150,y:90 }] },
  { name: 'くるま',   emoji: '🚗', close: true,   // 8点（追加）よこむきのくるま
    dots: [{ x:25,y:195 },{ x:40,y:140 },{ x:95,y:135 },{ x:125,y:90 },{ x:195,y:90 },{ x:225,y:135 },{ x:275,y:145 },{ x:280,y:195 }] },
  { name: 'ねこ',     emoji: '🐱', close: true,   // 8点（追加）みみつきのかお
    dots: [{ x:60,y:175 },{ x:55,y:105 },{ x:95,y:40 },{ x:150,y:80 },{ x:205,y:40 },{ x:245,y:105 },{ x:240,y:175 },{ x:150,y:245 }] },
  { name: 'はな',     emoji: '🌷', close: true,   // 8点（追加）チューリップ
    dots: [{ x:70,y:160 },{ x:60,y:70 },{ x:110,y:110 },{ x:150,y:55 },{ x:190,y:110 },{ x:240,y:70 },{ x:230,y:160 },{ x:150,y:215 }] },
  { name: 'とり',     emoji: '🐦', close: true,   // 8点 ※くちばし突出＋しっぽ上がりのあひる輪郭に再設計
    dots: [{ x:245,y:115 },{ x:210,y:85 },{ x:165,y:95 },{ x:70,y:90 },{ x:90,y:140 },{ x:140,y:195 },{ x:200,y:185 },{ x:228,y:150 }] },
  { name: 'きのこ',   emoji: '🍄', close: true,   // 9点 ※カサ下のひさし（くびれ）を作り電球見えを解消
    dots: [{ x:150,y:40 },{ x:215,y:65 },{ x:250,y:125 },{ x:190,y:140 },{ x:190,y:235 },{ x:110,y:235 },{ x:110,y:140 },{ x:50,y:125 },{ x:85,y:65 }] },
  { name: 'りんご',   emoji: '🍎', close: true,   // 9点（追加）うえのくぼみが目じるし
    dots: [{ x:150,y:75 },{ x:195,y:55 },{ x:245,y:105 },{ x:240,y:180 },{ x:195,y:240 },{ x:105,y:240 },{ x:60,y:180 },{ x:55,y:105 },{ x:105,y:55 }] },
  { name: 'ロケット', emoji: '🚀', close: true,   // 9点 ※先端・直胴・左右フィンを明確化
    dots: [{ x:150,y:25 },{ x:193,y:95 },{ x:193,y:190 },{ x:238,y:250 },{ x:178,y:235 },{ x:122,y:235 },{ x:62,y:250 },{ x:107,y:190 },{ x:107,y:95 }] },
  { name: 'さかな',   emoji: '🐟', close: true,   // 10点 ※輪郭一筆書き＋くびれ尾びれに再設計
    dots: [{ x:265,y:150 },{ x:215,y:100 },{ x:150,y:85 },{ x:95,y:115 },{ x:40,y:90 },{ x:70,y:150 },{ x:40,y:210 },{ x:95,y:185 },{ x:150,y:215 },{ x:215,y:200 }] },
  { name: 'ほし',     emoji: '⭐', close: true,   // 10点
    dots: [{ x:150,y:30 },{ x:188,y:112 },{ x:270,y:112 },{ x:205,y:170 },{ x:232,y:258 },{ x:150,y:208 },{ x:68,y:258 },{ x:95,y:170 },{ x:30,y:112 },{ x:112,y:112 }] },
  { name: 'でんしゃ', emoji: '🚃', close: true,   // 10点 ※前方スロープ＋細いえんとつ＋高い運転室で機関車らしさを明確化
    dots: [{ x:25,y:205 },{ x:55,y:140 },{ x:90,y:140 },{ x:84,y:72 },{ x:134,y:72 },{ x:128,y:140 },{ x:175,y:140 },{ x:175,y:70 },{ x:262,y:70 },{ x:262,y:205 }] },
  { name: 'ひこうき', emoji: '✈️', close: true,   // 12点（追加）うえからみたジェットき
    dots: [{ x:150,y:25 },{ x:175,y:110 },{ x:262,y:163 },{ x:258,y:198 },{ x:170,y:165 },{ x:195,y:250 },{ x:150,y:225 },{ x:105,y:250 },{ x:130,y:165 },{ x:42,y:198 },{ x:38,y:163 },{ x:125,y:110 }] },
  { name: 'たいよう', emoji: '☀️', close: true,   // 16点（追加・さいなん関）8ほうこうの光
    dots: [{ x:150,y:35 },{ x:174,y:93 },{ x:231,y:69 },{ x:207,y:126 },{ x:265,y:150 },{ x:207,y:174 },{ x:231,y:231 },{ x:174,y:207 },{ x:150,y:265 },{ x:126,y:207 },{ x:69,y:231 },{ x:93,y:174 },{ x:35,y:150 },{ x:93,y:126 },{ x:69,y:69 },{ x:126,y:93 }] },
]

const CLEARED_KEY = 'densha_dots_cleared'

export function DotConnect() {
  const [pIdx, setPIdx] = useState(0)
  const [connected, setConnected] = useState(0)
  const [done, setDone] = useState(false)
  const [wrong, setWrong] = useState<number | null>(null)
  // パターンごとのクリア記録（名前をキーに永続化）
  const [cleared, setCleared] = useState<Record<string, boolean>>(() => {
    try { return JSON.parse(localStorage.getItem(CLEARED_KEY) || '{}') } catch { return {} }
  })

  const pattern = PATTERNS[pIdx]
  const n = pattern.dots.length

  function tap(i: number) {
    if (i === connected) {
      const nx = connected + 1
      setConnected(nx)
      if (nx >= n) {
        setDone(true)
        const c = { ...cleared, [pattern.name]: true }
        setCleared(c)
        localStorage.setItem(CLEARED_KEY, JSON.stringify(c))
      }
    }
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
    <GameLayout title="ドットつなぎ" gradient={GRAD} isPlaying={connected > 0 && !done} hideAd={!done}>
      <div className="flex flex-col items-center gap-3">
        <div className="flex justify-between w-full">
          <span className="text-base font-bold text-gray-700">
            {pIdx + 1} / {PATTERNS.length}
            {cleared[pattern.name] && <span className="text-lime-600"> ✓</span>}
          </span>
          <span className="text-sm text-gray-500">{connected}/{n}</span>
        </div>

        {/* パターン選択（クリア済みは塗りつぶし） */}
        <div className="grid grid-cols-10 gap-1 w-full">
          {PATTERNS.map((p, i) => (
            <button key={p.name}
              onClick={() => { setPIdx(i); setConnected(0); setDone(false) }}
              aria-label={`${i + 1}ばんめのパターン`}
              className="aspect-square rounded-md text-[10px] font-bold border transition-colors"
              style={{
                background: cleared[p.name] ? '#84cc16' : 'white',
                color: cleared[p.name] ? 'white' : '#9ca3af',
                borderColor: i === pIdx ? '#65a30d' : '#e5e7eb',
                borderWidth: i === pIdx ? 2 : 1,
              }}>
              {i + 1}
            </button>
          ))}
        </div>

        {done ? (
          <div className="w-full rounded-2xl px-6 py-3 text-center bounce-in shadow-lg" style={{ background: 'linear-gradient(135deg,#fbbf24,#f59e0b)' }}>
            <p className="text-3xl font-black text-white">{pattern.emoji} {pattern.name}！</p>
          </div>
        ) : (
          <div className="bg-lime-50 border-2 border-lime-200 rounded-xl px-4 py-2 w-full text-center">
            <p className="text-base font-black text-lime-700">
              {connected === 0 ? `「1」からタップしよう！` : `「${connected + 1}」をタップ！`}
            </p>
          </div>
        )}

        <div className="w-full bg-white rounded-2xl border-2 border-lime-200 shadow-md overflow-hidden">
          {done && (
            <div className="bg-lime-50 text-center py-1 text-sm font-bold text-lime-700 border-b border-lime-200">
              かんせい！なんのえか わかった？
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
                  <circle cx={d.x} cy={d.y} r={isNext ? 24 : 18}
                    fill={isWrong ? '#fee2e2' : tapped ? '#84cc16' : isNext ? '#d9f99d' : 'white'}
                    stroke={isWrong ? '#ef4444' : isNext ? '#65a30d' : tapped ? '#65a30d' : '#a3e635'}
                    strokeWidth={isNext ? 3 : 2}
                    style={isNext ? { filter: 'drop-shadow(0 0 6px #84cc16)' } : {}} />
                  {!tapped && <text x={d.x} y={d.y} textAnchor="middle" dominantBaseline="central" fontSize={isNext ? "16" : "13"} fontWeight="800" fill={isNext ? '#3f6212' : '#6b7280'}>{i + 1}</text>}
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

        <p className="text-xs font-bold" style={{ color: 'var(--ink-sub)' }}>
          かんせいした え：{PATTERNS.filter(p => cleared[p.name]).length} / {PATTERNS.length}
        </p>
      </div>
    </GameLayout>
  )
}
