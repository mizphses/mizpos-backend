# mizpos

いい感じのヘッドレスECシステム。Cloudflare Worker + D1 + Prisma + Honoで動くよ（色々他のパッケージも入れてるよ）。

決済システム: Stripe（クレカのみ想定）

## 根拠法

日本国の法律（特商法等）

## 開発環境の整備

### 1. VoltaでNodeのバージョンを合わせる & Corepackを入れて、パッケージを入れる

```bash
# Voltaをインストール
$ curl https://get.volta.sh | bash
# Nodeを入れる
$ volta install node@22
# corepackを入れる
$ volta install corepack

# パッケージを入れる
$ pnpm install
```

### 2. DBを用意する

```sh
$ pnpm dlx wrangler d1 create MIZPOS
$ pnpm dlx wrangler migrate:local # local
$ pnpm dlx wrangler migrate:remote # remote
```

### 3. 環境変数を編集

※ それぞれ適宜、openssl randで生成したりGoogle Consoleからもらってきてください。テキトーにタイプして生成してます。

```sh
TOKEN_KEY="w9P4xezts1y93GTSMb0e9Jzxq2mycGcZHNYteccc4cC43WW75B8uHx+K3GSAZ2JB"
SALT="ynq/ak7eNfby27NYewrjXLi8cwEY8POvEMkxzJGRAJb7lBs7Gb+fkorcaaXIryQ3"
JWT_SECRET="nLTS0laXc+LNjoH61x/uVpXLSD1Pj1HqN+QyyHyX/AJHbjNGzw6n/HYDZFDwILBt"
GOOGLE_ID="hogehoge-hogehoge.apps.googleusercontent.com"
GOOGLE_SECRET="HOGEHOGE-SECRET"
GITHUB_ID="xxxxxxx"
GITHUB_SECRET="goibjvnrfjughjgfhjitfvbghui98uyfdfgtyhu"
STRIPE_API_KEY=sk_gudvkfhcnserdijglhjwierufhbnrsuisfghveriokdfjnwrsuijfnvbirsetjhgv
STRIPE_WEBHOOK_SECRET=whsec_dvolijrekdflgjvdpiolsfdsfviukyjhwdceujikhncrdwsiujhnkrdsunjh
```

なお、GitHub側の仕様の都合（ `GITHUB_*` が予約語）から、Actions Workflowsを使用する際、以下の通り読み替えてください。

```
GITHUB_ID: ${{ secrets.GH_OAUTH_ID }}
GITHUB_SECRET: ${{ secrets.GH_OAUTH_SECRET }}
```

にそれぞれ振り当てています。
