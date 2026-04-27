import { useState, useMemo } from 'react'
import { GameLayout } from '../components/GameLayout'

const GRAD = 'linear-gradient(135deg, #fbbf24, #f59e0b)'
type Level = 'easy' | 'normal' | 'hard'
interface Riddle { q: string; a: string; hint: string; level: Level }

const RIDDLES: Riddle[] = [
  { q: 'なきごえが「ワンワン」の どうぶつは？', a: 'いぬ', hint: 'ペット', level: 'easy' },
  { q: 'きいろくて ながくて あまい たべものは？', a: 'バナナ', hint: 'くだもの', level: 'easy' },
  { q: 'あかくて まるくて あまい たべものは？', a: 'りんご', hint: 'くだもの', level: 'easy' },
  { q: 'くびが ながい どうぶつは？', a: 'きりん', hint: 'どうぶつえん', level: 'easy' },
  { q: 'はなが ながくて おおきな どうぶつは？', a: 'ぞう', hint: 'どうぶつえん', level: 'easy' },
  { q: 'みずのなかで およぐ いきものは？', a: 'さかな', hint: 'うみや かわ', level: 'easy' },
  { q: 'まるくて かたくて ころがるものは？', a: 'ボール', hint: 'あそびどうぐ', level: 'easy' },
  { q: 'あめのひに もってでる ながいどうぐは？', a: 'かさ', hint: 'あめよけ', level: 'easy' },
  { q: 'しろいからだに くろいもようの どうぶつは？', a: 'しまうま', hint: 'どうぶつえん', level: 'easy' },
  { q: 'そらをとんで「チュンチュン」なく いきものは？', a: 'とり（すずめ）', hint: 'はばたくよ', level: 'easy' },
  { q: 'たべると なくなるのに、たべないと ふえるのは？', a: 'おなか（すき）', hint: 'おなかが…', level: 'normal' },
  { q: 'うえに のると、のった ひとが ちいさく なるのは？', a: 'やま', hint: 'しぜんのもの', level: 'normal' },
  { q: 'てがないのに まいにち はりをうごかしているのは？', a: 'とけい', hint: 'じかんをしらせる', level: 'normal' },
  { q: 'あながあっても なにも はいらない たべものは？', a: 'ドーナツ', hint: 'まるい おかし', level: 'normal' },
  { q: 'なきむしなのに みんなにすかれるのは？', a: 'あめ（雨）', hint: 'そらから ふってくる', level: 'normal' },
  { q: 'はやくはしるほど ながくなるものは？', a: 'いき（息）', hint: 'からだから でる', level: 'normal' },
  { q: 'かわをむかずに たべられる くだものは？', a: 'いちご（ぶどう）', hint: 'あかい くだもの', level: 'normal' },
  { q: 'ながければながいほど みじかくなるものは？', a: 'えんぴつ', hint: 'かくどうぐ', level: 'normal' },
  { q: 'おうちにあるのに そとのことをよくしっているのは？', a: 'まど（窓）', hint: 'へやのかべ', level: 'normal' },
  { q: 'たくさんあるほど かるくなるものは？', a: 'あな（穴）', hint: 'なにもないもの', level: 'normal' },
  { q: 'みずのなかにいるのに ぬれないものは？', a: 'かげ（影）', hint: 'ひかりでできる', level: 'normal' },
  { q: 'まいにちふんでいるのに きずがつかないものは？', a: 'じめん（地面）', hint: 'そとにある', level: 'normal' },
  { q: 'おこるほど おおきくなるのは？', a: 'こえ（声）', hint: 'のどから でる', level: 'normal' },
  { q: 'あるけばあるくほど ながくなるのは？', a: 'あしあと', hint: 'すなはまでみえる', level: 'normal' },
  { q: '1から10まで たすといくつ？', a: '55（1+2+3…+10）', hint: 'ぜんぶたしてみて', level: 'hard' },
  { q: 'たまごからうまれるが ほにゅうるいの どうぶつは？', a: 'カモノハシ', hint: 'オーストラリアにいる', level: 'hard' },
  { q: '「はながさく」と「はなをほる」、2つの「はな」のちがいは？', a: 'さく→flower、ほる→nose（鼻）', hint: 'からだの「はな」とは？', level: 'hard' },
  { q: 'せかいでいちばん ながいかわは？', a: 'ナイル川（エジプト）', hint: 'アフリカにある', level: 'hard' },
  { q: 'おやゆびだけ なまえのルールが ちがうのはなぜ？', a: 'ほかは「〜ゆび」（人差し指・中指・薬指・小指）', hint: 'てをみてみよう', level: 'hard' },
  { q: 'かみ1まいで せかいをまっぷたつに できるのはなぜ？', a: 'まんなかで おりたたむと2つに なる', hint: 'かみをおってみよう', level: 'hard' },
]

