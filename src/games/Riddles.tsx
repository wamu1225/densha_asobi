import { useState, useMemo } from 'react'
import { GameLayout } from '../components/GameLayout'

type Level = 'easy' | 'normal' | 'hard'
interface Riddle { q: string; a: string; hint: string; level: Level }

const RIDDLES: Riddle[] = [
  // easy
  { q: 'なきごえが「ワンワン」の どうぶつは？', a: 'いぬ', hint: 'ペット', level: 'easy' },
  { q: 'きいろくて ながくて あまい たべものは？', a: 'バナナ', hint: 'くだもの', level: 'easy' },
  { q: 'あかくて まるくて あまい たべものは？', a: 'りんご', hint: 'くだもの', level: 'easy' },
  { q: 'くびが ながくて まだらもようの どうぶつは？', a: 'きりん', hint: 'どうぶつえん', level: 'easy' },
  { q: 'はなが ながくて、おおきな どうぶつは？', a: 'ぞう', hint: 'どうぶつえん', level: 'easy' },
  { q: 'みずの なかで およぐ、ひれがある いきものは？', a: 'さかな', hint: 'うみや かわ', level: 'easy' },
  { q: 'まるくて かたくて、ころころ ころがる ものは？', a: 'ボール', hint: 'あそびどうぐ', level: 'easy' },
  { q: 'あめのひに もってでる、ながくなるどうぐは？', a: 'かさ', hint: 'あめ よけ', level: 'easy' },
  { q: 'しろい からだに くろい もようの どうぶつは？', a: 'しまうま', hint: 'どうぶつえん', level: 'easy' },
  { q: 'そらを とんで、「チュンチュン」なく いきものは？', a: 'とり（すずめ）', hint: 'はばたくよ', level: 'easy' },
  // normal
  { q: 'たべると なくなるのに、たべないと ふえるのは なに？', a: 'おなか（すき）', hint: 'おなかが…', level: 'normal' },
  { q: 'うえに のると、のった ひとが ちいさく なるのは なに？', a: 'やま', hint: 'しぜんのもの', level: 'normal' },
  { q: 'てが ないのに、まいにち はりを うごかしているのは なに？', a: 'とけい', hint: 'じかんを しらせるもの', level: 'normal' },
  { q: 'あながあっても なにも はいらない たべものは？', a: 'ドーナツ', hint: 'まるい おかし', level: 'normal' },
  { q: 'なきむしなのに、みんなに すかれるのは なに？', a: 'あめ（雨）', hint: 'そらから ふってくる', level: 'normal' },
  { q: 'はやく はしるほど、ながく なる ものは なに？', a: 'いき（息）', hint: 'からだの なかから でる', level: 'normal' },
  { q: 'かわを むかずに たべられる くだものは？', a: 'いちご（または ぶどう）', hint: 'あかい くだもの', level: 'normal' },
  { q: 'ながければ ながいほど みじかくなる ものは？', a: 'えんぴつ', hint: 'かくどうぐ', level: 'normal' },
  { q: 'おうちに あるのに、そとの ことを よく しっているのは？', a: 'まど（窓）', hint: 'へやの かべに ある', level: 'normal' },
  { q: 'たくさん あるほど、かるく なる ものは なに？', a: 'あな（穴）', hint: 'なにも ない もの', level: 'normal' },
  { q: 'みずの なかに いるのに、ぬれない ものは なに？', a: 'かげ（影）', hint: 'ひかりで できる', level: 'normal' },
  { q: 'まいにち ふんでいるのに、きずが つかない ものは？', a: 'じめん（地面）', hint: 'そとに ある', level: 'normal' },
  { q: 'おこるほど おおきく なるのは？', a: 'こえ（声）', hint: 'のどから でる', level: 'normal' },
  { q: 'あるけばあるくほど ながくなるのは？', a: 'あしあと（足跡）', hint: 'すなはまで みえる', level: 'normal' },
  // hard
  { q: 'さかさに しても よめる ことばは？（ヒント：3もじ）', a: 'シース、たけた、など（さかさにしてもよめることば）', hint: 'ひっくりかえして よんでみて', level: 'hard' },
  { q: '「はながさく」「はなをほる」、2つの「はな」のちがいは？', a: 'さく はな は flower、ほるはなは nose（鼻）', hint: 'からだの「はな」とは？', level: 'hard' },
  { q: 'せかいで いちばん ながい かわは？', a: 'ナイル川（エジプト）', hint: 'アフリカに ある', level: 'hard' },
  { q: '1から 10まで たすと いくつ？', a: '55（1+2+3...+10）', hint: 'ぜんぶ たしてみて', level: 'hard' },
  { q: 'たまごから うまれるけど、ほにゅうるいの どうぶつは？', a: 'カモノハシ', hint: 'オーストラリアに いる ふしぎなどうぶつ', level: 'hard' },
  { q: 'おやゆびだけ なまえが ちがう ゆびは？ ほかのゆびの なまえの ルールは？', a: 'おやゆび（人差し指・中指・薬指・小指は「〜ゆび」）', hint: 'てを みてみよう', level: 'hard' },
]

