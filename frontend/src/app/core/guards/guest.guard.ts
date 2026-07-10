import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, skipWhile, take } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';

export const guestGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Convert the isInitializing signal to an observable
  return toObservable(authService.isInitializing).pipe(
    skipWhile(initializing => initializing), // Delay evaluation until session checks complete
    take(1),
    map(() => {
      if (!authService.isAuthenticated()) {
        return true;
      }
      
      router.navigate(['/dashboard']);
      return false;
    })
  );
};
