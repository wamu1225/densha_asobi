// ゲームごとに最適化されたHTMLを生成し、静的フォールバックを注入する
// ビルド後に実行: node scripts/generate-game-pages.js
//
// 役割:
//  1. dist/index.html の <div id="root"></div> に静的フォールバックHTMLを注入
//     (AdSenseクローラー対策。JSが読み込まれたらReactが上書きする)
//  2. 各ゲームページ (dist/<game>/index.html) を生成し、固有の meta タグと
//     ゲーム説明の静的フォールバックを注入
//  3. dist/about/ と dist/privacy/ の独立ページを生成
//  4. public/sitemap.xml の lastmod を更新
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const distDir = join(__dirname, '../dist')

const BASE_URL = 'https://study-apps.com/densha_asobi'
const TODAY = new Date().toISOString().slice(0, 10)

// ===========================================================
// ゲーム定義（meta + 静的フォールバック）
// ===========================================================
const GAMES = [
  {
    path: 'math',
    emoji: '🔢',
    title: 'けいさんスプリント | でんしゃあそび',
    name: 'けいさんスプリント',
    desc: 'たしざん・ひきざんを30秒で何問解けるかチャレンジ！1けた・2けた・かけざんの3レベル。5れんぞくでボーナス！幼稚園・小学生向け電車ゲーム。',
    keywords: '足し算ゲーム 引き算 かけ算 小学生 幼稚園 算数 電車 暇つぶし',
    age: '5さい〜9さい',
    aim: 'たしざん・ひきざん・かけざんを30びょうで なんもん とけるか チャレンジするゲームです。',
    howto: 'スタートをおすと もんだいが でてきます。こたえのボタンをタップしてね。5れんぞくで せいかいすると ボーナスポイントが もらえるよ。1けた・2けた・かけざんの 3レベルから えらべます。',
    effect: 'けいさんの しゅんはつりょく・あんざんりょくを そだてます。タイムプレッシャーの なかで しゅうちゅうする ちからも つきます。',
  },
  {
    path: 'bigger',
    emoji: '⚖️',
    title: 'どっちがおおきい？ | でんしゃあそび',
    name: 'どっちがおおきい？',
    desc: '2けた〜4けたの数の大小をすばやく判断！連続正解でコンボボーナス。タイムアタックモードも。電車で遊べる数字ゲーム。',
    keywords: '数の大小 比較 2桁 3桁 数学 電車 子供 ゲーム',
    age: '6さい〜9さい',
    aim: 'ふたつの かずを みて どちらが おおきいかを すばやく こたえる ゲームです。',
    howto: '2つの かずが でてきたら、おおきいほうを タップしてね。れんぞくで せいかいすると コンボが つみあがって たかいスコアが もらえます。2けた・3けた・4けたから えらべます。タイムアタックで すうじを みる ちからを きたえよう。',
    effect: 'かずの けたを みくらべる ちからを そだてます。すうじを みる はやさが あがります。',
  },
  {
    path: 'clock',
    emoji: '🕐',
    title: 'とけいをよもう | でんしゃあそび',
    name: 'とけいをよもう',
    desc: 'アナログ時計を読む練習ゲーム！かんたん〜むずかしいの3段階。後半から難易度アップ。小学1〜2年生の時計の勉強に。',
    keywords: '時計 読み方 アナログ時計 小学生 算数 練習 電車 学習',
    age: '6さい〜9さい',
    aim: 'アナログとけいの じこくを よむ れんしゅうゲームです。',
    howto: 'がめんに アナログとけいが ひょうじされます。なんじ なんぷんかを えらんで タップしてね。かんたん（00ふん・30ぷん）から むずかしい（5ふんきざみ・1ぷんきざみ）まで 3だんかいで すすみます。',
    effect: 'とけいを よむ ちからを そだてます。小がっこう1ねん〜2ねんの さんすうで まなぶ「じこくと じかん」の りかいに やくだちます。',
  },
  {
    path: 'bingo',
    emoji: '🚃',
    title: 'でんしゃビンゴ | でんしゃあそび',
    name: 'でんしゃビンゴ',
    desc: '電車の窓から見えるものでビンゴ！まち・しぜん・のりもの・たべもの の4テーマ。3×3と4×4が選べる。電車旅行の暇つぶしに最適！',
    keywords: 'でんしゃ ビンゴ 電車 窓 観察 ゲーム 子供 暇つぶし 旅行',
    age: '4さい〜9さい',
    aim: 'でんしゃの まどから みえる ものを みつけて ビンゴカードを そろえる ゲームです。',
    howto: 'まち・しぜん・のりもの・たべもの の 4つの テーマから えらべます。カードに かいてある ものを じっさいに そとで みつけたら、その マスを タップ。たて・よこ・ななめが そろったら ビンゴ！3×3か 4×4の おおきさを えらべます。',
    effect: 'まわりを よく みる かんさつりょくを そだてます。でんしゃの たびや おでかけが もっと たのしくなります。',
  },
  {
    path: 'color',
    emoji: '🎨',
    title: 'いろさがしチャレンジ | でんしゃあそび',
    name: 'いろさがしチャレンジ',
    desc: '窓の外で指定の色や形を見つけてタップ！60秒・90秒チャレンジ。ストリークボーナスで盛り上がる。電車で遊べる観察ゲーム。',
    keywords: '色探し 形探し 観察 電車 子供 ゲーム 暇つぶし 幼稚園',
    age: '4さい〜9さい',
    aim: 'していされた いろや かたちを そとで みつけて タップする かんさつゲームです。',
    howto: '「あかい もの」「まるい もの」など おだいが でます。まどの そとで みつけたら タップしてね。60びょう・90びょうの タイムチャレンジで、れんぞくで みつけると ストリークボーナスが もらえます。',
    effect: 'いろや かたちを みわける ちからを そだてます。まわりを じっくり みる しゅうかんが つきます。',
  },
  {
    path: 'memory',
    emoji: '🃏',
    title: 'しんけいすいじゃく | でんしゃあそび',
    name: 'しんけいすいじゃく',
    desc: 'どうぶつ・たべもの・のりものの絵あわせ神経衰弱。2×3の超かんたんから4×5の難しいまで4段階。何手でクリアできる？',
    keywords: '神経衰弱 記憶 絵合わせ カード 幼稚園 小学生 電車 ゲーム',
    age: '4さい〜9さい',
    aim: 'うらがえしの カードを 2まいずつ めくって、おなじ えを そろえる きおくゲームです。',
    howto: 'カードを 2まい タップして めくります。おなじ えが でたら そのまま、ちがったら うらがえしに もどります。ぜんぶの ペアを そろえたら クリア！2×3（6まい）から 4×5（20まい）まで 4だんかいの むずかしさが あります。',
    effect: 'たんき きおくと しゅうちゅうりょくを そだてます。「ここに あった」を おぼえる ちからが つきます。',
  },
  {
    path: 'next',
    emoji: '🔮',
    title: 'つぎはどれ？ | でんしゃあそび',
    name: 'つぎはどれ？',
    desc: '色・形・動物・数字のパターンを見て次を当てよう！2〜4要素のくりかえしや数列問題。かんたん〜むずかしいの2段階。',
    keywords: 'パターン 数列 規則 推理 幼稚園 小学生 頭の体操 電車 ゲーム',
    age: '5さい〜9さい',
    aim: 'ならんだ パターンを みて、つぎに くる ものを よそうする ゲームです。',
    howto: 'いろ・かたち・どうぶつ・すうじの ならびが でてきます。「？」の ところに はいるのは どれかな？せんたくしから タップして こたえてね。2〜4ようその くりかえしや、すうれつもんだいが でます。',
    effect: 'きそく（パターン）を みつける ちから、ろんりてきに かんがえる ちからを そだてます。',
  },
  {
    path: 'maze',
    emoji: '🗺️',
    title: 'すうじめいろ | でんしゃあそび',
    name: 'すうじめいろ',
    desc: '1から順番にタップするだけ！4×4と5×5、数字が消えるモードも。タイムを縮めよう。集中力・注意力を鍛える電車ゲーム。',
    keywords: '数字 迷路 順番 集中力 小学生 電車 ゲーム 数 記憶',
    age: '5さい〜9さい',
    aim: 'バラバラに ならんだ すうじを 1から じゅんばんに タップする ゲームです。',
    howto: '4×4 または 5×5の マスに すうじが ランダムに ならびます。1→2→3…と じゅんに タップしてね。すうじが きえる モードも あります。タイムを ちぢめて じこベストを めざそう！',
    effect: 'しゅうちゅうりょく・ちゅういりょくを そだてます。すうじを すばやく さがす しかくにんちりょくが つきます。',
  },
  {
    path: 'scramble',
    emoji: '📝',
    title: 'もじならべ | でんしゃあそび',
    name: 'もじならべ',
    desc: 'バラバラのひらがなを並び替えて言葉を作ろう。どうぶつ・たべもの・のりもの・むずかしいの4カテゴリ。タイムアタックで何問解ける？',
    keywords: 'ひらがな 並び替え 言葉 アナグラム 小学生 国語 電車 ゲーム',
    age: '5さい〜9さい',
    aim: 'バラバラに なった ひらがなを ならびかえて ことばを つくる ゲームです。',
    howto: 'えと バラバラの もじが でてきます。もじを タップして ただしい じゅんばんに ならべてね。どうぶつ・たべもの・のりもの・むずかしい の 4つの カテゴリから えらべます。タイムアタックで なんもん とけるか チャレンジしよう。',
    effect: 'ことばの ちしき・ごいりょくを そだてます。ひらがなと ことばの けっかを むすびつける こくごの ちからが つきます。',
  },
  {
    path: 'search',
    emoji: '🔍',
    title: 'ひらがなさがし | でんしゃあそび',
    name: 'ひらがなさがし',
    desc: '6×6のひらがなグリッドから隠れた言葉を探そう！どうぶつ・くだもの・のりもの の6パズル。ワードサーチゲーム。',
    keywords: 'ひらがな 言葉探し ワードサーチ 国語 小学生 幼稚園 電車 ゲーム',
    age: '6さい〜9さい',
    aim: '6×6の ひらがなの ますから、かくれた ことばを みつけだす ワードサーチゲームです。',
    howto: 'した（または よこ）に かかれた ことばを、ますの なかから さがします。みつけたら ゆびで なぞって せんを ひいてね。どうぶつ・くだもの・のりもの の 6パズルが あります。',
    effect: 'ひらがなを よむ ちから、ことばを みつける しゅうちゅうりょくを そだてます。',
  },
  {
    path: 'dots',
    emoji: '✏️',
    title: 'ドットつなぎ | でんしゃあそび',
    name: 'ドットつなぎ',
    desc: '番号順に点をつないで絵を完成させよう！3点のさんかくから14点のとりまで難易度順に10パターン。',
    keywords: '点つなぎ ドット 絵 完成 幼稚園 小学生 電車 ゲーム パズル',
    age: '4さい〜9さい',
    aim: 'すうじが ふられた てんを 1から じゅんに つないで えを かんせいさせる ゲームです。',
    howto: '1の てんから タップを はじめて、2・3・4…と じゅんばんに つないでね。3てんの さんかくから 14てんの とりまで、むずかしさが だんだん あがる 10パターンが あります。なにが できるかは、つないでみての おたのしみ！',
    effect: 'すうじの じゅんばんを おぼえる ちからと、ずけいを みる ちからを そだてます。',
  },
  {
    path: 'simon',
    emoji: '🌈',
    title: 'いろきおく | でんしゃあそび',
    name: 'いろきおく',
    desc: '光るパネルの順番を覚えてタップ！ラウンドが進むほどスピードアップ。赤・青・黄・緑の4色。ベストラウンドを目指せ！',
    keywords: 'シモン 色記憶 記憶ゲーム 光 パネル 幼稚園 小学生 電車 ゲーム',
    age: '5さい〜9さい',
    aim: 'ひかる パネルの じゅんばんを おぼえて、おなじ じゅんで タップする きおくゲームです。',
    howto: 'あか・あお・きいろ・みどりの 4つの パネルが じゅんばんに ひかります。ひかった じゅんに タップして！ラウンドが すすむと スピードが はやくなり、ながさも ふえていきます。ベストラウンドを めざそう。',
    effect: 'たんき きおく（じゅんばんを おぼえる ちから）と、しゅうちゅうりょくを そだてます。',
  },
]

