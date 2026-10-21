import { useState } from 'react'
import { GameLayout } from '../components/GameLayout'
import { Confetti } from '../components/Confetti'
import { COLS, ROWS, STAGES, newBoard, nextStep, reachable, type Board } from './trapLogic'

const GRAD = 'linear-gradient(135deg, #f59e0b, #b45309)'
const TITLE = 'トロッコ とおせんぼ'
const SAVE_KEY = 'densha_trap_cleared' // { "ステージ番号": いちばん少ない さく の数 }

function loadCleared(): Record<string, number> {
  try {
    const v = JSON.parse(localStorage.getItem(SAVE_KEY) || '{}')
    return v && typeof v === 'object' ? v : {}
  } catch { return {} }
}
function saveCleared(v: Record<string, number>) {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(v)) } catch { /* 保存できなくても遊べる */ }
}

// 盤の形（とがった頭の六角形。奇数行が半マス右）
const R = 20
const HW = Math.sqrt(3) * R
const PAD = 4
const VB_W = HW * (COLS + 0.5) + PAD * 2
const VB_H = R * (1.5 * (ROWS - 1) + 2) + PAD * 2
const cx = (i: number) => PAD + HW * ((i % COLS) + 0.5 * (Math.floor(i / COLS) % 2)) + HW / 2
const cy = (i: number) => PAD + R + 1.5 * R * Math.floor(i / COLS)
const HEX = Array.from({ length: 6 }, (_, k) => {
  const a = (Math.PI / 180) * (60 * k - 30)
  return `${(R * Math.cos(a)).toFixed(2)},${(R * Math.sin(a)).toFixed(2)}`
}).join(' ')

type Phase = 'select' | 'play' | 'won' | 'lost'
interface Snap { blocked: boolean[]; cart: number; used: number }

