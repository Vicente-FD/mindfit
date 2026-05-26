"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateLicenciaDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_licencia_dto_1 = require("./create-licencia.dto");
class UpdateLicenciaDto extends (0, mapped_types_1.PartialType)((0, mapped_types_1.OmitType)(create_licencia_dto_1.CreateLicenciaDto, ['tecnicoId'])) {
}
exports.UpdateLicenciaDto = UpdateLicenciaDto;
//# sourceMappingURL=update-licencia.dto.js.map