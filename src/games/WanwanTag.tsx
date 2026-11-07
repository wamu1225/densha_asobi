import { useEffect, useState } from 'react'
import { GameLayout } from '../components/GameLayout'
import { Confetti } from '../components/Confetti'
import { COLS, ROWS, LEVELS, initial, legalMoves, apply, result, chooseMove, stepsOf, type State, type Kind, type Side, type Move, type Piece } from './wanwanLogic'

const GRAD = 'linear-gradient(135deg, #f97316, #c2410c)'
const TITLE = 'わんわん つかまえっこ'
const SAVE_KEY = 'densha_wanwan_wins' // { "つよさの番号": かった かず }

// なまえは ぜんぶ いぬの しゅるい。リーダー（王冠）と ★（むこうまで いった パグ）は しるしで 見せる
const NAME: Record<Kind, string> = { ou: 'シバ', hi: 'ダックス', kaku: 'プードル', fu: 'パグ', kin: 'パグ★' }
const TEAM = [
  { name: 'あか', collar: '#dc2626', ring: '#fecaca' },  // こちら
  { name: 'あお', collar: '#2563eb', ring: '#bfdbfe' },  // あいて
]

function loadWins(): Record<string, number> {
  try {
    const v = JSON.parse(localStorage.getItem(SAVE_KEY) || '{}')
    return v && typeof v === 'object' ? v : {}
  } catch { return {} }
}
function saveWins(v: Record<string, number>) {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(v)) } catch { /* 保存できなくても遊べる */ }
}

// あいての いぬが つぎに いける ところ（＝こちらの いぬが つかまりうる ところ）
function chased(s: State, by: Side): Set<number> {
  return new Set(legalMoves({ ...s, turn: by, hand: [[], []] }).map((m) => m.to))
}

// れんしゅう：ルールを 1つずつ。あいては うごかず、できたら つぎへ（2026-11-07）
function board(put: [number, Kind, Side][], hand0: Kind[] = []): State {
  const b: (Piece | null)[] = new Array(COLS * ROWS).fill(null)
  for (const [i, kind, side] of put) b[i] = { kind, side }
  return { board: b, hand: [hand0, []], turn: 0, ply: 0 }
}
const LESSONS: { text: string; setup: () => State; done: (before: State, after: State, m: Move) => boolean; retry?: string }[] = [
  { text: 'いぬを タップして、みどりの まるへ うごかそう',
    setup: () => board([[7, 'hi', 0], [10, 'ou', 0], [1, 'ou', 1]]),
    done: (_b, _a, m) => 'from' in m },
  { text: 'あおい くびわの パグを つかまえよう',
    setup: () => board([[7, 'kaku', 0], [10, 'ou', 0], [3, 'fu', 1], [2, 'ou', 1]]),
    done: (b, a) => a.hand[0].length > b.hand[0].length, retry: 'プードルは ななめに すすむよ' },
  { text: 'なかまの パグを、あいている ところに だそう',
    setup: () => board([[10, 'ou', 0], [1, 'ou', 1]], ['fu']),
    done: (_b, _a, m) => 'drop' in m, retry: 'したの「なかま」の パグを タップしてね' },
  { text: 'シバを いちばん うえの れつへ。あおい いぬの となりは つかまるよ',
    setup: () => board([[4, 'ou', 0], [0, 'ou', 1]]),
    done: (_b, a) => {
      const k = a.board.findIndex((p) => p && p.kind === 'ou' && p.side === 0)
      return Math.floor(k / COLS) === 0 && !chased(a, 1).has(k)
    }, retry: 'あおい いぬの となりは つかまるよ。ほかの ばしょを さがそう' },
]

type Phase = 'select' | 'play' | 'end'
type Sel = { from: number } | { drop: Kind } | null

