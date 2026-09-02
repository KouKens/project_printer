# 本番更新チェックリスト（旧版が稼働中・データ有り）

本番機で既にこのシステムが動いていて、DB に入力済みのデータがある状態からの更新手順。
初回導入は [OFFLINE-WINDOWS.md](OFFLINE-WINDOWS.md)、Ubuntu 構成は [README.md](README.md)。

**このチェックリストは「調べる」段階まで。実際に本番へ書き込むのは
[OFFLINE-WINDOWS.md](OFFLINE-WINDOWS.md) の §7 で、A-3 の結果を見てから着手する。**

---

## 前提（開発端末側で確認済み・2026-09-02）

- `schema.prisma` / `migrations/` / 開発 DB の 3 つは一致（`migrate diff` で差分なし）
- 開発側の migration は **40 本**
- 破壊的な migration は **2 本**
  - `20260820050000_maint_vendors` → `printer_assets` の `maint_phones` / `maint_vendor` を DROP
  - `20260902010000_page_count_function_color_matrix` → `page_count_daily` の
    `total_print` / `total_copy` / `total_scan` と `print_pages` / `copy_pages` / `scan_pages`
    を DROP。**退避は不要。** これらは RICOH の拡張 MIB から誤った ID
    （A3 未満の総枚数と両面印字の面数）を読んでいた列で、残しても使えない。
    枚数そのもの（`total` / `total_mono` / `total_color`）は消えない
- `20260902060000_disable_instead_of_delete` は列の追加だけ（破壊的ではない）。
  `toners` と `printer_assets` に `disabled_at` が付き、既存の行は全て有効で入る

---

## A. 本番機で調べる（変更はしない）

A-1 〜 A-4 は [check-prod.ps1](check-prod.ps1) にまとめてある。USB で本番機へ持ち込み、
これ 1 本を流せば全部出る（読み取りのみ・DB は変更しない）。

```powershell
powershell -ExecutionPolicy Bypass -File check-prod.ps1
```

スクリプトの隣に `check-prod_<日時>.txt` が出るので、それを開発端末へ持ち帰る。
手で打つ場合は以下。

### A-1. 稼働状況

```powershell
Get-ScheduledTask -TaskName "toner-api"
curl.exe http://localhost:3000/api/printers
```

- [ ] タスクが動いているか
- [ ] 画面が今どこまで使われているか（機器・在庫・修理履歴のどれに入力があるか）

### A-2. バージョンの確認

```powershell
cd C:\toner\app
node node_modules\prisma\build\index.js migrate status
```

控えること。

- [ ] `N migrations found` の **N** = ______ 本（開発側は 40 本）
- [ ] 未適用として並んだ migration 名（または `up to date`）

`node` の場所が違う・上が動かない場合はこちらでも分かる。

```powershell
psql -U printer -h localhost -d printer -c "SELECT migration_name FROM _prisma_migrations ORDER BY finished_at DESC LIMIT 5;"
```

### A-3. 保守業者の列（分岐の判断）

A-2 の未適用一覧に `20260820050000_maint_vendors` が **出るかどうか**で分かれる。

- [ ] 出ない（適用済み） → 退避は不要。B へ
- [ ] 出る（未適用） → この migration が `printer_assets` の
      `maint_phones` と `maint_vendor` を **DROP** する。中身を確認する

```powershell
psql -U printer -h localhost -d printer -c "SELECT count(*) FROM printer_assets WHERE maint_vendor IS NOT NULL;"
```

0 件なら退避不要。1 件以上なら CSV へ退避しておく。

```powershell
psql -U printer -h localhost -d printer -c "\copy (SELECT id, maint_vendor, maint_phones FROM printer_assets WHERE maint_vendor IS NOT NULL) TO 'C:\toner\maint_vendor_backup.csv' CSV HEADER"
```

- [ ] 退避した件数 = ______ 件
      （更新後に「保守業者」画面で登録し直し、台帳から選び直す）

### A-4. 環境の確認

```powershell
node -v                # 開発端末と同じメジャー（v24 系）か
tzutil /g              # Tokyo Standard Time か
psql --version
Get-ChildItem C:\toner\app   # dist / web / node_modules / prisma / api.env が揃っているか
```

- [ ] Node のメジャーバージョンが開発端末と一致（`node_modules` をそのまま運ぶため）
- [ ] `prisma\` フォルダが本番に存在する（無ければ今回から必ず運ぶ）
- [ ] 空き容量（`node_modules` の差し替え分）

---

## B. 開発端末で準備する

### B-1. 変更を確定させる

未コミットの変更が多いので、配布物を作る前に整理する。

```powershell
cd toner-api ; npx tsc --noEmit ; npm run build
cd ..\printer_manager ; npx tsc --noEmit ; npm run build
```

- [ ] 型チェックが通る
- [ ] 両方ビルドが通る
- [ ] コミットした（migration を含む。本番へ運ぶ実体そのもの）

### B-2. 配布物を作る

**`-WithData` は付けない。** 付けて出る `data\printer.dump` を本番へ流すと、
入力済みデータの上に開発データが重なり ID も衝突する。更新時にダンプは使わない。

```powershell
powershell -ExecutionPolicy Bypass -File deploy\bundle-offline.ps1
```

- [ ] `deploy\out\app\` に `dist` / `web` / `node_modules` / `prisma` / `package.json`
      / `prisma.config.ts` が揃っている
- [ ] `deploy\out\data\` が **無い**（= データを含んでいない）
- [ ] USB へコピーした

---

## C. 本番へ適用する前の最終確認

- [ ] A-2 の本数と、B-2 の `prisma\migrations` の本数（40）の差＝今回入る変更の数を把握した
- [ ] A-3 の分岐を判断した（退避の要否）
- [ ] 更新後、1 日分の機能別（プリンター・コピー）は**次の取得から**入ることを伝えた
      （累計の差で出すので、更新した当日は累計だけが埋まる）
- [ ] 業務時間外か、入力が走らない時間帯を選んだ
- [ ] `pg_dump -Fc` のバックアップ先と空き容量を決めた
- [ ] 切り戻し手順を読んだ（[OFFLINE-WINDOWS.md](OFFLINE-WINDOWS.md) §7 の末尾）

ここまで済んだら [OFFLINE-WINDOWS.md](OFFLINE-WINDOWS.md) の §7 へ。

---

## やらないこと

- `prisma migrate dev` / `migrate reset` を本番で打つ（リセットを提案してくる）
- `printer.dump` を本番へ流す（既存データが壊れる）
- `api.env` を上書きする（パスワードが入っている）
- `prisma\` を運ばずに `dist` だけ差し替える（古いスキーマの上で新しいコードが動く）
