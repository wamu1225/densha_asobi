// せんろ つなぎ の盤面ロジック（画面から切り離して試算できるようにしている）
// マスごとに線路の口を4方向のビットで持つ。上=1 右=2 下=4 左=8。タップで右回りに90度まわる。

export const N = 1, E = 2, S = 4, W = 8
const DIRS = [N, E, S, W]
const DC: Record<number, number> = { [N]: 0, [E]: 1, [S]: 0, [W]: -1 }
const DR: Record<number, number> = { [N]: -1, [E]: 0, [S]: 1, [W]: 0 }
const OPP: Record<number, number> = { [N]: S, [E]: W, [S]: N, [W]: E }

export interface StageDef {
  cols: number
  rows: number
  decoys: boolean   // 道に関係ないマスにも線路を置く（false は空き地）
  locked: number    // はじめから正しい向きで動かせないマスの数（手がかり）
  minLen: number    // 道の長さの下限（長いほど くねくね曲がる）
}

// 横は5マスまで（390px の画面でマスが56px以上になる）。難しさは縦の長さで出す。数値は試算で決めた（scripts の試算で、どのステージも必ず解ける・はじめから解けている盤が無いことを確かめた）
export const STAGES: StageDef[] = [
  { cols: 3, rows: 3, decoys: false, locked: 1, minLen: 4 },
  { cols: 4, rows: 3, decoys: false, locked: 1, minLen: 6 },
  { cols: 4, rows: 4, decoys: true,  locked: 2, minLen: 8 },
  { cols: 5, rows: 4, decoys: true,  locked: 2, minLen: 10 },
  { cols: 5, rows: 5, decoys: true,  locked: 2, minLen: 13 },
  { cols: 5, rows: 6, decoys: true,  locked: 1, minLen: 16 },
  { cols: 5, rows: 7, decoys: true,  locked: 1, minLen: 19 },
  { cols: 5, rows: 7, decoys: true,  locked: 0, minLen: 23 },
]

export function rotate(m: number): number {
  // 右回り：上→右→下→左→上
  return ((m << 1) & 0xf) | (m >> 3)
}

export interface Board {
  cols: number
  rows: number
  tiles: number[]      // 今の向き
  answer: number[]     // 正解の向き（道でないマスはどの向きでもよい）
  path: number[]       // 道のマス（左の駅から右の駅まで）
  locked: boolean[]
  startRow: number     // 左の駅がある行
  goalRow: number      // 右の駅がある行
}

type Rand = () => number

// 左の端から右の端まで、同じマスを2度通らない道を作る（上下にも曲がる）
function makePath(cols: number, rows: number, minLen: number, rand: Rand): number[] | null {
  const startRow = Math.floor(rand() * rows)
  const seen = new Set<number>()
  const path: number[] = []
  let steps = 0
  function dfs(c: number, r: number): boolean {
    if (++steps > 20000) return false // 探しすぎたら作り直す
    const i = r * cols + c
    seen.add(i); path.push(i)
    if (c === cols - 1 && path.length >= minLen) return true
    const moves = [[1, 0], [0, -1], [0, 1], [-1, 0]].sort(() => rand() - 0.5)
    for (const [dc, dr] of moves) {
      const nc = c + dc, nr = r + dr
      if (nc < 0 || nc >= cols || nr < 0 || nr >= rows) continue
      if (seen.has(nr * cols + nc)) continue
      if (dfs(nc, nr)) return true
    }
    seen.delete(i); path.pop()
    return false
  }
  return dfs(0, startRow) ? path : null
}

function dirBetween(a: number, b: number, cols: number): number {
  const d = b - a
  if (d === 1) return E
  if (d === -1) return W
  if (d === cols) return S
  return N
}

export function newBoard(def: StageDef, rand: Rand = Math.random): Board {
  const { cols, rows } = def
  let path: number[] | null = null
  while (!path) path = makePath(cols, rows, def.minLen, rand)
  const n = cols * rows
  const answer = new Array<number>(n).fill(0)
  path.forEach((cell, k) => {
    const into = k === 0 ? W : OPP[dirBetween(path![k - 1], cell, cols)]
    const out = k === path!.length - 1 ? E : dirBetween(cell, path![k + 1], cols)
    answer[cell] = into | out
  })
  if (def.decoys) {
    for (let i = 0; i < n; i++) if (!answer[i]) answer[i] = rand() < 0.5 ? (N | S) : (N | E)
  }
  const locked = new Array<boolean>(n).fill(false)
  const inner = path.slice(1, -1).sort(() => rand() - 0.5)
  for (let k = 0; k < def.locked && k < inner.length; k++) locked[inner[k]] = true
  const tiles = answer.map((m, i) => {
    if (!m || locked[i]) return m
    let t = m
    for (let k = 1 + Math.floor(rand() * 3); k > 0; k--) t = rotate(t)
    return t
  })
  const b: Board = { cols, rows, tiles, answer, path, locked, startRow: Math.floor(path[0] / cols), goalRow: Math.floor(path[path.length - 1] / cols) }
  // まわす前から つながっていたら、道のマスを1つ ずらす
  if (traceRoute(b).ok) {
    const free = path.find((i) => !locked[i] && rotate(tiles[i]) !== tiles[i])
    if (free !== undefined) tiles[free] = rotate(tiles[free])
  }
  return b
}

// 左の駅から線路をたどる。右の駅まで行ければ ok。たどれたマスの並びも返す（電車を走らせる）
export function traceRoute(b: Board): { ok: boolean; cells: number[] } {
  const cells: number[] = []
  let c = 0, r = b.startRow, from = W
  const seen = new Set<number>()
  for (;;) {
    if (c < 0 || c >= b.cols || r < 0 || r >= b.rows) return { ok: false, cells }
    const i = r * b.cols + c
    const m = b.tiles[i]
    if (!(m & from) || seen.has(i)) return { ok: false, cells }
    seen.add(i); cells.push(i)
    const out = m & ~from
    if (c === b.cols - 1 && r === b.goalRow && (out & E)) return { ok: true, cells }
    if (!DIRS.includes(out)) return { ok: false, cells }
    c += DC[out]; r += DR[out]; from = OPP[out]
  }
}

// いちばん少なく まわすと何回で つながるか（記録の目安。道のマスだけ数える）
export function minTurns(b: Board): number {
  let t = 0
  for (const i of b.path) {
    let m = b.tiles[i], k = 0
    while (m !== b.answer[i] && k < 4) { m = rotate(m); k++ }
    // まっすぐの線路は2回で同じ形に戻る
    if ((b.answer[i] === (N | S) || b.answer[i] === (E | W)) && k >= 2) k -= 2
    t += k
  }
  return t
}
