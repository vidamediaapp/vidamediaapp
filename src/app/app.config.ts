import { ApplicationConfig } from '@angular/core';
import {
  provideRouter, withPreloading, PreloadAllModules,
} from '@angular/router';
import {
  provideHttpClient, withInterceptorsFromDi,
} from '@angular/common/http';
import {
  IonicRouteStrategy, provideIonicAngular,
} from '@ionic/angular/standalone';
import { RouteReuseStrategy } from '@angular/router';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular({ mode: 'ios' }),
    provideRouter(routes, withPreloading(PreloadAllModules)),

    // ← NECESARIO para que DeudaApiService pueda hacer llamadas HTTP
    // a http://localhost:3000/api
    provideHttpClient(withInterceptorsFromDi()),
  ],
};
