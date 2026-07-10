import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning';
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private toastCounter = 0;
  toasts = signal<Toast[]>([]);

  show(message: string, type: 'success' | 'error' | 'warning' = 'success') {
    const id = this.toastCounter++;
    const newToast: Toast = { id, message, type };
    
    // Add toast to list
    this.toasts.update(current => [...current, newToast]);

    // Automatically remove toast after 3 seconds
    setTimeout(() => {
      this.toasts.update(current => current.filter(t => t.id !== id));
    }, 3000);
  }

  showSuccess(message: string) {
    this.show(message, 'success');
  }

  showError(message: string) {
    this.show(message, 'error');
  }

  showWarning(message: string) {
    this.show(message, 'warning');
  }
}
