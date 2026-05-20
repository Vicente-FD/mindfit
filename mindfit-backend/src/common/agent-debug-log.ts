import { appendFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';

const LOG_PATH = join(process.cwd(), '..', '.cursor', 'debug-fb9652.log');

export function agentDebugLog(payload: Record<string, unknown>): void {
  try {
    mkdirSync(dirname(LOG_PATH), { recursive: true });
    appendFileSync(
      LOG_PATH,
      `${JSON.stringify({ sessionId: 'fb9652', timestamp: Date.now(), ...payload })}\n`,
    );
  } catch {
    /* ignore logging failures */
  }
}
