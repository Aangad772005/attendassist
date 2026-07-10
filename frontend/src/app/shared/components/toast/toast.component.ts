import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      @for (toast of toastService.toasts(); track toast.id) {
        <div
          class="flex items-center gap-3 p-4 rounded-xl border pointer-events-auto transition-all duration-300 transform translate-y-0 scale-100 shadow-2xl animate-fade-in"
          [ngClass]="{
            'bg-bg-elevated border-brand-border text-text-primary': true,
            'border-l-4 border-l-brand-accent': toast.type === 'success',
            'border-l-4 border-l-red-500': toast.type === 'error',
            'border-l-4 border-l-amber-500': toast.type === 'warning'
          }"
        >
          <!-- Success Indicator -->
          @if (toast.type === 'success') {
            <svg class="w-5 h-5 text-brand-accent shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          <!-- Error Indicator -->
          @if (toast.type === 'error') {
            <svg class="w-5 h-5 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          <!-- Warning Indicator -->
          @if (toast.type === 'warning') {
            <svg class="w-5 h-5 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          }
          
          <div class="text-sm font-medium leading-relaxed">{{ toast.message }}</div>
        </div>
      }
    </div>
  `,
})
export class ToastComponent {
  toastService = inject(ToastService);
}
