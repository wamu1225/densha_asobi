import { InfoPage, InfoSection } from './InfoPage'

// 内容は generate-game-pages.js の静的フォールバック（ABOUT_BODY）と同一に保つこと
export function AboutPage() {
  return (
    <InfoPage title="サイトについて" lead="でんしゃあそびの ねらいと とくちょう">
      <InfoSection heading="なんのための サイト？">
        <p>「でんしゃあそび」は、でんしゃや くるまの なかで こどもが たいくつ しないように と かんがえて つくった ミニゲームの しゅうごうサイトです。みじかい じかんで あそべる ゲームを 12しゅるい よういして います。</p>
      </InfoSection>

      <InfoSection heading="たいしょう ねんれい">
        <p>ようちえん・ほいくえんの ねんちゅう〜ねんちょう（4〜6さい）から、小がっこう3ねんせい（9さい）くらいまでが おもな たいしょうです。ゲームごとに めやすの ねんれいを かいて あります。</p>
      </InfoSection>

      <InfoSection heading="きょういく上の はいりょ">
        <p><strong>ひらがなだけ</strong> — すべての ぶんしょうは ひらがなで かいて います。まだ かんじを ならって いない おこさまでも よめます。</p>
        <p><strong>おとが でない</strong> — でんしゃの なかでも あんしんして つかえるように、こうかおん・BGMは ありません。</p>
        <p><strong>かんたん そうさ</strong> — タップだけで すすめられる ように、UIを シンプルに たもって います。</p>
        <p><strong>広告は さいしょうげん</strong> — ゲームの プレイちゅうの がめんには 広告を 出しません。メニューや けっかの がめんの したぶに 控えめに 出すのみです。</p>
      </InfoSection>

      <InfoSection heading="こじん うんえいです">
        <p>このサイトは こじんで うんえいして います。きぎょうや きょうざい がいしゃとは かんけいが ありません。「じぶんの こどもが でんしゃで あそべる もの」を つくりたい、という おもいから はじめました。</p>
      </InfoSection>

      <InfoSection heading="オフラインでも あそべます（PWA）">
        <p>ブラウザの メニューから「ホームがめんに ついか」を 選んで いただくと、アプリの ように つかえます。いちど 開いた あとは、でんぱが ない ばしょ（ちかてつ・しんかんせんの トンネル など）でも あそべます。</p>
      </InfoSection>

      <InfoSection heading="せいさく方針">
        <p><strong>むりょう</strong> — かいいんとうろく・課金は いっさい ありません。</p>
        <p><strong>とうろく ふよう</strong> — アカウントを つくる ひつようは ありません。</p>
        <p><strong>データ しゅうしゅう なし</strong> — こじん情報は あつめません。</p>
        <p><strong>がいぶ送信 なし</strong> — あそんだ きろくは おこさまの たんまつにのみ 保存されます。</p>
      </InfoSection>

      <InfoSection heading="コンテンツの つくりかた">
        <p>ゲームの もんだいや ぶんしょうは、すべて うんえいしゃが じぶんで つくって います。ほかの サイトの ぶんしょうや そざいを そのまま つかう ことは ありません。けいさんの こたえは プログラムで けんさんずみです。</p>
        <p>まちがいや なおして ほしい ところを 見つけた ときは、<a href="https://forms.gle/ccMv7oKwz6ysDHBe6" target="_blank" rel="noopener" className="underline" style={{ color: '#1A3A9B' }}>おといあわせフォーム</a>から おしえて ください。うけとった ものは じゅんじ 見なおして なおします。</p>
      </InfoSection>

      <InfoSection heading="めんせきじこう">
        <p>このサイトは あそびを 目的と した ものです。ないようの せいかくさ・かんぜんさを 保証する ものでは なく、りようで しょうじた そんがいに ついて うんえいしゃは せきにんを おいません。</p>
      </InfoSection>
    </InfoPage>
  )
}
