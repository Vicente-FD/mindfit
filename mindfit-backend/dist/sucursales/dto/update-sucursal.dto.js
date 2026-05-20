"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateSucursalDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_sucursal_dto_1 = require("./create-sucursal.dto");
class UpdateSucursalDto extends (0, mapped_types_1.PartialType)(create_sucursal_dto_1.CreateSucursalDto) {
}
exports.UpdateSucursalDto = UpdateSucursalDto;
//# sourceMappingURL=update-sucursal.dto.js.map