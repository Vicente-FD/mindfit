"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateVehiculoDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_vehiculo_dto_1 = require("./create-vehiculo.dto");
class UpdateVehiculoDto extends (0, mapped_types_1.PartialType)(create_vehiculo_dto_1.CreateVehiculoDto) {
}
exports.UpdateVehiculoDto = UpdateVehiculoDto;
//# sourceMappingURL=update-vehiculo.dto.js.map