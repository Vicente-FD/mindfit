import { Body, Controller, Post } from '@nestjs/common';
import { Public } from './decorators/public.decorator';
import { agentDebugLog } from './agent-debug-log';

@Controller('debug')
export class DebugController {
  @Public()
  @Post('agent-log')
  agentLog(@Body() body: Record<string, unknown>) {
    agentDebugLog({ source: 'frontend', ...body });
    return { ok: true };
  }
}
