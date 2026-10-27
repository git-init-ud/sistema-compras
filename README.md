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
(`CLIENTE_API_URL`, `PRODUCTO_API_URL`), nunca las tiene fijas en el código. `cliente-api` y
`producto-api` leen `COMPRA_API_URL` para verificar si un recurso tiene compras antes de eliminarlo.

## Pruebas

Colección de Postman en `postman/sistema-compras.postman_collection.json`. Importarla y usar las
requests ya armadas para cada API, incluyendo los casos de cliente/producto inexistente y
servicio caído (con `producto-api` detenida).

## Notas

- 404 significa "consulté al otro servicio y el recurso no existe"; 503 significa "no logré
  consultar al otro servicio".
- El total de la compra se calcula con el precio que devuelve `producto-api`, nunca con un valor
  enviado por el cliente de la API.
- Al eliminar un cliente o un producto, la API correspondiente consulta a `compra-api` para no
  dejar compras huérfanas. Si tiene compras asociadas responde `409`; si `compra-api` no está
  disponible responde `503`.

## Datos en memoria

El proyecto **no usa PostgreSQL**. Cada API guarda sus datos en arreglos dentro del código
(`src/data/`), así que no hay que instalar ni levantar ningún motor de base de datos:

| Servicio      | Archivo                    | Datos iniciales |
| ------------- | -------------------------- | --------------- |
| `cliente-api` | `src/data/clientes.js`     | Laura Gómez y Andrés Ruiz (UUID fijos, los mismos de Postman) |
| `producto-api`| `src/data/productos.js`    | Teclado mecánico y Mouse inalámbrico |
| `compra-api`  | `src/data/compras.js`      | Arreglo vacío |

Los cambios (crear, actualizar o eliminar) se mantienen mientras el proceso esté corriendo.
Al reiniciar un servicio, sus datos vuelven al estado inicial.
