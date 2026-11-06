import { useEffect, useState } from 'react'
import { GameLayout } from '../components/GameLayout'
import { Confetti } from '../components/Confetti'
import { COLS, ROWS, LEVELS, initial, legalMoves, apply, result, chooseMove, stepsOf, type State, type Kind, type Side, type Move } from './shogiLogic'

const GRAD = 'linear-gradient(135deg, #b45309, #78350f)'
const TITLE = 'ミニしょうぎ'
const SAVE_KEY = 'densha_shogi_wins' // { "つよさの番号": かった かず }

const LABEL: Record<Kind, string> = { ou: 'おう', hi: 'たて', kaku: 'なな', fu: 'ふ', kin: 'きん' }

function loadWins(): Record<string, number> {
  try {
    const v = JSON.parse(localStorage.getItem(SAVE_KEY) || '{}')
    return v && typeof v === 'object' ? v : {}
  } catch { return {} }
}
function saveWins(v: Record<string, number>) {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(v)) } catch { /* 保存できなくても遊べる */ }
}

// あいての こまが つぎに うごける マス（＝こちらの こまが とられうる マス）
function attacked(s: State, by: Side): Set<number> {
  const t = legalMoves({ ...s, turn: by, hand: [[], []] })
  return new Set(t.map((m) => m.to))
}

type Phase = 'select' | 'play' | 'end'
type Sel = { from: number } | { drop: Kind } | null

