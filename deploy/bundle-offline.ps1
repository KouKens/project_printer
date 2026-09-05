# オフラインの本番機へ持ち込む一式を deploy\out\ に作る。
#
#   powershell -ExecutionPolicy Bypass -File deploy\bundle-offline.ps1
#   powershell -ExecutionPolicy Bypass -File deploy\bundle-offline.ps1 -WithData
#
# -WithData を付けると、今の開発 DB の中身も一緒に出す（スキーマは含まない。
# 本番では migrate deploy でテーブルを作ってから流し込む）。
#
# node_modules を丸ごと運ぶ前提。本番で npm install はできない。
# **開発端末と本番機の OS が同じであること**が条件になる。

[CmdletBinding()]
param(
  [switch]$WithData,
  [string]$OutDir
)

$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$api = Join-Path $root 'toner-api'
$web = Join-Path $root 'printer_manager'
if (-not $OutDir) { $OutDir = Join-Path $PSScriptRoot 'out' }
$app = Join-Path $OutDir 'app'

function Step($text) { Write-Host "`n== $text" -ForegroundColor Cyan }

<#
  ディレクトリを消す。**掴まれていても諦めず、間を置いて数回試す。**

  書きたての node_modules は Defender などがまだ走査していて
  「別のプロセスが使用中」で消せないことがある。
  1 回の Remove-Item が途中で失敗すると半端に消えたツリーが残り、
  そこへ robocopy すると中身の欠けた配布物が出来上がる（実際に踏んだ）。
#>
function Remove-Tree($path) {
  if (-not (Test-Path $path)) { return }
  for ($i = 1; $i -le 5; $i++) {
    try {
      Remove-Item -Recurse -Force $path -ErrorAction Stop
      return
    } catch {
      if ($i -eq 5) {
        throw "$path を削除できません。エクスプローラやウイルス対策が掴んでいないか確認してください。`n$($_.Exception.Message)"
      }
      Write-Host "  削除に失敗（$i 回目）。2 秒待って再試行します" -ForegroundColor Yellow
      Start-Sleep -Seconds 2
    }
  }
}

# ── 1. ビルド ────────────────────────────────
Step 'API をビルド'
Push-Location $api
npm run build
if ($LASTEXITCODE -ne 0) { throw 'API のビルドに失敗しました' }

Step 'Prisma クライアントを生成'
node node_modules\prisma\build\index.js generate
if ($LASTEXITCODE -ne 0) { throw 'prisma generate に失敗しました' }

# generate がソースを書き換えるので、ビルドし直して dist に反映する
npm run build
if ($LASTEXITCODE -ne 0) { throw 'API の再ビルドに失敗しました' }
Pop-Location

Step 'フロントをビルド'
Push-Location $web
npm run build
if ($LASTEXITCODE -ne 0) { throw 'フロントのビルドに失敗しました' }
Pop-Location

# ── 2. 集める ────────────────────────────────
Step "配布物を作る: $OutDir"

<#
  **installers\ は消さない。** インストーラ（Node と PostgreSQL で約 390MB）は
  インターネットのある端末で 1 度落としたものを置く場所で、
  作り直すたびに消えると毎回ダウンロードし直しになる。
  それ以外は作り直すので消す。
#>
if (Test-Path $OutDir) {
  Get-ChildItem $OutDir -Force |
    Where-Object { $_.Name -ne 'installers' } |
    ForEach-Object { Remove-Tree $_.FullName }
}
New-Item -ItemType Directory -Force -Path $app | Out-Null

Copy-Item (Join-Path $api 'dist') (Join-Path $app 'dist') -Recurse
Copy-Item (Join-Path $api 'prisma') (Join-Path $app 'prisma') -Recurse
Copy-Item (Join-Path $api 'package.json') $app
Copy-Item (Join-Path $web 'dist') (Join-Path $app 'web') -Recurse

