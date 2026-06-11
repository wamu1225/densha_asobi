import { useState, useEffect, useCallback } from 'react'
import { GameLayout } from '../components/GameLayout'
import { ResultScreen } from '../components/ResultScreen'

const GRAD = 'linear-gradient(135deg, #fcd34d, #f59e0b)'

const TA_BEST_KEY = 'densha_scramble_best'
function getTaBest(cat: string): number { try { return parseInt(localStorage.getItem(`${TA_BEST_KEY}_${cat}`) ?? '0') } catch { return 0 } }
function saveTaBest(cat: string, v: number) { if (v > getTaBest(cat)) localStorage.setItem(`${TA_BEST_KEY}_${cat}`, String(v)) }

// 2026-06-11 P5d: 絵文字だけでは何か分からない問題を解消するため、全語にひらがな説明（clue）を付与。
// 語彙 40→122（長音「ー」は並べ替え対象として不自然なため不採用）
interface WordEntry { word: string; hint: string; clue: string }
const CATEGORIES: Record<string, WordEntry[]> = {
  どうぶつ: [
    { word: 'ねこ', hint: '🐱', clue: 'にゃーと なくよ' },
    { word: 'いぬ', hint: '🐶', clue: 'わんわんと なくよ' },
    { word: 'うさぎ', hint: '🐰', clue: 'みみが ながくて ぴょんぴょん' },
    { word: 'きりん', hint: '🦒', clue: 'くびが とっても ながい' },
    { word: 'ぞう', hint: '🐘', clue: 'はなが ながーい' },
    { word: 'とり', hint: '🐦', clue: 'そらを とぶよ' },
    { word: 'くま', hint: '🐻', clue: 'はちみつが だいすき' },
    { word: 'さかな', hint: '🐟', clue: 'みずの なかを およぐ' },
    { word: 'かめ', hint: '🐢', clue: 'こうらを せおって ゆっくり' },
    { word: 'たぬき', hint: '🦝', clue: 'ぽんぽこ おなかの どうぶつ' },
    { word: 'らいおん', hint: '🦁', clue: 'どうぶつの おうさま' },
    { word: 'ぱんだ', hint: '🐼', clue: 'しろくろの くまさん' },
    { word: 'こあら', hint: '🐨', clue: 'ゆーかりの きに いるよ' },
    { word: 'さる', hint: '🐵', clue: 'きのぼりが とくい' },
    { word: 'ぶた', hint: '🐷', clue: 'はなが まるい ぶーぶー' },
    { word: 'うし', hint: '🐮', clue: 'ぎゅうにゅうを くれるよ' },
    { word: 'うま', hint: '🐴', clue: 'ぱかぱか はしる' },
    { word: 'ひつじ', hint: '🐑', clue: 'もこもこの けが ある' },
    { word: 'にわとり', hint: '🐔', clue: 'あさ こけこっこーと なく' },
    { word: 'ぺんぎん', hint: '🐧', clue: 'こおりのうえを よちよち' },
    { word: 'いるか', hint: '🐬', clue: 'うみで じゃんぷする' },
    { word: 'くじら', hint: '🐋', clue: 'うみで いちばん おおきい' },
    { word: 'たこ', hint: '🐙', clue: 'あしが 8ほん' },
    { word: 'かに', hint: '🦀', clue: 'よこに あるくよ' },
    { word: 'ちょう', hint: '🦋', clue: 'はなの みつを すう' },
    { word: 'はち', hint: '🐝', clue: 'ぶんぶん とぶよ' },
    { word: 'かえる', hint: '🐸', clue: 'けろけろ なくよ' },
    { word: 'へび', hint: '🐍', clue: 'にょろにょろ ながい' },
    { word: 'りす', hint: '🐿️', clue: 'どんぐりが だいすき' },
    { word: 'きつね', hint: '🦊', clue: 'こんと なく もりの どうぶつ' },
    { word: 'ふくろう', hint: '🦉', clue: 'よるの もりの とり' },
    { word: 'わに', hint: '🐊', clue: 'おおきな くちで がぶり' },
    { word: 'しか', hint: '🦌', clue: 'つのが ある もりの どうぶつ' },
    { word: 'こうもり', hint: '🦇', clue: 'よるに とぶよ' },
    { word: 'ごりら', hint: '🦍', clue: 'むねを どんどん たたく' },
  ],
  たべもの: [
    { word: 'りんご', hint: '🍎', clue: 'あかい くだもの' },
    { word: 'みかん', hint: '🍊', clue: 'ふゆに たべる おれんじいろ' },
    { word: 'いちご', hint: '🍓', clue: 'あかくて つぶつぶ' },
    { word: 'バナナ', hint: '🍌', clue: 'きいろくて ながい くだもの' },
    { word: 'トマト', hint: '🍅', clue: 'あかい まるい やさい' },
    { word: 'にんじん', hint: '🥕', clue: 'うさぎが すきな やさい' },
    { word: 'おにぎり', hint: '🍙', clue: 'ごはんを ぎゅっと にぎったもの' },
    { word: 'うどん', hint: '🍜', clue: 'つるつる しろい めん' },
    { word: 'ポテト', hint: '🍟', clue: 'ほそながい あげた おいも' },
    { word: 'アイス', hint: '🍦', clue: 'つめたい あまい おやつ' },
    { word: 'ぶどう', hint: '🍇', clue: 'むらさきの つぶつぶ くだもの' },
    { word: 'すいか', hint: '🍉', clue: 'なつの おおきな くだもの' },
    { word: 'めろん', hint: '🍈', clue: 'あみあみ もようの くだもの' },
    { word: 'もも', hint: '🍑', clue: 'ぴんくの あまい くだもの' },
    { word: 'ぱん', hint: '🍞', clue: 'あさごはんに よく たべる' },
    { word: 'かまぼこ', hint: '🍥', clue: 'うずまき もようの たべもの' },
    { word: 'たまご', hint: '🥚', clue: 'わると きみが でてくる' },
    { word: 'ごはん', hint: '🍚', clue: 'まいにち たべる しろいもの' },
    { word: 'ピザ', hint: '🍕', clue: 'まるくて ちーずが のってる' },
    { word: 'プリン', hint: '🍮', clue: 'ぷるぷるの おやつ' },
    { word: 'グミ', hint: '🍬', clue: 'かみかみ する おかし' },
    { word: 'あめ', hint: '🍭', clue: 'なめる あまい おかし' },
    { word: 'チョコ', hint: '🍫', clue: 'ちゃいろの あまい おかし' },
    { word: 'だんご', hint: '🍡', clue: 'くしに ささった まるい おかし' },
    { word: 'せんべい', hint: '🍘', clue: 'ぱりぱりの おかし' },
    { word: 'おでん', hint: '🍢', clue: 'ふゆの あったか りょうり' },
    { word: 'すし', hint: '🍣', clue: 'ごはんに さかなを のせたもの' },
    { word: 'みそしる', hint: '🍲', clue: 'あさごはんの あったかい しる' },
    { word: 'とうもろこし', hint: '🌽', clue: 'きいろい つぶつぶの やさい' },
    { word: 'じゃがいも', hint: '🥔', clue: 'つちの なかで そだつ おいも' },
    { word: 'たまねぎ', hint: '🧅', clue: 'きると なみだが でる やさい' },
    { word: 'きのこ', hint: '🍄', clue: 'かさの かたちの たべもの' },
    { word: 'はちみつ', hint: '🍯', clue: 'はちが つくる あまいもの' },
    { word: 'ぎゅうにゅう', hint: '🥛', clue: 'うしさんの しろい のみもの' },
    { word: 'おちゃ', hint: '🍵', clue: 'みどりいろの のみもの' },
  ],
  のりもの: [
    { word: 'くるま', hint: '🚗', clue: 'みちを はしるよ' },
    { word: 'でんしゃ', hint: '🚃', clue: 'せんろの うえを はしる' },
    { word: 'ひこうき', hint: '✈️', clue: 'そらを とぶ のりもの' },
    { word: 'じてんしゃ', hint: '🚲', clue: 'ぺだるを こいで はしる' },
    { word: 'バイク', hint: '🏍️', clue: 'えんじんつきの にりんしゃ' },
    { word: 'ロケット', hint: '🚀', clue: 'うちゅうへ とんでいく' },
    { word: 'しんかんせん', hint: '🚄', clue: 'とっても はやい でんしゃ' },
    { word: 'きかんしゃ', hint: '🚂', clue: 'もくもく けむりを だす' },
    { word: 'ふね', hint: '🚢', clue: 'うみを すすむよ' },
    { word: 'バス', hint: '🚌', clue: 'たくさんの ひとを のせる' },
    { word: 'トラック', hint: '🚚', clue: 'にもつを はこぶ おおきなくるま' },
    { word: 'しょうぼうしゃ', hint: '🚒', clue: 'かじを けす あかいくるま' },
    { word: 'きゅうきゅうしゃ', hint: '🚑', clue: 'びょうきの ひとを はこぶ' },
    { word: 'そり', hint: '🛷', clue: 'ゆきの うえを すべる' },
    { word: 'ヨット', hint: '⛵', clue: 'かぜの ちからで すすむ ふね' },
    { word: 'ちかてつ', hint: '🚇', clue: 'ちかを はしる でんしゃ' },
    { word: 'ききゅう', hint: '🎈', clue: 'そらに うかぶ おおきな ふうせん' },
    { word: 'うちゅうせん', hint: '🛸', clue: 'うちゅうを とぶ のりもの' },
    { word: 'いかだ', hint: '🛶', clue: 'きを ならべて つくった ふね' },
  ],
  みのまわり: [
    { word: 'えんぴつ', hint: '✏️', clue: 'じを かく どうぐ' },
    { word: 'くつした', hint: '🧦', clue: 'あしに はくもの' },
    { word: 'てぶくろ', hint: '🧤', clue: 'さむいひに てに はめる' },
    { word: 'めがね', hint: '👓', clue: 'めに かけるもの' },
    { word: 'かさ', hint: '☂️', clue: 'あめのひに さすもの' },
    { word: 'くつ', hint: '👟', clue: 'あしに はいて あるく' },
    { word: 'リュックサック', hint: '🎒', clue: 'せなかに せおう かばん' },
    { word: 'かがみ', hint: '🪞', clue: 'じぶんの かおが うつる' },
    { word: 'はさみ', hint: '✂️', clue: 'かみを きる どうぐ' },
    { word: 'たいこ', hint: '🥁', clue: 'どんどん たたく がっき' },
    { word: 'とけい', hint: '⏰', clue: 'じかんを おしえてくれる' },
    { word: 'でんわ', hint: '📞', clue: 'もしもしと はなす' },
    { word: 'テレビ', hint: '📺', clue: 'ばんぐみを みる はこ' },
    { word: 'せっけん', hint: '🧼', clue: 'てを あらうときに つかう' },
    { word: 'はぶらし', hint: '🪥', clue: 'はを みがく どうぐ' },
    { word: 'ふとん', hint: '🛏️', clue: 'ねるときに かけるもの' },
    { word: 'ほん', hint: '📖', clue: 'よんで たのしむもの' },
    { word: 'ぼうし', hint: '🧢', clue: 'あたまに かぶるもの' },
    { word: 'かばん', hint: '👜', clue: 'にもつを いれて もちあるく' },
    { word: 'くれよん', hint: '🖍️', clue: 'えを かく どうぐ' },
    { word: 'ピアノ', hint: '🎹', clue: 'けんばんを ひく がっき' },
    { word: 'すず', hint: '🔔', clue: 'ちりんちりんと なる' },
    { word: 'ラッパ', hint: '🎺', clue: 'ぷーっと ふく がっき' },
    { word: 'ふうせん', hint: '🎈', clue: 'ふくらませて とばすもの' },
    { word: 'ロボット', hint: '🤖', clue: 'きかいの ともだち' },
    { word: 'パソコン', hint: '💻', clue: 'しごとや べんきょうに つかう きかい' },
    { word: 'おさら', hint: '🍽️', clue: 'たべものを のせるもの' },
    { word: 'はし', hint: '🥢', clue: 'ごはんを たべる どうぐ' },
    { word: 'なべ', hint: '🥘', clue: 'ぐつぐつ にる どうぐ' },
    { word: 'シャツ', hint: '👕', clue: 'そでの ある きるもの' },
    { word: 'ズボン', hint: '👖', clue: 'あしに はく ふく' },
    { word: 'ドレス', hint: '👗', clue: 'おひめさまの ふく' },
    { word: 'ランドセル', hint: '🎒', clue: 'がっこうに もっていく かばん' },
  ],
}
type Cat = keyof typeof CATEGORIES

