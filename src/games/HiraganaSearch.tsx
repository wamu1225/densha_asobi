import { useState } from 'react'
import { GameLayout } from '../components/GameLayout'

interface Puzzle {
  title: string
  grid: string[][]
  words: { word: string; cells: [number, number][] }[]
}

const PUZZLES: Puzzle[] = [
  {
    title: 'どうぶつ',
    grid: [
      ['ね','こ','て','れ','い','ぬ'],
      ['い','と','り','あ','し','か'],
      ['な','ろ','く','ね','ま','ん'],
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
    title: 'くだもの',
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
    title: 'のりもの',
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
]

type CellKey = string
function key(r: number, c: number): CellKey { return `${r},${c}` }

export function HiraganaSearch() {
  const [puzzleIdx, setPuzzleIdx] = useState(0)
  const [found, setFound] = useState(new Set<string>())
  const [selected, setSelected] = useState(new Set<CellKey>())
  const [startCell, setStartCell] = useState<[number, number] | null>(null)
  const [done, setDone] = useState(false)

  const puzzle = PUZZLES[puzzleIdx]

  function getFoundCells(): Set<CellKey> {
    const s = new Set<CellKey>()
    puzzle.words.forEach(w => {
      if (found.has(w.word)) w.cells.forEach(([r, c]) => s.add(key(r, c)))
    })
    return s
  }

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

  function tap(r: number, c: number) {
    if (!startCell) {
      setStartCell([r, c])
      setSelected(new Set([key(r, c)]))
      return
    }
    const cells = cellsBetween(startCell, [r, c])
    const word = cells.map(([row, col]) => puzzle.grid[row][col]).join('')
    const reversed = [...word].reverse().join('')

    const match = puzzle.words.find(w => (w.word === word || w.word === reversed) && !found.has(w.word))
    if (match) {
      const next = new Set(found)
      next.add(match.word)
      setFound(next)
      if (next.size === puzzle.words.length) setDone(true)
    }
    setStartCell(null)
    setSelected(new Set())
  }

  function nextPuzzle() {
    const next = (puzzleIdx + 1) % PUZZLES.length
    setPuzzleIdx(next); setFound(new Set()); setSelected(new Set()); setStartCell(null); setDone(false)
  }

  const foundCells = getFoundCells()

  return (
    <GameLayout title="ひらがなさがし" color="bg-cyan-400">
      <div className="flex flex-col items-center gap-4">
        {done && (
          <div className="bg-yellow-100 border-2 border-yellow-400 rounded-2xl px-6 py-3 text-center bounce-in">
            <p className="text-2xl font-bold text-yellow-600">🎉 ぜんぶみつけた！</p>
          </div>
        )}

        <div className="flex justify-between w-full items-center">
          <span className="text-lg font-bold text-gray-700">テーマ：{puzzle.title}</span>
          <span className="text-sm text-gray-500">{found.size}/{puzzle.words.length} みつけた</span>
        </div>

        <p className="text-sm text-gray-500 text-center">スタートとエンドを タップ！（たて・よこ）</p>

        <div className="bg-white rounded-2xl border-2 border-cyan-200 p-3 shadow w-full">
          <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(6, 1fr)' }}>
            {puzzle.grid.map((row, r) =>
              row.map((cell, c) => {
                const k = key(r, c)
                const isFound = foundCells.has(k)
                const isSel = selected.has(k) || (startCell && startCell[0] === r && startCell[1] === c)
                return (
                  <button
                    key={k}
                    onClick={() => tap(r, c)}
                    className={`aspect-square rounded-lg text-lg font-bold flex items-center justify-center transition-all active:scale-95 ${
                      isFound ? 'bg-cyan-400 text-white' :
                      isSel ? 'bg-cyan-200 text-cyan-800' :
                      'bg-gray-50 text-gray-700 border border-gray-200'
                    }`}
                  >
                    {cell}
                  </button>
                )
              })
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 w-full">
          {puzzle.words.map(w => (
            <span key={w.word} className={`px-3 py-2 rounded-xl text-base font-bold border-2 ${found.has(w.word) ? 'bg-cyan-400 text-white border-cyan-400 line-through' : 'bg-white text-gray-700 border-cyan-200'}`}>
              {w.word}
            </span>
          ))}
        </div>

        <button onClick={nextPuzzle} className="w-full py-4 text-lg font-bold bg-cyan-400 text-white rounded-2xl shadow active:scale-95">
          ちがうパズルにする 🔄
        </button>
      </div>
    </GameLayout>
  )
}
