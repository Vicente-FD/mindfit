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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditContextInterceptor = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const rxjs_1 = require("rxjs");
const typeorm_2 = require("typeorm");
const transaction_context_service_1 = require("../database/transaction-context.service");
const WRITE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
let AuditContextInterceptor = class AuditContextInterceptor {
    dataSource;
    transactionContext;
    constructor(dataSource, transactionContext) {
        this.dataSource = dataSource;
        this.transactionContext = transactionContext;
    }
    intercept(context, next) {
        const request = context
            .switchToHttp()
            .getRequest();
        const method = request.method.toUpperCase();
        if (!WRITE_METHODS.has(method) || !request.user?.id) {
            return next.handle();
        }
        return (0, rxjs_1.from)(this.dataSource.transaction(async (manager) => {
            try {
                await manager.query(`SELECT set_config('app.current_user_id', $1, true)`, [String(request.user.id)]);
                this.transactionContext.setManager(manager);
                return await (0, rxjs_1.lastValueFrom)(next.handle());
            }
            finally {
                this.transactionContext.clearManager();
            }
        }));
    }
};
exports.AuditContextInterceptor = AuditContextInterceptor;
exports.AuditContextInterceptor = AuditContextInterceptor = __decorate([
    (0, common_1.Injectable)({ scope: common_1.Scope.REQUEST }),
    __param(0, (0, typeorm_1.InjectDataSource)()),
    __metadata("design:paramtypes", [typeorm_2.DataSource,
        transaction_context_service_1.TransactionContextService])
], AuditContextInterceptor);
//# sourceMappingURL=audit-context.interceptor.js.map