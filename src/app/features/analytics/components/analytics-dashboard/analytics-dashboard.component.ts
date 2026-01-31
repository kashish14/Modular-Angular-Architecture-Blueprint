import { Component, OnInit } from '@angular/core';
import { AnalyticsService } from '../../services/analytics.service';
import { AnalyticsData, Metric, Activity } from '../../models/analytics.model';

@Component({
  selector: 'app-analytics-dashboard',
  templateUrl: './analytics-dashboard.component.html',
  styleUrls: ['./analytics-dashboard.component.scss']
})
export class AnalyticsDashboardComponent implements OnInit {
  analyticsData: AnalyticsData | null = null;
  loading = true;
  Math = Math; // Expose Math to template

  constructor(private analyticsService: AnalyticsService) {}

  ngOnInit(): void {
    this.loadAnalytics();
  }

  loadAnalytics(): void {
    this.loading = true;
    this.analyticsService.getAnalyticsData().subscribe(data => {
      this.analyticsData = data;
      this.loading = false;
    });
  }

  getTrendColor(trend: string): string {
    switch (trend) {
      case 'up':
        return '#10B981';
      case 'down':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  }

  formatValue(value: number, metricLabel: string): string {
    if (metricLabel.includes('Revenue')) {
      return `$${value.toLocaleString()}`;
    }
    if (metricLabel.includes('Rate')) {
      return `${value}%`;
    }
    return value.toLocaleString();
  }
}
