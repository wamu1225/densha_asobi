// どっちがおおきい の もんだい づくり（画面から切り離して試算できるようにしている）
export type Level = 1 | 2 | 3

// うえの けたで すぐ きまる もんだいばかりに ならないよう、3つの かたちを まぜる
// ・ふつう（でたらめ）・うえの けたが おなじ（47 と 42）・おなじ すうじの いれかえ（381 と 318）
export function makePair(level: Level, rand: () => number = Math.random) {
  const digits = level + 1
  const [lo, hi] = [10 ** (digits - 1), 10 ** digits - 1]
  const any = () => Math.floor(rand() * (hi - lo + 1)) + lo
  const r = rand()
  let a = any(), b = a
  if (r < 0.4) {
    while (a === b) b = any()
  } else if (r < 0.75) {
    // うえから same けたを そろえる（2けたは 1けた、3・4けたは 1〜2けた）
    const same = digits === 2 ? 1 : 1 + Math.floor(rand() * 2)
    const p = 10 ** (digits - same)
    for (let k = 0; k < 50 && a === b; k++) b = Math.floor(a / p) * p + Math.floor(rand() * p)
    while (a === b || b < lo) b = any()
  } else {
    // おなじ すうじを ならべかえる（ぜんぶ おなじ すうじなら つくりなおす）
    for (let k = 0; k < 50 && a === b; k++) {
      a = any()
      const ds = String(a).split('')
      for (let i = ds.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [ds[i], ds[j]] = [ds[j], ds[i]] }
      b = Number(ds.join(''))
      if (b < lo) b = a
    }
    while (a === b) b = any()
  }
  return { a, b }
}
