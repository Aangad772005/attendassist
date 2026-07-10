import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DashboardApiService, DashboardData, Subject } from '../../core/services/dashboard.service';
import { ProgressRingComponent } from '../../shared/components/progress-ring/progress-ring.component';
import { ToastService } from '../../core/services/toast.service';
// write the template in diff file sir said
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, ProgressRingComponent],
  template: `
    <div class="space-y-8 animate-fade-in">
      <!-- Welcome AI Insight Banner -->
      @if (loading()) {
        <div class="h-32 w-full rounded-2xl bg-bg-surface border border-brand-border-subtle animate-pulse"></div>
      } @else {
        @if (dashboardData(); as data) {
          <div class="p-6 md:p-8 rounded-2xl border border-brand-border bg-bg-surface shadow-2xl relative overflow-hidden">
            <!-- Light leak glow background -->
            <div class="absolute w-72 h-72 rounded-full bg-brand-primary/10 blur-[80px] -top-20 -right-20 pointer-events-none"></div>
            
            <div class="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div class="space-y-2">
                <span class="text-xxs font-bold uppercase tracking-widest text-brand-primary">Gemini Assistant</span>
                <h2 class="text-lg md:text-xl font-semibold leading-relaxed text-text-primary pr-4">
                  {{ data.aiInsight.insight }}
                </h2>
                @if (data.aiInsight.generatedAt) {
                  <p class="text-xxs text-text-muted">
                    Generated {{ getRelativeTime(data.aiInsight.generatedAt) }}
                    @if (data.aiInsight.cached) {
                      <span class="text-brand-accent/70 font-semibold">• Optimized Cache</span>
                    }
                  </p>
                }
              </div>
              <!-- AI Regenerate Action Trigger -->
              <button
                (click)="regenerateInsight()"
                [disabled]="aiRegenerating()"
                class="shrink-0 flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-text-primary bg-bg-elevated hover:bg-bg-hover disabled:bg-bg-elevated/50 border border-brand-border rounded-xl cursor-pointer hover:shadow-lg transition-all duration-200"
              >
                <svg
                  class="w-4 h-4 text-brand-primary"
                  [ngClass]="{ 'animate-spin': aiRegenerating() }"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.228 15h-.582M12 8v4l3 3" />
                </svg>
                Regenerate AI
              </button>
            </div>
          </div>
        }
      }

      <!-- Main Overview Metrics Row -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        @if (loading()) {
          @for (i of [1, 2, 3, 4]; track i) {
            <div class="h-28 rounded-2xl bg-bg-surface border border-brand-border-subtle animate-pulse"></div>
          }
        } @else {
          @if (dashboardData(); as data) {
            <!-- Card 1: Attendance Percentage ProgressRing -->
            <div class="p-6 rounded-2xl border border-brand-border bg-bg-surface flex items-center justify-between shadow-lg">
              <div class="space-y-1">
                <span class="text-xs font-semibold tracking-wider uppercase text-text-muted">Attendance Rate</span>
                <div class="flex items-baseline gap-1">
                  <h3 class="text-2xl font-bold text-text-primary">
                    {{ data.overallStats.overallPercentage !== null ? data.overallStats.overallPercentage + '%' : '—' }}
                  </h3>
                </div>
                <p class="text-xxs text-text-secondary">True Weighted Metrics</p>
              </div>
              <app-progress-ring
                [percentage]="data.overallStats.overallPercentage"
                [size]="64"
                [strokeWidth]="5"
              ></app-progress-ring>
            </div>

            <!-- Card 2: Safe absences bunk balance threshold status -->
            <div class="p-6 rounded-2xl border border-brand-border bg-bg-surface flex flex-col justify-between shadow-lg">
              <div class="space-y-1">
                <span class="text-xs font-semibold tracking-wider uppercase text-text-muted">Attendance Health</span>
                <div class="flex items-center gap-2">
                  <span
                    class="w-2.5 h-2.5 rounded-full"
                    [ngClass]="{
                      'bg-brand-accent': data.overallStats.overallStatus === 'safe',
                      'bg-amber-500': data.overallStats.overallStatus === 'warning',
                      'bg-orange-500': data.overallStats.overallStatus === 'critical',
                      'bg-red-500': data.overallStats.overallStatus === 'danger',
                      'bg-text-disabled': data.overallStats.overallStatus === 'no_data'
                    }"
                  ></span>
                  <span class="text-sm font-bold uppercase text-text-primary tracking-wide">
                    {{ data.overallStats.overallStatus === 'no_data' ? 'No Data' : data.overallStats.overallStatus }}
                  </span>
                </div>
              </div>
              <div class="text-xxs text-text-secondary mt-3">
                @if (data.overallStats.overallStatus === 'safe') {
                  <span class="text-brand-accent font-medium">Streak is currently healthy.</span>
                } @else if (data.overallStats.overallStatus === 'no_data') {
                  <span>Log classes to calculate stats.</span>
                } @else {
                  <span class="text-red-400 font-medium">Bunk balance is critical!</span>
                }
              </div>
            </div>

            <!-- Card 3: Active Subjects tracking counts -->
            <div class="p-6 rounded-2xl border border-brand-border bg-bg-surface flex flex-col justify-between shadow-lg">
              <div class="space-y-1">
                <span class="text-xs font-semibold tracking-wider uppercase text-text-muted">Active Courses</span>
                <h3 class="text-2xl font-bold text-text-primary">{{ data.overallStats.activeSubjectCount }}</h3>
              </div>
              <div class="text-xxs text-text-muted mt-3">
                Tracking {{ data.overallStats.subjectCount }} subjects total
              </div>
            </div>

            <!-- Card 4: Session Counters present vs absent breakdown -->
            <div class="p-6 rounded-2xl border border-brand-border bg-bg-surface flex flex-col justify-between shadow-lg">
              <div class="space-y-1">
                <span class="text-xs font-semibold tracking-wider uppercase text-text-muted">Session Logs</span>
                <div class="flex items-baseline gap-3 text-text-primary text-sm font-semibold">
                  <span class="text-brand-accent">{{ data.overallStats.totalAttended }} P</span>
                  <span class="text-red-400">{{ data.overallStats.totalAbsent }} A</span>
                  <span class="text-text-muted">{{ data.overallStats.totalCancelled }} C</span>
                </div>
              </div>
              <div class="text-xxs text-text-muted mt-3">
                Total {{ data.overallStats.totalClasses }} active lectures
              </div>
            </div>
          }
        }
      </div>

      <!-- Secondary Row: Quick Mark Widget & Weekly Trend Columns Chart -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Column 1: Quick Mark Widget (Lists Active Courses with quick buttons) -->
        <div class="lg:col-span-1 flex flex-col gap-4">
          <div class="flex items-center justify-between px-2">
            <h3 class="font-bold text-text-primary text-base">Quick Mark Today</h3>
            <span class="text-xxs text-text-muted font-medium">Tap to log attendance</span>
          </div>

          <div class="p-5 rounded-2xl border border-brand-border bg-bg-surface shadow-md flex-1 flex flex-col gap-4">
            @if (loading()) {
              @for (i of [1, 2, 3]; track i) {
                <div class="h-14 rounded-xl bg-bg-base animate-pulse"></div>
              }
            } @else {
              @if (dashboardData()?.subjects?.length === 0) {
                <div class="flex flex-col items-center justify-center py-12 text-center gap-3">
                  <a routerLink="/subjects" class="w-10 h-10 rounded-full bg-bg-elevated border border-brand-border flex items-center justify-center hover:bg-bg-hover hover:border-brand-primary/50 transition-colors cursor-pointer group">
                    <svg class="w-5 h-5 text-text-muted group-hover:text-brand-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </a>
                  <div class="text-sm font-semibold text-text-secondary">No active subjects</div>
                  <a routerLink="/subjects" class="text-xs text-brand-primary font-bold hover:underline">Add Course Subject</a>
                </div>
              } @else {
                <div class="flex flex-col gap-3 overflow-y-auto max-h-[350px] pr-1">
                  @for (sub of dashboardData()?.subjects; track sub.id) {
                    <div class="p-3 bg-bg-base border border-brand-border-subtle rounded-xl flex items-center justify-between gap-4">
                      <!-- Subject Label -->
                      <div class="flex items-center gap-2.5 min-w-0">
                        <span class="w-2.5 h-2.5 rounded-full shrink-0" [style.background-color]="sub.color"></span>
                        <div class="flex flex-col min-w-0">
                          <span class="text-xs font-semibold text-text-primary truncate">{{ sub.name }}</span>
                          <span class="text-xxs text-text-muted truncate">{{ sub.code }}</span>
                        </div>
                      </div>
                      
                      <!-- Inline Quick mark Buttons -->
                      <div class="flex items-center gap-1 shrink-0">
                        <button
                          (click)="quickMark(sub.id, 'present')"
                          [disabled]="actionLoading(sub.id)"
                          class="w-7 h-7 rounded-lg flex items-center justify-center border border-brand-border-subtle hover:border-brand-accent/30 text-text-secondary hover:text-brand-accent bg-bg-elevated hover:bg-brand-accent-muted/20 disabled:opacity-50 transition-colors cursor-pointer"
                          title="Mark Present"
                        >
                          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                        <button
                          (click)="quickMark(sub.id, 'absent')"
                          [disabled]="actionLoading(sub.id)"
                          class="w-7 h-7 rounded-lg flex items-center justify-center border border-brand-border-subtle hover:border-red-500/30 text-text-secondary hover:text-red-400 bg-bg-elevated hover:bg-red-500/10 disabled:opacity-50 transition-colors cursor-pointer"
                          title="Mark Absent"
                        >
                          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                        <button
                          (click)="quickMark(sub.id, 'cancelled')"
                          [disabled]="actionLoading(sub.id)"
                          class="w-7 h-7 rounded-lg flex items-center justify-center border border-brand-border-subtle hover:border-text-muted/30 text-text-secondary hover:text-text-primary bg-bg-elevated hover:bg-bg-hover disabled:opacity-50 transition-colors cursor-pointer"
                          title="Mark Cancelled"
                        >
                          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  }
                </div>
              }
            }
          </div>
        </div>

        <!-- Column 2-3: SVG Weekly Trend Stacked Columns Chart -->
        <div class="lg:col-span-2 flex flex-col gap-4">
          <div class="flex items-center justify-between px-2">
            <h3 class="font-bold text-text-primary text-base">Weekly Trend Sparkline</h3>
            <div class="flex items-center gap-3 text-xxs font-semibold">
              <span class="flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-brand-accent"></span> Present</span>
              <span class="flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-red-400"></span> Absent</span>
              <span class="flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-text-disabled"></span> Cancelled</span>
            </div>
          </div>

          <div class="p-5 rounded-2xl border border-brand-border bg-bg-surface shadow-md flex-1 flex flex-col items-center justify-center">
            @if (loading()) {
              <div class="h-48 w-full bg-bg-base/40 rounded-xl animate-pulse"></div>
            } @else {
              <!-- Stacked Column Chart SVG rendering -->
              <svg viewBox="0 0 460 200" class="w-full h-auto max-h-[220px]">
                <!-- Grid background horizontal lines -->
                <line x1="30" y1="30" x2="440" y2="30" stroke="var(--color-brand-border-subtle)" stroke-width="1" stroke-dasharray="3,3" />
                <line x1="30" y1="80" x2="440" y2="80" stroke="var(--color-brand-border-subtle)" stroke-width="1" stroke-dasharray="3,3" />
                <line x1="30" y1="130" x2="440" y2="130" stroke="var(--color-brand-border-subtle)" stroke-width="1" stroke-dasharray="3,3" />
                <line x1="30" y1="160" x2="440" y2="160" stroke="var(--color-brand-border)" stroke-width="1.5" />

                <!-- Bar columns iteration -->
                @for (day of dashboardData()?.weeklyTrend; track day.date; let idx = $index) {
                  @let maxClasses = getMaxClassesInTrend();
                  @let scaleFactor = 120 / maxClasses;
                  
                  @let presHeight = day.present * scaleFactor;
                  @let absHeight = day.absent * scaleFactor;
                  @let cancHeight = day.cancelled * scaleFactor;

                  <!-- X position for each day slot -->
                  @let xPos = idx * 56 + 46;

                  <!-- Stack elements calculations -->
                  <!-- 1. Present starts at baseline (160) and grows upwards -->
                  @if (day.present > 0) {
                    <rect
                      [attr.x]="xPos"
                      [attr.y]="160 - presHeight"
                      width="24"
                      [attr.height]="presHeight"
                      fill="#34D399"
                      rx="3"
                    />
                  }

                  <!-- 2. Absent sits on top of Present -->
                  @if (day.absent > 0) {
                    <rect
                      [attr.x]="xPos"
                      [attr.y]="160 - presHeight - absHeight"
                      width="24"
                      [attr.height]="absHeight"
                      fill="#F87171"
                      rx="3"
                    />
                  }

                  <!-- 3. Cancelled sits on top of Absent -->
                  @if (day.cancelled > 0) {
                    <rect
                      [attr.x]="xPos"
                      [attr.y]="160 - presHeight - absHeight - cancHeight"
                      width="24"
                      [attr.height]="cancHeight"
                      fill="#46556A"
                      rx="3"
                    />
                  }

                  <!-- Date Weekday labels below columns -->
                  <text
                    [attr.x]="xPos + 12"
                    y="180"
                    fill="var(--color-text-muted)"
                    font-size="9"
                    font-weight="bold"
                    text-anchor="middle"
                  >
                    {{ getWeekdayLabel(day.date) }}
                  </text>
                }
              </svg>
            }
          </div>
        </div>
      </div>

      <!-- Third Row: Recent Activity feed -->
      <div class="space-y-4">
        <h3 class="font-bold text-text-primary text-base px-2">Recent Activity Logs</h3>
        
        <div class="p-6 rounded-2xl border border-brand-border bg-bg-surface shadow-md">
          @if (loading()) {
            @for (i of [1, 2]; track i) {
              <div class="h-16 w-full rounded-xl bg-bg-base/40 mb-3 animate-pulse"></div>
            }
          } @else {
            @if (dashboardData()?.recentActivity?.length === 0) {
              <div class="text-center py-12 text-sm font-semibold text-text-secondary leading-relaxed">
                No attendance classes logged recently. Use the quick mark tool or navigate to history to log sessions.
              </div>
            } @else {
              <div class="divide-y divide-brand-border-subtle">
                @for (act of dashboardData()?.recentActivity; track act.id) {
                  <div class="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-6">
                    <div class="flex items-center gap-4 min-w-0">
                      <!-- Status badge coloring wrapper -->
                      <span
                        class="px-2.5 py-1 text-xxs font-bold uppercase rounded-md shrink-0 border"
                        [ngClass]="{
                          'bg-brand-accent/10 border-brand-accent/25 text-brand-accent': act.status === 'present',
                          'bg-red-500/10 border-red-500/20 text-red-400': act.status === 'absent',
                          'bg-bg-elevated border-brand-border text-text-muted': act.status === 'cancelled'
                        }"
                      >
                        {{ act.status }}
                      </span>

                      <!-- Subject metadata -->
                      <div class="flex flex-col min-w-0">
                        <div class="flex items-center gap-2">
                          <span class="w-2 h-2 rounded-full shrink-0" [style.background-color]="act.subject?.color"></span>
                          <span class="text-xs font-semibold text-text-primary truncate">{{ act.subject?.name }}</span>
                        </div>
                        @if (act.note) {
                          <span class="text-xxs text-text-muted mt-1 leading-relaxed truncate">{{ act.note }}</span>
                        }
                      </div>
                    </div>

                    <!-- Date stamp -->
                    <span class="text-xxs text-text-muted font-bold whitespace-nowrap shrink-0 uppercase tracking-wider">
                      {{ act.date }}
                    </span>
                  </div>
                }
              </div>
            }
          }
        </div>
      </div>
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  dashboardData = signal<DashboardData | null>(null);
  loading = signal<boolean>(true);
  aiRegenerating = signal<boolean>(false);

  // Track loading ids of inline subject marks to disable buttons during fetch
  activeActionSubjectId = signal<string | null>(null);

  private dashboardService = inject(DashboardApiService);
  private toastService = inject(ToastService);

  ngOnInit(): void {
    this.fetchDashboard();
  }

  fetchDashboard(showAiSpinner = false): void {
    if (showAiSpinner) {
      this.aiRegenerating.set(true);
    } else {
      this.loading.set(true);
    }

    this.dashboardService.getDashboard().subscribe({
      next: (res) => {
        if (res.success) {
          this.dashboardData.set(res.data);
        }
        this.loading.set(false);
        this.aiRegenerating.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.aiRegenerating.set(false);
        this.toastService.showError('Failed to fetch dashboard metrics data.');
      },
    });
  }

  regenerateInsight(): void {
    this.aiRegenerating.set(true);
    this.dashboardService.regenerateAiInsight().subscribe({
      next: (res) => {
        if (res.success) {
          this.toastService.showSuccess('Gemini AI prompt insights regenerated.');
          this.fetchDashboard(false);
        } else {
          this.aiRegenerating.set(false);
        }
      },
      error: () => {
        this.aiRegenerating.set(false);
        this.toastService.showError('Could not regenerate AI insights.');
      },
    });
  }

  actionLoading(subjectId: string): boolean {
    return this.activeActionSubjectId() === subjectId;
  }

  quickMark(subjectId: string, status: 'present' | 'absent' | 'cancelled'): void {
    this.activeActionSubjectId.set(subjectId);

    // Normalizes to today's local date converted to YYYY-MM-DD
    const todayLocalStr = new Date().toLocaleDateString('en-CA'); // Outputs YYYY-MM-DD cleanly

    this.dashboardService.markAttendance({
      subjectId,
      date: todayLocalStr,
      status,
      note: 'Quick Logged from Dashboard widget'
    }).subscribe({
      next: (res) => {
        this.activeActionSubjectId.set(null);
        if (res.success) {
          this.toastService.showSuccess(`Session quick-marked as ${status}!`);
          this.fetchDashboard(false); // Reload all stats and sparklines in place
        }
      },
      error: (err) => {
        this.activeActionSubjectId.set(null);
        const errorMsg = err.error?.message || 'Failed to mark attendance.';
        this.toastService.showError(errorMsg);
      }
    });
  }

  getMaxClassesInTrend(): number {
    const data = this.dashboardData();
    if (!data || !data.weeklyTrend) return 1;
    const maxVal = Math.max(...data.weeklyTrend.map((d: any) => d.present + d.absent + d.cancelled), 1);
    return maxVal;
  }

  getWeekdayLabel(dateStr: string): string {
    const date = new Date(dateStr);
    const options: Intl.DateTimeFormatOptions = { weekday: 'short', timeZone: 'UTC' };
    return date.toLocaleDateString('en-US', options).toUpperCase();
  }

  getRelativeTime(dateTimeStr: string): string {
    const date = new Date(dateTimeStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;

    const diffHrs = Math.round(diffMins / 60);
    if (diffHrs < 24) return `${diffHrs}h ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}
