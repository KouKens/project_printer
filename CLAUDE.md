# CLAUDE.md

トナー・プリンター管理システム。`toner-api`（NestJS + Prisma + PostgreSQL）と
`printer_manager`（React + Vite）の 2 つで構成する。

## 許可を求めずに実行してよいこと

**ここは全て開発環境。DB の変更・作り直しを含め、確認なしで実行してよい。**
`.claude/settings.json` で Bash / PowerShell / ファイル編集をすべて許可済みで、
プロンプトは出ない。以下は「よく使うもの」であって、制限の一覧ではない。
終わったら結果だけ報告すること。

**検証系** — 変更したら都度かけてよい。

```
npx tsc --noEmit          型チェック
npx eslint <path>         Lint（--fix 込み。src/generated は対象外）
npx jest / npm test       テスト
npm run build             ビルド
```

**Prisma** — スキーマを変えたら `migrate dev` と `generate` まで通してよい。
開発用 DB なので `migrate reset` によるリセットや、データの投入・削除もしてよい。
生成物 `src/generated/prisma` はコミット対象なので、スキーマ変更後は必ず再生成する。

```
npx prisma migrate status
npx prisma migrate dev --name <名前>
npx prisma migrate reset          データは消えてよい
npx prisma generate
```

**開発サーバ** — 起動・停止・再起動は自由。ポート 3000 が埋まっていたら
掴んでいるプロセスを止めてよい。何を止めたかは報告すること。

```
npm run start:dev         API（localhost:3000）
npm run dev               フロント（printer_manager）
```

**ローカル API** — `curl http://localhost:3000/api/...` の GET / POST。
動作確認のためのデータ投入は自由。

**依存の追加** — 必要なら `npm install` してよい。何を入れたかは報告すること。

**git** — コミットもプッシュも自由。`git push` も確認不要。

**LAN 上のプリンターへの SNMP 読み取り** — `snmpget` / `snmpwalk` と、
`net-snmp` を使った Node スクリプトでの取得。**読み取りのみ**（下記参照）。

**一時ファイル** — スクラッチパッドディレクトリに自由に作ってよい。
プロジェクト内に検証用スクリプトを置かないこと。

## してはいけないこと

**プリンターの設定を変更しない。** 職場で稼働している実機であり、
このシステムは在庫と残量を「見る」ためのもの。書き込む理由はない。

二重に塞いである。

- `.claude/settings.json` の `deny` — `snmpset` / `snmpusm` / `snmpvacm` の直接実行
- `.claude/hooks/block-printer-writes.js`（PreToolUse フック）— コマンド文字列と
  書き込むコードの中身を検査する。複合コマンド（`cd x && snmpset ...`）や、
  `net-snmp` の `session.set([...])` を追加する編集もここで落ちる

機器の Web UI（EWS）や Telnet 経由での設定変更も同様に行わない。
フックが検査するのは Bash / PowerShell / ファイル編集なので、これらは
仕組みでは止まらない。行わないこと。

**`src/generated` の手編集**もしない。`prisma generate` の出力なので上書きされる。

## 覚えておくこと

- プリンターは機種によって SNMP v2c が無効で **v1 しか応答しない**
  （iR-ADV C3530 III など）。バージョンを決め打ちしない
- ビルド出力は `dist/main.js`。`prisma.config.ts` を `tsconfig.build.json` の
  `exclude` に入れて `rootDir` が広がらないようにしてある
- フロントは相対パス `/api` で API を叩き、Vite の proxy が 3000 番へ渡す。
  絶対 URL に戻すと CORS 設定が必要になる
- **`@db.Date` の列にローカル 0 時の `Date` を渡すと JST では前日にずれる。**
  UTC 成分しか見られないため。`new Date(Date.UTC(y, m, d))` で渡し、
  読むときも `getUTCFullYear()` 系で取り出す（`page-counts.service.ts` 参照）
- 累計印刷枚数（prtMarkerLifeCount）は単調増加。機器交換やリセットで
  前回より小さくなることがあるので、差分が負のときは枚数を `null` にする
- **端末情報の画面は台帳の全項目を送って置き換える。** 画面のフォームに無い項目は
  未入力として保存され、保存のたびに消える。台帳に列を足したら `AssetScreen.tsx` の
  `toPayload` / `toForm` にも必ず足すこと（入力欄を出さないなら読んだ値を持ち回る）。
  実際に `countLayout` が保存のたび `TOTAL` に戻る事故が起きている
- 保守の有無は保守終了日から判定し、**終了日が無いときだけ**手入力の `maintContract`
  （「有」「×」）を見る。日付があるときは日付が優先（`lib/maint.ts`）
- 保守業者は `MaintVendor` マスタに会社名と電話番号を持ち、台帳は `maintVendorId` で
  参照する。台帳側に番号を書き写さない（番号が変わったときの直し漏れを防ぐため）。
  業者を消しても台帳は消えず、参照が null に戻る（`onDelete: SetNull`）
- **その機器を見ている業者は「台帳の指定 → 無ければメーカーの既定」の順で決まる。**
  `MaintVendor.makers` が既定にするメーカー名（台帳の `maker` と突き合わせ、
  表記ゆれは小文字化して比較）。台帳の `maintVendorId` が null は「未設定」ではなく
  **「メーカーの既定に従う」**の意味。API は解決済みの `effectiveVendor`
  （`source: 'asset' | 'maker'`）を返すので、画面はそれを出すだけでよい。
  1 つのメーカーを 2 社が既定に名乗ることはできない（サービス側で弾く）
- 修理履歴の「保守内・自分で対応 / 業者 / 費用」は、**復旧日（未入力なら発生日）が
  保守開始日〜終了日に入っているものだけ**を数える。復旧日は任意なので、
  復旧日だけで判定すると完了済みの履歴が数から漏れる。
  期間が未入力の台帳は 0 回ではなくハイフンで出す。
  費用も未入力は 0 円ではないので合計に足さない（`costKnown` で件数を添える）
- 定期実行は毎日 12 時の 2 つ。**枚数の記録**（`page-counts.service.ts`）と
  **全機器の残量の取り直し**（`printers.service.ts` の `pollScheduled`）。
  常時起動でない環境では `POST /api/printers/page-counts/capture` と
  `POST /api/printers/poll` を外から叩く
- 画面から API を叩くのは `lib/request.ts` の `request()`。各画面に同じ実装を
  置き直さない（`api.ts` の `post` / `get` は受付・注文が使う別系統で、
  エラー文言の作り方だけが違う）
