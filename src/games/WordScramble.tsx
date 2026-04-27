import { useState, useEffect, useCallback } from 'react'
import { GameLayout } from '../components/GameLayout'

interface WordEntry { word: string; hint: string }
const CATEGORIES: Record<string, WordEntry[]> = {
  どうぶつ: [
    { word: 'ねこ', hint: '🐱' }, { word: 'いぬ', hint: '🐶' }, { word: 'うさぎ', hint: '🐰' },
    { word: 'きりん', hint: '🦒' }, { word: 'ぞう', hint: '🐘' }, { word: 'とり', hint: '🐦' },
    { word: 'くま', hint: '🐻' }, { word: 'さかな', hint: '🐟' }, { word: 'かめ', hint: '🐢' },
    { word: 'たぬき', hint: '🦝' },
  ],
  たべもの: [
    { word: 'りんご', hint: '🍎' }, { word: 'みかん', hint: '🍊' }, { word: 'いちご', hint: '🍓' },
    { word: 'バナナ', hint: '🍌' }, { word: 'トマト', hint: '🍅' }, { word: 'にんじん', hint: '🥕' },
    { word: 'おにぎり', hint: '🍙' }, { word: 'ラーメン', hint: '🍜' }, { word: 'ドーナツ', hint: '🍩' },
    { word: 'アイス', hint: '🍦' },
  ],
  のりもの: [
    { word: 'くるま', hint: '🚗' }, { word: 'でんしゃ', hint: '🚃' }, { word: 'ひこうき', hint: '✈️' },
    { word: 'じてんしゃ', hint: '🚲' }, { word: 'バイク', hint: '🏍️' }, { word: 'ロケット', hint: '🚀' },
    { word: 'しんかんせん', hint: '🚄' }, { word: 'ヘリコプター', hint: '🚁' }, { word: 'きかんしゃ', hint: '🚂' },
    { word: 'ふね', hint: '🚢' },
  ],
  むずかしい: [
    { word: 'えんぴつ', hint: '✏️' }, { word: 'けしごむ', hint: '🧹' }, { word: 'てぶくろ', hint: '🧤' },
    { word: 'めがね', hint: '👓' }, { word: 'かさ', hint: '☂️' }, { word: 'スニーカー', hint: '👟' },
    { word: 'リュックサック', hint: '🎒' }, { word: 'ハンカチ', hint: '🧣' }, { word: 'ランドセル', hint: '🎒' },
    { word: 'まくら', hint: '🛏️' },
  ],
}

type Cat = keyof typeof CATEGORIES
type Mode = 'select' | 'normal' | 'timeattack' | 'over'

function scramble(word: string): string[] {
  const chars = word.split('')
  let result: string[]
  let tries = 0
  do { result = [...chars].sort(() => Math.random() - 0.5); tries++ } while (result.join('') === word && tries < 20)
  return result
}

