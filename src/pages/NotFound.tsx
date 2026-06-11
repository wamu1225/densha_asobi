import { useEffect } from 'react'
import { Link } from 'react-router-dom'

export function NotFound() {
  useEffect(() => {
    const prev = document.title
    document.title = 'ページが みつかりません | でんしゃあそび'
    return () => { document.title = prev }
  }, [])

  return (
    <div className="min-h-svh flex flex-col items-center justify-center gap-6 px-6 text-center page-enter"
      style={{ background: 'var(--cream)' }}>
      <p className="text-6xl font-black" style={{ color: '#1C2B40' }}>404</p>
      <div>
        <p className="text-xl font-black" style={{ color: 'var(--ink)' }}>ページが みつかりません</p>
        <p className="text-sm font-bold mt-2" style={{ color: 'var(--ink-sub)' }}>
          おさがしの ページは ないか、ひっこし した みたいです
        </p>
      </div>
      <Link to="/"
        className="px-8 py-4 text-base font-black text-white rounded-2xl active:scale-95"
        style={{ background: '#1C2B40', boxShadow: '4px 5px 0 rgba(0,0,0,0.22)' }}>
        ゲームいちらんへ
      </Link>
    </div>
  )
}
