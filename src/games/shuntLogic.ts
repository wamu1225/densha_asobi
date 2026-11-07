// れっしゃ いれかえ のロジック（画面から切り離して試算できるようにしている）
// 右の線路に ばらばらの順で車両が並ぶ。ひきこみせん（行き止まり）は1本で、最後に入れた車両から出る。
// 左の線路へ 1,2,3… の順に出せたら完成。出題は、ひきこみせん1本で並べられる順番だけ。
// ステージ9から ひきこみせんが2本。出題は「1本では並べられず、2本なら並べられる」順番だけ（2本目を どう使うかを考える）

export interface StageDef {
  cars: number
  maxWait: number   // ひきこみせんに同時に入る車両の数の上限（多いほど むずかしい）。2本の ステージでは使わない
  sidings?: 2       // ひきこみせんの本数（書かなければ1本）
}

export const STAGES: StageDef[] = [
  { cars: 3, maxWait: 1 },
  { cars: 4, maxWait: 1 },
  { cars: 4, maxWait: 2 },
  { cars: 5, maxWait: 2 },
  { cars: 5, maxWait: 3 },
  { cars: 6, maxWait: 3 },
  { cars: 7, maxWait: 3 },
  { cars: 7, maxWait: 4 },
  { cars: 5, maxWait: 0, sidings: 2 },
  { cars: 6, maxWait: 0, sidings: 2 },
  { cars: 7, maxWait: 0, sidings: 2 },
  { cars: 8, maxWait: 0, sidings: 2 },
]

type Rand = () => number

// いちばん少ない手順で並べたときの手数と、そのときひきこみせんに同時に入る数の最大
export function solve(order: number[]): { ok: boolean; moves: number; maxWait: number } {
  const wait: number[] = []
  let need = 1, moves = 0, maxWait = 0
  for (const car of order) {
    if (car === need) { moves++; need++ } else { wait.push(car); moves++; maxWait = Math.max(maxWait, wait.length) }
    while (wait.length && wait[wait.length - 1] === need) { wait.pop(); moves++; need++ }
  }
  return { ok: need === order.length + 1, moves, maxWait }
}

// ひきこみせん2本で いちばん少ない手数（全部の動かし方を広さ優先で調べる）。並べられなければ -1
// 動かし方は「くる→ホーム」「くる→ひきこみせん」「ひきこみせん→ホーム」の3種類（ひきこみせんどうしは動かさない）
export function solve2(order: number[]): number {
  const n = order.length
  const key = (i: number, a: number[], b: number[]) => `${i}|${a.join(',')}|${b.join(',')}`
  let frontier: [number, number[], number[], number][] = [[0, [], [], 1]]
  const seen = new Set([key(0, [], [])])
  for (let d = 0; frontier.length; d++) {
    const next: typeof frontier = []
    for (const [i, a, b, need] of frontier) {
      if (need === n + 1) return d
      const push = (st: [number, number[], number[], number]) => {
        const k = key(st[0], st[1], st[2])
        if (!seen.has(k)) { seen.add(k); next.push(st) }
      }
      if (i < n && order[i] === need) push([i + 1, a, b, need + 1])
      if (i < n) { push([i + 1, [...a, order[i]], b, need]); push([i + 1, a, [...b, order[i]], need]) }
      if (a.length && a[a.length - 1] === need) push([i, a.slice(0, -1), b, need + 1])
      if (b.length && b[b.length - 1] === need) push([i, a, b.slice(0, -1), need + 1])
    }
    frontier = next
  }
  return -1
}

export function newOrder(def: StageDef, rand: Rand = Math.random): number[] {
  for (;;) {
    const a = Array.from({ length: def.cars }, (_, i) => i + 1)
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]]
    }
    const r = solve(a)
    if (def.sidings === 2) { if (!r.ok && solve2(a) > 0) return a; continue }
    // 並べられる・すでに並んでいない・ひきこみせんを ちょうど上限まで使う問題だけを出す
    if (r.ok && r.maxWait === def.maxWait) return a
  }
}
