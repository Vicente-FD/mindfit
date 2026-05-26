import { Vehiculo } from '../entities/vehiculo.entity';
export declare const DIAS_ALERTA_VENCIMIENTO = 30;
export declare const KM_ALERTA_ACEITE = 1000;
export interface AlertasVehiculo {
    soap: boolean;
    permiso: boolean;
    revision: boolean;
    aceite: boolean;
}
export declare function diasHastaVencimiento(fecha: string | Date): number;
export declare function alertaPorFecha(fecha: string | Date): boolean;
export declare function alertaPorAceite(v: Pick<Vehiculo, 'kilometrajeActual' | 'siguienteCambioAceiteKm'>): boolean;
export declare function calcularAlertasVehiculo(v: Vehiculo): AlertasVehiculo;
export declare function vehiculoRequiereAtencion(v: Vehiculo): boolean;
