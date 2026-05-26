import { DivisasService } from './divisas.service';
export declare class DivisasController {
    private readonly divisasService;
    constructor(divisasService: DivisasService);
    getTasas(): Promise<import("./divisas.service").TasasDivisaDto>;
}