export function WordScramble() {
  const [mode, setMode] = useState<Mode>('select')
  const [cat, setCat] = useState<Cat>('どうぶつ')
  const [words, setWords] = useState<WordEntry[]>([...CATEGORIES['どうぶつ']])
  const [idx, setIdx] = useState(0)
  const [tiles, setTiles] = useState<string[]>([])
  const [selected, setSelected] = useState<number[]>([])
  const [score, setScore] = useState(0)
  const [flash, setFlash] = useState<'ok' | 'ng' | null>(null)
  const [showHint, setShowHint] = useState(false)
  const [timeLeft, setTimeLeft] = useState(90)
  const [timeMode, setTimeMode] = useState(false)

  const word = words[idx]

  const loadWord = useCallback((i: number, ws: WordEntry[]) => {
    if (i < ws.length) {
      setTiles(scramble(ws[i].word))
      setSelected([]); setShowHint(false); setFlash(null)
    }
  }, [])

  useEffect(() => { loadWord(idx, words) }, [idx, words, loadWord])

  useEffect(() => {
    if (!timeMode || mode !== 'normal') return
    if (timeLeft <= 0) { setMode('over'); return }
    const t = setInterval(() => setTimeLeft(v => { if (v <= 1) { setMode('over'); return 0 } return v - 1 }), 1000)
    return () => clearInterval(t)
  }, [timeMode, mode, timeLeft])

  function startGame(c: Cat, tm: boolean) {
    const shuffled = [...CATEGORIES[c]].sort(() => Math.random() - 0.5)
    setCat(c); setWords(shuffled); setTimeMode(tm)
    setIdx(0); setScore(0); setTimeLeft(90)
    loadWord(0, shuffled); setMode('normal')
  }

  function tapTile(i: number) {
    if (selected.includes(i)) return
    const next = [...selected, i]
    setSelected(next)
    const current = next.map(j => tiles[j]).join('')
    if (current.length === word.word.length) {
      if (current === word.word) {
        setFlash('ok'); setScore(s => s + 1)
        setTimeout(() => {
          if (idx + 1 >= words.length) { setMode('over') } else { setIdx(i => i + 1) }
        }, 500)
      } else {
        setFlash('ng')
        setTimeout(() => { setSelected([]); setFlash(null) }, 400)
      }
    }
  }

  if (mode === 'select') return (
    <GameLayout title="もじならべ" color="bg-amber-400">
      <div className="flex flex-col gap-4 pt-4">
        <p className="text-center text-xl font-bold text-gray-700">カテゴリをえらんでね</p>
        {(Object.keys(CATEGORIES) as Cat[]).map(c => (
          <div key={c} className="bg-white rounded-2xl border-2 border-amber-200 p-4 shadow">
            <p className="font-bold text-gray-700 mb-2">{c === 'どうぶつ' ? '🐾' : c === 'たべもの' ? '🍎' : c === 'のりもの' ? '🚃' : '🎓'} {c}（{CATEGORIES[c].length}もん）</p>
            <div className="flex gap-2">
              <button onClick={() => startGame(c, false)} className="flex-1 py-3 text-sm font-bold bg-amber-400 text-white rounded-xl active:scale-95">ふつう</button>
              <button onClick={() => startGame(c, true)} className="flex-1 py-3 text-sm font-bold bg-orange-500 text-white rounded-xl active:scale-95">⏱ 90びょう</button>
            </div>
          </div>
        ))}
      </div>
    </GameLayout>
  )

  if (mode === 'over') return (
    <GameLayout title="もじならべ" color="bg-amber-400">
      <div className="flex flex-col items-center gap-5 pt-8 bounce-in">
        <p className="text-4xl">{score >= 8 ? '🎉' : '😊'}</p>
        <p className="text-3xl font-bold text-gray-700">{timeMode ? 'タイムアップ！' : 'ぜんぶおわり！'}</p>
        <div className="bg-amber-50 border-2 border-amber-200 rounded-3xl p-6 text-center w-full">
          <p className="text-lg text-gray-500">せいかい</p>
          <p className="text-6xl font-bold text-amber-500 mt-1">{score}<span className="text-2xl"> / {words.length}</span></p>
        </div>
        <div className="flex gap-3 w-full">
          <button onClick={() => startGame(cat, timeMode)} className="flex-1 py-4 text-lg font-bold bg-amber-400 text-white rounded-2xl shadow active:scale-95">もういちど</button>
          <button onClick={() => setMode('select')} className="flex-1 py-4 text-lg font-bold bg-gray-200 text-gray-700 rounded-2xl active:scale-95">もどる</button>
        </div>
      </div>
    </GameLayout>
  )

  const current = selected.map(i => tiles[i]).join('')

  return (
    <GameLayout title="もじならべ" color="bg-amber-400">
      <div className={`flex flex-col items-center gap-4 rounded-2xl p-2 transition-colors ${flash === 'ok' ? 'bg-green-50' : flash === 'ng' ? 'bg-red-50' : ''}`}>
        <div className="flex justify-between w-full">
          <span className="text-xl font-bold text-gray-700">⭐ {score}</span>
          {timeMode
            ? <span className={`text-xl font-bold ${timeLeft <= 20 ? 'text-red-500 animate-pulse' : 'text-gray-700'}`}>⏱ {timeLeft}s</span>
            : <span className="text-xl font-bold text-gray-700">{idx + 1} / {words.length}</span>
          }
        </div>

        <div className="text-6xl mt-1">{word.hint}</div>
        <p className="text-lg text-gray-600">{cat}の なまえを つくってね</p>

        <div className="flex gap-2 bg-amber-50 rounded-2xl px-5 py-4 min-h-14 items-center justify-center w-full border-2 border-amber-200">
          {current.split('').map((c, i) => (
            <span key={i} className="text-3xl font-bold text-amber-700">{c}</span>
          ))}
          {current.length === 0 && <span className="text-gray-400 text-base">ひらがなを タップしてね</span>}
        </div>

        <div className="flex gap-2 flex-wrap justify-center">
          {tiles.map((t, i) => (
            <button key={i} onClick={() => tapTile(i)} disabled={selected.includes(i)}
              className={`w-14 h-14 text-2xl font-bold rounded-xl border-2 transition-all active:scale-95 ${
                selected.includes(i) ? 'bg-amber-50 border-amber-100 text-amber-50' : 'bg-white border-amber-400 shadow-md'
              }`}>
              {selected.includes(i) ? '' : t}
            </button>
          ))}
        </div>

        <div className="flex gap-2 w-full">
          <button onClick={() => setSelected([])} className="flex-1 py-3 text-base font-bold bg-gray-200 text-gray-600 rounded-2xl active:scale-95">やりなおし</button>
          {!showHint
            ? <button onClick={() => setShowHint(true)} className="flex-1 py-3 text-base font-bold bg-amber-100 text-amber-700 rounded-2xl active:scale-95">ヒント 💡</button>
            : <div className="flex-1 py-3 text-base font-bold bg-amber-100 text-amber-700 rounded-2xl text-center">「{word.word[0]}」から！</div>
          }
        </div>
      </div>
    </GameLayout>
  )
}
