import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-google-callback',
  standalone: true,
  template: `
    <div class="min-h-screen flex flex-col items-center justify-center bg-bg-base p-6">
      <div class="flex flex-col items-center gap-4">
        <div class="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
        <p class="text-sm font-semibold tracking-tight text-text-secondary animate-pulse">Syncing Google Account...</p>
      </div>
    </div>
  `,
})
export class GoogleCallbackComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastService = inject(ToastService);

  ngOnInit(): void {
    // Re-verify session status to load profile from the backend session cookie
    this.authService.checkSessionStatus().subscribe({
      next: (isAuthenticated) => {
        if (isAuthenticated) {
          this.router.navigate(['/dashboard']);
        } else {
          this.toastService.showError('Google authentication failed. Please login manually.');
          this.router.navigate(['/login']);
        }
      },
      error: () => {
        this.toastService.showError('An error occurred during sync. Please try again.');
        this.router.navigate(['/login']);
      }
    });
  }
}
