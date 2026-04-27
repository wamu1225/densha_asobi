import { useState } from 'react'
import { GameLayout } from '../components/GameLayout'

const RIDDLES = [
  { q: 'たべると なくなるのに、たべないと ふえるのは なに？', a: 'おなか（すき）', hint: 'おなかが…' },
  { q: 'うえに のると、のった ひとが ちいさく なるのは なに？', a: 'やま', hint: 'しぜんのもの' },
  { q: 'あかい かさを もっているのに、ぬれている たべものは なに？', a: 'トマト', hint: 'やさい' },
  { q: 'くびが ながくて まだら もようの どうぶつは なに？', a: 'きりん', hint: 'どうぶつえんに いるよ' },
  { q: 'みずの なかに いるのに、ぬれない ものは なに？', a: 'かげ（かわのそこのかげ）', hint: 'ひかりで できるもの' },
  { q: 'てが ないのに、まいにち はりを うごかしているのは なに？', a: 'とけい', hint: 'じかんを しらせるもの' },
  { q: 'なにも はいっていないのに、おもい はこは なに？', a: 'おもい（重い）はこ', hint: 'ことばあそび！' },
  { q: 'かたな いっぽんで せかいを きれる ものは なに？', a: 'め（目）', hint: 'かおに ついてるよ' },
  { q: 'まいにち ふんで いるのに、きずが つかない ものは なに？', a: 'じめん', hint: 'そとに あるよ' },
  { q: 'いつも ねているのに、ふんでも おこらない ものは なに？', a: 'じゅうたん', hint: 'へやの なかに あるよ' },
  { q: 'はやく はしるほど、ながく なる ものは なに？', a: 'いき（息）', hint: 'からだの なかから でるよ' },
  { q: 'なきむしなのに、みんなに すかれる ものは なに？', a: 'あめ（雨）', hint: 'そらから ふってくる' },
  { q: 'かおが ないのに、みんなが みる ものは なに？', a: 'とけい', hint: 'じかんが わかるもの' },
  { q: 'みんなが しっているのに、だれも あったことが ない ものは なに？', a: 'かぜ', hint: 'そとで かんじるよ' },
  { q: 'あなが あっても、なにも はいらない ものは なに？', a: 'ドーナツ', hint: 'たべものだよ' },
  { q: 'しろいのに、くろい ものは なに？', a: 'ゆき（とけると どろになる）', hint: 'ふゆに ふる' },
  { q: 'なんでも きれるのに、きれ ないものが ひとつ だけ ある。それは なに？', a: 'はさみ（ハサミで切れないのは空気）', hint: 'きょうしつに あるよ' },
  { q: 'ひとりで あるいているのに、じぶんの かどに かならず ぶつかる のは なに？', a: 'まわり道をしているから… ちがう！ かど', hint: 'べつのかんがえかた' },
  { q: 'たくさん あるほど、かるく なる ものは なに？', a: 'あな（穴）', hint: 'なにも ないもの' },
  { q: 'どんなに おおきな かみでも、のりこえられない ものは なに？', a: 'まんなかの せん', hint: 'かみを おりたたんで みて' },
]

export function Riddles() {
  const [idx, setIdx] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [showHint, setShowHint] = useState(false)

  const riddle = RIDDLES[idx]

  function next() {
    setIdx(i => (i + 1) % RIDDLES.length)
    setRevealed(false)
    setShowHint(false)
  }

  function prev() {
    setIdx(i => (i - 1 + RIDDLES.length) % RIDDLES.length)
    setRevealed(false)
    setShowHint(false)
  }

  return (
    <GameLayout title="なぞなぞ" color="bg-yellow-400">
      <div className="flex flex-col items-center gap-5 pt-4">
        <p className="text-sm text-gray-400">{idx + 1} / {RIDDLES.length}</p>

        <div className="bg-yellow-50 border-2 border-yellow-300 rounded-3xl p-6 w-full shadow">
          <p className="text-2xl font-bold text-gray-800 leading-relaxed text-center">
            🤔 {riddle.q}
          </p>
        </div>

        {showHint && (
          <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl px-5 py-3 w-full">
            <p className="text-lg text-orange-600 text-center">💡 ヒント：{riddle.hint}</p>
          </div>
        )}

        {revealed ? (
          <div className="bg-green-50 border-2 border-green-300 rounded-3xl p-6 w-full shadow bounce-in">
            <p className="text-lg text-gray-500 text-center mb-1">こたえ 🎉</p>
            <p className="text-3xl font-bold text-green-600 text-center">{riddle.a}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 w-full">
            <button
              onClick={() => setRevealed(true)}
              className="w-full py-5 text-xl font-bold bg-yellow-400 text-white rounded-2xl shadow active:scale-95"
            >
              こたえを みる 👀
            </button>
            {!showHint && (
              <button
                onClick={() => setShowHint(true)}
                className="w-full py-3 text-lg font-bold bg-orange-100 text-orange-600 rounded-2xl active:scale-95"
              >
                ヒントを みる 💡
              </button>
            )}
          </div>
        )}

        <div className="flex gap-4 w-full mt-2">
          <button onClick={prev} className="flex-1 py-4 text-lg font-bold bg-gray-200 text-gray-600 rounded-2xl active:scale-95">
            ← まえ
          </button>
          <button onClick={next} className="flex-1 py-4 text-lg font-bold bg-yellow-400 text-white rounded-2xl shadow active:scale-95">
            つぎ →
          </button>
        </div>
      </div>
    </GameLayout>
  )
}
