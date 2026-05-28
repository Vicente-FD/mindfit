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
var PasswordResetGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PasswordResetGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const common_1 = require("@nestjs/common");
const socket_io_1 = require("socket.io");
const password_reset_events_service_1 = require("./password-reset-events.service");
let PasswordResetGateway = PasswordResetGateway_1 = class PasswordResetGateway {
    events;
    logger = new common_1.Logger(PasswordResetGateway_1.name);
    server;
    constructor(events) {
        this.events = events;
    }
    afterInit() {
        this.events.registerServer(this.server);
        this.logger.log('Gateway /password-reset listo');
    }
    handleSubscribe(client, body) {
        const watchToken = body?.watchToken?.trim();
        if (!watchToken || watchToken.length < 16) {
            return { ok: false };
        }
        void client.join(`reset:${watchToken}`);
        return { ok: true };
    }
    handleSubscribeAdmin(client) {
        void client.join('admin:recuperacion');
        return { ok: true };
    }
};
exports.PasswordResetGateway = PasswordResetGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], PasswordResetGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('subscribe'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Object)
], PasswordResetGateway.prototype, "handleSubscribe", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('subscribeAdmin'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket]),
    __metadata("design:returntype", Object)
], PasswordResetGateway.prototype, "handleSubscribeAdmin", null);
exports.PasswordResetGateway = PasswordResetGateway = PasswordResetGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({
        namespace: '/password-reset',
        cors: { origin: true, credentials: true },
    }),
    __metadata("design:paramtypes", [password_reset_events_service_1.PasswordResetEventsService])
], PasswordResetGateway);
//# sourceMappingURL=password-reset.gateway.js.map