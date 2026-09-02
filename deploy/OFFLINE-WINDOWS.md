# 本番移行手順（Windows・インターネット無し）

本番機に Node.js も PostgreSQL も入っておらず、インターネットにも繋がらない
前提の手順。**必要なものは全て USB などで持ち込む。**

もう一方の [README.md](README.md) は Ubuntu ＋ インターネットありの構成なので、
そちらとは別物として読むこと。

## この構成の要点

```
本番機（1 台だけ）
  Node.js ── toner-api（dist/main.js）── PostgreSQL
                  ↓ 同じプロセスが
              画面（printer_manager の dist）も配る
  ブラウザ → http://<本番機>:3000/
```

**nginx も IIS も使わない。** API のプロセスが画面の静的ファイルも配る
（`WEB_ROOT` を指定したときだけ有効になる。`toner-api/src/main.ts` の `serveWeb`）。
API は `/api` の下に居るので、残りの URL を画面に回してもぶつからない。
追加のパッケージは要らず、オフラインで入れるソフトが 2 つで済む。

同じ機械に全部載るので `HOST` は指定しない（LAN の他の端末から見るため）。
外に出したくない場合だけ `HOST=127.0.0.1` にする。

---

## 1. 持ち込むもの

### インストーラ 2 つ（インターネットのある端末で入手）

| もの | 入手先 | 備考 |
|---|---|---|
| Node.js **v24 系** の Windows インストーラ（`.msi`・**x64**） | nodejs.org | 開発端末は v24.14.0。**同じ系列にする** |
| PostgreSQL **18 系** の Windows インストーラ（`.exe`） | EDB | 開発端末は 18.4 |

Node は 22 以降なら動くが、`node_modules` を開発端末からそのまま運ぶので、
**メジャーバージョンは揃えること**。

Node.js の対応は **Windows 10 以上・x64 は Tier 1**（公式の BUILDING.md）。
Windows 10 Pro (64bit) なら問題ない。32bit 版は Experimental 扱いなので、
念のため本番機が 64bit か確認しておく。

```powershell
[Environment]::Is64BitOperatingSystem   # True であること
```

### アプリ一式

開発端末で `deploy/bundle-offline.ps1` を実行すると `deploy/out/` に作られる（後述）。

---

## 2. 配布物を作る（開発端末で）

```powershell
powershell -ExecutionPolicy Bypass -File deploy\bundle-offline.ps1
```

`deploy\out\` に次の形で出力される。これを丸ごと USB へ。

```
out\
  app\
    dist\             API のビルド結果
    node_modules\     依存一式（開発用も含む。prisma CLI が要るため）
    prisma\           schema と migrations（36 本の SQL）
    package.json
    web\              画面のビルド結果
    api.env           環境変数のひな形（パスワードは本番で入れる）
    start.cmd         起動用
  data\
    printer.dump      開発 DB の中身（--with-data を付けたときだけ）
