import { useState, useMemo } from 'react'
import { GameLayout } from '../components/GameLayout'

const GRAD = 'linear-gradient(135deg, #fbbf24, #f59e0b)'
type Level = 'easy' | 'normal' | 'hard'
interface Riddle { q: string; a: string; hint: string; level: Level }

const RIDDLES: Riddle[] = [
  // ── やさしい（ダジャレ・なぞなぞ）──
  { q: 'しろくて まるくて、ぱかっと われると きいろい のは なに？', a: 'たまご', hint: 'にわとりが うむもの', level: 'easy' },
  { q: 'は（歯）を もっているのに、なにも たべられないのは なに？', a: 'くし', hint: 'かみをとくどうぐ', level: 'easy' },
  { q: 'くろいのに、かくと しろくなるのは なに？', a: 'こくばん（黒板）', hint: 'がっこうにある', level: 'easy' },
  { q: 'あしが 4ほん あるのに、あるけないのは なに？', a: 'いす・つくえ', hint: 'すわるもの', level: 'easy' },
  { q: 'さわると きえてしまうのは なに？', a: 'あわ（泡）', hint: 'おふろにある', level: 'easy' },
  { q: 'おふろに はいるほど、ちいさくなるのは なに？', a: 'せっけん', hint: 'からだをあらうもの', level: 'easy' },
  { q: 'ひるは ねていて、よるは ひかるのは なに？', a: 'ほし（星）', hint: 'そらにある', level: 'easy' },
  { q: 'まえからよんでも うしろからよんでも おなじ ことばは なに？（5もじ）', a: 'しんぶんし（新聞紙）', hint: 'さかさまによんでみよう', level: 'easy' },
  { q: 'うえからみると まる、よこからみると しかくなのは なに？', a: 'コップ', hint: 'のみものをいれる', level: 'easy' },
  { q: 'くちも あしも あるのに、しゃべれないし あるけないのは なに？', a: 'にんぎょう（人形）', hint: 'おもちゃだよ', level: 'easy' },
  // ── ふつう ──
  { q: 'ふめば ふむほど まえに すすむ のりものは なに？', a: 'じてんしゃ', hint: 'ぺだるを ふむよ', level: 'normal' },
  { q: 'たかく のぼれば のぼるほど、したの ものが ちいさく みえる ばしょは どこ？', a: 'やまの うえ', hint: 'しぜんのもの', level: 'normal' },
  { q: 'てがないのに、まいにち はりをうごかしているのは なに？', a: 'とけい', hint: 'じかんをしらせる', level: 'normal' },
  { q: 'そらが ないて いるみたいに ふってくるのは なに？', a: 'あめ（雨）', hint: 'かさが いるよ', level: 'normal' },
  { q: 'はしればはしるほど、みじかくなるのは なに？', a: 'いき（息）', hint: 'からだからでる', level: 'normal' },
  { q: 'たくさんあるほど、かるくなるものは なに？', a: 'あな（穴）', hint: 'なにもないもの', level: 'normal' },
  { q: 'みずのなかにいるのに、ぬれないものは なに？', a: 'かげ（影）', hint: 'ひかりでできる', level: 'normal' },
  { q: 'おこるほど おおきくなるのは なに？', a: 'こえ（声）', hint: 'のどからでる', level: 'normal' },
  { q: 'つかえば つかうほど みじかくなるものは なに？', a: 'えんぴつ', hint: 'かくどうぐ', level: 'normal' },
  { q: 'あるけばあるくほど ながくなるのは なに？', a: 'あしあと', hint: 'すなはまでみえる', level: 'normal' },
  // ── むずかしい ──
  { q: 'まいにちやってくるのに、だれも みたことがないのは なに？', a: 'あした（明日）', hint: 'きょうのつぎ', level: 'hard' },
  { q: 'じぶんの ものなのに、ほかのひとの ほうが よく つかうものは なに？', a: 'なまえ（名前）', hint: 'よばれるもの', level: 'hard' },
  { q: 'どんなに おいかけても、ぜったいに つかまえられないのは なに？', a: 'じかん（時間）', hint: 'めにみえない', level: 'hard' },
  { q: 'こどものときは よつあし、おとなは ふたあし、としよりは みつあしの いきものは なに？', a: 'にんげん（人間）', hint: 'わたしたちのこと', level: 'hard' },
  { q: 'いつも みんなを かこんでいるのに、だれも きづかないのは なに？', a: 'くうき（空気）', hint: 'いきをするもの', level: 'hard' },
  { q: 'つくりばなし なのに、みんなが よろこんで きくものは なに？', a: 'えほん（おはなし）', hint: 'ねるまえに よんでもらう', level: 'hard' },
  { q: 'ひとりでは できるのに、ふたりでは できないことは なに？', a: 'ひとりごと（独り言）', hint: 'じぶんだけにきこえる', level: 'hard' },
  { q: 'みずを のまないのに、みずのそばに いつも いるのは なに？', a: 'はし（橋）', hint: 'かわのうえにある', level: 'hard' },
  { q: 'あなだらけ なのに、みずが だいすきなのは なに？', a: 'すぽんじ', hint: 'おさらを あらうとき つかう', level: 'hard' },
  { q: 'はしを わたらずに、はしのしたを とおるのは なに？', a: 'かわのみず（川の水）', hint: 'かわのながれ', level: 'hard' },
  // ── 2026-06-12 追加20問（P6） ──
  { q: 'ぱんは ぱんでも、たべられない ぱんは なに？', a: 'ふらいぱん', hint: 'りょうりに つかうよ', level: 'easy' },
  { q: 'いすは いすでも、つめたくて あまい いすは なに？', a: 'あいす', hint: 'おやつだよ', level: 'easy' },
  { q: '「かばん」の なかに かくれている どうぶつは なに？', a: 'かば', hint: 'もじを よく みてみよう', level: 'easy' },
  { q: '「ぼうし」の なかに かくれている どうぶつは なに？', a: 'うし', hint: 'もじの なかに いるよ', level: 'easy' },
  { q: '「すいか」の なかに かくれている うみの いきものは？', a: 'いか', hint: 'もじの なかだよ', level: 'easy' },
  { q: '「くじら」の なかに かくれている、あたると うれしい ものは？', a: 'くじ', hint: 'おまつりで ひくよ', level: 'easy' },
  { q: 'まえから よんでも うしろから よんでも おなじ、あかい やさいは？', a: 'とまと', hint: 'さらだに はいってる', level: 'easy' },
  { q: 'たたいても たたいても、いたくない ものは なに？', a: 'たいこ', hint: 'がっきだよ', level: 'easy' },
  { q: 'かさは かさでも、あめのひに させない かさは なに？', a: 'まつかさ（まつぼっくり）', hint: 'まつのきに あるよ', level: 'normal' },
  { q: 'とけいは とけいでも、はりが ない とけいは なに？', a: 'でじたるどけい', hint: 'すうじで じかんが でる', level: 'normal' },
  { q: '「きる」と へやから きえる ものは なに？', a: 'でんき', hint: 'すいっちで つけるもの', level: 'normal' },
  { q: 'ふっても ふっても、ぬれない ものは なに？', a: 'ふとん', hint: '「ふる」には いみが 2つ', level: 'normal' },
  { q: 'かいても かいても へらない、うんどうすると でてくる みずは？', a: 'あせ', hint: '「かく」にも いみが 2つ', level: 'normal' },
  { q: 'あかちゃんを のせて おす くるまは なに？', a: 'べびーかー', hint: 'あかちゃんの おでかけ', level: 'normal' },
  { q: 'きつねの なきごえで ふってくる ものは なに？', a: 'ゆき', hint: 'こんこん ふるよ', level: 'normal' },
  { q: '365にち やすまず うごきつづけている、からだの なかに ある ものは？', a: 'しんぞう（心臓）', hint: 'むねに てを あててみよう', level: 'hard' },
  { q: 'たんじょうびの たびに ふえるのに、めに みえない ものは？', a: 'とし（ねんれい）', hint: 'ろうそくの かずと おなじ', level: 'hard' },
  { q: 'みんなには みえるのに、じぶんの めでは ぜったいに みえない ものは？', a: 'じぶんの かお', hint: 'かがみが ないと みえない', level: 'hard' },
  { q: 'おしても ひいても うごかないのに、じかんが たつと うごいている ものは？', a: 'かげ（影）', hint: 'たいようが うごかすよ', level: 'hard' },
  { q: 'こわすひとは いないのに、まいあさ かならず「あける」ものは？', a: 'よる（夜）', hint: 'あさに なると おわるもの', level: 'hard' },
]

