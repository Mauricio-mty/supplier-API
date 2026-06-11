# Supplier API

NestJS API para gestionar evaluaciones de:
- **Compras** (cierre comercial)
- **Bodega** (recepción / validaciones en bodega)
- **Calidad** (dictamen de calidad)

## Base URL
- Por defecto la app escucha en: `http://localhost:3000`

## Auth (JWT Bearer)
Todas las rutas de evaluación están protegidas con JWT (`JwtAuthGuard`).

### Login
`POST /auth/login`

**Body** (`LoginDto`):
- `correo` (string, email)
- `password` (string, min 3)

**Response (200):**
```json
{
  "access_token": "<jwt>",
  "user": {
    "id": "<uuid>",
    "nombre": "<string>",
    "correo": "<string>",
    "rol": "<string>"
  }
}
```

**Ejemplo (curl):**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d "{ \"correo\": \"usuario@empresa.com\", \"password\": \"tu_password\" }"
```

### Header para endpoints protegidos
Incluye el token:
```http
Authorization: Bearer <access_token>
```

---

## Conceptos / IDs
- `purchase_order_item_id` (UUID v4): id del ítem en la orden de compra.
  - Usado como relación lógica para **crear** evaluaciones.
- `orderItemId` (UUID v4): mismo concepto, pero en endpoints de consulta: `GET .../item/:orderItemId`.
- `id` (UUID): id de la fila en la tabla de evaluación (por ejemplo `bodega_evaluations.id`, `calidad_evaluations.id`, `compras_evaluations.id`).
  - Usado en `PUT :id`.

---

## Endpoints - Compras
Base path: **`/compras-evaluations`**

> Requiere `Authorization: Bearer <token>`

### 1) Crear evaluación (cierre comercial)
`POST /compras-evaluations`

**Body** (`CreateComprasDto`):
- `purchase_order_item_id` (UUID v4)
- `cumple_entrega` (`0-3`, `4-6`, `7-9`, `10-12`, `13-15`, `15+`)
- `cumple_servicio` (`Excelente`, `Regular`, `Malo`)
- `producto_finalizado` (boolean)
- `comentarios` (string, opcional)

**Response:** `ComprasEvaluation` (guardada en `compras_evaluations`). Si `producto_finalizado` es `true`, el backend genera o actualiza automáticamente el registro correspondiente en `rendimientos`.

### 2) Listado historial (panel)
`GET /compras-evaluations`

Devuelve un listado con joins contra `purchase_orders`, `purchase_order_items`, `suppliers`, `products` y left joins a evaluaciones de bodega/calidad/compras.

### 3) Obtener detalle para formulario
`GET /compras-evaluations/item/:orderItemId`

- `orderItemId` (UUID v4)

### 4) Actualizar evaluación por id
`PUT /compras-evaluations/:id`

- `id` (UUID de `compras_evaluations`)

**Body** (`UpdateComprasDto`): todos los campos son opcionales (PartialType), mismos tipos que `CreateComprasDto`.

### 5) Lista “pura” ordenada
`GET /compras-evaluations/pure-list`

---

## Endpoints - Bodega
Base path: **`/bodega-evaluations`**

> Requiere `Authorization: Bearer <token>`

### 1) Crear evaluación
`POST /bodega-evaluations`

**Body** (`CreateBodegaDto`):
- `purchase_order_item_id` (UUID v4)
- `limpieza` (boolean)
- `equipo_proteccion` (boolean)
- `identificacion_producto_ok` (boolean)
- `libre_plagas` (boolean)
- `estado_completitud` (string enum): `"Completo" | "Incompleto" | "Excedente"`
- `tiene_fecha_vencimiento` (boolean)
- `embalaje_ok` (boolean)
- `revisado` (boolean)
- `ingreso_aprobado` (boolean)
- `comentarios` (string, opcional)

### 2) Listado historial (panel)
`GET /bodega-evaluations`

### 3) Obtener detalle para formulario
`GET /bodega-evaluations/item/:orderItemId`

### 4) Actualizar evaluación por id
`PUT /bodega-evaluations/:id`

**Body** (`UpdateBodegaDto`): opcional (PartialType), mismos tipos que `CreateBodegaDto`.

### 5) Lista “pura” ordenada
`GET /bodega-evaluations/pure-list`

---

## Endpoints - Calidad
Base path: **`/calidad-evaluations`**

> Requiere `Authorization: Bearer <token>`

### 1) Crear evaluación
`POST /calidad-evaluations`

**Body** (`CreateCalidadDto`):
- `purchase_order_item_id` (UUID v4)
- `cumple_calidad` (boolean)
- `cumple_norma` (boolean)
- `accion_tomada` (string, requerido y no vacío)
- `revisado` (boolean)
- `comentarios` (string, opcional)

### 2) Listado historial (panel)
`GET /calidad-evaluations`

### 3) Obtener detalle para formulario
`GET /calidad-evaluations/item/:orderItemId`

### 4) Actualizar evaluación por id
`PUT /calidad-evaluations/:id`

**Body** (`UpdateCalidadDto`): opcional (PartialType), mismos tipos que `CreateCalidadDto`.

### 5) Lista “pura” ordenada
`GET /calidad-evaluations/pure-list`

---

## Ejemplo de consumo (compras)
```bash
TOKEN="<access_token>"

curl -X POST http://localhost:3000/compras-evaluations \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"purchase_order_item_id\": \"00000000-0000-0000-0000-000000000000\",
    \"cumple_entrega\": true,
    \"cumple_servicio\": true,
    \"producto_finalizado\": true,
    \"comentarios\": \"Ok\"
  }"
```

## Errores comunes
- `401/403`: falta o token inválido (JWT).
- `404 Not Found`: cuando no existe el `orderItemId` consultado o el `id` de la evaluación a actualizar.

---

## Scripts
```bash
npm install
npm run start
npm run start:dev
```

