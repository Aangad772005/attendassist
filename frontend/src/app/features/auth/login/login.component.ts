import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, FormsModule],

  template: `
    <div class="min-h-screen flex flex-col items-center justify-center p-6 bg-bg-base relative overflow-hidden">
      <!-- Dark gradient light leaks backgrounds -->
      <div class="absolute w-[500px] h-[500px] rounded-full bg-brand-primary/10 blur-[120px] -top-40 -left-40 pointer-events-none"></div>
      <div class="absolute w-[500px] h-[500px] rounded-full bg-brand-accent/5 blur-[120px] -bottom-40 -right-40 pointer-events-none"></div>

      <div class="w-full max-w-md animate-fade-in z-10">
        <!-- Logo Branding header -->
        <div class="flex flex-col items-center mb-8 text-center">
          <div class="w-12 h-12 rounded-xl bg-brand-primary flex items-center justify-center shadow-2xl shadow-brand-primary/35 mb-4">
            <svg width="24" height="24" class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 00-2-2m2 2a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h2 class="text-2xl font-bold tracking-tight text-text-primary">Welcome to AttendAssist</h2>
          <p class="text-sm text-text-secondary mt-1">Take control of your attendance streak</p>
        </div>

        <!-- Main Card -->
        <div class="p-8 rounded-2xl border border-brand-border bg-bg-surface shadow-2xl backdrop-blur-xl relative">
          
          <!-- Normal Login Form Mode -->
          @if (!isForgotPasswordMode) {
            <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-5">
              
              <!-- Email Input -->
              <div>
                <label for="email" class="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">Email Address</label>
                <input
                  id="email"
                  type="email"
                  formControlName="email"
                  placeholder="john.doe@university.edu"
                  class="w-full px-4 py-3 bg-bg-base border border-brand-border-subtle hover:border-brand-border focus:border-brand-primary rounded-xl text-text-primary text-sm outline-none transition-all duration-200"
                  [ngClass]="{ 'border-red-500/50 focus:border-red-500': submitted && f['email'].errors }"
                />
                @if (submitted && f['email'].errors) {
                  <span class="text-xs text-red-500 mt-1 block">Please enter a valid email address</span>
                }
              </div>

              <!-- Password Input -->
              <div>
                <div class="flex items-center justify-between mb-2">
                  <label for="password" class="block text-xs font-semibold uppercase tracking-wider text-text-muted">Password</label>
                  <button
                    type="button"
                    (click)="toggleForgotPassword(true)"
                    class="text-xs font-medium text-brand-primary hover:text-brand-primary-hover transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>
                <input
                  id="password"
                  type="password"
                  formControlName="password"
                  placeholder="••••••••"
                  class="w-full px-4 py-3 bg-bg-base border border-brand-border-subtle hover:border-brand-border focus:border-brand-primary rounded-xl text-text-primary text-sm outline-none transition-all duration-200"
                  [ngClass]="{ 'border-red-500/50 focus:border-red-500': submitted && f['password'].errors }"
                />
                @if (submitted && f['password'].errors) {
                  <span class="text-xs text-red-500 mt-1 block">Password is required</span>
                }
              </div>

              <!-- Submit button -->
              <button
                type="submit"
                [disabled]="loading"
                class="w-full py-3 bg-brand-primary hover:bg-brand-primary-hover disabled:bg-brand-primary/50 text-white font-semibold text-sm rounded-xl shadow-lg shadow-brand-primary/20 hover:shadow-brand-primary/30 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
              >
                @if (loading) {
                  <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                }
                Sign In
              </button>
            </form>
          } @else {
            <!-- Forgot Password Request Form Mode -->
            <form (ngSubmit)="onResetSubmit()" class="space-y-5">
              <div>
                <h3 class="text-lg font-bold text-text-primary mb-1">Reset Password</h3>
                <p class="text-xs text-text-secondary leading-relaxed mb-4">
                  Enter your email address below. We'll send you an link to reset your account credentials password.
                </p>
                
                <label for="resetEmail" class="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">Email Address</label>
                <input
                  id="resetEmail"
                  type="email"
                  [(ngModel)]="resetEmail"
                  name="resetEmail"
                  placeholder="john.doe@university.edu"
                  required
                  class="w-full px-4 py-3 bg-bg-base border border-brand-border-subtle hover:border-brand-border focus:border-brand-primary rounded-xl text-text-primary text-sm outline-none transition-all duration-200"
                />
              </div>

              <div class="flex flex-col gap-3">
                <button
                  type="submit"
                  [disabled]="loading || !resetEmail"
                  class="w-full py-3 bg-brand-primary hover:bg-brand-primary-hover disabled:bg-brand-primary/50 text-white font-semibold text-sm rounded-xl shadow-lg transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
                >
                  @if (loading) {
                    <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  }
                  Send Reset Link
                </button>

                <button
                  type="button"
                  (click)="toggleForgotPassword(false)"
                  class="w-full py-2 bg-transparent text-text-secondary hover:text-text-primary font-medium text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Back to Log In
                </button>
              </div>
            </form>
          }

          <!-- Google OAuth Divider -->
          <div class="my-6 flex items-center justify-between gap-4">
            <span class="h-px bg-brand-border-subtle flex-1"></span>
            <span class="text-xxs font-semibold uppercase tracking-widest text-text-disabled">or continue with</span>
            <span class="h-px bg-brand-border-subtle flex-1"></span>
          </div>

          <!-- Google OAuth anchor trigger -->
          <a
            href="http://localhost:5001/api/v1/auth/google"
            class="w-full py-3 bg-bg-elevated hover:bg-bg-hover text-text-primary border border-brand-border font-semibold text-sm rounded-xl transition-all duration-200 flex items-center justify-center gap-3 shadow-md shadow-black/10 cursor-pointer hover:shadow-black/20"
          >
            <!-- Google Icon SVG -->
            <svg width="20" height="20" class="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.555 0-6.437-2.882-6.437-6.437s2.882-6.437 6.437-6.437c1.554 0 2.98.555 4.093 1.482l3.078-3.078C19.122 2.122 15.932 1 12.24 1 5.928 1 1 5.928 1 12.24s4.928 11.24 11.24 11.24c5.892 0 10.87-4.22 10.87-10.285 0-.583-.056-1.166-.168-1.728l-10.702-.182z"/>
            </svg>
            Google OAuth Session
          </a>

        </div>

        <!-- Footer Onboarding prompt -->
        @if (!isForgotPasswordMode) {
          <p class="text-sm text-text-secondary text-center mt-6">
            New to AttendAssist?
            <a routerLink="/register" class="font-semibold text-brand-primary hover:text-brand-primary-hover underline underline-offset-4 transition-colors">Create Account</a>
          </p>
        }
      </div>
    </div>
  `,
})
export class LoginComponent {
  loginForm: FormGroup;
  submitted = false;
  loading = false;
  isForgotPasswordMode = false;
  resetEmail = '';

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastService = inject(ToastService);

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  get f() {
    return this.loginForm.controls;
  }

  toggleForgotPassword(show: boolean): void {
    this.isForgotPasswordMode = show;
    this.submitted = false;
    this.loading = false;
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  onResetSubmit(): void {
    if (!this.resetEmail) {
      return;
    }

    this.loading = true;
    this.authService.requestPasswordReset(this.resetEmail).subscribe({
      next: () => {
        this.loading = false;
        this.isForgotPasswordMode = false;
        this.resetEmail = '';
      },
      error: () => {
        this.loading = false;
      },
    });
  }
}
