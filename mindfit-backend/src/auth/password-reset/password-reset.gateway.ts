import {
  ConnectedSocket,
  MessageBody,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { PasswordResetEventsService } from './password-reset-events.service';

interface SubscribePayload {
  watchToken?: string;
}

@WebSocketGateway({
  namespace: '/password-reset',
  cors: { origin: true, credentials: true },
})
export class PasswordResetGateway implements OnGatewayInit {
  private readonly logger = new Logger(PasswordResetGateway.name);

  @WebSocketServer()
  server!: Server;

  constructor(private readonly events: PasswordResetEventsService) {}

  afterInit(): void {
    this.events.registerServer(this.server);
    this.logger.log('Gateway /password-reset listo');
  }

  @SubscribeMessage('subscribe')
  handleSubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: SubscribePayload,
  ): { ok: boolean } {
    const watchToken = body?.watchToken?.trim();
    if (!watchToken || watchToken.length < 16) {
      return { ok: false };
    }
    void client.join(`reset:${watchToken}`);
    return { ok: true };
  }

  @SubscribeMessage('subscribeAdmin')
  handleSubscribeAdmin(@ConnectedSocket() client: Socket): { ok: boolean } {
    void client.join('admin:recuperacion');
    return { ok: true };
  }
}
