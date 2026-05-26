import { RolUsuario } from '../enums';

/** Lectura: dashboards, catálogo, listados CRM. */
export const ROLES_VENTAS_LECTURA: RolUsuario[] = [
  RolUsuario.ADMIN,
  RolUsuario.JEFE_OPERACIONES,
  RolUsuario.EJECUTIVO_VENTAS,
  RolUsuario.GERENTE_BI,
];

/** Alta/edición comercial (cotizaciones, oportunidades, clientes). */
export const ROLES_VENTAS_ESCRITURA: RolUsuario[] = [
  RolUsuario.ADMIN,
  RolUsuario.JEFE_OPERACIONES,
  RolUsuario.EJECUTIVO_VENTAS,
];

/** Aprobación / rechazo de cotizaciones. */
export const ROLES_VENTAS_APROBACION: RolUsuario[] = [
  RolUsuario.ADMIN,
  RolUsuario.JEFE_OPERACIONES,
];
