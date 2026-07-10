import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="h-16 border-b border-brand-border bg-bg-surface flex items-center justify-between px-8 shrink-0">
      <div class="flex items-center gap-4">
        <h1 class="text-lg font-semibold tracking-tight text-text-primary">{{ pageTitle }}</h1>
      </div>

      <div class="flex items-center gap-6">
        <!-- Display session date status -->
        <span class="text-xs font-medium text-text-muted hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-bg-elevated border border-brand-border-subtle">
          <span class="w-1.5 h-1.5 rounded-full bg-brand-accent animate-pulse"></span>
          UTC Tracker Active
        </span>

        <!-- Logout Trigger Button -->
        <button
          (click)="handleLogout()"
          class="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-text-secondary hover:text-red-400 hover:bg-red-500/10 border border-brand-border-subtle hover:border-red-500/20 rounded-lg transition-all duration-200"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </button>
      </div>
    </header>
  `,
})
export class NavbarComponent {
  @Input() pageTitle = 'Dashboard';
  
  authService = inject(AuthService);
  router = inject(Router);

  handleLogout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
    });
  }
}
