#!/bin/bash

# Local dev: Postgres + Bun API server + Vite client (proxies /solve to the API)
cleanup() {
    echo "Stopping all services..."
    for pid_name in API_PID CLIENT_PID DOCKER_PID; do
        pid=${!pid_name}
        if [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null; then
            echo "Stopping $pid_name (PID: $pid)..."
            kill "$pid"
            wait "$pid"
        fi
    done
    docker compose -p local-phrase-solver -f compose.local.yaml down
    echo "All services stopped."
    exit 0
}

trap cleanup SIGINT SIGTERM

echo "Starting Postgres..."
docker compose -p local-phrase-solver -f compose.local.yaml up -d db &
DOCKER_PID=$!

echo "Starting API server on :3002..."
bun --watch server/index.js &
API_PID=$!

echo "Starting Vite client on :3001..."
(cd client && bun run start) &
CLIENT_PID=$!

wait -n
cleanup
