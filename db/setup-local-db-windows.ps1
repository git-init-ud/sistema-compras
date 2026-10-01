# Local PostgreSQL for sistema-compras on Windows.
# Cluster lives in db\pgdata, port 5440, trust auth (no password), so the same
# DATABASE_URL works on every OS: postgresql://postgres@127.0.0.1:5440/compras_db
#
# Run from a normal PowerShell (do NOT use "Run as administrator"):
#   powershell -ExecutionPolicy Bypass -File db\setup-local-db-windows.ps1
#   powershell -ExecutionPolicy Bypass -File db\setup-local-db-windows.ps1 stop
#   powershell -ExecutionPolicy Bypass -File db\setup-local-db-windows.ps1 status
#
# Requires PostgreSQL for Windows: https://www.postgresql.org/download/windows/

param(
  [ValidateSet('up', 'stop', 'status')]
  [string]$Command = 'up'
)

Set-Location $PSScriptRoot

$PgData  = Join-Path $PSScriptRoot 'pgdata'
$LogFile = Join-Path $PSScriptRoot 'pg.log'
$Port    = 5440
$Db      = 'compras_db'

# --- Administrator check ------------------------------------------------------------
# postgres.exe refuses to run under an Administrator token, so fail early and clearly.
$identity  = [Security.Principal.WindowsIdentity]::GetCurrent()
$principal = New-Object Security.Principal.WindowsPrincipal($identity)
if ($principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
  Write-Host 'PostgreSQL refuses to run under an Administrator token.'
  Write-Host 'Open a normal PowerShell (not "Run as administrator") and run the script again.'
  exit 1
}

# --- Locate the PostgreSQL binaries -------------------------------------------------
function Find-PgBin {
  $pgCtl = Get-Command pg_ctl.exe -ErrorAction SilentlyContinue
  if ($pgCtl) { return (Split-Path $pgCtl.Path) }

  $roots = @("$env:ProgramFiles\PostgreSQL", "${env:ProgramFiles(x86)}\PostgreSQL")
  $dirs = @()
  foreach ($root in $roots) {
    $dirs += Get-ChildItem -Path $root -Directory -ErrorAction SilentlyContinue
  }
  $best = $dirs |
    Where-Object { Test-Path (Join-Path $_.FullName 'bin\pg_ctl.exe') } |
    Sort-Object { if ($_.Name -match '^(\d+)') { [int]$Matches[1] } else { 0 } } -Descending |
    Select-Object -First 1
  if ($best) { return (Join-Path $best.FullName 'bin') }
  return $null
}

$PgBin = Find-PgBin
if (-not $PgBin) {
  Write-Host 'PostgreSQL was not found.'
  Write-Host 'Install it from https://www.postgresql.org/download/windows/ and run this script again.'
  exit 1
}
Write-Host "using PostgreSQL at $PgBin"

$InitDb    = Join-Path $PgBin 'initdb.exe'
$PgCtlExe  = Join-Path $PgBin 'pg_ctl.exe'
$PsqlExe   = Join-Path $PgBin 'psql.exe'
$PgIsReady = Join-Path $PgBin 'pg_isready.exe'

function Test-ClusterRunning {
  # Capture output (including stderr) instead of letting it hit the console.
  $null = & $PgCtlExe -D $PgData status 2>&1
  return ($LASTEXITCODE -eq 0)
}

# --- stop ---------------------------------------------------------------------------
if ($Command -eq 'stop') {
  if (Test-Path $PgData) {
    & $PgCtlExe -D $PgData stop
  } else {
    Write-Host "no cluster in $PgData"
  }
  exit 0
}

# --- status -------------------------------------------------------------------------
if ($Command -eq 'status') {
  if (Test-Path $PgData) {
    & $PgCtlExe -D $PgData status
    exit $LASTEXITCODE
  }
  Write-Host "no cluster in $PgData"
  exit 1
}

# --- init + start -------------------------------------------------------------------
if (-not (Test-Path $PgData)) {
  Write-Host "creating cluster in $PgData (user postgres, trust auth)"
  # --no-locale avoids the "encoding UTF8 does not match locale" error on Windows.
  & $InitDb -D $PgData -U postgres -A trust -E UTF8 --no-locale
  if ($LASTEXITCODE -ne 0) { throw 'initdb failed' }
}

if (Test-ClusterRunning) {
  Write-Host "cluster already running on port $Port"
}
else {
  & $PgCtlExe -D $PgData -o "-p $Port -c listen_addresses=127.0.0.1" -l $LogFile start
  if ($LASTEXITCODE -ne 0) { throw "pg_ctl start failed; see $LogFile" }
}

$ready = $false
for ($i = 0; $i -lt 20; $i++) {
  & $PgIsReady -h 127.0.0.1 -p $Port -q 2>&1 | Out-Null
  if ($LASTEXITCODE -eq 0) { $ready = $true; break }
  Start-Sleep -Milliseconds 500
}
if (-not $ready) { throw "server did not start; see $LogFile" }

# --- database + schema + seed -------------------------------------------------------
$psql = @('-h', '127.0.0.1', '-p', "$Port", '-U', 'postgres', '-v', 'ON_ERROR_STOP=1')

$exists = & $PsqlExe @psql -tAc "SELECT 1 FROM pg_database WHERE datname='$Db'"
if ("$exists".Trim() -ne '1') {
  Write-Host "creating database $Db"
  & $PsqlExe @psql -c "CREATE DATABASE $Db"
  if ($LASTEXITCODE -ne 0) { throw 'could not create the database' }
} else {
  Write-Host "database $Db already exists"
}

Write-Host 'applying schema.sql'
& $PsqlExe @psql -d $Db -f (Join-Path $PSScriptRoot 'schema.sql')
if ($LASTEXITCODE -ne 0) { throw 'schema.sql failed' }

$count = & $PsqlExe @psql -d $Db -tAc 'SELECT count(*) FROM productos'
if ($null -ne $count) { $count = "$count".Trim() }
if ($count -eq '0') {
  Write-Host 'applying seed.sql'
  & $PsqlExe @psql -d $Db -f (Join-Path $PSScriptRoot 'seed.sql')
  if ($LASTEXITCODE -ne 0) { throw 'seed.sql failed' }
}

Write-Host ''
Write-Host "ready: DATABASE_URL=postgresql://postgres@127.0.0.1:$Port/$Db"
Write-Host "ready: psql -h 127.0.0.1 -p $Port -U postgres -d $Db"
Write-Host "stop:  powershell -ExecutionPolicy Bypass -File `"$PSScriptRoot\setup-local-db-windows.ps1`" stop"