const LEVEL_LABELS: Record<Level, string> = { easy: '🌟 やさしい', normal: '⭐ ふつう', hard: '🔥 むずかしい' }
const LEVEL_BG: Record<Level, string> = { easy: 'bg-green-100 text-green-700', normal: 'bg-yellow-100 text-yellow-700', hard: 'bg-red-100 text-red-700' }

export function Riddles() {
  const [filter, setFilter] = useState<Level | 'all'>('all')
  const [idx, setIdx] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [seenCount, setSeenCount] = useState(0)

  const filtered = useMemo(() => filter === 'all' ? RIDDLES : RIDDLES.filter(r => r.level === filter), [filter])
  const riddle = filtered[idx % filtered.length]

  function changeFilter(f: Level | 'all') { setFilter(f); setIdx(0); setRevealed(false); setShowHint(false) }
  function next() { setIdx(i => (i + 1) % filtered.length); setRevealed(false); setShowHint(false); setSeenCount(c => c + 1) }
  function prev() { setIdx(i => (i - 1 + filtered.length) % filtered.length); setRevealed(false); setShowHint(false) }

  return (
    <GameLayout title="なぞなぞ" gradient={GRAD}>
      <div className="flex flex-col items-center gap-4 pt-2">
        {/* フィルタ */}
        <div className="flex gap-2 w-full overflow-x-auto pb-1">
          {(['all', 'easy', 'normal', 'hard'] as (Level | 'all')[]).map(f => (
            <button key={f} onClick={() => changeFilter(f)}
              className={`flex-shrink-0 px-3 py-2 rounded-xl text-sm font-bold border-2 transition-all active:scale-95 ${filter === f ? 'text-white border-transparent' : 'bg-white text-gray-600 border-gray-200'}`}
              style={filter === f ? { background: GRAD } : {}}>
              {f === 'all' ? '📚 ぜんぶ' : LEVEL_LABELS[f]}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <span className={`rounded-full px-3 py-1 text-xs font-bold ${LEVEL_BG[riddle.level]}`}>{LEVEL_LABELS[riddle.level]}</span>
          <span className="text-sm text-gray-400">{(idx % filtered.length) + 1} / {filtered.length}</span>
        </div>

        {/* 問題 */}
        <div className="bg-amber-50 border-2 border-amber-200 rounded-3xl p-5 w-full shadow-md">
          <p className="text-2xl font-bold text-gray-800 leading-relaxed text-center">🤔 {riddle.q}</p>
        </div>

        {showHint && (
          <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl px-5 py-3 w-full bounce-in">
            <p className="text-lg text-orange-600 text-center font-bold">💡 ヒント：{riddle.hint}</p>
          </div>
        )}

        {/* 答え */}
        {revealed ? (
          <div className="bg-green-50 border-2 border-green-300 rounded-3xl p-5 w-full shadow bounce-in">
            <p className="text-base text-gray-500 text-center mb-1">こたえ 🎉</p>
            <p className="text-2xl font-black text-green-600 text-center">{riddle.a}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2 w-full">
            <button onClick={() => { setRevealed(true); setSeenCount(c => c + 1) }} className="w-full py-5 text-xl font-black text-white rounded-2xl shadow-lg active:scale-95" style={{ background: GRAD }}>
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
          <button onClick={prev} className="flex-1 py-4 text-lg font-bold bg-white text-gray-600 rounded-2xl shadow border border-gray-200 active:scale-95">← まえ</button>
          <button onClick={next} className="flex-1 py-4 text-lg font-bold text-white rounded-2xl shadow-lg active:scale-95" style={{ background: GRAD }}>つぎ →</button>
        </div>
        <p className="text-xs text-gray-400">みたもんだい：{seenCount}もん</p>
      </div>
    </GameLayout>
  )
}