```

**`node_modules` はそのまま運ぶ。** 本番で `npm install` はできない。
この構成が成り立つのは、実行時に必要なものが全て純 JavaScript だから
（Prisma はドライバアダプタ方式でネイティブエンジンを使わず、pg・net-snmp も JS）。
**開発端末と本番機の OS が同じであることが前提。**

---

## 3. 本番機での作業

### 3-1. タイムゾーン

**最初に確認する。** 日次の集計はローカル暦日で 1 日を区切るので、
ここがずれると対象日が 1 日ずれる。

```powershell
tzutil /g          # Tokyo Standard Time であること
tzutil /s "Tokyo Standard Time"   # 違っていたら
```

### 3-2. Node.js と PostgreSQL を入れる

持ち込んだインストーラを実行する。PostgreSQL は途中で
**postgres ユーザーのパスワード**を聞かれるので控えておく。
ポートは既定の 5432、ロケールは既定のままでよい。

入ったことを確認する。

```powershell
node -v      # v24.x
psql --version
```

`psql` が見つからない場合は `C:\Program Files\PostgreSQL\18\bin` を PATH に足す。

### 3-3. 置き場所

```powershell
mkdir C:\toner
xcopy /E /I /Y <USB>\out\app C:\toner\app
```

### 3-4. データベースを作る

ロール名・データベース名ともに `printer`。

```powershell
$env:PGPASSWORD = "<インストール時に決めた postgres のパスワード>"
psql -U postgres -h localhost -c "CREATE USER printer WITH PASSWORD 'ここにパスワード';"
psql -U postgres -h localhost -c "CREATE DATABASE printer OWNER printer;"
```

### 3-5. 環境変数

`C:\toner\app\api.env` を開き、`CHANGE_ME` を実際のパスワードに書き換える。

```
DATABASE_URL=postgresql://printer:CHANGE_ME@localhost:5432/printer?schema=public
PORT=3000
WEB_ROOT=C:\toner\app\web
TZ=Asia/Tokyo
```

**値を引用符で囲まないこと。** `start.cmd` は `set "A=B"` で読み込むので、
`"..."` を付けると引用符ごと値に入り、接続文字列が壊れる。

`api.env` と `start.cmd` は **ASCII だけで書いてある**。cmd.exe が読むファイルに
日本語を入れると、実行時のコードページ次第でコメント行がコマンドとして
解釈され、起動しなくなるため。書き換えるときも日本語を足さないこと。

### 3-6. テーブルを作る

**本番では `migrate dev` を使わない。** 対話が無く、勝手にリセットを
提案してこない `migrate deploy` を使う。

```powershell
cd C:\toner\app
$env:DATABASE_URL = "postgresql://printer:...@localhost:5432/printer?schema=public"
node node_modules\prisma\build\index.js migrate deploy
```

`36 migrations found` → `All migrations have been successfully applied.` と出れば成功。

> `npx` は使わない（インターネットに取りに行こうとするため）。
> 上のように `node_modules` の中の prisma を直接叩く。

### 3-7. 開発 DB のデータを移す

```powershell
$env:PGPASSWORD = "printer のパスワード"
psql -U printer -h localhost -d printer -f <USB>\data\printer.dump
```

`-WithData` で作ったダンプはスキーマを含まない**データだけ**なので、
**3-6 のマイグレーションを先に済ませておくこと。**

ダンプには次の対処を入れてある（どちらも入れないと失敗する）。

- 接続文字列から `?schema=public` を落としている。Prisma 独自の指定で、
  pg_dump は不明なパラメータとして弾く
- `_prisma_migrations` を除いている。`migrate deploy` が本番側で書く表なので、
  一緒に流すと主キーが重複する

採番（シーケンス）はダンプに含まれるので、復元後にそのまま新規登録できる。

**検証済み。** 空の DB に対して 3-6 → 3-7 を実施し、10 テーブルすべての件数が
開発 DB と一致すること、復元後の新規登録で ID が衝突しないことを確認している。

### 3-8. 起動を確認する

```powershell
cd C:\toner\app
.\start.cmd
```

ブラウザで `http://localhost:3000/` を開き、画面が出れば成功。
他の端末からは `http://<本番機のIP>:3000/`。

Windows Defender ファイアウォールで 3000 番の受信を許可する。

```powershell
New-NetFirewallRule -DisplayName "toner-api" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
```

---

## 4. 自動起動にする

`start.cmd` を手で叩くのは確認までにして、常用はタスクスケジューラに登録する。

```powershell
$action  = New-ScheduledTaskAction -Execute "C:\toner\app\start.cmd"
$trigger = New-ScheduledTaskTrigger -AtStartup
$set     = New-ScheduledTaskSettingsSet -RestartCount 3 -RestartInterval (New-TimeSpan -Minutes 1) -ExecutionTimeLimit 0
Register-ScheduledTask -TaskName "toner-api" -Action $action -Trigger $trigger `
  -Settings $set -User "SYSTEM" -RunLevel Highest
Start-ScheduledTask -TaskName "toner-api"
```

`-ExecutionTimeLimit 0` を外すと 3 日で勝手に止められるので消さないこと。

---

## 5. 定期実行について

アプリの中に**毎日 12 時の処理が 2 つ**ある（印刷枚数の記録／全機器の残量の取り直し）。
プロセスが動いていれば自動で走るので、**常時起動ならこのままでよい**。
4 章のタスクは `-AtStartup` なので、再起動しても自動で上がる。

保守などで 12 時に落ちていた場合は、後から手で叩ける。

```powershell
# 枚数の記録
curl.exe -X POST http://localhost:3000/api/printers/page-counts/capture
# 残量の取り直し
curl.exe -X POST http://localhost:3000/api/printers/poll
```

取りこぼしても次に走ったときに複数日分としてまとまる（`spanDays` に日数が入る）。

**ラベルプリンター（SATO レスプリ）の状態取得は手動のみ**で、定期実行には
入っていない。画面の「状態を読む」から読む。

---

## 6. 動作確認

```powershell
# API
curl.exe http://localhost:3000/api/printers

# プリンターへ SNMP が通るか（本番機から届く必要がある）
# ※ 開発端末では 192.168.x 系に経路が無かった。本番機の設置場所で要確認
```

画面で次を確認する。

- 「プリンター状況」に台帳が並び、応答した機器に累計や残量が出る
- 「持出/廃棄」で在庫が引ける
- 12 時を過ぎた翌日に「印刷状況」へ前日分が増えている

---

## 7. 更新するとき（本番に既にデータがある場合）

開発端末で 2 を作り直す。**`-WithData` は付けない。**
付けて作った `data\printer.dump` を本番へ流すと、本番の入力済みデータの上に
開発のデータが重なり、ID も衝突する。更新のときにダンプは一切使わない。

本番機で次を行う。

打つものだけを 1 枚にしたものが [UPDATE-COMMANDS.md](UPDATE-COMMANDS.md) にある
（配布物にも入るので、本番機では USB の中のそれを見ればよい）。

```powershell
# 7-0. 先に置く。**このウィンドウを閉じたら消える**
$env:PGPASSWORD   = "printer のパスワード"
$env:DATABASE_URL = "postgresql://printer:同じパスワード@localhost:5432/printer?schema=public"

