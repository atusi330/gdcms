# 初期構築の解説メモ

このドキュメントは、gdcmsの初期構築で実際に行ったことを、初心者でも追えるように整理したものです。

対象範囲:

- GitHubリポジトリ作成後の初期化
- README / PLAN / AGENTSなどのドキュメント整備
- Next.jsの最小構成
- Docker Compose構成
- Traefikによるローカルルーティング
- 発生したエラーと対処法

## 今回のゴール

今回のゴールは、CMS機能そのものを作る前に、まず次の状態を作ることでした。

```text
Docker ComposeでNext.jsアプリを起動し、
Traefik経由で http://gdcms.localhost にアクセスできる。
```

これはgdcmsの「器」を作る作業です。

Google DriveやGoogle Sheetsを読む処理は、次のフェーズで実装します。

## 全体の流れ

今回の作業は、大きく分けると次の順番です。

1. public Git向けのドキュメントを整える
2. GitHubに初回pushする
3. Docker + Traefik前提に設計を更新する
4. Next.jsアプリを作る
5. Dockerfileとcomposeファイルを作る
6. Traefik経由でローカル表示する
7. lint / typecheck / build / auditで確認する
8. コミットしてGitHubへpushする

## 1. public Git向けのドキュメント整備

最初に、リポジトリをpublicで管理できるように、基本ドキュメントを作りました。

作成した主なファイル:

- `README.md`
- `README.ja.md`
- `PLAN.md`
- `AGENTS.md`
- `.env.example`
- `.gitignore`
- `LICENSE`
- `docs/content-model.md`
- `docs/setup-google-api.md`
- `docs/technical-notes.ja.md`

### READMEの役割

READMEは、初めて見る人にプロジェクトの思想を伝える入口です。

gdcmsでは、次の考え方をREADMEの中心に置いています。

```text
Google Driveが使えれば、Webサイトを更新できる。
```

これは、このプロジェクトの一番大事な思想です。

### PLANの役割

`PLAN.md` は、システム全体の設計と実装順をまとめるためのファイルです。

あとから機能を追加するときに、

```text
今どこまで作ったのか
次は何を作るのか
何を後回しにするのか
```

を確認できます。

### AGENTS.mdの役割

`AGENTS.md` は、CodexやGeminiのようなAIエージェントに、このリポジトリでどう作業すべきかを伝えるためのファイルです。

特に次の内容を明記しています。

- 独自CMS管理画面は作らない
- Google Docsを本文エディタにする
- Google Sheetsを公開管理に使う
- Docker + Traefik前提で進める
- 秘密情報をGitに入れない

## 2. GitHubへの初回push

GitHubリポジトリ:

```text
https://github.com/atusi330/gdcms.git
```

最初はローカルディレクトリがGitリポジトリではなかったため、次のように初期化しました。

```bash
git init -b main
git add .
git commit -m "Initial project documentation"
git remote add origin https://github.com/atusi330/gdcms.git
```

その後、GitHubへpushしました。

```bash
git push -u origin main
```

### エラー: `fatal: not a git repository`

発生したエラー:

```text
fatal: not a git repository (or any of the parent directories): .git
```

意味:

```text
このフォルダはまだGit管理されていません。
```

対処:

```bash
git init -b main
```

でGitリポジトリとして初期化しました。

### エラー: `gh: command not found`

発生したエラー:

```text
zsh:1: command not found: gh
```

意味:

```text
GitHub CLIの gh コマンドがインストールされていません。
```

対処:

今回はGitHub CLIを使わず、通常の`git`コマンドで進めました。

### エラー: `Permission denied (publickey)`

発生したエラー:

```text
git@github.com: Permission denied (publickey).
```

意味:

```text
SSHでGitHubに接続しようとしたが、使えるSSH鍵が設定されていません。
```

対処:

今回はSSHではなくHTTPSリモートを使いました。

```text
https://github.com/atusi330/gdcms.git
```

### エラー: `could not read Username for 'https://github.com'`

発生したエラー:

