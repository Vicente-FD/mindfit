import { CategoriaActivo } from '../common/enums';

/** Mapeo sigla tabla maestra → enum legacy (analytics / compatibilidad). */
export const SIGLA_TO_CATEGORIA_ENUM: Record<string, CategoriaActivo> = {
  CR: CategoriaActivo.CARDIO,
  FZ: CategoriaActivo.FUERZA,
  CL: CategoriaActivo.CLIMATIZACION,
  IF: CategoriaActivo.INFRAESTRUCTURA,
  BA: CategoriaActivo.BOMBA_AGUA,
};

export function categoriaEnumFromSigla(sigla: string): CategoriaActivo | null {
  return SIGLA_TO_CATEGORIA_ENUM[sigla.toUpperCase()] ?? null;
}
