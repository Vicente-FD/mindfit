import { bootstrapApplication } from '@angular/platform-browser';
import { LOAD_WASM } from 'ngx-scanner-qrcode';
import { appConfig } from './app/app.config';
import { App } from './app/app';

LOAD_WASM('assets/wasm/ngx-scanner-qrcode.wasm').subscribe();

bootstrapApplication(App, appConfig).catch((err) => console.error(err));
