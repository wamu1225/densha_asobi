import { useState } from 'react'
import { GameLayout } from '../components/GameLayout'
import { Confetti } from '../components/Confetti'
import { STAGES, newOrder, solve, solve2 } from './shuntLogic'

const GRAD = 'linear-gradient(135deg, #8b5cf6, #6d28d9)'
const TITLE = 'れっしゃ いれかえ'
const SAVE_KEY = 'densha_shunt_cleared' // { "ステージ番号": いちばん少ない 手数 }
const CAR_COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#a855f7', '#ec4899']

function loadCleared(): Record<string, number> {
  try {
    const v = JSON.parse(localStorage.getItem(SAVE_KEY) || '{}')
    return v && typeof v === 'object' ? v : {}
  } catch { return {} }
}
function saveCleared(v: Record<string, number>) {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(v)) } catch { /* 保存できなくても遊べる */ }
}

type Phase = 'select' | 'play' | 'won'
interface Yard { come: number[]; wait: number[][]; home: number[] } // come[0] がいちばん まえ・wait[k] の さいごが でぐちがわ（ひきこみせんは 1〜2本）
type Move = { kind: 'come-home' } | { kind: 'come-wait'; k: number } | { kind: 'wait-home'; k: number }
const SIDING_NAME = ['A', 'B']

