# Автоматический деплой на сервер
# Использует plink для SSH с паролем

$SERVER_IP = "46.17.102.76"
$SERVER_USER = "magish"
$SERVER_PASS = "9Oecwton!1"
$PROJECT_DIR = "/home/magish/eterno"

Write-Host "🚀 Начинаю деплой на сервер $SERVER_IP..." -ForegroundColor Blue

# Функция для выполнения команды на сервере
function Invoke-SSHCommand {
    param(
        [string]$Command
    )
    
    # Используем echo для передачи пароля через pipe
    $password = $SERVER_PASS
    echo y | plink -ssh -l $SERVER_USER -pw $password $SERVER_IP $Command
}

# 1. Проверка подключения
Write-Host "`n📡 Проверка подключения к серверу..." -ForegroundColor Yellow
echo y | plink -ssh -l $SERVER_USER -pw $SERVER_PASS $SERVER_IP "echo 'Подключение успешно'"

# 2. Установка необходимых пакетов
Write-Host "`n📦 Установка необходимых пакетов..." -ForegroundColor Yellow
$installScript = @"
sudo apt update
sudo apt install -y docker.io docker-compose git curl
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker magish
"@

echo y | plink -ssh -l $SERVER_USER -pw $SERVER_PASS $SERVER_IP $installScript

# 3. Клонирование проекта
Write-Host "`n📥 Клонирование проекта..." -ForegroundColor Yellow
$cloneScript = @"
cd ~
rm -rf eterno
git clone https://github.com/your-repo/eterno.git || mkdir -p eterno
cd eterno
"@

echo y | plink -ssh -l $SERVER_USER -pw $SERVER_PASS $SERVER_IP $cloneScript

Write-Host "`n✅ Базовая настройка завершена!" -ForegroundColor Green
Write-Host "`nТеперь загружаю файлы проекта..." -ForegroundColor Blue
