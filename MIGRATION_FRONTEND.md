# Migración del Frontend — Cambios en la API de Evaluaciones

**Fecha:** 2026-10-02
**API:** `supplier-api` (NestJS + TypeORM + PostgreSQL)
**Alcance:**Bodega, Calidad, Compras, Rendimientos y Usuarios

---

## ⚠️ Lee esto primero

Hay **tres cambios que rompen el frontend si no los tomas en cuenta**:

1. **Nueva inspección parcial en bodega.** Ahora `estado_completitud` acepta
   `'Pendiente'` y se guarda con `revisado: false` sin cerrarse. Ver sección 0.
2. **Los paneles ahora devuelven MÁS filas.** Antes se perdían los ítems sin
   evaluar. Ahora aparecen. Si tu tabla tiene paginación o asumes que todas las
   filas ya vienen evaluadas, eso te va a cambiar.
3. **`cantidad` ya no es texto.** Antes llegaba como `"10.50"` (string). Ahora
   llega como `10.5` (número). Si hacías `.toFixed()` o comparaciones de string,
   déjalo de hacer — ahora es número de verdad.

---

## 0. Inspección parcial en bodega (nuevo)

El formulario de bodega ahora deja **guardar sin cerrar**. Si el usuario elige
`estado_completitud = 'Pendiente'`, la inspección se persiste con
`revisado: false` y el ítem sigue abierto para editarse más adelante.

### `estado_completitud` acepta un valor nuevo

| Valor | Antes | Ahora |
|---|---|---|
| `Pendiente` | ❌ `400` | ✅ aceptado |
| `Completo` | ✅ | ✅ |
| `Incompleto` | ✅ | ✅ |
| `Excedente` | ✅ | ✅ |

Cualquier otro string sigue dando `400`. El mensaje ahora lista los cuatro.

### El servidor respeta lo que manda el front

Esto es importante porque es distinto a otros flujos:

- `revisado: false` **se respeta**. No se fuerza a `true` en el servidor.
- `estado_completitud` **no se recalcula** a partir de `ingreso_aprobado`. Se
  guarda exactamente el string que eligió el usuario.
- `ingreso_aprobado` es un campo independiente. La combinación
  `estado_completitud: 'Completo'` + `ingreso_aprobado: false` es válida y
  significa "recibido completo, pero va a cuarentena". El backend la acepta tal
  cual, sin normalizar ni rechazar.

### Guardar dos veces = UPDATE, no INSERT duplicado

`PUT /bodega-evaluations/:id` actualiza la fila existente, incluyendo cuando los
valores nuevos son `false` o `null`. El criterio de INSERT vs UPDATE sigue siendo
el `bodega_evaluation_id` que devuelve el front.

```ts
const partial = await get('/bodega-evaluations/item/' + orderItemId);
const isFirstSave = !partial.bodega_evaluation_id;

if (isFirstSave) {
  await post('/bodega-evaluations', body);      // INSERT
} else {
  await put('/bodega-evaluations/' + partial.bodega_evaluation_id, body); // UPDATE
}
```

### Cómo se ven las inspecciones parciales en el panel

Los ítems con `revisado: false` **no se filtran**. Aparecen con todos los campos
poblados, para que el formulario los pueda reeditar:

```json
{
  "bodega_evaluation_id": "9f8e7d6c-...",
  "order_item_id": "4c1bcb6d-...",
  "estado_completitud": "Pendiente",
  "revisado": false,
  "ingreso_aprobado": false,
  "cantidad_recibida": 0,
  "fecha_ingreso": "2026-10-02T15:27:58.915Z"
}
```

Los ítems que **nunca** se evaluaron siguen llegando con `bodega_evaluation_id: null`
y los campos de evaluación en `null`. Es distinto de una inspección parcial, y el
frontend puede distinguirlas por ese campo.

### ⚠️ Requisito de despliegue

Para que `'Pendiente'` se pueda guardar, hay que correr en la base de datos real:

```
migrations/20261002-allow-pendiente-estado-completitud.sql
```

El script es idempotente y trae consultas de verificación al final. Sin esto, el
DTO acepta el valor pero PostgreSQL lo rechaza con un error de constraint.

---

## 1. Cambios en el formato de las respuestas

### 1.1 `cantidad` es número, no string

PostgreSQL devuelve los `NUMERIC` como texto para no perder precisión. Se agregó
un cast en el servidor.