const LEVEL_LABELS: Record<Level, string> = { easy: '★ やさしい', normal: '★★ ふつう', hard: '★★★ むずかしい' }
const LEVEL_BG: Record<Level, string> = {
  easy: 'bg-green-100 text-green-700',
  normal: 'bg-yellow-100 text-yellow-700',
  hard: 'bg-red-100 text-red-700',
}

const SEEN_KEY = 'densha_riddles_seen'
function bumpSeen(): number {
  const n = (parseInt(localStorage.getItem(SEEN_KEY) || '0') || 0) + 1
  localStorage.setItem(SEEN_KEY, String(n))
  return n
}

export function Riddles() {
  const [filter, setFilter] = useState<Level | 'all'>('all')
  const [idx, setIdx] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [seenCount, setSeenCount] = useState(0)

  const filtered = useMemo(
    () => (filter === 'all' ? RIDDLES : RIDDLES.filter(r => r.level === filter)),
    [filter],
  )
  const riddle = filtered[idx % filtered.length]

  function changeFilter(f: Level | 'all') {
    setFilter(f); setIdx(0); setRevealed(false); setShowHint(false)
  }
  function next() {
    setIdx(i => (i + 1) % filtered.length)
    setRevealed(false); setShowHint(false); setSeenCount(c => c + 1); bumpSeen()
  }
  function prev() {
    setIdx(i => (i - 1 + filtered.length) % filtered.length)
    setRevealed(false); setShowHint(false)
  }

  return (
    <GameLayout title="なぞなぞ" gradient={GRAD}>
      <div className="flex flex-col items-center gap-4 pt-2">
        {/* フィルタ */}
        <div className="flex gap-2 w-full overflow-x-auto pb-1">
          {(['all', 'easy', 'normal', 'hard'] as (Level | 'all')[]).map(f => (
            <button
              key={f}
              onClick={() => changeFilter(f)}
              className={`flex-shrink-0 px-3 py-2 rounded-xl text-sm font-bold border-2 transition-all active:scale-95 ${
                filter === f ? 'text-white border-transparent' : 'bg-white text-gray-600 border-gray-200'
              }`}
              style={filter === f ? { background: GRAD } : {}}
            >
              {f === 'all' ? 'ぜんぶ' : LEVEL_LABELS[f]}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <span className={`rounded-full px-3 py-1 text-xs font-bold ${LEVEL_BG[riddle.level]}`}>
            {LEVEL_LABELS[riddle.level]}
          </span>
          <span className="text-sm text-gray-400">{(idx % filtered.length) + 1} / {filtered.length}</span>
        </div>

        {/* 問題 */}
        <div className="bg-amber-50 border-2 border-amber-200 rounded-3xl p-5 w-full shadow-md">
          <p className="text-2xl font-bold text-gray-800 leading-relaxed text-center">{riddle.q}</p>
        </div>

        {showHint && (
          <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl px-5 py-3 w-full bounce-in">
            <p className="text-lg text-orange-600 text-center font-bold">ヒント：{riddle.hint}</p>
          </div>
        )}

        {/* 答え */}
        {revealed ? (
          <div className="bg-green-50 border-2 border-green-300 rounded-3xl p-5 w-full shadow bounce-in">
            <p className="text-base text-gray-500 text-center mb-1">こたえ</p>
            <p className="text-2xl font-black text-green-600 text-center">{riddle.a}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2 w-full">
            <button
              onClick={() => { setRevealed(true); setSeenCount(c => c + 1); bumpSeen() }}
              className="w-full py-5 text-xl font-black text-white rounded-2xl shadow-lg active:scale-95"
              style={{ background: GRAD }}
            >
              こたえを みる
            </button>
            {!showHint && (
              <button
                onClick={() => setShowHint(true)}
                className="w-full py-3 text-base font-bold bg-orange-100 text-orange-600 rounded-2xl active:scale-95"
              >
                ヒントをみる
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
