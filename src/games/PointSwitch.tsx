import { useEffect, useState } from 'react'
import { GameLayout } from '../components/GameLayout'
import { Confetti } from '../components/Confetti'

const GRAD = 'linear-gradient(135deg, #10b981, #047857)'
const TITLE = 'ポイント きりかえ'
const SAVE_KEY = 'densha_switch_best' // { "ステージ番号": いちばん多い ただしく とどけた かず }
const TRAINS = 8 // 1回で はしる でんしゃの かず

// 分かれ道の だんの かず。えきは 2の だん数じょう（2・4・8）
const STAGES = [
  { depth: 1, label: 'えき 2つ' },
  { depth: 2, label: 'えき 4つ' },
  { depth: 3, label: 'えき 8つ' },
]

// えきの しるし。色だけで見分けなくてよいように、形も変える
const MARKS = [
  { name: 'あか', color: '#ef4444', shape: 'circle' },
  { name: 'あお', color: '#3b82f6', shape: 'square' },
  { name: 'きいろ', color: '#eab308', shape: 'triangle' },
  { name: 'みどり', color: '#22c55e', shape: 'star' },
  { name: 'むらさき', color: '#a855f7', shape: 'diamond' },
  { name: 'オレンジ', color: '#f97316', shape: 'heart' },
  { name: 'みずいろ', color: '#06b6d4', shape: 'cross' },
  { name: 'ピンク', color: '#ec4899', shape: 'moon' },
] as const

function loadBest(): Record<string, number> {
  try {
    const v = JSON.parse(localStorage.getItem(SAVE_KEY) || '{}')
    return v && typeof v === 'object' ? v : {}
  } catch { return {} }
}
function saveBest(v: Record<string, number>) {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(v)) } catch { /* 保存できなくても遊べる */ }
}

// 分かれ道は 上から順に番号を ふる（0 がいちばん上。k の下は 2k+1 と 2k+2）。false＝ひだり、true＝みぎ
function routeOf(depth: number, sw: boolean[]): { nodes: number[]; leaf: number } {
  const nodes: number[] = []
  let k = 0
  for (let d = 0; d < depth; d++) { nodes.push(k); k = 2 * k + (sw[k] ? 2 : 1) }
  return { nodes, leaf: k - (2 ** depth - 1) }
}

const VB_W = 360
const TOP = 46
const ROW_H = 92
const nodeX = (k: number) => {
  const d = Math.floor(Math.log2(k + 1))
  const pos = k - (2 ** d - 1)
  return (VB_W / 2 ** d) * (pos + 0.5)
}
const nodeY = (k: number) => TOP + ROW_H * Math.floor(Math.log2(k + 1))

type Phase = 'select' | 'set' | 'run' | 'judge' | 'done'

