#!/bin/bash
# Добавляет location /panel в eternostroy.conf. Запуск на сервере: sudo bash add-panel-to-nginx.sh

set -e
CONF="/etc/nginx/sites-enabled/eternostroy.conf"
DIR="$(cd "$(dirname "$0")" && pwd)"
FRAGMENT="$DIR/nginx-panel-fragment.conf"

if [ ! -f "$CONF" ]; then
  echo "Config not found: $CONF"
  exit 1
fi

if grep -q 'location /panel' "$CONF"; then
  echo "location /panel already present."
  nginx -t && systemctl reload nginx
  echo "Panel: https://eternostroy.ru/panel"
  exit 0
fi

if [ ! -f "$FRAGMENT" ]; then
  echo "Fragment not found: $FRAGMENT"
  exit 1
fi

cp "$CONF" "${CONF}.bak"
# Вставить содержимое fragment после строки "# Proxy к Next.js (port 3000)"
sed -i "/# Proxy к Next.js (port 3000)/r $FRAGMENT" "$CONF"
nginx -t && systemctl reload nginx
echo "Done. Panel: https://eternostroy.ru/panel"
echo "Backup: ${CONF}.bak"
