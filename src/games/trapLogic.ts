// とおせんぼトロッコ の盤面ロジック（画面から切り離して試算できるようにしている）
// 盤は六角形のマスを ずらして並べた COLS×ROWS。奇数行が半マス右へずれる（odd-r）。

export const COLS = 9
export const ROWS = 9

export interface StageDef {
  tunnels: number     // 盤のふちに開くトンネル（にげ口）の数。0 はふち全部が にげ口
  blocks: number      // はじめから置いてある さく の数
  showNext: boolean   // トロッコの つぎの いき先を見せる
  smart: boolean      // にげ道の多い方を選ぶ（false は同じ近さなら でたらめ）
}

// ステージが進むほど にげ口が増える。最後の2つは ふち全部が にげ口（元の遊びと同じ形）。
// 数値は勝率の試算で決めた（つぎの いき先をふさぐだけの遊び方で 1〜4 は全勝・5〜7 は8割前後・8〜9 は約半分・10 は4回に1回。先を読めば 8〜9 は8割・10 は半分）
export const STAGES: StageDef[] = [
  { tunnels: 4,  blocks: 10, showNext: true,  smart: false },
  { tunnels: 6,  blocks: 10, showNext: true,  smart: false },
  { tunnels: 8,  blocks: 9,  showNext: true,  smart: true },
  { tunnels: 10, blocks: 9,  showNext: false, smart: true },
  { tunnels: 12, blocks: 8,  showNext: false, smart: true },
  { tunnels: 14, blocks: 8,  showNext: false, smart: true },
  { tunnels: 16, blocks: 8,  showNext: false, smart: true },
  { tunnels: 20, blocks: 9,  showNext: false, smart: true },
  { tunnels: 0,  blocks: 15, showNext: false, smart: true },
  { tunnels: 0,  blocks: 11, showNext: false, smart: true },
]

export const idx = (c: number, r: number) => r * COLS + c
export const colOf = (i: number) => i % COLS
export const rowOf = (i: number) => Math.floor(i / COLS)
export const CENTER = idx(Math.floor(COLS / 2), Math.floor(ROWS / 2))

export function isEdge(i: number) {
  const c = colOf(i), r = rowOf(i)
  return c === 0 || r === 0 || c === COLS - 1 || r === ROWS - 1
}

export function neighbors(i: number): number[] {
  const c = colOf(i), r = rowOf(i)
  const odd = r % 2 === 1
  const d = odd
    ? [[1, 0], [-1, 0], [0, -1], [1, -1], [0, 1], [1, 1]]
    : [[1, 0], [-1, 0], [-1, -1], [0, -1], [-1, 1], [0, 1]]
  const out: number[] = []
  for (const [dc, dr] of d) {
    const nc = c + dc, nr = r + dr
    if (nc >= 0 && nc < COLS && nr >= 0 && nr < ROWS) out.push(idx(nc, nr))
  }
  return out
}

export interface Board {
  blocked: boolean[]
  exits: boolean[]    // にげ口のマス
  cart: number
}

type Rand = () => number

function shuffle<T>(a: T[], rand: Rand): T[] {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function newBoard(def: StageDef, rand: Rand = Math.random): Board {
  const n = COLS * ROWS
  const exits = new Array<boolean>(n).fill(false)
  const edge = Array.from({ length: n }, (_, i) => i).filter(isEdge)
  if (def.tunnels === 0) {
    for (const i of edge) exits[i] = true
  } else {
    // ふちを一周する順に並べ、ほぼ等間隔に置く（かたまると簡単すぎる）
    const ring = edge.slice().sort((a, b) => ang(a) - ang(b))
    const step = ring.length / def.tunnels
    const off = rand() * step
    for (let k = 0; k < def.tunnels; k++) exits[ring[Math.floor(off + k * step) % ring.length]] = true
  }
  const blocked = new Array<boolean>(n).fill(false)
  const near = new Set([CENTER, ...neighbors(CENTER)])
  const cand = shuffle(Array.from({ length: n }, (_, i) => i).filter(i => !near.has(i) && !exits[i]), rand)
  for (let k = 0; k < def.blocks; k++) blocked[cand[k]] = true
  return { blocked, exits, cart: CENTER }
}

function ang(i: number) {
  return Math.atan2(rowOf(i) - (ROWS - 1) / 2, colOf(i) + (rowOf(i) % 2) * 0.5 - (COLS - 1) / 2)
}

// にげ口からの距離（さく を通らない最短の歩数）。たどり着けないマスは Infinity
export function distToExit(b: Board): number[] {
  const n = COLS * ROWS
  const dist = new Array<number>(n).fill(Infinity)
  const q: number[] = []
  for (let i = 0; i < n; i++) if (b.exits[i] && !b.blocked[i]) { dist[i] = 0; q.push(i) }
  for (let h = 0; h < q.length; h++) {
    const i = q[h]
    for (const j of neighbors(i)) {
      if (b.blocked[j] || dist[j] !== Infinity) continue
      dist[j] = dist[i] + 1
      q.push(j)
    }
  }
  return dist
}

// トロッコの つぎの いき先。にげ道が無ければ、とじこめられた（null）
export function nextStep(b: Board, smart: boolean, rand: Rand = Math.random): number | null {
  const dist = distToExit(b)
  if (dist[b.cart] === Infinity) return null
  const opts = neighbors(b.cart).filter(j => !b.blocked[j])
  const best = Math.min(...opts.map(j => dist[j]))
  let cands = opts.filter(j => dist[j] === best)
  if (smart && cands.length > 1) {
    // 1か所ふさがれても まだ近道が残る方へ。近道の本数が多いマスを選ぶ
    const ways = countShortestWays(b, dist)
    const top = Math.max(...cands.map(j => ways[j]))
    cands = cands.filter(j => ways[j] === top)
  }
  return cands[Math.floor(rand() * cands.length)]
}

function countShortestWays(b: Board, dist: number[]): number[] {
  const n = COLS * ROWS
  const ways = new Array<number>(n).fill(0)
  const order = Array.from({ length: n }, (_, i) => i).filter(i => dist[i] !== Infinity).sort((a, c) => dist[a] - dist[c])
  for (const i of order) {
    if (dist[i] === 0) { ways[i] = 1; continue }
    for (const j of neighbors(i)) if (!b.blocked[j] && dist[j] === dist[i] - 1) ways[i] += ways[j]
  }
  return ways
}

// トロッコが とじこめられた場所（いける マス全部）。勝ったときに色をつける
export function reachable(b: Board): number[] {
  const seen = new Set([b.cart])
  const q = [b.cart]
  for (let h = 0; h < q.length; h++) for (const j of neighbors(q[h])) {
    if (b.blocked[j] || seen.has(j)) continue
    seen.add(j); q.push(j)
  }
  return [...seen]
}
