"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateActivoDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_activo_dto_1 = require("./create-activo.dto");
class UpdateActivoDto extends (0, mapped_types_1.PartialType)(create_activo_dto_1.CreateActivoDto) {
}
exports.UpdateActivoDto = UpdateActivoDto;
//# sourceMappingURL=update-activo.dto.js.map