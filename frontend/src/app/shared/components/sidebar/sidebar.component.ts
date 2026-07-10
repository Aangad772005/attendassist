import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <aside class="w-64 h-screen border-r border-brand-border bg-bg-surface flex flex-col justify-between shrink-0">
      <div>
        <!-- App Branding -->
        <div class="h-16 flex items-center gap-3 px-6 border-b border-brand-border-subtle">
          <div class="w-8 h-8 rounded-lg bg-brand-primary flex items-center justify-center shadow-lg shadow-brand-primary-hover/20">
            <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <span class="font-bold text-lg tracking-tight text-text-primary">AttendAssist</span>
        </div>

        <!-- Navigation Links -->
        <nav class="p-4 flex flex-col gap-1.5">
          <a
            routerLink="/dashboard"
            routerLinkActive="bg-brand-primary/10 text-brand-primary border-l-2 border-brand-primary font-medium"
            [routerLinkActiveOptions]="{ exact: true }"
            class="flex items-center gap-3 px-4 py-3 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-all duration-200"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
            </svg>
            Dashboard
          </a>

          <a
            routerLink="/subjects"
            routerLinkActive="bg-brand-primary/10 text-brand-primary border-l-2 border-brand-primary font-medium"
            class="flex items-center gap-3 px-4 py-3 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-all duration-200"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Subjects
          </a>

          <a
            routerLink="/history"
            routerLinkActive="bg-brand-primary/10 text-brand-primary border-l-2 border-brand-primary font-medium"
            class="flex items-center gap-3 px-4 py-3 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-all duration-200"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Attendance Logs
          </a>

          <a
            routerLink="/analytics"
            routerLinkActive="bg-brand-primary/10 text-brand-primary border-l-2 border-brand-primary font-medium"
            class="flex items-center gap-3 px-4 py-3 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-all duration-200"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
            </svg>
            Analytics
          </a>

          <a
            routerLink="/profile"
            routerLinkActive="bg-brand-primary/10 text-brand-primary border-l-2 border-brand-primary font-medium"
            class="flex items-center gap-3 px-4 py-3 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-all duration-200"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Profile Settings
          </a>

        </nav>
      </div>

      <!-- User footer inside panel -->
      @if (authService.currentUser(); as user) {
        <div class="p-4 border-t border-brand-border-subtle flex items-center gap-3 bg-bg-base/40">
          <div class="w-10 h-10 rounded-full bg-brand-primary-muted border border-brand-primary/20 flex items-center justify-center font-bold text-brand-primary overflow-hidden shrink-0">
            @if (user.avatar) {
              <img [src]="user.avatar" referrerpolicy="no-referrer" class="w-full h-full object-cover" alt="User avatar">
            } @else {
              {{ user.name.charAt(0).toUpperCase() }}
            }
          </div>
          <div class="flex flex-col min-w-0">
            <span class="text-sm font-semibold text-text-primary truncate">{{ user.name }}</span>
            <span class="text-xs text-text-muted truncate">{{ user.email }}</span>
          </div>
        </div>
      }
    </aside>
  `,
})
export class SidebarComponent {
  authService = inject(AuthService);
}
