# 更新コマンド 1 枚

本番機に既にこのシステムが動いていて、データがある状態からの更新。
上から順に打つ。**PowerShell で開く**（cmd.exe ではない）。

背景と判断が要る部分は [UPGRADE-CHECKLIST.md](UPGRADE-CHECKLIST.md) と
[OFFLINE-WINDOWS.md](OFFLINE-WINDOWS.md) の §7 にある。ここは打つものだけ。

初回導入はこの紙ではなく [OFFLINE-WINDOWS.md](OFFLINE-WINDOWS.md) の 1〜6 章へ。

---

## 0. この 5 つを先に置く

以降のコマンドが全部これを使う。**ウィンドウを閉じたら消えるので、
開き直したらここからやり直すこと。**

```powershell
$APP = 'C:\Printer Manager\app'        # 本番のインストール先。空白が入るので必ず変数で扱う
$USB = 'E:\out'                        # USB の配布物の根。ドライブ文字は差し込んで確認する
$SRC = "$USB\app"                      # 差し替えるファイル一式はこの下
$env:PGPASSWORD  = 'printer のパスワード'
$env:DATABASE_URL = 'postgresql://printer:同じパスワード@localhost:5432/printer?schema=public'
```

**手順書と SQL は `$USB` の直下、差し替えるものは `$SRC`（= `$USB\app`）の下。**
1 つ下にあると思って `$SRC\assign-sites.sql` と打つと見つからない。

**`$APP` にはフォルダ名の空白が入る**（`Printer Manager`）。以降のコマンドで
`$APP` を裸で書かず `"$APP\dist"` のように引用符で囲むのはこのため。
2026-09-05 時点の本番は `C:\Printer Manager\app`。別の機械へ入れるときはここだけ変える。

`DATABASE_URL` は `migrate deploy` に要る。**本番には `.env` が無く、
`api.env` は `start.cmd` しか読まない**ので、ここで手で入れる。
入れ忘れると `The datasource.url property is required in your Prisma config file`
で止まる。

`psql` が見つからない場合は PATH に足す。**バージョンの番号は機械によって違う**ので、
決め打ちせず実際に入っているものを見る。

```powershell
Get-ChildItem 'C:\Program Files\PostgreSQL','C:\Program Files (x86)\PostgreSQL' -Recurse -Filter psql.exe -ErrorAction SilentlyContinue | Select-Object -ExpandProperty FullName
```

```powershell
$env:Path += ';C:\Program Files\PostgreSQL\18\bin'   # 上で出た bin に合わせる
```

---

## 1. 調べる（変更しない）

```powershell
powershell -ExecutionPolicy Bypass -File "$USB\check-prod.ps1"
```

これ 1 本で稼働状況・migration の本数・環境が出る。隣に
`check-prod_<日時>.txt` が残るので持ち帰る。個別に見るなら以下。

```powershell
cd $APP
node node_modules\prisma\build\index.js migrate status
```

`N migrations found` の N を控える。**配布物は 42 本。**本番の N で今回の中身が決まる。

| 本番の N | 今回入る migration | 後で流す SQL |
| --- | --- | --- |
| 41 | `20260907000000_toner_stock_non_negative` の 1 本 | §5-3 |
| 40 | 上に `20260903020000_add_company` が加わり 2 本 | §5-2 → §5-3 |

**`migrate deploy` が止まるとしたら `toner_stock_non_negative`。**在庫の数に CHECK を
足すので、既存の行が引っかかると `ALTER TABLE` が落ちる。**先に見ておく**
（0 件なら止まらない。出たら §5 の対処を読んでから始める）。

```powershell
psql -U printer -h localhost -d printer -c "SELECT count(*) FROM toner_stocks WHERE quantity < 0 OR received < 0 OR disposed < 0 OR disposed > received;"
```

---

## 2. バックアップ

**消えるデータが小さくても省略しない。** 切り戻しの前提になる。

```powershell
pg_dump -U printer -h localhost -Fc -f "$(Split-Path $APP)\backup_$(Get-Date -f yyyyMMdd_HHmm).dump" printer
```

出来たことを確かめる（0 バイトなら失敗している）。

```powershell
Get-ChildItem "$(Split-Path $APP)\backup_*.dump" | Sort-Object LastWriteTime | Select-Object -Last 1 Name, Length, LastWriteTime
```

