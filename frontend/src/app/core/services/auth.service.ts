import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, map, catchError, of, finalize } from 'rxjs';
import { ToastService } from './toast.service';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private toastService = inject(ToastService);

  // Signalled auth states
  currentUser = signal<User | null>(null);
  isAuthenticated = signal<boolean>(false);
  isInitializing = signal<boolean>(true);

  constructor() {
    this.checkSessionStatus().subscribe();
  }


  checkSessionStatus(): Observable<boolean> {
    this.isInitializing.set(true);
    return this.http.get<{ success: boolean; data: User }>('/api/v1/auth/status').pipe(
      tap(res => {
        if (res.success && res.data) {
          this.currentUser.set(res.data);
          this.isAuthenticated.set(true);
        }
      }),
      map(res => !!res.success),
      catchError(() => {
        this.currentUser.set(null);
        this.isAuthenticated.set(false);
        return of(false);
      }),
      finalize(() => {
        this.isInitializing.set(false);
      })
    );
  }


  register(data: any): Observable<any> {
    return this.http.post<any>('/api/v1/auth/register', data).pipe(
      tap(res => {
        if (res.success && res.data) {
          this.currentUser.set(res.data);
          this.isAuthenticated.set(true);
          this.toastService.showSuccess(`Welcome aboard, ${res.data.name}!`);
        }
      }),
      catchError(err => {
        const errorMsg = err.error?.message || 'Registration failed. Try again.';
        this.toastService.showError(errorMsg);
        throw err;
      })
    );
  }

  login(credentials: any): Observable<any> {
    return this.http.post<any>('/api/v1/auth/login', credentials).pipe(
      tap(res => {
        if (res.success && res.data) {
          this.currentUser.set(res.data);
          this.isAuthenticated.set(true);
          this.toastService.showSuccess(`Welcome back, ${res.data.name}!`);
        }
      }),
      catchError(err => {
        const errorMsg = err.error?.message || 'Invalid credentials.';
        this.toastService.showError(errorMsg);
        throw err;
      })
    );
  }

  logout(): Observable<any> {
    return this.http.post<any>('/api/v1/auth/logout', {}).pipe(
      tap(() => {
        this.currentUser.set(null);
        this.isAuthenticated.set(false);
        this.toastService.showSuccess('Logged out successfully.');
      }),
      catchError(err => {
        this.currentUser.set(null);
        this.isAuthenticated.set(false);
        throw err;
      })
    );
  }

  updateProfile(profileData: any): Observable<any> {
    return this.http.patch<any>('/api/v1/users/me', profileData).pipe(
      tap(res => {
        if (res.success && res.data) {
          this.currentUser.set(res.data);
          this.toastService.showSuccess('Profile updated successfully.');
        }
      }),
      catchError(err => {
        const errorMsg = err.error?.message || 'Profile update failed.';
        this.toastService.showError(errorMsg);
        throw err;
      })
    );
  }

  requestPasswordReset(email: string): Observable<any> {
    return this.http.post<any>('/api/v1/auth/forgot-password', { email }).pipe(
      tap(() => {
        this.toastService.showSuccess('Reset instructions sent to your email.');
      }),
      catchError(err => {
        const errorMsg = err.error?.message || 'Password reset request failed.';
        this.toastService.showError(errorMsg);
        throw err;
      })
    );
  }

  changePassword(data: any): Observable<any> {
    return this.http.patch<any>('/api/v1/users/me/password', data).pipe(
      tap(() => {
        this.toastService.showSuccess('Password changed successfully.');
      }),
      catchError(err => {
        const errorMsg = err.error?.message || 'Password update failed.';
        this.toastService.showError(errorMsg);
        throw err;
      })
    );
  }

  deleteAccount(confirmPhrase: string): Observable<any> {
    return this.http.delete<any>('/api/v1/users/me', { body: { confirmPhrase } }).pipe(
      tap(() => {
        this.currentUser.set(null);
        this.isAuthenticated.set(false);
        this.toastService.showSuccess('Your account has been deleted.');
      }),
      catchError(err => {
        const errorMsg = err.error?.message || 'Failed to delete account.';
        this.toastService.showError(errorMsg);
        throw err;
      })
    );
  }

}
