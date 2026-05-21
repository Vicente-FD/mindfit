export type TipoReporteSucursal = 'maquina' | 'infraestructura' | 'peticion';

export const TIPOS_REPORTE_SUCURSAL: {
  value: TipoReporteSucursal;
  label: string;
}[] = [
  { value: 'maquina', label: 'Fallo en máquina' },
  { value: 'infraestructura', label: 'Problema de sede' },
  { value: 'peticion', label: 'Petición / faltantes' },
];