---

## 3. 止める

**この本番はタスクにもサービスにも登録していない。** `start.cmd` を手で叩いて
動かしており、`node dist\main.js` がそのウィンドウの中で動いたままになる。
止め方は「そのウィンドウを閉じる（または Ctrl+C）」。

動いていないことを確かめる。**両方とも何も出なければ止まっている。**

```powershell
Get-Process node -ErrorAction SilentlyContinue | Select-Object Id, Path; Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue
```

ウィンドウが見当たらないのに `node` が残っている場合だけ、プロセスを落とす。

```powershell
Get-Process node | Where-Object { $_.Path -like "$APP*" } | Stop-Process
```

**`Stop-Process -Name node` と書かないこと。** 関係のない Node を巻き込む。

---

## 4. 差し替える

**`api.env` は上書きしない。** パスワードが入っている。

```powershell
xcopy /E /I /Y "$SRC\dist"         "$APP\dist"
```

```powershell
xcopy /E /I /Y "$SRC\web"          "$APP\web"
```

```powershell
xcopy /E /I /Y "$SRC\node_modules" "$APP\node_modules"
```

```powershell
xcopy /E /I /Y "$SRC\prisma"       "$APP\prisma"
```

```powershell
Copy-Item "$SRC\package.json", "$SRC\prisma.config.ts" "$APP\" -Force
```

**`copy /Y` と書かないこと。** PowerShell では `copy` が `Copy-Item` の別名なので、
`/Y` が引数として渡り `A positional parameter cannot be found` で落ちる。
`Copy-Item -Force` を使う。

`prisma\` を忘れると新しい migration の SQL が本番に無く、`migrate deploy` が
「適用済み」と誤解したまま古いスキーマで新しい `dist` が動く。必ず一緒に運ぶ。

運べたか確かめる。

```powershell
(Get-ChildItem "$APP\prisma\migrations" -Directory).Count
```

**42 と出ること**（配布物の本数）。DB 側に何本入るかは §1 の表のとおり。

---

## 5. DB に差分だけ当てる

**`migrate dev` と `migrate reset` は絶対に打たない**（リセットを提案してくる）。

```powershell
cd $APP
node node_modules\prisma\build\index.js migrate deploy
```

`All migrations have been successfully applied.` が出れば成功。

```powershell
node node_modules\prisma\build\index.js migrate status
```

`42 migrations found` と `Database schema is up to date!` を確認する。

### `20260907000000_toner_stock_non_negative` で止まったとき

在庫の数に CHECK 制約を足すマイグレーション。**既存の行が引っかかると
`ALTER TABLE` が落ちて、そこで `migrate deploy` が止まる。**
該当行を探して直してから、もう一度 `migrate deploy` を打つ。

```powershell
node node_modules\prisma\build\index.js db execute --stdin
```

貼り付ける SQL（`Ctrl+Z` → `Enter` で終わり）。

```sql
SELECT * FROM toner_stocks
WHERE quantity < 0 OR received < 0 OR disposed < 0 OR disposed > received;
```

出てきた行は在庫と履歴が食い違っている。**数字を勝手に丸めず**、
棚を数えて棚卸しで合わせるか、どういう経緯でそうなったかを確かめること。

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
psql -U printer -h localhost -d printer -f "$USB\assign-sites.sql"
```

`INSERT 0 9` → `UPDATE`（台帳・在庫・履歴・注文）→ `DELETE 1` → `COMMIT` と並ぶ。
`DELETE 0` なら「既定の会社」に何かが残っている（振り分けから漏れた機器がある）。

振り分けの鍵は**台帳の部署名**で、どの条件にも当たらない機器は本院に残る。
結果を数えて確かめる。

```powershell
psql -U printer -h localhost -d printer -c "SELECT c.name, count(a.id) FROM companies c LEFT JOIN printer_assets a ON a.company_id = c.id GROUP BY c.name ORDER BY 2 DESC;"
```

**2026-09-05 に本番の部署名で事前に検算した結果**（台帳 80 台）。この通りになること。

| 拠点 | 台数 |
| --- | --- |
| 嶋田病院 | 68 |
| 大刀洗診療所 | 3 |
| シマダ在宅サービス | 3（ケアプランセンター・訪問看護・訪問介護） |
| いきいき介護プラザ / エミナス / シマダナーシングホームおごおり | 各 1 |
| シマリス小郡 / シマリス大刀洗 / シマリスみくに | 各 1 |

