// OGP画像 (1200x630) をSVGで生成 → public/ogp.svg
// ※SNSはog:imageのSVG非対応が多いため、SVG更新後は public/ogp.png も再レンダリングすること（Playwrightで1200x630スクショ）
import { writeFileSync } from 'node:fs'

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#1C2B40"/>
      <stop offset="100%" stop-color="#0f1e30"/>
    </linearGradient>
    <linearGradient id="rail" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0"/>
      <stop offset="30%" stop-color="#ffffff" stop-opacity="0.3"/>
      <stop offset="70%" stop-color="#ffffff" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
  </defs>

  <!-- 背景 -->
  <rect width="1200" height="630" fill="url(#bg)"/>

  <!-- レール -->
  <rect x="0" y="540" width="1200" height="6" fill="url(#rail)"/>
  <rect x="0" y="560" width="1200" height="6" fill="url(#rail)"/>
  <!-- まくら木 -->
  ${Array.from({length: 13}, (_, i) => `<rect x="${60 + i * 90}" y="530" width="20" height="46" rx="3" fill="white" opacity="0.12"/>`).join('\n  ')}

  <!-- 電車シルエット -->
  <g transform="translate(680, 300)">
    <!-- 車体 -->
    <rect x="-220" y="-120" width="440" height="220" rx="28" fill="#2d4a6b"/>
    <rect x="-220" y="-120" width="440" height="220" rx="28" fill="none" stroke="#4a7ab5" stroke-width="3"/>
    <!-- 屋根のライン -->
    <rect x="-215" y="-115" width="430" height="8" rx="4" fill="#3a5f8a"/>
    <!-- 窓 -->
    <rect x="-185" y="-80" width="120" height="80" rx="10" fill="#1C2B40" stroke="#6b9fd4" stroke-width="2"/>
    <rect x="-35" y="-80" width="120" height="80" rx="10" fill="#1C2B40" stroke="#6b9fd4" stroke-width="2"/>
    <rect x="115" y="-80" width="90" height="80" rx="10" fill="#1C2B40" stroke="#6b9fd4" stroke-width="2"/>
    <!-- ドア -->
    <rect x="-10" y="-60" width="20" height="160" fill="#263d57" stroke="#4a7ab5" stroke-width="1"/>
    <!-- 車輪 -->
    <circle cx="-140" cy="105" r="36" fill="#1a2f45" stroke="#4a7ab5" stroke-width="3"/>
    <circle cx="-140" cy="105" r="18" fill="#2d4a6b"/>
    <circle cx="140" cy="105" r="36" fill="#1a2f45" stroke="#4a7ab5" stroke-width="3"/>
    <circle cx="140" cy="105" r="18" fill="#2d4a6b"/>
    <!-- ライト -->
    <ellipse cx="215" cy="-55" rx="14" ry="10" fill="#fef08a" opacity="0.9"/>
    <ellipse cx="215" cy="-55" rx="8" ry="6" fill="white"/>
  </g>

  <!-- メインタイトル -->
  <text x="100" y="220" font-family="'Helvetica Neue', Arial, sans-serif"
    font-size="108" font-weight="900" fill="white" letter-spacing="-2">
    でんしゃ
  </text>
  <text x="100" y="340" font-family="'Helvetica Neue', Arial, sans-serif"
    font-size="108" font-weight="900" fill="#60a5fa" letter-spacing="-2">
    あそび
  </text>

  <!-- サブテキスト -->
  <text x="100" y="400" font-family="'Helvetica Neue', Arial, sans-serif"
    font-size="36" fill="white" opacity="0.7">
    電車でこどもが楽しめる 13このゲーム
  </text>

  <!-- バッジ -->
  <rect x="100" y="430" width="230" height="52" rx="26" fill="#3b82f6"/>
  <text x="215" y="463" font-family="'Helvetica Neue', Arial, sans-serif"
    font-size="26" font-weight="700" fill="white" text-anchor="middle">
    🔇 おとなし
  </text>
  <rect x="350" y="430" width="220" height="52" rx="26" fill="#22c55e"/>
  <text x="460" y="463" font-family="'Helvetica Neue', Arial, sans-serif"
    font-size="26" font-weight="700" fill="white" text-anchor="middle">
    💰 むりょう
  </text>
  <rect x="590" y="430" width="200" height="52" rx="26" fill="#f97316"/>
  <text x="690" y="463" font-family="'Helvetica Neue', Arial, sans-serif"
    font-size="26" font-weight="700" fill="white" text-anchor="middle">
    👶 4〜9さい
  </text>

  <!-- URL -->
  <text x="600" y="600" font-family="'Helvetica Neue', Arial, sans-serif"
    font-size="28" fill="white" opacity="0.45" text-anchor="middle">
    study-apps.com/densha_asobi
  </text>
</svg>`

writeFileSync('./public/ogp.svg', svg)
console.log('✓ public/ogp.svg を生成しました')
