import { Component, OnInit, OnDestroy, inject, signal, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Chart, registerables } from 'chart.js';
import { AnalyticsApiService, RankingResult } from '../../core/services/analytics.service';
import { Subject } from '../../core/services/dashboard.service';
import { ToastService } from '../../core/services/toast.service';


Chart.register(...registerables);

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-8 animate-fade-in">
      <!-- Header Row -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div class="space-y-1">
          <h2 class="text-xl font-bold text-text-primary">Attendance Analytics</h2>
          <p class="text-xs text-text-secondary">Detailed insights, trends, and course ratios</p>
        </div>

        <div class="flex items-center gap-3">
          <label class="text-xxs font-bold uppercase text-text-muted">Trend Range</label>
          <select
            [(ngModel)]="trendRangeDays"
            (change)="fetchTrendData()"
            class="bg-bg-surface border border-brand-border-subtle hover:border-brand-border rounded-xl px-3 py-2 text-xs text-text-primary outline-none transition-all duration-200 cursor-pointer"
          >
            <option [value]="7">Last 7 Days</option>
            <option [value]="30">Last 30 Days</option>
            <option [value]="90">Last 90 Days</option>
          </select>
        </div>
      </div>

      <!-- Loading skeleton blocks -->
      @if (loading()) {
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div class="lg:col-span-2 h-72 rounded-2xl bg-bg-surface border border-brand-border-subtle animate-pulse"></div>
          <div class="lg:col-span-1 h-72 rounded-2xl bg-bg-surface border border-brand-border-subtle animate-pulse"></div>
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div class="lg:col-span-2 h-72 rounded-2xl bg-bg-surface border border-brand-border-subtle animate-pulse"></div>
          <div class="lg:col-span-1 h-72 rounded-2xl bg-bg-surface border border-brand-border-subtle animate-pulse"></div>
        </div>
      } @else {
        <!-- Row 1: Trend Line Chart and Distribution Doughnut Chart -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Trend line card -->
          <div class="lg:col-span-2 p-5 rounded-2xl border border-brand-border bg-bg-surface shadow-md flex flex-col justify-between">
            <h3 class="font-bold text-xs text-text-primary uppercase tracking-wider mb-4">Attendance Rate Trend</h3>
            <div class="relative w-full h-64">
              <canvas #trendChartCanvas></canvas>
            </div>
          </div>

          <!-- Distribution doughnut card -->
          <div class="lg:col-span-1 p-5 rounded-2xl border border-brand-border bg-bg-surface shadow-md flex flex-col justify-between">
            <h3 class="font-bold text-xs text-text-primary uppercase tracking-wider mb-4">Status Proportions</h3>
            <div class="relative w-full h-64 flex items-center justify-center">
              <canvas #distChartCanvas></canvas>
            </div>
          </div>
        </div>

        <!-- Row 2: Subject Performance Bar Chart and Worst Slacking ranking list -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Course performance card -->
          <div class="lg:col-span-2 p-5 rounded-2xl border border-brand-border bg-bg-surface shadow-md flex flex-col justify-between">
            <h3 class="font-bold text-xs text-text-primary uppercase tracking-wider mb-4">Course Comparison vs Goal</h3>
            <div class="relative w-full h-64">
              <canvas #coursesChartCanvas></canvas>
            </div>
          </div>

          <!-- Worst slacking rank card -->
          <div class="lg:col-span-1 p-5 rounded-2xl border border-brand-border bg-bg-surface shadow-md flex flex-col justify-between">
            <h3 class="font-bold text-xs text-text-primary uppercase tracking-wider mb-4">Slacking subjects ranking</h3>
            
            <div class="flex-1 flex flex-col justify-center divide-y divide-brand-border-subtle mt-2 overflow-y-auto max-h-[256px] pr-1">
              @if (rankings().length === 0) {
                <div class="text-center py-10 text-xs font-semibold text-text-secondary leading-relaxed">
                  No slacking courses found. All subjects are above thresholds!
                </div>
              } @else {
                @for (rank of rankings(); track rank.id; let idx = $index) {
                  <div class="py-3 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                    <div class="flex items-center gap-2.5 min-w-0">
                      <span class="w-6 h-6 rounded-lg bg-bg-elevated border border-brand-border flex items-center justify-center font-bold text-xxs shrink-0"
                            [ngClass]="{
                              'text-red-400 border-red-500/20 bg-red-500/5': idx === 0,
                              'text-text-primary': idx > 0
                            }">
                        #{{ idx + 1 }}
                      </span>
                      <div class="flex flex-col min-w-0">
                        <span class="text-xs font-semibold text-text-primary truncate">{{ rank.name }}</span>
                        <span class="text-[10px] text-text-muted truncate">{{ rank.code }}</span>
                      </div>
                    </div>

                    <div class="text-right shrink-0 space-y-0.5">
                      <div class="text-xs font-bold text-red-400">{{ rank.percentage }}%</div>
                      <div class="text-[9px] font-bold text-text-muted">
                        Needs {{ rank.classesNeeded }} consecutive classes
                      </div>
                    </div>
                  </div>
                }
              }
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class AnalyticsComponent implements OnInit, AfterViewInit, OnDestroy {
  // Chart canvas element references
  @ViewChild('trendChartCanvas') trendChartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('distChartCanvas') distChartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('coursesChartCanvas') coursesChartCanvas!: ElementRef<HTMLCanvasElement>;

  loading = signal<boolean>(true);
  trendRangeDays = 30;
  rankings = signal<RankingResult[]>([]);

  // Instantiated Chart references to destroy on exit
  private trendChartRef: Chart | null = null;
  private distChartRef: Chart | null = null;
  private coursesChartRef: Chart | null = null;

  private analyticsService = inject(AnalyticsApiService);
  private toastService = inject(ToastService);

  ngOnInit(): void {
    this.fetchRankingData();
  }

  ngAfterViewInit(): void {
    // Initial data compilation load
    this.loadChartsData();
  }

  ngOnDestroy(): void {
    // Destroy chart instances to release canvas context memory
    this.destroyCharts();
  }

  private destroyCharts(): void {
    if (this.trendChartRef) this.trendChartRef.destroy();
    if (this.distChartRef) this.distChartRef.destroy();
    if (this.coursesChartRef) this.coursesChartRef.destroy();
  }

  fetchRankingData(): void {
    this.analyticsService.getSubjectRanking().subscribe({
      next: (res) => {
        if (res.success) {
          this.rankings.set(res.data);
        }
      },
    });
  }

  loadChartsData(): void {
    this.loading.set(true);
    
    // Run parallel fetches for charts
    this.analyticsService.getDistribution().subscribe({
      next: (distRes) => {
        this.analyticsService.getSubjectOverview().subscribe({
          next: (overviewRes) => {
            this.analyticsService.getTrend({ rangeDays: this.trendRangeDays }).subscribe({
              next: (trendRes) => {
                this.loading.set(false);
                
                // Allow DOM elements to render before compiling Chart canvas binds
                setTimeout(() => {
                  this.renderTrendChart(trendRes.data);
                  this.renderDistributionChart(distRes.data);
                  this.renderCoursesChart(overviewRes.data);
                }, 0);
              },
              error: () => this.handleError(),
            });
          },
          error: () => this.handleError(),
        });
      },
      error: () => this.handleError(),
    });
  }

  fetchTrendData(): void {
    this.analyticsService.getTrend({ rangeDays: this.trendRangeDays }).subscribe({
      next: (res) => {
        if (res.success && this.trendChartRef) {
          const labels = res.data.map(d => this.formatDateLabel(d.date));
          const dataPoints = res.data.map(d => d.percentage);
          
          this.trendChartRef.data.labels = labels;
          this.trendChartRef.data.datasets[0].data = dataPoints;
          this.trendChartRef.update();
        }
      },
    });
  }

  private handleError(): void {
    this.loading.set(false);
    this.toastService.showError('Could not compile analytics charts details.');
  }

  // --- CHART RENDERING LOGIC ---

  private renderTrendChart(data: any[]): void {
    if (!this.trendChartCanvas) return;
    
    const ctx = this.trendChartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    if (this.trendChartRef) this.trendChartRef.destroy();

    const labels = data.map(d => this.formatDateLabel(d.date));
    const dataPoints = data.map(d => d.percentage);

    // Create gradient fill under line
    const gradient = ctx.createLinearGradient(0, 0, 0, 200);
    gradient.addColorStop(0, 'rgba(99, 102, 241, 0.22)');
    gradient.addColorStop(1, 'rgba(99, 102, 241, 0.01)');

    this.trendChartRef = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Attendance Rate',
          data: dataPoints,
          borderColor: '#6366F1', // Indigo
          backgroundColor: gradient,
          fill: true,
          tension: 0.35,
          borderWidth: 2.5,
          pointBackgroundColor: '#6366F1',
          pointBorderColor: '#0D1117',
          pointBorderWidth: 1.5,
          pointRadius: 3.5,
          spanGaps: true, // Interpolates days with no logged classes
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: '#6B7D96', font: { size: 9, weight: 'bold' } }
          },
          y: {
            min: 0,
            max: 100,
            grid: { color: '#1F2D3F' },
            ticks: { color: '#6B7D96', font: { size: 9 }, callback: (val) => `${val}%` }
          }
        }
      }
    });
  }

  private renderDistributionChart(data: any): void {
    if (!this.distChartCanvas) return;

    const ctx = this.distChartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    if (this.distChartRef) this.distChartRef.destroy();

    this.distChartRef = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Present', 'Absent', 'Cancelled'],
        datasets: [{
          data: [data.presentCount, data.absentCount, data.cancelledCount],
          backgroundColor: ['#34D399', '#F87171', '#46556A'], // Emerald, Red, Slate
          borderWidth: 3,
          borderColor: '#131A23', // Surface color to make spacing clear
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: '#A8B5C8', font: { size: 10, weight: 'bold' }, boxWidth: 12 }
          }
        },
        cutout: '70%',
      }
    });
  }

  private renderCoursesChart(subjects: Subject[]): void {
    if (!this.coursesChartCanvas) return;

    const ctx = this.coursesChartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    if (this.coursesChartRef) this.coursesChartRef.destroy();

    const labels = subjects.map(s => s.name);
    const dataPoints = subjects.map(s => s.stats.percentage === null ? 0 : s.stats.percentage);
    const barColors = subjects.map(s => s.color || '#6366F1');

    this.coursesChartRef = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          data: dataPoints,
          backgroundColor: barColors,
          borderRadius: 6,
          barThickness: 24,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: '#6B7D96', font: { size: 9, weight: 'bold' } }
          },
          y: {
            min: 0,
            max: 100,
            grid: { color: '#1F2D3F' },
            ticks: { color: '#6B7D96', font: { size: 9 }, callback: (val) => `${val}%` }
          }
        }
      }
    });
  }

  private formatDateLabel(dateStr: string): string {
    const date = new Date(dateStr);
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', timeZone: 'UTC' };
    return date.toLocaleDateString('en-US', options);
  }
}