export function MiniShogi() {
  const [phase, setPhase] = useState<Phase>('select')
  const [level, setLevel] = useState(0)
  const [s, setS] = useState<State>(initial)
  const [sel, setSel] = useState<Sel>(null)
  const [last, setLast] = useState<Move | null>(null)
  const [prev, setPrev] = useState<State | null>(null) // 「まった」で もどる きょくめん
  const [undoLeft, setUndoLeft] = useState(1)
  const [wins, setWins] = useState(loadWins)
  const [why, setWhy] = useState('')

  const r = result(s)
  const thinking = phase === 'play' && s.turn === 1 && r === null

  function start(lv: number) {
    setLevel(lv); setS(initial()); setSel(null); setLast(null); setPrev(null); setUndoLeft(1); setWhy('')
    setPhase('play')
  }

  function finish(ns: State) {
    const rr = result(ns)
    if (rr === null) return false
    const kingTaken = !ns.board.some((p) => p && p.kind === 'ou' && p.side === (rr === 0 ? 1 : 0))
    setWhy(rr === 'draw' ? 'ながく つづいたので ひきわけ' : kingTaken ? 'おうを とった' : 'おうが いちばん むこうまで いった')
    if (rr === 0) {
      const nw = { ...wins, [String(level)]: (wins[String(level)] ?? 0) + 1 }
      setWins(nw); saveWins(nw)
    }
    setPhase('end')
    return true
  }

  function play(m: Move) {
    const ns = apply(s, m)
    setPrev(s); setS(ns); setSel(null); setLast(m)
    finish(ns)
  }

  // あいての番：すこし まってから さす
  useEffect(() => {
    if (!thinking) return
    const id = setTimeout(() => {
      const m = chooseMove(s, level)
      const ns = apply(s, m)
      setS(ns); setLast(m)
      finish(ns)
    }, 650)
    return () => clearTimeout(id)
    // finish は wins・level を読むだけ
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [thinking, s, level])

  function tapCell(i: number) {
    if (phase !== 'play' || s.turn !== 0) return
    const p = s.board[i]
    const moves = legalMoves(s)
    if (sel) {
      const m = moves.find((mv) => mv.to === i && ('drop' in sel ? 'drop' in mv && mv.drop === sel.drop : 'from' in mv && mv.from === sel.from))
      if (m) { play(m); return }
    }
    if (p && p.side === 0) setSel({ from: i })
    else setSel(null)
  }

  function undo() {
    if (!prev || undoLeft <= 0) return
    // あいての手も いっしょに もどす（こちらの番に もどる）
    setS(prev); setPrev(null); setSel(null); setLast(null); setUndoLeft(undoLeft - 1); setPhase('play')
  }

  if (phase === 'select') return (
    <GameLayout title={TITLE} gradient={GRAD}>
      <div className="flex flex-col items-center gap-4 pt-2">
        <div className="flex gap-2" aria-hidden="true">
          {(['hi', 'ou', 'kaku'] as Kind[]).map((k) => (
            <svg key={k} viewBox="-50 -50 100 100" className="w-16 h-16"><PieceView kind={k} side={0} /></svg>
          ))}
        </div>
        <p className="text-xl font-black text-center text-gray-700 leading-snug">
          ちいさな しょうぎばんで<br />あいての おうを とろう
        </p>
        <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 w-full text-sm font-bold text-amber-900 leading-relaxed">
          <p>こまの まわりの てんの ほうへ 1マス うごけるよ。</p>
          <p>あいての こまの マスに うごくと とれるよ。とった こまは「もちごま」になって、あいている マスに おけるよ。</p>
          <p>あいての おうを とるか、じぶんの おうが いちばん むこうの だんまで いって とられなければ かち！</p>
          <p>もちごまは タップしてから、おきたい マスを タップしてね。</p>
          <p>あかく ひかった こまは、あいてに ねらわれて いるよ。</p>
        </div>
        <p className="text-sm font-bold text-gray-500 self-start">あいての つよさを えらんでね</p>
        <div className="grid grid-cols-3 gap-2 w-full">
          {LEVELS.map((L, k) => (
            <button key={k} onClick={() => start(k)}
              className={`py-4 rounded-2xl flex flex-col items-center justify-center font-black active:scale-95 border-2 ${
                (wins[String(k)] ?? 0) > 0 ? 'bg-amber-600 border-amber-700 text-white' : 'bg-white border-amber-500 text-amber-800'}`}>
              <span className="text-lg leading-none">{L.name}</span>
              <span className="text-xs mt-1 leading-none">{(wins[String(k)] ?? 0) > 0 ? `${wins[String(k)]}かい かった` : 'まだ かってない'}</span>
            </button>
          ))}
        </div>
        <p className="text-xs font-bold text-gray-500 text-center">さきに うごくのは きみ。こまは したの 4こだよ。</p>
      </div>
    </GameLayout>
  )

  const moves = phase === 'play' && s.turn === 0 ? legalMoves(s) : []
  const targets = new Set(sel ? moves.filter((m) => ('drop' in sel ? 'drop' in m && m.drop === sel.drop : 'from' in m && m.from === sel.from)).map((m) => m.to) : [])
  const danger = phase === 'play' ? attacked(s, 1) : new Set<number>()
  const C = 100
  const lastFrom = last && 'from' in last ? last.from : -1
  const lastTo = last ? last.to : -1

  return (
    <GameLayout title={TITLE} gradient={GRAD} isPlaying={phase === 'play'} hideAd>
      <Confetti active={phase === 'end' && r === 0} />
      <div className="flex flex-col gap-2 pt-1">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-sm font-black whitespace-nowrap">{LEVELS[level].name}</span>
          <span className="text-sm font-bold text-gray-600 whitespace-nowrap">
            {phase === 'end' ? 'おしまい' : thinking ? 'あいての ばん…' : sel ? 'どこに うごかす？' : 'きみの ばん'}
          </span>
          <button onClick={undo} disabled={!prev || undoLeft <= 0 || thinking}
            className="ml-auto px-4 py-2 rounded-xl text-sm font-black border-2 border-amber-500 text-amber-800 bg-white disabled:opacity-30 active:scale-95 whitespace-nowrap">
            まった
          </button>
        </div>

        <Hand label={"あいての\nもちごま"} kinds={s.hand[1]} side={1} />

        <svg viewBox={`0 0 ${COLS * C} ${ROWS * C}`} className="w-full max-w-[340px] mx-auto select-none touch-manipulation" role="img" aria-label="ミニしょうぎの ばん">
          {s.board.map((p, i) => {
            const x = (i % COLS) * C, y = Math.floor(i / COLS) * C
            const mark = targets.has(i)
            const selected = sel && 'from' in sel && sel.from === i
            const hot = p && p.side === 0 && danger.has(i)
            return (
              <g key={i} data-i={i} data-p={p ? `${p.kind}${p.side}` : ''} data-t={mark ? 1 : 0} onClick={() => tapCell(i)} className="cursor-pointer">
                <rect x={x + 2} y={y + 2} width={C - 4} height={C - 4} rx={8}
                  fill={selected ? '#fde68a' : i === lastTo || i === lastFrom ? '#fef3c7' : '#f5deb3'} stroke="#a16207" strokeWidth={2} />
                {hot && <rect x={x + 5} y={y + 5} width={C - 10} height={C - 10} rx={8} fill="none" stroke="#ef4444" strokeWidth={5} />}
                {p && <g transform={`translate(${x + C / 2},${y + C / 2})`}><PieceView kind={p.kind} side={p.side} /></g>}
                {mark && <circle cx={x + C / 2} cy={y + C / 2} r={p ? 40 : 14} fill={p ? 'none' : '#16a34a'} stroke="#16a34a" strokeWidth={p ? 5 : 0} opacity={0.85} />}
              </g>
            )
          })}
        </svg>

        <Hand label={"きみの\nもちごま"} kinds={s.hand[0]} side={0}
          selected={sel && 'drop' in sel ? sel.drop : null}
          onPick={phase === 'play' && s.turn === 0 ? (k) => setSel(sel && 'drop' in sel && sel.drop === k ? null : { drop: k }) : undefined} />

        {phase === 'end' && (
          <>
            <div className={`rounded-2xl px-5 py-4 text-center bounce-in shadow-lg ${r === 0 ? '' : 'bg-slate-600'}`} style={r === 0 ? { background: GRAD } : undefined}>
              <p className="text-2xl font-black text-white">{r === 0 ? 'きみの かち！' : r === 1 ? 'まけちゃった…' : 'ひきわけ'}</p>
              <p className="text-sm font-bold text-white/90 mt-1">
                {why}{r === 1 && undoLeft > 0 ? '。「まった」で 1かい もどれるよ' : ''}
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => start(level)}
                className="flex-1 py-4 text-lg font-black rounded-2xl border-2 border-amber-500 text-amber-800 bg-white active:scale-95">
                もういちど
              </button>
              <button onClick={() => setPhase('select')}
                className="flex-1 py-4 text-lg font-black text-white rounded-2xl shadow-lg active:scale-95" style={{ background: GRAD }}>
                つよさを えらぶ
              </button>
            </div>
          </>
        )}
      </div>
    </GameLayout>
  )
}

