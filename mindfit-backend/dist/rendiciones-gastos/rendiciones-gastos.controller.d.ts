import { JwtPayload } from '../common/interfaces/jwt-payload.interface';
import { RendicionesGastosService } from './rendiciones-gastos.service';
import { CreateRendicionGastoDto } from './dto/create-rendicion-gasto.dto';
import { DecidirRendicionGastoDto } from './dto/decidir-rendicion-gasto.dto';
import { FilterListaGastosDto } from './dto/filter-lista-gastos.dto';
export declare class RendicionesGastosController {
    private readonly rendicionesGastosService;
    constructor(rendicionesGastosService: RendicionesGastosService);
    findMiSaldo(user: JwtPayload): Promise<import("./rendiciones-gastos.service").MiSaldoGastosDto>;
    findAdmin(): Promise<import("./rendiciones-gastos.service").AdminGastosDto>;
    findLista(filters: FilterListaGastosDto, user: JwtPayload): Promise<import("./rendiciones-gastos.service").ListaGastosDto>;
    create(user: JwtPayload, dto: CreateRendicionGastoDto, file?: Express.Multer.File): Promise<import("./rendiciones-gastos.service").RendicionGastoDto>;
    decidir(id: number, dto: DecidirRendicionGastoDto): Promise<import("./rendiciones-gastos.service").RendicionGastoDto>;
}
