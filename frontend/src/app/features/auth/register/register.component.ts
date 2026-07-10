import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  template: `
    <div class="min-h-screen flex flex-col items-center justify-center p-6 bg-bg-base relative overflow-hidden">
      <!-- Dark gradient light leaks background elements -->
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
          <h2 class="text-2xl font-bold tracking-tight text-text-primary">Create Your Account</h2>
          <p class="text-sm text-text-secondary mt-1">Get custom AI coaching and bunk limits</p>
        </div>

        <!-- Main Card -->
        <div class="p-8 rounded-2xl border border-brand-border bg-bg-surface shadow-2xl backdrop-blur-xl">
          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="space-y-5">
            
            <!-- Name Input -->
            <div>
              <label for="name" class="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">FullName</label>
              <input
                id="name"
                type="text"
                formControlName="name"
                placeholder="John Doe"
                class="w-full px-4 py-3 bg-bg-base border border-brand-border-subtle hover:border-brand-border focus:border-brand-primary rounded-xl text-text-primary text-sm outline-none transition-all duration-200"
                [ngClass]="{ 'border-red-500/50 focus:border-red-500': submitted && f['name'].errors }"
              />
              @if (submitted && f['name'].errors) {
                <span class="text-xs text-red-500 mt-1 block">Full name is required</span>
              }
            </div>

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
              <label for="password" class="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">Password</label>
              <input
                id="password"
                type="password"
                formControlName="password"
                placeholder="••••••••"
                (input)="onPasswordInput($any($event.target).value)"
                class="w-full px-4 py-3 bg-bg-base border border-brand-border-subtle hover:border-brand-border focus:border-brand-primary rounded-xl text-text-primary text-sm outline-none transition-all duration-200"
                [ngClass]="{ 'border-red-500/50 focus:border-red-500': submitted && f['password'].errors }"
              />
              
              <!-- Dynamic password checklist (met vs unmet criteria) -->
              <div class="mt-3 grid grid-cols-2 gap-2 text-xxs font-semibold text-text-secondary">
                <div class="flex items-center gap-1.5" [ngClass]="{ 'text-brand-accent': passwordChecks.length }">
                  <span class="w-1.5 h-1.5 rounded-full" [ngClass]="passwordChecks.length ? 'bg-brand-accent' : 'bg-text-disabled'"></span>
                  8+ Characters
                </div>
                <div class="flex items-center gap-1.5" [ngClass]="{ 'text-brand-accent': passwordChecks.uppercase }">
                  <span class="w-1.5 h-1.5 rounded-full" [ngClass]="passwordChecks.uppercase ? 'bg-brand-accent' : 'bg-text-disabled'"></span>
                  1 Uppercase Letter
                </div>
                <div class="flex items-center gap-1.5" [ngClass]="{ 'text-brand-accent': passwordChecks.lowercase }">
                  <span class="w-1.5 h-1.5 rounded-full" [ngClass]="passwordChecks.lowercase ? 'bg-brand-accent' : 'bg-text-disabled'"></span>
                  1 Lowercase Letter
                </div>
                <div class="flex items-center gap-1.5" [ngClass]="{ 'text-brand-accent': passwordChecks.number }">
                  <span class="w-1.5 h-1.5 rounded-full" [ngClass]="passwordChecks.number ? 'bg-brand-accent' : 'bg-text-disabled'"></span>
                  1 Number
                </div>
              </div>
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
              Sign Up
            </button>
          </form>

          <!-- Google OAuth Divider -->
          <div class="my-6 flex items-center justify-between gap-4">
            <span class="h-px bg-brand-border-subtle flex-1"></span>
            <span class="text-xxs font-semibold uppercase tracking-widest text-text-disabled">or continue with</span>
            <span class="h-px bg-brand-border-subtle flex-1"></span>
          </div>

          <!-- Google OAuth link anchor -->
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

        <!-- Footer login prompt redirection links -->
        <p class="text-sm text-text-secondary text-center mt-6">
          Already have an account?
          <a routerLink="/login" class="font-semibold text-brand-primary hover:text-brand-primary-hover underline underline-offset-4 transition-colors">Sign In</a>
        </p>
      </div>
    </div>
  `,
})
export class RegisterComponent {
  registerForm: FormGroup;
  submitted = false;
  loading = false;

  passwordChecks = {
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
  };

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  constructor() {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/), // lowercase, uppercase, number
        ],
      ],
    });
  }

  get f() {
    return this.registerForm.controls;
  }

  onPasswordInput(val: string): void {
    this.passwordChecks.length = val.length >= 8;
    this.passwordChecks.uppercase = /[A-Z]/.test(val);
    this.passwordChecks.lowercase = /[a-z]/.test(val);
    this.passwordChecks.number = /[0-9]/.test(val);
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.registerForm.invalid) {
      return;
    }

    this.loading = true;
    this.authService.register(this.registerForm.value).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.loading = false;
      },
    });
  }
}
