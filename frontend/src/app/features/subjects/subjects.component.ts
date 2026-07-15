import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { SubjectApiService, SafeAbsencesResult, ProjectionResult } from '../../core/services/subject.service';
import { Subject } from '../../core/services/dashboard.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-subjects',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="space-y-6 animate-fade-in relative">
      <!-- Header Row -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div class="space-y-1">
          <h2 class="text-xl font-bold text-text-primary">Course Subjects</h2>
          <p class="text-xs text-text-secondary">Manage classes, target goals, and forecast absence buffers</p>
        </div>

        <div class="flex flex-wrap items-center gap-3">
          <!-- Search input -->
          <div class="relative w-full sm:w-60">
            <input
              type="text"
              placeholder="Search subjects..."
              [(ngModel)]="searchQuery"
              (input)="applyFilters()"
              class="w-full pl-9 pr-4 py-2 bg-bg-surface border border-brand-border-subtle hover:border-brand-border focus:border-brand-primary rounded-xl text-xs outline-none text-text-primary transition-all duration-200"
            />
            <svg class="absolute left-3.5 top-3 w-4.5 h-4.5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <!-- Sorting selection -->
          <select
            [(ngModel)]="sortBy"
            (change)="applyFilters()"
            class="bg-bg-surface border border-brand-border-subtle hover:border-brand-border rounded-xl px-3 py-2 text-xs text-text-primary outline-none transition-all duration-200 cursor-pointer"
          >
            <option value="percentage_asc">Lowest Attendance</option>
            <option value="percentage_desc">Highest Attendance</option>
            <option value="name_asc">Name (A-Z)</option>
            <option value="created_desc">Newly Added</option>
          </select>

          <!-- Toggle Archived Panel -->
          <button
            (click)="toggleViewMode()"
            class="px-3.5 py-2 text-xs font-semibold rounded-xl border transition-all duration-200 cursor-pointer"
            [ngClass]="viewArchived() ? 'bg-brand-primary/10 text-brand-primary border-brand-primary/30' : 'bg-bg-surface border-brand-border hover:bg-bg-hover text-text-secondary'"
          >
            {{ viewArchived() ? 'View Active' : 'View Archived' }}
          </button>

          <!-- Add Course button -->
          <button
            (click)="openCreateModal()"
            class="px-4 py-2 text-xs font-semibold text-white bg-brand-primary hover:bg-brand-primary-hover rounded-xl shadow-md shadow-brand-primary/20 hover:shadow-brand-primary/30 transition-all duration-200 cursor-pointer"
          >
            + Add Course
          </button>
        </div>
      </div>

      <!-- Grid course list cards -->
      @if (loading()) {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (i of [1, 2, 3]; track i) {
            <div class="h-44 rounded-2xl bg-bg-surface border border-brand-border-subtle animate-pulse"></div>
          }
        </div>
      } @else {
        @if (filteredSubjects().length === 0) {
          <div class="flex flex-col items-center justify-center py-20 text-center gap-3 bg-bg-surface rounded-2xl border border-brand-border">
            <div class="w-12 h-12 rounded-full bg-bg-elevated border border-brand-border flex items-center justify-center">
              <svg class="w-6 h-6 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div class="text-sm font-semibold text-text-secondary">
              No {{ viewArchived() ? 'archived' : 'active' }} subjects found
            </div>
            <p class="text-xs text-text-muted">Matches your queries: "{{ searchQuery }}"</p>
          </div>
        } @else {
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            @for (sub of filteredSubjects(); track sub.id) {
              <div class="p-6 rounded-2xl border border-brand-border bg-bg-surface hover:border-brand-border/80 shadow-md relative overflow-hidden transition-all duration-200">
                <!-- Color tag top bar indicator -->
                <div class="absolute top-0 left-0 right-0 h-1" [style.background-color]="sub.color"></div>
                
                <div class="space-y-4">
                  <!-- Title header -->
                  <div class="flex items-start justify-between gap-4">
                    <div class="min-w-0">
                      <span class="text-xxs font-bold uppercase tracking-wider text-text-muted">{{ sub.code }}</span>
                      <h3 class="text-sm font-semibold text-text-primary truncate mt-0.5" [title]="sub.name">{{ sub.name }}</h3>
                      @if (sub.semesterTag) {
                        <span class="inline-block text-xxs font-medium text-text-muted mt-1 px-1.5 py-0.5 rounded bg-bg-elevated border border-brand-border-subtle">
                          {{ sub.semesterTag }}
                        </span>
                      }
                    </div>

                    <!-- Actions dropdown/toggles -->
                    <div class="flex items-center gap-1.5 shrink-0">
                      <button
                        (click)="openEditModal(sub); $event.stopPropagation()"
                        class="p-1.5 rounded-lg border border-brand-border-subtle hover:bg-bg-hover text-text-secondary hover:text-brand-primary transition-colors cursor-pointer"
                        title="Edit Course"
                      >
                        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        (click)="toggleArchiveStatus(sub.id); $event.stopPropagation()"
                        class="p-1.5 rounded-lg border border-brand-border-subtle hover:bg-bg-hover text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                        [title]="sub.isArchived ? 'Restore Course' : 'Archive Course'"
                      >
                        @if (sub.isArchived) {
                          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.334 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" />
                          </svg>
                        } @else {
                          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                          </svg>
                        }
                      </button>
                      <button
                        (click)="confirmDelete(sub.id); $event.stopPropagation()"
                        class="p-1.5 rounded-lg border border-brand-border-subtle hover:bg-red-500/10 hover:border-red-500/20 text-text-secondary hover:text-red-400 transition-colors cursor-pointer"
                        title="Delete Course"
                      >
                        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <!-- Dynamic statistics layout -->
                  <div class="flex items-center justify-between gap-6 pt-2 border-t border-brand-border-subtle">
                    <div class="flex flex-col gap-2">
                      <div class="flex items-baseline gap-3">
                        <div class="flex flex-col">
                          <span class="text-xxs font-semibold uppercase tracking-wider text-text-muted">Current</span>
                          @if (sub.stats.status === 'danger') {
                            <span class="text-sm font-bold text-red-400">{{ sub.stats.percentage !== null ? sub.stats.percentage + '%' : '—' }}</span>
                          } @else {
                            <span class="text-xs font-semibold"
                              [ngClass]="{
                                'text-orange-500': sub.stats.status === 'critical',
                                'text-brand-accent': sub.stats.status === 'safe',
                                'text-amber-500': sub.stats.status === 'warning',
                                'text-text-muted': sub.stats.status === 'no_data'
                              }"
                            >{{ sub.stats.percentage !== null ? sub.stats.percentage + '%' : '—' }}</span>
                          }
                        </div>
                        <span class="text-text-muted text-xs">/</span>
                        <div class="flex flex-col">
                          <span class="text-xxs font-semibold uppercase tracking-wider text-text-muted">Target</span>
                          <span class="text-xs font-semibold text-text-primary">{{ sub.requiredAttendance }}%</span>
                        </div>
                      </div>
                      <div class="flex items-center gap-3 pt-1">
                        <div class="flex flex-col gap-1">
                          <span class="text-[9px] uppercase font-bold text-text-muted">Attended</span>
                          <div class="flex items-center gap-1 bg-bg-surface border border-brand-border-subtle rounded px-1 py-0.5">
                            <button (click)="updateAttendance(sub, -1, 0); $event.stopPropagation()" class="w-5 h-5 rounded hover:bg-bg-hover text-text-muted hover:text-text-primary flex items-center justify-center cursor-pointer transition-colors" [disabled]="sub.stats.attendedClasses <= 0">
                              <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M20 12H4" /></svg>
                            </button>
                            <span class="text-xs font-bold w-4 text-center">{{ sub.stats.attendedClasses }}</span>
                            <button (click)="updateAttendance(sub, 1, 0); $event.stopPropagation()" class="w-5 h-5 rounded hover:bg-brand-primary/10 text-brand-primary flex items-center justify-center cursor-pointer transition-colors" [disabled]="sub.stats.attendedClasses >= sub.stats.totalClasses">
                              <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M12 4v16m8-8H4" /></svg>
                            </button>
                          </div>
                        </div>
                        <div class="flex flex-col gap-1">
                          <span class="text-[9px] uppercase font-bold text-text-muted">Total Held</span>
                          <div class="flex items-center gap-1 bg-bg-surface border border-brand-border-subtle rounded px-1 py-0.5">
                            <button (click)="updateAttendance(sub, 0, -1); $event.stopPropagation()" class="w-5 h-5 rounded hover:bg-bg-hover text-text-muted hover:text-text-primary flex items-center justify-center cursor-pointer transition-colors" [disabled]="sub.stats.totalClasses <= sub.stats.attendedClasses">
                              <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M20 12H4" /></svg>
                            </button>
                            <span class="text-xs font-bold w-4 text-center">{{ sub.stats.totalClasses }}</span>
                            <button (click)="updateAttendance(sub, 0, 1); $event.stopPropagation()" class="w-5 h-5 rounded hover:bg-brand-primary/10 text-brand-primary flex items-center justify-center cursor-pointer transition-colors">
                              <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M12 4v16m8-8H4" /></svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Safety label tags -->
                    <div class="flex flex-col items-end">
                      <span
                        class="px-2 py-0.5 text-[11px] font-bold uppercase rounded"
                        [ngClass]="{
                          'bg-brand-accent/15 text-brand-accent': sub.stats.status === 'safe',
                          'bg-amber-500/15 text-amber-500': sub.stats.status === 'warning',
                          'bg-orange-500/15 text-orange-500': sub.stats.status === 'critical',
                          'bg-red-500/15 text-red-400': sub.stats.status === 'danger',
                          'bg-bg-elevated text-text-muted': sub.stats.status === 'no_data'
                        }"
                      >
                        {{ sub.stats.status === 'no_data' ? 'No Data' : sub.stats.status }}
                      </span>

                      <!-- Safe Absences Spark Balance -->
                      <span class="text-xs text-text-secondary mt-1.5 font-medium">
                        @if (sub.stats.status === 'no_data') {
                          —
                        } @else if (sub.stats.safeAbsences > 0) {
                          <span class="text-brand-accent font-semibold">{{ sub.stats.safeAbsences }} safe bunks</span>
                        } @else if (sub.stats.classesNeededToReachRequired > 0) {
                          <span class="text-red-400 font-semibold">Attend next {{ sub.stats.classesNeededToReachRequired }}</span>
                        } @else {
                          <span>At threshold</span>
                        }
                      </span>
                    </div>
                  </div>

                  <!-- Details and calculations link trigger -->
                  <button
                    (click)="toggleCalculator(sub)"
                    class="w-full mt-3 py-2 bg-bg-elevated hover:bg-bg-hover text-text-primary border border-brand-border text-xs font-semibold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <svg class="w-3.5 h-3.5 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 11h.01M12 7h.01M9 11h.01M12 14h.01M15 11h.01M15 7h.01M3 21h18M3 7a2 2 0 012-2h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
                    </svg>
                    {{ expandedSubjectId() === sub.id ? 'Hide Calculator' : 'Calculator & AI Advice' }}
                  </button>

                  <!-- Inline Calculator Expanded Content -->
                  @if (expandedSubjectId() === sub.id) {
                    <div class="pt-4 mt-4 border-t border-brand-border-subtle space-y-4 animate-fade-in">
                      <div class="p-3 bg-bg-base rounded-xl border border-brand-border-subtle flex flex-col gap-3">
                        <div class="flex items-center justify-between">
                          <div class="text-xxs font-semibold uppercase text-text-muted tracking-wider">Attendance Breakdown</div>
                          <div class="text-xxs font-semibold uppercase text-text-muted tracking-wider text-right">Bunk Balance</div>
                        </div>
                        <div class="flex items-center justify-between">
                          <div class="text-xs font-bold text-text-primary">
                            {{ sub.stats.attendedClasses }} Attended • {{ sub.stats.totalClasses }} Total
                          </div>
                          <div class="text-right">
                            @if (sub.stats.status === 'no_data') {
                              <span class="text-xs text-text-secondary font-bold">No Data</span>
                            } @else if (sub.stats.safeAbsences > 0) {
                              <span class="text-xs font-bold text-brand-accent">{{ sub.stats.safeAbsences }} Available</span>
                            } @else if (sub.stats.classesNeededToReachRequired > 0) {
                              <span class="text-xs font-bold text-red-400">Attend Next {{ sub.stats.classesNeededToReachRequired }}</span>
                            } @else {
                              <span class="text-xs text-text-primary font-bold">At threshold</span>
                            }
                          </div>
                        </div>
                      </div>

                      <div class="space-y-2">
                        <h4 class="text-[10px] font-bold text-text-primary uppercase tracking-wider">Forecast Schedule Projection</h4>
                        <div class="p-3 bg-bg-base/50 rounded-xl border border-brand-border-subtle space-y-3">
                          <div class="grid grid-cols-2 gap-3">
                            <div>
                              <label class="block text-[9px] font-bold text-text-muted uppercase tracking-wider mb-1.5">Future Classes</label>
                              <input
                                type="number"
                                [(ngModel)]="projFutureTotal"
                                (input)="runProjectionForecast()"
                                placeholder="10"
                                class="w-full px-2 py-1.5 bg-bg-base border border-brand-border-subtle focus:border-brand-primary rounded-lg text-xs outline-none text-text-primary transition-colors"
                              />
                            </div>
                            <div>
                              <label class="block text-[9px] font-bold text-text-muted uppercase tracking-wider mb-1.5">Will Attend</label>
                              <input
                                type="number"
                                [(ngModel)]="projFuturePlanned"
                                (input)="runProjectionForecast()"
                                placeholder="8"
                                class="w-full px-2 py-1.5 bg-bg-base border border-brand-border-subtle focus:border-brand-primary rounded-lg text-xs outline-none text-text-primary transition-colors"
                              />
                            </div>
                          </div>
                          @if (projectionResult()) {
                            @let proj = projectionResult();
                            <div class="pt-2 border-t border-brand-border-subtle flex items-center justify-between gap-4 text-xxs font-semibold">
                              <div>
                                <div class="text-text-muted uppercase">Projected Rate</div>
                                <div class="text-sm font-bold text-text-primary mt-0.5">{{ proj?.projectedPercentage }}%</div>
                              </div>
                              <div class="text-right">
                                <div class="text-text-muted uppercase">Projected Health</div>
                                <span class="inline-block px-1.5 py-0.5 rounded text-[9px] uppercase font-bold mt-1"
                                      [ngClass]="{
                                        'bg-brand-accent/15 text-brand-accent': proj?.projectedStatus === 'safe',
                                        'bg-amber-500/15 text-amber-500': proj?.projectedStatus === 'warning',
                                        'bg-red-500/15 text-red-400': proj?.projectedStatus === 'danger'
                                      }">
                                  {{ proj?.projectedStatus }}
                                </span>
                              </div>
                            </div>
                          }
                        </div>
                      </div>

                      <div class="space-y-2">
                        <h4 class="text-[10px] font-bold text-text-primary uppercase tracking-wider">Gemini Advice</h4>
                        @if (aiAdviceLoading()) {
                          <div class="p-3 bg-bg-base/40 rounded-xl border border-brand-border-subtle flex items-center justify-center py-4">
                            <div class="w-4 h-4 border-2 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
                          </div>
                        } @else {
                          @if (aiAdviceText()) {
                            <div class="p-3 bg-brand-primary-muted/20 border border-brand-primary/20 rounded-xl text-xs leading-relaxed text-text-primary">
                              {{ aiAdviceText() }}
                            </div>
                          } @else {
                            <button
                              (click)="fetchAiAdvice(sub.id)"
                              class="w-full py-2 bg-bg-base hover:bg-bg-hover text-brand-primary border border-brand-border-subtle text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                            >
                              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                              </svg>
                              Ask Gemini Advisor
                            </button>
                          }
                        }
                      </div>
                    </div>
                  }
                </div>
              </div>
            }
          </div>
        }
      }

      <!-- Add/Edit Subject Modal Overlay -->
      @if (modalOpen()) {
        <div class="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto py-8 px-4" style="background: rgba(220, 195, 170, 0.65); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);">
          <div class="w-full max-w-md bg-bg-surface border border-brand-border rounded-2xl shadow-2xl animate-fade-in overflow-hidden my-auto">
            <!-- Modal Header -->
            <div class="px-5 py-3 border-b border-brand-border-subtle bg-bg-surface flex items-center justify-between">
              <div>
                <h3 class="text-base font-bold text-text-primary">{{ editMode ? 'Edit Course' : 'Add New Course' }}</h3>
                <p class="text-xs text-text-muted mt-0.5">Track a new academic subject</p>
              </div>
              <button
                (click)="closeCreateModal()"
                class="p-1.5 rounded-lg hover:bg-bg-hover text-text-muted hover:text-text-primary transition-colors cursor-pointer"
              >
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- Modal Body -->
            <form [formGroup]="subjectForm" (ngSubmit)="onSave()" class="p-4 space-y-3">
              <div>
                <label class="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">Subject Name</label>
                <input
                  type="text"
                  formControlName="name"
                  placeholder="e.g. Data Structures"
                  class="w-full px-3 py-2 bg-bg-base border border-brand-border-subtle focus:border-brand-primary rounded-xl text-sm outline-none text-text-primary transition-colors"
                  [ngClass]="{'border-red-500 focus:border-red-500': subjectForm.get('name')?.invalid && subjectForm.get('name')?.touched}"
                />
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">Course Code</label>
                  <input
                    type="text"
                    formControlName="code"
                    placeholder="e.g. CS101"
                    class="w-full px-3 py-2 bg-bg-base border border-brand-border-subtle focus:border-brand-primary rounded-xl text-sm outline-none text-text-primary transition-colors"
                  />
                </div>
                <div>
                  <label class="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">Target %</label>
                  <div class="relative">
                    <input
                      type="number"
                      formControlName="requiredAttendance"
                      placeholder="75"
                      class="w-full px-3 py-2 bg-bg-base border border-brand-border-subtle focus:border-brand-primary rounded-xl text-sm outline-none text-text-primary transition-colors pr-8"
                    />
                    <span class="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted font-bold">%</span>
                  </div>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3 pt-2 border-t border-brand-border-subtle">
                <div>
                  <label class="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">Total Classes Held</label>
                  <input
                    type="number"
                    formControlName="totalClasses"
                    placeholder="0"
                    class="w-full px-3 py-2 bg-bg-base border border-brand-border-subtle focus:border-brand-primary rounded-xl text-sm outline-none text-text-primary transition-colors"
                  />
                </div>
                <div>
                  <label class="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">Classes Attended</label>
                  <input
                    type="number"
                    formControlName="attendedClasses"
                    placeholder="0"
                    class="w-full px-3 py-2 bg-bg-base border border-brand-border-subtle focus:border-brand-primary rounded-xl text-sm outline-none text-text-primary transition-colors"
                  />
                </div>
              </div>

              <!-- Subject Bar Color Picker -->
              <div class="pt-2 border-t border-brand-border-subtle">
                <label class="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1.5">Subject Bar Color</label>
                <div class="flex items-center gap-2 flex-wrap">
                  @for (col of colorPalette; track col) {
                    <button
                      type="button"
                      (click)="selectColor(col)"
                      class="w-7 h-7 rounded-full transition-all duration-150 cursor-pointer flex items-center justify-center border-2"
                      [style.background-color]="col"
                      [style.border-color]="selectedColor() === col ? '#541A1A' : 'transparent'"
                      [style.box-shadow]="selectedColor() === col ? '0 0 0 2px rgba(84,26,26,0.35)' : 'none'"
                      [title]="col"
                    >
                      @if (selectedColor() === col) {
                        <svg class="w-3.5 h-3.5 text-white drop-shadow" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      }
                    </button>
                  }
                  <!-- Custom color input -->
                  <label
                    class="w-7 h-7 rounded-full border-2 border-dashed border-brand-border cursor-pointer flex items-center justify-center relative overflow-hidden transition-all duration-150 hover:border-brand-primary"
                    title="Pick a custom color"
                    [style.background-color]="colorPalette.includes(selectedColor()) ? 'transparent' : selectedColor()"
                  >
                    @if (colorPalette.includes(selectedColor())) {
                      <svg class="w-3.5 h-3.5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                    } @else {
                      <svg class="w-3.5 h-3.5 text-white drop-shadow" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    }
                    <input
                      type="color"
                      [value]="selectedColor()"
                      (input)="selectColor($any($event.target).value)"
                      class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </label>
                </div>
                <!-- Preview strip -->
                <div class="mt-2.5 h-1.5 w-full rounded-full" [style.background-color]="selectedColor()"></div>
              </div>

              <!-- Save button -->
              <button
                type="submit"
                [disabled]="modalLoading()"
                class="w-full mt-1 py-2.5 bg-brand-primary hover:bg-brand-primary-hover disabled:bg-brand-primary/50 text-white font-semibold text-xs rounded-xl shadow-lg transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
              >
                @if (modalLoading()) {
                  <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                }
                Save Course Subject
              </button>

            </form>
          </div>
        </div>
      }


    </div>
  `,
})
export class SubjectsComponent implements OnInit {
  subjects = signal<Subject[]>([]);
  filteredSubjects = signal<Subject[]>([]);

  loading = signal<boolean>(true);
  viewArchived = signal<boolean>(false);

  // Modal toggle state signals
  modalOpen = signal<boolean>(false);
  modalLoading = signal<boolean>(false);
  modalSubmitted = false;
  subjectForm: FormGroup;
  selectedColor = signal<string>('#8BA7F5'); // Default color picker: Periwinkle

  // Detailed Calculator signals
  expandedSubjectId = signal<string | null>(null);
  selectedSubject = signal<Subject | null>(null);

  // Forecast values
  projFutureTotal = 10;
  projFuturePlanned = 8;
  projectionResult = signal<ProjectionResult | null>(null);

  // AI advice
  aiAdviceLoading = signal<boolean>(false);
  aiAdviceText = signal<string>('');

  // Active query parameters
  searchQuery = '';
  sortBy = 'percentage_asc';

  // Palette constants matching color assignments
  colorPalette = [
    '#8BA7F5', // Periwinkle
    '#F5A574', // Peach
    '#FF5733', // Terracotta
    '#A2D2FF', // Pastel Blue
    '#D6C7FF', // Lavender
    '#FFB5D8', // Rose
    '#D2F1B0', // Sage Green
    '#F9D5A5', // Apricot
  ];

  private subjectService = inject(SubjectApiService);
  private toastService = inject(ToastService);
  private fb = inject(FormBuilder);

  constructor() {
    this.subjectForm = this.fb.group({
      name: ['', Validators.required],
      code: [''],
      requiredAttendance: [75, [Validators.required, Validators.min(50), Validators.max(100)]],
      semesterTag: [''],
      totalClasses: [0, [Validators.min(0)]],
      attendedClasses: [0, [Validators.min(0)]],
    });
  }

  ngOnInit(): void {
    this.fetchSubjects();
  }

  fetchSubjects(): void {
    this.loading.set(true);
    // Request subjects from api (includes archived states matching filter)
    this.subjectService.getSubjects({ includeArchived: this.viewArchived() }).subscribe({
      next: (res) => {
        if (res.success) {
          this.subjects.set(res.data);
          this.applyFilters();
        }
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toastService.showError('Failed to load course subjects.');
      },
    });
  }

  toggleViewMode(): void {
    this.viewArchived.update(v => !v);
    this.fetchSubjects();
  }

  applyFilters(): void {
    const query = this.searchQuery.trim().toLowerCase();
    let result = this.subjects();

    // 1. Search Query Filters
    if (query) {
      result = result.filter(
        s => s.name.toLowerCase().includes(query) || (s.code && s.code.toLowerCase().includes(query))
      );
    }

    // 2. Apply Sorts
    if (this.sortBy === 'percentage_asc') {
      result.sort((a, b) => {
        const aPct = a.stats.percentage === null ? -1 : a.stats.percentage;
        const bPct = b.stats.percentage === null ? -1 : b.stats.percentage;
        return aPct - bPct;
      });
    } else if (this.sortBy === 'percentage_desc') {
      result.sort((a, b) => {
        const aPct = a.stats.percentage === null ? -1 : a.stats.percentage;
        const bPct = b.stats.percentage === null ? -1 : b.stats.percentage;
        return bPct - aPct;
      });
    } else if (this.sortBy === 'name_asc') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (this.sortBy === 'created_desc') {
      // Simple fallback created desc (mocking using subject id sorting)
      result.sort((a, b) => b.id.localeCompare(a.id));
    }

    this.filteredSubjects.set(result);
  }

  // Edit state
  editMode = false;
  editingSubjectId: string | null = null;

  // Modal open handlers
  openCreateModal(): void {
    this.editMode = false;
    this.editingSubjectId = null;
    this.subjectForm.reset({
      name: '',
      code: '',
      requiredAttendance: 75,
      semesterTag: '',
      totalClasses: 0,
      attendedClasses: 0,
    });
    this.selectedColor.set(this.colorPalette[0]); // Reset color
    this.modalSubmitted = false;
    this.modalOpen.set(true);
  }

  openEditModal(sub: Subject): void {
    this.editMode = true;
    this.editingSubjectId = sub.id;
    this.subjectForm.patchValue({
      name: sub.name,
      code: sub.code,
      requiredAttendance: sub.requiredAttendance,
      semesterTag: sub.semesterTag,
      totalClasses: sub.stats.totalClasses,
      attendedClasses: sub.stats.attendedClasses,
    });
    this.selectedColor.set(sub.color || this.colorPalette[0]);
    this.modalSubmitted = false;
    this.modalOpen.set(true);
  }

  closeCreateModal(): void {
    this.modalOpen.set(false);
    this.editMode = false;
    this.editingSubjectId = null;
  }

  selectColor(col: string): void {
    this.selectedColor.set(col);
  }

  get sf() {
    return this.subjectForm.controls;
  }

  onSave(): void {
    this.modalSubmitted = true;
    if (this.subjectForm.invalid) {
      return;
    }

    this.modalLoading.set(true);
    const data = {
      ...this.subjectForm.value,
      color: this.selectedColor(),
    };

    if (this.editMode && this.editingSubjectId) {
      this.subjectService.updateSubject(this.editingSubjectId, data).subscribe({
        next: (res) => {
          this.modalLoading.set(false);
          if (res.success) {
            this.toastService.showSuccess('Course subject updated successfully!');
            this.closeCreateModal();
            this.fetchSubjects();
          }
        },
        error: (err) => {
          this.modalLoading.set(false);
          const errorMsg = err.error?.message || 'Failed to update subject.';
          this.toastService.showError(errorMsg);
        },
      });
    } else {
      this.subjectService.createSubject(data).subscribe({
        next: (res) => {
          this.modalLoading.set(false);
          if (res.success) {
            this.toastService.showSuccess('Course subject added successfully!');
            this.closeCreateModal();
            this.fetchSubjects();
          }
        },
        error: (err) => {
          this.modalLoading.set(false);
          const errorMsg = err.error?.message || 'Failed to add subject.';
          this.toastService.showError(errorMsg);
        },
      });
    }
  }

  toggleArchiveStatus(subjectId: string): void {
    this.subjectService.toggleArchive(subjectId).subscribe({
      next: (res) => {
        if (res.success) {
          const action = res.data.isArchived ? 'archived' : 'restored';
          this.toastService.showSuccess(`Course successfully ${action}!`);
          this.fetchSubjects();
        }
      },
    });
  }

  confirmDelete(subjectId: string): void {
    if (confirm('Are you sure you want to delete this subject? All associated logs will be permanently deleted.')) {
      this.subjectService.deleteSubject(subjectId).subscribe({
        next: (res) => {
          if (res.success) {
            this.toastService.showSuccess('Subject deleted.');
            this.fetchSubjects();
          }
        },
        error: () => this.toastService.showError('Failed to delete subject.'),
      });
    }
  }

  updateAttendance(sub: Subject, attendedDelta: number, totalDelta: number): void {
    const newAttended = Math.max(0, sub.stats.attendedClasses + attendedDelta);
    const newTotal = Math.max(0, sub.stats.totalClasses + totalDelta);
    
    // Prevent invalid states instantly
    if (newAttended > newTotal || newAttended < 0 || newTotal < 0) return;

    // Optimistically update local state for snappiness
    sub.stats.attendedClasses = newAttended;
    sub.stats.totalClasses = newTotal;
    sub.stats.absentClasses = newTotal - newAttended;
    
    // Then persist to backend
    this.subjectService.updateSubject(sub.id, {
      totalClasses: newTotal,
      attendedClasses: newAttended
    }).subscribe({
      next: (res) => {
        if (res.success) {
          // Re-fetch everything cleanly in the background to get updated percentages/statuses
          this.fetchSubjects();
        }
      },
      error: () => {
        this.toastService.showError('Failed to sync updated attendance numbers.');
        this.fetchSubjects(); // revert on fail
      }
    });
  }

  // Calculator inline handlers
  toggleCalculator(sub: Subject): void {
    if (this.expandedSubjectId() === sub.id) {
      this.expandedSubjectId.set(null);
      this.selectedSubject.set(null);
    } else {
      this.expandedSubjectId.set(sub.id);
      this.selectedSubject.set(sub);
      this.projFutureTotal = 10;
      this.projFuturePlanned = 8;
      this.projectionResult.set(null);

      // Clear AI advice values
      this.aiAdviceText.set('');
      this.aiAdviceLoading.set(false);

      this.runProjectionForecast();
    }
  }

  runProjectionForecast(): void {
    const sub = this.selectedSubject();
    if (!sub || this.projFutureTotal < 0 || this.projFuturePlanned < 0 || this.projFuturePlanned > this.projFutureTotal) {
      this.projectionResult.set(null);
      return;
    }

    this.subjectService.calculateProjection(sub.id, this.projFutureTotal, this.projFuturePlanned).subscribe({
      next: (res) => {
        if (res.success) {
          this.projectionResult.set(res.data);
        }
      },
    });
  }

  fetchAiAdvice(subjectId: string): void {
    this.aiAdviceLoading.set(true);
    this.subjectService.getCourseAdvice(subjectId).subscribe({
      next: (res) => {
        this.aiAdviceLoading.set(false);
        if (res.success) {
          this.aiAdviceText.set(res.data.advice);
        }
      },
      error: () => {
        this.aiAdviceLoading.set(false);
        this.toastService.showError('Could not fetch Gemini advice.');
      },
    });
  }
}
