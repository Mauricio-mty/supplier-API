-- ============================================================
-- Migración: permitir estado_completitud = 'Pendiente'
-- ============================================================
-- Motivo: el frontend de bodega ahora guarda inspecciones parciales
-- (estado_completitud = 'Pendiente', revisado = false) sin cerrarlas.
-- El CHECK constraint actual rechaza 'Pendiente' en la base de datos,
-- aunque el DTO ya lo acepte.
--
-- Ejecutar sobre la base REAL (requisiciones).
-- Es idempotente: se puede correr más de una vez.
-- ============================================================

BEGIN;

-- 1. Ver el constraint actual (comentario de diagnóstico)
-- SELECT conname, pg_get_constraintdef(oid)
--   FROM pg_constraint
--  WHERE conname = 'chk_estado_completitud';

-- 2. Eliminar el CHECK viejo
ALTER TABLE public.bodega_evaluations
  DROP CONSTRAINT IF EXISTS chk_estado_completitud;

-- 3. Recrear el CHECK incluyendo 'Pendiente'
ALTER TABLE public.bodega_evaluations
  ADD CONSTRAINT chk_estado_completitud
  CHECK (estado_completitud IN ('Pendiente', 'Completo', 'Incompleto', 'Excedente'));

COMMIT;

-- ============================================================
-- Verificación
-- ============================================================

-- A) Confirmar que el constraint quedó bien:
SELECT conname, pg_get_constraintdef(oid) AS definicion
  FROM pg_constraint
 WHERE conname = 'chk_estado_completitud';

-- B) Probar que 'Pendiente' ahora se guarda (espera 1 fila affected)
BEGIN;
INSERT INTO public.bodega_evaluations (
  purchase_order_item_id, limpieza, equipo_proteccion,
  identificacion_producto_ok, libre_plagas, cantidad_recibida,
  estado_completitud, tiene_fecha_vencimiento, embalaje_ok,
  revisado, ingreso_aprobado
)
SELECT
  poi.id, false, false, false, false, 0,
  'Pendiente', false, false,
  false, false
FROM public.purchase_order_items poi
LIMIT 1;
-- Si no hubo error de constraint, el INSERT funcionó.
ROLLBACK;  -- deshace la prueba

-- C) Ver el reparto actual de estados (debe mostrar o no 'Pendiente')
SELECT estado_completitud, revisado, COUNT(*) AS total
  FROM public.bodega_evaluations
 GROUP BY estado_completitud, revisado
 ORDER BY estado_completitud, revisado;
