import { useEffect } from 'react'
import { Link } from 'react-router-dom'

// about / privacy 共通のレイアウト（保護者・大人向けの読みものページ）
interface InfoPageProps {
  title: string
  lead: string
  children: React.ReactNode
}

export function InfoPage({ title, lead, children }: InfoPageProps) {
  useEffect(() => {
    const prev = document.title
    document.title = `${title} | でんしゃあそび`
    window.scrollTo(0, 0)
    return () => { document.title = prev }
  }, [title])

  return (
    <div className="min-h-svh page-enter" style={{ background: 'var(--cream)' }}>
      <header className="text-white px-5 pt-8 pb-7 text-center" style={{ background: '#1C2B40' }}>
        <h1 className="text-2xl font-black tracking-tight">{title}</h1>
        <p className="text-blue-200 text-sm font-bold mt-2">{lead}</p>
      </header>

      <main className="px-4 py-6 max-w-lg mx-auto">
        <Link to="/" className="inline-block mb-5 text-sm font-bold underline" style={{ color: '#1A3A9B' }}>
          ← ホームに もどる
        </Link>

        {children}

        <footer className="mt-10 pb-4 text-center">
          <Link to="/"
            className="inline-block px-8 py-4 text-base font-black text-white rounded-2xl active:scale-95"
            style={{ background: '#1C2B40', boxShadow: '4px 5px 0 rgba(0,0,0,0.22)' }}>
            ゲームいちらんへ
          </Link>
        </footer>
      </main>
    </div>
  )
}

export function InfoSection({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <section className="mb-6">
      <h2 className="text-base font-black mb-2.5 pl-2.5"
        style={{ color: '#1C2B40', borderLeft: '5px solid #C8352A' }}>
        {heading}
      </h2>
      <div className="bg-white rounded-2xl px-4 py-4 text-sm leading-relaxed flex flex-col gap-2.5"
        style={{ boxShadow: '3px 4px 0 rgba(0,0,0,0.07)', color: 'var(--ink-mid)' }}>
        {children}
      </div>
    </section>
  )
}
