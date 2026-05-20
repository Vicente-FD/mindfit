"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateMarcaDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_marca_dto_1 = require("./create-marca.dto");
class UpdateMarcaDto extends (0, mapped_types_1.PartialType)(create_marca_dto_1.CreateMarcaDto) {
}
exports.UpdateMarcaDto = UpdateMarcaDto;
//# sourceMappingURL=update-marca.dto.js.map