| Endpoint | Antes | Ahora |
|---|---|---|
| `GET /bodega-evaluations` | `"cantidad": "10.50"` | `"cantidad": 10.5` |
| `GET /bodega-evaluations/item/:orderItemId` | `"cantidad": "10.50"` | `"cantidad": 10.5` |
| `GET /calidad-evaluations` | `"cantidad": "10.50"` | `"cantidad": 10.5` |
| `GET /calidad-evaluations/item/:orderItemId` | `"cantidad": "10.50"` | `"cantidad": 10.5` |
| `GET /compras-evaluations` | `"cantidad": "10.50"` | `"cantidad": 10.5` |
| `GET /compras-evaluations/item/:orderItemId` | `"cantidad": "10.50"` | `"cantidad": 10.5` |
| `POST /bodega-evaluations` (respuesta) | `"cantidad_recibida": "10.50"` | `"cantidad_recibida": 10.5` |
| `GET /bodega-evaluations/item/:orderItemId` | `"cantidad_recibida": "10.50"` | `"cantidad_recibida": 10.5` |
| `GET /bodega-evaluations/pure-list` | `"cantidad_recibida": "10.50"` | `"cantidad_recibida": 10.5` |

```ts
// ❌ Antes
const formatted = row.cantidad.toFixed(2); // "10.50".toFixed no existe

// ✅ Ahora
const formatted = Number(row.cantidad).toFixed(2); // o directo: row.cantidad.toFixed(2)
```

**Revisa comparaciones de strings.** Si tenías algo como `cantidad === "10.50"`
o usabas `cantidad` como chave de caché, déjalo de usar.

### 1.2 `fecha_ingreso` y `fecha_evaluacion` ya no vienen en `null`

Estas columnas no tenían `DEFAULT` en la base de datos, así que siempre se
guardaban como `null`. Ahora el servidor las rellena al crear el registro.

| Campo | Antes | Ahora |
|---|---|---|
| `bodega_evaluations.fecha_ingreso` | `null` | `"2026-10-01T15:27:58.915Z"` |
| `calidad_evaluations.fecha_evaluacion` | `null` | `"2026-10-01T15:27:59.185Z"` |
| `compras_evaluations.fecha_evaluacion` | `null` | `"2026-10-01T15:27:59.255Z"` |

Esto arregla el ordenamiento de los paneles: `pure-list` ordena por esas columnas
`DESC`, y antes todas empataban en `null` así que el orden era arbitrario.

```ts
// ❌ Antes: tenías que proteger el null
fecha ? new Date(fecha).toLocaleDateString() : '—'

// ✅ Ahora
new Date(fecha).toLocaleDateString()
```

Sigue siendo `null` para ítems que aún **no** tienen evaluación, así que mantén
el fallback defensivo por si acaso.

---

## 2. Los paneles ahora incluyen ítems sin evaluar ← **cambio importante**

Los queries de panel usaban `RIGHT JOIN` encadenado después de `INNER JOIN`. Eso
hacía que la tabla driven fuera la de evaluaciones, así que **los ítems que
todavía no habían sido evaluados desaparecían de la lista**.

Medido con datos reales: 2 ítems en la BD → la versión vieja devolvía **1 fila**,
la nueva devuelve **2**.

### Qué endpoint cambia

| Endpoint | Antes | Ahora |
|---|---|---|
| `GET /bodega-evaluations` | solo ítems con evaluación de bodega | todos los ítems de orden |
| `GET /calidad-evaluations` | solo ítems con evaluación de calidad | todos los ítems de orden |
| `GET /compras-evaluations` | solo ítems con evaluación de compras | todos los ítems de orden |

### Qué significa para tu tabla

Los ítems sin evaluación vienen con los campos de evaluación en `null`:

```json
{
  "bodega_evaluation_id": null,
  "numero_orden_compra": "OC-0001",
  "order_item_id": "4c1bcb6d-...",
  "cantidad": 10.5,
  "fecha_ingreso": null,
  "limpieza": null,
  "estado_completitud": null,
  "revisado": null
}
```

Eso es intencional: el panel debe **mostrar** lo que falta por evaluar para que
el usuario pueda completar el flujo. Si tu tabla ocultaba estas filas o las
filtraba, ahora puedes mostrarlas con estado "pendiente".

```tsx
// Suggested pattern
const isPending = row.bodega_evaluation_id === null;
<Badge>{isPending ? 'Pendiente' : row.estado_completitud}</Badge>
```

---

## 3. `GET /users` — nuevo, y sin contraseñas

### `GET /users` (nuevo)

Solo `Admin` y `Admin Administrativo`.

```json
[
  {
    "id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "nombre": "Admin General",
    "correo": "admin@hermel-sa.com",
    "rol": "Admin"
  }
]
```

**Ya no incluye el campo `password`.** Antes sí lo incluía, en texto plano. Si tu
frontend lo usaba para algo, déjalo de hacer.

### `GET /users/me` (nuevo)

Cualquier usuario autenticado. Devuelve el perfil desde el JWT:

```json
{
  "id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
  "correo": "admin@hermel-sa.com",
  "rol": "Admin",
  "nombre": "Admin General"
}
```

Útil para el header o el menú de usuario, sin segunda llamada.

---

## 4. Correcciones en `item/:orderItemId`

### Compras

