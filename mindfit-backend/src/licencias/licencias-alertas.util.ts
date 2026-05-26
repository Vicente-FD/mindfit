import { DIAS_ALERTA_VENCIMIENTO, diasHastaVencimiento } from '../vehiculos/flota-alertas.util';

export function licenciaRequiereAtencion(fechaVencimiento: string | Date): boolean {
  return diasHastaVencimiento(fechaVencimiento) <= DIAS_ALERTA_VENCIMIENTO;
}

export { diasHastaVencimiento, DIAS_ALERTA_VENCIMIENTO };
