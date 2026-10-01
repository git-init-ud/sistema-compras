# Base de datos local (PostgreSQL) — manual

Guía para crear la base `compras_db` con un clúster PostgreSQL local, sin Docker.
Los scripts `setup-local-db-*` automatizan todo esto; este documento sirve como
**procedimiento manual** si los scripts no existen, no aplican a tu sistema o fallan.

## Resumen

| Dato            | Valor                                                 |
| --------------- | ----------------------------------------------------- |
| Clúster         | `db/pgdata` (socket en `db/run`, log en `db/pg.log`)  |
| Puerto          | `5440`                                                |
| Usuario         | `postgres` (sin contraseña, auth `trust`)             |
| Base de datos   | `compras_db`                                          |
| `DATABASE_URL`  | `postgresql://postgres@127.0.0.1:5440/compras_db`     |
| Archivos SQL    | `db/schema.sql`, `db/seed.sql`                        |

> No confundir con otro PostgreSQL que ya tengas instalado y corriendo en el puerto
> `5432`: este clúster es aparte y vive dentro del repositorio.

## Opción rápida (scripts)

```bash
# macOS (requiere PostgreSQL: brew install postgresql@18)
db/setup-local-db-mac.sh              # inicia/crea todo
db/setup-local-db-mac.sh status       # estado
db/setup-local-db-mac.sh stop         # apagar

# Linux
db/setup-local-db.sh
```

```powershell
# Windows, en PowerShell normal (no "Run as administrator")
powershell -ExecutionPolicy Bypass -File db\setup-local-db-windows.ps1
powershell -ExecutionPolicy Bypass -File db\setup-local-db-windows.ps1 stop
```

## Instalar PostgreSQL (si no lo tienes)

