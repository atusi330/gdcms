# 技術メモ

このメモは、gdcmsを設計する中で確認した技術的な考え方や判断を、あとから読み返せるようにまとめたものです。

## gdcmsの基本思想

gdcmsの思想は、独自の管理画面を作らないことです。

```text
Google Driveが使えれば、Webサイトを更新できる。
```

CMSのために新しい管理画面を覚えるのではなく、普段使っているGoogle Drive、Google Docs、Google SheetsをそのままWebサイト更新の入口にします。

## 全体構成

gdcmsは、Google DriveをヘッドレスCMSのバックエンドとして使い、Next.jsで公開サイトを生成します。

役割分担:

- Google Drive: コンテンツの作業場所
- Google Docs: 記事や固定ページの本文
- Google Sheets: 公開状態、メタデータ、デザイン制御
- Next.js: 公開サイトの表示
- Docker Compose + Traefik: ローカル開発とVPSデプロイ

## なぜGoogle Driveを使うのか

小規模事業者や地域団体にとって、WordPressや専用CMSの管理画面は学習コストがあります。

一方で、Google Drive、Google Docs、Google Sheetsはすでに日常業務で使われていることが多いです。

そのため、gdcmsでは次の価値を狙います。

- 新しい管理画面を覚えなくていい
- Googleアカウントの権限管理を使える
- Google Docsの共同編集や履歴を使える
- Google Sheetsで公開状態を一覧管理できる
- 表示側はNext.jsで自由にデザインできる

## 技術スタック

MVPの技術スタック:

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Google APIs
- Zod
- HTML sanitization
- Static generation / ISR
- Service Account authentication
- Docker / Docker Compose

## Zodとは何か

Zodは、TypeScriptでよく使われるデータ検証ライブラリです。

外部から来たデータが、期待した形になっているかを実行時にチェックします。

gdcmsではGoogle Sheetsの値をユーザーが直接編集するため、次のような問題が起きます。

- `status` に想定外の値が入る
- `slug` にURLとして不適切な文字が入る
- `theme` に未定義のテーマ名が入る
- `publishedAt` に日付として解釈できない値が入る

Zodを使うことで、Google Sheets由来のデータをアプリ側で信用する前に検証できます。

gdcmsにおけるZodの役割:

```text
Google Sheets入力の番人
```

## セキュリティについて

Google Driveを使うことで、編集者の認証やドキュメントの権限管理はGoogle側に寄せられます。

これは独自CMSより攻撃面を小さくできる大きな利点です。

ただし、Google Driveを使うだけで完全に安全になるわけではありません。

アプリ側で守るべきこと:

- Google APIの認証情報をGitに入れない
- Service Accountの秘密鍵をブラウザに出さない
- Service Accountには必要なフォルダだけ共有する
- Google Sheetsの値はZodで検証する
- Google Docs由来のHTMLはサニタイズする
- `draft` や未来日時の記事を公開レスポンスに含めない
- `theme`、`layout`、`accentColor` はallowlistや形式チェックを通す
- revalidate用APIには秘密トークンを使う

正しい理解:

```text
Google Driveの認証と権限を活用して攻撃面を小さくする。
ただし、公開サイト側の入力検証とHTMLサニタイズは必須。
```

## Service Accountとは

Service Accountは、Google Cloud上で作るアプリケーション用のアカウントです。

gdcmsでは、対象のGoogle DriveフォルダをService Accountのメールアドレスに共有し、サーバー側からGoogle DocsやGoogle Sheetsを読み取ります。

MVPではService Accountを使う方針です。

理由:

- 実装が比較的シンプル
- ユーザーごとのOAuthログインを作らなくていい
- サーバー側だけでGoogle APIを呼べる
- ブラウザに認証情報を出さなくていい

注意点:

- 秘密鍵をGitに入れない
- `.env.local` やVPSの環境変数で管理する
- 対象フォルダ以外を共有しない

## Vercelとは

Vercelは、Next.jsを開発している会社が提供するホスティングサービスです。

GitHubにpushすると自動でビルドして公開でき、Next.jsとの相性が良いサービスです。

ただし、gdcmsではDocker Composeでローカル開発とVPS運用を行う方針です。

今回の位置づけ:

- 主線: VPS + Docker Compose
- 選択肢: Vercelは将来的に使いたければ使える

## Docker前提にする理由