<#
  **prisma.config.ts を忘れない。**
  schema.prisma の datasource には url を書いておらず、接続先はこの設定ファイルの
  datasource.url（= 環境変数 DATABASE_URL）から読む。
  入れ忘れると migrate deploy が
  「the datasource.url property is required in your prisma config file」で止まる
#>
Copy-Item (Join-Path $api 'prisma.config.ts') $app

# 手順書も入れる。本番機にはリポジトリが無いので、USB だけで作業を完結させる。
# 更新のときに実際に打つのは UPDATE-COMMANDS.md のほう
Copy-Item (Join-Path $PSScriptRoot 'OFFLINE-WINDOWS.md') $OutDir
Copy-Item (Join-Path $PSScriptRoot 'UPDATE-COMMANDS.md') $OutDir
Copy-Item (Join-Path $PSScriptRoot 'check-prod.ps1') $OutDir

# 拠点の振り分け SQL。移行（add_company）は「既定の会社」1 つに寄せるだけなので、
# 本院と各事業所へ分けるにはこれを 1 度流す（UPDATE-COMMANDS.md の 5-2）
Copy-Item (Join-Path $PSScriptRoot 'assign-sites.sql') $OutDir

# node_modules は数が多く Copy-Item だと遅いので robocopy で運ぶ
Step 'node_modules をコピー（数分かかる）'
$srcModules = Join-Path $api 'node_modules'
$dstModules = Join-Path $app 'node_modules'
$null = robocopy $srcModules $dstModules /E /NFL /NDL /NJH /NJS /NP
# robocopy は 0-7 が成功（1 = コピーした）。8 以上が失敗
if ($LASTEXITCODE -ge 8) { throw "node_modules のコピーに失敗しました (robocopy $LASTEXITCODE)" }

<#
  **コピーできたことを必ず確かめる。**
  robocopy は途中で止まっても 8 未満を返すことがあり、終了コードだけ見ていると
  中身の無い配布物が「完了」として出来上がる。本番機で初めて気づくと手遅れなので、
  ここで落とす。
#>
Step 'コピー結果を検証'
$needed = @(
  '@nestjs/core', '@nestjs/common', '@nestjs/platform-express', '@nestjs/schedule',
  '@prisma/client', '@prisma/adapter-pg', 'prisma',
  'pg', 'net-snmp', 'reflect-metadata', 'rxjs', 'class-validator', 'class-transformer'
)
$missing = $needed | Where-Object { -not (Test-Path (Join-Path $dstModules $_)) }
if ($missing) {
  throw "node_modules が不完全です。足りない: $($missing -join ', ')`n" +
        "もう一度実行してください（他のプロセスが出力先を触っていないかも確認）"
}

$srcCount = (Get-ChildItem $srcModules -Recurse -File -ErrorAction SilentlyContinue).Count
$dstCount = (Get-ChildItem $dstModules -Recurse -File -ErrorAction SilentlyContinue).Count
if ($dstCount -lt $srcCount) {
  throw "node_modules のファイル数が合いません（元 $srcCount / 先 $dstCount）"
}
Write-Host "  $dstCount ファイル（元と一致）"

# ── 3. 設定と起動用 ──────────────────────────
Step '設定と起動用のファイルを置く'

# **cmd.exe が解釈するファイルは ASCII だけで書く。**
# 日本語を入れると、実行時のコードページ次第で rem 行やコメント行が
# コマンドとして解釈され、起動しなくなる。説明は OFFLINE-WINDOWS.md 側に置く。
$ascii = New-Object System.Text.ASCIIEncoding

# **値を引用符で囲まない。** start.cmd の `set "A=B"` は引用符ごと値に取り込むため、
# "..." を付けると接続文字列の両端に " が残って接続できなくなる
$envText = @'
# toner-api settings. Replace CHANGE_ME with the real password.
# Read by start.cmd. Do NOT quote the values.
# See deploy/OFFLINE-WINDOWS.md for details.

