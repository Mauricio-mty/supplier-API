import { ValueTransformer } from 'typeorm';

/**
 * PostgreSQL devuelve las columnas NUMERIC como texto para no perder precisión,
 * por eso hay que convertirlas explícitamente a `number` antes de exponerlas.
 */
export const numericTransformer: ValueTransformer = {
  to: (value: number | string | null | undefined): number | null => {
    if (value === null || value === undefined || value === '') {
      return null;
    }
    return typeof value === 'number' ? value : Number(value);
  },
  from: (value: string | number | null): number | null => {
    if (value === null || value === undefined) {
      return null;
    }
    return typeof value === 'number' ? value : Number(value);
  },
};
