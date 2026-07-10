import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div class="space-y-1">
        <h2 class="text-xl font-bold text-text-primary">Profile & Settings</h2>
        <p class="text-xs text-text-secondary">Customize your preferences, manage thresholds, and secure account credentials</p>
      </div>

      <!-- Settings Layout Split grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        <!-- Left Column: Preference Quick Settings -->
        <div class="space-y-6 md:col-span-1">


          <!-- Account Summary card -->
          @if (authService.currentUser(); as user) {
            <div class="p-6 rounded-2xl border border-brand-border bg-bg-surface shadow-md flex flex-col items-center text-center gap-4">
              <div class="w-16 h-16 rounded-full bg-brand-primary-muted border-2 border-brand-primary/20 flex items-center justify-center font-bold text-lg text-brand-primary overflow-hidden shadow-inner">
                @if (user.avatar) {
                  <img [src]="user.avatar" referrerpolicy="no-referrer" class="w-full h-full object-cover" alt="User avatar">
                } @else {
                  {{ user.name.charAt(0).toUpperCase() }}
                }
              </div>
              <div class="space-y-1">
                <h4 class="text-sm font-bold text-text-primary leading-tight">{{ user.name }}</h4>
                <p class="text-xxs text-text-muted">{{ user.email }}</p>
              </div>
            </div>
          }
        </div>

        <!-- Right Column: Editing profiles & Password details -->
        <div class="space-y-8 md:col-span-2">
          <!-- Edit profile Details form -->
          <div class="p-6 rounded-2xl border border-brand-border bg-bg-surface shadow-md space-y-6">
            <h3 class="font-bold text-xs text-text-primary uppercase tracking-wider border-b border-brand-border-subtle pb-3">Edit Profile</h3>
            
            <form [formGroup]="profileForm" (ngSubmit)="onSaveProfile()" class="space-y-4">
              <!-- Name input -->
              <div>
                <label class="block text-[10px] font-bold uppercase tracking-wider text-text-muted mb-2">FullName</label>
                <input
                  type="text"
                  formControlName="name"
                  placeholder="Aangad Sharma"
                  class="w-full px-4 py-2.5 bg-bg-base border border-brand-border-subtle hover:border-brand-border focus:border-brand-primary rounded-xl text-xs outline-none text-text-primary transition-all duration-200"
                  [ngClass]="{ 'border-red-500/50 focus:border-red-500': profileSubmitted && pf['name'].errors }"
                />
              </div>

              <!-- Email address (Read Only) -->
              <div>
                <label class="block text-[10px] font-bold uppercase tracking-wider text-text-muted mb-2">Email Address (Cannot change)</label>
                <input
                  type="email"
                  formControlName="email"
                  readonly
                  class="w-full px-4 py-2.5 bg-bg-base/60 border border-brand-border-subtle rounded-xl text-xs outline-none text-text-muted cursor-not-allowed opacity-70"
                />
              </div>

              <button
                type="submit"
                [disabled]="profileLoading"
                class="px-4 py-2 text-xs font-semibold text-white bg-brand-primary hover:bg-brand-primary-hover disabled:bg-brand-primary/50 rounded-xl shadow-md transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
              >
                @if (profileLoading) {
                  <div class="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                }
                Update Settings
              </button>
            </form>
          </div>

          <!-- Change password form -->
          <div class="p-6 rounded-2xl border border-brand-border bg-bg-surface shadow-md space-y-6">
            <h3 class="font-bold text-xs text-text-primary uppercase tracking-wider border-b border-brand-border-subtle pb-3">Update Password</h3>
            
            <form [formGroup]="passwordForm" (ngSubmit)="onSavePassword()" class="space-y-4">
              <!-- Old Password -->
              <div>
                <label class="block text-[10px] font-bold uppercase tracking-wider text-text-muted mb-2">Current Password</label>
                <input
                  type="password"
                  formControlName="oldPassword"
                  placeholder="••••••••"
                  class="w-full px-4 py-2.5 bg-bg-base border border-brand-border-subtle hover:border-brand-border focus:border-brand-primary rounded-xl text-xs outline-none text-text-primary transition-all duration-200"
                  [ngClass]="{ 'border-red-500/50 focus:border-red-500': passwordSubmitted && pwf['oldPassword'].errors }"
                />
              </div>

              <!-- New Password -->
              <div>
                <label class="block text-[10px] font-bold uppercase tracking-wider text-text-muted mb-2">New Password</label>
                <input
                  type="password"
                  formControlName="newPassword"
                  placeholder="••••••••"
                  class="w-full px-4 py-2.5 bg-bg-base border border-brand-border-subtle hover:border-brand-border focus:border-brand-primary rounded-xl text-xs outline-none text-text-primary transition-all duration-200"
                  [ngClass]="{ 'border-red-500/50 focus:border-red-500': passwordSubmitted && pwf['newPassword'].errors }"
                />
                @if (passwordSubmitted && pwf['newPassword'].errors) {
                  <span class="text-xxs text-red-500 mt-1.5 block">Password must be at least 8 characters and include uppercase, lowercase, and numeric inputs.</span>
                }
              </div>

              <button
                type="submit"
                [disabled]="passwordLoading"
                class="px-4 py-2 text-xs font-semibold text-white bg-brand-primary hover:bg-brand-primary-hover disabled:bg-brand-primary/50 rounded-xl shadow-md transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
              >
                @if (passwordLoading) {
                  <div class="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                }
                Change Password
              </button>
            </form>
          </div>

          <!-- Delete account panel -->
          <div class="p-6 rounded-2xl border border-red-500/20 bg-red-500/5 shadow-md space-y-4">
            <h3 class="font-bold text-xs text-red-400 uppercase tracking-wider">Danger Zone</h3>
            
            <div class="space-y-1">
              <div class="text-xs font-semibold text-text-primary">Delete Account</div>
              <p class="text-xxs text-text-secondary leading-relaxed">
                Once deleted, your account is permanently deactivated. All courses and associated logs will be soft-deleted. This action is irreversible.
              </p>
            </div>

            <div class="space-y-3 pt-2">
              <label class="block text-[9px] font-bold uppercase tracking-wider text-red-400">
                Type exactly <span class="text-text-primary font-extrabold select-all">delete my account</span> to confirm:
              </label>
              
              <div class="flex flex-col sm:flex-row items-stretch gap-3">
                <input
                  type="text"
                  [(ngModel)]="deleteConfirmPhrase"
                  placeholder="delete my account"
                  class="flex-1 px-4 py-2 bg-bg-base border border-red-500/20 hover:border-red-500/35 focus:border-red-500 rounded-xl text-xs outline-none text-text-primary transition-all duration-200"
                />
                
                <button
                  (click)="handleDeleteAccount()"
                  [disabled]="deleteConfirmPhrase.toLowerCase() !== 'delete my account' || deleteLoading"
                  class="px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-red-500/30 text-white font-semibold text-xs rounded-xl cursor-pointer disabled:cursor-not-allowed transition-all duration-200 shrink-0"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  `,
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  passwordForm: FormGroup;
  
  profileSubmitted = false;
  profileLoading = false;

  passwordSubmitted = false;
  passwordLoading = false;

  // Deletion binds
  deleteConfirmPhrase = '';
  deleteLoading = false;

  authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private toastService = inject(ToastService);
  private router = inject(Router);

  constructor() {
    this.profileForm = this.fb.group({
      name: ['', Validators.required],
      email: [{ value: '', disabled: true }],
    });

    this.passwordForm = this.fb.group({
      oldPassword: ['', Validators.required],
      newPassword: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/),
        ],
      ],
    });
  }

  ngOnInit(): void {
    // Load currentUser profile into settings forms
    const user = this.authService.currentUser();
    if (user) {
      this.profileForm.patchValue({
        name: user.name,
        email: user.email,
      });
    }
  }

  get pf() {
    return this.profileForm.controls;
  }

  get pwf() {
    return this.passwordForm.controls;
  }

  onSaveProfile(): void {
    this.profileSubmitted = true;
    if (this.profileForm.invalid) {
      return;
    }

    this.profileLoading = true;
    this.authService.updateProfile({ name: this.profileForm.value.name }).subscribe({
      next: () => {
        this.profileLoading = false;
        this.profileSubmitted = false;
      },
      error: () => {
        this.profileLoading = false;
      },
    });
  }

  onSavePassword(): void {
    this.passwordSubmitted = true;
    if (this.passwordForm.invalid) {
      return;
    }

    this.passwordLoading = true;
    this.authService.changePassword(this.passwordForm.value).subscribe({
      next: () => {
        this.passwordLoading = false;
        this.passwordSubmitted = false;
        this.passwordForm.reset();
      },
      error: () => {
        this.passwordLoading = false;
      },
    });
  }

  handleDeleteAccount(): void {
    if (this.deleteConfirmPhrase.toLowerCase() !== 'delete my account') {
      return;
    }

    if (confirm('Final warning: Are you absolutely sure you want to delete your account? This will clear all data.')) {
      this.deleteLoading = true;
      this.authService.deleteAccount(this.deleteConfirmPhrase).subscribe({
        next: () => {
          this.deleteLoading = false;
          this.router.navigate(['/login']);
        },
        error: () => {
          this.deleteLoading = false;
        },
      });
    }
  }
}