// ===========================================================
// 共通スタイル（インライン）
// ===========================================================
const FALLBACK_STYLE = `
<style>
  .static-fallback{font-family:'M PLUS Rounded 1c','Hiragino Maru Gothic Pro',sans-serif;color:#1a1a1a;background:#FFF7E6;min-height:100vh;line-height:1.7;}
  .static-fallback *{box-sizing:border-box;}
  .static-fallback a{color:#1A3A9B;text-decoration:underline;}
  .static-fallback header.hero{background:#1C2B40;color:#fff;padding:32px 20px;text-align:center;}
  .static-fallback header.hero .eyebrow{font-size:11px;letter-spacing:.3em;color:#9bb8e6;font-weight:700;margin:0 0 6px;text-transform:uppercase;}
  .static-fallback header.hero h1{font-size:clamp(2rem,8vw,2.6rem);font-weight:900;margin:0 0 8px;letter-spacing:-.02em;}
  .static-fallback header.hero .lead{color:#bcd2f0;font-size:14px;font-weight:700;margin:0;}
  .static-fallback header.hero .train{margin-top:8px;font-size:28px;}
  .static-fallback main.wrap{max-width:720px;margin:0 auto;padding:24px 18px 48px;}
  .static-fallback .intro{background:#fff;border-radius:18px;padding:20px;box-shadow:3px 4px 0 rgba(0,0,0,.06);margin-bottom:24px;}
  .static-fallback .intro h2{font-size:18px;font-weight:900;margin:0 0 10px;color:#1C2B40;}
  .static-fallback .intro p{margin:0 0 10px;font-size:14px;}
  .static-fallback .intro ul{margin:8px 0 0;padding-left:20px;font-size:14px;}
  .static-fallback .intro li{margin:4px 0;}
  .static-fallback h2.section{font-size:18px;font-weight:900;margin:28px 0 12px;color:#1C2B40;border-left:6px solid #C8352A;padding-left:10px;}
  .static-fallback .game-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin-bottom:16px;}
  .static-fallback .game-card{display:block;background:#fff;border-radius:14px;padding:14px 12px;text-decoration:none;color:#1a1a1a;box-shadow:2px 3px 0 rgba(0,0,0,.08);border:2px solid #f3e8c8;}
  .static-fallback .game-card .emoji{font-size:30px;display:block;text-align:center;margin-bottom:6px;}
  .static-fallback .game-card .gname{font-size:13px;font-weight:900;text-align:center;color:#1C2B40;margin:0 0 4px;letter-spacing:-.01em;}
  .static-fallback .game-card .gsub{font-size:10.5px;color:#6b6b6b;text-align:center;display:block;margin:0 0 4px;}
  .static-fallback .game-card .gage{font-size:10px;color:#9b1b13;text-align:center;display:block;font-weight:700;}
  .static-fallback .feature-list{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px;margin:0 0 16px;padding:0;list-style:none;}
  .static-fallback .feature-list li{background:#fff;border-radius:12px;padding:12px 14px;font-size:13px;box-shadow:2px 2px 0 rgba(0,0,0,.05);}
  .static-fallback .feature-list strong{display:block;font-size:14px;color:#9b1b13;margin-bottom:4px;font-weight:900;}
  .static-fallback .howto-box{background:#fff;border-radius:14px;padding:16px 18px;margin:0 0 18px;box-shadow:2px 3px 0 rgba(0,0,0,.06);}
  .static-fallback .howto-box h3{margin:0 0 8px;font-size:15px;font-weight:900;color:#1C2B40;}
  .static-fallback .howto-box p{margin:0 0 8px;font-size:13.5px;}
  .static-fallback .howto-box p:last-child{margin-bottom:0;}
  .static-fallback footer.fnav{margin-top:32px;padding:18px;background:#1C2B40;color:#bcd2f0;text-align:center;font-size:12px;border-radius:14px;}
  .static-fallback footer.fnav a{color:#fff;margin:0 8px;text-decoration:underline;}
  .static-fallback .back-link{display:inline-block;margin:0 0 14px;font-size:13px;color:#1A3A9B;text-decoration:underline;font-weight:700;}
  .static-fallback .meta-line{font-size:12px;color:#6b6b6b;margin:0 0 10px;}
  .static-fallback .age-badge{display:inline-block;background:#9b1b13;color:#fff;padding:3px 10px;border-radius:999px;font-size:11px;font-weight:700;margin-left:6px;}
  @media (max-width:380px){.static-fallback .game-grid{grid-template-columns:1fr 1fr;gap:8px;}.static-fallback .game-card{padding:10px 8px;}.static-fallback .game-card .gname{font-size:12px;}}
</style>
`.trim()

