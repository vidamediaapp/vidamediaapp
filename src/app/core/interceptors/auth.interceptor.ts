import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth   = inject(AuthService);
  const router = inject(Router);
  const token  = auth.token();

  console.log(' Interceptor - Token:', token ? token.substring(0, 20) + '...' : 'NULL');
  console.log(' Interceptor - URL:', req.url);

  const headers: Record<string, string> = {
    'ngrok-skip-browser-warning': 'true',
  };

  if (token) {
    headers['Authorization'] = 'Bearer ' + token;
  }

  const cloned = req.clone({ setHeaders: headers });

  return next(cloned).pipe(
    catchError((error: HttpErrorResponse) => {
      console.error('Interceptor - Error:', error.status, error.url);
      
   
      if (error.status === 401 && !req.url.includes('/auth/')) {
        console.warn('401 en petición no-auth, pero NO deslogueamos automáticamente');
   
      }
      
      return throwError(() => error);
    }),
  );
};