gdcmsはDocker ComposeとTraefikで構築・運用する前提です。

理由:

- ローカルとVPSで環境差を減らせる
- Next.jsや将来のAPIサーバーを同じ構成で動かしやすい
- VPSにそのまま持っていける
- 将来的に同期ワーカーやキャッシュを増やしやすい
- 各アプリのポート番号ではなくホスト名でアクセスできる
- 本番のTraefikルーティングをローカルでも確認できる

初期構成では、まずNext.js単体のコンテナから始めます。

必要になったら、次のように分割します。

```text
web: Next.js frontend and server functions
worker: Google Drive sync worker
cache: Redis, if needed later
```

## VercelとDocker/VPSの違い

Vercelを使う場合:

```text
GitHub -> Vercel -> Next.jsサイト公開
```

Docker/VPSで使う場合:

```text
GitHub -> VPS -> Docker Compose -> Next.jsサイト公開
```

Vercelは公開が楽です。

Docker/VPSは自分で制御しやすく、Google API連携や同期処理を含めた運用に向いています。

gdcmsではDocker/VPSを主線にします。

## Traefikを使う理由

ローカルでも本番でもTraefikを使う方針です。

理由:

- ネコフリークスがVPS上ですでにTraefikで動いている
- gdcmsも同じVPSに同居させる想定
- 80番/443番を複数アプリで直接取り合わなくて済む
- Docker labelsでアプリごとのルーティングを定義できる
- ローカルと本番を近い構成にできる

ローカルでは次のようにアクセスする想定です。

```text
http://gdcms.localhost
```

本番では次のように本番ドメインをTraefikに割り当てます。

```text
https://gdcms.example.com
```

この構成では、gdcmsコンテナの内部ポートはNext.js標準の`3000`を使い、ホスト側に`3000:3000`のようなポート公開はしません。

Traefikがホスト名を見て、該当するコンテナにリクエストを流します。

## 実装順の考え方

最初から全部を作りません。

まずは次の最小ループを動かします。

```text
Google Docsで本文を書く
Google Sheetsでpublishedにする
Next.jsサイトに記事が出る
```

推奨順:

1. public-safeなリポジトリ土台を作る
2. Docker ComposeでNext.jsを起動できるようにする
3. Google Sheetsから投稿台帳を読む
4. Google Docsから本文を読む
5. ZodでSheetsの値を検証する
6. Docs本文を安全なHTMLまたはReact構造に変換する
7. 投稿一覧と詳細ページを表示する
8. `status` と `publishedAt` を効かせる
9. 固定ページを追加する
10. テーマやレイアウト制御を追加する
11. 手動同期やISRを追加する
12. 自動登録やWebhookは後回しにする

## MVPでやらないこと

MVPでは次は後回しにします。

- 独自管理画面
- Google Drive Webhook
- 自動スプレッドシート生成
- 複数サイト管理
- Google Docs内画像の完全対応
- PDF変換
- AI処理
- 複雑な権限管理
- WordPress連携

MVPの価値は、Google DriveからWebサイトが更新される体験を最短で見せることです。

## public Gitで注意すること

このプロジェクトはpublic Gitで管理する方針です。

公開してよいもの:

- ソースコード
- README
- PLAN
- サンプルスキーマ
- ダミーデータ
- Dockerfileやcompose.yaml
- `.env.example`

公開してはいけないもの:

- `.env.local`
- Service Account JSON
- Google API秘密鍵
- 実際のGoogle DriveフォルダID
- 実際の顧客ドキュメントID
- 顧客コンテンツ
- Google APIレスポンスを含むログ

## ライセンス

初期ライセンスはMITです。

MITは使いやすいライセンスで、他人が商用利用や改変をしやすい一方、著作権表示とライセンス文は残す必要があります。

gdcmsでは、コードを閉じるよりも思想と実装を先に公開し、導入支援、テンプレート、運用ノウハウで価値を作る方針です。

## 現時点の判断まとめ

- CMS管理画面は作らない
- Google Driveを管理画面の代わりにする
- Google Docsは本文
- Google Sheetsは公開制御とメタデータ
- Next.jsで表示する
- Docker Compose + Traefikで構築・運用する
- Service AccountでGoogle APIにアクセスする
- ZodでSheetsの値を検証する
- HTMLはサニタイズする
- public Gitで管理する
- ライセンスはMIT
