import { DataSource } from 'typeorm';
import { TransactionContextService } from '../common/database/transaction-context.service';
import { OrdenTrabajo } from '../entities/orden-trabajo.entity';
import { EvidenciaOt } from '../entities/evidencia-ot.entity';
import { ComentarioOt } from '../entities/comentario-ot.entity';
import { CreateOrdenTrabajoDto } from './dto/create-orden-trabajo.dto';
import { UpdateOrdenTrabajoDto } from './dto/update-orden-trabajo.dto';
import { AsignarOrdenDto } from './dto/asignar-orden.dto';
import { CreateComentarioDto } from './dto/create-comentario.dto';
import { CreateEvidenciaDto } from './dto/create-evidencia.dto';
import { CerrarOrdenDto } from './dto/cerrar-orden.dto';
export declare class OrdenesTrabajoService {
    private readonly dataSource;
    private readonly transactionContext;
    constructor(dataSource: DataSource, transactionContext: TransactionContextService);
    private ordenRepo;
    private evidenciaRepo;
    private comentarioRepo;
    private generarCodigoOt;
    findAll(filters?: {
        tecnicoId?: number;
        sucursalId?: number;
    }): Promise<OrdenTrabajo[]>;
    findOne(id: number): Promise<OrdenTrabajo>;
    create(dto: CreateOrdenTrabajoDto, creadoPorId: number): Promise<OrdenTrabajo>;
    update(id: number, dto: UpdateOrdenTrabajoDto): Promise<OrdenTrabajo>;
    asignar(id: number, dto: AsignarOrdenDto): Promise<OrdenTrabajo>;
    iniciar(id: number, tecnicoId: number): Promise<OrdenTrabajo>;
    agregarComentario(ordenId: number, autorId: number, dto: CreateComentarioDto): Promise<ComentarioOt>;
    agregarEvidencia(ordenId: number, cargadoPorId: number, dto: CreateEvidenciaDto): Promise<EvidenciaOt>;
    cerrar(id: number, tecnicoId: number, dto: CerrarOrdenDto): Promise<OrdenTrabajo>;
    aprobar(id: number): Promise<OrdenTrabajo>;
}