// ⑱修正: 2文字など短い単語でもかならず異なる順番を返す
function scramble(word: string): string[] {
  const chars = word.split('')
  if (chars.length <= 1) return chars
  let result: string[]
  let tries = 0
  do {
    result = [...chars].sort(() => Math.random() - 0.5)
    tries++
  } while (result.join('') === word && tries < 30)
  // 30回失敗したら強制的に先頭2文字を入れ替えて必ず違う並びにする
  if (result.join('') === word) {
    result = [...chars]
    ;[result[0], result[result.length - 1]] = [result[result.length - 1], result[0]]
  }
  return result
}

export function WordScramble() {
  const [phase, setPhase] = useState<'select' | 'play' | 'over'>('select')
  const [cat, setCat] = useState<Cat>('どうぶつ')
  const [timeMode, setTimeMode] = useState(false)
  const [words, setWords] = useState<WordEntry[]>([])
  const [idx, setIdx] = useState(0)
  const [tiles, setTiles] = useState<string[]>([])
  const [selected, setSelected] = useState<number[]>([])
  const [score, setScore] = useState(0)
  const [flash, setFlash] = useState<'ok' | 'ng' | null>(null)
  const [showHint, setShowHint] = useState(false)
  const [timeLeft, setTimeLeft] = useState(90)

  const word = words[idx] ?? { word: '', hint: '', clue: '' }

  const loadWord = useCallback((i: number, ws: WordEntry[]) => {
    if (i < ws.length) { setTiles(scramble(ws[i].word)); setSelected([]); setShowHint(false); setFlash(null) }
  }, [])

  useEffect(() => { loadWord(idx, words) }, [idx, words, loadWord])

  useEffect(() => {
    if (!timeMode || phase !== 'play') return
    const t = setInterval(() => setTimeLeft(v => { if (v <= 1) { setPhase('over'); return 0 } return v - 1 }), 1000)
    return () => clearInterval(t)
  }, [timeMode, phase])

  function startGame(c: Cat, tm: boolean) {
    const shuffled = [...CATEGORIES[c]].sort(() => Math.random() - 0.5)
    // ふつう: 10問を抽選（2文字語はならべ替えが自明なので最大3問まで）。タイムアタックは全語彙を循環
    const list = tm ? shuffled : (() => {
      const short = shuffled.filter(w => w.word.length <= 2).slice(0, 3)
      const long = shuffled.filter(w => w.word.length > 2)
      return [...short, ...long].slice(0, 10).sort(() => Math.random() - 0.5)
    })()
    setCat(c); setWords(list); setTimeMode(tm); setIdx(0); setScore(0); setTimeLeft(90)
    loadWord(0, list); setPhase('play')
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
          if (timeMode) {
            // ⑳修正: タイムアタックは全問解いたら最初から繰り返す
            const nextIdx = (idx + 1) % words.length
            setIdx(nextIdx)
          } else {
            if (idx + 1 >= words.length) { setPhase('over') } else { setIdx(i => i + 1) }
          }
        }, 500)
      } else {
        setFlash('ng'); setTimeout(() => { setSelected([]); setFlash(null) }, 400)
      }
    }
  }

  if (phase === 'select') return (
    <GameLayout title="もじならべ" gradient={GRAD}>
      <div className="flex flex-col gap-4 pt-4">
        <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-3 text-center">
          <p className="text-base font-black text-amber-700">📝 バラバラのもじを ただしいじゅんに タップしよう！</p>
          <p className="text-xs text-amber-600 mt-1">たとえば「こ・ね」→「ね」「こ」でねこ！</p>
        </div>
        <p className="text-center text-xl font-bold text-gray-700">カテゴリをえらんでね</p>
        {(Object.keys(CATEGORIES) as Cat[]).map(c => (
          <div key={c} className="bg-white rounded-2xl border-2 border-amber-200 p-4" style={{ boxShadow: '3px 4px 0 rgba(0,0,0,0.07)' }}>
            <p className="font-bold text-gray-700 mb-2">
              {c}<span className="text-xs text-gray-400 ml-2">ぜんぶで {CATEGORIES[c].length}ご</span>
            </p>
            <div className="flex gap-2">
              <button onClick={() => startGame(c, false)} className="flex-1 py-3 text-sm font-bold text-white rounded-xl shadow active:scale-95" style={{ background: GRAD }}>ふつう（10もん）</button>
              <button onClick={() => startGame(c, true)} className="flex-1 py-3 text-sm font-bold bg-orange-500 text-white rounded-xl shadow active:scale-95">⏱90びょう（くりかえし）</button>
            </div>
          </div>
        ))}
      </div>
    </GameLayout>
  )

  if (phase === 'over') {
    const isNewBest = timeMode && (getTaBest(cat) === 0 || score > getTaBest(cat)); if (timeMode) saveTaBest(cat, score)
    return (
      <GameLayout title="もじならべ" gradient={GRAD}>
        <ResultScreen
          score={score} total={timeMode ? undefined : words.length}
          scoreLabel={timeMode ? 'クリアしたもんだい' : undefined}
          scoreSuffix={timeMode ? 'もん' : undefined}
          bestStr={timeMode && getTaBest(cat) > 0 ? `${getTaBest(cat)}もん` : undefined}
          bestLabel="タイムアタック ベスト"
          onRetry={() => startGame(cat, timeMode)}
          onChangeMode={() => setPhase('select')}
          isNewBest={isNewBest}
          accentColor="text-amber-500"
        />
      </GameLayout>
    )
  }

  const current = selected.map(i => tiles[i]).join('')

  return (
    <GameLayout title="もじならべ" gradient={GRAD} isPlaying={phase === 'play'}>
      <div className={`flex flex-col items-center gap-4 rounded-3xl p-3 transition-colors ${flash === 'ok' ? 'bg-green-50' : flash === 'ng' ? 'bg-red-50' : ''}`}>
        <div className="flex justify-between w-full items-center">
          <div>
            <span className="text-xl font-bold text-gray-700">⭐ {score}</span>
            {timeMode && getTaBest(cat) > 0 && (
              <span className="text-xs text-gray-400 ml-2">🏆 {getTaBest(cat)}</span>
            )}
          </div>
          {timeMode
            ? <span className={`text-xl font-bold ${timeLeft <= 20 ? 'text-red-500 animate-pulse' : 'text-gray-700'}`}>⏱ {timeLeft}s</span>
            : <span className="text-xl font-bold text-gray-700">{idx + 1} / {words.length}</span>
          }
        </div>
        <div className="text-7xl mt-1">{word.hint}</div>
        {/* 絵文字が判別できなくても解けるよう、ひらがな説明を常時表示 */}
        <p className="text-lg font-bold text-gray-600 text-center px-2">{word.clue}</p>

        <div className="flex gap-2 bg-amber-50 rounded-2xl px-5 py-4 min-h-16 items-center justify-center w-full border-2 border-amber-200">
          {current.length > 0
            ? current.split('').map((c, i) => <span key={i} className="text-3xl font-black text-amber-700">{c}</span>)
            : <span className="text-gray-400 text-base">ひらがなをタップしてね</span>
          }
        </div>

        <div className="flex gap-2 flex-wrap justify-center">
          {tiles.map((t, i) => (
            <button
              key={i}
              onClick={() => tapTile(i)}
              disabled={selected.includes(i)}
              className={`w-14 h-14 text-2xl font-black rounded-xl border-2 transition-all active:scale-95 shadow-md ${
                selected.includes(i) ? 'bg-amber-50 border-amber-100 text-amber-50' : 'bg-white border-amber-300'
              }`}
            >
              {selected.includes(i) ? '' : t}
            </button>
          ))}
        </div>

        <div className="flex gap-2 w-full">
          <button onClick={() => setSelected([])} className="flex-1 py-3 text-base font-bold bg-white text-gray-600 rounded-2xl shadow border border-gray-200 active:scale-95">やりなおし</button>
          {/* 2文字語は先頭文字＝ほぼ答えになるためヒントなし */}
          {word.word.length > 2 && (!showHint
            ? <button onClick={() => setShowHint(true)} className="flex-1 py-3 text-base font-bold bg-amber-100 text-amber-700 rounded-2xl active:scale-95">ヒント</button>
            : <div className="flex-1 py-3 text-base font-bold bg-amber-100 text-amber-700 rounded-2xl text-center">「{word.word[0]}」からはじまる！</div>
          )}
        </div>
      </div>
    </GameLayout>
  )
}
