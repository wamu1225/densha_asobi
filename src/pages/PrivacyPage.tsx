import { InfoPage, InfoSection } from './InfoPage'

// 内容は generate-game-pages.js の静的フォールバック（PRIVACY_BODY）と同一に保つこと
export function PrivacyPage() {
  return (
    <InfoPage title="プライバシーポリシー" lead="こじん情報の とりあつかいに ついて">
      <InfoSection heading="かんたんに まとめ">
        <p>「でんしゃあそび」は、おこさまの こじん情報を いっさい あつめません。あそんだ きろく（ベストスコア など）は おこさまの たんまつ（ブラウザ）の なかにのみ 保存され、わたしたちの サーバーには 送られません。</p>
      </InfoSection>

      <InfoSection heading="こうこくに ついて（Google AdSense）">
        <p>当サイトでは、第三者配信の こうこくサービスである Google AdSense を 利用して います。Google などの 第三者は、Cookie を 使用して、ユーザーが 当サイトや 他のサイトに 過去に アクセスした 際の 情報に 基づいて、こうこくを 配信する ことが あります。</p>
        <p>Google が こうこく Cookie を 使用する ことに より、ユーザーは Google や その パートナーの 各種サイトでの こうこくを 利用 する ことが できます。ユーザーは <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener" className="underline" style={{ color: '#1A3A9B' }}>広告設定</a> で パーソナライズド広告を 無効にする ことが できます。</p>
        <p>第三者配信業者が Cookie を 使用 しないように 設定するには、<a href="https://www.aboutads.info/" target="_blank" rel="noopener" className="underline" style={{ color: '#1A3A9B' }}>aboutads.info</a> に アクセスしてください。</p>
      </InfoSection>

      <InfoSection heading="localStorage の 利用">
        <p>当サイトでは、ゲームの ベストスコアや プレイ履歴を、おこさまの ブラウザに 内蔵された <strong>localStorage</strong>（ローカル ストレージ）に 保存して います。これらは おこさまの たんまつから 外部に 送信される ことは ありません。</p>
        <p>たんまつから 当該 データを 消す には、ブラウザの 設定から サイトデータを 削除してください。</p>
      </InfoSection>

      <InfoSection heading="こじん情報の しゅうしゅう">
        <p>当サイトは、おなまえ・メールアドレス・でんわばんごう など、こじんを とくていできる じょうほうを いっさい しゅうしゅう しません。アカウント とうろく きのうも ありません。</p>
      </InfoSection>

      <InfoSection heading="がいぶ サーバーへの 送信">
        <p>ゲームの データや プレイ きろくが がいぶ サーバーに 送信される ことは ありません。例外として、Google AdSense の こうこく配信に 必要な Cookie などの じょうほうは、Google が 取得する ばあいが あります（うえの「こうこくに ついて」を ごらんください）。</p>
      </InfoSection>

      <InfoSection heading="おといあわせ">
        <p>当サイトに 関する ごしつもん・ごいけんが ございましたら、こちらの フォームから ごれんらく ください。</p>
        <p><a href="https://forms.gle/ccMv7oKwz6ysDHBe6" target="_blank" rel="noopener" className="underline" style={{ color: '#1A3A9B' }}>おといあわせフォーム</a></p>
      </InfoSection>

      <p className="text-xs mt-2" style={{ color: 'var(--ink-sub)' }}>さいしゅう こうしん: 2026年5月</p>
    </InfoPage>
  )
}