// ===========================================================
// ホームページ用 静的フォールバック
// ===========================================================
function buildHomeFallback() {
  const cards = GAMES.map(g => `
        <a class="game-card" href="${BASE_URL}/${g.path}/">
          <span class="emoji" aria-hidden="true">${g.emoji}</span>
          <span class="gname">${g.name}</span>
          <span class="gsub">${escapeHtml(g.desc.split('！')[0])}</span>
          <span class="gage">${g.age}</span>
        </a>`).join('')

  return `
${FALLBACK_STYLE}
<div class="static-fallback">
  <div style="background:#eff6ff;border-bottom:1px solid #bfdbfe;padding:10px 16px;font-size:13px;text-align:center"><a href="https://study-apps.com/" style="color:#1e3a8a;text-decoration:none;font-weight:600">← study-apps.com 学習サイト集トップへ</a></div>
  <header class="hero">
    <p class="eyebrow">Densha Asobi</p>
    <h1>でんしゃあそび</h1>
    <p class="lead">でんしゃのなかで あそぼう！</p>
    <div class="train" aria-hidden="true">🚂🚃🚃🚃🚃</div>
  </header>
  <main class="wrap">
    <section class="intro">
      <h2>このサイトについて</h2>
      <p>「でんしゃあそび」は、でんしゃや くるまの なかで こどもが あそべる ミニゲームを 12しゅるい あつめた サイトです。たいしょうは ようちえん〜小がっこう3年生（4〜9さい）。すべての ゲームは ブラウザだけで うごき、アプリの ダウンロードや かいいんとうろくは いりません。</p>
      <ul>
        <li><strong>むりょう</strong>で あそべます（こうにゅう・サブスクなし）</li>
        <li><strong>とうろく ふよう</strong>。アカウントは つくりません</li>
        <li><strong>オフライン たいおう</strong>（PWA）。いちど ひらけば でんぱが なくても あそべます</li>
        <li><strong>おとが でません</strong>。でんしゃの なかでも あんしんして つかえます</li>
      </ul>
    </section>

    <h2 class="section">🎮 ゲーム いちらん（12しゅるい）</h2>
    <p class="meta-line">タップして あそびたい ゲームを えらんでね。</p>
    <div class="game-grid">${cards}
    </div>

    <h2 class="section">📚 こうかと そだつ ちから</h2>
    <ul class="feature-list">
      <li><strong>さんすうの ちから</strong>けいさん・かずの くらべっこ・とけいよみで、けいさんりょくと すうじへの りかいを そだてます。</li>
      <li><strong>こくごの ちから</strong>もじならべ・ひらがなさがしで、ひらがなを よむ ちからと ごいりょくを そだてます。</li>
      <li><strong>かんさつりょく</strong>でんしゃビンゴ・いろさがしで、まわりを よく みる しゅうかんを そだてます。</li>
      <li><strong>きおくりょく・しゅうちゅうりょく</strong>しんけいすいじゃく・いろきおく・すうじめいろで、たんききおくと あつかうちからを きたえます。</li>
      <li><strong>ろんりてき しこう</strong>つぎはどれ？・ドットつなぎで、きそくを みつけ じゅんじょを おう ちからを そだてます。</li>
    </ul>

    <h2 class="section">📱 つかいかたガイド</h2>
    <div class="howto-box">
      <h3>あそびかた</h3>
      <p>うえの ゲーム いちらんから あそびたい ものを タップ。ルールは とても かんたんで、よみがな（ひらがな）だけで かかれて います。ちいさい おこさまでも おとなと いっしょに あそべます。</p>
      <h3>ホームがめんに ついか（おすすめ）</h3>
      <p>ブラウザの メニューから「ホームがめんに ついか」を えらぶと、アプリのように つかえます。でんぱが ない ばしょ（ちかてつ・しんかんせんの トンネル など）でも あそべるので、おでかけ まえに いちど ひらいて おくと あんしんです。</p>
      <h3>ほごしゃの かたへ</h3>
      <p>すべての ゲームは おとが でない 設計で、こうかは バイブレーションのみです。広告は さいしょうげんに とどめ、こどもが あやまって タップしないよう くふうしています。じょうほうの 収集は おこなって おらず、ベストスコアは おこさまの たんまつの localStorage のみに 保存されます。</p>
    </div>

    <footer class="fnav">
      <p>🚃 でんしゃの たびを たのしもう！</p>
      <p style="margin-top:8px;">
        <a href="${BASE_URL}/about/">サイトについて</a>
        <a href="${BASE_URL}/privacy/">プライバシーポリシー</a>
      </p>
    </footer>
  </main>
</div>
`.trim()
}

