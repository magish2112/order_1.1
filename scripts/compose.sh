#!/bin/bash
# Wrapper: предпочитает `docker compose` (V2), иначе `docker-compose` (V1)
# с обходом ошибки KeyError: 'ContainerConfig' при recreate (docker-compose 1.29.x)
#
# Запуск из корня проекта: ./scripts/compose.sh up -d web
# Или: bash scripts/compose.sh up -d web

set -e

cd "$(dirname "$0")/.."

if docker compose version >/dev/null 2>&1; then
  exec docker compose "$@"
fi

# docker-compose V1: workaround KeyError: 'ContainerConfig' при "up" (recreate)
if [ "$1" = "up" ]; then
  ARGS=("$@")
  SERVICES=()
  for i in "${!ARGS[@]}"; do
    [ "$i" -eq 0 ] && continue
    a="${ARGS[$i]}"
    [[ "$a" == -* ]] && continue
    SERVICES+=("$a")
  done
  if [ ${#SERVICES[@]} -eq 0 ]; then
    echo "Removing existing containers to avoid ContainerConfig error (docker-compose v1)..."
    docker-compose down 2>/dev/null || true
  else
    for s in "${SERVICES[@]}"; do
      ids=$(docker-compose ps -q "$s" 2>/dev/null || true)
      if [ -n "$ids" ]; then
        echo "Removing existing $s container(s) to avoid ContainerConfig error (docker-compose v1)..."
        echo "$ids" | xargs -r docker rm -f
      fi
    done
  fi
fi

exec docker-compose "$@"
