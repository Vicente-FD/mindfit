import { ConfigService } from '@nestjs/config';
import type { JwtPayload } from '../common/interfaces/jwt-payload.interface';
import { ActualizarEstadoFacilidadDto } from './dto/actualizar-estado-facilidad.dto';
import { ReportarAreaServiciosDto } from './dto/reportar-area-servicios.dto';
import { ReportarFallaFacilidadDto } from './dto/reportar-falla-facilidad.dto';
import { FacilidadesCriticasService } from './facilidades-criticas.service';
export declare class FacilidadesCriticasController {
    private readonly facilidadesService;
    private readonly configService;
    constructor(facilidadesService: FacilidadesCriticasService, configService: ConfigService);
    miSucursal(user: JwtPayload): Promise<import("./dto/facilidad-critica-response.dto").FacilidadesResumenDto>;
    resumenSedes(): Promise<import("./dto/facilidad-critica-response.dto").SedeSemaforoResumenDto[]>;
    reportarAreaServicios(foto: Express.Multer.File, dto: ReportarAreaServiciosDto, user: JwtPayload): Promise<import("./dto/facilidad-critica-response.dto").ReportarAreaServiciosResultDto>;
    porSucursal(sucursalId: number, user: JwtPayload): Promise<import("./dto/facilidad-critica-response.dto").FacilidadesResumenDto>;
    historial(id: number, user: JwtPayload): Promise<import("./dto/facilidad-critica-response.dto").FacilidadHistorialItemDto[]>;
    reportarFalla(id: number, dto: ReportarFallaFacilidadDto, user: JwtPayload): Promise<import("./dto/facilidad-critica-response.dto").FacilidadCriticaItemDto>;
    actualizarEstado(id: number, dto: ActualizarEstadoFacilidadDto, user: JwtPayload): Promise<import("./dto/facilidad-critica-response.dto").FacilidadCriticaItemDto>;
}