// ===========================================================
// 各ゲーム用 静的フォールバック
// ===========================================================
function buildGameFallback(game) {
  return `
${FALLBACK_STYLE}
<div class="static-fallback">
  <div style="background:#eff6ff;border-bottom:1px solid #bfdbfe;padding:10px 16px;font-size:13px;text-align:center"><a href="https://study-apps.com/" style="color:#1e3a8a;text-decoration:none;font-weight:600">← study-apps.com 学習サイト集トップへ</a></div>
  <header class="hero">
    <p class="eyebrow">Densha Asobi</p>
    <h1>${game.emoji} ${game.name}</h1>
    <p class="lead">${escapeHtml(game.desc.split('！')[0])}！</p>
  </header>
  <main class="wrap">
    <a class="back-link" href="${BASE_URL}/">← ゲーム いちらんに もどる</a>

    <section class="intro">
      <h2>${game.name}<span class="age-badge">${game.age}</span></h2>
      <p>${escapeHtml(game.aim)}</p>
    </section>

    <h2 class="section">🎯 あそびかた</h2>
    <div class="howto-box">
      <p>${escapeHtml(game.howto)}</p>
    </div>

    <h2 class="section">📚 このゲームで そだつ ちから</h2>
    <div class="howto-box">
      <p>${escapeHtml(game.effect)}</p>
    </div>

    <h2 class="section">🎮 ほかの ゲームも あそぼう</h2>
    <div class="game-grid">
${GAMES.filter(o => o.path !== game.path).slice(0, 6).map(o => `      <a class="game-card" href="${BASE_URL}/${o.path}/">
        <span class="emoji" aria-hidden="true">${o.emoji}</span>
        <span class="gname">${o.name}</span>
        <span class="gage">${o.age}</span>
      </a>`).join('\n')}
    </div>

    <footer class="fnav">
      <p>🚃 でんしゃの たびを たのしもう！</p>
      <p style="margin-top:8px;">
        <a href="${BASE_URL}/">ホーム</a>
        <a href="${BASE_URL}/about/">サイトについて</a>
        <a href="${BASE_URL}/privacy/">プライバシーポリシー</a>
      </p>
    </footer>
  </main>
</div>
`.trim()
}