// もちごまの ならび
function Hand({ label, kinds, side, selected = null, onPick }: { label: string; kinds: Kind[]; side: Side; selected?: Kind | null; onPick?: (k: Kind) => void }) {
  return (
    <div className="flex items-center gap-2 min-h-[60px] bg-stone-100 rounded-2xl px-3 py-1">
      <span className="text-xs font-black text-stone-500 w-16 shrink-0 leading-tight whitespace-pre-line">{label}</span>
      <div className="flex gap-1 flex-wrap">
        {kinds.length === 0 && <span className="text-xs font-bold text-stone-400">なし</span>}
        {kinds.map((k, j) => (
          <button key={j} onClick={() => onPick?.(k)} disabled={!onPick} aria-label={`もちごまの ${LABEL[k]}`}
            className={`w-14 h-14 rounded-xl ${selected === k ? 'bg-amber-200 ring-4 ring-amber-500' : 'bg-transparent'} disabled:cursor-default`}>
            <svg viewBox="-50 -50 100 100" className="w-14 h-14"><PieceView kind={k} side={side} /></svg>
          </button>
        ))}
      </div>
    </div>
  )
}

// しょうぎの こま（五角形）。まわりの てんが うごける むき。あいての こまは さかさま
function PieceView({ kind, side }: { kind: Kind; side: Side }) {
  return (
    <g transform={side === 1 ? 'rotate(180)' : undefined} className="pointer-events-none">
      <path d="M0 -40 L30 -26 L36 38 L-36 38 L-30 -26 Z" fill={side === 0 ? '#fef3c7' : '#e7e5e4'} stroke={side === 0 ? '#92400e' : '#57534e'} strokeWidth={3} strokeLinejoin="round" />
      <text x={0} y={9} textAnchor="middle" fontSize={kind === 'fu' ? 24 : 19} fontWeight={900}
        fill={kind === 'kin' ? '#b91c1c' : '#1c1917'}>{LABEL[kind]}</text>
      {/* うごける むきの てんは、こまの ふちに おく（もじと かさならない） */}
      {stepsOf(kind, 0).map(([dr, dc], k) => (
        <circle key={k} cx={dc * (dr === 0 ? 27 : 22)} cy={dr < 0 ? -27 : dr > 0 ? 31 : -4} r={4} fill={side === 0 ? '#b45309' : '#57534e'} />
      ))}
    </g>
  )
}
