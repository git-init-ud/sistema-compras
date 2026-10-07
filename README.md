# sistema-compras

Tres APIs REST con Node.js y Express: `cliente-api`, `producto-api` y `compra-api`. Antes de crear
una compra, `compra-api` valida contra las otras dos que el cliente y el producto existan, y que
haya stock suficiente.

**Autores:** 
- Jhojan Stiven Aragón Ramírez
- Yader Ibraldo Quiroga Torres
- Kevin Emmanuel Tovar Lizarazo

## Servicios

| Servicio      | Puerto | Recurso     |
| ------------- | ------ | ----------- |
| cliente-api   | 3001   | `/clientes` |
| producto-api  | 3002   | `/productos`|
| compra-api    | 3003   | `/compras`  |

## Correr el proyecto

Cada servicio es independiente, con su propio `package.json`. Hay que instalar dependencias y
levantar los tres al tiempo, cada uno en su terminal:

```bash
# Terminal 1
cd cliente-api
cp .env.example .env
npm install
npm run dev

# Terminal 2
cd producto-api
cp .env.example .env
npm install
npm run dev

# Terminal 3
cd compra-api
cp .env.example .env
npm install
npm run dev
```

`compra-api` lee las URLs de `cliente-api` y `producto-api` desde variables de entorno
(`CLIENTE_API_URL`, `PRODUCTO_API_URL`), nunca las tiene fijas en el código.

## Correr con Docker

Levanta las tres APIs y Postgres con un solo comando, sin instalar Node ni Postgres:

```bash
docker compose up -d --build
docker compose ps                  # los 4 servicios deben quedar "healthy"
docker compose logs -f compra-api
docker compose down                # parar conservando los datos
docker compose down -v             # parar y borrar la base (init.sql se vuelve a aplicar)
```

- Las APIs quedan en `localhost:3001`, `3002` y `3003`. Postgres solo es accesible desde tu
  máquina en `127.0.0.1:5433` (`admin` / `admin`, base `compra_db`).
- `init/init.sql` crea las tablas y carga datos de ejemplo la primera vez, cuando el volumen
  `postgres_data` está vacío. Si cambias el esquema hay que usar `docker compose down -v`.
- Si el puerto 5433 ya está ocupado en tu máquina, cambia el mapeo `127.0.0.1:5433:5432` del
  servicio `db` en `docker-compose.yml`.
- Las imágenes corren como usuario `node` (no root) sobre `node:24-alpine`, con healthcheck.

## Pruebas

Colección de Postman en `postman/sistema-compras.postman_collection.json`. Importarla y usar las
requests ya armadas para cada API, incluyendo los casos de cliente/producto inexistente y
servicio caído (con `producto-api` detenida).

## Notas

- 404 significa "consulté al otro servicio y el recurso no existe"; 503 significa "no logré
  consultar al otro servicio".
- El total de la compra se calcula con el precio que devuelve `producto-api`, nunca con un valor
  enviado por el cliente de la API.

## Base de datos local (PostgreSQL)

Un solo clúster local (sin Docker) con la base `compras_db` y tres tablas: `clientes` (id UUID), `productos` y `compras` (ids incrementales). `compras` no tiene FK a propósito: `compra-api` valida cliente y producto por HTTP.

```bash
# macOS (requiere PostgreSQL: brew install postgresql@18)
db/setup-local-db-mac.sh                               # clúster en db/pgdata, puerto 5440, schema + seed
db/setup-local-db-mac.sh stop                          # apagar

# Linux
db/setup-local-db.sh
```

```powershell
# Windows, en PowerShell normal (no usar "Run as administrator")
powershell -ExecutionPolicy Bypass -File db\setup-local-db-windows.ps1
powershell -ExecutionPolicy Bypass -File db\setup-local-db-windows.ps1 stop
```

```bash
psql -h 127.0.0.1 -p 5440 -U postgres -d compras_db    # entrar
```

Si los scripts no están disponibles o fallan, el procedimiento manual paso a paso está en
[`db/README.md`](db/README.md).

Cada API lee `DATABASE_URL` (ver `.env.example`).