// ===========================================================
// SoftwareApplication JSON-LD（各ゲーム用）
// ===========================================================
function buildGameJsonLd(game) {
  return `<script type="application/ld+json">
${JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: game.name,
    description: game.desc,
    url: `${BASE_URL}/${game.path}/`,
    applicationCategory: 'GameApplication',
    operatingSystem: 'Any (Web Browser)',
    inLanguage: 'ja',
    isAccessibleForFree: true,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'JPY' },
    audience: {
      '@type': 'EducationalAudience',
      educationalRole: 'student',
      audienceType: game.age,
    },
  }, null, 2)}
</script>`
}

// ===========================================================
// About / Privacy 用フォールバック（フル独立ページとして書き出す）
// 注: SPAルートには存在しないが、AdSenseクローラー向けに静的HTMLを提供する。
//     ユーザーが直接アクセスした場合も、JSが読み込まれて 404 → ホームへ
//     リダイレクトされる前にコンテンツが見える状態にする。
// ===========================================================
const ABOUT_BODY = `
${FALLBACK_STYLE}
<div class="static-fallback">
  <div style="background:#eff6ff;border-bottom:1px solid #bfdbfe;padding:10px 16px;font-size:13px;text-align:center"><a href="https://study-apps.com/" style="color:#1e3a8a;text-decoration:none;font-weight:600">← study-apps.com 学習サイト集トップへ</a></div>
  <header class="hero">
    <p class="eyebrow">About</p>
    <h1>サイトについて</h1>
    <p class="lead">でんしゃあそびの ねらいと とくちょう</p>
  </header>
  <main class="wrap">
    <a class="back-link" href="${BASE_URL}/">← ホームに もどる</a>

    <section class="intro">
      <h2>なんのための サイト？</h2>
      <p>「でんしゃあそび」は、でんしゃや くるまの なかで こどもが たいくつ しないように と かんがえて つくった ミニゲームの しゅうごうサイトです。みじかい じかんで あそべる ゲームを 12しゅるい よういして います。</p>
    </section>

    <h2 class="section">👶 たいしょう ねんれい</h2>
    <div class="howto-box">
      <p>ようちえん・ほいくえんの ねんちゅう〜ねんちょう（4〜6さい）から、小がっこう3ねんせい（9さい）くらいまでが おもな たいしょうです。ゲームごとに めやすの ねんれいを かいて あります。</p>
    </div>

    <h2 class="section">📝 きょういく上の はいりょ</h2>
    <ul class="feature-list">
      <li><strong>ひらがなだけ</strong>すべての ぶんしょうは ひらがなで かいて います。まだ かんじを ならって いない おこさまでも よめます。</li>
      <li><strong>おとが でない</strong>でんしゃの なかでも あんしんして つかえるように、こうかおん・BGMは ありません。フィードバックは バイブレーションのみです。</li>
      <li><strong>かんたん そうさ</strong>タップだけで すすめられる ように、UIを シンプルに たもって います。</li>
      <li><strong>広告は さいしょうげん</strong>ゲームの プレイちゅうの がめんには 広告を 出しません。メニューや けっかの がめんの したぶに 控えめに 出すのみです。</li>
    </ul>

    <h2 class="section">🏠 こじん うんえいです</h2>
    <div class="howto-box">
      <p>このサイトは こじんで うんえいして います。きぎょうや きょうざい がいしゃとは かんけいが ありません。「じぶんの こどもが でんしゃで あそべる もの」を つくりたい、という おもいから はじめました。</p>
    </div>

    <h2 class="section">📱 PWA（オフライン たいおう）</h2>
    <div class="howto-box">
      <p>ブラウザの メニューから「ホームがめんに ついか」を 選んで いただくと、アプリの ように つかえます。いちど 開いた あとは、でんぱが ない ばしょ（ちかてつ・しんかんせんの トンネル など）でも あそべます。</p>
    </div>

    <h2 class="section">🎁 せいさく方針</h2>
    <ul class="feature-list">
      <li><strong>むりょう</strong>かいいんとうろく・課金は いっさい ありません。</li>
      <li><strong>とうろく ふよう</strong>アカウントを つくる ひつようは ありません。</li>
      <li><strong>データ しゅうしゅう なし</strong>こじん情報は あつめません。</li>
      <li><strong>がいぶ送信 なし</strong>あそんだ きろくは おこさまの たんまつにのみ 保存されます。</li>
    </ul>

    <h2 class="section">✏️ コンテンツの つくりかた</h2>
    <div class="howto-box">
      <p>ゲームの もんだいや ぶんしょうは、すべて うんえいしゃが じぶんで つくって います。ほかの サイトの ぶんしょうや そざいを そのまま つかう ことは ありません。けいさんの こたえは プログラムで けんさんずみです。まちがいや なおして ほしい ところを 見つけた ときは、<a href="https://forms.gle/ccMv7oKwz6ysDHBe6" target="_blank" rel="noopener">おといあわせフォーム</a>から おしえて ください。うけとった ものは じゅんじ 見なおして なおします。</p>
    </div>

    <h2 class="section">⚠️ めんせきじこう</h2>
    <div class="howto-box">
      <p>このサイトは あそびを 目的と した ものです。ないようの せいかくさ・かんぜんさを 保証する ものでは なく、りようで しょうじた そんがいに ついて うんえいしゃは せきにんを おいません。</p>
    </div>

    <footer class="fnav">
      <p>🚃 でんしゃの たびを たのしもう！</p>
      <p style="margin-top:8px;">
        <a href="${BASE_URL}/">ホーム</a>
        <a href="${BASE_URL}/privacy/">プライバシーポリシー</a>
      </p>
    </footer>
  </main>
</div>
`.trim()