```text
fatal: could not read Username for 'https://github.com': terminal prompts disabled
```

意味:

```text
GitHubへpushするには認証が必要だが、この実行環境ではユーザー名やトークンを入力できません。
```

対処:

ローカルの通常ターミナルから認証済み状態でpushしました。

```bash
git push -u origin main
```

## 3. GitHub tokenを貼ってしまった場合の対処

作業中にGitHub Personal Access Tokenがチャットに貼られました。

これは秘密情報なので、そのトークンは使わず、GitHub側で失効して新しいものに変更しました。

重要な考え方:

```text
一度チャットやログに出た秘密情報は、漏れたものとして扱う。
```

対処:

- 貼られたtokenは使わない
- GitHub側でrevokeする
- 新しいtokenを作る
- `.env`や認証情報はGitに入れない

## 4. Docker + Traefik前提にした理由

gdcmsは、VPS上でネコフリークスと同居する想定があります。

ネコフリークスはすでにTraefikで動いているため、gdcmsも同じTraefikに乗せる方針にしました。

### Traefikとは

Traefikは、リバースプロキシです。

簡単に言うと、

```text
どのURLへのアクセスを、どのDockerコンテナへ渡すかを決める入口
```

です。

たとえばローカルでは、次のようにアクセスします。

```text
http://gdcms.localhost
```

Traefikは、このアクセスをgdcmsのNext.jsコンテナへ流します。

### Traefikを使うメリット

Traefikなしの場合:

```text
http://localhost:3000
http://localhost:8001
http://localhost:8888
```

のように、アプリごとにポート番号を覚える必要があります。

Traefikありの場合:

```text
http://gdcms.localhost
http://neko.localhost
```

のように、ホスト名で管理できます。

つまり、

```text
ポート管理からホスト名管理に変わる
```

ということです。

## 5. ローカルのポート確認

作業前に、ローカルのDockerコンテナがどのポートを使っているか確認しました。

使ったコマンド:

```bash
docker ps --format 'table {{.Names}}\t{{.Ports}}\t{{.Status}}'
```

また、ホスト側で`localhost:3000`が使われているかも確認しました。

```bash
lsof -nP -iTCP:3000 -sTCP:LISTEN
```

結果として、コンテナ内部で`3000/tcp`を使っているものはありましたが、ホスト側の`localhost:3000`は空いていました。

ただし、gdcmsではTraefikを使うため、最終的に`3000:3000`のような直接公開はしない方針にしました。

## 6. Next.jsの最小構成

次に、Next.jsアプリの最小構成を追加しました。

主なファイル:

- `package.json`
- `package-lock.json`
- `next.config.ts`
- `tsconfig.json`
- `postcss.config.mjs`
- `eslint.config.mjs`
- `src/app/layout.tsx`
- `src/app/page.tsx`
- `src/app/globals.css`

### Next.jsとは

Next.jsは、Reactを使ってWebサイトやWebアプリを作るためのフレームワークです。

gdcmsではNext.jsを使って、Google DocsやGoogle Sheetsから取得した内容をWebサイトとして表示します。

### App Routerとは

Next.jsの新しいルーティング方式です。

`src/app/page.tsx` がトップページになります。

今回作ったトップページは、まだCMS機能はありません。

まずは、

```text
Google Drive is the CMS.
```

というコンセプトを表示する仮トップページです。

## 7. pnpmがなかったためnpmを使った

確認したところ、`pnpm`は入っていませんでした。

発生したエラー:

```text
zsh:1: command not found: pnpm
```

意味:

```text
pnpmというパッケージマネージャーがインストールされていません。
```

対処:

今回は`npm`を使いました。

```bash
npm install
```

Dockerで動かす方針なので、ローカルPCに特定のNode環境やpnpmが必須である必要はありません。

## 8. npm auditの警告と対処

`npm install`後に、`npm audit`で中程度の脆弱性警告が出ました。

内容は、Next.js内部のPostCSS依存に関する警告でした。

発生した内容:

```text
postcss <8.5.10
Severity: moderate
```