El endpoint filtraba por el id de la **evaluación** cuando el parámetro de ruta
es el del **ítem de orden**. Resultado: siempre `404`.

```ts
// ❌ Antes: WHERE com.id = $1  (buscaba por id de evaluación)
GET /compras-evaluations/item/4c1bcb6d-...   → 404 Not Found

// ✅ Ahora: WHERE po.id = $1  (busca por ítem de orden)
GET /compras-evaluations/item/4c1bcb6d-...   → 200 OK
```

### Calidad

Mismo bug, mismo fix.

```ts
// ✅ Ahora funciona
GET /calidad-evaluations/item/4c1bcb6d-...
```

**Si ya tenías workarounds** para esos 404 — por ejemplo, skipear la llamada o
manejar el error — puedes quitarlos. Ahora responden bien.

---

## 5. `fecha_evaluacion` en el body — ahora opcional

En `POST /calidad-evaluations` el campo `fecha_evaluacion` era **obligatorio**,
pero el servidor lo descartaba igual (es una columna `@CreateDateColumn`). Ahora
es opcional y se rellena automáticamente.

```ts
// ❌ Antes: obligatorio o fallaba con 400
await post('/calidad-evaluations', {
  purchase_order_item_id: id,
  fecha_evaluacion: new Date(),   // ya no hace falta
  // ...
});

// ✅ Ahora
await post('/calidad-evaluations', {
  purchase_order_item_id: id,
  // ...
});
```

También se agregó `fecha_ingreso` (opcional) en `POST /bodega-evaluations` y
`fecha_evaluacion` (opcional) en `POST /compras-evaluations`, por si necesitas
forzar una fecha concreta. Si los mandas, el servidor los respeta.

---

## 6. Sin cambios en los enums de compras

Esto **no cambió**, pero vale confirmarlo porque hay confusion con el README
antiguo:

```ts
// POST /compras-evaluations — sigue siendo STRING, no boolean
{
  "cumple_entrega": "0-3",          // "0-3" | "4-6" | "7-9" | "10-12" | "13-15" | "15+"
  "cumple_servicio": "Excelente",   // "Excelente" | "Regular" | "Malo"
  "producto_finalizado": true       // ← este sí es boolean
}
```

Si el README viejo dice `cumple_entrega: true`, está mal — mandarlo así te da
`400` con el detalle de los valores permitidos.

---

## 7. Roles — sin cambios en los endpoints

La matriz de permisos sigue igual. Solo para que lo tengas a mano:

| Rol | Crear / Editar | Leer paneles |
|---|---|---|
| `Admin` | todo | todos |
| `Admin Administrativo` | todo | todos |
| `Admin Calidad` | calidad | calidad, bodega, compras |
| `Empleado` | bodega | bodega, compras |
| `Usuario` | compras | bodega, calidad, compras |

`GET /users` es el único que se agregó a la lista de solo-Admin.

---

## Checklist de migración

### Bodega — inspección parcial
- [ ] Agregar `'Pendiente'` a las opciones del selector de estado de cumplimiento
- [ ] Confirmar que `revisado: false` viaja cuando el estado es `'Pendiente'`
- [ ] Mostrar el ítem como pendiente/editable en el panel en vez de cerrarlo
- [ ] Reusar `GET /bodega-evaluations/item/:orderItemId` para reeditar, no crear de cero
- [ ] Verificar que el segundo guardado va por `PUT` (decidir con `bodega_evaluation_id`)
- [ ] Correr la migración SQL antes de desplegar

### Resto
- [ ] Quitar el formateo manual de `cantidad` / `cantidad_recibida` — ya son números
- [ ] Revisar comparaciones de string sobre `cantidad` (`=== "10.50"`, `.length`, etc.)
- [ ] Quitar el fallback `fecha ? ... : '—'` en fechas de ingreso/evaluación, o dejarlo por seguridad
- [ ] Actualizar las tablas de panel para manejar filas con campos de evaluación en `null`
- [ ] Agregar el manejo de los ítems pendientes (badge, botón de evaluar)
- [ ] Dejar de enviar `fecha_evaluacion` en el POST de calidad
- [ ] Quitar el campo `password` de cualquier tipo o lista de usuarios
- [ ] Integrar `GET /users/me` para el perfil del usuario (opcional, mejora un request)
- [ ] Eliminar workarounds de 404 en los endpoints `item/:orderItemId` de compras y calidad
- [ ] Verificar la paginación de las tablas de panel: ahora traen más filas

---

## Nota sobre datos de prueba

`GET /users` ahora no devuelve contraseñas. Si tu código actual esperaba ese
campo, **no hay reemplazo** — es intencional. No se exponen contraseñas por
ninguna vía de la API.

Si necesitas dar de alta un usuario nuevo, por ahora hay que hacerlo por SQL
directo a la base de datos; no existe `POST /users`.