const PRIVACY_BODY = `
${FALLBACK_STYLE}
<div class="static-fallback">
  <div style="background:#eff6ff;border-bottom:1px solid #bfdbfe;padding:10px 16px;font-size:13px;text-align:center"><a href="https://study-apps.com/" style="color:#1e3a8a;text-decoration:none;font-weight:600">← study-apps.com 学習サイト集トップへ</a></div>
  <header class="hero">
    <p class="eyebrow">Privacy Policy</p>
    <h1>プライバシーポリシー</h1>
    <p class="lead">こじん情報の とりあつかいに ついて</p>
  </header>
  <main class="wrap">
    <a class="back-link" href="${BASE_URL}/">← ホームに もどる</a>

    <section class="intro">
      <h2>かんたんに まとめ</h2>
      <p>「でんしゃあそび」は、おこさまの こじん情報を いっさい あつめません。あそんだ きろく（ベストスコア など）は おこさまの たんまつ（ブラウザ）の なかにのみ 保存され、わたしたちの サーバーには 送られません。</p>
    </section>

    <h2 class="section">📣 こうこくに ついて（Google AdSense）</h2>
    <div class="howto-box">
      <p>当サイトでは、第三者配信の こうこくサービスである Google AdSense を 利用して います。Google などの 第三者は、Cookie を 使用して、ユーザーが 当サイトや 他のサイトに 過去に アクセスした 際の 情報に 基づいて、こうこくを 配信する ことが あります。</p>
      <p>Google が こうこく Cookie を 使用する ことに より、ユーザーは Google や その パートナーの 各種サイトでの こうこくを 利用 する ことが できます。ユーザーは <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener">広告設定</a> で パーソナライズド広告を 無効にする ことが できます。</p>
      <p>第三者配信業者が Cookie を 使用 しないように 設定するには、<a href="https://www.aboutads.info/" target="_blank" rel="noopener">aboutads.info</a> に アクセスしてください。</p>
    </div>

    <h2 class="section">💾 localStorage の 利用</h2>
    <div class="howto-box">
      <p>当サイトでは、ゲームの ベストスコアや プレイ履歴を、おこさまの ブラウザに 内蔵された <strong>localStorage</strong>（ローカル ストレージ）に 保存して います。これらは おこさまの たんまつから 外部に 送信される ことは ありません。</p>
      <p>たんまつから 当該 データを 消す には、ブラウザの 設定から サイトデータを 削除してください。</p>
    </div>

    <h2 class="section">🔒 こじん情報の しゅうしゅう</h2>
    <div class="howto-box">
      <p>当サイトは、おなまえ・メールアドレス・でんわばんごう など、こじんを とくていできる じょうほうを いっさい しゅうしゅう しません。アカウント とうろく きのうも ありません。</p>
    </div>

    <h2 class="section">🌐 がいぶ サーバーへの 送信</h2>
    <div class="howto-box">
      <p>ゲームの データや プレイ きろくが がいぶ サーバーに 送信される ことは ありません。例外として、Google AdSense の こうこく配信に 必要な Cookie などの じょうほうは、Google が 取得する ばあいが あります（うえの「こうこくに ついて」を ごらんください）。</p>
    </div>

    <h2 class="section">📮 おといあわせ</h2>
    <div class="howto-box">
      <p>当サイトに 関する ごしつもん・ごいけんが ございましたら、こちらの フォームから ごれんらく ください。</p>
      <p><a href="https://forms.gle/ccMv7oKwz6ysDHBe6" target="_blank" rel="noopener">おといあわせフォーム</a></p>
    </div>

    <p class="meta-line" style="margin-top:24px;">さいしゅう こうしん: 2026年5月</p>

    <footer class="fnav">
      <p>🚃 でんしゃの たびを たのしもう！</p>
      <p style="margin-top:8px;">
        <a href="${BASE_URL}/">ホーム</a>
        <a href="${BASE_URL}/about/">サイトについて</a>
      </p>
    </footer>
  </main>
</div>
`.trim()

