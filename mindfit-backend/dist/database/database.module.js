"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const _1730000000000_AuditTrigger_1 = require("./migrations/1730000000000-AuditTrigger");
let DatabaseModule = class DatabaseModule {
    dataSource;
    constructor(dataSource) {
        this.dataSource = dataSource;
    }
    async onModuleInit() {
        const migration = new _1730000000000_AuditTrigger_1.AuditTrigger1730000000000();
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        try {
            await migration.up(queryRunner);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            if (!message.includes('already exists')) {
                throw error;
            }
        }
        finally {
            await queryRunner.release();
        }
    }
};
exports.DatabaseModule = DatabaseModule;
exports.DatabaseModule = DatabaseModule = __decorate([
    (0, common_1.Module)({}),
    __metadata("design:paramtypes", [typeorm_1.DataSource])
], DatabaseModule);
//# sourceMappingURL=database.module.js.map