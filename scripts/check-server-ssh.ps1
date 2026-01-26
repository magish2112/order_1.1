# PowerShell скрипт для проверки сервера через SSH
# Запуск: .\scripts\check-server-ssh.ps1

$server = "magish@46.17.102.76"
$password = "9Oecwton!1"
$projectPath = "/home/magish/order_1.1"

Write-Host "══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  ПОДКЛЮЧЕНИЕ К СЕРВЕРУ И ДИАГНОСТИКА" -ForegroundColor Cyan
Write-Host "══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Проверка наличия ssh
if (-not (Get-Command ssh -ErrorAction SilentlyContinue)) {
    Write-Host "❌ SSH не найден. Установите OpenSSH или используйте PuTTY." -ForegroundColor Red
    Write-Host ""
    Write-Host "Альтернатива: скопируйте скрипт на сервер и запустите там:" -ForegroundColor Yellow
    Write-Host "  scp scripts/fix-all.sh $server`:$projectPath/scripts/" -ForegroundColor Yellow
    Write-Host "  ssh $server 'cd $projectPath && bash scripts/fix-all.sh 46.17.102.76'" -ForegroundColor Yellow
    exit 1
}

Write-Host "Подключение к серверу..." -ForegroundColor Yellow
Write-Host ""

# Команды для выполнения на сервере
$commands = @"
cd $projectPath
echo '══════════════════════════════════════════════════════════════'
echo '  ДИАГНОСТИКА'
echo '══════════════════════════════════════════════════════════════'
echo ''
echo '1️⃣  Контейнеры:'
docker compose ps 2>/dev/null || docker-compose ps 2>/dev/null || echo '⚠️  docker compose не найден'
echo ''
echo '2️⃣  API:'
curl -sf http://127.0.0.1:4000/health && echo '✅ API OK' || echo '❌ API не отвечает'
echo ''
echo '3️⃣  VITE_API_URL:'
grep '^VITE_API_URL=' .env 2>/dev/null || echo '❌ Не найден'
echo ''
echo '4️⃣  Web:'
curl -sf http://127.0.0.1:3000 >/dev/null && echo '✅ OK' || echo '❌ Не отвечает'
echo ''
echo '5️⃣  Admin:'
curl -sf http://127.0.0.1:3001 >/dev/null && echo '✅ OK' || echo '❌ Не отвечает'
echo '══════════════════════════════════════════════════════════════'
"@

# Попытка подключения (потребует ввода пароля вручную)
Write-Host "Выполнение диагностики на сервере..." -ForegroundColor Yellow
Write-Host "(Введите пароль когда запросит: $password)" -ForegroundColor Yellow
Write-Host ""

# Используем ssh с передачей команд
# Примечание: для автоматического ввода пароля нужен sshpass (Linux) или ключи SSH
$commands | ssh -o StrictHostKeyChecking=accept-new $server bash

Write-Host ""
Write-Host "══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  Для автоматического исправления запустите на сервере:" -ForegroundColor Cyan
Write-Host "══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  bash scripts/fix-all.sh 46.17.102.76" -ForegroundColor Yellow
Write-Host ""
