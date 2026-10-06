# check-prod.ps1 -- read-only survey of the production machine.
#
# Run this on the production server BEFORE any update. It does not write to
# the database and does not change anything. It prints to the screen and
# also saves everything to a log file next to this script.
#
#   powershell -ExecutionPolicy Bypass -File check-prod.ps1
#
# Bring the log file back to the dev machine.
#
# NOTE: this file is intentionally ASCII only. Windows PowerShell 5.1 reads
# scripts as the OEM code page unless there is a BOM, and non-ASCII text can
# turn into garbage or a parse error. Do not add Japanese to this file.

param(
  # The live site (checked 2026-09-05) is installed here. Note the space in the
  # folder name -- always quote paths built from this.
  [string]$AppDir  = 'C:\Printer Manager\app',
  [string]$DbUser  = 'printer',
  [string]$DbName  = 'printer',
  [string]$DbHost  = 'localhost'
)

$ErrorActionPreference = 'Continue'

$stamp = Get-Date -Format 'yyyyMMdd_HHmm'
$log   = Join-Path $PSScriptRoot "check-prod_$stamp.txt"

function Section($title) {
  $line = "`n===== $title ====="
  Write-Host $line -ForegroundColor Cyan
  Add-Content -Path $log -Value $line
}

function Record($text) {
  Write-Host $text
  Add-Content -Path $log -Value $text
}

# Run a scriptblock, capture stdout+stderr, never abort the whole survey.
function Try-Run($label, $block) {
  Record "--- $label"
  try {
    $out = & $block 2>&1 | Out-String
    if ([string]::IsNullOrWhiteSpace($out)) { $out = '(no output)' }
    Record $out.TrimEnd()
  } catch {
    Record "FAILED: $($_.Exception.Message)"
  }
}

Set-Content -Path $log -Value "check-prod.ps1  $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
Record "app dir : $AppDir"
Record "database: $DbUser@$DbHost/$DbName"

# ---------------------------------------------------------------- 0. service
Section '0. service state'

# The live site is started by hand with start.cmd -- there is no task and no
# service. Look for one anyway: if someone registers it later, we want to know.
Try-Run 'scheduled task / service (none expected -- start.cmd is run by hand)' {
  $t = Get-ScheduledTask -ErrorAction SilentlyContinue |
         Where-Object { $_.TaskName -match 'toner|tonerapi' }
  if ($t) { $t | Select-Object TaskName, State | Format-List }
  else    { 'no scheduled task matching "toner" (expected for this site)' }
}

Try-Run 'node process owned by this app dir' {
  $p = Get-Process node -ErrorAction SilentlyContinue |
         Where-Object { $_.Path -like "$AppDir*" }
  if ($p) { $p | Select-Object Id, StartTime, Path | Format-List }
  else    { 'no node process from this app dir (API is stopped)' }
}

Try-Run 'api responds (port 3000)' {
  $r = Invoke-WebRequest -Uri 'http://localhost:3000/api/printers' -UseBasicParsing -TimeoutSec 10
  "HTTP $($r.StatusCode), $($r.Content.Length) bytes"
}

# ------------------------------------------------------------ 1. environment
Section '1. environment'

Try-Run 'node version (dev machine is v24.x -- major must match)' { node -v }
Try-Run 'timezone (want: Tokyo Standard Time)'                    { tzutil /g }
Try-Run 'psql version'                                            { psql --version }

Try-Run 'app directory contents (is there a prisma folder?)' {
  Get-ChildItem $AppDir | Select-Object Mode, LastWriteTime, Name | Format-Table -AutoSize
}

Try-Run 'free disk space on C:' {
  Get-PSDrive C | Select-Object @{n='FreeGB';e={[math]::Round($_.Free/1GB,1)}} | Format-List
}

# ------------------------------------------------------- 2. migration status
Section '2. migration status  <-- THE IMPORTANT ONE'
Record 'the bundle has 47 migrations. Note the count and any unapplied names.'

$prismaCli = Join-Path $AppDir 'node_modules\prisma\build\index.js'

if (Test-Path $prismaCli) {
  Push-Location $AppDir
  Try-Run 'prisma migrate status' { node $prismaCli migrate status }
  Pop-Location
} else {
  Record "prisma CLI not found at $prismaCli -- falling back to SQL below"
}

Record ''
Record 'Enter the password for the DB role when prompted (same as api.env).'

Try-Run 'applied migrations (count)' {
  psql -U $DbUser -h $DbHost -d $DbName -c `
    "SELECT count(*) AS applied FROM _prisma_migrations WHERE finished_at IS NOT NULL;"
}

Try-Run 'applied migrations (last 10)' {
  psql -U $DbUser -h $DbHost -d $DbName -c `
    "SELECT migration_name, finished_at FROM _prisma_migrations ORDER BY finished_at DESC LIMIT 10;"
}

Try-Run 'failed / rolled-back migrations (should be empty)' {
  psql -U $DbUser -h $DbHost -d $DbName -c `
    "SELECT migration_name, started_at, rolled_back_at FROM _prisma_migrations WHERE finished_at IS NULL;"
}

# ------------------------------------------------- 3. maint vendor branch
Section '3. maint vendor columns (decides whether a CSV rescue is needed)'
Record 'If maint_vendor does NOT exist -> already on the new schema, nothing to rescue.'
Record 'If it exists and count > 0     -> rescue to CSV before applying 20260820050000.'

Try-Run 'does printer_assets.maint_vendor still exist?' {
  psql -U $DbUser -h $DbHost -d $DbName -c `
    "SELECT column_name FROM information_schema.columns WHERE table_name='printer_assets' AND column_name IN ('maint_vendor','maint_phones','maint_vendor_id') ORDER BY column_name;"
}

Try-Run 'rows that would lose data' {
  psql -U $DbUser -h $DbHost -d $DbName -c `
    "SELECT count(*) AS rows_with_vendor FROM printer_assets WHERE maint_vendor IS NOT NULL;"
}

# --------------------------------------------------------- 4. data volume
Section '4. data volume (so the update can be sanity-checked afterwards)'

Try-Run 'row counts per table' {
  psql -U $DbUser -h $DbHost -d $DbName -c `
    "SELECT relname AS table, n_live_tup AS rows FROM pg_stat_user_tables WHERE n_live_tup > 0 ORDER BY relname;"
}

Try-Run 'database size' {
  psql -U $DbUser -h $DbHost -d $DbName -c `
    "SELECT pg_size_pretty(pg_database_size('$DbName')) AS size;"
}

# ------------------------------------------------------------------- done
Section 'done'
Record "Log written to: $log"
Record 'Nothing was modified. Bring this log back to the dev machine.'

Write-Host "`nLog file: $log" -ForegroundColor Green
