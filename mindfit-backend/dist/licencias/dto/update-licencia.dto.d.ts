import { CreateLicenciaDto } from './create-licencia.dto';
declare const UpdateLicenciaDto_base: import("@nestjs/mapped-types").MappedType<Partial<Omit<CreateLicenciaDto, "tecnicoId">>>;
export declare class UpdateLicenciaDto extends UpdateLicenciaDto_base {
}
export {};
