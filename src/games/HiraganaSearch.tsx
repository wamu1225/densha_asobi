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
  // ── 2026-06-11 追加14パズル（生成器 gen_puzzles.js 製・罠語スキャン済） ──
  {
    title: 'どうぶつ③',
    grid: [
      ['か','ち','ろ','し','い','め'],
      ['ね','け','こ','こ','あ','ら'],
      ['ず','ろ','ご','り','ら','へ'],
      ['み','し','き','あ','て','う'],
      ['り','あ','つ','あ','え','れ'],
      ['ほ','わ','ね','す','ら','か'],
    ],
    words: [
      { word: 'ごりら', cells: [[2,2],[2,3],[2,4]] },
      { word: 'こあら', cells: [[1,3],[1,4],[1,5]] },
      { word: 'きつね', cells: [[3,2],[4,2],[5,2]] },
      { word: 'ねずみ', cells: [[1,0],[2,0],[3,0]] },
    ],
  },
  {
    title: 'うみのいきもの',
    grid: [
      ['い','せ','む','る','い','く'],
      ['て','ぬ','い','る','か','じ'],
      ['う','く','ふ','ほ','こ','ら'],
      ['す','ひ','ゆ','は','い','か'],
      ['あ','ま','お','た','こ','ね'],
      ['あ','ね','き','つ','つ','そ'],
    ],
    words: [
      { word: 'くじら', cells: [[0,5],[1,5],[2,5]] },
      { word: 'いるか', cells: [[1,2],[1,3],[1,4]] },
      { word: 'たこ', cells: [[4,3],[4,4]] },
      { word: 'いか', cells: [[3,4],[3,5]] },
    ],
  },
  {
    title: 'むし',
    grid: [
      ['ふ','か','ぶ','と','む','し'],
      ['ゆ','そ','い','お','あ','ぬ'],
      ['お','ほ','つ','く','み','か'],
      ['あ','ゆ','え','ね','り','せ'],
      ['り','な','み','か','せ','み'],
      ['せ','ば','っ','た','る','あ'],
    ],
    words: [
      { word: 'かぶとむし', cells: [[0,1],[0,2],[0,3],[0,4],[0,5]] },
      { word: 'ばった', cells: [[5,1],[5,2],[5,3]] },
      { word: 'せみ', cells: [[4,4],[4,5]] },
      { word: 'あり', cells: [[3,0],[4,0]] },
    ],
  },
  {
    title: 'たべもの①',
    grid: [
      ['ぱ','ん','た','ま','ご','ら'],
      ['う','さ','ろ','ふ','お','ま'],
      ['ひ','あ','え','み','に','れ'],
      ['り','み','う','そ','ぎ','け'],
      ['き','ほ','よ','し','り','せ'],
      ['か','ぬ','か','る','き','お'],
    ],
    words: [
      { word: 'おにぎり', cells: [[1,4],[2,4],[3,4],[4,4]] },
      { word: 'みそしる', cells: [[2,3],[3,3],[4,3],[5,3]] },
      { word: 'たまご', cells: [[0,2],[0,3],[0,4]] },
      { word: 'ぱん', cells: [[0,0],[0,1]] },
    ],
  },
  {
    title: 'たべもの②',
    grid: [
      ['お','そ','え','る','し','つ'],
      ['き','ね','そ','に','ゆ','ぎ'],
      ['あ','あ','ば','に','す','ょ'],
      ['ふ','と','う','す','し','う'],
      ['へ','そ','ど','ぬ','せ','ざ'],
      ['あ','あ','ん','り','ぬ','あ'],
    ],
    words: [
      { word: 'ぎょうざ', cells: [[1,5],[2,5],[3,5],[4,5]] },
      { word: 'うどん', cells: [[3,2],[4,2],[5,2]] },
      { word: 'すし', cells: [[2,4],[3,4]] },
      { word: 'そば', cells: [[1,2],[2,2]] },
    ],
  },
  {
    title: 'やさい',
    grid: [
      ['な','す','の','ろ','い','ひ'],
      ['よ','す','こ','ま','の','か'],
      ['け','き','あ','く','そ','ぬ'],
      ['い','さ','に','ん','じ','ん'],
      ['ほ','へ','だ','い','こ','ん'],
      ['い','は','ら','ま','め','た'],
    ],
    words: [
      { word: 'にんじん', cells: [[3,2],[3,3],[3,4],[3,5]] },
      { word: 'だいこん', cells: [[4,2],[4,3],[4,4],[4,5]] },
      { word: 'なす', cells: [[0,0],[0,1]] },
      { word: 'まめ', cells: [[5,3],[5,4]] },
    ],
  },
  {
    title: 'がっこう①',
    grid: [
      ['え','み','こ','ぬ','う','う'],
      ['は','へ','く','か','ゆ','む'],
      ['く','す','ば','え','せ','ら'],
      ['え','さ','ん','ん','つ','れ'],
      ['あ','い','す','ぴ','く','く'],
      ['の','や','ろ','つ','え','は'],
    ],
    words: [
      { word: 'えんぴつ', cells: [[2,3],[3,3],[4,3],[5,3]] },
      { word: 'こくばん', cells: [[0,2],[1,2],[2,2],[3,2]] },
      { word: 'つくえ', cells: [[3,4],[4,4],[5,4]] },
      { word: 'いす', cells: [[4,1],[4,2]] },
    ],
  },
  {
    title: 'がっこう②',
    grid: [
      ['み','お','と','も','だ','ち'],
      ['ほ','ぬ','ひ','へ','あ','み'],
      ['ん','へ','せ','ん','せ','い'],
      ['か','け','め','う','ほ','な'],
      ['く','き','た','ね','せ','さ'],
      ['ら','ん','ど','せ','る','り'],
    ],
    words: [
      { word: 'らんどせる', cells: [[5,0],[5,1],[5,2],[5,3],[5,4]] },
      { word: 'せんせい', cells: [[2,2],[2,3],[2,4],[2,5]] },
      { word: 'ともだち', cells: [[0,2],[0,3],[0,4],[0,5]] },
      { word: 'ほん', cells: [[1,0],[2,0]] },
    ],
  },
  {
    title: 'しぜん',
    grid: [
      ['て','か','そ','く','む','ふ'],
      ['あ','わ','ら','へ','な','う'],
      ['る','う','よ','た','わ','み'],
      ['さ','ぬ','お','す','ま','き'],
      ['あ','ま','わ','ほ','ま','ふ'],
      ['ち','や','ま','お','お','わ'],
    ],
    words: [
      { word: 'やま', cells: [[5,1],[5,2]] },
      { word: 'かわ', cells: [[0,1],[1,1]] },
      { word: 'うみ', cells: [[1,5],[2,5]] },
      { word: 'そら', cells: [[0,2],[1,2]] },
    ],
  },
  {
    title: 'そらのうえ',
    grid: [
      ['へ','れ','つ','せ','る','な'],
      ['き','ま','き','も','て','め'],
      ['ほ','む','あ','ほ','む','お'],
      ['し','ひ','く','の','よ','み'],
      ['う','く','も','ほ','す','う'],
      ['ほ','か','た','い','よ','う'],
    ],
    words: [
      { word: 'たいよう', cells: [[5,2],[5,3],[5,4],[5,5]] },
      { word: 'つき', cells: [[0,2],[1,2]] },
      { word: 'ほし', cells: [[2,0],[3,0]] },
      { word: 'くも', cells: [[4,1],[4,2]] },
    ],
  },
  {
    title: 'てんき',
    grid: [
      ['る','え','あ','け','へ','む'],
      ['は','に','は','は','あ','め'],
      ['ふ','よ','れ','す','と','と'],
      ['に','ぬ','ふ','み','の','も'],
      ['さ','く','ゆ','に','そ','ま'],
      ['ほ','あ','き','じ','つ','う'],
    ],
    words: [
      { word: 'にじ', cells: [[4,3],[5,3]] },
      { word: 'はれ', cells: [[1,2],[2,2]] },
      { word: 'あめ', cells: [[1,4],[1,5]] },
      { word: 'ゆき', cells: [[4,2],[5,2]] },
    ],
  },
  {
    title: 'おはな',
    grid: [
      ['し','う','な','ほ','む','た'],
      ['ひ','せ','え','ひ','た','に'],
      ['た','う','ひ','ま','わ','り'],
      ['ん','ろ','お','う','あ','ば'],
      ['ぽ','さ','く','ら','ま','ら'],
      ['ぽ','あ','せ','く','い','に'],
    ],
    words: [
      { word: 'たんぽぽ', cells: [[2,0],[3,0],[4,0],[5,0]] },
      { word: 'ひまわり', cells: [[2,2],[2,3],[2,4],[2,5]] },
      { word: 'さくら', cells: [[4,1],[4,2],[4,3]] },
      { word: 'ばら', cells: [[3,5],[4,5]] },
    ],
  },
  {
    title: 'からだ',
    grid: [
      ['お','ら','へ','へ','え','あ'],
      ['へ','す','あ','よ','み','た'],
      ['そ','ひ','る','し','み','ま'],
      ['あ','し','た','え','り','へ'],
      ['の','そ','し','ほ','ふ','な'],
      ['ひ','ふ','ゆ','な','あ','え'],
    ],
    words: [
      { word: 'あたま', cells: [[0,5],[1,5],[2,5]] },
      { word: 'おへそ', cells: [[0,0],[1,0],[2,0]] },
      { word: 'みみ', cells: [[1,4],[2,4]] },
      { word: 'あし', cells: [[3,0],[3,1]] },
    ],
  },
  {
    title: 'いろ',
    grid: [
      ['あ','へ','ひ','る','か','あ'],
      ['お','み','や','え','へ','あ'],
      ['ぬ','ど','の','い','つ','ら'],
      ['け','り','ほ','た','そ','の'],
      ['ほ','こ','ゆ','そ','ひ','わ'],
      ['き','い','ろ','そ','あ','か'],
    ],
    words: [
      { word: 'きいろ', cells: [[5,0],[5,1],[5,2]] },
      { word: 'みどり', cells: [[1,1],[2,1],[3,1]] },
      { word: 'あか', cells: [[5,4],[5,5]] },
      { word: 'あお', cells: [[0,0],[1,0]] },
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


const CLEARED_KEY = 'densha_search_cleared'

export function HiraganaSearch() {
  const [pIdx, setPIdx] = useState(0)
  // found: word → 実際に選んだセル座標（複数配置対応）
  const [found, setFound] = useState(new Map<string, [number, number][]>())
  const [startCell, setStartCell] = useState<[number, number] | null>(null)
  const [done, setDone] = useState(false)
  const [justFound, setJustFound] = useState<string | null>(null)
  // パズルごとのクリア記録（タイトルをキーに永続化）
  const [cleared, setCleared] = useState<Record<string, boolean>>(() => {
    try { return JSON.parse(localStorage.getItem(CLEARED_KEY) || '{}') } catch { return {} }
  })
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
      setJustFound('× たてかよこで えらんでね！')
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
      setJustFound(`○ 「${match.word}」みつけた！`)
      setTimeout(() => setJustFound(null), 1200)
      if (next.size === puzzle.words.length) {
        setDone(true)
        const c = { ...cleared, [puzzle.title]: true }
        setCleared(c)
        localStorage.setItem(CLEARED_KEY, JSON.stringify(c))
      }
    } else if (selected.length >= 2) {
      setJustFound('× そこにはない！もういちど！')
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
          <span className="text-base font-bold text-gray-700">
            {pIdx + 1}/{PUZZLES.length}：{puzzle.title}
            {cleared[puzzle.title] && <span className="text-cyan-600"> ✓</span>}
          </span>
          <span className="text-sm font-bold text-gray-600">{found.size}/{puzzle.words.length}</span>
        </div>

        {/* 固定高さのメッセージエリア — 表示/非表示でグリッドが動かないよう高さを確保 */}
        <div className="w-full" style={{ minHeight: 52 }}>
          {done ? (
            <div className="w-full rounded-2xl px-5 py-3 text-center bounce-in shadow-lg" style={{ background: 'linear-gradient(135deg,#fbbf24,#f59e0b)' }}>
              <p className="text-2xl font-black text-white">ぜんぶ みつけた！</p>
            </div>
          ) : justFound ? (
            <div className={`w-full rounded-xl px-5 py-2 text-center bounce-in border-2 ${justFound.startsWith('×') ? 'bg-amber-50 border-amber-300' : 'bg-green-100 border-green-400'}`}>
              <p className={`text-lg font-black ${justFound.startsWith('×') ? 'text-amber-700' : 'text-green-700'}`}>{justFound}</p>
            </div>
          ) : found.size === 0 && !startCell ? (
            <div className="bg-cyan-50 border-2 border-cyan-300 rounded-xl px-4 py-2 w-full">
              <p className="text-sm font-black text-cyan-700 text-center">
                さいしょ のもじ → さいご のもじ の じゅんでタップ！
              </p>
            </div>
          ) : (
            <p className="text-xs text-gray-500 text-center font-bold pt-3">
              {startCell ? 'さいごの もじを タップ！（たて・よこ）' : 'さいしょの もじを タップ！'}
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

        <p className="text-xs font-bold" style={{ color: 'var(--ink-sub)' }}>
          クリアした パズル：{PUZZLES.filter(p => cleared[p.title]).length} / {PUZZLES.length}
        </p>
      </div>
    </GameLayout>
  )
}