DATABASE_URL=postgresql://printer:CHANGE_ME@localhost:5432/printer?schema=public
PORT=3000
WEB_ROOT=C:\toner\app\web
TZ=Asia/Tokyo

# Uncomment to keep the API on this machine only (no LAN access).
# HOST=127.0.0.1
'@
[System.IO.File]::WriteAllText((Join-Path $app 'api.env'), $envText, $ascii)

$startText = @'
@echo off
rem Start toner-api. Reads api.env, then runs node.
setlocal
cd /d "%~dp0"

rem Skip blank lines and lines starting with #
for /f "usebackq eol=# tokens=1,* delims==" %%a in ("api.env") do (
  if not "%%b"=="" set "%%a=%%b"
)

if not defined DATABASE_URL (
  echo [ERROR] DATABASE_URL not found in api.env
  exit /b 1
)

node dist\main.js
'@
[System.IO.File]::WriteAllText((Join-Path $app 'start.cmd'), $startText, $ascii)

# ── 4. データ ────────────────────────────────
if ($WithData) {
  Step '開発 DB の中身を書き出す'
  $envFile = Join-Path $api '.env'
  $line = Select-String -Path $envFile -Pattern 'DATABASE_URL="([^"]+)"' | Select-Object -First 1
  if (-not $line) { throw 'toner-api\.env から DATABASE_URL を読めませんでした' }
  $url = $line.Matches[0].Groups[1].Value

  $data = Join-Path $OutDir 'data'
  New-Item -ItemType Directory -Force -Path $data | Out-Null

  # **?schema=public を落とす。** これは Prisma 独自の指定で、
  # pg_dump は「不明なURI問い合わせパラメータ」として弾く
  $pgUrl = $url -replace '\?.*$', ''

  # --data-only にする。テーブルは本番で migrate deploy が作るため。
  # --disable-triggers は外部キーの順序を気にせず流し込むため。
  # **_prisma_migrations は除く。** migrate deploy が本番側で書く表なので、
  # 一緒に流し込むと主キーが重複して失敗する
  pg_dump --data-only --disable-triggers --no-owner --no-privileges `
    --exclude-table=_prisma_migrations `
    --file (Join-Path $data 'printer.dump') $pgUrl
  if ($LASTEXITCODE -ne 0) { throw 'pg_dump に失敗しました' }

  $lines = (Get-Content (Join-Path $data 'printer.dump')).Count
  Write-Host "  データを書き出しました（$lines 行）"
}

# ── 5. 仕上げの確認 ──────────────────────────
Step '配布物を最終確認'

# 起動に要るものが全て揃っているか。1 つでも欠けたら本番で動かない
$mustHave = @(
  (Join-Path $app 'dist\main.js'),
  (Join-Path $app 'web\index.html'),
  (Join-Path $app 'package.json'),
  (Join-Path $app 'api.env'),
  (Join-Path $app 'start.cmd'),
  (Join-Path $app 'prisma\schema.prisma'),
  # 接続先はここから読む。無いと migrate deploy が動かない
  (Join-Path $app 'prisma.config.ts'),
  (Join-Path $dstModules 'prisma\build\index.js')
)
$lost = $mustHave | Where-Object { -not (Test-Path $_) }
if ($lost) { throw "配布物が不完全です。足りない:`n  $($lost -join "`n  ")" }

$migrations = (Get-ChildItem (Join-Path $app 'prisma\migrations') -Directory).Count
Write-Host "  マイグレーション $migrations 本"

$size = (Get-ChildItem $OutDir -Recurse -File | Measure-Object -Property Length -Sum).Sum / 1MB
Write-Host "`n完了: $OutDir  （合計 $([math]::Round($size)) MB）" -ForegroundColor Green
Write-Host '次は deploy\OFFLINE-WINDOWS.md の「3. 本番機での作業」へ。'
