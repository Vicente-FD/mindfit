import { APP_BUILD_INFO_GENERATED } from './app-build-info.generated';

/** Desarrollador mostrado en el pie del dashboard. */
export const APP_BUILD_INFO = {
  developer: 'Norus',
  lastUpdate: APP_BUILD_INFO_GENERATED.lastUpdate,
  commitShort: APP_BUILD_INFO_GENERATED.commitShort,
} as const;
