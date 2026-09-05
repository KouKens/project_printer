# 更新コマンド 1 枚

本番機に既にこのシステムが動いていて、データがある状態からの更新。
上から順に打つ。**PowerShell で開く**（cmd.exe ではない）。

背景と判断が要る部分は [UPGRADE-CHECKLIST.md](UPGRADE-CHECKLIST.md) と
[OFFLINE-WINDOWS.md](OFFLINE-WINDOWS.md) の §7 にある。ここは打つものだけ。

初回導入はこの紙ではなく [OFFLINE-WINDOWS.md](OFFLINE-WINDOWS.md) の 1〜6 章へ。

---

## 0. この 2 つを先に置く

以降のコマンドが全部これを使う。**ウィンドウを閉じたら消えるので、
開き直したらここからやり直すこと。**

```powershell
$SRC = 'E:\out\app'                    # USB の配布物。ドライブ文字は差し込んで確認する
$env:PGPASSWORD  = 'printer のパスワード'
$env:DATABASE_URL = 'postgresql://printer:同じパスワード@localhost:5432/printer?schema=public'
```

`DATABASE_URL` は `migrate deploy` に要る。**本番の `C:\toner\app` には `.env` が
無く、`api.env` は `start.cmd` しか読まない**ので、ここで手で入れる。
入れ忘れると `The datasource.url property is required in your Prisma config file`
で止まる。

`psql` が見つからない場合は PATH に足す。

```powershell
$env:Path += ';C:\Program Files\PostgreSQL\18\bin'
```

---

## 1. 調べる（変更しない）

```powershell
powershell -ExecutionPolicy Bypass -File <USB>\check-prod.ps1
```

これ 1 本で稼働状況・migration の本数・環境が出る。隣に
`check-prod_<日時>.txt` が残るので持ち帰る。個別に見るなら以下。

```powershell
cd C:\toner\app
node node_modules\prisma\build\index.js migrate status
```

`N migrations found` の N を控える。**配布物は 41 本。**

今回落とす列に値が入っているか（列が無いというエラーなら失うものはゼロ）。

```powershell
psql -U printer -h localhost -d printer -c "SELECT count(*) FILTER (WHERE total_print IS NOT NULL) AS print, count(*) FILTER (WHERE total_copy IS NOT NULL) AS copy, count(*) AS rows FROM page_count_daily;"
```

---

## 2. バックアップ

**消えるデータが小さくても省略しない。** 切り戻しの前提になる。

```powershell
pg_dump -U printer -h localhost -Fc -f C:\toner\backup_$(Get-Date -f yyyyMMdd_HHmm).dump printer
```

出来たことを確かめる（0 バイトなら失敗している）。

```powershell
Get-ChildItem C:\toner\backup_*.dump | Sort-Object LastWriteTime | Select-Object -Last 1 Name, Length, LastWriteTime
```

---

## 3. 止める

```powershell
Stop-ScheduledTask -TaskName "toner-api"
```

```powershell
Get-ScheduledTask -TaskName "toner-api" | Select-Object TaskName, State
```

`State` が `Ready` になっていること（`Running` のままなら止まっていない）。

---

## 4. 差し替える

**`api.env` は上書きしない。** パスワードが入っている。

```powershell
xcopy /E /I /Y "$SRC\dist"         C:\toner\app\dist
```

```powershell
xcopy /E /I /Y "$SRC\web"          C:\toner\app\web
```

```powershell
xcopy /E /I /Y "$SRC\node_modules" C:\toner\app\node_modules
```

```powershell
xcopy /E /I /Y "$SRC\prisma"       C:\toner\app\prisma
```

```powershell
Copy-Item "$SRC\package.json", "$SRC\prisma.config.ts" C:\toner\app\ -Force
```

**`copy /Y` と書かないこと。** PowerShell では `copy` が `Copy-Item` の別名なので、
`/Y` が引数として渡り `A positional parameter cannot be found` で落ちる。
`Copy-Item -Force` を使う。

