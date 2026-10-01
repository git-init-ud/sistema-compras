#!/usr/bin/env bash
# macOS local PostgreSQL for sistema-compras.
# Cluster lives in db/pgdata, socket in db/run, port 5440, trust auth (no password).
#
# Usage:
#   ./setup-local-db-mac.sh           start cluster, create compras_db, apply schema + seed
#   ./setup-local-db-mac.sh stop      stop the cluster
#   ./setup-local-db-mac.sh status    show cluster status
#
# Requires PostgreSQL. Homebrew: brew install postgresql@18
# (Postgres.app and the EDB installer are also detected.)
set -euo pipefail
cd "$(dirname "$0")"

PGDATA="$PWD/pgdata"
PGRUN="$PWD/run"
PORT=5440
DB=compras_db

# --- locate the PostgreSQL binaries -------------------------------------------------
BIN=""
if command -v pg_ctl >/dev/null 2>&1; then
  BIN="$(cd -P "$(dirname "$(command -v pg_ctl)")" && pwd)"
else
  for c in \
    /opt/homebrew/opt/postgresql@*/bin /usr/local/opt/postgresql@*/bin \
    /opt/homebrew/opt/postgresql/bin /usr/local/opt/postgresql/bin \
    /Applications/Postgres.app/Contents/Versions/latest/bin \
    /Library/PostgreSQL/*/bin; do
    if [ -x "$c/pg_ctl" ]; then
      BIN="$c"
      break
    fi
  done
fi

for tool in initdb pg_ctl psql pg_isready; do
  if [ -z "$BIN" ] || [ ! -x "$BIN/$tool" ]; then
    echo "error: PostgreSQL ($tool) not found." >&2
    echo "install it with: brew install postgresql@18" >&2
    exit 1
  fi
done
echo "using PostgreSQL at $BIN"

case "${1:-up}" in
  stop)
    if [ -d "$PGDATA" ]; then
      "$BIN/pg_ctl" -D "$PGDATA" stop
    else
      echo "no cluster in $PGDATA"
    fi
    exit 0
    ;;
  status)
    if [ -d "$PGDATA" ]; then
      exec "$BIN/pg_ctl" -D "$PGDATA" status
    fi
    echo "no cluster in $PGDATA"
    exit 1
    ;;
  up|start|"") ;;
  *)
    echo "usage: $0 [up|stop|status]" >&2
    exit 2
    ;;
esac

# --- init + start -------------------------------------------------------------------
mkdir -p "$PGRUN"
if [ ! -d "$PGDATA" ]; then
  echo "creating cluster in $PGDATA (user postgres, trust auth)"
  # --locale=C keeps initdb deterministic on any machine and avoids
  # "could not find suitable text search configuration" warnings.
  "$BIN/initdb" -D "$PGDATA" -U postgres --auth=trust -E UTF8 --locale=C >/dev/null
fi

if "$BIN/pg_ctl" -D "$PGDATA" status >/dev/null 2>&1; then
  echo "cluster already running on port $PORT"
else
  "$BIN/pg_ctl" -D "$PGDATA" \
    -o "-p $PORT -k $PGRUN -c listen_addresses=127.0.0.1" \
    -l "$PWD/pg.log" start >/dev/null
fi

for _ in $(seq 1 20); do
  "$BIN/pg_isready" -h 127.0.0.1 -p "$PORT" -q && break
  sleep 0.5
done
"$BIN/pg_isready" -h 127.0.0.1 -p "$PORT" -q ||
  { echo "error: server not accepting connections, see pg.log" >&2; exit 1; }

# --- database + schema + seed -------------------------------------------------------
psql=( "$BIN/psql" -h 127.0.0.1 -p "$PORT" -U postgres -v ON_ERROR_STOP=1 )

if [ "$("${psql[@]}" -tAc "SELECT 1 FROM pg_database WHERE datname='$DB'")" = 1 ]; then
  echo "database $DB already exists"
else
  echo "creating database $DB"
  "${psql[@]}" -c "CREATE DATABASE $DB" >/dev/null
fi

echo "applying schema.sql"
"${psql[@]}" -d "$DB" -q -f schema.sql

if [ "$("${psql[@]}" -d "$DB" -tAc "SELECT count(*) FROM productos")" = 0 ]; then
  echo "applying seed.sql"
  "${psql[@]}" -d "$DB" -q -f seed.sql
fi

cat <<EOF

ready:
  DATABASE_URL=postgresql://postgres@127.0.0.1:$PORT/$DB
  psql -h 127.0.0.1 -p $PORT -U postgres -d $DB
stop:
  $0 stop
EOF