- **macOS:** `brew install postgresql@18`, o [Postgres.app](https://postgresapp.com/), o el
  instalador de [EDB](https://www.postgresql.org/download/macosx/).
- **Windows:** instalador de [EDB](https://www.postgresql.org/download/windows/). No necesitas
  pgAdmin, pero sí recordar la carpeta `bin` (p. ej. `C:\Program Files\PostgreSQL\18\bin`).
- **Linux (Debian/Ubuntu):** `sudo apt install postgresql postgresql-client`.

## Pasos manuales

### 1. Localizar los binarios

```bash
# macOS / Linux
which pg_ctl psql initdb pg_isready
# Homebrew: /opt/homebrew/bin (Apple Silicon) o /usr/local/bin (Intel)
# Debian/Ubuntu: /usr/lib/postgresql/<version>/bin
```

```powershell
# Windows (PowerShell): si no está en el PATH
where.exe pg_ctl
# normalmente C:\Program Files\PostgreSQL\<version>\bin
```

En los comandos de abajo, reemplaza `pg_ctl`, `initdb`, `psql` y `pg_isready` por la ruta
completa si no están en el `PATH`.

### 2. Crear el clúster (solo la primera vez)

```bash
# macOS / Linux (desde la carpeta db/)
cd db
initdb -D pgdata -U postgres --auth=trust -E UTF8 --locale=C
mkdir -p run
```

```powershell
# Windows (desde la carpeta db\)
cd db
& "C:\Program Files\PostgreSQL\18\bin\initdb.exe" -D pgdata -U postgres -A trust -E UTF8 --no-locale
```

> **Windows:** no ejecutes esto como Administrador; `postgres.exe` se niega a correr con
> ese token. Usa una PowerShell normal.
> `--no-locale` / `--locale=C` evita el error `encoding UTF8 does not match locale`.

### 3. Encender el servidor

```bash
# macOS / Linux (desde db/)
pg_ctl -D pgdata -o "-p 5440 -k run -c listen_addresses=127.0.0.1" -l pg.log start
pg_isready -h 127.0.0.1 -p 5440        # debe responder "accepting connections"
```

```powershell
# Windows (desde db\); en Windows no hay socket Unix, por eso no se usa -k
& "C:\Program Files\PostgreSQL\18\bin\pg_ctl.exe" -D pgdata -o "-p 5440 -c listen_addresses=127.0.0.1" -l pg.log start
& "C:\Program Files\PostgreSQL\18\bin\pg_isready.exe" -h 127.0.0.1 -p 5440
```

### 4. Crear la base y cargar schema + seed

```bash
# macOS / Linux
psql -h 127.0.0.1 -p 5440 -U postgres -c "CREATE DATABASE compras_db"    # si aún no existe
psql -h 127.0.0.1 -p 5440 -U postgres -v ON_ERROR_STOP=1 -d compras_db -f schema.sql
psql -h 127.0.0.1 -p 5440 -U postgres -v ON_ERROR_STOP=1 -d compras_db -f seed.sql
```

```powershell
# Windows
$pg = "C:\Program Files\PostgreSQL\18\bin"    # ajusta la version
& "$pg\psql.exe" -h 127.0.0.1 -p 5440 -U postgres -c "CREATE DATABASE compras_db"
& "$pg\psql.exe" -h 127.0.0.1 -p 5440 -U postgres -v ON_ERROR_STOP=1 -d compras_db -f schema.sql
& "$pg\psql.exe" -h 127.0.0.1 -p 5440 -U postgres -v ON_ERROR_STOP=1 -d compras_db -f seed.sql
```

`schema.sql` se puede reaplicar sin problema (usa `IF NOT EXISTS`). `seed.sql` solo debe
cargarse una vez; si repites, primero verifica que `productos` esté vacía.

### 5. Verificar

```bash
psql -h 127.0.0.1 -p 5440 -U postgres -d compras_db -c "\dt"
psql -h 127.0.0.1 -p 5440 -U postgres -d compras_db -c "SELECT count(*) FROM productos"   # 2
psql -h 127.0.0.1 -p 5440 -U postgres -d compras_db -c "SELECT count(*) FROM clientes"    # 2
```

### 6. Apagar y consultar estado

```bash
pg_ctl -D pgdata status
pg_ctl -D pgdata stop
```

## Conectar las APIs

Cada servicio lee `DATABASE_URL` (ver `.env.example`). Ya viene apuntando al clúster local:

```bash
cd cliente-api && cp .env.example .env   # repetir en producto-api y compra-api
```

## Reiniciar de cero

```bash
pg_ctl -D db/pgdata stop                 # si está encendido
rm -rf db/pgdata db/run db/pg.log        # PowerShell: Remove-Item -Recurse -Force pgdata, run, pg.log
db/setup-local-db-mac.sh                 # o el script de tu sistema
```

## Problemas comunes

| Síntoma | Causa y solución |
| ------- | ---------------- |
| `psql: command not found` / `no se reconoce psql` | Binarios fuera del `PATH`. Usa la ruta completa o agrega `.../bin` al `PATH`. |
| `FATAL: role "postgres" does not exist` o pide contraseña | Te conectaste al Postgres del `5432`, no a este clúster. Especifica `-p 5440`. |
| `could not connect to server: Connection refused` | El servidor está apagado. Paso 3; revisa `db/pg.log`. |
| `could not bind ... address already in use` | Otro proceso ocupa el 5440: `lsof -iTCP:5440 -sTCP:LISTEN` (mac/Linux) o `netstat -ano \| findstr :5440` (Windows). Libéralo o cambia el puerto y el `DATABASE_URL`. |
| `directory "pgdata" exists but is not empty` | El clúster ya existe; solo hay que encenderlo (paso 3). |
| `lock file "postmaster.pid" already exists` con el servidor caído | `pg_ctl status` para confirmar que no corre y borra `db/pgdata/postmaster.pid`. |
| Windows: `execution of PostgreSQL by a user with administrative permissions is not permitted` | Abre una PowerShell normal, sin "Run as administrator". |
| Windows: `encoding UTF8 does not match locale` | Borra `pgdata` y recrea con `--no-locale` (paso 2). |
| `could not find suitable text search configuration` | Aviso inofensivo; si molesta, recrea con `--locale=C` / `--no-locale`. |

## Archivos generados (ignorados por git)

`db/pgdata/`, `db/run/` y `db/pg.log` están en `.gitignore`; nunca deben subirse al repositorio.
