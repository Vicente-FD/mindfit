import { JwtPayload } from '../common/interfaces/jwt-payload.interface';
import { AsignarOrdenDto } from './dto/asignar-orden.dto';
import { CerrarOrdenDto } from './dto/cerrar-orden.dto';
import { CreateComentarioDto } from './dto/create-comentario.dto';
import { CreateEvidenciaDto } from './dto/create-evidencia.dto';
import { CreateOrdenTrabajoDto } from './dto/create-orden-trabajo.dto';
import { UpdateOrdenTrabajoDto } from './dto/update-orden-trabajo.dto';
import { OrdenesTrabajoService } from './ordenes-trabajo.service';
export declare class OrdenesTrabajoController {
    private readonly ordenesService;
    constructor(ordenesService: OrdenesTrabajoService);
    findAll(tecnicoId?: string, sucursalId?: string, user?: JwtPayload): Promise<import("../entities").OrdenTrabajo[]>;
    findMisAsignadas(user: JwtPayload): Promise<import("../entities").OrdenTrabajo[]>;
    findOne(id: number): Promise<import("../entities").OrdenTrabajo>;
    create(dto: CreateOrdenTrabajoDto, user: JwtPayload): Promise<import("../entities").OrdenTrabajo>;
    update(id: number, dto: UpdateOrdenTrabajoDto): Promise<import("../entities").OrdenTrabajo>;
    asignar(id: number, dto: AsignarOrdenDto): Promise<import("../entities").OrdenTrabajo>;
    iniciar(id: number, user: JwtPayload): Promise<import("../entities").OrdenTrabajo>;
    agregarComentario(id: number, dto: CreateComentarioDto, user: JwtPayload): Promise<import("../entities").ComentarioOt>;
    agregarEvidencia(id: number, dto: CreateEvidenciaDto, user: JwtPayload): Promise<import("../entities").EvidenciaOt>;
    cerrar(id: number, dto: CerrarOrdenDto, user: JwtPayload): Promise<import("../entities").OrdenTrabajo>;
    aprobar(id: number): Promise<import("../entities").OrdenTrabajo>;
}
