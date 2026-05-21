"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateRepuestoDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_repuesto_dto_1 = require("./create-repuesto.dto");
class UpdateRepuestoDto extends (0, mapped_types_1.PartialType)(create_repuesto_dto_1.CreateRepuestoDto) {
}
exports.UpdateRepuestoDto = UpdateRepuestoDto;
//# sourceMappingURL=update-repuesto.dto.js.map