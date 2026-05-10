# gdcms

Google Driveを使って、シンプルな静的サイトを運用するためのCMSです。

> Google Docsで書く。Google Sheetsで公開する。Next.jsで表示する。

## コンセプト

gdcmsは、独自の管理画面を必要としないCMSです。

基本的な考え方はシンプルです。

- Google Driveをコンテンツの作業場所にする
- Google Docsを本文の執筆画面にする
- Google Sheetsを公開状態やメタデータの管理画面にする
- Next.jsで公開サイトを表示する

このプロジェクトは、Google Driveは使えるけれど、WordPressや一般的なCMSを覚えるのは負担が大きい小規模チーム、地域団体、クリニック、学校、コミュニティ、NPO、小規模事業者向けに設計しています。

## 思想

目指しているのは、もう一つ複雑なCMSを作ることではありません。

目指しているのは、これです。

```text
Google Driveが使えれば、Webサイトを更新できる。
```

編集者が、ルーティング、HTML、Markdown、デプロイ、データベース、管理画面の使い方を理解する必要はありません。

## MVPのゴール

最初のマイルストーンは、意図的に小さくします。

```text
Google Docsで本文を書き、Google Sheetsの行をpublishedに変更すると、Next.jsのWebサイトに記事が表示される。
```

## 技術スタック

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Google APIs
- Zod
- HTML sanitization
- Static generation / ISR
- Service Account authentication
- Docker / Docker Composeによるローカル開発とVPSデプロイ

## 実行環境の方針

gdcmsはDockerで構築・運用する前提です。

初期の実行環境:

- Docker Composeでローカル開発
- Docker ComposeでVPSデプロイ
- 環境変数はGitの外で管理
- 秘密情報やService AccountのJSONファイルはコミットしない

## コンテンツモデル

Google Docsには記事や固定ページの本文を保存します。

Google Sheetsにはメタデータと公開制御を保存します。

想定するシートのカラム:

| Column | Purpose |
| --- | --- |
| `title` | 表示タイトル |
| `slug` | URLスラッグ |
| `docId` | Google DocsのドキュメントID |
| `status` | `draft`, `published`, `archived` のいずれか |
| `publishedAt` | 任意の公開日時 |
| `category` | カテゴリ |
| `excerpt` | 任意の概要文 |
| `theme` | 許可されたデザインテーマ |
| `layout` | 許可されたレイアウト |
| `accentColor` | 検証済みのアクセントカラー |

## デザイン方針

コンテンツとデザインは分離します。

Google Docsが担当するもの:

- 見出し
- 段落
- リスト
- リンク
- 表、将来的に対応

公開サイトが担当するもの:

- Tailwind CSSのクラス
- Reactコンポーネント
- 許可されたテーマ
- 検証済みのCSS変数

Google Docs由来のインラインスタイルは、そのまま信用して表示しません。

## セキュリティモデル

編集者のアクセス権限やドキュメント権限はGoogle Drive側で管理します。

アプリケーション側では、次の方針を守ります。

- 設定されたDriveフォルダのみを読み取る
- Google認証情報はサーバー側だけで扱う
- Service Accountの秘密情報をブラウザに出さない
- Google Sheetsの行はZodで検証する
- ドキュメント由来のHTMLをサニタイズする
- 下書きや未来日時の記事を公開レスポンスに含めない
- theme、layout、colorの値を検証してから表示に使う

## リポジトリの状態

このリポジトリは、現在プランニングおよび初期実装段階です。

アーキテクチャと実装計画は [PLAN.md](./PLAN.md) を参照してください。

関連ドキュメント:

- [English README](./README.md)
- [コンテンツモデル](./docs/content-model.md)
- [Google APIセットアップ](./docs/setup-google-api.md)
- [技術メモ](./docs/technical-notes.ja.md)
- [エージェント向けガイド](./AGENTS.md)

## ライセンス

MIT
