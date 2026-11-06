// れっしゃ いれかえ のロジック（画面から切り離して試算できるようにしている）
// 右の線路に ばらばらの順で車両が並ぶ。ひきこみせん（行き止まり）は1本で、最後に入れた車両から出る。
// 左の線路へ 1,2,3… の順に出せたら完成。ひきこみせん1本で並べられる順番だけを出題する。

export interface StageDef {
  cars: number
  maxWait: number   // ひきこみせんに同時に入る車両の数の上限（多いほど むずかしい）
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

export function newOrder(def: StageDef, rand: Rand = Math.random): number[] {
  for (;;) {
    const a = Array.from({ length: def.cars }, (_, i) => i + 1)
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]]
    }
    const r = solve(a)
    // 並べられる・すでに並んでいない・ひきこみせんを ちょうど上限まで使う問題だけを出す
    if (r.ok && r.maxWait === def.maxWait) return a
  }
}