export function TrapCart() {
  const [phase, setPhase] = useState<Phase>('select')
  const [stage, setStage] = useState(0)
  const [board, setBoard] = useState<Board | null>(null)
  const [trees, setTrees] = useState<boolean[]>([]) // はじめからある木（子どもが置いた さく と見分ける）
  const [used, setUsed] = useState(0)
  const [undoLeft, setUndoLeft] = useState(1)
  const [busy, setBusy] = useState(false)
  const [cleared, setCleared] = useState(loadCleared)
  const [newBest, setNewBest] = useState(false)
  const [history, setHistory] = useState<Snap[]>([])

  const def = STAGES[stage]
  const unlocked = Math.min(STAGES.length, Object.keys(cleared).length + 1)

  function start(s: number) {
    const b = newBoard(STAGES[s])
    setStage(s); setBoard(b); setTrees(b.blocked.slice())
    setUsed(0); setUndoLeft(1); setBusy(false); setNewBest(false)
    setHistory([])
    setPhase('play')
  }

  function place(i: number) {
    if (!board || busy || phase !== 'play') return
    if (board.blocked[i] || i === board.cart) return
    setHistory([...history, { blocked: board.blocked, cart: board.cart, used }])
    const blocked = board.blocked.slice()
    blocked[i] = true
    const placed = { ...board, blocked }
    const u = used + 1
    setBoard(placed); setUsed(u)
    // かんたんな ステージは きいろの わく と同じ マスへ動く（同じ近さの マスが複数あっても でたらめにしない）
    const to = nextStep(placed, def.smart, def.showNext ? () => 0 : Math.random)
    if (to === null) { win(u); return }
    setBusy(true)
    setTimeout(() => {
      setBoard({ ...placed, cart: to })
      // トンネルに着いたら、消えるまでの間も次の さく を受けつけない（連打で トンネルから戻る不具合があった）
      if (placed.exits[to]) setTimeout(() => { setPhase('lost'); setBusy(false) }, 450)
      else setBusy(false)
    }, 280)
  }

  function win(u: number) {
    const key = String(stage + 1)
    const prev = cleared[key]
    if (prev === undefined || u < prev) {
      const next = { ...cleared, [key]: u }
      setCleared(next); saveCleared(next)
      setNewBest(prev !== undefined)
    }
    setPhase('won')
  }

  function undo() {
    const s = history[history.length - 1]
    if (!s || !board || undoLeft <= 0) return
    setHistory(history.slice(0, -1))
    setBoard({ ...board, blocked: s.blocked, cart: s.cart })
    setUsed(s.used); setUndoLeft(undoLeft - 1); setBusy(false)
    setPhase('play')
  }

  if (phase === 'select' || !board) return (
    <GameLayout title={TITLE} gradient={GRAD}>
      <div className="flex flex-col items-center gap-4 pt-2">
        <svg viewBox="-40 -30 80 52" className="w-28 h-20" aria-hidden="true"><Cart /></svg>
        <p className="text-xl font-black text-center text-gray-700 leading-snug">
          トロッコが にげだした！<br />トンネルに はいる まえに つかまえよう
        </p>
        <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 w-full text-sm font-bold text-amber-900 leading-relaxed">
          <p>マスを タップすると さくが たつよ。</p>
          <p>さくを 1つ たてると、トロッコは トンネルの ほうへ 1マス にげるよ。</p>
          <p>さくで かこんで、どこにも いけなく したら かち！</p>
        </div>
        <p className="text-sm font-bold text-gray-500 self-start">ステージを えらんでね</p>
        <div className="grid grid-cols-5 gap-2 w-full">
          {STAGES.map((s, k) => {
            const best = cleared[String(k + 1)]
            const open = k < unlocked
            return (
              <button key={k} onClick={() => open && start(k)} disabled={!open}
                aria-label={`ステージ${k + 1}${open ? '' : '（まだ）'}`}
                className={`aspect-square rounded-2xl flex flex-col items-center justify-center font-black active:scale-95 border-2 ${
                  best !== undefined ? 'bg-amber-400 border-amber-500 text-white'
                    : open ? 'bg-white border-amber-400 text-amber-700' : 'bg-gray-100 border-gray-200 text-gray-300'}`}>
                <span className="text-2xl leading-none">{k + 1}</span>
                <span className="text-[10px] mt-1 leading-none">
                  {best !== undefined ? `さく${best}` : s.tunnels === 0 ? 'ふち ぜんぶ' : `トンネル${s.tunnels}`}
                </span>
              </button>
            )
          })}
        </div>
        <p className="text-xs font-bold text-gray-500 text-center">
          クリアすると つぎの ステージが あくよ。9と10は ふちの マスが ぜんぶ トンネル。
        </p>
      </div>
    </GameLayout>
  )

  const trapped = phase === 'won' ? new Set(reachable(board)) : null
  const hint = phase === 'play' && def.showNext && !busy ? nextStep(board, def.smart, () => 0) : null
  const ended = phase === 'won' || phase === 'lost'

  return (
    <GameLayout title={TITLE} gradient={GRAD} isPlaying={phase === 'play'} hideAd>
      <Confetti active={phase === 'won'} />
      <div className="flex flex-col gap-3 pt-1">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-sm font-black">ステージ {stage + 1}</span>
          <span className="text-sm font-bold text-gray-600">さく {used}こ</span>
          <button onClick={undo} disabled={undoLeft <= 0 || history.length === 0 || busy || phase === 'won'}
            className="ml-auto px-4 py-2 rounded-xl text-sm font-black border-2 border-amber-400 text-amber-700 bg-white disabled:opacity-30 active:scale-95">
            まった {undoLeft > 0 ? '（あと1かい）' : ''}
          </button>
        </div>
        <p className="text-sm font-bold text-gray-600 min-h-[1.25rem]">
          {phase === 'play' && (def.showNext
            ? 'きいろの わくは、トロッコが つぎに いく マスだよ'
            : def.tunnels === 0 ? 'ふちの マスに ついたら にげられちゃう' : 'トンネルに はいられたら にげられちゃう')}
        </p>

        <svg viewBox={`0 0 ${VB_W.toFixed(1)} ${VB_H.toFixed(1)}`} className="w-full select-none touch-manipulation"
          role="img" aria-label="六角形の マスの ばん">
          {board.blocked.map((b, i) => {
            const exit = board.exits[i]
            // にげられた トンネルは赤くして、どこから にげたかを残す（トロッコは消えるので）
            const fill = trapped?.has(i) ? '#fde68a' : phase === 'lost' && i === board.cart ? '#fca5a5' : exit ? '#d6d3d1' : (i % 2 ? '#bbf7d0' : '#a7f3d0')
            return (
              <g key={i} transform={`translate(${cx(i).toFixed(1)},${cy(i).toFixed(1)})`}
                onClick={() => place(i)} className={b || ended ? '' : 'cursor-pointer'}>
                <polygon points={HEX} fill={fill} stroke="#fafaf9" strokeWidth={1.5} />
                {exit && <Tunnel />}
                {b && (trees[i] ? <Tree /> : <Fence />)}
                {hint === i && <polygon points={HEX} fill="none" stroke="#f59e0b" strokeWidth={3} strokeDasharray="4 3" transform="scale(0.82)" />}
              </g>
            )
          })}
          <g className="pointer-events-none" style={{
            transform: `translate(${cx(board.cart)}px, ${cy(board.cart)}px) scale(${phase === 'lost' ? 0 : 0.46})`,
            opacity: phase === 'lost' ? 0 : 1,
            transition: phase === 'lost' ? 'transform .45s ease-in, opacity .45s ease-in' : 'transform .28s ease-out',
          }}>
            <Cart worried={phase === 'won'} />
          </g>
        </svg>

        {phase === 'won' && (
          <div className="rounded-2xl px-5 py-4 text-center bounce-in shadow-lg" style={{ background: GRAD }}>
            <p className="text-2xl font-black text-white">つかまえた！</p>
            <p className="text-sm font-bold text-white/90 mt-1">
              さく {used}こで とじこめたよ{newBest ? '（じぶんの さいこう！）' : ''}
            </p>
          </div>
        )}
        {phase === 'lost' && (
          <div className="rounded-2xl px-5 py-4 text-center bounce-in bg-slate-600 shadow-lg">
            <p className="text-2xl font-black text-white">にげられた…</p>
            <p className="text-sm font-bold text-white/90 mt-1">
              {undoLeft > 0 ? '「まった」で 1つ まえに もどれるよ' : 'トロッコの ちかくより、すこし さきを ふさいでみよう'}
            </p>
          </div>
        )}
        {ended && (
          <div className="flex gap-2">
            <button onClick={() => start(stage)}
              className="flex-1 py-4 text-lg font-black rounded-2xl border-2 border-amber-400 text-amber-700 bg-white active:scale-95">
              もういちど
            </button>
            {phase === 'won' && stage + 1 < STAGES.length ? (
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
        )}
      </div>
    </GameLayout>
  )
}

// トンネルの入口（石のアーチと暗い穴）
function Tunnel() {
  return (
    <g className="pointer-events-none">
      <path d="M-12 9 V-1 A12 12 0 0 1 12 -1 V9 Z" fill="#78716c" />
      <path d="M-8 9 V0 A8 8 0 0 1 8 0 V9 Z" fill="#1c1917" />
    </g>
  )
}

// こうじちゅうの さく
function Fence() {
  return (
    <g className="pointer-events-none trap-pop">
      <rect x={-10} y={-8} width={2.5} height={17} rx={1} fill="#57534e" />
      <rect x={7.5} y={-8} width={2.5} height={17} rx={1} fill="#57534e" />
      <rect x={-13} y={-6} width={26} height={6} rx={1.5} fill="#f97316" />
      <path d="M-9 -6 l4 6 h4 l-4 -6 Z M1 -6 l4 6 h4 l-4 -6 Z" fill="#fff" />
      <rect x={-13} y={2} width={26} height={3.5} rx={1.5} fill="#f97316" />
    </g>
  )
}

// はじめから はえている木
function Tree() {
  return (
    <g className="pointer-events-none">
      <rect x={-1.8} y={3} width={3.6} height={8} fill="#92400e" />
      <circle cx={0} cy={-2} r={9} fill="#15803d" />
      <circle cx={-3} cy={-4} r={3} fill="#22c55e" />
    </g>
  )
}

// にげる トロッコ（中心が原点。大きさは 80×52 ほど）
function Cart({ worried = false }: { worried?: boolean }) {
  return (
    <g>
      <path d="M-34 -14 H34 L28 14 H-28 Z" fill="#dc2626" stroke="#7f1d1d" strokeWidth={3} strokeLinejoin="round" />
      <rect x={-36} y={-20} width={72} height={8} rx={3} fill="#7f1d1d" />
      <circle cx={-12} cy={-1} r={4.5} fill="#fff" />
      <circle cx={12} cy={-1} r={4.5} fill="#fff" />
      <circle cx={worried ? -12 : -11} cy={worried ? 0 : -1} r={2.4} fill="#111827" />
      <circle cx={worried ? 12 : 13} cy={worried ? 0 : -1} r={2.4} fill="#111827" />
      {worried
        ? <path d="M-6 9 Q0 4 6 9" fill="none" stroke="#fff" strokeWidth={2.5} strokeLinecap="round" />
        : <path d="M-6 6 Q0 11 6 6" fill="none" stroke="#fff" strokeWidth={2.5} strokeLinecap="round" />}
      <circle cx={-18} cy={20} r={8} fill="#374151" stroke="#111827" strokeWidth={2} />
      <circle cx={18} cy={20} r={8} fill="#374151" stroke="#111827" strokeWidth={2} />
      <circle cx={-18} cy={20} r={2.5} fill="#d1d5db" />
      <circle cx={18} cy={20} r={2.5} fill="#d1d5db" />
    </g>
  )
}
