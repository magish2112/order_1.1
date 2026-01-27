#!/bin/bash
set -e

SERVER="46.17.102.76"
USER="magish"
PASS="9Oecwton!1"

echo "🚀 Начинаю автоматический деплой..."

# Функция для выполнения команд через SSH
run_ssh() {
    sshpass -p "$PASS" ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null "$USER@$SERVER" "$1"
}

# 1. Проверка подключения
echo "📡 Подключение к серверу..."
if ! command -v sshpass &> /dev/null; then
    echo "⚠️  sshpass не установлен. Использую expect..."
    
    # Создаем expect скрипт
    cat > /tmp/ssh_deploy.exp << 'EXPECTEOF'
#!/usr/bin/expect -f
set timeout -1
set server [lindex $argv 0]
set user [lindex $argv 1]
set pass [lindex $argv 2]
set cmd [lindex $argv 3]

spawn ssh -o StrictHostKeyChecking=no $user@$server $cmd
expect {
    "password:" {
        send "$pass\r"
        exp_continue
    }
    eof
}
EXPECTEOF
    
    chmod +x /tmp/ssh_deploy.exp
    RUN_CMD="/tmp/ssh_deploy.exp $SERVER $USER $PASS"
else
    RUN_CMD="sshpass -p $PASS ssh -o StrictHostKeyChecking=no $USER@$SERVER"
fi

# Выполняем команды
echo "✅ Подключение установлено"

# 2. Установка docker-compose если нужно
echo "📦 Проверка Docker..."
$RUN_CMD "docker compose version || (sudo apt update && sudo apt install -y docker-compose-plugin)"

# 3. Build и запуск
echo "🔨 Запуск контейнеров..."
$RUN_CMD "cd ~/eterno && docker compose up -d --build"

# 4. Ожидание
echo "⏳ Ожидание запуска (30 сек)..."
sleep 30

# 5. Миграции
echo "🗄️  Применение миграций..."
$RUN_CMD "cd ~/eterno && docker compose exec -T api npx prisma migrate deploy"

# 6. Создание админа
echo "👤 Создание админа..."
$RUN_CMD "cd ~/eterno && docker compose exec -T api node create-admin-eterno.js"

# 7. Проверка
echo "🔍 Проверка..."
$RUN_CMD "cd ~/eterno && curl -s http://localhost/health"

echo "✅ Деплой завершен! Сайт: http://$SERVER"