export function WanwanTag() {
  const [phase, setPhase] = useState<Phase>('select')
  const [level, setLevel] = useState(0)
  const [s, setS] = useState<State>(initial)
  const [sel, setSel] = useState<Sel>(null)
  const [last, setLast] = useState<Move | null>(null)
  const [prev, setPrev] = useState<State | null>(null) // 「まった」で もどる ばめん
  const [undoLeft, setUndoLeft] = useState(1)
  const [wins, setWins] = useState(loadWins)
  const [why, setWhy] = useState('')
  const [lesson, setLesson] = useState<number | null>(null)
  const [lessonOk, setLessonOk] = useState(false)
  const [lessonMsg, setLessonMsg] = useState('')

  const r = lesson === null ? result(s) : null
  const thinking = phase === 'play' && lesson === null && s.turn === 1 && r === null

  function startLesson(k: number) {
    setLesson(k); setS(LESSONS[k].setup()); setSel(null); setLast(null); setPrev(null)
    setLessonOk(false); setLessonMsg(''); setPhase('play')
  }

  function start(lv: number) {
    setLesson(null)
    setLevel(lv); setS(initial()); setSel(null); setLast(null); setPrev(null); setUndoLeft(1); setWhy('')
    setPhase('play')
  }

  function finish(ns: State) {
    const rr = result(ns)
    if (rr === null) return
    const caught = !ns.board.some((p) => p && p.kind === 'ou' && p.side === (rr === 0 ? 1 : 0))
    setWhy(rr === 'draw' ? 'ながく つづいたので ひきわけ'
      : caught ? (rr === 0 ? 'あいての リーダーの シバを つかまえた' : 'リーダーの シバが つかまっちゃった')
      : (rr === 0 ? 'シバが あいての いぬごやに ついた' : 'あいての シバが いぬごやに ついた'))
    if (rr === 0) {
      const nw = { ...wins, [String(level)]: (wins[String(level)] ?? 0) + 1 }
      setWins(nw); saveWins(nw)
    }
    setPhase('end')
  }

  function play(m: Move) {
    if (lesson !== null) {
      const ns = apply(s, m)
      setSel(null); setLast(m)
      if (LESSONS[lesson].done(s, ns, m)) { setS({ ...ns, turn: 0 }); setLessonOk(true); setLessonMsg('') }
      else { setS(LESSONS[lesson].setup()); setLast(null); setLessonMsg(LESSONS[lesson].retry ?? 'もういちど やってみよう') }
      return
    }
    const ns = apply(s, m)
    setPrev(s); setS(ns); setSel(null); setLast(m)
    finish(ns)
  }

  // あいての番：すこし まってから うごく
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
    if (phase !== 'play' || s.turn !== 0 || lessonOk) return
    const p = s.board[i]
    if (sel) {
      const m = legalMoves(s).find((mv) => mv.to === i && ('drop' in sel ? 'drop' in mv && mv.drop === sel.drop : 'from' in mv && mv.from === sel.from))
      if (m) { play(m); return }
    }
    if (p && p.side === 0) setSel({ from: i })
    else setSel(null)
  }

  function undo() {
    if (!prev || undoLeft <= 0) return
    setS(prev); setPrev(null); setSel(null); setLast(null); setUndoLeft(undoLeft - 1); setPhase('play')
  }

  if (phase === 'select') return (
    <GameLayout title={TITLE} gradient={GRAD}>
      <div className="flex flex-col items-center gap-4 pt-2">
        <div className="grid grid-cols-4 gap-1 w-full">
          {(['ou', 'hi', 'kaku', 'fu'] as Kind[]).map((k) => (
            <div key={k} className="flex flex-col items-center">
              <svg viewBox="-50 -50 100 100" className="w-16 h-16" aria-hidden="true"><Dog kind={k} side={0} /></svg>
              <span className="text-xs font-black text-gray-600">{NAME[k]}</span>
            </div>
          ))}
        </div>
        <p className="text-xl font-black text-center text-gray-700 leading-snug">
          こうえんで つかまえっこ！<br />あいての シバを つかまえよう
        </p>
        <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-4 w-full text-sm font-bold text-orange-900 leading-relaxed">
          <p>つかまえた いぬは、きみの なかまに なるよ。</p>
        </div>
        <button onClick={() => startLesson(0)}
          className="w-full py-3 rounded-2xl font-black text-orange-700 bg-orange-50 border-2 border-dashed border-orange-300 active:scale-95">
          はじめての ひとは れんしゅう（4つ）
        </button>
        <p className="text-sm font-bold text-gray-500 self-start">あいての つよさを えらんでね</p>
        <div className="grid grid-cols-3 gap-2 w-full">
          {LEVELS.map((L, k) => (
            <button key={k} onClick={() => start(k)}
              className={`py-4 rounded-2xl flex flex-col items-center justify-center font-black active:scale-95 border-2 ${
                (wins[String(k)] ?? 0) > 0 ? 'bg-orange-500 border-orange-600 text-white' : 'bg-white border-orange-400 text-orange-700'}`}>
              <span className="text-lg leading-none">{L.name}</span>
              <span className="text-xs mt-1 leading-none">{(wins[String(k)] ?? 0) > 0 ? `${wins[String(k)]}かい かった` : 'まだ かってない'}</span>
            </button>
          ))}
        </div>
      </div>
    </GameLayout>
  )

  const moves = phase === 'play' && s.turn === 0 ? legalMoves(s) : []
  const targets = new Set(sel ? moves.filter((m) => ('drop' in sel ? 'drop' in m && m.drop === sel.drop : 'from' in m && m.from === sel.from)).map((m) => m.to) : [])
  const danger = phase === 'play' ? chased(s, 1) : new Set<number>()
  const C = 100
  const TOP = 26 // いぬごやの ぶん
  const lastFrom = last && 'from' in last ? last.from : -1
  const lastTo = last ? last.to : -1

  return (
    <GameLayout title={TITLE} gradient={GRAD} isPlaying={phase === 'play'} hideAd>
      <Confetti active={phase === 'end' && r === 0} />
      <div className="flex flex-col gap-2 pt-1">
        {lesson !== null && (
          <div className="rounded-2xl bg-orange-50 border-2 border-orange-200 px-3 py-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-orange-500 text-white text-sm font-black whitespace-nowrap">れんしゅう {lesson + 1}/{LESSONS.length}</span>
              <button onClick={() => { setLesson(null); setPhase('select') }} className="ml-auto text-sm font-black text-orange-700 px-3 py-2">やめる</button>
            </div>
            <p className="text-base font-black text-orange-900 mt-1">{lessonOk ? 'できた！' : LESSONS[lesson].text}</p>
            {!lessonOk && lessonMsg && <p className="text-sm font-bold text-rose-600 mt-1">{lessonMsg}</p>}
            {lessonOk && (
              <button onClick={() => lesson + 1 < LESSONS.length ? startLesson(lesson + 1) : (setLesson(null), setPhase('select'))}
                className="w-full mt-2 py-3 rounded-xl font-black text-white active:scale-95" style={{ background: GRAD }}>
                {lesson + 1 < LESSONS.length ? 'つぎの れんしゅう' : 'れんしゅう おわり！ あいてと あそぼう'}
              </button>
            )}
          </div>
        )}
        {lesson === null && <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-orange-100 text-orange-800 text-sm font-black whitespace-nowrap">{LEVELS[level].name}</span>
          <span className="text-sm font-bold text-gray-600 whitespace-nowrap">
            {phase === 'end' ? 'おしまい' : thinking ? 'あいての ばん…' : sel ? 'どこへ いく？' : 'きみの ばん'}
          </span>
          <button onClick={undo} disabled={!prev || undoLeft <= 0 || thinking}
            className="ml-auto px-4 py-2 rounded-xl text-sm font-black border-2 border-orange-400 text-orange-700 bg-white disabled:opacity-30 active:scale-95 whitespace-nowrap">
            まった
          </button>
        </div>}

        <Friends label={'あいての\nなかま'} kinds={s.hand[1]} side={1} />

        <svg viewBox={`0 0 ${COLS * C} ${ROWS * C + TOP * 2}`} className="w-full max-w-[340px] mx-auto select-none touch-manipulation" role="img" aria-label="いぬの こうえん">
          <DogHouse x={COLS * C / 2} y={TOP - 4} color={TEAM[1].collar} />
          <DogHouse x={COLS * C / 2} y={ROWS * C + TOP * 2 - 2} color={TEAM[0].collar} />
          {s.board.map((p, i) => {
            const x = (i % COLS) * C, y = Math.floor(i / COLS) * C + TOP
            const mark = targets.has(i)
            const selected = sel && 'from' in sel && sel.from === i
            const hot = p && p.side === 0 && danger.has(i)
            const row = Math.floor(i / COLS)
            return (
              <g key={i} data-i={i} data-p={p ? `${p.kind}${p.side}` : ''} data-t={mark ? 1 : 0} onClick={() => tapCell(i)} className="cursor-pointer">
                <rect x={x + 2} y={y + 2} width={C - 4} height={C - 4} rx={14}
                  fill={selected ? '#fde68a' : i === lastTo || i === lastFrom ? '#d9f99d' : (row === 0 || row === ROWS - 1) ? '#bbf7d0' : '#dcfce7'} />
                {hot && <rect x={x + 5} y={y + 5} width={C - 10} height={C - 10} rx={12} fill="none" stroke="#ef4444" strokeWidth={5} />}
                {p && <g transform={`translate(${x + C / 2},${y + C / 2})`}><Dog kind={p.kind} side={p.side} /></g>}
                {mark && <circle cx={x + C / 2} cy={y + C / 2} r={p ? 42 : 14} fill={p ? 'none' : '#16a34a'} stroke="#16a34a" strokeWidth={p ? 5 : 0} opacity={0.85} />}
              </g>
            )
          })}
        </svg>

        <Friends label={'きみの\nなかま'} kinds={s.hand[0]} side={0}
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
                className="flex-1 py-4 text-lg font-black rounded-2xl border-2 border-orange-400 text-orange-700 bg-white active:scale-95">
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

// なかまに なった いぬ（つかまえた いぬ）
function Friends({ label, kinds, side, selected = null, onPick }: { label: string; kinds: Kind[]; side: Side; selected?: Kind | null; onPick?: (k: Kind) => void }) {
  return (
    <div className="flex items-center gap-2 min-h-[60px] bg-stone-100 rounded-2xl px-3 py-1">
      <span className="text-xs font-black text-stone-500 w-16 shrink-0 leading-tight whitespace-pre-line">{label}</span>
      <div className="flex gap-1 flex-wrap">
        {kinds.length === 0 && <span className="text-xs font-bold text-stone-400">まだ いないよ</span>}
        {kinds.map((k, j) => (
          <button key={j} onClick={() => onPick?.(k)} disabled={!onPick} aria-label={`なかまの ${NAME[k]}`}
            className={`w-14 h-14 rounded-xl ${selected === k ? 'bg-amber-200 ring-4 ring-amber-500' : 'bg-transparent'} disabled:cursor-default`}>
            <svg viewBox="-50 -50 100 100" className="w-14 h-14"><Dog kind={k} side={side} small /></svg>
          </button>
        ))}
      </div>
    </div>
  )
}

// いぬごや（それぞれの チームの いちばん おくの れつの しるし）
function DogHouse({ x, y, color }: { x: number; y: number; color: string }) {
  return (
    <g transform={`translate(${x},${y})`} className="pointer-events-none">
      <path d="M-16 0 V-12 L0 -22 L16 -12 V0 Z" fill="#fff" stroke={color} strokeWidth={2.5} strokeLinejoin="round" />
      <path d="M-6 0 V-7 A6 6 0 0 1 6 -7 V0 Z" fill={color} />
    </g>
  )
}

// いぬの かお。まわりの あしあとが いける むき。くびわの いろで チームを 見分ける（あいても さかさまに しない）
function Dog({ kind, side, small = false }: { kind: Kind; side: Side; small?: boolean }) {
  const team = TEAM[side]
  const fur = kind === 'ou' ? '#f59e0b' : kind === 'hi' ? '#92400e' : kind === 'kaku' ? '#f5f5f4' : '#e7d3b0'
  const ear = kind === 'ou' ? '#d97706' : kind === 'hi' ? '#78350f' : kind === 'kaku' ? '#d6d3d1' : '#292524'
  const face = (
    <g>
      {/* みみ */}
      {kind === 'ou' && <><path d="M-24 -14 L-20 -34 L-8 -22 Z" fill={ear} /><path d="M24 -14 L20 -34 L8 -22 Z" fill={ear} /></>}
      {kind === 'hi' && <><ellipse cx={-24} cy={-2} rx={8} ry={17} fill={ear} /><ellipse cx={24} cy={-2} rx={8} ry={17} fill={ear} /></>}
      {kind === 'kaku' && [[-20, -22], [0, -28], [20, -22], [-27, -6], [27, -6]].map(([cx, cy], k) => <circle key={k} cx={cx} cy={cy} r={9} fill={ear} />)}
      {/* パグ：ちいさな たれみみ */}
      {(kind === 'fu' || kind === 'kin') && <><path d="M-21 -16 Q-30 -12 -24 -2 Q-18 -8 -14 -18 Z" fill={ear} /><path d="M21 -16 Q30 -12 24 -2 Q18 -8 14 -18 Z" fill={ear} /></>}
      {/* あたま */}
      <circle r={22} fill={fur} stroke="#78350f" strokeWidth={2} />
      {/* はなまわり（パグは くろい おめん） */}
      <ellipse cx={0} cy={8} rx={11} ry={8} fill={kind === 'fu' || kind === 'kin' ? '#44403c' : '#fffbeb'} />
      <circle cx={-8} cy={-4} r={3} fill="#1c1917" />
      <circle cx={8} cy={-4} r={3} fill="#1c1917" />
      <ellipse cx={0} cy={4} rx={4} ry={3} fill="#1c1917" />
      {kind === 'ou' && <path d="M-9 -27 L-5 -35 L0 -29 L5 -35 L9 -27 Z" fill="#facc15" stroke="#a16207" strokeWidth={1.5} />}
      {kind === 'kin' && <path d="M0 -30 l2.4 5 5.4 .6 -4 3.6 1.2 5.3 L0 -18.2 -5 -15.5 -3.8 -20.8 -7.8 -24.4 -2.4 -25 Z" fill="#facc15" />}
      {/* くびわ */}
      <path d="M-14 17 Q0 25 14 17" fill="none" stroke={team.collar} strokeWidth={5} strokeLinecap="round" />
    </g>
  )
  return (
    <g className="pointer-events-none">
      <circle r={small ? 36 : 40} fill={team.ring} opacity={0.75} />
      {face}
      {/* あしあと：いける むき */}
      {!small && stepsOf(kind, side).map(([dr, dc], k) => (
        <g key={k} transform={`translate(${dc * 38},${dr * 38})`}>
          <circle r={4} fill={team.collar} />
          <circle cx={-3.5} cy={-5} r={1.8} fill={team.collar} />
          <circle cx={3.5} cy={-5} r={1.8} fill={team.collar} />
        </g>
      ))}
    </g>
  )
}
