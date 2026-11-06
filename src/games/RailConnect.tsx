import { useEffect, useState } from 'react'
import { GameLayout } from '../components/GameLayout'
import { Confetti } from '../components/Confetti'
import { N, E, S, W, STAGES, newBoard, rotate, traceRoute, type Board } from './railLogic'

const GRAD = 'linear-gradient(135deg, #0ea5e9, #0369a1)'
const TITLE = 'せんろ つなぎ'
const SAVE_KEY = 'densha_rail_cleared' // { "ステージ番号": いちばん少ない まわした回数 }

function loadCleared(): Record<string, number> {
  try {
    const v = JSON.parse(localStorage.getItem(SAVE_KEY) || '{}')
    return v && typeof v === 'object' ? v : {}
  } catch { return {} }
}
function saveCleared(v: Record<string, number>) {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(v)) } catch { /* 保存できなくても遊べる */ }
}

// 1マスの大きさ。左右に駅の分だけ すきまを空ける
const T = 60
const SIDE = 26

// 線路の形は「まっすぐ（上下）」か「カーブ（上と右）」の2つで、それを何回まわしたかで向きを表す
// まわした回数は 4 で割らずに数え続ける（いつも右回りに回って見えるように）
function toShape(m: number): { curve: boolean; turns: number } {
  if (m === (N | S)) return { curve: false, turns: 0 }
  if (m === (E | W)) return { curve: false, turns: 1 }
  let t = 0, x = N | E
  while (x !== m && t < 4) { x = rotate(x); t++ }
  return { curve: true, turns: t }
}

type Phase = 'select' | 'play' | 'won'

