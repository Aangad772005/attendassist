import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AttendanceApiService, HistoryFilters, RecentActivity } from '../../core/services/attendance.service';
import { SubjectApiService } from '../../core/services/subject.service';
import { Subject } from '../../core/services/dashboard.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="space-y-6 animate-fade-in">
      <!-- Header Row -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div class="space-y-1">
          <h2 class="text-xl font-bold text-text-primary">Attendance History Logs</h2>
          <p class="text-xs text-text-secondary">Track, edit, or delete past session marks</p>
        </div>

        <button
          (click)="openLogModal()"
          class="px-4 py-2 text-xs font-semibold text-white bg-brand-primary hover:bg-brand-primary-hover rounded-xl shadow-md shadow-brand-primary/20 hover:shadow-brand-primary/30 transition-all duration-200 cursor-pointer self-start md:self-auto"
        >
          + Log Attendance
        </button>
      </div>

      <!-- Filters Panel Card -->
      <div class="p-5 rounded-2xl border border-brand-border bg-bg-surface shadow-md">
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <!-- Course Subject Filter -->
          <div>
            <label class="block text-[10px] font-bold uppercase tracking-wider text-text-muted mb-2">Filter by Subject</label>
            <select
              [(ngModel)]="selectedSubjectId"
              (change)="applyFilters()"
              class="w-full bg-bg-base border border-brand-border-subtle hover:border-brand-border rounded-xl px-3 py-2 text-xs text-text-primary outline-none transition-all duration-200 cursor-pointer"
            >
              <option value="">All Subjects</option>
              @for (sub of subjects(); track sub.id) {
                <option [value]="sub.id">{{ sub.name }} ({{ sub.code }})</option>
              }
            </select>
          </div>

          <!-- Status Filter -->
          <div>
            <label class="block text-[10px] font-bold uppercase tracking-wider text-text-muted mb-2">Filter by Status</label>
            <select
              [(ngModel)]="selectedStatus"
              (change)="applyFilters()"
              class="w-full bg-bg-base border border-brand-border-subtle hover:border-brand-border rounded-xl px-3 py-2 text-xs text-text-primary outline-none transition-all duration-200 cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <!-- Start Date -->
          <div>
            <label class="block text-[10px] font-bold uppercase tracking-wider text-text-muted mb-2">From Date</label>
            <input
              type="date"
              [(ngModel)]="startDate"
              (change)="applyFilters()"
              class="w-full bg-bg-base border border-brand-border-subtle hover:border-brand-border rounded-xl px-3 py-1.5 text-xs text-text-primary outline-none transition-all duration-200 cursor-pointer"
            />
          </div>

          <!-- End Date -->
          <div>
            <label class="block text-[10px] font-bold uppercase tracking-wider text-text-muted mb-2">To Date</label>
            <input
              type="date"
              [(ngModel)]="endDate"
              (change)="applyFilters()"
              class="w-full bg-bg-base border border-brand-border-subtle hover:border-brand-border rounded-xl px-3 py-1.5 text-xs text-text-primary outline-none transition-all duration-200 cursor-pointer"
            />
          </div>
        </div>

        <!-- Reset Button -->
        @if (hasActiveFilters()) {
          <div class="mt-4 flex justify-end">
            <button
              (click)="resetFilters()"
              class="text-xxs font-bold uppercase text-brand-primary hover:text-brand-primary-hover cursor-pointer"
            >
              Clear Filters
            </button>
          </div>
        }
      </div>

      <!-- History Table/List -->
      <div class="p-6 rounded-2xl border border-brand-border bg-bg-surface shadow-md overflow-hidden">
        @if (loading()) {
          <div class="space-y-4">
            @for (i of [1, 2, 3]; track i) {
              <div class="h-16 w-full rounded-xl bg-bg-base/40 animate-pulse"></div>
            }
          </div>
        } @else {
          @if (logs().length === 0) {
            <div class="text-center py-16 flex flex-col items-center justify-center gap-3">
              <div class="w-12 h-12 rounded-full bg-bg-elevated border border-brand-border flex items-center justify-center">
                <svg class="w-6 h-6 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2" />
                </svg>
              </div>
              <div class="text-sm font-semibold text-text-secondary">No attendance logs found</div>
              <p class="text-xs text-text-muted">Modify filters or add logs to populate history.</p>
            </div>
          } @else {
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="border-b border-brand-border text-[10px] uppercase font-bold text-text-muted tracking-wider">
                    <th class="pb-3 pr-4">Date</th>
                    <th class="pb-3 px-4">Subject</th>
                    <th class="pb-3 px-4">Status</th>
                    <th class="pb-3 px-4">Notes</th>
                    <th class="pb-3 pl-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-brand-border-subtle">
                  @for (log of logs(); track log.id) {
                    <tr class="text-xs text-text-primary hover:bg-bg-base/30 transition-colors">
                      <!-- Date component -->
                      <td class="py-4 pr-4 font-semibold text-text-primary whitespace-nowrap">{{ log.date }}</td>
                      
                      <!-- Subject meta -->
                      <td class="py-4 px-4 whitespace-nowrap">
                        <div class="flex items-center gap-2">
                          <span class="w-2.5 h-2.5 rounded-full shrink-0" [style.background-color]="log.subject?.color"></span>
                          <span class="font-medium text-text-primary">{{ log.subject?.name }}</span>
                          <span class="text-xxs text-text-muted font-mono">({{ log.subject?.code }})</span>
                        </div>
                      </td>

                      <!-- Status tag badge -->
                      <td class="py-4 px-4 whitespace-nowrap">
                        <span
                          class="px-2.5 py-0.5 text-[9px] font-bold uppercase rounded border"
                          [ngClass]="{
                            'bg-brand-accent/10 border-brand-accent/25 text-brand-accent': log.status === 'present',
                            'bg-red-500/10 border-red-500/20 text-red-400': log.status === 'absent',
                            'bg-bg-elevated border-brand-border text-text-muted': log.status === 'cancelled'
                          }"
                        >
                          {{ log.status }}
                        </span>
                      </td>

                      <!-- Note description inline toggle -->
                      <td class="py-4 px-4 max-w-xs truncate" [title]="log.note || ''">
                        <span class="text-text-secondary leading-relaxed">{{ log.note || '—' }}</span>
                      </td>

                      <!-- Action buttons -->
                      <td class="py-4 pl-4 text-right whitespace-nowrap">
                        <div class="flex items-center justify-end gap-2">
                          <button
                            (click)="openEditModal(log)"
                            class="p-1.5 rounded-lg border border-brand-border-subtle hover:bg-bg-hover text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                            title="Edit Log"
                          >
                            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                          <button
                            (click)="confirmDelete(log.id)"
                            class="p-1.5 rounded-lg border border-brand-border-subtle hover:bg-red-500/10 hover:border-red-500/20 text-text-secondary hover:text-red-400 transition-colors cursor-pointer"
                            title="Delete Log"
                          >
                            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>

            <!-- Pagination Control Bar -->
            <div class="mt-6 flex items-center justify-between border-t border-brand-border-subtle pt-4 text-xxs font-semibold text-text-secondary">
              <div>
                Showing page {{ currentPage() }} of {{ totalPages() }} ({{ totalLogs() }} total logs)
              </div>
              <div class="flex items-center gap-2">
                <button
                  (click)="changePage(currentPage() - 1)"
                  [disabled]="currentPage() === 1"
                  class="px-3 py-1.5 bg-bg-elevated hover:bg-bg-hover disabled:bg-bg-elevated/50 border border-brand-border rounded-lg disabled:opacity-50 transition-colors cursor-pointer"
                >
                  Prev
                </button>
                <button
                  (click)="changePage(currentPage() + 1)"
                  [disabled]="currentPage() === totalPages()"
                  class="px-3 py-1.5 bg-bg-elevated hover:bg-bg-hover disabled:bg-bg-elevated/50 border border-brand-border rounded-lg disabled:opacity-50 transition-colors cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          }
        }
      </div>

      <!-- Add/Edit Log Modal Overlay -->
      @if (modalOpen()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div class="w-full max-w-md p-6 bg-bg-surface border border-brand-border rounded-2xl shadow-2xl animate-fade-in space-y-6">
            <div class="flex items-center justify-between border-b border-brand-border-subtle pb-3">
              <h3 class="font-bold text-text-primary text-base">
                {{ isEditMode() ? 'Edit Attendance Log' : 'Log New Session' }}
              </h3>
              <button (click)="closeLogModal()" class="text-text-muted hover:text-text-primary cursor-pointer">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form [formGroup]="logForm" (ngSubmit)="onSave()" class="space-y-4">
              <!-- Subject Dropdown (Required only in creation mode) -->
              @if (!isEditMode()) {
                <div>
                  <label class="block text-[10px] font-bold uppercase tracking-wider text-text-muted mb-2">Subject Course</label>
                  <select
                    formControlName="subjectId"
                    class="w-full bg-bg-base border border-brand-border-subtle hover:border-brand-border focus:border-brand-primary rounded-xl px-3 py-2.5 text-xs text-text-primary outline-none transition-all duration-200 cursor-pointer"
                    [ngClass]="{ 'border-red-500/50 focus:border-red-500': modalSubmitted && lf['subjectId'].errors }"
                  >
                    <option value="">Select a subject</option>
                    @for (sub of subjects(); track sub.id) {
                      <option [value]="sub.id">{{ sub.name }} ({{ sub.code }})</option>
                    }
                  </select>
                </div>
              }

              <!-- Date & Status Row -->
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-[10px] font-bold uppercase tracking-wider text-text-muted mb-2">Date</label>
                  <input
                    type="date"
                    formControlName="date"
                    [readonly]="isEditMode()"
                    class="w-full px-4 py-2 bg-bg-base border border-brand-border-subtle hover:border-brand-border focus:border-brand-primary rounded-xl text-xs outline-none text-text-primary transition-all duration-200"
                    [ngClass]="{ 'border-red-500/50 focus:border-red-500': modalSubmitted && lf['date'].errors, 'opacity-60 cursor-not-allowed': isEditMode() }"
                  />
                </div>
                <div>
                  <label class="block text-[10px] font-bold uppercase tracking-wider text-text-muted mb-2">Status</label>
                  <select
                    formControlName="status"
                    class="w-full bg-bg-base border border-brand-border-subtle hover:border-brand-border focus:border-brand-primary rounded-xl px-3 py-2 text-xs text-text-primary outline-none transition-all duration-200 cursor-pointer"
                    [ngClass]="{ 'border-red-500/50 focus:border-red-500': modalSubmitted && lf['status'].errors }"
                  >
                    <option value="present">Present</option>
                    <option value="absent">Absent</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <!-- Note -->
              <div>
                <label class="block text-[10px] font-bold uppercase tracking-wider text-text-muted mb-2">Optional Notes (Max 200 Chars)</label>
                <textarea
                  formControlName="note"
                  placeholder="Medical leave, teacher late, got grade updates..."
                  rows="3"
                  class="w-full px-4 py-2.5 bg-bg-base border border-brand-border-subtle hover:border-brand-border focus:border-brand-primary rounded-xl text-xs outline-none text-text-primary transition-all duration-200 resize-none"
                  [ngClass]="{ 'border-red-500/50 focus:border-red-500': modalSubmitted && lf['note'].errors }"
                ></textarea>
                @if (modalSubmitted && lf['note'].errors) {
                  <span class="text-xxs text-red-500 mt-1 block">Notes cannot exceed 200 characters</span>
                }
              </div>

              <!-- Submit button -->
              <button
                type="submit"
                [disabled]="modalLoading()"
                class="w-full mt-3 py-3 bg-brand-primary hover:bg-brand-primary-hover disabled:bg-brand-primary/50 text-white font-semibold text-xs rounded-xl shadow-lg transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
              >
                @if (modalLoading()) {
                  <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                }
                Save Log Record
              </button>
            </form>
          </div>
        </div>
      }
    </div>
  `,
})
export class HistoryComponent implements OnInit {
  logs = signal<RecentActivity[]>([]);
  subjects = signal<Subject[]>([]);
  
  loading = signal<boolean>(true);
  modalOpen = signal<boolean>(false);
  modalLoading = signal<boolean>(false);
  isEditMode = signal<boolean>(false);
  modalSubmitted = false;
  logForm: FormGroup;
  editingLogId: string | null = null;

  // Pagination states
  currentPage = signal<number>(1);
  totalPages = signal<number>(1);
  totalLogs = signal<number>(0);
  pageSize = 15;

  // Active filter bindings
  selectedSubjectId = '';
  selectedStatus = '';
  startDate = '';
  endDate = '';

  private attendanceService = inject(AttendanceApiService);
  private subjectService = inject(SubjectApiService);
  private toastService = inject(ToastService);
  private fb = inject(FormBuilder);

  constructor() {
    this.logForm = this.fb.group({
      subjectId: ['', Validators.required],
      date: ['', Validators.required],
      status: ['present', Validators.required],
      note: ['', [Validators.maxLength(200)]],
    });
  }

  ngOnInit(): void {
    this.fetchHistory();
    this.fetchActiveSubjects();
  }

  fetchHistory(): void {
    this.loading.set(true);
    
    const filters: HistoryFilters = {};
    if (this.selectedSubjectId) filters.subjectId = this.selectedSubjectId;
    if (this.selectedStatus) filters.status = this.selectedStatus;
    if (this.startDate) filters.startDate = this.startDate;
    if (this.endDate) filters.endDate = this.endDate;

    this.attendanceService.getHistory(filters, {
      page: this.currentPage(),
      limit: this.pageSize,
    }).subscribe({
      next: (res) => {
        this.loading.set(false);
        if (res.success) {
          this.logs.set(res.data);
          this.currentPage.set(res.pagination.page);
          this.totalPages.set(res.pagination.totalPages);
          this.totalLogs.set(res.pagination.total);
        }
      },
      error: () => {
        this.loading.set(false);
        this.toastService.showError('Failed to fetch attendance logs.');
      },
    });
  }

  fetchActiveSubjects(): void {
    this.subjectService.getSubjects({ includeArchived: false }).subscribe({
      next: (res) => {
        if (res.success) {
          this.subjects.set(res.data);
        }
      },
    });
  }

  hasActiveFilters(): boolean {
    return !!(this.selectedSubjectId || this.selectedStatus || this.startDate || this.endDate);
  }

  resetFilters(): void {
    this.selectedSubjectId = '';
    this.selectedStatus = '';
    this.startDate = '';
    this.endDate = '';
    this.currentPage.set(1);
    this.fetchHistory();
  }

  applyFilters(): void {
    this.currentPage.set(1); // Reset page on filter changes
    this.fetchHistory();
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
    this.fetchHistory();
  }

  // Modals operations
  openLogModal(): void {
    this.isEditMode.set(false);
    this.editingLogId = null;
    this.modalSubmitted = false;

    // Normalizes default date to local YYYY-MM-DD
    const todayLocalStr = new Date().toLocaleDateString('en-CA');
    
    this.logForm.reset({
      subjectId: '',
      date: todayLocalStr,
      status: 'present',
      note: '',
    });
    
    // Make subjectId required
    this.logForm.get('subjectId')?.setValidators(Validators.required);
    this.logForm.get('subjectId')?.updateValueAndValidity();

    this.modalOpen.set(true);
  }

  openEditModal(log: RecentActivity): void {
    this.isEditMode.set(true);
    this.editingLogId = log.id;
    this.modalSubmitted = false;

    this.logForm.reset({
      subjectId: log.subject?.id || '',
      date: log.date,
      status: log.status,
      note: log.note || '',
    });

    // Disable subject validation checks inside Edit configurations
    this.logForm.get('subjectId')?.clearValidators();
    this.logForm.get('subjectId')?.updateValueAndValidity();

    this.modalOpen.set(true);
  }

  closeLogModal(): void {
    this.modalOpen.set(false);
  }

  get lf() {
    return this.logForm.controls;
  }

  onSave(): void {
    this.modalSubmitted = true;
    if (this.logForm.invalid) {
      return;
    }

    this.modalLoading.set(true);
    const formVals = this.logForm.value;

    if (this.isEditMode() && this.editingLogId) {
      // Update Log
      this.attendanceService.updateLog(this.editingLogId, {
        status: formVals.status,
        note: formVals.note,
      }).subscribe({
        next: (res) => {
          this.modalLoading.set(false);
          if (res.success) {
            this.toastService.showSuccess('Attendance log updated successfully!');
            this.closeLogModal();
            this.fetchHistory();
          }
        },
        error: (err) => {
          this.modalLoading.set(false);
          const errorMsg = err.error?.message || 'Failed to update log.';
          this.toastService.showError(errorMsg);
        },
      });
    } else {
      // Log New Session
      this.attendanceService.logAttendance({
        subjectId: formVals.subjectId,
        date: formVals.date,
        status: formVals.status,
        note: formVals.note,
      }).subscribe({
        next: (res) => {
          this.modalLoading.set(false);
          if (res.success) {
            this.toastService.showSuccess('Attendance logged successfully!');
            this.closeLogModal();
            this.fetchHistory();
          }
        },
        error: (err) => {
          this.modalLoading.set(false);
          const errorMsg = err.error?.message || 'Failed to log attendance.';
          this.toastService.showError(errorMsg);
        },
      });
    }
  }

  confirmDelete(recordId: string): void {
    if (confirm('Are you sure you want to delete this session log record?')) {
      this.attendanceService.deleteLog(recordId).subscribe({
        next: (res) => {
          if (res.success) {
            this.toastService.showSuccess('Attendance log record deleted.');
            this.fetchHistory();
          }
        },
      });
    }
  }
}