const LEVEL_LABELS: Record<Level, string> = { easy: '🌟 やさしい', normal: '⭐ ふつう', hard: '🔥 むずかしい' }

export function Riddles() {
  const [filter, setFilter] = useState<Level | 'all'>('all')
  const [idx, setIdx] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [seenCount, setSeenCount] = useState(0)

  const filtered = useMemo(() =>
    filter === 'all' ? RIDDLES : RIDDLES.filter(r => r.level === filter)
  , [filter])

  const riddle = filtered[idx % filtered.length]

  function changeFilter(f: Level | 'all') {
    setFilter(f); setIdx(0); setRevealed(false); setShowHint(false)
  }

  function next() {
    setIdx(i => (i + 1) % filtered.length)
    setRevealed(false); setShowHint(false)
    setSeenCount(c => c + 1)
  }

  function prev() {
    setIdx(i => (i - 1 + filtered.length) % filtered.length)
    setRevealed(false); setShowHint(false)
  }

  function reveal() { setRevealed(true); setSeenCount(c => c + 1) }

  return (
    <GameLayout title="なぞなぞ" color="bg-yellow-400">
      <div className="flex flex-col items-center gap-4 pt-2">
        <div className="flex gap-2 w-full overflow-x-auto pb-1">
          {(['all', 'easy', 'normal', 'hard'] as (Level | 'all')[]).map(f => (
            <button key={f} onClick={() => changeFilter(f)}
              className={`flex-shrink-0 px-3 py-2 rounded-xl text-sm font-bold border-2 transition-all ${filter === f ? 'bg-yellow-400 text-white border-yellow-400' : 'bg-white text-gray-600 border-gray-200'}`}>
              {f === 'all' ? '📚 ぜんぶ' : LEVEL_LABELS[f]}
            </button>
          ))}
        </div>

        <p className="text-sm text-gray-400">{(idx % filtered.length) + 1} / {filtered.length} もん</p>

        <div className={`rounded-xl px-2 py-1 text-xs font-bold ${riddle.level === 'easy' ? 'bg-green-100 text-green-700' : riddle.level === 'normal' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
          {LEVEL_LABELS[riddle.level]}
        </div>

        <div className="bg-yellow-50 border-2 border-yellow-300 rounded-3xl p-5 w-full shadow">
          <p className="text-2xl font-bold text-gray-800 leading-relaxed text-center">
            🤔 {riddle.q}
          </p>
        </div>

        {showHint && (
          <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl px-5 py-3 w-full bounce-in">
            <p className="text-lg text-orange-600 text-center">💡 ヒント：{riddle.hint}</p>
          </div>
        )}

        {revealed ? (
          <div className="bg-green-50 border-2 border-green-300 rounded-3xl p-5 w-full shadow bounce-in">
            <p className="text-base text-gray-500 text-center mb-1">こたえ 🎉</p>
            <p className="text-2xl font-bold text-green-600 text-center">{riddle.a}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2 w-full">
            <button onClick={reveal} className="w-full py-5 text-xl font-bold bg-yellow-400 text-white rounded-2xl shadow active:scale-95">
              こたえを みる 👀
            </button>
            {!showHint && (
              <button onClick={() => setShowHint(true)} className="w-full py-3 text-base font-bold bg-orange-100 text-orange-600 rounded-2xl active:scale-95">
                ヒントをみる 💡
              </button>
            )}
          </div>
        )}

        <div className="flex gap-3 w-full">
          <button onClick={prev} className="flex-1 py-4 text-lg font-bold bg-gray-200 text-gray-600 rounded-2xl active:scale-95">← まえ</button>
          <button onClick={next} className="flex-1 py-4 text-lg font-bold bg-yellow-400 text-white rounded-2xl shadow active:scale-95">つぎ →</button>
        </div>
        <p className="text-xs text-gray-400">みたもんだい：{seenCount}もん</p>
      </div>
    </GameLayout>
  )
}
