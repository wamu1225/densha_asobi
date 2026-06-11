// 各ゲームの識別アイコン（単色線画・currentColor）。絵文字UIからの脱却用
interface GameIconProps {
  id: string
  size?: number
}

export function GameIcon({ id, size = 32 }: GameIconProps) {
  const p = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  }

  switch (id) {
    case 'math': // ＋と−
      return (
        <svg {...p}>
          <path d="M5.4 8.2h6.6" />
          <path d="M8.7 4.9v6.6" />
          <path d="M12.2 16.8h6.8" />
        </svg>
      )
    case 'bigger': // 大小2つの丸
      return (
        <svg {...p}>
          <circle cx="6.6" cy="15" r="3.1" />
          <circle cx="15.9" cy="11.6" r="5.9" />
        </svg>
      )
    case 'clock': // 時計
      return (
        <svg {...p}>
          <circle cx="12" cy="12" r="8.4" />
          <path d="M12 7.3V12l3.3 2" />
        </svg>
      )
    case 'maze': // グリッド＋ステップ経路
      return (
        <svg {...p}>
          <rect x="3.8" y="3.8" width="16.4" height="16.4" rx="2.4" />
          <g strokeWidth="1" opacity="0.55">
            <path d="M9.3 3.8v16.4" />
            <path d="M14.7 3.8v16.4" />
            <path d="M3.8 9.3h16.4" />
            <path d="M3.8 14.7h16.4" />
          </g>
          <path d="M6.5 6.5h5.5v5.5h5.5v5.5" strokeWidth="2.3" />
        </svg>
      )
    case 'scramble': // 文字タイル3枚（中央が浮く）
      return (
        <svg {...p}>
          <rect x="3.2" y="13.4" width="6.2" height="6.2" rx="1.4" />
          <rect x="14.6" y="13.4" width="6.2" height="6.2" rx="1.4" />
          <rect x="8.9" y="4.2" width="6.2" height="6.2" rx="1.4" transform="rotate(14 12 7.3)" />
        </svg>
      )
    case 'search': // 虫めがね
      return (
        <svg {...p}>
          <circle cx="10.5" cy="10.5" r="5.7" />
          <path d="M14.9 14.9l4.7 4.7" />
        </svg>
      )
    case 'bingo': // 電車（正面）
      return (
        <svg {...p}>
          <rect x="5" y="3.6" width="14" height="14.6" rx="3" />
          <rect x="8" y="6.6" width="8" height="4.6" rx="1" />
          <circle cx="9" cy="14.9" r="1.1" fill="currentColor" stroke="none" />
          <circle cx="15" cy="14.9" r="1.1" fill="currentColor" stroke="none" />
          <path d="M7.6 18.2L6 21" />
          <path d="M16.4 18.2L18 21" />
        </svg>
      )
    case 'color': // 目
      return (
        <svg {...p}>
          <path d="M2.8 12c2.6-4.4 5.9-6.4 9.2-6.4s6.6 2 9.2 6.4c-2.6 4.4-5.9 6.4-9.2 6.4s-6.6-2-9.2-6.4z" />
          <circle cx="12" cy="12" r="2.7" />
        </svg>
      )
    case 'memory': // カード2枚
      return (
        <svg {...p}>
          <rect x="3.6" y="5.4" width="8.6" height="11.6" rx="1.6" transform="rotate(-9 7.9 11.2)" />
          <rect x="11.7" y="6.9" width="8.6" height="11.6" rx="1.6" transform="rotate(9 16 12.7)" />
          <circle cx="16" cy="12.7" r="1.6" />
        </svg>
      )
    case 'next': // ●●◌（つぎは？）
      return (
        <svg {...p}>
          <circle cx="4.9" cy="12" r="2.1" fill="currentColor" stroke="none" />
          <circle cx="11.3" cy="12" r="2.1" fill="currentColor" stroke="none" />
          <circle cx="18.5" cy="12" r="2.7" strokeDasharray="2.4 2.2" />
        </svg>
      )
    case 'simon': // 4分割パッド
      return (
        <svg {...p}>
          <circle cx="12" cy="12" r="8.6" />
          <path d="M12 3.4v17.2" />
          <path d="M3.4 12h17.2" />
        </svg>
      )
    case 'riddles': // ふきだし＋はてな
      return (
        <svg {...p}>
          <path d="M4 5.5h16v11.5h-9l-4.2 3.4v-3.4H4z" strokeLinejoin="round" />
          <path d="M9.8 9.2a2.6 2.6 0 0 1 4.9 1.1c0 1.7-2.4 1.8-2.4 3.2" />
          <circle cx="12.3" cy="15.6" r="0.4" fill="currentColor" stroke="none" />
        </svg>
      )
    case 'dots': // 点つなぎ（山型）
      return (
        <svg {...p}>
          <path d="M5 17.2L12 5.8l7 11.4" />
          <path d="M5 17.2h14" strokeDasharray="2.4 2.4" opacity="0.6" />
          <circle cx="5" cy="17.2" r="1.9" fill="currentColor" stroke="none" />
          <circle cx="12" cy="5.8" r="1.9" fill="currentColor" stroke="none" />
          <circle cx="19" cy="17.2" r="1.9" fill="currentColor" stroke="none" />
        </svg>
      )
    default:
      return null
  }
}

// ヘッダー走行アニメ用の横向き列車シルエット
export function TrainSide({ height = 26, windowFill = '#1C2B40' }: { height?: number; windowFill?: string }) {
  const width = (height / 26) * 104
  return (
    <svg width={width} height={height} viewBox="0 0 104 26" fill="currentColor">
      {/* 機関車 */}
      <rect x="0" y="7" width="30" height="13" rx="3" />
      <rect x="19" y="2.5" width="11" height="8" rx="2" />
      <rect x="4.5" y="2" width="4.5" height="6.5" rx="1.2" />
      <rect x="21.5" y="5" width="6" height="4" rx="1" fill={windowFill} />
      {/* 客車1 */}
      <rect x="34" y="8" width="30" height="12" rx="2.5" />
      <rect x="37.5" y="10.5" width="6.5" height="4.5" rx="1" fill={windowFill} />
      <rect x="47" y="10.5" width="6.5" height="4.5" rx="1" fill={windowFill} />
      <rect x="30" y="12.5" width="4" height="2.5" />
      {/* 客車2 */}
      <rect x="68" y="8" width="30" height="12" rx="2.5" />
      <rect x="71.5" y="10.5" width="6.5" height="4.5" rx="1" fill={windowFill} />
      <rect x="81" y="10.5" width="6.5" height="4.5" rx="1" fill={windowFill} />
      <rect x="64" y="12.5" width="4" height="2.5" />
      {/* 車輪 */}
      {[6, 15, 24, 40, 56, 74, 90].map(x => <circle key={x} cx={x} cy="22" r="2.4" />)}
    </svg>
  )
}