// ===========================================================
// ユーティリティ
// ===========================================================
function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

// <div id="root"></div> または <div id="root"> ... </div> を置き換える
function injectIntoRoot(html, body) {
  const re = /<div id="root">[\s\S]*?<\/div>(?=\s*(<script|<\/body>))/
  if (re.test(html)) {
    return html.replace(re, `<div id="root">${body}</div>`)
  }
  // フォールバック: 単純な空 root
  return html.replace(/<div id="root"><\/div>/, `<div id="root">${body}</div>`)
}

// JSON-LD（既存の WebSite）を差し替え/追記する
function appendJsonLd(html, jsonLdTag) {
  // </head> 直前に追記
  return html.replace(/<\/head>/, `${jsonLdTag}\n  </head>`)
}

// ===========================================================
// 実行
// ===========================================================
let template
try {
  template = readFileSync(join(distDir, 'index.html'), 'utf8')
} catch {
  console.error('dist/index.html が見つかりません。先に npm run build を実行してください。')
  process.exit(1)
}

// --- A. ホームページに静的フォールバックを注入 ---
const homeFallback = buildHomeFallback()
const homeHtml = injectIntoRoot(template, homeFallback)
writeFileSync(join(distDir, 'index.html'), homeHtml)
console.log(`✓ dist/index.html にホーム静的フォールバックを注入しました (${homeFallback.length} 文字)`)