export function RailConnect() {
  const [phase, setPhase] = useState<Phase>('select')
  const [stage, setStage] = useState(0)
  const [board, setBoard] = useState<Board | null>(null)
  const [turns, setTurns] = useState<number[]>([])
  const [taps, setTaps] = useState(0)
  const [cleared, setCleared] = useState(loadCleared)
  const [newBest, setNewBest] = useState(false)
  const [run, setRun] = useState<number[]>([]) // 電車が走る マスの順
  const [runStep, setRunStep] = useState(-1)

  const unlocked = Math.min(STAGES.length, Object.keys(cleared).length + 1)

  function start(s: number) {
    const b = newBoard(STAGES[s])
    setStage(s); setBoard(b)
    setTurns(b.tiles.map((m) => (m ? toShape(m).turns : 0)))
    setTaps(0); setNewBest(false); setRun([]); setRunStep(-1)
    setPhase('play')
  }

  function tap(i: number) {
    if (!board || phase !== 'play' || !board.tiles[i] || board.locked[i]) return
    const tiles = board.tiles.slice()
    tiles[i] = rotate(tiles[i])
    const nt = turns.slice(); nt[i] += 1
    const b = { ...board, tiles }
    const u = taps + 1
    setBoard(b); setTurns(nt); setTaps(u)
    const r = traceRoute(b)
    if (r.ok) {
      const key = String(stage + 1)
      const prev = cleared[key]
      if (prev === undefined || u < prev) {
        const next = { ...cleared, [key]: u }
        setCleared(next); saveCleared(next)
        setNewBest(prev !== undefined)
      }
      setRun(r.cells); setRunStep(0)
      setPhase('won')
    }
  }

  // つながったら、電車が左の駅から右の駅まで1マスずつ走る
  useEffect(() => {
    if (runStep < 0 || runStep >= run.length + 1) return
    const id = setTimeout(() => setRunStep(runStep + 1), 260)
    return () => clearTimeout(id)
  }, [runStep, run.length])

  if (phase === 'select' || !board) return (
    <GameLayout title={TITLE} gradient={GRAD}>
      <div className="flex flex-col items-center gap-4 pt-2">
        <svg viewBox="0 0 120 60" className="w-32 h-16" aria-hidden="true">
          <Station x={14} y={30} color="#0369a1" />
          <g transform="translate(60,30)"><Track curve={false} turns={1} /></g>
          <Station x={106} y={30} color="#16a34a" />
        </svg>
        <p className="text-xl font-black text-center text-gray-700 leading-snug">
          せんろを まわして<br />えきと えきを つなごう
        </p>
        <div className="bg-sky-50 border-2 border-sky-200 rounded-2xl p-4 w-full text-sm font-bold text-sky-900 leading-relaxed">
          <p>マスを タップすると せんろが くるっと まわるよ。</p>
          <p>ひだりの えきから みぎの えきまで、せんろが ひとつに つながったら でんしゃが はしるよ。</p>
          <p>ねじの ついた マスは うごかないよ。ヒントに してね。</p>
        </div>
        <p className="text-sm font-bold text-gray-500 self-start">ステージを えらんでね</p>
        <div className="grid grid-cols-4 gap-2 w-full">
          {STAGES.map((s, k) => {
            const best = cleared[String(k + 1)]
            const open = k < unlocked
            return (
              <button key={k} onClick={() => open && start(k)} disabled={!open}
                aria-label={`ステージ${k + 1}${open ? '' : '（まだ）'}`}
                className={`aspect-square rounded-2xl flex flex-col items-center justify-center font-black active:scale-95 border-2 ${
                  best !== undefined ? 'bg-sky-500 border-sky-600 text-white'
                    : open ? 'bg-white border-sky-400 text-sky-700' : 'bg-gray-100 border-gray-200 text-gray-300'}`}>
                <span className="text-2xl leading-none">{k + 1}</span>
                <span className="text-[11px] mt-1 leading-none">
                  {best !== undefined ? `${best}かい` : `${s.cols}×${s.rows}`}
                </span>
              </button>
            )
          })}
        </div>
        <p className="text-xs font-bold text-gray-500 text-center">
          クリアすると つぎの ステージが あくよ。すくない かいすうで つなげたら きろくに のこるよ。
        </p>
      </div>
    </GameLayout>
  )

  const { cols, rows } = board
  const VB_W = SIDE * 2 + cols * T
  const VB_H = rows * T
  const tx = (i: number) => SIDE + (i % cols) * T + T / 2
  const ty = (i: number) => Math.floor(i / cols) * T + T / 2
  const runSet = new Set(run.slice(0, Math.max(0, runStep)))
  const trainAt = phase === 'won' && runStep >= 0
    ? runStep < run.length ? { x: tx(run[runStep]), y: ty(run[runStep]) } : { x: VB_W - SIDE / 2, y: board.goalRow * T + T / 2 }
    : { x: SIDE / 2, y: board.startRow * T + T / 2 }

  return (
    <GameLayout title={TITLE} gradient={GRAD} isPlaying={phase === 'play'} hideAd>
      <Confetti active={phase === 'won' && runStep > run.length} />
      <div className="flex flex-col gap-3 pt-1">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-sm font-black">ステージ {stage + 1}</span>
          <span className="text-sm font-bold text-gray-600">まわした かず {taps}</span>
          {phase === 'play' && (
            <button onClick={() => start(stage)}
              className="ml-auto px-4 py-2 rounded-xl text-sm font-black border-2 border-sky-400 text-sky-700 bg-white active:scale-95">
              べつの もんだい
            </button>
          )}
        </div>
        <p className="text-sm font-bold text-gray-600 min-h-[1.25rem]">
          {phase === 'play' ? 'ひだりの えきから みぎの えきまで つなごう' : ''}
        </p>

        <svg viewBox={`0 0 ${VB_W} ${VB_H}`} className="w-full select-none touch-manipulation" role="img" aria-label="せんろの マスの ばん" data-cols={cols} data-start={board.startRow} data-goal={board.goalRow}>
          {board.tiles.map((m, i) => {
            const x = SIDE + (i % cols) * T, y = Math.floor(i / cols) * T
            const lock = board.locked[i]
            return (
              <g key={i} data-m={m} data-lock={lock ? 1 : 0} onClick={() => tap(i)} className={m && !lock && phase === 'play' ? 'cursor-pointer' : ''}>
                <rect x={x + 1.5} y={y + 1.5} width={T - 3} height={T - 3} rx={8}
                  fill={runSet.has(i) ? '#fef3c7' : lock ? '#d6d3d1' : m ? '#e7e5e4' : '#f5f5f4'} />
                {m !== 0 && (
                  <g transform={`translate(${x + T / 2},${y + T / 2})`}>
                    <g style={{ transform: `rotate(${turns[i] * 90}deg)`, transition: 'transform .18s ease-out' }}>
                      <Track curve={toShape(m).curve} turns={0} />
                    </g>
                    {lock && <Bolt />}
                  </g>
                )}
              </g>
            )
          })}
          <Station x={SIDE / 2} y={board.startRow * T + T / 2} color="#0369a1" />
          <Station x={VB_W - SIDE / 2} y={board.goalRow * T + T / 2} color="#16a34a" />
          <g className="pointer-events-none" style={{
            transform: `translate(${trainAt.x}px, ${trainAt.y}px)`,
            transition: 'transform .25s linear',
          }}>
            <MiniTrain />
          </g>
        </svg>

        {phase === 'won' && (
          <>
            <div className="rounded-2xl px-5 py-4 text-center bounce-in shadow-lg" style={{ background: GRAD }}>
              <p className="text-2xl font-black text-white">つながった！</p>
              <p className="text-sm font-bold text-white/90 mt-1">
                {taps}かい まわして つないだよ{newBest ? '（じぶんの さいこう！）' : ''}
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => start(stage)}
                className="flex-1 py-4 text-lg font-black rounded-2xl border-2 border-sky-400 text-sky-700 bg-white active:scale-95">
                もういちど
              </button>
              {stage + 1 < STAGES.length ? (
                <button onClick={() => start(stage + 1)}
                  className="flex-1 py-4 text-lg font-black text-white rounded-2xl shadow-lg active:scale-95" style={{ background: GRAD }}>
                  つぎの ステージ
                </button>
              ) : (
                <button onClick={() => setPhase('select')}
                  className="flex-1 py-4 text-lg font-black text-white rounded-2xl shadow-lg active:scale-95" style={{ background: GRAD }}>
                  ステージを えらぶ
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </GameLayout>
  )
}

// 線路1マス（中心が原点・1辺60）。まっすぐは上下、カーブは上と右をつなぐ形。
function Track({ curve, turns }: { curve: boolean; turns: number }) {
  const h = T / 2
  return (
    <g transform={`rotate(${turns * 90})`} className="pointer-events-none">
      {curve ? (
        <>
          {[0.2, 0.45, 0.7].map((k) => {
            const a = (Math.PI / 2) * k + Math.PI / 2
            const r1 = h - 13, r2 = h + 13
            return <line key={k} x1={h + r1 * Math.cos(a)} y1={-h + r1 * Math.sin(a)} x2={h + r2 * Math.cos(a)} y2={-h + r2 * Math.sin(a)} stroke="#a16207" strokeWidth={4} />
          })}
          <path d={`M ${-7} ${-h} A ${h + 7} ${h + 7} 0 0 0 ${h} ${7}`} fill="none" stroke="#475569" strokeWidth={4} />
          <path d={`M ${7} ${-h} A ${h - 7} ${h - 7} 0 0 0 ${h} ${-7}`} fill="none" stroke="#475569" strokeWidth={4} />
        </>
      ) : (
        <>
          {[-20, -7, 7, 20].map((y) => <line key={y} x1={-13} y1={y} x2={13} y2={y} stroke="#a16207" strokeWidth={4} />)}
          <line x1={-7} y1={-h} x2={-7} y2={h} stroke="#475569" strokeWidth={4} />
          <line x1={7} y1={-h} x2={7} y2={h} stroke="#475569" strokeWidth={4} />
        </>
      )}
    </g>
  )
}

// 動かない マスの しるし（ねじ）
function Bolt() {
  return (
    <g className="pointer-events-none">
      <circle cx={-20} cy={-20} r={5} fill="#57534e" />
      <line x1={-23} y1={-20} x2={-17} y2={-20} stroke="#e7e5e4" strokeWidth={1.6} />
    </g>
  )
}

// えき（屋根つきの ホーム）
function Station({ x, y, color }: { x: number; y: number; color: string }) {
  return (
    <g transform={`translate(${x},${y})`} className="pointer-events-none">
      <path d="M-12 -14 L0 -22 L12 -14 Z" fill={color} />
      <rect x={-10} y={-14} width={20} height={20} fill="#fff" stroke={color} strokeWidth={2.5} />
      <rect x={-5} y={-6} width={10} height={12} fill={color} />
    </g>
  )
}

// はしる でんしゃ（中心が原点）
function MiniTrain() {
  return (
    <g>
      <rect x={-15} y={-11} width={30} height={20} rx={5} fill="#ef4444" stroke="#7f1d1d" strokeWidth={2} />
      <rect x={-10} y={-7} width={8} height={7} rx={1.5} fill="#e0f2fe" />
      <rect x={2} y={-7} width={8} height={7} rx={1.5} fill="#e0f2fe" />
      <circle cx={-8} cy={10} r={3.5} fill="#1f2937" />
      <circle cx={8} cy={10} r={3.5} fill="#1f2937" />
    </g>
  )
}
