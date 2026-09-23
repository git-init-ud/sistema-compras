#!/usr/bin/env bash
# Local Postgres.
# Data lives in ./db/pgdata (gitignored), socket in ./db/run, port 5440.
set -euo pipefail
cd "$(dirname "$0")"
PGDATA="$PWD/pgdata"; PGRUN="$PWD/run"; PORT=5440
BIN="$(ls -d /usr/lib/postgresql/*/bin 2>/dev/null | tail -1 || true)"; BIN="${BIN:-/usr/bin}"
mkdir -p "$PGRUN"
[ -d "$PGDATA" ] || "$BIN/initdb" -D "$PGDATA" -U postgres --auth=trust -E UTF8
"$BIN/pg_ctl" -D "$PGDATA" -o "-p $PORT -k $PGRUN -c listen_addresses=127.0.0.1" -l "$PWD/pg.log" start || true
sleep 2
psql -h 127.0.0.1 -p $PORT -U postgres -tc "SELECT 1 FROM pg_database WHERE datname='compras_db'" | grep -q 1 \
  || psql -h 127.0.0.1 -p $PORT -U postgres -c "CREATE DATABASE compras_db"
psql -h 127.0.0.1 -p $PORT -U postgres -d compras_db -f schema.sql
psql -h 127.0.0.1 -p $PORT -U postgres -d compras_db -tc "SELECT count(*) FROM productos" | grep -q ' 0' && \
  psql -h 127.0.0.1 -p $PORT -U postgres -d compras_db -f seed.sql || true
echo "ready: psql -h 127.0.0.1 -p $PORT -U postgres -d compras_db"
