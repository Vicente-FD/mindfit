import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DataSource } from 'typeorm';
import { join } from 'path';
import { AppModule } from './app.module';
import { ensureUploadDir } from './ordenes-trabajo/storage/evidencias.storage';
import { ensureMarcasUploadDir } from './marcas/storage/marcas-logo.storage';
import { ensureBoletasUploadDir } from './rendiciones-gastos/storage/boletas.storage';
import { ensureLicenciasUploadDir } from './licencias/storage/licencias-documentos.storage';

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

function printStartupBanner(port: number, dbConnected: boolean): void {
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
  ensureUploadDir();
  ensureMarcasUploadDir();
  ensureBoletasUploadDir();
  ensureLicenciasUploadDir();
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useWebSocketAdapter(new IoAdapter(app));

  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.setGlobalPrefix('api');
  app.enableCors();

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3000);

  let dbConnected = false;
  try {
    const dataSource = app.get(DataSource);
    dbConnected = dataSource.isInitialized;
    if (dbConnected) {
      await dataSource.query('SELECT 1');
    }
  } catch {
    dbConnected = false;
  }

  await app.listen(port);
  printStartupBanner(port, dbConnected);
}
bootstrap();
