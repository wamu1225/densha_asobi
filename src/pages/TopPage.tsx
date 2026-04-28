import { useNavigate } from 'react-router-dom'

// 12色→4カテゴリ色に統一
const GAMES = [
  // 算数・数字 — 赤
  { path: '/math',     emoji: '🔢', title: 'けいさん\nスプリント', sub: 'たしざん・ひきざん',  cat: 'red' },
  { path: '/bigger',   emoji: '⚖️', title: 'どっちが\nおおきい？', sub: '2けたのかずくらべ',  cat: 'red' },
  { path: '/clock',    emoji: '🕐', title: 'とけいを\nよもう',      sub: 'なんじなんぷん？',   cat: 'red' },
  // 言葉・ひらがな — 青
  { path: '/scramble', emoji: '📝', title: 'もじ\nならべ',          sub: 'ことばをつくろう',   cat: 'blue' },
  { path: '/search',   emoji: '🔍', title: 'ひらがな\nさがし',      sub: 'かくれたことばは？', cat: 'blue' },
  // 観察・外 — 緑
  { path: '/bingo',    emoji: '🚃', title: 'でんしゃ\nビンゴ',     sub: 'まどのそとをみよう', cat: 'green' },
  { path: '/color',    emoji: '🎨', title: 'いろさがし',            sub: 'そとでみつけよう',   cat: 'green' },
  // 記憶・パズル — 紫
  { path: '/memory',   emoji: '🃏', title: 'しんけい\nすいじゃく',  sub: 'えあわせゲーム',     cat: 'purple' },
  { path: '/next',     emoji: '🔮', title: 'つぎは\nどれ？',        sub: 'パターンをさがせ',   cat: 'purple' },
  { path: '/maze',     emoji: '🗺️', title: 'すうじ\nめいろ',        sub: 'じゅんばんにタップ', cat: 'orange' },
  { path: '/dots',     emoji: '✏️', title: 'ドット\nつなぎ',        sub: 'なにができるかな？', cat: 'purple' },
] as const

// カテゴリ → 色設定
const CAT = {
  red:    { border: '#C8352A', bg: '#FFF6F5', text: '#9B1B13' },
  blue:   { border: '#2558C4', bg: '#F0F5FF', text: '#1A3A9B' },
  green:  { border: '#217A4B', bg: '#F0FAF4', text: '#145530' },
  purple: { border: '#6B3FC0', bg: '#F6F0FF', text: '#4A2690' },
  orange: { border: '#B8500A', bg: '#FFF5EE', text: '#8A3A06' },
}

// カードごとの微小回転（手作り感）
const ROTATIONS = [-1.2, 0.8, -0.5, 1.5, -1, 0.5, -1.8, 1, -0.5, 1.2, -0.8, 0.6]

export function TopPage() {
  const navigate = useNavigate()

  return (
    <div style={{ background: 'var(--cream)', minHeight: '100svh' }}>
      {/* ヘッダー */}
      <header
        className="relative overflow-hidden px-5 pt-7 pb-10 text-white"
        style={{ background: '#1C2B40' }}
      >
        {/* 星 */}
        {[{t:12,l:15,s:18},{t:8,l:55,s:10},{t:18,l:78,s:14},{t:5,l:88,s:8}].map((star,i) => (
          <div key={i} className="absolute rounded-full bg-yellow-200 opacity-60"
            style={{ top:`${star.t}%`, left:`${star.l}%`, width:star.s, height:star.s }} />
        ))}

        <div className="relative z-10 text-center">
          <p className="text-xs tracking-[0.25em] text-blue-300 font-bold mb-1 uppercase">DENSHA ASOBI</p>
          <h1 className="font-black text-white leading-none" style={{ fontSize: 'clamp(2rem, 8vw, 2.8rem)', letterSpacing: '-0.02em' }}>
            でんしゃ<br/>あそび
          </h1>
          <p className="text-blue-200 text-sm font-bold mt-2">
            でんしゃのなかで あそぼう！
          </p>
        </div>

        {/* 走る電車 */}
        <div className="mt-4 overflow-hidden h-9 relative">
          <div className="train-ride absolute whitespace-nowrap">
            <span style={{ fontSize: 28 }}>🚃🚃🚃</span>
          </div>
        </div>

        {/* 波型 */}
        <svg viewBox="0 0 400 24" preserveAspectRatio="none" className="absolute bottom-0 left-0 w-full" height="24">
          <path d="M0,12 C80,0 160,24 240,12 S360,0 400,12 L400,24 L0,24 Z" fill="var(--cream)" />
        </svg>
      </header>

      {/* カテゴリ凡例 */}
      <div className="flex justify-center gap-3 flex-wrap px-4 mt-5 mb-1">
        {([
          { cat: 'red',    label: '算数・数字' },
          { cat: 'blue',   label: '言葉・ひらがな' },
          { cat: 'green',  label: '観察・外' },
          { cat: 'purple', label: '記憶・パズル' },
        ] as const).map(({ cat, label }) => (
          <div key={cat} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: CAT[cat].border }} />
            <span className="text-xs font-bold" style={{ color: 'var(--ink-sub)' }}>{label}</span>
          </div>
        ))}
      </div>

      {/* ゲームグリッド */}
      <main className="px-4 pt-3 pb-8 max-w-lg mx-auto">
        <div className="grid grid-cols-3 gap-3">
          {GAMES.map((game, i) => {
            const c = CAT[game.cat]
            const rot = ROTATIONS[i] ?? 0
            return (
              <button
                key={game.path}
                onClick={() => navigate(game.path)}
                className="flex flex-col items-center text-center active:scale-90 transition-transform duration-100"
                style={{
                  background: c.bg,
                  borderRadius: 14,
                  // 上枠線だけ太く — 「ふせん」のような印象
                  borderTop: `5px solid ${c.border}`,
                  boxShadow: `3px 4px 0 rgba(0,0,0,0.08)`,
                  transform: `rotate(${rot}deg)`,
                  padding: '12px 6px 10px',
                  aspectRatio: '1',
                }}
              >
                <span style={{ fontSize: 30, lineHeight: 1 }}>{game.emoji}</span>
                <span
                  className="font-black leading-tight mt-2"
                  style={{
                    fontSize: 11,
                    whiteSpace: 'pre-line',
                    color: c.text,
                    letterSpacing: '-0.01em',
                  }}
                >
                  {game.title}
                </span>
              </button>
            )
          })}
        </div>

        <p className="text-center text-xs font-bold mt-8 mb-2" style={{ color: 'var(--ink-sub)' }}>
          🚃 でんしゃのたびを たのしもう！
        </p>
      </main>
    </div>
  )
}
