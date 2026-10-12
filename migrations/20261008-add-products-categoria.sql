-- ============================================================
-- Migración: products.categoria (Materia Prima / Material de Empaque)
-- ============================================================
-- Motivo: el frontend de bodega necesita clasificar los ítems en
-- dos secciones: "Materia Prima" y "Material de Empaque".
-- La tabla products es externa a este API (no tiene entity TypeORM),
-- por eso el cambio se aplica como script SQL manual.
--
-- Ejecutar sobre la base REAL (requisiciones).
-- Es idempotente: se puede correr más de una vez.
--
-- IMPORTANTE: después de correr esta migración hay que poblar la
-- columna (ver ejemplos al final). Mientras esté en NULL el frontend
-- muestra el producto en la sección "Sin clasificar".
-- ============================================================

BEGIN;

-- 1. Agregar la columna si no existe
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS categoria varchar(30);

-- 2. CHECK constraint (dos valores permitidos + NULL = sin clasificar)
ALTER TABLE public.products
  DROP CONSTRAINT IF EXISTS chk_products_categoria;

ALTER TABLE public.products
  ADD CONSTRAINT chk_products_categoria
  CHECK (categoria IS NULL OR categoria IN ('Materia Prima', 'Material de Empaque'));

COMMIT;

-- ============================================================
-- Verificación
-- ============================================================

-- A) Confirmar que la columna y el constraint quedaron bien:
SELECT a.attname, format_type(a.atttypid, a.atttypmod) AS tipo
  FROM pg_attribute a
  JOIN pg_class c ON a.attrelid = c.oid
  WHERE c.relname = 'products'
    AND a.attname = 'categoria'
    AND a.attnum > 0
    AND NOT a.attisdropped;

SELECT conname, pg_get_constraintdef(oid) AS definicion
  FROM pg_constraint
  WHERE conname = 'chk_products_categoria';

-- B) Ver cómo quedó la clasificación actual (NULL = Sin clasificar):
SELECT COALESCE(categoria, '(sin clasificar)') AS categoria, COUNT(*) AS total
  FROM public.products
 GROUP BY categoria
 ORDER BY categoria;

-- ============================================================
-- Población de datos (descomentar y ajustar según el catálogo real)
-- ============================================================

-- UPDATE public.products SET categoria = 'Materia Prima'
--  WHERE categoria IS NULL
--    AND (nombre ILIKE '%...%' OR codigo ILIKE '%...%');

-- UPDATE public.products SET categoria = 'Material de Empaque'
--  WHERE categoria IS NULL
--    AND (nombre ILIKE '%caja%' OR nombre ILIKE '%bolsa%'
--         OR nombre ILIKE '%film%' OR nombre ILIKE '%tape%'
--         OR nombre ILIKE '%pallet%' OR nombre ILIKE '%empaque%');

-- Volver a correr la consulta de verificación B) para confirmar.