// --- B. 各ゲームページ生成 ---
let count = 0
let totalGameFallbackSize = 0
for (const game of GAMES) {
  const dir = join(distDir, game.path)
  mkdirSync(dir, { recursive: true })

  const gameFallback = buildGameFallback(game)
  totalGameFallbackSize += gameFallback.length

  let html = template
    // title
    .replace(/<title>[^<]*<\/title>/, `<title>${game.title}</title>`)
    // description
    .replace(/(<meta name="description" content=")[^"]*"/, `$1${game.desc}"`)
    // keywords
    .replace(/(<meta name="keywords" content=")[^"]*"/, `$1${game.keywords}"`)
    // og:title
    .replace(/(<meta property="og:title" content=")[^"]*"/, `$1${game.title}"`)
    // og:description
    .replace(/(<meta property="og:description" content=")[^"]*"/, `$1${game.desc}"`)
    // og:url
    .replace(/(<meta property="og:url" content=")[^"]*"/, `$1${BASE_URL}/${game.path}/"`)
    // twitter:title
    .replace(/(<meta name="twitter:title" content=")[^"]*"/, `$1${game.title}"`)
    // twitter:description
    .replace(/(<meta name="twitter:description" content=")[^"]*"/, `$1${game.desc}"`)
    // canonical
    .replace(/(<link rel="canonical" href=")[^"]*"/, `$1${BASE_URL}/${game.path}/"`)

  // SoftwareApplication JSON-LD を追加
  html = appendJsonLd(html, buildGameJsonLd(game))

  // root に静的フォールバックを注入
  html = injectIntoRoot(html, gameFallback)

  writeFileSync(join(dir, 'index.html'), html)
  count++
}
console.log(`✓ ${count}個のゲームページを生成しました（平均 ${Math.round(totalGameFallbackSize / count)} 文字／ゲーム）`)

// --- C. About ページ生成 ---
{
  const dir = join(distDir, 'about')
  mkdirSync(dir, { recursive: true })
  const title = 'サイトについて | でんしゃあそび'
  const desc = '「でんしゃあそび」は電車の中で4〜9歳のこどもが楽しめる無料ミニゲームサイトです。サイトのねらい・対象年齢・教育的配慮・PWA対応について説明します。'
  let html = template
    .replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`)
    .replace(/(<meta name="description" content=")[^"]*"/, `$1${desc}"`)
    .replace(/(<meta property="og:title" content=")[^"]*"/, `$1${title}"`)
    .replace(/(<meta property="og:description" content=")[^"]*"/, `$1${desc}"`)
    .replace(/(<meta property="og:url" content=")[^"]*"/, `$1${BASE_URL}/about/"`)
    .replace(/(<meta name="twitter:title" content=")[^"]*"/, `$1${title}"`)
    .replace(/(<meta name="twitter:description" content=")[^"]*"/, `$1${desc}"`)
    .replace(/(<link rel="canonical" href=")[^"]*"/, `$1${BASE_URL}/about/"`)
  html = injectIntoRoot(html, ABOUT_BODY)
  writeFileSync(join(dir, 'index.html'), html)
  console.log(`✓ dist/about/index.html を生成しました`)
}

// --- D. Privacy ページ生成 ---
{
  const dir = join(distDir, 'privacy')
  mkdirSync(dir, { recursive: true })
  const title = 'プライバシーポリシー | でんしゃあそび'
  const desc = '「でんしゃあそび」のプライバシーポリシー。Google AdSenseの利用、Cookie、localStorage、個人情報非収集の方針について説明します。'
  let html = template
    .replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`)
    .replace(/(<meta name="description" content=")[^"]*"/, `$1${desc}"`)
    .replace(/(<meta property="og:title" content=")[^"]*"/, `$1${title}"`)
    .replace(/(<meta property="og:description" content=")[^"]*"/, `$1${desc}"`)
    .replace(/(<meta property="og:url" content=")[^"]*"/, `$1${BASE_URL}/privacy/"`)
    .replace(/(<meta name="twitter:title" content=")[^"]*"/, `$1${title}"`)
    .replace(/(<meta name="twitter:description" content=")[^"]*"/, `$1${desc}"`)
    .replace(/(<link rel="canonical" href=")[^"]*"/, `$1${BASE_URL}/privacy/"`)
  html = injectIntoRoot(html, PRIVACY_BODY)
  writeFileSync(join(dir, 'index.html'), html)
  console.log(`✓ dist/privacy/index.html を生成しました`)
}

// --- E. サイトマップの lastmod を更新（about/privacyも含む） ---
const sitemapPath = join(__dirname, '../public/sitemap.xml')
try {
  let sitemap = readFileSync(sitemapPath, 'utf8')
  sitemap = sitemap.replace(/<lastmod>[^<]+<\/lastmod>/g, `<lastmod>${TODAY}</lastmod>`)
  // about / privacy が含まれていなければ追加
  if (!sitemap.includes('/about/')) {
    sitemap = sitemap.replace('</urlset>', `  <url>
    <loc>${BASE_URL}/about/</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>${BASE_URL}/privacy/</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
</urlset>`)
  }
  writeFileSync(sitemapPath, sitemap)
  // dist 側にもコピー
  writeFileSync(join(distDir, 'sitemap.xml'), sitemap)
  console.log(`✓ sitemap.xml lastmod を ${TODAY} に更新しました (about/privacy を含む)`)
} catch (e) {
  console.warn('sitemap.xml の更新に失敗:', e.message)
}

console.log(`\n=== 完了 ===`)
console.log(`ホーム静的フォールバック: ${homeFallback.length} 文字`)
console.log(`ゲームページ平均サイズ: ${Math.round(totalGameFallbackSize / count)} 文字`)
