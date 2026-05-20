const net = require('net');

const ANSI = {
  reset: '\x1b[0m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

const CHECKS = [
  { name: 'PostgreSQL', host: '127.0.0.1', port: 5432, hint: 'Inicia el servicio postgresql-x64-15 o ejecuta scripts/setup-postgres-windows.ps1' },
  { name: 'API NestJS', host: '127.0.0.1', port: 3000, hint: 'cd mindfit-backend && npm run start:dev' },
];

function probe(host, port, timeoutMs = 2000) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let settled = false;

    const finish = (ok) => {
      if (settled) return;
      settled = true;
      socket.destroy();
      resolve(ok);
    };

    socket.setTimeout(timeoutMs);
    socket.once('connect', () => finish(true));
    socket.once('timeout', () => finish(false));
    socket.once('error', () => finish(false));

    socket.connect(port, host);
  });
}

async function main() {
  console.log(`${ANSI.cyan}${ANSI.bold}[Mindfit Link] Diagnóstico del ecosistema...${ANSI.reset}\n`);

  const results = [];
  for (const check of CHECKS) {
    const online = await probe(check.host, check.port);
    results.push({ ...check, online });
    const icon = online ? `${ANSI.green}✓${ANSI.reset}` : `${ANSI.yellow}✗${ANSI.reset}`;
    console.log(`  ${icon} ${check.name} (${check.host}:${check.port})`);
    if (!online) {
      console.log(`    ${ANSI.yellow}⚠ ${check.hint}${ANSI.reset}`);
    }
  }

  const allOnline = results.every((r) => r.online);
  console.log('');

  if (allOnline) {
    console.log(
      `${ANSI.green}${ANSI.bold}🔗 [Mindfit Link] Todo el ecosistema (PostgreSQL + API NestJS) está en línea. Iniciando servidor Angular...${ANSI.reset}\n`,
    );
    process.exit(0);
  }

  console.log(
    `${ANSI.yellow}${ANSI.bold}⚠ [Mindfit Link] Algunos servicios no están disponibles. Angular iniciará de todos modos.${ANSI.reset}\n`,
  );
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
