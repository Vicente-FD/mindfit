"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("typeorm");
const path_1 = require("path");
const app_module_1 = require("./app.module");
const evidencias_storage_1 = require("./ordenes-trabajo/storage/evidencias.storage");
const marcas_logo_storage_1 = require("./marcas/storage/marcas-logo.storage");
const boletas_storage_1 = require("./rendiciones-gastos/storage/boletas.storage");
const ANSI = {
    reset: '\x1b[0m',
    bold: '\x1b[1m',
    green: '\x1b[32m',
    cyan: '\x1b[36m',
    yellow: '\x1b[33m',
    orange: '\x1b[38;5;208m',
    white: '\x1b[37m',
    dim: '\x1b[2m',
};
function printStartupBanner(port, dbConnected) {
    const dbStatus = dbConnected
        ? `${ANSI.green}Conectada [OK]${ANSI.reset}`
        : `${ANSI.yellow}Sin conexión [WARN]${ANSI.reset}`;
    const banner = `
${ANSI.orange}${ANSI.bold}┌────────────────────────────────────────────────────────┐
│  🏋️  Mindfit Ops Backend - ONLINE                       │
├────────────────────────────────────────────────────────┤
│  ${ANSI.green}🟢${ANSI.orange} Base de Datos (PostgreSQL): ${dbStatus}${ANSI.orange}         │
│  🔌 API REST Host: ${ANSI.cyan}http://localhost:${port}/api${ANSI.orange}           │
└────────────────────────────────────────────────────────┘${ANSI.reset}
`;
    console.log(banner);
}
async function bootstrap() {
    (0, evidencias_storage_1.ensureUploadDir)();
    (0, marcas_logo_storage_1.ensureMarcasUploadDir)();
    (0, boletas_storage_1.ensureBoletasUploadDir)();
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.useStaticAssets((0, path_1.join)(process.cwd(), 'uploads'), {
        prefix: '/uploads/',
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    app.setGlobalPrefix('api');
    app.enableCors();
    const configService = app.get(config_1.ConfigService);
    const port = configService.get('PORT', 3000);
    let dbConnected = false;
    try {
        const dataSource = app.get(typeorm_1.DataSource);
        dbConnected = dataSource.isInitialized;
        if (dbConnected) {
            await dataSource.query('SELECT 1');
        }
    }
    catch {
        dbConnected = false;
    }
    await app.listen(port);
    printStartupBanner(port, dbConnected);
}
bootstrap();
//# sourceMappingURL=main.js.map