さらに、`npm audit fix --force`を使うとNext.jsを古いバージョンへ落とす提案が出ました。

これは危険です。

理由:

```text
--force は破壊的な依存更新を行う可能性がある。
今回はNext.jsを古い版へ戻す提案だったため、採用しない。
```

対処:

`package.json`に`overrides`を追加し、PostCSSを安全なバージョンへ寄せました。

```json
{
  "overrides": {
    "postcss": "^8.5.10"
  }
}
```

その後、

```bash
npm install
npm audit --audit-level=moderate
```

を実行し、脆弱性が0件になったことを確認しました。

## 9. `next lint`のエラーと対処

最初は`package.json`に次のようなlintコマンドを入れていました。

```json
{
  "lint": "next lint"
}
```

しかし、実行するとエラーになりました。

発生したエラー:

```text
Invalid project directory provided, no such directory: /Users/ats/docker-projects/gdcms/lint
```

意味:

```text
現在のNext.jsでは next lint の扱いが想定と合わず、lint がディレクトリ名のように解釈されてしまっている。
```

対処:

`next lint`をやめて、ESLintを直接実行する形にしました。

```json
{
  "lint": "eslint ."
}
```

さらに、ESLintの設定ファイルとして`eslint.config.mjs`を追加しました。

## 10. Next.jsのビルド確認

作ったNext.jsアプリが壊れていないか確認するために、次のコマンドを実行しました。

```bash
npm run typecheck
npm run lint
npm run build
```

それぞれの意味:

- `typecheck`: TypeScriptの型エラーがないか確認
- `lint`: コードの書き方に問題がないか確認
- `build`: 本番用にビルドできるか確認

すべて成功しました。

## 11. Dockerfileの追加

Next.jsをDockerで動かすために`Dockerfile`を追加しました。

今回のDockerfileは、複数のstageに分かれています。

主なstage:

- `base`: 共通の土台
- `deps`: 依存関係をインストール
- `dev`: ローカル開発用
- `builder`: 本番ビルド用
- `runner`: 本番実行用

### なぜstageを分けるのか

開発用と本番用では必要なものが違うからです。

開発用:

```text
ソースコードをマウントして、変更をすぐ反映したい。
```

本番用:

```text
ビルド済みの最小構成だけで動かしたい。
```

この違いをDockerfile内のstageで分けています。

## 12. Docker Composeファイルの追加

追加したcomposeファイル:

- `compose.yaml`
- `compose.local.yaml`
- `compose.prod.yaml`

### compose.yaml

共通設定を書くファイルです。

gdcmsの`web`サービスを定義し、`web-gateway`ネットワークに接続します。

### compose.local.yaml

ローカル開発用の設定です。

主な内容:

- `dev` stageを使う
- ソースコードをコンテナにマウントする
- Traefik labelで`gdcms.localhost`を設定する
- `3000:3000`は直接公開しない

### compose.prod.yaml

本番用の設定です。

主な内容:

- `runner` stageを使う
- 本番ドメインを`GDCMS_HOST`で渡す
- TraefikのHTTPS entrypointを使う
- Let’s Encryptのresolverは既存の`myresolver`を使う

## 13. compose.prod.yamlの`.env.production`エラー

本番用composeの設定確認をしたとき、次のエラーが出ました。

```text
env file /Users/ats/docker-projects/gdcms/.env.production not found
```

意味:

```text
compose.prod.yamlで .env.production を読む設定になっているが、ローカルにはそのファイルが存在しない。
```

本番では`.env.production`を置く予定ですが、ローカルで設定確認できないのは少し不便です。

対処:

`env_file`をoptionalにしました。

```yaml
env_file:
  - path: .env.production
    required: false
```

これにより、ローカルで`compose.prod.yaml`のconfig確認ができるようになりました。

本番では、VPS上に`.env.production`を置いて使います。

## 14. Docker起動確認

ローカルで起動しました。

```bash
docker compose -f compose.yaml -f compose.local.yaml up -d --build
```

