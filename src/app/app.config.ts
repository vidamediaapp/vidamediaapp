import { ApplicationConfig, APP_INITIALIZER } from '@angular/core';
import {
  provideRouter, withPreloading, PreloadAllModules,
} from '@angular/router';
import {
  provideHttpClient, withInterceptors,
} from '@angular/common/http';
import {
  IonicRouteStrategy, provideIonicAngular,
} from '@ionic/angular/standalone';
import { RouteReuseStrategy } from '@angular/router';

import { routes } from './app.routes';

import { authInterceptor } from './core/interceptors/auth.interceptor';
import { dataUnwrapperInterceptor } from './core/interceptors/data-unwrapper.interceptor';
import { AuthService } from './core/services/auth.service';

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    {
      provide: APP_INITIALIZER,
      useFactory: (auth: AuthService) => () => auth.init(),
      deps: [AuthService],
      multi: true,
    },
    provideIonicAngular({ mode: 'ios' }),
    provideRouter(routes, withPreloading(PreloadAllModules)),

    // ← NECESARIO para que DeudaApiService pueda hacer llamadas HTTP
    // a http://localhost:3000/api
    provideHttpClient(withInterceptors([authInterceptor, dataUnwrapperInterceptor])),
  ],
};
