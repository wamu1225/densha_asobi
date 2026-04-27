import { useState } from 'react'
import { GameLayout } from '../components/GameLayout'

interface Puzzle { title: string; grid: string[][]; words: { word: string; cells: [number, number][] }[] }

const PUZZLES: Puzzle[] = [
  {
    title: 'どうぶつ①',
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
      { word: 'うさぎ', cells: [[0,0],[0,1],[0,2]] },
      { word: 'ぞう',   cells: [[0,4],[0,5]] },
      { word: 'かめ',   cells: [[4,2],[4,3]] },
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
    grid: [
      ['バ','イ','ク','か','ろ','め'],
      ['ゆ','い','れ','な','ぷ','し'],
      ['バ','ス','ほ','て','わ','ん'],
      ['め','ん','く','ら','た','か'],
      ['タ','ク','シ','ー','ぬ','き'],
      ['き','ゆ','ぬ','さ','け','ぶ'],
    ],
    words: [
      { word: 'バイク', cells: [[0,0],[0,1],[0,2]] },
      { word: 'バス',   cells: [[2,0],[2,1]] },
      { word: 'タクシー', cells: [[4,0],[4,1],[4,2],[4,3]] },
      { word: 'いか',   cells: [[0,1],[1,1]] },
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

export function HiraganaSearch() {
  const [pIdx, setPIdx] = useState(0)
  const [found, setFound] = useState(new Set<string>())
  const [startCell, setStartCell] = useState<[number, number] | null>(null)
  const [preview, setPreview] = useState(new Set<CellKey>())
  const [done, setDone] = useState(false)
  const [justFound, setJustFound] = useState<string | null>(null)

  const puzzle = PUZZLES[pIdx]

  function getFoundCells(): Set<CellKey> {
    const s = new Set<CellKey>()
    puzzle.words.forEach(w => { if (found.has(w.word)) w.cells.forEach(([r, c]) => s.add(key(r, c))) })
    return s
  }

  function tap(r: number, c: number) {
    if (!startCell) {
      setStartCell([r, c]); setPreview(new Set([key(r, c)])); return
    }
    const cells = cellsBetween(startCell, [r, c])
    const word = cells.map(([row, col]) => puzzle.grid[row][col]).join('')
    const reversed = [...word].reverse().join('')

    const match = puzzle.words.find(w => (w.word === word || w.word === reversed) && !found.has(w.word))
    if (match) {
      const next = new Set(found); next.add(match.word); setFound(next)
      setJustFound(match.word)
      setTimeout(() => setJustFound(null), 1000)
      if (next.size === puzzle.words.length) setDone(true)
    }
    setStartCell(null); setPreview(new Set())
  }

  function nextPuzzle() {
    setPIdx(i => (i + 1) % PUZZLES.length)
    setFound(new Set()); setStartCell(null); setPreview(new Set()); setDone(false)
  }

  function prevPuzzle() {
    setPIdx(i => (i - 1 + PUZZLES.length) % PUZZLES.length)
    setFound(new Set()); setStartCell(null); setPreview(new Set()); setDone(false)
  }

  const foundCells = getFoundCells()
  const startKey = startCell ? key(startCell[0], startCell[1]) : null

  return (
    <GameLayout title="ひらがなさがし" color="bg-cyan-400">
      <div className="flex flex-col items-center gap-3">
        <div className="flex justify-between w-full items-center">
          <span className="text-base font-bold text-gray-700">{pIdx + 1}/{PUZZLES.length}：{puzzle.title}</span>
          <span className="text-sm font-bold text-gray-600">{found.size}/{puzzle.words.length}</span>
        </div>

        {done && (
          <div className="bg-yellow-100 border-2 border-yellow-400 rounded-2xl px-6 py-2 text-center bounce-in w-full">
            <p className="text-2xl font-bold text-yellow-600">🎉 ぜんぶみつけた！</p>
          </div>
        )}

        {justFound && (
          <div className="bg-green-100 border-2 border-green-400 rounded-xl px-5 py-2 text-center bounce-in">
            <p className="text-xl font-bold text-green-600">✅ 「{justFound}」みつけた！</p>
          </div>
        )}

        <p className="text-xs text-gray-500 text-center">
          {startCell ? '📍 エンドを タップ！' : '📍 スタートを タップ！（たて・よこ）'}
        </p>

        <div className="bg-white rounded-2xl border-2 border-cyan-200 p-2 shadow w-full">
          <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(6, 1fr)' }}>
            {puzzle.grid.map((row, r) =>
              row.map((cell, c) => {
                const k = key(r, c)
                const isFound = foundCells.has(k)
                const isSel = startKey === k || preview.has(k)
                return (
                  <button key={k} onClick={() => tap(r, c)}
                    className={`aspect-square rounded-lg text-base font-bold flex items-center justify-center transition-all active:scale-95 ${
                      isFound ? 'bg-cyan-400 text-white shadow' :
                      isSel ? 'bg-cyan-200 text-cyan-800 scale-95' :
                      'bg-gray-50 text-gray-700 border border-gray-200'
                    }`}>
                    {cell}
                  </button>
                )
              })
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 w-full">
          {puzzle.words.map(w => (
            <span key={w.word} className={`px-3 py-2 rounded-xl text-base font-bold border-2 transition-all ${found.has(w.word) ? 'bg-cyan-400 text-white border-cyan-400' : 'bg-white text-gray-700 border-cyan-200'}`}>
              {found.has(w.word) ? '✓ ' : ''}{w.word}
            </span>
          ))}
        </div>

        <div className="flex gap-2 w-full">
          <button onClick={prevPuzzle} className="flex-1 py-3 text-sm font-bold bg-gray-200 text-gray-600 rounded-xl active:scale-95">← まえ</button>
          <button onClick={nextPuzzle} className="flex-1 py-3 text-sm font-bold bg-cyan-400 text-white rounded-xl shadow active:scale-95">つぎ →</button>
        </div>
      </div>
    </GameLayout>
  )
}
