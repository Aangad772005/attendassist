import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-progress-ring',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative flex items-center justify-center" [style.width.px]="size" [style.height.px]="size">
      <svg [attr.width]="size" [attr.height]="size" class="transform -rotate-90">
        <!-- Background track ring -->
        <circle
          [attr.stroke]="trackColor"
          fill="transparent"
          [attr.stroke-width]="strokeWidth"
          [attr.r]="radius"
          [attr.cx]="center"
          [attr.cy]="center"
        />
        <!-- Active indicator ring -->
        @if (percentage !== null) {
          <circle
            [attr.stroke]="ringColor"
            fill="transparent"
            [attr.stroke-width]="strokeWidth"
            [attr.r]="radius"
            [attr.cx]="center"
            [attr.cy]="center"
            [attr.stroke-dasharray]="circumference"
            [attr.stroke-dashoffset]="dashOffset"
            stroke-linecap="round"
            class="transition-all duration-500 ease-out"
          />
        }
      </svg>
      <!-- Center text percentage -->
      <div class="absolute flex flex-col items-center justify-center">
        <span [style.font-size.px]="size * 0.28" class="font-bold tracking-tight text-text-primary">
          {{ percentage !== null ? percentage + '%' : '—' }}
        </span>
      </div>
    </div>
  `,
})
export class ProgressRingComponent implements OnChanges {
  @Input() percentage: number | null = null;
  @Input() required: number = 75;
  @Input() size: number = 60;
  @Input() strokeWidth: number = 5;

  radius = 24;
  center = 30;
  circumference = 0;
  dashOffset = 0;
  
  ringColor = 'var(--color-text-disabled)';
  trackColor = 'rgba(255, 255, 255, 0.03)';

  ngOnChanges(): void {
    // Dynamically adjust dimensions based on input size
    this.center = this.size / 2;
    this.radius = this.center - this.strokeWidth;
    this.circumference = 2 * Math.PI * this.radius;

    if (this.percentage !== null) {
      const pct = Math.min(Math.max(this.percentage, 0), 100);
      this.dashOffset = this.circumference - (pct / 100) * this.circumference;
      
      // Determine color theme based on relative safety boundaries
      const delta = pct - this.required;
      if (delta >= 0) {
        this.ringColor = '#34D399'; // Emerald (Safe)
      } else if (delta >= -10) {
        this.ringColor = '#F59E0B'; // Amber (Warning)
      } else {
        this.ringColor = '#EF4444'; // Red (Danger / Slacking)
      }
    } else {
      this.dashOffset = this.circumference;
      this.ringColor = 'rgba(255, 255, 255, 0.15)';
    }
  }
}
