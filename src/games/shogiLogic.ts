// ミニしょうぎ のルールと相手の考え方（画面から切り離して試算できるようにしている）
// 盤は よこ3×たて4。こちら（下）と あいて（上）が 4こずつ。とった こまは じぶんの こまとして 打てる。
// かち：あいての おうを とる／じぶんの おうが いちばん むこうの だんに着いて、つぎに とられない

export const COLS = 3
export const ROWS = 4

export type Kind = 'ou' | 'hi' | 'kaku' | 'fu' | 'kin' // おう・たて（よこ・たてに1）・なな（ななめに1）・ふ・ふが なった こま
export type Side = 0 | 1 // 0＝こちら（下から上へ進む） 1＝あいて
export interface Piece { kind: Kind; side: Side }
export interface State {
  board: (Piece | null)[]   // r * COLS + c。r=0 が いちばん上
  hand: [Kind[], Kind[]]     // もちごま（なった こまは もとに もどして持つ）
  turn: Side
  ply: number
}
export type Move = { from: number; to: number } | { drop: Kind; to: number }

export const MAX_PLY = 80 // これより長いと ひきわけ

// こまが進める むき（こちら側から見て。dr<0 が まえ）
const STEPS: Record<Kind, [number, number][]> = {
  ou: [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]],
  hi: [[-1, 0], [1, 0], [0, -1], [0, 1]],
  kaku: [[-1, -1], [-1, 1], [1, -1], [1, 1]],
  fu: [[-1, 0]],
  kin: [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, 0]],
}
export function stepsOf(kind: Kind, side: Side): [number, number][] {
  return STEPS[kind].map(([dr, dc]) => (side === 0 ? [dr, dc] : [-dr, -dc]) as [number, number])
}

export function initial(): State {
  const b: (Piece | null)[] = new Array(COLS * ROWS).fill(null)
  const put = (r: number, c: number, kind: Kind, side: Side) => { b[r * COLS + c] = { kind, side } }
  put(0, 0, 'hi', 1); put(0, 1, 'ou', 1); put(0, 2, 'kaku', 1); put(1, 1, 'fu', 1)
  put(3, 0, 'kaku', 0); put(3, 1, 'ou', 0); put(3, 2, 'hi', 0); put(2, 1, 'fu', 0)
  return { board: b, hand: [[], []], turn: 0, ply: 0 }
}

const farRow = (side: Side) => (side === 0 ? 0 : ROWS - 1)

export function legalMoves(s: State): Move[] {
  const out: Move[] = []
  const me = s.turn
  s.board.forEach((p, i) => {
    if (!p || p.side !== me) return
    const r = Math.floor(i / COLS), c = i % COLS
    for (const [dr, dc] of stepsOf(p.kind, me)) {
      const nr = r + dr, nc = c + dc
      if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) continue
      const t = s.board[nr * COLS + nc]
      if (t && t.side === me) continue
      out.push({ from: i, to: nr * COLS + nc })
    }
  })
  // もちごまを打つ（ふは いちばん むこうの だんには 打てない）
  for (const kind of new Set(s.hand[me])) {
    s.board.forEach((p, i) => {
      if (p) return
      if (kind === 'fu' && Math.floor(i / COLS) === farRow(me)) return
      out.push({ drop: kind, to: i })
    })
  }
  return out
}

export function apply(s: State, m: Move): State {
  const board = s.board.slice()
  const hand: [Kind[], Kind[]] = [s.hand[0].slice(), s.hand[1].slice()]
  const me = s.turn
  if ('drop' in m) {
    hand[me].splice(hand[me].indexOf(m.drop), 1)
    board[m.to] = { kind: m.drop, side: me }
  } else {
    const p = board[m.from]!
    const t = board[m.to]
    if (t) hand[me].push(t.kind === 'kin' ? 'fu' : t.kind)
    let kind = p.kind
    if (kind === 'fu' && Math.floor(m.to / COLS) === farRow(me)) kind = 'kin'
    board[m.to] = { kind, side: me }
    board[m.from] = null
  }
  return { board, hand, turn: (1 - me) as Side, ply: s.ply + 1 }
}

// かちまけ：0 か 1 が かち、'draw'＝ひきわけ、null＝つづく
export function result(s: State): Side | 'draw' | null {
  const kings = s.board.map((p, i) => (p && p.kind === 'ou' ? { side: p.side, i } : null)).filter(Boolean) as { side: Side; i: number }[]
  for (const side of [0, 1] as Side[]) if (!kings.some((k) => k.side === side)) return (1 - side) as Side
  // おうが むこうの だんに着き、あいての番で とられずに じぶんの番が もどってきたら かち
  for (const k of kings) {
    if (k.side === s.turn && Math.floor(k.i / COLS) === farRow(k.side)) return k.side
  }
  if (s.ply >= MAX_PLY) return 'draw'
  return null
}

const VALUE: Record<Kind, number> = { ou: 1000, hi: 5, kaku: 4, kin: 6, fu: 1 }

// あいて（side）から見た よさ
function evaluate(s: State, side: Side): number {
  let v = 0
  s.board.forEach((p, i) => {
    if (!p) return
    const sign = p.side === side ? 1 : -1
    v += sign * VALUE[p.kind]
    if (p.kind === 'ou') { // おうが むこうへ進むほど すこし よい（トライを ねらう）
      const r = Math.floor(i / COLS)
      v += sign * 0.3 * (p.side === 0 ? ROWS - 1 - r : r)
    }
  })
  for (const sd of [0, 1] as Side[]) for (const k of s.hand[sd]) v += (sd === side ? 1 : -1) * VALUE[k] * 0.9
  return v
}

function search(s: State, depth: number, alpha: number, beta: number, side: Side): number {
  const r = result(s)
  if (r === side) return 10000 + depth
  if (r !== null && r !== 'draw') return -10000 - depth
  if (r === 'draw') return 0
  if (depth === 0) return evaluate(s, side)
  const moves = legalMoves(s)
  if (s.turn === side) {
    let best = -Infinity
    for (const m of moves) {
      best = Math.max(best, search(apply(s, m), depth - 1, alpha, beta, side))
      alpha = Math.max(alpha, best)
      if (alpha >= beta) break
    }
    return best
  }
  let best = Infinity
  for (const m of moves) {
    best = Math.min(best, search(apply(s, m), depth - 1, alpha, beta, side))
    beta = Math.min(beta, best)
    if (alpha >= beta) break
  }
  return best
}

// つよさ：やさしい＝1手先だけ見て半分は でたらめ／ふつう＝2手先／つよい＝4手先。数値は、ねらわれた こまが光る 手助けを使う こども（2手先・4回に1回まちがえる）が やさしい 7割・ふつう 4割前後・つよい 1割前後 かつように 試算で決めた
export const LEVELS = [
  { name: 'やさしい', depth: 1, mistake: 0.5 },
  { name: 'ふつう', depth: 2, mistake: 0.2 },
  { name: 'つよい', depth: 4, mistake: 0.05 },
]

type Rand = () => number
export function chooseMove(s: State, level: number, rand: Rand = Math.random): Move {
  const L = LEVELS[level]
  const moves = legalMoves(s)
  if (rand() < L.mistake) return moves[Math.floor(rand() * moves.length)]
  let best = -Infinity, picks: Move[] = []
  for (const m of moves) {
    const v = search(apply(s, m), L.depth - 1, -Infinity, Infinity, s.turn)
    if (v > best + 1e-9) { best = v; picks = [m] } else if (Math.abs(v - best) < 1e-9) picks.push(m)
  }
  return picks[Math.floor(rand() * picks.length)]
}
