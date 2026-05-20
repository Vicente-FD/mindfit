"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.agentDebugLog = agentDebugLog;
const fs_1 = require("fs");
const path_1 = require("path");
const LOG_PATH = (0, path_1.join)(process.cwd(), '..', '.cursor', 'debug-fb9652.log');
function agentDebugLog(payload) {
    try {
        (0, fs_1.mkdirSync)((0, path_1.dirname)(LOG_PATH), { recursive: true });
        (0, fs_1.appendFileSync)(LOG_PATH, `${JSON.stringify({ sessionId: 'fb9652', timestamp: Date.now(), ...payload })}\n`);
    }
    catch {
    }
}
//# sourceMappingURL=agent-debug-log.js.map