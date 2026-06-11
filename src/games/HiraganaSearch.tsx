import { useState } from 'react'
import { GameLayout } from '../components/GameLayout'

const GRAD = 'linear-gradient(135deg, #67e8f9, #06b6d4)'

interface WordDef { word: string; cells: [number, number][] }
interface Puzzle { title: string; grid: string[][]; words: WordDef[] }

const PUZZLES: Puzzle[] = [
  {
    title: 'どうぶつ①',
    // 2026-06-11 罠語修正: 行1の「しか」（リスト外の実在動物）を解消
    grid: [
      ['ね','こ','て','れ','い','ぬ'],
      ['い','と','り','あ','む','か'],
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
    // 2026-06-11 罠語修正: 「うま」（列0）「しか」（行2）「かも」（行3）を解消
    grid: [
      ['う','さ','ぎ','て','ぞ','う'],
      ['り','ら','く','れ','い','わ'],
      ['く','め','ほ','ぬ','へ','か'],
      ['ら','と','か','え','の','め'],
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
      ['す','も','も','て','み','ろ'],
      ['ぶ','ど','う','わ','か','ん'],
      ['れ','さ','ほ','た','ん','く'],
      ['い','ろ','て','ぬ','め','ぎ'],
      ['す','い','か','く','の','て'],
      ['あ','ゆ','ぬ','さ','け','ぶ'],
    ],
    words: [
      { word: 'すもも', cells: [[0,0],[0,1],[0,2]] },
      // 「すもも」内の「もも」も実在語のため正解として受理（罠化を防ぐ）
      { word: 'もも',   cells: [[0,1],[0,2]] },
      { word: 'ぶどう', cells: [[1,0],[1,1],[1,2]] },
      { word: 'みかん', cells: [[0,4],[1,4],[2,4]] },
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
      ['じ','て','ん','し','ゃ','ふ'],
      ['は','ろ','め','や','く','ね'],
      ['わ','い','た','ぬ','ぱ','く'],
      ['ち','か','て','つ','ぬ','る'],
      ['た','ゆ','ぶ','も','の','ま'],
      ['き','ゆ','ぬ','さ','け','ぶ'],
    ],
    words: [
      { word: 'じてんしゃ', cells: [[0,0],[0,1],[0,2],[0,3],[0,4]] },
      { word: 'ふね',       cells: [[0,5],[1,5]] },
      { word: 'ちかてつ',   cells: [[3,0],[3,1],[3,2],[3,3]] },
      { word: 'くるま',     cells: [[2,5],[3,5],[4,5]] },
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
  // found: word → 実際に選んだセル座標（複数配置対応）
  const [found, setFound] = useState(new Map<string, [number, number][]>())
  const [startCell, setStartCell] = useState<[number, number] | null>(null)
  const [done, setDone] = useState(false)
  const [justFound, setJustFound] = useState<string | null>(null)
  const puzzle = PUZZLES[pIdx]

  function getFoundCells(): Set<CellKey> {
    const s = new Set<CellKey>()
    found.forEach(cells => cells.forEach(([r, c]) => s.add(key(r, c))))
    return s
  }

  function tap(r: number, c: number) {
    if (!startCell) { setStartCell([r, c]); return }

    const [r1, c1] = startCell
    const isDiagonal = r1 !== r && c1 !== c
    if (isDiagonal) {
      setStartCell(null)
      setJustFound('❌ たてかよこでえらんでね！')
      setTimeout(() => setJustFound(null), 800)
      return
    }

    const selected = cellsBetween(startCell, [r, c])
    // 座標ではなく文字で判定（グリッド内に同じ単語が複数箇所ある場合も正解扱い）
    const chars = selected.map(([sr, sc]) => puzzle.grid[sr][sc]).join('')
    const charsRev = [...chars].reverse().join('')

    const match = puzzle.words.find(
      w => !found.has(w.word) && (chars === w.word || charsRev === w.word),
    )

    if (match) {
      const next = new Map(found)
      next.set(match.word, selected)
      setFound(next)
      setJustFound(`✅ 「${match.word}」みつけた！`)
      setTimeout(() => setJustFound(null), 1200)
      if (next.size === puzzle.words.length) setDone(true)
    } else if (selected.length >= 2) {
      setJustFound('❌ そこにはない！もういちど！')
      setTimeout(() => setJustFound(null), 700)
    }
    setStartCell(null)
  }

  function changePuzzle(delta: number) {
    setPIdx(i => (i + delta + PUZZLES.length) % PUZZLES.length)
    setFound(new Map()); setStartCell(null); setDone(false)
  }

  const foundCells = getFoundCells()
  const startKey = startCell ? key(startCell[0], startCell[1]) : null

  return (
    <GameLayout title="ひらがなさがし" gradient={GRAD} isPlaying={found.size > 0 && !done} hideAd={!done}>
      <div className="flex flex-col items-center gap-3">
        <div className="flex justify-between w-full">
          <span className="text-base font-bold text-gray-700">{pIdx + 1}/{PUZZLES.length}：{puzzle.title}</span>
          <span className="text-sm font-bold text-gray-600">{found.size}/{puzzle.words.length}</span>
        </div>

        {/* 固定高さのメッセージエリア — 表示/非表示でグリッドが動かないよう高さを確保 */}
        <div className="w-full" style={{ minHeight: 52 }}>
          {done ? (
            <div className="w-full rounded-2xl px-5 py-3 text-center bounce-in shadow-lg" style={{ background: 'linear-gradient(135deg,#fbbf24,#f59e0b)' }}>
              <p className="text-2xl font-black text-white">🎉 ぜんぶみつけた！</p>
            </div>
          ) : justFound ? (
            <div className={`w-full rounded-xl px-5 py-2 text-center bounce-in border-2 ${justFound.startsWith('❌') ? 'bg-amber-50 border-amber-300' : 'bg-green-100 border-green-400'}`}>
              <p className={`text-lg font-black ${justFound.startsWith('❌') ? 'text-amber-700' : 'text-green-700'}`}>{justFound}</p>
            </div>
          ) : found.size === 0 && !startCell ? (
            <div className="bg-cyan-50 border-2 border-cyan-300 rounded-xl px-4 py-2 w-full">
              <p className="text-sm font-black text-cyan-700 text-center">
                💡 さいしょ のもじ → さいご のもじ の じゅんでタップ！
              </p>
            </div>
          ) : (
            <p className="text-xs text-gray-500 text-center font-bold pt-3">
              {startCell ? '📍 さいごのもじをタップ！（たて・よこ）' : '📍 さいしょのもじをタップ！'}
            </p>
          )}
        </div>

        <div className="bg-white rounded-2xl border-2 border-cyan-200 p-1 shadow-md w-full">
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
                    className={`aspect-square rounded-lg text-lg font-black flex items-center justify-center active:scale-90 ${
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