`prisma\` を忘れると新しい migration の SQL が本番に無く、`migrate deploy` が
「適用済み」と誤解したまま古いスキーマで新しい `dist` が動く。必ず一緒に運ぶ。

運べたか確かめる。

```powershell
(Get-ChildItem C:\toner\app\prisma\migrations -Directory).Count
```

**41 と出ること。**

---

## 5. DB に差分だけ当てる

**`migrate dev` と `migrate reset` は絶対に打たない**（リセットを提案してくる）。

```powershell
cd C:\toner\app
node node_modules\prisma\build\index.js migrate deploy
```

`All migrations have been successfully applied.` が出れば成功。

```powershell
node node_modules\prisma\build\index.js migrate status
```

`41 migrations found` と `Database schema is up to date!` を確認する。

---

## 5-2. 拠点を振り分ける（`20260903020000_add_company` が今回入ったときだけ）

移行は**拠点を 1 つ（「既定の会社」）だけ作り、既存の機器・在庫・履歴・注文を
すべてそこに寄せる**。本院と各事業所へ分けるのは別の SQL で、**1 度だけ流す**。

今回の更新でこの移行が入ったかを確かめる。

```powershell
psql -U printer -h localhost -d printer -c "SELECT id, name FROM companies ORDER BY sort_order;"
```

**「既定の会社」1 行だけなら未振り分け。**9 拠点が並んでいれば済んでいるので飛ばす。

```powershell
psql -U printer -h localhost -d printer -f <USB>\assign-sites.sql
```

`INSERT 0 9` → `UPDATE`（台帳・在庫・履歴・注文）→ `DELETE 1` → `COMMIT` と並ぶ。
`DELETE 0` なら「既定の会社」に何かが残っている（振り分けから漏れた機器がある）。

振り分けの鍵は**台帳の部署名**で、どの条件にも当たらない機器は本院に残る。
結果を数えて確かめる。

```powershell
psql -U printer -h localhost -d printer -c "SELECT c.name, count(a.id) FROM companies c LEFT JOIN printer_assets a ON a.company_id = c.id GROUP BY c.name ORDER BY 2 DESC;"
```

開発 DB（機器 78 台）では 嶋田病院 66 / 大刀洗診療所 3 / シマダ在宅サービス 3 /
残り 6 拠点が各 1 台だった。**台数が合わない拠点があれば部署名の表記を確かめる**
（`assign-sites.sql` の CASE は部分一致）。

---

## 6. 起動する

```powershell
Start-ScheduledTask -TaskName "toner-api"
```

```powershell
Get-ScheduledTask -TaskName "toner-api" | Select-Object TaskName, State
```

---

## 7. 動作を確かめる

```powershell
curl.exe http://localhost:3000/api/printers
```

枚数を 1 回取り込む（定時の 12 時を待たない）。

```powershell
curl.exe -X POST http://localhost:3000/api/printers/page-counts/capture
```

`unreachable` の数を控える。**本番機から SNMP が届く台数**がここで分かる。
開発端末からは `192.168.x` の 11 IP に経路が無く 44 台どまりだった。

ブラウザで `http://localhost:3000/` を開き、「印刷状況」で次を確かめる。

- **累計 = 累計モノクロ + 累計カラー**（RICOH・Canon・モノクロ専用機）
- **累計 = 累計プリンター + 累計コピー**（RICOH・Canon）
- Canon 複合機に累計スキャナが出ている

崩れている行は備考欄に「累計モノクロ + 累計カラーが累計と合いません」と出る。
全行を目で追う必要はない。

**1 日分の機能別（プリンター・コピー）は翌日 12:00 の取得から入る。**
累計の差で出すので、更新した当日は累計だけが埋まる。異常ではない。

「プリンター登録」「トナー登録」の**削除ボタンが「無効」に変わっている**ことも見る。
無効にしたものは一覧の下の別枠に移り、「元に戻す」で戻せる。既存の登録はすべて有効。

---

## 切り戻し

`dist` / `web` / `node_modules` / `prisma` を旧版に戻したうえで、DB を 2 のダンプから戻す。
**DB とアプリは必ず同じ世代に揃える**（列が合わない）。

```powershell
Stop-ScheduledTask -TaskName "toner-api"
```

```powershell
psql -U postgres -h localhost -c "DROP DATABASE printer;"
```

```powershell
psql -U postgres -h localhost -c "CREATE DATABASE printer OWNER printer;"
```

```powershell
pg_restore -U printer -h localhost -d printer C:\toner\backup_<日時>.dump
```

---

## 打たないもの

| コマンド | 理由 |
|---|---|
| `prisma migrate dev` / `migrate reset` | 本番でリセットを提案してくる |
| `psql -f data\printer.dump` | 更新時にダンプは使わない。既存データの上に開発データが重なり ID も衝突する |
| `api.env` の上書き | パスワードが入っている |
| `npm install` | オフライン。`node_modules` は配布物ごと運ぶ |
| `copy /Y` | PowerShell では `Copy-Item` の別名。`/Y` で落ちる |