export function ShuntYard() {
  const [phase, setPhase] = useState<Phase>('select')
  const [stage, setStage] = useState(0)
  const [yard, setYard] = useState<Yard>({ come: [], wait: [[]], home: [] })
  const [history, setHistory] = useState<Yard[]>([])
  const [moves, setMoves] = useState(0)
  const [goal, setGoal] = useState(0)
  const [msg, setMsg] = useState('')
  const [cleared, setCleared] = useState(loadCleared)
  const [newBest, setNewBest] = useState(false)

  const unlocked = Math.min(STAGES.length, Object.keys(cleared).length + 1)
  const need = yard.home.length + 1
  const two = STAGES[stage].sidings === 2
  // ひきこみせんで 大きい番号の上に 小さい番号が のっていないと、もう並べられない
  const stuck = yard.wait.some((w) => w.some((v, i) => i > 0 && w[i - 1] < v))
  const cap = two ? STAGES[stage].cars : STAGES[stage].maxWait + 2 // 線路の長さ（入れすぎ防止）

  function start(s: number) {
    const o = newOrder(STAGES[s])
    const twoS = STAGES[s].sidings === 2
    setStage(s); setYard({ come: o, wait: twoS ? [[], []] : [[]], home: [] }); setHistory([])
    setMoves(0); setGoal(twoS ? solve2(o) : solve(o).moves); setMsg(''); setNewBest(false)
    setPhase('play')
  }

  function move(m: Move) {
    if (phase !== 'play') return
    const y: Yard = { come: yard.come.slice(), wait: yard.wait.map((w) => w.slice()), home: yard.home.slice() }
    if (m.kind === 'come-home' || m.kind === 'come-wait') {
      if (!y.come.length) return
      if (m.kind === 'come-home' && y.come[0] !== need) { setMsg(`ホームには ${need}ばんを いれてね`); return }
      if (m.kind === 'come-wait' && y.wait[m.k].length >= cap) { setMsg('ひきこみせんが いっぱいだよ'); return }
      const car = y.come.shift()!
      if (m.kind === 'come-home') { y.home.push(car) } else { y.wait[m.k].push(car) }
    } else {
      const w = y.wait[m.k]
      if (!w.length) return
      if (w[w.length - 1] !== need) { setMsg(`ホームには ${need}ばんを いれてね`); return }
      y.home.push(w.pop()!)
    }
    setHistory([...history, yard]); setYard(y); setMsg('')
    const u = moves + 1
    setMoves(u)
    if (y.home.length === STAGES[stage].cars) {
      const key = String(stage + 1)
      const prev = cleared[key]
      if (prev === undefined || u < prev) {
        const next = { ...cleared, [key]: u }
        setCleared(next); saveCleared(next); setNewBest(prev !== undefined)
      }
      setPhase('won')
    }
  }

  function undo() {
    const h = history[history.length - 1]
    if (!h) return
    setHistory(history.slice(0, -1)); setYard(h); setMsg('')
  }

  if (phase === 'select') return (
    <GameLayout title={TITLE} gradient={GRAD}>
      <div className="flex flex-col items-center gap-4 pt-2">
        <div className="flex gap-1" aria-hidden="true">
          {[3, 1, 2].map((v) => <Car key={v} n={v} small />)}
        </div>
        <p className="text-xl font-black text-center text-gray-700 leading-snug">
          しゃりょうを 1・2・3…の<br />じゅんばんに ならべよう
        </p>
        <div className="bg-violet-50 border-2 border-violet-200 rounded-2xl p-4 w-full text-sm font-bold text-violet-900 leading-relaxed">
          <p>ひきこみせんは、さいごに いれた しゃりょうから でるよ。</p>
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
                  best !== undefined ? 'bg-violet-500 border-violet-600 text-white'
                    : open ? 'bg-white border-violet-400 text-violet-700' : 'bg-gray-100 border-gray-200 text-gray-300'}`}>
                <span className="text-2xl leading-none">{k + 1}</span>
                <span className="text-[11px] mt-1 leading-none">{best !== undefined ? `${best}て` : s.sidings === 2 ? `せん2ほん` : `${s.cars}りょう`}</span>
              </button>
            )
          })}
        </div>
        <p className="text-xs font-bold text-gray-500 text-center">9から ひきこみせんが 2ほんに なるよ。</p>
      </div>
    </GameLayout>
  )

  const front = yard.come[0]
  const tops = yard.wait.map((w) => w[w.length - 1])

  return (
    <GameLayout title={TITLE} gradient={GRAD} isPlaying={phase === 'play'} hideAd>
      <Confetti active={phase === 'won'} />
      <div className="flex flex-col gap-3 pt-1">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-violet-100 text-violet-800 text-sm font-black">ステージ {stage + 1}</span>
          <span className="text-sm font-bold text-gray-600">{moves}て（めやす {goal}て）</span>
          <button onClick={undo} disabled={!history.length || phase === 'won'}
            className="ml-auto px-4 py-2 rounded-xl text-sm font-black border-2 border-violet-400 text-violet-700 bg-white disabled:opacity-30 active:scale-95">
            まった
          </button>
        </div>

        {/* ひきこみせん（上）：右が でぐち */}
        {yard.wait.map((w, k) => (
          <section key={k} className="rounded-2xl bg-stone-100 p-3">
            <p className="text-xs font-black text-stone-500 mb-2">ひきこみせん{two ? ` ${SIDING_NAME[k]}` : ''}（いきどまり ← → でぐち）</p>
            <div className="flex items-center gap-1 min-h-[56px] border-b-4 border-stone-400 pb-1">
              <span className="w-3 h-10 bg-stone-500 rounded-sm" aria-hidden="true" />
              {w.map((v, i) => <Car key={`w${v}`} n={v} dim={i < w.length - 1} small={two} />)}
            </div>
          </section>
        ))}

        {/* ホーム（左）と くる せんろ（右） */}
        <section className="rounded-2xl bg-stone-100 p-3">
          <div className="flex justify-between text-xs font-black text-stone-500 mb-2">
            <span>ホーム（1から じゅんに）</span><span>くる しゃりょう（ひだりが まえ）</span>
          </div>
          <div className="flex items-end gap-2">
            <div className="flex-1 flex flex-wrap gap-1 min-h-[56px] border-b-4 border-violet-400 pb-1">
              {yard.home.map((v) => <Car key={`h${v}`} n={v} small />)}
            </div>
            <div className="flex-1 flex flex-wrap gap-1 justify-start min-h-[56px] border-b-4 border-stone-400 pb-1">
              {yard.come.map((v, i) => <Car key={`c${v}`} n={v} dim={i > 0} small={i > 0} />)}
            </div>
          </div>
        </section>

        <p className="text-sm font-bold min-h-[1.25rem] text-center text-rose-600">
          {phase === 'play' && (msg || (stuck ? 'ひきこみせんで ちいさい ばんごうが したに なっちゃった。「まった」で もどろう' : ''))}
        </p>

        {phase === 'play' && (
          <div className={`grid gap-2 ${two ? 'grid-cols-2' : 'grid-cols-1'}`}>
            <button onClick={() => move({ kind: 'come-home' })} disabled={front === undefined}
              className={`py-4 rounded-2xl font-black text-lg text-white shadow active:scale-95 disabled:opacity-30 ${two ? 'col-span-2' : ''}`} style={{ background: GRAD }}>
              {front !== undefined ? `${front}ばんを ホームへ` : 'くる しゃりょうは もう ないよ'}
            </button>
            {yard.wait.map((_, k) => (
              <button key={`in${k}`} onClick={() => move({ kind: 'come-wait', k })} disabled={front === undefined}
                className="py-4 rounded-2xl font-black text-lg border-2 border-violet-400 text-violet-700 bg-white active:scale-95 disabled:opacity-30">
                {front !== undefined ? `${front}ばんを ${two ? SIDING_NAME[k] : 'ひきこみせん'}へ` : '—'}
              </button>
            ))}
            {yard.wait.map((_, k) => (
              <button key={`out${k}`} onClick={() => move({ kind: 'wait-home', k })} disabled={tops[k] === undefined}
                className={`py-4 rounded-2xl font-black border-2 border-stone-400 text-stone-700 bg-white active:scale-95 disabled:opacity-30 ${two ? 'text-base' : 'text-lg'}`}>
                {tops[k] !== undefined ? `${two ? SIDING_NAME[k] : 'ひきこみせん'}の ${tops[k]}ばんを ホームへ` : `${two ? SIDING_NAME[k] : 'ひきこみせん'}は からっぽ`}
              </button>
            ))}
          </div>
        )}

        {phase === 'won' && (
          <>
            <div className="rounded-2xl px-5 py-4 text-center bounce-in shadow-lg" style={{ background: GRAD }}>
              <p className="text-2xl font-black text-white">ならんだ！</p>
              <p className="text-sm font-bold text-white/90 mt-1">
                {moves}てで ならべたよ{moves <= goal ? '（いちばん すくない てかず！）' : ''}{newBest ? '（じぶんの さいこう！）' : ''}
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => start(stage)}
                className="flex-1 py-4 text-lg font-black rounded-2xl border-2 border-violet-400 text-violet-700 bg-white active:scale-95">
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

// しゃりょう（番号つき）。dim は うしろに いて すぐには うごかせない しゃりょう
function Car({ n, small = false, dim = false }: { n: number; small?: boolean; dim?: boolean }) {
  const w = small ? 40 : 52
  return (
    <svg width={w} height={small ? 40 : 50} viewBox="0 0 52 50" className={dim ? 'opacity-60' : ''} role="img" aria-label={`${n}ばんの しゃりょう`}>
      <rect x={2} y={4} width={48} height={34} rx={6} fill={CAR_COLORS[(n - 1) % CAR_COLORS.length]} stroke="#1f2937" strokeWidth={2} />
      <rect x={8} y={9} width={36} height={22} rx={4} fill="#fff" />
      <text x={26} y={27} textAnchor="middle" fontSize={20} fontWeight={900} fill="#1f2937">{n}</text>
      <circle cx={14} cy={42} r={5} fill="#374151" />
      <circle cx={38} cy={42} r={5} fill="#374151" />
    </svg>
  )
}