在庫 140 行・受付履歴 44 件・注文 13 件は**すべて嶋田病院**に入る。
**台数が合わない拠点があれば部署名の表記を確かめる**（CASE は部分一致）。

`-c` で打つ問い合わせの日本語が化けるときは、クライアント側の encoding を
コンソール（CP932）に合わせる。

```powershell
$env:PGCLIENTENCODING = 'SJIS'
```

**これを置いたままでも `assign-sites.sql` は安全。**ファイルの先頭で
`\encoding UTF8` を宣言してあるので、環境変数に引きずられない。
宣言が無いと UTF-8 のバイト列を SJIS と名乗って送ることになり、
**拠点名が文字化けしたまま入り、CASE も一致せず全機器が 1 拠点に寄る**
（エラーにならないので気づけない）。

---

## 5-3. 管理番号（No.）を 001 から振り直す（自動採番が今回入ったときだけ）

**No. は台帳の鍵として使う。**プリンター登録の画面から入力欄を外し、
新しく登録した台には API が自動で振るようにした（台帳全体の最大 + 1）。
本番の番号は 002・004・006…901・905 と**間が大きく空いている**ので、
**並びはそのままに 001 から詰め直す**。空欄の台もここで埋まる。

今の番号を先に見る。

```powershell
psql -U printer -h localhost -d printer -c "SELECT count(*) FILTER (WHERE no IS NULL OR btrim(no) = '') AS blank, min(no) AS lo, max(no) AS hi, count(*) AS total FROM printer_assets;"
```

**`lo` が 001 で `hi` が台数と同じなら済んでいる**ので飛ばす。

```powershell
psql -U printer -h localhost -d printer -f "$USB\renumber-asset-no.sql"
```

**最初に旧 → 新の対応表が出る。この出力を必ず残すこと**
（**現物に貼ってあるラベルとの対応が変わる**ので、貼り替えに要る）。
そのあと `BEGIN` → `UPDATE <台数>` → `COMMIT` と並び、最後に
**空欄 0・重複 0・最小 001・最大 = 台数** の 1 行が出る。

**何度流しても壊れない。**2 度目は既にこの並びなので `UPDATE 0`
（番号が変わらない行は更新しないので、更新日も動かない）。

**並べ替えの土台は今の番号の順。**印刷状況の「集計表用にコピー」は No. の昇順で
行を並べるので、土台を変えると貼り付け先の集計表と行がずれる。

**例外がファイル内の `place` に書いた 22 台。**番号を持たない台をそのまま詰めると
末尾にまとまってしまうので、**同じ部署の台の直後**へ差し込む。部署名が
「3階病棟」と「３階病棟」のように揺れていて機械的に結べないため、
入れ先を 1 台ずつ書き出してある（鍵は部署名 ＋ IP アドレス）。
**本番の台帳に別の部署名があれば、この表に足してから流すこと。**
表に無い台は今の番号の順のまま詰められる（末尾に回るだけで、壊れはしない）。

No. は外部キーではない（修理履歴もトナーの紐づけも台帳の id を指している）ので、
振り直しても記録は壊れない。

`assign-sites.sql` と同じくファイルの先頭で `\encoding UTF8` を宣言してあるので、
`PGCLIENTENCODING=SJIS` を置いたままでも化けない。

---

## 6. 起動する

タスク登録はしていないので `start.cmd` を叩く。**このウィンドウは開いたままにする**
（閉じると API も止まる）。

```powershell
Start-Process -FilePath "$APP\start.cmd" -WorkingDirectory $APP
```

立ち上がったことを確かめる。

```powershell
Get-NetTCPConnection -LocalPort 3000 -State Listen | Select-Object OwningProcess
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

API を止める（`start.cmd` のウィンドウを閉じる）。残っていたら落とす。

```powershell
Get-Process node | Where-Object { $_.Path -like "$APP*" } | Stop-Process
```

```powershell
psql -U postgres -h localhost -c "DROP DATABASE printer;"
```

```powershell
psql -U postgres -h localhost -c "CREATE DATABASE printer OWNER printer;"
```

```powershell
pg_restore -U printer -h localhost -d printer "$(Split-Path $APP)\backup_<日時>.dump"
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
