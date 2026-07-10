import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  
  // Set default backend address dynamically based on context host
  const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  const apiBase = isLocal ? 'http://localhost:5001' : 'https://attendassist-backend.onrender.com';
  let clonedRequest = req;


  if (req.url.startsWith('/api')) {
    clonedRequest = req.clone({
      url: `${apiBase}${req.url}`,
      withCredentials: true, // Send session cookies
    });
  }

  return next(clonedRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      // Auto-redirect to login on unauthorized access
      if (error.status === 401 && !clonedRequest.url.includes('/auth/login') && !clonedRequest.url.includes('/auth/status')) {
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};