起動後、コンテナを確認しました。

```bash
docker ps --filter name=gdcms --format 'table {{.Names}}\t{{.Ports}}\t{{.Status}}'
```

結果:

```text
gdcms-web-local   3000/tcp   Up
```

ここで重要なのは、`3000/tcp`はコンテナ内部のポートであり、ホストに`3000:3000`として公開していないことです。

アクセスはTraefik経由です。

```text
http://gdcms.localhost
```

## 15. Traefik経由のアクセス確認

次のコマンドでHTTPレスポンスを確認しました。

```bash
curl -I --max-time 10 http://gdcms.localhost
```

結果:

```text
HTTP/1.1 200 OK
```

これは、

```text
Traefikが gdcms.localhost を受け取り、
gdcms-web-local コンテナへ正しくルーティングできている
```

という意味です。

## 16. 本番用Docker buildの確認

本番用の`runner` stageが壊れていないかも確認しました。

```bash
docker build --target runner -t gdcms-web:prod-check .
```

結果として、本番用イメージも正常にビルドできました。

これは、ローカル開発用だけでなく、本番実行用のDocker構成も最低限成立しているということです。

## 17. 今回追加された主なファイル

Next.js関連:

- `package.json`
- `package-lock.json`
- `next.config.ts`
- `tsconfig.json`
- `postcss.config.mjs`
- `eslint.config.mjs`
- `next-env.d.ts`
- `src/app/layout.tsx`
- `src/app/page.tsx`
- `src/app/globals.css`

Docker関連:

- `Dockerfile`
- `.dockerignore`
- `compose.yaml`
- `compose.local.yaml`
- `compose.prod.yaml`

その他:

- `public/.gitkeep`

## 18. 現在の起動方法

起動:

```bash
docker compose -f compose.yaml -f compose.local.yaml up -d --build
```

アクセス:

```text
http://gdcms.localhost
```

停止:

```bash
docker compose -f compose.yaml -f compose.local.yaml down
```

## 19. 今回の確認コマンド

品質確認:

```bash
npm run lint
npm run typecheck
npm run build
npm audit --audit-level=moderate
```

Docker確認:

```bash
docker compose -f compose.yaml -f compose.local.yaml config
docker compose -f compose.yaml -f compose.local.yaml up -d --build
docker ps --filter name=gdcms
curl -I --max-time 10 http://gdcms.localhost
docker build --target runner -t gdcms-web:prod-check .
```

Git確認:

```bash
git status --short --branch
git log --oneline --decorate -3
```

## 20. 現在のコミット

今回の基盤構築は、次のコミットとしてGitHubへpush済みです。

```text
267cf04 Add Next.js Docker Traefik foundation
```

その前のドキュメント更新:

```text
458c577 Document Traefik-based Docker runtime
```

最初のドキュメント作成:

```text
27af467 Initial project documentation
```

## 21. 現在の到達点

現在できていること:

- public GitHubリポジトリがある
- README / PLAN / AGENTS / docs がある
- Next.jsの最小アプリがある
- Docker Composeで起動できる
- Traefik経由で`gdcms.localhost`にアクセスできる
- lint / typecheck / build / auditが通っている
- 本番用Docker buildも通っている

まだできていないこと:

- Google Sheetsを読む
- Google Docsを読む
- 投稿一覧を表示する
- 投稿詳細ページを表示する
- 公開/下書き制御を実装する
- Google Driveフォルダ構成と連携する

## 22. 次にやること

次はPhase 1です。

目的:

```text
Google Sheets + Google Docs から、1つの記事データを作る。
```

具体的には:

1. Google Sheetsの投稿台帳を作る
2. Google Docsの記事本文を1つ作る
3. Service Accountにフォルダを共有する
4. `src/lib/google/auth.ts`を作る
5. `src/lib/google/sheets.ts`を作る
6. `src/lib/google/docs.ts`を作る
7. Zodで投稿データを検証する
8. Next.jsで記事一覧に出す

ここから、いよいよgdcmsがCMSらしくなっていきます。
