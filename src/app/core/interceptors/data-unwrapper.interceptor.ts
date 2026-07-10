import { HttpInterceptorFn, HttpEventType } from '@angular/common/http';
import { map } from 'rxjs/operators';

export const dataUnwrapperInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    map(event => {
      // Intercept responses to automatically unwrap the { success: true, data: ... } envelope
      if (event.type === HttpEventType.Response) {
        if (event.body && typeof event.body === 'object' && 'success' in event.body && 'data' in event.body) {
          return event.clone({ body: (event.body as any).data });
        }
      }
      return event;
    })
  );
};
