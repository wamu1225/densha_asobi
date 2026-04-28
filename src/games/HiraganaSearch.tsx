import { useState } from 'react'
import { GameLayout } from '../components/GameLayout'

const GRAD = 'linear-gradient(135deg, #67e8f9, #06b6d4)'

interface WordDef { word: string; cells: [number, number][] }
interface Puzzle { title: string; grid: string[][]; words: WordDef[] }

const PUZZLES: Puzzle[] = [
  {
    title: 'どうぶつ①',
    grid: [
      ['ね','こ','て','れ','い','ぬ'],
      ['い','と','り','あ','し','か'],
      ['な','ろ','く','ほ','ま','ん'],
      ['く','は','な','こ','た','ち'],
      ['め','ぐ','さ','か','な','き'],
      ['か','ゆ','ぷ','て','も','ろ'],
    ],
    words: [
      { word: 'ねこ',   cells: [[0,0],[0,1]] },
      { word: 'とり',   cells: [[1,1],[1,2]] },
      { word: 'いぬ',   cells: [[0,4],[0,5]] },
      { word: 'さかな', cells: [[4,2],[4,3],[4,4]] },
    ],
  },
  {
    title: 'どうぶつ②',
    grid: [
      ['う','さ','ぎ','て','ぞ','う'],
      ['ま','ら','く','れ','い','わ'],
      ['く','め','ほ','ぬ','し','か'],
      ['ら','と','か','も','の','め'],
      ['い','つ','か','め','て','く'],
      ['の','き','ん','ぎ','ょ','い'],
    ],
    words: [
      { word: 'うさぎ',   cells: [[0,0],[0,1],[0,2]] },
      { word: 'ぞう',     cells: [[0,4],[0,5]] },
      { word: 'かめ',     cells: [[4,2],[4,3]] },
      { word: 'きんぎょ', cells: [[5,1],[5,2],[5,3],[5,4]] },
    ],
  },
  {
    title: 'くだもの①',
    grid: [
      ['り','ん','ご','も','か','て'],
      ['わ','れ','く','も','す','ね'],
      ['な','し','た','か','り','ぬ'],
      ['き','め','ほ','ぐ','ら','ん'],
      ['い','ち','ご','は','ぷ','む'],
      ['か','れ','わ','し','て','き'],
    ],
    words: [
      { word: 'りんご', cells: [[0,0],[0,1],[0,2]] },
      { word: 'もも',   cells: [[0,3],[1,3]] },
      { word: 'なし',   cells: [[2,0],[2,1]] },
      { word: 'いちご', cells: [[4,0],[4,1],[4,2]] },
    ],
  },
  {
    title: 'くだもの②',
    grid: [
      ['バ','ナ','ナ','か','め','ろ'],
      ['ぶ','ど','う','わ','み','ん'],
      ['れ','ん','ほ','た','か','く'],
      ['い','ろ','て','ぬ','ん','ぎ'],
      ['す','い','か','く','め','て'],
      ['か','ゆ','つ','ら','し','も'],
    ],
    words: [
      { word: 'バナナ', cells: [[0,0],[0,1],[0,2]] },
      { word: 'ぶどう', cells: [[1,0],[1,1],[1,2]] },
      { word: 'みかん', cells: [[1,4],[2,4],[3,4]] },
      { word: 'すいか', cells: [[4,0],[4,1],[4,2]] },
    ],
  },
  {
    title: 'のりもの①',
    grid: [
      ['ひ','こ','う','き','か','く'],
      ['な','め','ら','ぬ','し','る'],
      ['き','ほ','て','れ','ん','ま'],
      ['で','ん','し','ゃ','ぷ','ふ'],
      ['わ','き','め','ら','て','ね'],
      ['か','ゆ','ぬ','さ','け','ぶ'],
    ],
    words: [
      { word: 'ひこうき', cells: [[0,0],[0,1],[0,2],[0,3]] },
      { word: 'でんしゃ', cells: [[3,0],[3,1],[3,2],[3,3]] },
      { word: 'くるま',   cells: [[0,5],[1,5],[2,5]] },
      { word: 'ふね',     cells: [[3,5],[4,5]] },
    ],
  },
  {
    title: 'のりもの②',
    // 'いか' を削除し 'くるま' を縦 col4 row1-3 に配置
    grid: [
      ['バ','イ','ク','か','ろ','め'],
      ['ゆ','い','れ','な','く','し'],
      ['バ','ス','ほ','て','る','ん'],
      ['め','ん','く','ら','ま','か'],
      ['タ','ク','シ','ー','ぬ','き'],
      ['き','ゆ','ぬ','さ','け','ぶ'],
    ],
    words: [
      { word: 'バイク',   cells: [[0,0],[0,1],[0,2]] },
      { word: 'バス',     cells: [[2,0],[2,1]] },
      { word: 'くるま',   cells: [[1,4],[2,4],[3,4]] },
      { word: 'タクシー', cells: [[4,0],[4,1],[4,2],[4,3]] },
    ],
  },
]

type CellKey = string
function key(r: number, c: number): CellKey { return `${r},${c}` }

function cellsBetween(a: [number, number], b: [number, number]): [number, number][] {
  const [r1, c1] = a, [r2, c2] = b
  if (r1 === r2) {
    const [lo, hi] = [Math.min(c1, c2), Math.max(c1, c2)]
    return Array.from({ length: hi - lo + 1 }, (_, i) => [r1, lo + i])
  }
  if (c1 === c2) {
    const [lo, hi] = [Math.min(r1, r2), Math.max(r1, r2)]
    return Array.from({ length: hi - lo + 1 }, (_, i) => [lo + i, c1])
  }
  return [a]
}