export function PointSwitch() {
  const [phase, setPhase] = useState<Phase>('select')
  const [stage, setStage] = useState(0)
  const [sw, setSw] = useState<boolean[]>([])
  const [order, setOrder] = useState<number[]>([]) // 各でんしゃの いきさき（えきの番号）
  const [n, setN] = useState(0) // 何両目か
  const [ok, setOk] = useState(0)
  const [step, setStep] = useState(0) // はしっている ときの いま何だん目か
  const [best, setBest] = useState(loadBest)
  const [newBest, setNewBest] = useState(false)

  const depth = STAGES[stage].depth
  const leaves = 2 ** depth
  const target = order[n]
  const route = routeOf(depth, sw)
  // 5だい いじょう とどけた つぎの えきの かずが あく
  let unlocked = 1
  while (unlocked < STAGES.length && (best[String(unlocked)] ?? 0) >= 5) unlocked++

  function start(s: number) {
    const L = 2 ** STAGES[s].depth
    const o = Array.from({ length: TRAINS }, () => Math.floor(Math.random() * L))
    setStage(s); setOrder(o); setN(0); setOk(0); setNewBest(false)
    setSw(Array.from({ length: L - 1 }, () => Math.random() < 0.5))
    setStep(0); setPhase('set')
  }

  function flip(k: number) {
    if (phase !== 'set') return
    const next = sw.slice(); next[k] = !next[k]; setSw(next)
  }

  // しゅっぱつ → 1だんずつ進み、えきに着いたら はんてい → すこし見せてから つぎの でんしゃへ
  useEffect(() => {
    if (phase !== 'run') return
    const id = setTimeout(() => {
      if (step < depth) { setStep(step + 1); return }
      if (route.leaf === target) setOk(ok + 1)
      setPhase('judge')
    }, 420)
    return () => clearTimeout(id)
  }, [phase, step, depth, route.leaf, target, ok])

  useEffect(() => {
    if (phase !== 'judge') return
    const id = setTimeout(() => {
      if (n + 1 >= TRAINS) {
        const key = String(stage + 1)
        const prev = best[key]
        if (prev === undefined || ok > prev) {
          const nb = { ...best, [key]: ok }
          setBest(nb); saveBest(nb); setNewBest(prev !== undefined)
        }
        setPhase('done')
      } else { setN(n + 1); setStep(0); setPhase('set') }
    }, 1300)
    return () => clearTimeout(id)
  }, [phase, n, ok, stage, best])

  if (phase === 'select') return (
    <GameLayout title={TITLE} gradient={GRAD}>
      <div className="flex flex-col items-center gap-4 pt-2">
        <svg viewBox="0 0 120 70" className="w-32 h-20" aria-hidden="true">
          <path d="M60 6 V30 L24 62" stroke="#475569" strokeWidth={6} fill="none" strokeLinecap="round" />
          <path d="M60 30 L96 62" stroke="#cbd5e1" strokeWidth={6} fill="none" strokeLinecap="round" />
          <circle cx={60} cy={30} r={9} fill="#fff" stroke="#047857" strokeWidth={3} />
          <Mark i={0} x={24} y={62} size={9} />
          <Mark i={1} x={96} y={62} size={9} />
        </svg>
        <p className="text-xl font-black text-center text-gray-700 leading-snug">
          ポイントを きりかえて<br />でんしゃを えきに とどけよう
        </p>
        <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-4 w-full text-sm font-bold text-emerald-900 leading-relaxed">
          <p>でんしゃの まえに いきさきの しるしが あるよ。</p>
          <p>まるい ポイントを タップすると、すすむ みちが みぎ・ひだりに かわるよ。</p>
          <p>おなじ しるしの えきまで みちが つながったら「しゅっぱつ」！ {TRAINS}だい はしるよ。</p>
        </div>
        <p className="text-sm font-bold text-gray-500 self-start">えきの かずを えらんでね</p>
        <div className="grid grid-cols-3 gap-2 w-full">
          {STAGES.map((s, k) => {
            const b = best[String(k + 1)]
            const open = k < unlocked
            return (
              <button key={k} onClick={() => open && start(k)} disabled={!open}
                aria-label={`${s.label}${open ? '' : '（まだ）'}`}
                className={`py-4 rounded-2xl flex flex-col items-center justify-center font-black active:scale-95 border-2 ${
                  b !== undefined ? 'bg-emerald-500 border-emerald-600 text-white'
                    : open ? 'bg-white border-emerald-400 text-emerald-700' : 'bg-gray-100 border-gray-200 text-gray-300'}`}>
                <span className="text-lg leading-none">{s.label}</span>
                <span className="text-xs mt-1 leading-none">{b !== undefined ? `さいこう ${b}/${TRAINS}` : open ? 'あそべるよ' : 'まだ'}</span>
              </button>
            )
          })}
        </div>
        <p className="text-xs font-bold text-gray-500 text-center">
          {TRAINS}だいの うち 5だい いじょう とどけると、つぎの えきの かずが あくよ。
        </p>
      </div>
    </GameLayout>
  )

  const VB_H = TOP + ROW_H * depth + 46
  const routeSet = new Set(route.nodes)
  // はしっている でんしゃの いち
  const trainPos = (() => {
    if (phase === 'set') return { x: VB_W / 2, y: 14 }
    const s = Math.min(step, depth)
    if (s < depth) return { x: nodeX(route.nodes[s]), y: nodeY(route.nodes[s]) }
    return { x: (VB_W / leaves) * (route.leaf + 0.5), y: TOP + ROW_H * depth }
  })()
  const hit = route.leaf === target

  return (
    <GameLayout title={TITLE} gradient={GRAD} isPlaying={phase !== 'done'} hideAd>
      <Confetti active={phase === 'done' && ok >= 5} />
      <div className="flex flex-col gap-3 pt-1">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-sm font-black">{STAGES[stage].label}</span>
          <span className="text-sm font-bold text-gray-600">{Math.min(n + 1, TRAINS)} / {TRAINS}だいめ</span>
          <span className="ml-auto text-sm font-black text-emerald-700">とどけた {ok}</span>
        </div>
        {phase !== 'done' && (
          <div className="flex items-center gap-2 bg-white rounded-2xl border-2 border-gray-100 px-3 py-2">
            <svg viewBox="-16 -16 32 32" className="w-9 h-9" aria-hidden="true"><Mark i={target} x={0} y={0} size={12} /></svg>
            <p className="text-base font-black text-gray-700">{MARKS[target].name}の えきへ いく でんしゃ</p>
          </div>
        )}

        {phase !== 'done' && (
          <svg viewBox={`0 0 ${VB_W} ${VB_H}`} className="w-full select-none touch-manipulation" role="img" aria-label="ポイントと えきの せんろ" data-target={target} data-depth={depth}>
            <line x1={VB_W / 2} y1={4} x2={VB_W / 2} y2={TOP} stroke="#475569" strokeWidth={7} strokeLinecap="round" />
            {Array.from({ length: leaves - 1 }, (_, k) => k).map((k) => {
              const kids = [2 * k + 1, 2 * k + 2]
              return kids.map((c, side) => {
                const isLeaf = c >= leaves - 1
                const x2 = isLeaf ? (VB_W / leaves) * (c - (leaves - 1) + 0.5) : nodeX(c)
                const y2 = isLeaf ? TOP + ROW_H * depth : nodeY(c)
                const on = routeSet.has(k) && sw[k] === (side === 1)
                return <line key={`${k}-${side}`} x1={nodeX(k)} y1={nodeY(k)} x2={x2} y2={y2}
                  stroke={on ? '#475569' : '#e2e8f0'} strokeWidth={7} strokeLinecap="round" />
              })
            })}
            {Array.from({ length: leaves }, (_, j) => (
              <g key={j}>
                <rect x={(VB_W / leaves) * (j + 0.5) - 19} y={TOP + ROW_H * depth + 4} width={38} height={38} rx={8}
                  fill={phase === 'judge' && j === route.leaf ? (hit ? '#bbf7d0' : '#fecaca') : '#fff'} stroke="#cbd5e1" strokeWidth={2} />
                <Mark i={j} x={(VB_W / leaves) * (j + 0.5)} y={TOP + ROW_H * depth + 23} size={11} />
              </g>
            ))}
            {Array.from({ length: leaves - 1 }, (_, k) => (
              <g key={`p${k}`} data-k={k} data-sw={sw[k] ? 1 : 0} onClick={() => flip(k)} className={phase === 'set' ? 'cursor-pointer' : ''}>
                {/* タップしやすいよう、見た目より大きい 当たり判定 */}
                <circle cx={nodeX(k)} cy={nodeY(k)} r={28} fill="transparent" />
                <circle cx={nodeX(k)} cy={nodeY(k)} r={17} fill="#fff" stroke={routeSet.has(k) ? '#047857' : '#94a3b8'} strokeWidth={4} />
                <path d={sw[k] ? 'M-6 -4 L6 6' : 'M6 -4 L-6 6'} transform={`translate(${nodeX(k)},${nodeY(k)})`}
                  stroke={routeSet.has(k) ? '#047857' : '#94a3b8'} strokeWidth={4} strokeLinecap="round" />
              </g>
            ))}
            <g className="pointer-events-none" style={{ transform: `translate(${trainPos.x}px, ${trainPos.y}px)`, transition: 'transform .4s ease-in-out' }}>
              <rect x={-17} y={-12} width={34} height={22} rx={6} fill="#fff" stroke="#334155" strokeWidth={2.5} />
              <Mark i={target} x={0} y={-1} size={8} />
            </g>
          </svg>
        )}

        {phase === 'set' && (
          <button onClick={() => { setStep(0); setPhase('run') }}
            className="w-full py-4 text-xl font-black text-white rounded-2xl shadow-lg active:scale-95" style={{ background: GRAD }}>
            しゅっぱつ！
          </button>
        )}
        {phase === 'judge' && (
          <div className={`rounded-2xl px-5 py-3 text-center bounce-in shadow ${hit ? 'bg-emerald-500' : 'bg-slate-500'}`}>
            <p className="text-xl font-black text-white">{hit ? 'とうちゃく！' : `${MARKS[route.leaf].name}の えきに ついちゃった`}</p>
          </div>
        )}
        {phase === 'done' && (
          <>
            <div className="rounded-2xl px-5 py-5 text-center bounce-in shadow-lg" style={{ background: GRAD }}>
              <p className="text-2xl font-black text-white">{TRAINS}だいの うち {ok}だい とどけたよ</p>
              <p className="text-sm font-bold text-white/90 mt-1">
                {ok === TRAINS ? 'ぜんぶ ただしい えきに ついたよ！' : ok >= 5 ? 'よく できました！' : 'ポイントの むきを よく みてね'}
                {newBest ? '（じぶんの さいこう！）' : ''}
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => start(stage)}
                className="flex-1 py-4 text-lg font-black rounded-2xl border-2 border-emerald-400 text-emerald-700 bg-white active:scale-95">
                もういちど
              </button>
              <button onClick={() => setPhase('select')}
                className="flex-1 py-4 text-lg font-black text-white rounded-2xl shadow-lg active:scale-95" style={{ background: GRAD }}>
                えきの かずを えらぶ
              </button>
            </div>
          </>
        )}
      </div>
    </GameLayout>
  )
}

