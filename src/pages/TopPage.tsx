import { useNavigate } from 'react-router-dom'

const GAMES = [
  { path: '/math',    emoji: '🔢', title: 'けいさん\nスプリント', desc: 'たしざん・ひきざん',  bg: 'bg-orange-400', shadow: 'shadow-orange-200' },
  { path: '/bigger',  emoji: '⚖️', title: 'どっちが\nおおきい？', desc: '2けたのかずくらべ',  bg: 'bg-blue-400',   shadow: 'shadow-blue-200'   },
  { path: '/clock',   emoji: '🕐', title: 'とけいを\nよもう',      desc: 'なんじなんぷん？',   bg: 'bg-purple-400', shadow: 'shadow-purple-200' },
  { path: '/riddles', emoji: '🤔', title: 'なぞなぞ',             desc: 'むずかしいぞ！',     bg: 'bg-yellow-400', shadow: 'shadow-yellow-200' },
  { path: '/bingo',   emoji: '🚃', title: 'でんしゃ\nビンゴ',     desc: 'まどのそとをみよう', bg: 'bg-green-400',  shadow: 'shadow-green-200'  },
  { path: '/color',   emoji: '🎨', title: 'いろさがし\nチャレンジ', desc: 'そとでみつけよう',  bg: 'bg-pink-400',   shadow: 'shadow-pink-200'   },
  { path: '/memory',  emoji: '🃏', title: 'しんけい\nすいじゃく',  desc: 'えあわせゲーム',    bg: 'bg-teal-400',   shadow: 'shadow-teal-200'   },
  { path: '/next',    emoji: '🔮', title: 'つぎは\nどれ？',        desc: 'パターンをさがせ',   bg: 'bg-indigo-400', shadow: 'shadow-indigo-200' },
  { path: '/maze',    emoji: '🗺️', title: 'すうじ\nめいろ',        desc: 'じゅんばんにタップ', bg: 'bg-red-400',    shadow: 'shadow-red-200'    },
  { path: '/scramble',emoji: '📝', title: 'もじ\nならべ',          desc: 'ことばをつくろう',   bg: 'bg-amber-400',  shadow: 'shadow-amber-200'  },
  { path: '/search',  emoji: '🔍', title: 'ひらがな\nさがし',      desc: 'かくれたことばは？', bg: 'bg-cyan-400',   shadow: 'shadow-cyan-200'   },
  { path: '/dots',    emoji: '✏️', title: 'ドット\nつなぎ',        desc: 'なにができるかな？', bg: 'bg-lime-400',   shadow: 'shadow-lime-200'   },
]

export function TopPage() {
  const navigate = useNavigate()
  return (
    <div className="min-h-svh bg-sky-50">
      <header className="bg-sky-500 text-white text-center py-5 shadow-md">
        <div className="text-4xl mb-1">🚃</div>
        <h1 className="text-2xl font-bold">でんしゃあそび</h1>
        <p className="text-sm text-sky-100 mt-1">でんしゃのなかで あそぼう！</p>
      </header>

      <main className="p-4 max-w-lg mx-auto">
        <div className="grid grid-cols-3 gap-3 mt-2">
          {GAMES.map((game) => (
            <button
              key={game.path}
              onClick={() => navigate(game.path)}
              className={`${game.bg} ${game.shadow} text-white rounded-2xl p-3 flex flex-col items-center gap-1 shadow-lg active:scale-95 transition-transform`}
            >
              <span className="text-3xl">{game.emoji}</span>
              <span className="text-xs font-bold leading-tight whitespace-pre-line text-center">
                {game.title}
              </span>
            </button>
          ))}
        </div>

        <p className="text-center text-gray-400 text-xs mt-6 mb-4">
          🚃 でんしゃのなかで たのしもう！
        </p>
      </main>
    </div>
  )
}
