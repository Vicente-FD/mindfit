"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var PasswordResetEventsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PasswordResetEventsService = void 0;
const common_1 = require("@nestjs/common");
let PasswordResetEventsService = class PasswordResetEventsService {
    static { PasswordResetEventsService_1 = this; }
    static ADMIN_ROOM = 'admin:recuperacion';
    server = null;
    registerServer(server) {
        this.server = server;
    }
    emitPasswordResetCompleted(watchToken, payload) {
        if (!this.server || !watchToken)
            return;
        this.server
            .to(`reset:${watchToken}`)
            .emit('passwordResetCompleted', payload);
    }
    emitPasswordResetRejected(watchToken, payload) {
        if (!this.server || !watchToken)
            return;
        this.server.to(`reset:${watchToken}`).emit('passwordResetRejected', payload);
    }
    emitAdminPendientesChanged() {
        if (!this.server)
            return;
        this.server
            .to(PasswordResetEventsService_1.ADMIN_ROOM)
            .emit('passwordResetPendientesChanged', { at: new Date().toISOString() });
    }
};
exports.PasswordResetEventsService = PasswordResetEventsService;
exports.PasswordResetEventsService = PasswordResetEventsService = PasswordResetEventsService_1 = __decorate([
    (0, common_1.Injectable)()
], PasswordResetEventsService);
//# sourceMappingURL=password-reset-events.service.js.map