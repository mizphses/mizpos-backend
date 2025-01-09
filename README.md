# mizpos

いい感じのヘッドレスECサイト

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
※ それぞれ適宜、openssl randで生成したりGoogle Consoleからもらってきてください

```sh
TOKEN_KEY="w9P4xezts1y93GTSMb0e9Jzxq2mycGcZHNYteccc4cC43WW75B8uHx+K3GSAZ2JB"
SALT="ynq/ak7eNfby27NYewrjXLi8cwEY8POvEMkxzJGRAJb7lBs7Gb+fkorcaaXIryQ3"
JWT_SECRET="nLTS0laXc+LNjoH61x/uVpXLSD1Pj1HqN+QyyHyX/AJHbjNGzw6n/HYDZFDwILBt"
GOOGLE_ID="hogehoge-hogehoge.apps.googleusercontent.com"
GOOGLE_SECRET="HOGEHOGE-SECRET"
```
