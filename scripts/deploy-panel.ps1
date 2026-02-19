# Деплой панели и перезапуск контейнеров
# Запустите после того, как Docker Desktop запущен

Set-Location $PSScriptRoot\..

Write-Host "Building admin image..." -ForegroundColor Cyan
docker-compose build admin
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "Starting containers..." -ForegroundColor Cyan
docker-compose up -d
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "Done. Panel: https://eternostroy.ru/panel" -ForegroundColor Green
