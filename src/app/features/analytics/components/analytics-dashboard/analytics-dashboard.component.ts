import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { StateService } from '@core/services/state.service';
import { AnalyticsService } from '../../services/analytics.service';
import { AnalyticsData } from '../../models/analytics.model';

@Component({
  selector: 'app-analytics-dashboard',
  templateUrl: './analytics-dashboard.component.html',
  styleUrls: ['./analytics-dashboard.component.scss'],
  standalone: false
})
export class AnalyticsDashboardComponent implements OnInit {
  private destroyRef = inject(DestroyRef);

  analyticsData: AnalyticsData | null = null;
  loading = true;
  chartMax = 1;
  Math = Math; // Expose Math to template

  /** Written by the Users feature; read here without importing it. */
  selectedUser$ = inject(StateService).selectedUser$;

  constructor(private analyticsService: AnalyticsService) {}

  ngOnInit(): void {
    this.loadAnalytics();
  }

  loadAnalytics(): void {
    this.loading = true;
    this.analyticsService
      .getAnalyticsData()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(data => {
        this.analyticsData = data;
        this.chartMax = Math.max(1, ...data.chartData.map(point => point.value));
        this.loading = false;
      });
  }

  getTrendColor(trend: string): string {
    switch (trend) {
      case 'up':
        return 'var(--success)';
      case 'down':
        return 'var(--danger)';
      default:
        return 'var(--text-muted)';
    }
  }

  formatValue(value: number, metricLabel: string): string {
    if (metricLabel.includes('Revenue')) {
      return `$${value.toLocaleString('en-US')}`;
    }
    if (metricLabel.includes('Rate')) {
      return `${value}%`;
    }
    return value.toLocaleString('en-US');
  }
}
