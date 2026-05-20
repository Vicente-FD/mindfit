"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommonModule = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const typeorm_1 = require("typeorm");
const transaction_context_service_1 = require("./database/transaction-context.service");
const audit_context_interceptor_1 = require("./interceptors/audit-context.interceptor");
let CommonModule = class CommonModule {
};
exports.CommonModule = CommonModule;
exports.CommonModule = CommonModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        providers: [
            transaction_context_service_1.TransactionContextService,
            {
                provide: core_1.APP_INTERCEPTOR,
                scope: common_1.Scope.REQUEST,
                useFactory: (dataSource, transactionContext) => new audit_context_interceptor_1.AuditContextInterceptor(dataSource, transactionContext),
                inject: [typeorm_1.DataSource, transaction_context_service_1.TransactionContextService],
            },
        ],
        exports: [transaction_context_service_1.TransactionContextService],
    })
], CommonModule);
//# sourceMappingURL=common.module.js.map