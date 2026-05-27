/**
 * Escribe la fecha del último commit de Git en app-build-info.generated.ts
 * Ejecutado en prestart / prebuild.
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const FRONTEND_ROOT = path.resolve(__dirname, '..');
/** Repositorio Mindfit (padre de mindfit-frontend). */
const REPO_ROOT = path.resolve(FRONTEND_ROOT, '..');
const OUT_FILE = path.join(
  FRONTEND_ROOT,
  'src',
  'app',
  'core',
  'constants',
  'app-build-info.generated.ts',
);

function formatDdMmYyyy(date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

function readGitLastCommit() {
  try {
    const iso = execSync('git log -1 --format=%cI', {
      encoding: 'utf8',
      cwd: REPO_ROOT,
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();

    const short = execSync('git rev-parse --short HEAD', {
      encoding: 'utf8',
      cwd: REPO_ROOT,
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();

    const committedAt = new Date(iso);
    if (Number.isNaN(committedAt.getTime())) {
      throw new Error('Fecha de commit inválida');
    }

    return {
      lastUpdate: formatDdMmYyyy(committedAt),
      commitShort: short,
      commitIso: iso,
    };
  } catch {
    const now = new Date();
    return {
      lastUpdate: formatDdMmYyyy(now),
      commitShort: 'local',
      commitIso: now.toISOString(),
    };
  }
}

function main() {
  const info = readGitLastCommit();
  const content = `/** Archivo generado por scripts/generate-build-info.js — no editar a mano. */
export const APP_BUILD_INFO_GENERATED = {
  /** Fecha del último commit (dd/MM/yyyy). */
  lastUpdate: '${info.lastUpdate}',
  commitShort: '${info.commitShort}',
  commitIso: '${info.commitIso}',
} as const;
`;

  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
  fs.writeFileSync(OUT_FILE, content, 'utf8');
  console.log(
    `[build-info] Última actualización: ${info.lastUpdate} (commit ${info.commitShort})`,
  );
}

main();
