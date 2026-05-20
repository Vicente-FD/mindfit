# Ejecutar como Administrador:
#   PowerShell -> clic derecho -> "Ejecutar como administrador"
#   cd C:\Users\vicho\Desktop\mindfit\scripts
#   .\setup-postgres-windows.ps1

$ErrorActionPreference = 'Stop'

$pgBin   = 'C:\Program Files\PostgreSQL\15\bin'
$pgData  = 'C:\Program Files\PostgreSQL\15\data'
$hbaFile = Join-Path $pgData 'pg_hba.conf'
$service = 'postgresql-x64-15'
$password = 'mindfitpass123'
$dbName   = 'mindfit_ops'

if (-not (Test-Path $hbaFile)) {
  Write-Error "No se encontró PostgreSQL 15 en $pgData"
}

if (-not ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
  Write-Error 'Este script debe ejecutarse como Administrador.'
}

Write-Host '== Mindfit Ops - Configuracion PostgreSQL ==' -ForegroundColor Cyan

# Backup
$backup = "$hbaFile.bak-mindfit-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
Copy-Item $hbaFile $backup -Force
Write-Host "Backup: $backup"

# Trust temporal solo IPv4 localhost
$content = Get-Content $hbaFile -Raw
$content = $content -replace '(?m)^host\s+all\s+all\s+127\.0\.0\.1/32\s+scram-sha-256\s*$', 'host    all             all             127.0.0.1/32            trust'
[System.IO.File]::WriteAllText($hbaFile, $content)

Write-Host 'Reiniciando servicio PostgreSQL...'
Restart-Service $service
Start-Sleep -Seconds 4

$psql = Join-Path $pgBin 'psql.exe'
$sql = @"
ALTER USER postgres WITH PASSWORD '$password';
SELECT 'CREATE DATABASE $dbName'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '$dbName')\gexec
"@

& $psql -h 127.0.0.1 -U postgres -p 5432 -v ON_ERROR_STOP=1 -c "ALTER USER postgres WITH PASSWORD '$password';"
& $psql -h 127.0.0.1 -U postgres -p 5432 -v ON_ERROR_STOP=1 -tc "SELECT 1 FROM pg_database WHERE datname = '$dbName'" | ForEach-Object {
  if ($_ -notmatch '1') {
    & $psql -h 127.0.0.1 -U postgres -p 5432 -v ON_ERROR_STOP=1 -c "CREATE DATABASE $dbName;"
  }
}

# Restaurar pg_hba original
Copy-Item $backup $hbaFile -Force
Restart-Service $service
Start-Sleep -Seconds 3

# Verificar conexion con password
$env:PGPASSWORD = $password
$result = & $psql -h 127.0.0.1 -U postgres -p 5432 -d $dbName -c "SELECT current_database(), current_user;" 2>&1
Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue

Write-Host ''
Write-Host 'PostgreSQL listo para Mindfit Ops:' -ForegroundColor Green
Write-Host "  Host:     127.0.0.1"
Write-Host "  Puerto:   5432"
Write-Host "  Usuario:  postgres"
Write-Host "  Password: $password"
Write-Host "  Base:     $dbName"
Write-Host ''
Write-Host $result
Write-Host ''
Write-Host 'Siguiente paso:' -ForegroundColor Yellow
Write-Host '  cd C:\Users\vicho\Desktop\mindfit\mindfit-backend'
Write-Host '  npm run start:dev'
