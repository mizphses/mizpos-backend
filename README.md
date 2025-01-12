# mizpos-backend

[![CI](https://github.com/mizphses/mizpos-backend/actions/workflows/ci.yml/badge.svg)](https://github.com/mizphses/mizpos-backend/actions/workflows/ci.yml)
[![Deploy & Release](https://github.com/mizphses/mizpos-backend/actions/workflows/deploy.yml/badge.svg)](https://github.com/mizphses/mizpos-backend/actions/workflows/deploy.yml)

いい感じのヘッドレスECシステム。

コアなところとしては、Cloudflare Worker + D1 + Prisma + Honoで動くよ。（Stripeとかeslintとかも入ってるけど）

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

## Deploy

以下の環境変数を設定して、Deploy & Releaseを回してください。

なお、GitHub側の仕様の都合（ `GITHUB_*` が予約語）から、読み替えています。

```sh
TOKEN_KEY="w9P4xezts1y93GTSMb0e9Jzxq2mycGcZHNYteccc4cC43WW75B8uHx+K3GSAZ2JB"
SALT="ynq/ak7eNfby27NYewrjXLi8cwEY8POvEMkxzJGRAJb7lBs7Gb+fkorcaaXIryQ3"
JWT_SECRET="nLTS0laXc+LNjoH61x/uVpXLSD1Pj1HqN+QyyHyX/AJHbjNGzw6n/HYDZFDwILBt"
GOOGLE_ID="hogehoge-hogehoge.apps.googleusercontent.com"
GOOGLE_SECRET="HOGEHOGE-SECRET"
GH_OAUTH_ID="xxxxxxx"
GH_OAUTH_SECRET="goibjvnrfjughjgfhjitfvbghui98uyfdfgtyhu"
STRIPE_API_KEY=sk_gudvkfhcnserdijglhjwierufhbnrsuisfghveriokdfjnwrsuijfnvbirsetjhgv
STRIPE_WEBHOOK_SECRET=whsec_dvolijrekdflgjvdpiolsfdsfviukyjhwdceujikhncrdwsiujhnkrdsunjh
CLOUDFLARE_API_TOKEN=hogehoge
CLOUDFLARE_ACCOUNT_ID=fugafuga
```

(メモ)

Cloudflareのトークンは、ダッシュボードから「Workersを編集」で作成されるものに、D1の編集権限を付与したものを使用してください。

## 問い合わせ
mizphses@gmail.com または Issue上で。

ISCライセンスで提供しています。As isです。返事も保証しません。