// セルの位置が一致するか（前向き or 後ろ向き）— 文字列一致ではなく位置一致で判定
function cellsMatch(selected: [number, number][], defined: [number, number][]): boolean {
  if (selected.length !== defined.length) return false
  const fwd = defined.every(([r, c], i) => selected[i][0] === r && selected[i][1] === c)
  if (fwd) return true
  const rev = [...defined].reverse().every(([r, c], i) => selected[i][0] === r && selected[i][1] === c)
  return rev
}

export function HiraganaSearch() {
  const [pIdx, setPIdx] = useState(0)
  const [found, setFound] = useState(new Set<string>())
  const [startCell, setStartCell] = useState<[number, number] | null>(null)
  const [done, setDone] = useState(false)
  const [justFound, setJustFound] = useState<string | null>(null)
  const puzzle = PUZZLES[pIdx]

  function getFoundCells(): Set<CellKey> {
    const s = new Set<CellKey>()
    puzzle.words.forEach(w => {
      if (found.has(w.word)) w.cells.forEach(([r, c]) => s.add(key(r, c)))
    })
    return s
  }

  function tap(r: number, c: number) {
    if (!startCell) { setStartCell([r, c]); return }

    // ㉑修正: 対角線は明示的にはじいてフィードバックを出す
    const [r1, c1] = startCell
    const isDiagonal = r1 !== r && c1 !== c
    if (isDiagonal) {
      setStartCell(null)
      setJustFound('❌ たてかよこでえらんでね！')
      setTimeout(() => setJustFound(null), 800)
      return
    }

    const selected = cellsBetween(startCell, [r, c])
    const match = puzzle.words.find(
      w => !found.has(w.word) && cellsMatch(selected, w.cells),
    )

    if (match) {
      const next = new Set(found)
      next.add(match.word)
      setFound(next)
      setJustFound(`✅ 「${match.word}」みつけた！`)
      setTimeout(() => setJustFound(null), 1200)
      if (next.size === puzzle.words.length) setDone(true)
    }
    setStartCell(null)
  }

  function changePuzzle(delta: number) {
    setPIdx(i => (i + delta + PUZZLES.length) % PUZZLES.length)
    setFound(new Set()); setStartCell(null); setDone(false)
  }

  const foundCells = getFoundCells()
  const startKey = startCell ? key(startCell[0], startCell[1]) : null

  return (
    <GameLayout title="ひらがなさがし" gradient={GRAD}>
      <div className="flex flex-col items-center gap-3">
        <div className="flex justify-between w-full">
          <span className="text-base font-bold text-gray-700">{pIdx + 1}/{PUZZLES.length}：{puzzle.title}</span>
          <span className="text-sm font-bold text-gray-600">{found.size}/{puzzle.words.length}</span>
        </div>

        {done && (
          <div className="w-full rounded-2xl px-5 py-3 text-center bounce-in shadow-lg" style={{ background: 'linear-gradient(135deg,#fbbf24,#f59e0b)' }}>
            <p className="text-2xl font-black text-white">🎉 ぜんぶみつけた！</p>
          </div>
        )}
        {justFound && (
          <div className="bg-green-100 border-2 border-green-400 rounded-xl px-5 py-2 text-center bounce-in">
            <p className="text-lg font-black text-green-700">✅ 「{justFound}」みつけた！</p>
          </div>
        )}

        <p className="text-xs text-gray-500 text-center font-bold">
          {startCell ? '📍 エンドをタップ！（たて・よこ）' : '📍 スタートをタップ！'}
        </p>

        <div className="bg-white rounded-2xl border-2 border-cyan-200 p-2 shadow-md w-full">
          <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(6, 1fr)' }}>
            {puzzle.grid.map((row, r) =>
              row.map((cell, c) => {
                const k = key(r, c)
                const isFound = foundCells.has(k)
                const isSel = startKey === k
                return (
                  <button
                    key={k}
                    onClick={() => tap(r, c)}
                    className={`aspect-square rounded-lg text-base font-black flex items-center justify-center active:scale-90 ${
                      isFound ? 'text-white shadow' :
                      isSel ? 'cell-pulse bg-cyan-100 text-cyan-800' :
                      'bg-gray-50 text-gray-700 border border-gray-200'
                    }`}
                    style={isFound ? { background: GRAD } : {}}
                  >
                    {cell}
                  </button>
                )
              }),
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 w-full">
          {puzzle.words.map(w => (
            <span
              key={w.word}
              className={`px-3 py-2 rounded-xl text-base font-bold border-2 transition-all ${
                found.has(w.word) ? 'text-white border-transparent' : 'bg-white text-gray-700 border-cyan-200'
              }`}
              style={found.has(w.word) ? { background: GRAD } : {}}
            >
              {found.has(w.word) ? '✓ ' : ''}{w.word}
            </span>
          ))}
        </div>

        <div className="flex gap-2 w-full">
          <button onClick={() => changePuzzle(-1)} className="flex-1 py-3 text-sm font-bold bg-white text-gray-600 rounded-xl shadow border border-gray-200 active:scale-95">← まえ</button>
          <button onClick={() => changePuzzle(1)} className="flex-1 py-3 text-sm font-bold text-white rounded-xl shadow active:scale-95" style={{ background: GRAD }}>つぎ →</button>
        </div>
      </div>
    </GameLayout>
  )
}
