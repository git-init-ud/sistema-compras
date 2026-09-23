INSERT INTO clientes (nombre, email) VALUES
  ('Laura Gómez', 'laura.gomez@example.com'),
  ('Andrés Ruiz', 'andres.ruiz@example.com')
ON CONFLICT (email) DO NOTHING;

INSERT INTO productos (nombre, precio, stock) VALUES
  ('Teclado mecánico', 180000, 15),
  ('Mouse inalámbrico', 65000, 30);