// えきの しるし（色と形の組み合わせ）
function Mark({ i, x, y, size }: { i: number; x: number; y: number; size: number }) {
  const m = MARKS[i]
  const s = size
  const shape = (() => {
    switch (m.shape) {
      case 'circle': return <circle r={s} />
      case 'square': return <rect x={-s} y={-s} width={2 * s} height={2 * s} rx={2} />
      case 'triangle': return <path d={`M0 ${-s} L${s} ${s * 0.85} L${-s} ${s * 0.85} Z`} />
      case 'star': return <path d={Array.from({ length: 10 }, (_, k) => {
        const r = k % 2 ? s * 0.45 : s, a = (Math.PI / 5) * k - Math.PI / 2
        return `${k ? 'L' : 'M'}${(r * Math.cos(a)).toFixed(1)} ${(r * Math.sin(a)).toFixed(1)}`
      }).join(' ') + ' Z'} />
      case 'diamond': return <path d={`M0 ${-s} L${s} 0 L0 ${s} L${-s} 0 Z`} />
      case 'heart': return <path d={`M0 ${s * 0.9} C${-s * 1.4} ${-s * 0.1} ${-s * 0.5} ${-s * 1.1} 0 ${-s * 0.35} C${s * 0.5} ${-s * 1.1} ${s * 1.4} ${-s * 0.1} 0 ${s * 0.9} Z`} />
      case 'cross': return <path d={`M${-s * 0.35} ${-s} H${s * 0.35} V${-s * 0.35} H${s} V${s * 0.35} H${s * 0.35} V${s} H${-s * 0.35} V${s * 0.35} H${-s} V${-s * 0.35} H${-s * 0.35} Z`} />
      default: return <path d={`M0 ${-s} A${s} ${s} 0 0 0 0 ${s} A${s * 0.55} ${s} 0 0 1 0 ${-s} Z`} transform={`translate(${s * 0.25},0)`} /> // つき
    }
  })()
  return <g transform={`translate(${x},${y})`} fill={m.color}>{shape}</g>
}
