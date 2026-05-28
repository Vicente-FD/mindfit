import { OnGatewayInit } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PasswordResetEventsService } from './password-reset-events.service';
interface SubscribePayload {
    watchToken?: string;
}
export declare class PasswordResetGateway implements OnGatewayInit {
    private readonly events;
    private readonly logger;
    server: Server;
    constructor(events: PasswordResetEventsService);
    afterInit(): void;
    handleSubscribe(client: Socket, body: SubscribePayload): {
        ok: boolean;
    };
    handleSubscribeAdmin(client: Socket): {
        ok: boolean;
    };
}
export {};
