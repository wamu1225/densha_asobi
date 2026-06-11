import { useNavigate, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'

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
  '/scramble':['densha_scramble_best_どうぶつ','densha_scramble_best_たべもの','densha_scramble_best_のりもの','densha_scramble_best_むずかしい'],
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

const GAMES = [
  // 算数・数字 — 赤
  { path: '/math',     emoji: '🔢', title: 'けいさん',      sub: 'たしざん・ひきざん',  cat: 'red',    age: '5さい〜' },
  { path: '/bigger',   emoji: '⚖️', title: 'どっちが おおきい？', sub: 'かずのくらべっこ', cat: 'red',    age: '6さい〜' },
  { path: '/clock',    emoji: '🕐', title: 'とけいよみ',    sub: 'なんじなんぷん？',    cat: 'red',    age: '6さい〜' },
  // 言葉・ひらがな — 青
  { path: '/scramble', emoji: '📝', title: 'もじならべ',    sub: 'ことばをつくろう',    cat: 'blue',   age: '5さい〜' },
  { path: '/search',   emoji: '🔍', title: 'ひらがなさがし', sub: 'かくれたことばは？',  cat: 'blue',   age: '6さい〜' },
  // 観察・外 — 緑
  { path: '/bingo',    emoji: '🚃', title: 'でんしゃビンゴ', sub: 'まどのそとをみよう',  cat: 'green',  age: '4さい〜' },
  { path: '/color',    emoji: '🎨', title: 'いろさがし',    sub: 'そとでみつけよう',    cat: 'green',  age: '4さい〜' },
  // 記憶・パズル — 紫
  { path: '/memory',   emoji: '🃏', title: 'しんけいすいじゃく', sub: 'えあわせ',        cat: 'purple', age: '4さい〜' },
  { path: '/next',     emoji: '🔮', title: 'つぎはどれ？',  sub: 'パターンをさがせ',    cat: 'purple', age: '5さい〜' },
  { path: '/simon',    emoji: '🌈', title: 'いろきおく',    sub: 'ひかりをおぼえよう',  cat: 'purple', age: '5さい〜' },
  // オレンジ
  { path: '/maze',     emoji: '🗺️', title: 'すうじめいろ',  sub: 'じゅんばんにタップ',  cat: 'red',    age: '5さい〜' },
  { path: '/dots',     emoji: '✏️', title: 'ドットつなぎ',  sub: 'なにができるかな？',  cat: 'purple', age: '4さい〜' },
] as const

const CAT = {
  red:    { border: '#C8352A', bg: '#FFF6F5', text: '#9B1B13' },
  blue:   { border: '#2558C4', bg: '#F0F5FF', text: '#1A3A9B' },
  green:  { border: '#217A4B', bg: '#F0FAF4', text: '#145530' },
  purple: { border: '#6B3FC0', bg: '#F6F0FF', text: '#4A2690' },
  orange: { border: '#C8352A', bg: '#FFF6F5', text: '#9B1B13' }, // 赤に統合
}

export function TopPage() {
  const navigate = useNavigate()
  const [played, setPlayed] = useState<Set<string>>(new Set())
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    setPlayed(new Set(GAMES.map(g => g.path).filter(p => hasPlayed(p))))
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
          <div className="train-ride absolute whitespace-nowrap">
            <span style={{ fontSize: 30 }}>🚂🚃🚃🚃🚃</span>
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
            <span style={{ fontSize: 28 }}>🚃</span>
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
        <div className="flex justify-center gap-4 text-xs font-bold py-2.5 px-4 rounded-xl mb-4"
          style={{ background: 'white', boxShadow: '2px 3px 0 rgba(0,0,0,0.06)' }}>
          <span style={{ color: 'var(--ink-sub)' }}>🔇 おとがでない</span>
          <span style={{ color: '#d1d5db' }}>|</span>
          <span style={{ color: 'var(--ink-sub)' }}>💰 むりょう</span>
          <span style={{ color: '#d1d5db' }}>|</span>
          <span style={{ color: 'var(--ink-sub)' }}>👶 4〜9さい</span>
        </div>

        {/* ゲームグリッド — 2列（タップ面積確保） */}
        <div className="grid grid-cols-2 gap-4">
          {GAMES.map((game) => {
            const c = CAT[game.cat]
            return (
              <button
                key={game.path}
                onClick={() => navigate(game.path)}
                className="flex flex-col active:scale-90 transition-transform duration-100 overflow-hidden"
                style={{
                  borderRadius: 18,
                  boxShadow: '3px 4px 0 rgba(0,0,0,0.13)',
                }}
              >
                {/* カラーアイコンエリア */}
                <div className="relative flex items-center justify-center py-4"
                  style={{ background: c.border }}>
                  <span style={{ fontSize: 36, lineHeight: 1, filter: 'drop-shadow(0 2px 5px rgba(0,0,0,0.3))' }}>
                    {game.emoji}
                  </span>
                  {played.has(game.path) && (
                    <span className="absolute top-1 right-1.5 text-xs font-black text-white"
                      style={{ textShadow: '0 1px 3px rgba(0,0,0,0.4)', fontSize: 11 }}>★</span>
                  )}
                </div>
                {/* テキストエリア */}
                <div className="flex flex-col items-center justify-center text-center px-1.5 py-2.5"
                  style={{ background: c.bg, minHeight: 58 }}>
                  <span className="font-black leading-tight"
                    style={{ fontSize: 12, color: c.text, letterSpacing: '-0.01em' }}>
                    {game.title}
                  </span>
                  <span className="mt-0.5 leading-tight"
                    style={{ fontSize: 9, color: c.text + '99' }}>
                    {game.sub}
                  </span>
                </div>
              </button>
            )
          })}
        </div>

        <p className="text-center text-xs font-bold mt-8 mb-2" style={{ color: 'var(--ink-sub)' }}>
          🚃 でんしゃのたびを たのしもう！
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
