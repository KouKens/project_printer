# 本番デプロイ手順（Ubuntu Server）

構成は次のとおり。

```
/opt/toner/api        API 本体（NestJS のビルド済み）
/opt/toner/web        フロントのビルド済み静的ファイル
/etc/toner/api.env    DATABASE_URL など（0640 root:user）
```

ブラウザ → nginx（80） → 静的ファイル、`/api/` だけ 127.0.0.1:3000 の API へ。
PostgreSQL は同一サーバー。API は OS ユーザー `user` で動く。

PostgreSQL のロール名は `printer`、データベース名も `printer`。
ロール名は OS のユーザー名（`user`）とは別物で、TCP + パスワードで
接続するので一致している必要はない。

## 1. タイムゾーン

**最初にやること。** 日次の印刷枚数はローカル暦日で 1 日を区切るため、
UTC のままだと集計が朝 9 時区切りになり、対象日も 1 日ずれる。

```bash
sudo timedatectl set-timezone Asia/Tokyo
timedatectl   # Time zone: Asia/Tokyo (JST, +0900) を確認
```

systemd ユニット側にも `Environment=TZ=Asia/Tokyo` を入れてあるので、
サーバー全体を JST にしたくない場合はそちらだけでも動く。

## 2. 必要なパッケージ

```bash
sudo apt update
sudo apt install -y nginx postgresql
```

Node.js は 22 以降を入れる（`@types/node` が 24 系、target は ES2023）。

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
```

## 3. 実行ユーザーと配置先

既存の `user` アカウントで動かす。存在と、同名グループがあることを確認する。

```bash
id user   # uid=1000(user) gid=1000(user) ... のように出れば OK
```

グループが違う場合は `toner-api.service` の `Group=` を実際の値に合わせる。

```bash
sudo install -d -o user -g user /opt/toner /opt/toner/api /opt/toner/web
```

## 4. データベース

ロール名とデータベース名はどちらも `printer`。

```bash
sudo -u postgres psql <<'SQL'
CREATE USER printer WITH PASSWORD 'ここにパスワード';
CREATE DATABASE printer OWNER printer;
SQL
```

## 5. 環境変数

```bash
sudo install -d -m 0750 -o root -g user /etc/toner
sudo install -m 0640 -o root -g user deploy/api.env.example /etc/toner/api.env
sudo nano /etc/toner/api.env   # パスワードを実際の値に
```

`HOST=127.0.0.1` は消さないこと。消すと 3000 番が LAN に直接見える。

## 6. ビルドと配置

ビルドは手元でもサーバー上でもよい。サーバー上でやる場合:

```bash
# API
cd toner-api
npm ci
npx prisma generate
npm run build
sudo cp -r dist node_modules package.json /opt/toner/api/
sudo chown -R user:user /opt/toner/api

# フロント
cd ../printer_manager
npm ci
npm run build
sudo cp -r dist/* /opt/toner/web/
sudo chown -R user:user /opt/toner/web
```

## 7. マイグレーション

本番では `migrate dev` を使わない。対話がなく、スキーマドリフト時に
リセットを提案してこない `migrate deploy` を使う。

```bash
cd toner-api
sudo -u user env $(grep -v '^#' /etc/toner/api.env | xargs) npx prisma migrate deploy
```

## 8. サービス登録

```bash
sudo cp deploy/toner-api.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now toner-api
systemctl status toner-api
journalctl -u toner-api -f
```

## 9. nginx

```bash
sudo cp deploy/nginx-toner.conf /etc/nginx/sites-available/toner
sudo nano /etc/nginx/sites-available/toner   # server_name を実際のホスト名に
sudo ln -s /etc/nginx/sites-available/toner /etc/nginx/sites-enabled/toner
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```

## 10. 動作確認

```bash
# API がループバックだけで待っているか（127.0.0.1:3000 のみ、0.0.0.0 でない）
sudo ss -lntp | grep 3000

# nginx 経由で届くか
curl http://localhost/api/printers

# プリンターに SNMP が通るか（UDP/161 の外向きが開いている必要がある）
snmpget -v 1 -c public <プリンターのIP> 1.3.6.1.2.1.1.5.0
```

ブラウザでホスト名を開き、「機器」タブにプリンターが出れば完了。

## 日次集計について

`@Cron('0 12 * * *')` で毎日 12 時（JST）に 2 つ走る。
**印刷枚数の記録**（`page-counts.service.ts`）と
**全機器の残量の取り直し**（`printers.service.ts` の `pollScheduled`）。
**API プロセスが動いている必要がある**が、systemd で `Restart=always` に
してあるので通常は問題ない。

12 時に読むので、1 日分は前日 12 時から当日 12 時までの区切りになる。
記録する日付は読んだ日。

SATO のラベルプリンター（レスプリ）の状態取得は ENQ を使うため、
**定期実行には入っていない**。画面から手動で読む。

サーバー再起動などで取りこぼした場合、次に走ったときの差分は複数日分になり、
`spanDays` に日数が入る（1 なら純粋に 1 日分）。手動で走らせるには:

```bash
curl -X POST http://localhost/api/printers/page-counts/capture
```

記録の確認:

```bash
curl "http://localhost/api/printers/1/page-counts?days=30"
```

## 更新するとき

```bash
cd toner-api && npm ci && npx prisma generate && npm run build
sudo systemctl stop toner-api
sudo cp -r dist node_modules package.json /opt/toner/api/
sudo -u user env $(grep -v '^#' /etc/toner/api.env | xargs) npx prisma migrate deploy
sudo chown -R user:user /opt/toner/api
sudo systemctl start toner-api
```

## root で動かす場合

勧めないが、`toner-api.service` の `User=` / `Group=` を `root` にして
`daemon-reload` すれば動く。その場合 `/etc/toner/api.env` の所有も
`root:root 0600` に変えること。
