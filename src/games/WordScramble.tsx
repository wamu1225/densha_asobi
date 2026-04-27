import { useState, useEffect } from 'react'
import { GameLayout } from '../components/GameLayout'

const WORDS = [
  { word: 'ねこ',     hint: '🐱' },
  { word: 'いぬ',     hint: '🐶' },
  { word: 'さかな',   hint: '🐟' },
  { word: 'りんご',   hint: '🍎' },
  { word: 'でんしゃ', hint: '🚃' },
  { word: 'とけい',   hint: '🕐' },
  { word: 'みかん',   hint: '🍊' },
  { word: 'くるま',   hint: '🚗' },
  { word: 'バナナ',   hint: '🍌' },
  { word: 'えんぴつ', hint: '✏️' },
]

function scramble(word: string): string[] {
  const chars = word.split('')
  let result: string[]
  do { result = [...chars].sort(() => Math.random() - 0.5) }
  while (result.join('') === word)
  return result
}

type Phase = 'play' | 'over'

export function WordScramble() {
  const [phase, setPhase] = useState<Phase>('play')
  const [idx, setIdx] = useState(0)
  const [tiles, setTiles] = useState<string[]>([])
  const [selected, setSelected] = useState<number[]>([])
  const [score, setScore] = useState(0)
  const [flash, setFlash] = useState<'ok' | 'ng' | null>(null)
  const [showHint, setShowHint] = useState(false)

  const word = WORDS[idx]

  useEffect(() => {
    setTiles(scramble(word.word))
    setSelected([])
    setShowHint(false)
    setFlash(null)
  }, [idx])

  function tapTile(i: number) {
    if (selected.includes(i)) return
    const next = [...selected, i]
    setSelected(next)

    const current = next.map(j => tiles[j]).join('')
    if (current.length === word.word.length) {
      if (current === word.word) {
        setFlash('ok')
        setScore(s => s + 1)
        setTimeout(() => {
          if (idx + 1 >= WORDS.length) { setPhase('over') } else { setIdx(i => i + 1) }
        }, 600)
      } else {
        setFlash('ng')
        setTimeout(() => { setSelected([]); setFlash(null) }, 500)
      }
    }
  }

  function reset() { setPhase('play'); setScore(0); setIdx(0) }

  if (phase === 'over') return (
    <GameLayout title="もじならべ" color="bg-amber-400">
      <div className="flex flex-col items-center gap-6 pt-10 bounce-in">
        <p className="text-4xl">🎉</p>
        <p className="text-3xl font-bold text-gray-700">ぜんぶできた！</p>
        <div className="bg-amber-100 rounded-3xl p-6 text-center">
          <p className="text-lg text-gray-600">せいかい</p>
          <p className="text-6xl font-bold text-amber-500 mt-2">{score}<span className="text-2xl"> / {WORDS.length}</span></p>
        </div>
        <button onClick={reset} className="px-8 py-4 text-xl font-bold bg-amber-400 text-white rounded-2xl shadow active:scale-95">もういちど</button>
      </div>
    </GameLayout>
  )

  const current = selected.map(i => tiles[i]).join('')

  return (
    <GameLayout title="もじならべ" color="bg-amber-400">
      <div className={`flex flex-col items-center gap-5 rounded-2xl p-2 transition-colors ${flash === 'ok' ? 'bg-green-50' : flash === 'ng' ? 'bg-red-50' : ''}`}>
        <div className="flex justify-between w-full">
          <span className="text-xl font-bold text-gray-700">⭐ {score}</span>
          <span className="text-xl font-bold text-gray-700">{idx + 1} / {WORDS.length}</span>
        </div>

        <div className="text-6xl mt-2">{word.hint}</div>
        <p className="text-lg text-gray-600">このなまえをつくってね</p>

        <div className="flex gap-2 bg-amber-50 rounded-2xl px-6 py-4 min-h-16 items-center justify-center w-full border-2 border-amber-200">
          {current.split('').map((c, i) => (
            <span key={i} className="text-3xl font-bold text-amber-700">{c}</span>
          ))}
          {current.length === 0 && <span className="text-gray-400">ここにならぶよ</span>}
        </div>

        <div className="flex gap-3 flex-wrap justify-center">
          {tiles.map((t, i) => (
            <button
              key={i}
              onClick={() => tapTile(i)}
              disabled={selected.includes(i)}
              className={`w-14 h-14 text-2xl font-bold rounded-xl border-2 transition-all active:scale-95 ${
                selected.includes(i)
                  ? 'bg-amber-100 border-amber-100 text-amber-100'
                  : 'bg-white border-amber-400 shadow'
              }`}
            >
              {selected.includes(i) ? '' : t}
            </button>
          ))}
        </div>

        <div className="flex gap-3 w-full">
          <button onClick={() => setSelected([])} className="flex-1 py-3 text-base font-bold bg-gray-200 text-gray-600 rounded-2xl active:scale-95">
            やりなおし
          </button>
          {!showHint && (
            <button onClick={() => setShowHint(true)} className="flex-1 py-3 text-base font-bold bg-amber-100 text-amber-700 rounded-2xl active:scale-95">
              ヒント 💡
            </button>
          )}
        </div>
        {showHint && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2 w-full text-center">
            <p className="text-lg text-amber-700">「{word.word[0]}」からはじまるよ</p>
          </div>
        )}
      </div>
    </GameLayout>
  )
}
