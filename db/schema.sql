-- sistema-compras: one database, three tables (one per service).
-- cliente uses a UUID; producto and compra use incremental ids.
-- compra.cliente_id / producto_id carry FKs for this activity's sake, even
-- though compra-api still validates both over HTTP before inserting.

CREATE TABLE IF NOT EXISTS clientes (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre     TEXT NOT NULL,
  email      TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS productos (
  id         SERIAL PRIMARY KEY,
  nombre     TEXT NOT NULL,
  precio     NUMERIC(12,2) NOT NULL CHECK (precio >= 0),
  stock      INTEGER NOT NULL CHECK (stock >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS compras (
  id          SERIAL PRIMARY KEY,
  cliente_id  UUID NOT NULL REFERENCES clientes (id) ON DELETE RESTRICT,
  producto_id INTEGER NOT NULL REFERENCES productos (id) ON DELETE RESTRICT,
  cantidad    INTEGER NOT NULL CHECK (cantidad > 0),
  total       NUMERIC(12,2) NOT NULL CHECK (total >= 0),
  fecha       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS compras_cliente_idx  ON compras (cliente_id);
CREATE INDEX IF NOT EXISTS compras_producto_idx ON compras (producto_id);
