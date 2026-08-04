import { useNavigate, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { GameIcon, TrainSide } from '../components/GameIcons'

interface BeforeInstallPromptEvent extends Event { prompt(): Promise<void> }

// ゲームパスとlocalStorageキーの対応
const BEST_KEYS: Record<string, string[]> = {
  '/math':    ['densha_mathsprint_best'],
  '/bigger':  ['densha_bigger_best'],
  '/clock':   ['densha_clock_best'],
  '/color':   ['densha_color_best'],
  '/memory':  ['densha_memory_best'],
  '/simon':   ['densha_simon_best'],
  '/maze':    ['densha_maze_best'],
  '/scramble':['densha_scramble_best_どうぶつ','densha_scramble_best_たべもの','densha_scramble_best_のりもの','densha_scramble_best_みのまわり','densha_scramble_best_むずかしい'],
  '/search':  ['densha_search_cleared'],
  '/dots':    ['densha_dots_cleared'],
  '/bingo':   ['densha_bingo_complete'],
  '/next':    ['densha_next_best'],
  '/riddles': ['densha_riddles_seen'],
}

function hasPlayed(path: string): boolean {
  const keys = BEST_KEYS[path]
  if (!keys) return false
  return keys.some(k => {
    try {
      const v = localStorage.getItem(k)
      if (!v) return false
      const parsed = JSON.parse(v)
      if (typeof parsed === 'number') return parsed > 0
      return Object.values(parsed as Record<string, number>).some(n => n > 0)
    } catch { return false }
  })
}

interface Game { path: string; icon: string; title: string; sub: string; age: string }

const CAT = {
  red:    { border: '#C8352A', bg: '#FFF6F5', text: '#9B1B13' },
  blue:   { border: '#2558C4', bg: '#F0F5FF', text: '#1A3A9B' },
  green:  { border: '#217A4B', bg: '#F0FAF4', text: '#145530' },
  purple: { border: '#6B3FC0', bg: '#F6F0FF', text: '#4A2690' },
} as const

// カテゴリ見出し付きセクション。まどのそと（電車ならでは）を先頭で大きく見せる
const SECTIONS: { label: string; tagline?: string; cat: keyof typeof CAT; featured?: boolean; games: Game[] }[] = [
  {
    label: 'まどのそと', tagline: 'でんしゃならではの あそび', cat: 'green', featured: true,
    games: [
      { path: '/bingo', icon: 'bingo', title: 'でんしゃビンゴ', sub: 'まどのそとで みつけてビンゴ！', age: '4さい〜' },
      { path: '/color', icon: 'color', title: 'いろさがし',     sub: 'おだいの いろを そとでさがそう', age: '4さい〜' },
    ],
  },
  {
    label: 'さんすう', cat: 'red',
    games: [
      { path: '/math',   icon: 'math',   title: 'けいさん',          sub: 'たしざん・ひきざん', age: '5さい〜' },
      { path: '/bigger', icon: 'bigger', title: 'どっちが おおきい？', sub: 'かずのくらべっこ',   age: '6さい〜' },
      { path: '/clock',  icon: 'clock',  title: 'とけいよみ',        sub: 'なんじなんぷん？',   age: '6さい〜' },
      { path: '/maze',   icon: 'maze',   title: 'すうじめいろ',      sub: 'じゅんばんにタップ', age: '5さい〜' },
    ],
  },
  {
    label: 'ことば', cat: 'blue',
    games: [
      { path: '/scramble', icon: 'scramble', title: 'もじならべ',     sub: 'ことばをつくろう',   age: '5さい〜' },
      { path: '/search',   icon: 'search',   title: 'ひらがなさがし', sub: 'かくれたことばは？', age: '6さい〜' },
      { path: '/riddles',  icon: 'riddles',  title: 'なぞなぞ',       sub: 'おやこで かんがえよう', age: '4さい〜' },
    ],
  },
  {
    label: 'きおく・パズル', cat: 'purple',
    games: [
      { path: '/memory', icon: 'memory', title: 'しんけいすいじゃく', sub: 'えあわせ',           age: '4さい〜' },
      { path: '/next',   icon: 'next',   title: 'つぎはどれ？',      sub: 'パターンをさがせ',   age: '5さい〜' },
      { path: '/simon',  icon: 'simon',  title: 'いろきおく',        sub: 'ひかりをおぼえよう', age: '5さい〜' },
      { path: '/dots',   icon: 'dots',   title: 'ドットつなぎ',      sub: 'なにができるかな？', age: '4さい〜' },
    ],
  },
]

export function TopPage() {
  const navigate = useNavigate()
  const [played, setPlayed] = useState<Set<string>>(new Set())
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    const paths = SECTIONS.flatMap(s => s.games.map(g => g.path))
    setPlayed(new Set(paths.filter(p => hasPlayed(p))))
    const handler = (e: Event) => { e.preventDefault(); setInstallPrompt(e as BeforeInstallPromptEvent) }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  return (
    <div style={{ background: 'var(--cream)', minHeight: '100svh' }} className="page-enter">

      {/* ヘッダー */}
      <header className="relative overflow-hidden px-5 pt-7 pb-10 text-white" style={{ background: '#1C2B40' }}>
        {/* 星 */}
        {[{t:10,l:12,s:16},{t:6,l:52,s:9},{t:16,l:76,s:13},{t:4,l:90,s:7}].map((star,i) => (
          <div key={i} className="absolute rounded-full bg-yellow-200 opacity-50"
            style={{ top:`${star.t}%`, left:`${star.l}%`, width:star.s, height:star.s }} />
        ))}
        <div className="relative z-10 text-center">
          <p className="text-xs tracking-[0.3em] text-blue-300 font-bold mb-1 uppercase">Densha Asobi</p>
          <h1 className="font-black text-white leading-none" style={{ fontSize: 'clamp(2.2rem, 9vw, 3rem)', letterSpacing: '-0.02em' }}>
            でんしゃあそび
          </h1>
          <p className="text-blue-200 text-sm font-bold mt-2">でんしゃのなかで あそぼう！</p>
        </div>
        <div className="mt-3 overflow-hidden h-9 relative">
          <div className="train-ride absolute" style={{ color: '#9bb8e6' }}>
            <TrainSide height={28} />
          </div>
        </div>
        <svg viewBox="0 0 400 24" preserveAspectRatio="none" className="absolute bottom-0 left-0 w-full" height="24">
          <path d="M0,12 C80,0 160,24 240,12 S360,0 400,12 L400,24 L0,24 Z" fill="var(--cream)" />
        </svg>
      </header>

      <main className="px-4 pt-4 pb-8 max-w-lg mx-auto">

        {/* PWAインストール誘導バナー */}
        {installPrompt && (
          <div className="flex items-center gap-3 rounded-2xl px-4 py-3 mb-4"
            style={{ background: '#1C2B40', boxShadow: '3px 4px 0 rgba(0,0,0,0.15)' }}>
            <span style={{ color: '#9bb8e6' }}><GameIcon id="bingo" size={28} /></span>
            <div className="flex-1">
              <p className="text-xs font-black text-white leading-tight">ホーム画面に追加しよう！</p>
              <p className="text-[10px] text-blue-300 mt-0.5">オフラインでもあそべるよ</p>
            </div>
            <button
              onClick={async () => { await installPrompt.prompt(); setInstallPrompt(null) }}
              className="text-xs font-black text-white px-3 py-1.5 rounded-lg active:scale-95"
              style={{ background: '#3b82f6' }}>
              追加
            </button>
            <button onClick={() => setInstallPrompt(null)} className="text-blue-300 text-lg leading-none">×</button>
          </div>
        )}

        {/* 親向け情報バー */}
        <div className="flex justify-center gap-3 text-xs font-bold py-2.5 px-4 rounded-xl mb-3"
          style={{ background: 'white', boxShadow: '2px 3px 0 rgba(0,0,0,0.06)', color: 'var(--ink-sub)' }}>
          <span>おとがでない</span>
          <span style={{ color: '#d1d5db' }}>・</span>
          <span>むりょう</span>
          <span style={{ color: '#d1d5db' }}>・</span>
          <span>4〜9さい</span>
        </div>

        {/* でんしゃスタンプラリー（遊んだゲームのスタンプが貯まる台紙） */}
        {(() => {
          const allGames = SECTIONS.flatMap(s => s.games.map(g => ({ ...g, cat: s.cat })))
          const stamped = allGames.filter(g => played.has(g.path)).length
          return (
            <div className="rounded-2xl px-4 py-3 mb-2"
              style={{ background: 'white', boxShadow: '2px 3px 0 rgba(0,0,0,0.06)' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black" style={{ color: 'var(--ink)' }}>でんしゃスタンプラリー</span>
                <span className="text-xs font-bold" style={{ color: stamped === allGames.length ? '#b45309' : 'var(--ink-sub)' }}>
                  {stamped} / {allGames.length}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {allGames.map(g => {
                  const earned = played.has(g.path)
                  return (
                    <button key={g.path} onClick={() => navigate(g.path)}
                      aria-label={earned ? `${g.title}（クリア）` : `${g.title}（まだ）`}
                      className="rounded-full flex items-center justify-center active:scale-90 transition-transform"
                      style={{
                        width: 44, height: 44,
                        background: earned ? CAT[g.cat].border : CAT[g.cat].bg,
                        color: earned ? 'white' : CAT[g.cat].text,
                        opacity: earned ? 1 : 0.55,
                        border: earned ? 'none' : `1.5px dashed ${CAT[g.cat].border}`,
                      }}>
                      <GameIcon id={g.icon} size={22} />
                    </button>
                  )
                })}
              </div>
              {stamped === allGames.length ? (
                <p className="text-xs font-black mt-2" style={{ color: '#b45309' }}>ぜんぶ あつめた！すごい！</p>
              ) : stamped > 0 ? (
                <p className="text-[10px] font-bold mt-2" style={{ color: 'var(--ink-sub)' }}>あそんだ ゲームの スタンプが たまるよ</p>
              ) : (
                <p className="text-[10px] font-bold mt-2" style={{ color: 'var(--ink-sub)' }}>ゲームで あそぶと スタンプが たまるよ</p>
              )}
            </div>
          )
        })()}

        {/* カテゴリ別セクション */}
        {SECTIONS.map(section => {
          const c = CAT[section.cat]
          return (
            <section key={section.label}>
              <div className="flex items-center gap-2 mt-6 mb-2.5">
                <span style={{ width: 18, height: 4, borderRadius: 2, background: c.border, flexShrink: 0 }} />
                <h2 className="text-sm font-black" style={{ color: 'var(--ink)' }}>{section.label}</h2>
                {section.tagline && (
                  <span className="text-[10px] font-bold" style={{ color: 'var(--ink-sub)' }}>{section.tagline}</span>
                )}
              </div>

              {section.featured ? (
                /* まどのそと: 横長カードで大きく */
                <div className="flex flex-col gap-3">
                  {section.games.map(game => (
                    <button
                      key={game.path}
                      onClick={() => navigate(game.path)}
                      className="w-full flex items-stretch overflow-hidden text-left active:scale-[0.97] transition-transform duration-100"
                      style={{ borderRadius: 18, boxShadow: '3px 4px 0 rgba(0,0,0,0.13)', background: c.bg }}
                    >
                      <div className="flex items-center justify-center shrink-0" style={{ width: 76, background: c.border, color: 'white' }}>
                        <GameIcon id={game.icon} size={40} />
                      </div>
                      <div className="flex-1 px-3.5 py-3">
                        <div className="flex items-center gap-1.5">
                          <span className="font-black leading-tight" style={{ fontSize: 15, color: c.text }}>{game.title}</span>
                        </div>
                        <p className="leading-tight mt-1" style={{ fontSize: 10.5, color: c.text + 'aa' }}>{game.sub}</p>
                        <span className="inline-block mt-1.5 px-2 py-0.5 rounded-full font-bold"
                          style={{ fontSize: 9, background: 'white', color: c.text, border: `1px solid ${c.border}33` }}>
                          {game.age}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                /* 通常: 2列グリッド */
                <div className="grid grid-cols-2 gap-3">
                  {section.games.map(game => (
                    <button
                      key={game.path}
                      onClick={() => navigate(game.path)}
                      className="flex flex-col active:scale-90 transition-transform duration-100 overflow-hidden"
                      style={{ borderRadius: 18, boxShadow: '3px 4px 0 rgba(0,0,0,0.13)' }}
                    >
                      <div className="relative flex items-center justify-center py-3.5" style={{ background: c.border, color: 'white' }}>
                        <GameIcon id={game.icon} size={32} />
                      </div>
                      <div className="flex flex-col items-center justify-center text-center px-1.5 py-2.5 flex-1"
                        style={{ background: c.bg, minHeight: 56 }}>
                        <span className="font-black leading-tight" style={{ fontSize: 12.5, color: c.text, letterSpacing: '-0.01em' }}>
                          {game.title}
                        </span>
                        <span className="mt-0.5 leading-tight" style={{ fontSize: 9.5, color: c.text + '99' }}>
                          {game.sub}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </section>
          )
        })}

        <p className="text-center text-xs font-bold mt-8 mb-2" style={{ color: 'var(--ink-sub)' }}>
          でんしゃのたびを たのしもう！
        </p>

        <footer className="mt-6 pt-4 pb-2 text-center" style={{ borderTop: '1px solid #ece5d8' }}>
          <nav className="flex justify-center gap-6 text-xs font-bold">
            <Link to="/about" className="underline" style={{ color: 'var(--ink-sub)' }}>サイトについて</Link>
            <Link to="/privacy" className="underline" style={{ color: 'var(--ink-sub)' }}>プライバシーポリシー</Link>
          </nav>
        </footer>
      </main>
    </div>
  )
}