# 7-1. 現在地の確認（何本適用済みか）
cd C:\toner\app
node node_modules\prisma\build\index.js migrate status

# 7-2. バックアップ（戻せるようにしてから触る）
pg_dump -U printer -h localhost -Fc -f C:\toner\backup_$(Get-Date -f yyyyMMdd_HHmm).dump printer

# 7-3. 停止
Stop-ScheduledTask -TaskName "toner-api"

# 7-4. 差し替え（api.env は上書きしない）
xcopy /E /I /Y <USB>\out\app\dist         C:\toner\app\dist
xcopy /E /I /Y <USB>\out\app\web          C:\toner\app\web
xcopy /E /I /Y <USB>\out\app\node_modules C:\toner\app\node_modules
xcopy /E /I /Y <USB>\out\app\prisma       C:\toner\app\prisma
Copy-Item <USB>\out\app\package.json, <USB>\out\app\prisma.config.ts C:\toner\app\ -Force

# 7-5. 差分だけ適用（reset は絶対にしない）
node node_modules\prisma\build\index.js migrate deploy

# 7-6. 起動
Start-ScheduledTask -TaskName "toner-api"
```

**7-0 を飛ばさないこと。** `migrate deploy` の接続先は `prisma.config.ts` の
`process.env["DATABASE_URL"]` から来る。本番の `C:\toner\app` に `.env` は無く、
`api.env` は `start.cmd` しか読まないので、シェルで入れないと
`The datasource.url property is required in your Prisma config file` で止まる。

**7-4 で `copy /Y` と書かないこと。** PowerShell では `copy` が `Copy-Item` の
別名なので、`/Y` が引数として渡り `A positional parameter cannot be found` で
落ちる。`Copy-Item -Force` を使う（`xcopy` は実行ファイルなのでそのままでよい）。

`prisma\` を忘れると新しい migration の SQL が本番に無く、`migrate deploy` が
「適用済み」と誤解したまま古いスキーマで新しい `dist` が動く。必ず一緒に運ぶ。

`migrate deploy` は未適用のものを順に足すだけで、既存の行には触らない。
`migrate dev` / `migrate reset` は本番で使わない（リセットを提案してくる）。

### 更新前に確認すること — 保守業者の列

`20260820050000_maint_vendors` は `printer_assets` の `maint_phones` と
`maint_vendor` を **DROP** する。本番がこれより古く、その 2 列に入力があると
消える。7-1 の結果にこの migration が未適用で出たら、先に退避する。

```powershell
psql -U printer -h localhost -d printer -c "\copy (SELECT id, maint_vendor, maint_phones FROM printer_assets WHERE maint_vendor IS NOT NULL) TO 'C:\toner\maint_vendor_backup.csv' CSV HEADER"
```

適用後は「保守業者」画面で業者を登録し、台帳の業者を選び直す
（`maint_vendor_id` での参照に変わったため）。件数が少なければ画面から入れ直すのが早い。

### 切り戻し

`dist` / `web` / `node_modules` / `prisma` を旧版に戻し、DB は 7-2 のダンプから復元する。

```powershell
Stop-ScheduledTask -TaskName "toner-api"
psql -U postgres -h localhost -c "DROP DATABASE printer;"
psql -U postgres -h localhost -c "CREATE DATABASE printer OWNER printer;"
pg_restore -U printer -h localhost -d printer C:\toner\backup_....dump
```

スキーマだけ戻して古い `dist` を新しい DB に当てるのは不可（列が合わない）。
DB とアプリは必ず同じ世代に揃える。

---

## Ubuntu にする場合の違い

`node_modules` は**そのままでは運べない**。Windows で入れたものには
Windows 用のバイナリが混じるため、Linux 上で入れ直す必要がある。
オフラインだと次のどちらかになる。

- インターネットのある Linux 機で `npm ci` して `node_modules` ごと運ぶ
- `npm cache` を持ち込んで `npm ci --offline`

PostgreSQL と Node.js も `.deb` を依存ごと集めて持ち込むことになる
（`apt-get download` や `apt-offline`）。
**手間は Windows のほうが明らかに少ない。**

Linux で行く場合は [README.md](README.md) の nginx + systemd の構成が使えるが、
2 章のインストール部分だけオフライン用に読み替えること。
